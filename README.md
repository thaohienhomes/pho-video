# 🎬 Phở Video Studio

A minimal AI video generation web app built with Next.js 14, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Modern Dark UI** - Leonardo.ai-inspired interface with purple accent colors
- **Three-Column Layout**:
  - Left: Video model selector (currently LTX-2 Text2Video)
  - Center: Prompt input with controls (duration, resolution, seed)
  - Right: Video preview panel
- **Mock API** - Ready for Runpod LTX-2 integration

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! 🎉

## 📁 Project Structure

```
pho-video-studio/
├── app/
│   ├── api/generate/route.ts    # Mock API endpoint (TODO: integrate Runpod)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main Video Studio page
│   └── globals.css              # Global styles with dark theme
├── components/
│   ├── ui/                      # Shadcn/Radix components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   └── card.tsx
│   ├── ModelSidebar.tsx         # Left panel - model list
│   ├── ControlPanel.tsx         # Center - prompt & controls
│   └── PreviewPanel.tsx         # Right - video preview
├── lib/
│   └── utils.ts                 # Utility functions
└── types/
    └── index.ts                 # TypeScript interfaces
```

## 🔌 Integrating with Runpod LTX-2

The app is structured to make backend integration straightforward:

### Step 1: Add your Runpod API credentials

Create a `.env.local` file in the root directory:

```env
RUNPOD_API_KEY=your_api_key_here
RUNPOD_ENDPOINT=your_endpoint_url_here
```

### Step 2: Update the API route

Open `app/api/generate/route.ts` and look for this comment:

```typescript
// TODO: Call real LTX-2 endpoint here
```

Replace the mock implementation with your Runpod API call:

```typescript
const response = await fetch(process.env.RUNPOD_ENDPOINT!, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`
  },
  body: JSON.stringify({
    prompt: body.prompt,
    duration: body.duration,
    resolution: body.resolution,
    seed: body.seed,
  })
})

const data = await response.json()

return NextResponse.json({
  videoUrl: data.output.video_url, // Adjust based on Runpod response structure
  status: "completed",
  requestId: data.id,
})
```

### Step 3: Test with real video generation

Generate a video and verify the output!

## 🎨 Customization

### Change accent color

Edit `tailwind.config.ts` and modify the `--primary` CSS variable in `app/globals.css`:

```css
--primary: 262 83% 58%; /* Current purple */
```

### Add more models

Edit `components/ModelSidebar.tsx` and add to the `AVAILABLE_MODELS` array:

```typescript
{
  id: "new-model-id",
  name: "New Model Name",
  description: "Model description",
  isAvailable: true,
}
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📦 Technologies Used

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (Radix UI primitives)
- **Lucide React** (Icons)

## 🐛 Troubleshooting

### Port already in use

If port 3000 is taken, specify a different port:

```bash
npm run dev -- -p 3001
```

### Dependencies not installing

Try clearing npm cache:

```bash
npm cache clean --force
npm install
```

## 📝 License

MIT

---

Built with ❤️ for non-coders who want to build AI video apps
