# API Integration Guide

This project integrates with the **ChatAnywhere API** to provide AI chat functionality.

## Configuration

The API configuration is handled in `src/lib/chatApi.ts`.

### Environment Variables

You must set the following environment variables in your `.env` file:

```env
VITE_API_URL=https://api.chatanywhere.tech/v1
VITE_API_KEY=your_api_key_here
```

### Key Features

1.  **Rate Limiting**:
    *   **Per Minute**: 10 requests max.
    *   **Per Day**: 200 requests max.
    *   Implemented via `localStorage` tracking in `chatApi.ts`.

2.  **Security**:
    *   **Input Validation**: Max 2000 characters.
    *   **Prompt Injection Protection**: Blocks phrases like "ignore previous instructions".

3.  **Multimodal Support**:
    *   **Images**: Converted to Base64 and sent as URLs. Handles free-tier limitations by retrying with text-only if image analysis fails.
    *   **Audio**: Transcribed via Whisper API (`v1/audio/transcriptions`) before processing.

## System Prompt

The AI is initialized with a specific persona defined in `SYSTEM_PROMPT`. It includes detailed JSON data about **Sinai University (Kantara Branch)**, covering:
*   Faculties and Degrees
*   Campus Facilities
*   Accommodation (Dorms)
*   Student Services (OSS, OSD)
*   Academic Systems (Moodle, Unicode)

## Error Handling

*   **Rate Limits**: Returns specific error messages to the UI.
*   **API Errors**: Catches failures (e.g., 401 Unauthorized, 500 Server Error) and throws user-friendly messages.
*   **Free Tier Fallbacks**: Automatically downgrades requests if advanced features (like image vision) are not supported by the key.
