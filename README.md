# Aura Chat - Sinai University Assistant

Aura Chat is an intelligent AI assistant designed specifically for **Sinai University (Kantara Branch)**. It helps students and staff with academic inquiries, campus information, and administrative services.

![Aura Chat Preview](./public/og-image.png)

## Features

*   **University Expert**: Deep knowledge of Sinai University's faculties, dorms, OSS, and systems (Moodle, Unicode).
*   **Multimodal**: Supports **Text**, **Image**, and **Audio** inputs.
*   **Smart Actions**: **Copy** and **Reply** to messages easily.
*   **Security**: Built-in protection against prompt injection and abuse.
*   **Rate Limiting**: Client-side limits to prevent API overuse.
*   **Responsive**: Beautiful, mobile-friendly UI built with Tailwind CSS.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd aura_chat
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root directory (copy from `.env.example`):
    ```bash
    cp .env.example .env
    ```
    
    Edit `.env` and add your API key:
    ```env
    VITE_API_URL=https://api.chatanywhere.tech/v1
    VITE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```
    > **Note**: You can get a free API key from [ChatAnywhere](https://chatanywhere.tech).

### Running the App

Start the development server:
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Running Tests

To run the unit tests for the API logic:
```bash
npm test
```

## Documentation

Detailed documentation is available in the `docs/` folder:
*   [API Integration Guide](docs/API_INTEGRATION.md)
*   [Project Structure](docs/PROJECT_STRUCTURE.md)

## Tech Stack

*   **Framework**: React + Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Components**: Shadcn UI + Lucide Icons
*   **Testing**: Vitest

## License

This project is private and proprietary.
