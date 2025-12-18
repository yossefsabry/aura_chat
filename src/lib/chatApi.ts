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

const MAX_MESSAGE_LENGTH = 2000;

const SECURITY_PATTERNS = [
    /ignore (all )?previous instructions/i,
    /forget (all )?instructions/i,
    /system prompt/i,
    /you are now/i,
    /override system/i,
    /jailbreak/i,
    /developer mode/i
];

const validateContent = (content: string) => {
    if (content.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`Message too long. Please limit your message to ${MAX_MESSAGE_LENGTH} characters.`);
    }

    const hasInjection = SECURITY_PATTERNS.some(pattern => pattern.test(content));
    if (hasInjection) {
        throw new Error("Security Alert: Your message contains content that attempts to bypass safety protocols. Request blocked.");
    }
};

export const sendMessageToApi = async (messages: Message[]) => {
    if (!API_KEY) {
        throw new Error("API Key is missing. Please set VITE_API_KEY in your .env file.");
    }

    const { allowed, error } = checkRateLimit();
    if (!allowed) {
        throw new Error(error);
    }

    // Validate the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
        validateContent(lastMessage.content);
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

    const SINAI_UNIVERSITY_DATA = {
        "university": "Sinai University",
        "branch": "Kantara",
        "location": "Kantara East, New City (Eastern side of Ismailia)",
        "description": "An integrated technology city utilizing the latest technology. It was the first in Egypt to implement a cashless system.",
        "academic_systems": {
            "lms": {
                "name": "Moodle LMS",
                "url": "https://kmoodle.su.edu.eg/",
                "description": "The official Learning Management System for accessing course materials, assignments, and quizzes.",
                "access": "Accessible via the 'Sinai University Kantara LMS' platform.",
                "support": "support.moodle@su.edu.eg"
            },
            "student_portal": {
                "name": "UniCode Portal",
                "url": "https://unicodeasis.su.edu.eg/",
                "description": "Central student portal for administrative and academic management.",
                "features": [
                    "Registration and enrollment",
                    "Exam follow-up",
                    "Electronic wallet management",
                    "Student ID and password login"
                ],
                "mobile_app": "Sinai University Portal app available on App Store"
            }
        },
        "campus": {
            "facilities": [
                "89 lecture halls and 51 fully equipped labs (across campuses)",
                "Newly designed lecture halls for better efficiency",
                "Classrooms for smaller sections",
                "Library with 10,000 books",
                "Food court",
                "Cinema",
                "Football yards, basketball yards, tennis yard",
                "PlayStation and Xbox rooms",
                "Gym (with student discounts)"
            ],
            "labs": [
                "IT Labs (latest programs for IT & CS)",
                "Pharmacy Labs (student experiments)",
                "Dental Clinics (dummy heads for training)",
                "Central Laboratory for scientific research",
                "Up-to-date medical, engineering, and photography labs"
            ]
        },
        "accommodation": {
            "types": [
                "Single Premium Plus", "Single Premium", "Single Deluxe", "Single Superior", "Single Classic",
                "Double Deluxe",
                "Triple Deluxe", "Triple Superior"
            ],
            "features": [
                "Over 250 fully serviced hotel rooms",
                "Fully finished and furnished with air conditioning",
                "Dedicated study corners",
                "24/7 supervision and security",
                "Resident doctor 24/7",
                "Daily housekeeping",
                "Wi-Fi coverage",
                "Laundry room (washing machines, dryers, irons)",
                "Utilities included (electricity, water, internet)"
            ]
        },
        "student_services": {
            "oss": {
                "name": "Office of Student Services (OSS)",
                "description": "Central hub for student needs",
                "services": [
                    "Administration and enrollment inquiries",
                    "Registration",
                    "Academic inquiries",
                    "Orientation for new students",
                    "Scholarship information",
                    "Petitions processing",
                    "Student records updates",
                    "Tuition and certificate payments",
                    "Housing and transportation assistance"
                ]
            },
            "osd": {
                "name": "Office of Student Development (OSD)",
                "description": "Focuses on academic, practical, and recreational student life"
            }
        },
        "faculties": [
            {
                "name": "Faculty of Information Technology & Computer Science",
                "departments": ["Information Technology (IT)", "Computer Science and Software Engineering (CSSE)", "Information and Decision Support Systems (IDSS)"],
                "degrees": ["Bachelor of Science in Information Technology"],
                "curriculum_highlights": [
                    "Computer Programming (1 & 2)", "Data Structures", "Software Engineering", "Operating Systems",
                    "Database Systems", "Computer Networks", "Web Technology", "Artificial Intelligence",
                    "Computer Graphics", "Multimedia", "Digital Signal Processing"
                ]
            },
            {
                "name": "Faculty of Pharmacy",
                "degrees": ["Doctor of Pharmacy (PharmD)"],
                "departments": [
                    "Pharmaceutical Chemistry", "Pharmaceutics", "Pharmacology and Toxicology",
                    "Pharmacognosy", "Microbiology and Immunology", "Pharmacy Practice", "Biochemistry"
                ],
                "curriculum_highlights": [
                    "General and Physical Chemistry", "Biopharmaceutics & Pharmacokinetics",
                    "Pharmaceutical Technology", "Clinical Pharmacy and Pharmacotherapeutics",
                    "Community Pharmacy Practice", "Cosmetic Preparations"
                ]
            },
            {
                "name": "Faculty of Dentistry",
                "degrees": ["Bachelor's Degree in Dental Medicine and Surgery (BDS)"],
                "curriculum_highlights": [
                    "Human Anatomy & Physiology", "Dental Anatomy & Oral Biology", "Restorative Dentistry",
                    "Endodontics", "Prosthetic Dentistry", "Oral & Maxillofacial Surgery",
                    "Orthodontics", "Pediatric Dentistry", "Periodontics", "Oral Radiology"
                ]
            },
            {
                "name": "Faculty of Engineering Sciences & Arts",
                "departments": [
                    "Civil Engineering", "Architectural Engineering", "Electrical and Computer Engineering",
                    "Mechanical Engineering", "Bio Medical Engineering"
                ],
                "curriculum_highlights": [
                    "Architectural Design", "Urban and City Planning", "Electronics & Communication",
                    "Mechatronics Engineering", "Renewable Energy Systems", "Construction Projects Management"
                ]
            },
            {
                "name": "Faculty of Mass Communication",
                "degrees": ["Bachelor's", "Postgraduate programs"]
            },
            {
                "name": "Faculty of Business Administration",
                "specializations": ["Business Administration", "International Marketing"],
                "degrees": ["Bachelor's", "Postgraduate programs"]
            },
            {
                "name": "Faculty of Physical Therapy",
                "specializations": ["Geriatric Physical Therapy"],
                "degrees": ["Bachelor's", "Postgraduate programs"]
            },
            {
                "name": "Faculty of Biotechnology",
                "degrees": ["Bachelor's", "Postgraduate programs"]
            }
        ],
        "transportation": "Daily and weekly bus facilities for students"
    };

    const SYSTEM_PROMPT = `You are the Sinai University Assistant AI, a dedicated intelligent assistant for Sinai University (Kantara Branch). Your primary role is to assist students, doctors, and staff with academic and administrative tasks.

Use the following University Data to answer questions:
${JSON.stringify(SINAI_UNIVERSITY_DATA, null, 2)}

For Students:
- Help with subject registration and course planning.
- Provide study assistance, explain complex concepts, and summarize materials.
- Answer questions about university schedules, exams, and regulations using the provided data.

For Doctors:
- Assist with research and lecture preparation.
- Provide administrative support where applicable.

Tone: Professional, helpful, encouraging, and knowledgeable about Sinai University context.
Always identify yourself as the Sinai University Assistant AI when asked.`;



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

    // Prepend system prompt
    const finalMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...apiMessages
    ];

    try {
        const response = await fetch(`${API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: finalMessages,
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
