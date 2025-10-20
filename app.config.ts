import { ConfigContext } from 'expo/config';
import { CustomExpoConfig } from './src/types/config';

export default ({ config }: ConfigContext): CustomExpoConfig => ({
  ...config,
  name: 'Spot the Bot',
  slug: 'spot-the-bot',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.playspotbot.spotthebot",
    usesAppleSignIn: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.playspotbot.spotthebot"
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: "com.googleusercontent.apps.914625079481-6ob2sntm4nmicph82v8ul9mkqc6cup11"
      }
    ],
  ],
  extra: {
    eas: {
      projectId: 'dc73814d-67a9-4f6b-8a2e-713eaf9a230c'
    },
    supabaseUrl: 'https://zbpowpvpzsugrdqwurub.supabase.co',
    supabaseAnonKey: 'sb_publishable_3n1MmTMPEGsOFET0S5tbsQ_x4ZIqwPz',
    googleWebClientId: '914625079481-pdashsqk84b0jsmslq3gbc5gna8g34jj.apps.googleusercontent.com',
    googleIOSClientId: '914625079481-6ob2sntm4nmicph82v8ul9mkqc6cup11.apps.googleusercontent.com'
  }
});
