# ARIA App v2 Development Plan — COMPLETED

## 1. Fix Chat Screen Clutter (Resize Buttons) ✅
- [x] `css/styles.css` — Reduced `.chat-buttons .chat-btn` padding to `0.35rem 0.7rem`, font-size to `0.75rem`, margins tightened
- [x] `css/chat.css` — Shrank `.new-chat-btn` padding to `0.35rem 0.7rem`, font-size to `12px`
- [x] `src/screens/ChatScreen.tsx` — Compact mode buttons: `paddingVertical: 4`, `borderRadius: 14`, `fontSize: 11`

## 2. Hardcode Groq & OpenRouter API Keys ✅
- [x] `src/services/AIEngineService.ts` — Added `BUILTIN_OPENROUTER_KEY` constant; fallback to built-in key if AsyncStorage returns null
- [x] `src/screens/SettingsScreen.tsx` — Pre-filled OpenRouter input; added info note about pre-configuration
- [x] `js/app.js` — Fixed variable names (moved key to `OPEN_ROUTER_KEY`)
- [x] `js/chat.js` — Replaced `process.env.*` with `BUILTIN_OPENROUTER_KEY` fallback

## 3. College Past Papers + 2nd Level Knowledge ✅
- [x] `models/PastPaper.js` — Added `'College'` to level enum
- [x] `public/pastpapers.html` — Added College option to level filter
- [x] `js/pastpapers.js` — Updated filter logic with `?level=` query; added demo college papers (Calculus, Chemistry, Psychology, etc.)
- [x] `controllers/PastPaperController.js` — Supports `?level=` query filtering
- [x] `js/knowledge.js` — Builds true 2-level tree: level-1 roots + level-2 subnodes nested under prerequisites
- [x] `routes/knowledge.js` — Added `GET /api/knowledge/level/:level`

## 4. Admin Dashboard — Signups & Logged-In Users ✅
- [x] `models/User.js` — Added `isLoggedIn`, `lastActive`, timestamps
- [x] `routes/admin.js` — Expanded stats: totalUsers, activeNow (15min), activeToday, signupsToday, plusSubscribers, proSubscribers, revenue
- [x] `public/admin.html` — Added cards for Active Now, Signups Today, Plus Subscribers, Pro Subscribers
- [x] `js/admin.js` — Maps all new fields to DOM
- [x] `css/admin.css` — Adjusted grid to `minmax(200px, 1fr)` with highlight borders

## 5. Updated Subscription Model (Free / Plus / Pro) ✅
- [x] `frontend/src/components/SubscriptionPlans.jsx` — Replaced old plans with Free ($0), Plus ($4.99), Pro ($9.99) with full feature lists
- [x] `backend/models/Subscription.js` — Updated schema with `planId` enum, 14 feature flags, `price`
- [x] `controllers/SubscriptionController.js` — Handles free/plus/pro tiers, correct end dates, and per-plan feature initialization
- [x] `models/Subscription.js` — Added FREE, PLUS, PRO constants

## Android Build Status ✅
- APK successfully generated: `android/app/build/outputs/apk/release/app-release.apk` (~90MB)
- Patched `expo-camera` to remove legacy `cameraview` dependency
