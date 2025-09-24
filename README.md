# GLaDOS Mobile App

This is the official mobile client for the GLaDOS Streaming System. The app provides a seamless voice interface to interact with the GLaDOS assistant running on your private network, accessible via Tailscale.

## 🚀 Features

*   **Real-time Interaction**: Push-to-talk functionality for streaming voice directly to the STT (Speech-to-Text) service.
*   **Streaming Responses**: Receives and plays TTS (Text-to-Speech) audio from GLaDOS in real-time.
*   **Secure Connectivity**: Designed to connect to the GLaDOS backend exclusively through a secure Tailscale network.
*   **Cross-Platform**: Built with React Native for a consistent experience on both Android and iOS.

## 🛠️ Tech Stack

*   **Framework**: [React Native](https://reactnative.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **State Management**: (To be determined - likely React Context or Zustand)
*   **Networking**: WebSockets for STT, HTTP Streaming for TTS.

## 🏁 Getting Started

> **Note:** The full setup instructions will be added as we build the application.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kyujaq/glados-mobile-app.git
    cd glados-mobile-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the application:**
    ```bash
    # For Android
    npm run android

    # For iOS
    npm run ios
    ```