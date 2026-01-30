# Phở Video Extension

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Loading in Chrome

1. Run `npm run dev` or `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `build/chrome-mv3-dev` (dev) or `build/chrome-mv3-prod` (prod)

## Usage

1. Click extension icon → Add your body photo URL
2. Visit any clothing website (Zara, Louis Vuitton, etc.)
3. Click "👕 Thử đồ với Phở Video" button on product images
4. See yourself wearing the clothes!

## Structure

```
├── popup.tsx              # Extension popup UI
├── contents/
│   └── try-on-overlay.tsx # Content script (CSUI)
├── utils/
│   ├── api.ts             # API calls
│   ├── storage.ts         # Chrome storage
│   └── scraper.ts         # Image detection
└── style.css              # Tailwind styles
```
