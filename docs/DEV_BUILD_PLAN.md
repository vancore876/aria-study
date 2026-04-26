# ARIA dev-build / APK plan

## Current status
This branch is prepared for a **development build** path instead of Expo Go.

## Included in this branch
- `expo-dev-client` enabled
- `expo-build-properties` configured
- `newArchEnabled` turned on for native module compatibility
- local LLM runtime guarded so Expo Go falls back gracefully
- WhatsApp bridge backend starter under `backend/whatsapp-bridge`

## Recommended order
1. Install dependencies in the mobile app.
2. Run `npx expo prebuild --clean`.
3. Build a dev client APK with EAS.
4. Test voice input and local LLM on the dev client.
5. Stand up the WhatsApp bridge server if you want cloud messaging.

## Local models to try first
- TinyLlama 1.1B Q4
- Gemma 2B Q4
- Phi-3 Mini Q4 (only on stronger devices)

## Reality check
Always-on wake phrase and WhatsApp auto-reply are **native/backend features**, not Expo Go features.
