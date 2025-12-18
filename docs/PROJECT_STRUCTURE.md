# Project Structure

This project is built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Directory Layout

```
src/
├── components/         # React components
│   ├── chat/          # Chat-specific components (Bubble, Input, Header)
│   └── ui/            # Reusable UI components (Button, Input, Tooltip)
├── hooks/             # Custom React hooks
│   ├── useChat.ts     # Main chat logic (state, sending messages)
│   └── use-mobile.tsx # Responsive detection
├── lib/               # Utilities and Services
│   ├── chatApi.ts     # API integration, rate limiting, validation
│   └── utils.ts       # Helper functions (class merging, etc.)
├── pages/             # Route pages
│   ├── Index.tsx      # Main chat page
│   └── NotFound.tsx   # 404 page
├── types/             # TypeScript definitions
│   └── chat.ts        # Message and Attachment interfaces
└── App.tsx            # Main application entry
```

## Key Components

*   **`ChatContainer`**: The main layout wrapper. Handles scrolling and orchestrates sub-components.
*   **`ChatInput`**: Handles user text input, file attachments (image/audio), and reply logic.
*   **`MessageBubble`**: Renders individual messages, supports markdown, attachments, and actions (copy/reply).
*   **`useChat`**: A hook that manages the message list, loading states, and communicates with `chatApi.ts`.

## Styling

*   **Tailwind CSS**: Used for all styling.
*   **Shadcn UI**: Provides the base for accessible UI components (`components/ui`).
*   **Animations**: Custom animations defined in `tailwind.config.ts`.
