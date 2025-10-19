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
  extra: {
    supabaseUrl: 'https://zbpowpvpzsugrdqwurub.supabase.co',
    supabaseAnonKey: 'sb_publishable_3n1MmTMPEGsOFET0S5tbsQ_x4ZIqwPz'
  }
});
