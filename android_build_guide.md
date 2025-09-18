# StellarIQ Android App Build Guide

## 🤖 **Complete Android Build Instructions**

### **🚀 Quick Build Commands:**

#### **For Testing (APK):**
```bash
# Build APK for direct installation
eas build --platform android --profile preview
```

#### **For Google Play Store (AAB):**
```bash
# Build AAB for Play Store submission
eas build --platform android --profile production
```

### **📋 Prerequisites:**

#### **1. Install EAS CLI:**
```bash
yarn add -g @expo/eas-cli
```

#### **2. Login to Expo Account:**
```bash
eas login
```

#### **3. Verify Project Setup:**
```bash
# Check if everything is configured correctly
eas build:configure
```

### **🔧 Build Profiles Explained:**

#### **Development Profile:**
- **Purpose**: For development and debugging
- **Output**: APK with development client
- **Installation**: Can be installed on any Android device
- **Use Case**: Testing during development

#### **Preview Profile:**
- **Purpose**: For testing and sharing
- **Output**: Standalone APK
- **Installation**: Can be installed on any Android device
- **Use Case**: Beta testing, client demos

#### **Production Profile:**
- **Purpose**: For Google Play Store
- **Output**: AAB (Android App Bundle)
- **Installation**: Only through Google Play Store
- **Use Case**: Final app store submission

### **📱 Build Process Steps:**

#### **Step 1: Choose Build Type**
```bash
# For testing/sharing (APK)
eas build --platform android --profile preview

# For Play Store (AAB)
eas build --platform android --profile production
```

#### **Step 2: Monitor Build Progress**
- Build runs on Expo's cloud servers
- You'll get a URL to monitor progress
- Typical build time: 10-20 minutes
- You'll receive email notification when complete

#### **Step 3: Download Your App**
- APK: Download and install directly on Android devices
- AAB: Upload to Google Play Console

### **🎯 Android Configuration Details:**

#### **App Identity:**
- **Package Name**: `com.stellariq.app`
- **App Name**: StellarIQ
- **Version Code**: 1 (auto-increments in production)

#### **Permissions:**
- **INTERNET**: For API calls to your backend
- **ACCESS_NETWORK_STATE**: To check network connectivity
- **RECEIVE_BOOT_COMPLETED**: For background notifications
- **VIBRATE**: For notification vibrations
- **WAKE_LOCK**: For keeping app responsive

#### **Visual Assets:**
- **App Icon**: `./assets/icon.png`
- **Splash Screen**: `./assets/splash.svg`
- **Adaptive Icon**: Configured for modern Android

### **🔐 Code Signing:**

#### **Automatic Signing (Recommended):**
EAS handles code signing automatically:
- Creates keystore for you
- Manages certificates
- Handles signing process
- Stores credentials securely

#### **Manual Signing (Advanced):**
If you need custom keystore:
```bash
# Generate keystore
keytool -genkey -v -keystore stellariq-release-key.keystore -alias stellariq -keyalg RSA -keysize 2048 -validity 10000

# Configure in eas.json
"android": {
  "credentialsSource": "local"
}
```

### **📊 Build Monitoring:**

#### **Check Build Status:**
```bash
# List all builds
eas build:list

# Check specific build
eas build:view [BUILD_ID]
```

#### **Build Logs:**
- Real-time logs available during build
- Full logs downloadable after completion
- Error details for troubleshooting

### **🚀 Distribution Options:**

#### **1. Direct Installation (APK):**
- Download APK from build page
- Enable "Install from Unknown Sources" on Android
- Install directly on device

#### **2. Internal Testing:**
- Upload to Google Play Console
- Create internal testing track
- Share with team members

#### **3. Google Play Store:**
- Upload AAB to Play Console
- Complete store listing
- Submit for review

### **🛠️ Troubleshooting:**

#### **Common Issues:**

**Build Fails:**
```bash
# Clear cache and retry
eas build --platform android --profile preview --clear-cache
```

**Metro Config Issues:**
- Your metro.config.js is already optimized
- No changes needed for Android builds

**Asset Issues:**
- Ensure all assets exist in ./assets/
- Check file paths in app.json

**Network Issues:**
- Verify API URL in app.json extra.apiUrl
- Test backend connectivity

### **📱 Testing Your Android App:**

#### **Before Building:**
1. Test thoroughly in Expo Go
2. Verify all features work
3. Test on different Android devices
4. Check network connectivity

#### **After Building:**
1. Install APK on test devices
2. Test all app functionality
3. Verify push notifications
4. Test offline behavior
5. Check performance

### **🎯 Next Steps After Build:**

#### **For APK (Testing):**
1. Download APK from build page
2. Share with testers
3. Collect feedback
4. Iterate and rebuild

#### **For AAB (Production):**
1. Download AAB from build page
2. Create Google Play Console account
3. Upload to Play Console
4. Complete app store listing
5. Submit for review

### **📋 Google Play Store Submission:**

#### **Required Assets:**
- **App Icon**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: Various sizes for phones/tablets
- **App Description**: Store listing text
- **Privacy Policy**: Required for apps with user data

#### **Store Listing Requirements:**
- App title and description
- Category selection
- Content rating
- Privacy policy URL
- Contact information

### **🔄 Updating Your App:**

#### **Version Management:**
```bash
# Update version in app.json
"version": "1.0.1"

# Android version code auto-increments in production builds
```

#### **Release Updates:**
```bash
# Build new version
eas build --platform android --profile production

# Upload to Play Console
# Users get automatic updates
```

### **💡 Pro Tips:**

#### **Development Workflow:**
1. Use `preview` profile for testing
2. Test on multiple Android devices
3. Use `production` profile only for store submission
4. Keep build logs for debugging

#### **Performance Optimization:**
- Your app is already optimized with Expo SDK 54
- Metro config is properly configured
- Assets are optimized for mobile

#### **Security Best Practices:**
- API keys stored in environment variables
- HTTPS for all API calls
- Proper authentication handling

Your StellarIQ Android app is ready to build! 🚀
