# 📱 Phở Video Mobile App

Ứng dụng di động chính thức của **Phở Video** - Nền tảng tạo video AI hàng đầu Việt Nam.

## 🚀 Tính năng

### Tab 1: Creator Studio (Home)
- 🖼️ **Image-to-Video**: Chọn ảnh từ Gallery hoặc Camera
- ✍️ **Prompt Input**: Mô tả video bạn muốn tạo
- ⚙️ **Model Selector**: Kling AI / Luma Dream / Runway
- 📐 **Aspect Ratio**: 16:9, 9:16, 1:1
- 🔥 **Trending Feed**: Khám phá và sử dụng prompt phổ biến

### Tab 2: My Gallery
- 🏷️ **Filter**: All / Processing / Favorites
- ❤️ **Favorites**: Đánh dấu video yêu thích
- 📤 **Share**: Chia sẻ video lên mạng xã hội
- 🗑️ **Delete**: Xóa video không cần thiết

### Tab 3: Profile
- 👤 **User Info**: Thông tin tài khoản
- 💳 **Credits**: Theo dõi số điểm còn lại
- ⚙️ **Settings**: Cài đặt ứng dụng

## 🛠️ Cài đặt Development

```bash
# Clone repo
git clone https://github.com/phovideo/pho-video-mobile.git
cd pho-video-mobile

# Cài đặt dependencies
npm install

# Chạy development server
npx expo start
```

## 📦 Build Production

### Cài đặt EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Build cho Android
```bash
# APK cho testing
eas build --platform android --profile preview

# AAB cho Google Play
eas build --platform android --profile production
```

### Build cho iOS
```bash
# Simulator build
eas build --platform ios --profile development

# App Store build
eas build --platform ios --profile production
```

## 🔧 Cấu hình

### Backend API
Chỉnh sửa file `lib/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? "http://localhost:3000/api"  // Development
  : "https://pho.video/api";     // Production
```

### EAS Project ID
1. Chạy `eas init` để tạo project mới trên EAS
2. Cập nhật `projectId` trong `app.json` > `extra.eas.projectId`
3. Cập nhật `updates.url` trong `app.json`

### Push Notifications
1. Tạo Firebase project tại https://console.firebase.google.com
2. Download `google-services.json` và đặt vào thư mục gốc
3. Cấu hình Apple Push Notification service (APNs) cho iOS

## 📁 Cấu trúc thư mục

```
pho-video-mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout + deep linking
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx     # Tab bar config
│       ├── index.tsx       # Home/Creator Studio
│       ├── gallery.tsx     # My Creations
│       └── profile.tsx     # Profile & Settings
├── components/             # Reusable components
│   ├── GenerateButton.tsx
│   ├── VideoCard.tsx
│   └── ImagePicker.tsx
├── lib/                    # Services & utilities
│   ├── api.ts              # API client
│   └── notifications.ts    # Push notifications
├── assets/                 # Images & icons
│   ├── icon.png            # App icon (1024x1024)
│   ├── splash.png          # Splash screen
│   ├── adaptive-icon.png   # Android adaptive icon
│   └── favicon.png         # Web favicon
├── app.json                # Expo config
├── eas.json                # EAS Build config
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#F0421C` (Electric Vermilion)
- **Background**: `#0A0A0A` (Deep Black)
- **Surface**: `#1A1A1A` (Gunmetal)
- **Text**: `#FFFFFF`
- **Text Muted**: `#A3A3A3`
- **Border**: `rgba(255,255,255,0.1)`

### Typography
- **Logo**: Bold, 28px
- **Title**: Bold, 20-28px
- **Body**: Regular, 14-16px
- **Caption**: Medium, 12px

## 📱 Deep Linking

Scheme: `phovideo://`

| Route | URL |
|-------|-----|
| Home | `phovideo://home` |
| Gallery | `phovideo://gallery` |
| Profile | `phovideo://profile` |
| Video Detail | `phovideo://video/:id` |

## 🔒 Permissions

### iOS (Info.plist)
- `NSCameraUsageDescription`: Camera access for I2V
- `NSPhotoLibraryUsageDescription`: Photo library access
- `NSPhotoLibraryAddUsageDescription`: Save videos

### Android
- `CAMERA`
- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`
- `VIBRATE`
- `RECEIVE_BOOT_COMPLETED`

## 📄 License

Copyright © 2026 Phở Video. All rights reserved.
