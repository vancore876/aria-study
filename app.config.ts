import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'ARIA Study',
  slug: 'aria-study-assistant',
  version: '1.2.0',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './src/assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#07111f'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.aria.aiassistant',
    infoPlist: {
      NSMicrophoneUsageDescription: 'ARIA needs microphone access for voice commands.',
      NSSpeechRecognitionUsageDescription: 'ARIA uses speech recognition for voice commands.',
      NSCameraUsageDescription: 'ARIA uses camera to scan homework, notes, and study material.',
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/adaptive-icon.png',
      backgroundColor: '#07111f'
    },
    package: 'com.aria.aiassistant',
    versionCode: 3,
    permissions: [
      'RECORD_AUDIO',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
      'USE_FULL_SCREEN_INTENT',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_MICROPHONE',
      'INTERNET',
      'ACCESS_NETWORK_STATE'
    ]
  },
  plugins: [
    'expo-notifications'
  ],
});
