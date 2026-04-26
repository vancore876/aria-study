# ARIA Android build notes

## What this branch is for
This branch is prepared for a **development build / APK** workflow instead of Expo Go.

## Included
- `expo-dev-client`
- `expo-build-properties`
- `newArchEnabled: true`
- local LLM runtime guards for Expo Go
- a starter WhatsApp Cloud API bridge backend in `backend/whatsapp-bridge`

## Build steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate native projects when needed:
   ```bash
   npm run prebuild:clean
   ```
3. Start a dev client locally:
   ```bash
   npm run dev:client
   ```
4. Build a dev APK:
   ```bash
   eas build --platform android --profile development
   ```
5. Build a preview APK:
   ```bash
   eas build --platform android --profile preview
   ```
6. Build a production AAB:
   ```bash
   eas build --platform android --profile production
   ```

## Local LLM note
`llama.rn` will not run inside Expo Go. Test local models only in a dev build or APK.
Use the smaller models first if your device has limited RAM.

## Voice / wake phrase note
Tap-to-talk works in a dev build if the speech-recognition native module is present and the device supports it.
A true always-listening wake phrase needs a native foreground/background service and extra battery-policy handling.

## WhatsApp note
This mobile app cannot directly receive WhatsApp webhooks. Use the backend starter under `backend/whatsapp-bridge` and point it at your own ARIA reply endpoint.
