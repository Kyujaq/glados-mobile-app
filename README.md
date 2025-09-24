# GLaDOS Mobile App

This is the official mobile client for the GLaDOS Streaming System. The app provides a seamless voice interface to interact with the GLaDOS assistant running on your private network, accessible via Tailscale.

## ðŸš€ Features

- **Real-time Interaction**: Push-to-talk functionality for streaming voice directly to the STT (Speech-to-Text) service.
- **Streaming Responses**: Receives and plays TTS (Text-to-Speech) audio from GLaDOS in real-time.
- **Secure Connectivity**: Designed to connect to the GLaDOS backend exclusively through a secure Tailscale network.
- **Cross-Platform**: Built with React Native for a consistent experience on both Android and iOS.

## ðŸ› ï¸ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: (To be determined - likely React Context or Zustand)
- **Networking**: WebSockets for STT, HTTP Streaming for TTS.

## ðŸ Getting Started

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

## Development Environment

- Use Node 18.18.0 (`nvm use`) and install dependencies with `npm install`.
- Configure the React Native toolchain: Watchman (macOS), Xcode 15 for iOS, and Android Studio with SDK 34; accept all licenses.
- Sign in to the same Tailscale tailnet on your development device to reach the home server.
- Install the React Native CLI globally (`npx react-native --version`) if it is not already on the PATH.

## Configuration

1. Copy `.env.example` to `.env.local` and set `API_BASE_URL` to the Tailscale address of your Linux host.
2. Adjust `STT_PATH`, `TTS_PATH`, and `TEXT_CHAT_PATH` to match the webhook routes exposed by the server.
3. Run `npm run start` to launch Metro, then `npm run android` or `npm run ios` in another shell.
4. Commit secrets only to your secret manager—never to git; share required values via PR descriptions or deployment docs.

## Project Layout

```
src/
  App.tsx                # App provider stack and navigation host
  navigation/            # Temporary tab switcher for voice vs text
  features/
    interaction/         # Voice push-to-talk workflow stubs
    chat/                # Text session components
  services/              # Transport client and future integrations
  config/                # Environment bindings and shared constants
  theme/                 # Colors, spacing, typography, and theme provider
  test-utils/            # Helpers for Jest tests
```

## Next Steps

- Wire the transport layer to real webhook calls with authentication through Tailscale.
- Integrate microphone capture and audio playback once native modules are configured.
- Replace the temporary navigator with React Navigation for richer flows.
