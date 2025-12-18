import { Message } from "@/types/chat";

const API_URL = import.meta.env.VITE_API_URL || "https://api.chatanywhere.tech/v1";
const API_KEY = import.meta.env.VITE_API_KEY;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute
const DAILY_LIMIT = 200;

interface UsageData {
    requestsInWindow: number;
    windowStartTime: number;
    dailyRequests: number;
    lastRequestDate: string;
}

const getUsageData = (): UsageData => {
    const stored = localStorage.getItem("chat_usage");
    if (!stored) {
        return {
            requestsInWindow: 0,
            windowStartTime: Date.now(),
            dailyRequests: 0,
            lastRequestDate: new Date().toDateString(),
        };
    }
    return JSON.parse(stored);
};

const updateUsageData = (data: UsageData) => {
    localStorage.setItem("chat_usage", JSON.stringify(data));
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const checkRateLimit = (): { allowed: boolean; error?: string } => {
    const usage = getUsageData();
    const now = Date.now();
    const today = new Date().toDateString();

    // Reset daily limit if it's a new day
    if (usage.lastRequestDate !== today) {
        usage.dailyRequests = 0;
        usage.lastRequestDate = today;
    }

    // Check daily limit
    if (usage.dailyRequests >= DAILY_LIMIT) {
        updateUsageData(usage);
        return { allowed: false, error: "Daily limit of 200 requests reached." };
    }

    // Reset window if expired
    if (now - usage.windowStartTime > RATE_LIMIT_WINDOW) {
        usage.requestsInWindow = 0;
        usage.windowStartTime = now;
    }

    // Check window limit
    if (usage.requestsInWindow >= MAX_REQUESTS_PER_WINDOW) {
        updateUsageData(usage);
        return { allowed: false, error: "Rate limit exceeded. Please wait a moment." };
    }

    return { allowed: true };
};

export const incrementUsage = () => {
    const usage = getUsageData();
    usage.requestsInWindow++;
    usage.dailyRequests++;
    updateUsageData(usage);
};

export const getDailyUsage = (): number => {
    const usage = getUsageData();
    const today = new Date().toDateString();
    if (usage.lastRequestDate !== today) return 0;
    return usage.dailyRequests;
};

export const sendMessageToApi = async (messages: Message[]) => {
    if (!API_KEY) {
        throw new Error("API Key is missing. Please set VITE_API_KEY in your .env file.");
    }

    const { allowed, error } = checkRateLimit();
    if (!allowed) {
        throw new Error(error);
    }

    // Check for audio attachments
    const audioAttachment = messages[messages.length - 1].attachments?.find(att => att.type === 'audio');
    let transcribedText = "";

    if (audioAttachment) {
        try {
            const formData = new FormData();
            formData.append("file", audioAttachment.file);
            formData.append("model", "whisper-1");

            const transcriptionResponse = await fetch(`${API_URL}/audio/transcriptions`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                },
                body: formData,
            });

            if (transcriptionResponse.ok) {
                const data = await transcriptionResponse.json();
                transcribedText = data.text;
                // Update the last message content with the transcription
                messages[messages.length - 1].content += `\n[Audio Transcription: ${transcribedText}]`;
            } else {
                console.warn("Audio transcription failed, proceeding with text only.");
                // Notify AI about the failed audio upload
                messages[messages.length - 1].content += `\n\n[System Note: The user uploaded an audio file, but it could not be transcribed/processed because the current API plan does not support audio. Please acknowledge the audio upload politely and explain this limitation.]`;
            }
        } catch (error) {
            console.error("Audio transcription error:", error);
            messages[messages.length - 1].content += `\n\n[System Note: The user uploaded an audio file, but processing failed. Please acknowledge the audio upload.]`;
        }
    }

    // Format messages for OpenAI API
    const apiMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.attachments && msg.attachments.length > 0) {
            const content: any[] = [{ type: "text", text: msg.content }];

            for (const att of msg.attachments) {
                if (att.type === 'image') {
                    const base64 = await fileToBase64(att.file);
                    content.push({
                        type: "image_url",
                        image_url: {
                            url: base64
                        }
                    });
                }
            }
            return { role: msg.role, content };
        }
        return { role: msg.role, content: msg.content };
    }));

    try {
        const response = await fetch(`${API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: apiMessages,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `API Error: ${response.statusText}`;

            // Handle free tier image restriction
            if (errorMessage.includes("Free accounts do not support multimodal functionality")) {
                console.warn("Free tier detected, retrying without images...");

                // Retry with text only
                const textOnlyMessages = messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

                // Add a temporary system message to inform the AI about the missing image
                const systemMessage = {
                    role: "system",
                    content: "The user attempted to upload an image, but it was removed due to API tier limitations. Please acknowledge the user's image upload attempt politely, explain that you cannot see images on the current plan, and try to answer their text query as best as possible without the visual context."
                };

                const retryResponse = await fetch(`${API_URL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [systemMessage, ...textOnlyMessages],
                        stream: false,
                    }),
                });

                if (!retryResponse.ok) {
                    const retryErrorData = await retryResponse.json().catch(() => ({}));
                    throw new Error(retryErrorData.error?.message || `API Error: ${retryResponse.statusText}`);
                }

                incrementUsage();
                const data = await retryResponse.json();
                return data.choices[0].message.content;
            }

            throw new Error(errorMessage);
        }

        incrementUsage();
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("API Call failed:", error);
        throw error;
    }
};
