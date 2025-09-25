# GLaDOS Mobile App

This is the official mobile client for the GLaDOS Streaming System. The app provides a secure voice and text front-end that tunnels through Tailscale to your self-hosted assistant.

## Features

- Push-to-talk streaming to the speech-to-text webhook running on your home server
- Real-time playback of text-to-speech responses
- Optional text chat mode that reuses the same secure transport
- Cross-platform React Native codebase for Android and iOS

## Tech Stack

- React Native 0.74 with the React 18 runtime
- TypeScript with ESLint and Prettier enforcement
- Jest for unit tests and Metro for local development

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kyujaq/glados-mobile-app.git
   cd glados-mobile-app
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the app**
   ```bash
   npm run start      # Metro bundler
   npm run android    # or npm run ios
   ```

## Development Environment

- Use Node 18.18.0 (`nvm use`) and install Watchman, Xcode 15, and Android Studio SDK 34
- Make sure your dev device is signed into the same Tailscale tailnet as the home server
- React Native CLI (`npx react-native --version`) should be resolvable on your PATH

## Configuration

Copy `.env.example` to `.env.local` and update the keys below. Check in environment files **only** when they contain non-secret defaults. You can also adjust these values inside the in-app **Settings** tab (they persist via AsyncStorage).

| Key                  | Description                                                          | Example                        |
| -------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `API_BASE_URL`       | Base URL for webhook traffic; leave blank to derive from Tailnet IP  | `https://tailscale-node.local` |
| `STT_PATH`           | Speech-to-text streaming endpoint                                    | `/api/stt/stream`              |
| `TTS_PATH`           | Text-to-speech streaming endpoint                                    | `/api/tts/stream`              |
| `TEXT_CHAT_PATH`     | Text chat webhook endpoint                                           | `/api/chat/text`               |
| `HEALTH_PATH`        | Health probe path used by the transport client                       | `/healthz`                     |
| `TAILSCALE_HOSTNAME` | Human-readable Tailscale hostname                                    | `tailscale-node.local`         |
| `TAILSCALE_IP`       | Optional MagicDNS / 100.x IP override                                | `100.64.0.12`                  |
| `TAILSCALE_PORT`     | Optional non-standard port override                                  | `4430`                         |
| `USE_TLS`            | Toggle HTTPS vs HTTP when building derived URLs                      | `true`                         |
| `API_AUTH_TOKEN`     | Bearer token forwarded on each request (leave blank for development) | `changeme`                     |

## Testing

- `npm run lint` ensures ESLint and Prettier compliance
- `npm test` runs the Jest suites, including transport unit tests

## Project Layout

```
src/
  App.tsx                # App provider stack and navigation host
  navigation/            # Temporary tab switcher for voice vs text
  features/
    interaction/         # Voice push-to-talk workflow
    chat/                # Text session components
  services/              # Transport client and future integrations
  config/                # Environment bindings and shared constants
  theme/                 # Colors, spacing, typography, and theme provider
  test-utils/            # Helpers for Jest tests
```

## Next Steps

- Wire the transport client to the production webhooks with authentication and streaming codecs
- Integrate microphone capture and audio playback once native modules are configured
- Replace the temporary navigator with React Navigation for richer flows and settings
