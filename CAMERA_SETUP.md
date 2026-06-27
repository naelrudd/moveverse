# MediaPipe Pose Camera Setup

## Browser Compatibility

### ✅ Fully Supported
- **Chrome/Edge** (Desktop & Mobile): Full support
- **Safari iOS 14.5+**: Requires HTTPS or localhost
- **Chrome Android**: Full support

### ⚠️ Partial Support
- **Firefox**: Camera API works, but MediaPipe may have quirks. Test manually.

### ❌ Not Supported
- **Safari iOS < 14.5**: Missing required WebGL features
- **Internet Explorer**: Not supported

## Setup Instructions

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

3. **Open test page:**
   - Navigate to `http://localhost:3000/test-camera`
   - Click "Start Camera" and allow camera access

### Mobile Testing

**Option 1: Local Network (Recommended for testing)**
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Run dev server: `npm run dev`
3. On mobile browser, navigate to `http://<YOUR_IP>:3000/test-camera`
4. **Note:** Some browsers require HTTPS for camera access (except localhost)

**Option 2: HTTPS (Required for Safari iOS)**
1. Deploy to Vercel: `vercel --prod`
2. Access via HTTPS URL on mobile device

### Camera Permissions

If camera access is denied:
- **Chrome/Edge:** Click the camera icon in the address bar → Allow
- **Safari iOS:** Settings → Safari → Camera → Allow for this website
- **Chrome Android:** Settings → Site Settings → Camera → Allow

## Troubleshooting

### Camera not starting
- Check browser console for errors
- Verify camera permissions are granted
- Try refreshing the page
- Test in a different browser

### Skeleton not appearing
- Ensure full body is visible in frame
- Check lighting (avoid backlighting)
- Wait 2-3 seconds for MediaPipe to initialize

### Low FPS / Lag
- Reduce video resolution (edit `useMediaPipePose.ts`, change `ideal: 1280` → `ideal: 640`)
- Close other tabs/applications
- Try `modelComplexity: 0` for faster detection (lower accuracy)

### MediaPipe load failure
- Check internet connection (CDN loads from jsdelivr)
- Try clearing browser cache
- Verify no ad blockers are interfering

## Production Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Requirements
- Node.js 18+
- Modern browser with WebGL support
- HTTPS (for mobile camera access)

## Performance Tips

1. **Target 30 FPS**: Default configuration
2. **Reduce model complexity** for older devices: `modelComplexity: 0`
3. **Lower video resolution** for bandwidth constraints: `640x480`
4. **Disable segmentation**: Already disabled in config

## Security Notes

- Camera stream stays **client-side only** (never sent to server)
- No video recording in MVP
- MediaPipe runs entirely in browser
- Landmark data is transient (not persisted unless explicitly saved)
