# 🚀 Phở Video Mobile - Deployment Guide

This guide details how to build, sign, and deploy the Phở Video mobile app to the App Store and Google Play using Expo EAS.

## 1. Prerequisites
Ensure you have the EAS CLI installed and logged in:
```bash
npm install -g eas-cli
eas login
```

## 2. Configuration (`eas.json`)
We have configured `eas.json` with three profiles:
- **development**: For local testing with `expo-dev-client`.
- **preview**: For internal testing (TestFlight / Internal Testing).
- **production**: For App Store submission.

### 🔐 Secrets Management
You must set the following secrets in your Expo Dashboard (https://expo.dev/accounts/[your-account]/projects/pho-video-mobile/secrets) OR locally in `.env`:

| Secret | Description |
| :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Your production Next.js API URL (e.g. `https://pho.video/api`) |
| `GOOGLE_SERVICES_JSON` | Base64 encoded `google-services.json` (for Android Push/Auth) |

## 3. Building for Production

### iOS (App Store)
```bash
eas build --platform ios --profile production
```
*Note: You will need an Apple Developer Account ($99/year).*

### Android (Google Play)
```bash
eas build --platform android --profile production
```
*Note: Generates an AAB (Android App Bundle) for upload.*

## 4. Over-The-Air (OTA) Updates
Ship bug fixes instantly without waiting for App Store review:
```bash
eas update --branch production --message "Fixing styling issues"
```

## 5. Store Assets Checklist
Before submitting, ensure you have:
- [ ] **App Icon**: `assets/icon.png` (1024x1024)
- [ ] **Splash Screen**: `assets/splash.png` (1242x2436)
- [ ] **Screenshots**: Capture from `development` build on Simulator/Emulator.
- [ ] **Privacy Policy URL**: Use your web link (`https://pho.video/privacy`).

## 6. Troubleshooting
- **Build Fails?** Check the logs provided in the EAS Build dashboard link.
- **Push Notifications not working?** Verify `appleTeamId` in `eas.json` matches your Apple Developer Account.
