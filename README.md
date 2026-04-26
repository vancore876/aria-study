# ARIA Study Assistant (Expo SDK 51)

ARIA Study is a mobile learning assistant for college students and CXC students, built with **Expo**.

It utilizes the **Development Client** workflow to support native features like:
- **Local AI**: On-device LLM inference using `llama.rn`.
- **Voice Services**: Custom wake-phrase and text-to-speech.
- **Advanced Scanning**: Camera-based homework and document analysis.

## Development Workflow
This project uses **Continuous Native Generation (CNG)**. The `android/` and `ios/` folders are generated from the configuration in `app.config.ts`.

### Quick Start
```bash
# Install dependencies
npm install

# Start the Metro bundler
npx expo start --dev-client

# Run on Android (Compiles native code)
npm run android
```

## Features
- **Student-focused Chat Modes**: Ask, Homework, Papers, and College.
- **Study Hub**: Setup for CXC/CAPE and college practice.
- **Homework Scan**: Capture questions and notes via camera.
- **Study Planner**: Coursework reminder templates and task scheduling.
- **Multi-Modal AI**: Switches between Groq (Cloud) and Local Phi-3 models.

## Build docs
- `BUILD_ANDROID.md`
- `docs/DEV_BUILD_PLAN.md`

## Content note
ARIA can organize past-paper practice, explain question types, and coach answers. Do not bundle copyrighted past-paper text directly into the app unless you have permission; use official links, user-provided questions, or permitted datasets.

## Notes
- Expo Go is for quick testing only.
- Local LLM, native voice, and background wake-phrase work belong in a dev build / APK path.
