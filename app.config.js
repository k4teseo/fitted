import 'dotenv/config';

export default {
  expo: {
    name: 'fitted',
    slug: 'fitted',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.katecs172.fitted',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      enableHermes: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ],
      "expo-font",
      [
        "expo-secure-store"
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      databaseUrl: process.env.SUPABASE_URL, 
      databaseKey: process.env.SUPABASE_KEY, 
      eas: {
        projectId: "ffb68227-02da-4487-8af0-f37ee177d543"
      }
    },
  },
};
