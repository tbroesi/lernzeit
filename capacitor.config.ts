import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4386b5039ba843128a0f77100fb5c6d8',
  appName: 'mathe-zeit-helden-app',
  webDir: 'dist',
  server: {
    url: 'https://4386b503-9ba8-4312-8a0f-77100fb5c6d8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  }
};

export default config;