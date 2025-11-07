# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The app will automatically open at `http://localhost:3000`
   - Or manually navigate to that URL

## Features Overview

### 🏠 Home Page
- Welcome screen with quick stats
- Activity cards for easy navigation
- Recommended activities based on progress

### 📚 Flashcards
- **Letters**: Learn A-Z
- **Numbers**: Learn 0-9
- **Shapes**: Circle, Square, Triangle, etc.
- **Colors**: Visual color learning
- **Objects**: Common everyday items

### 🧩 Puzzles
- Color pattern matching
- Three difficulty levels
- Progressive unlocking

### 🎮 Learning Activities
- Matching games
- Card pairing activities
- Score tracking

### 📷 Computer Vision Games
- Object recognition (simulated)
- Camera-based interactions
- Gesture learning (coming soon)
- Emotion recognition (coming soon)

### 📊 Progress Tracking
- Visual progress bars
- Activity statistics
- Streak tracking
- Badge system

### 👨‍👩‍👧 Parent Dashboard
- **Login**: `parent123` or `teacher123`
- Progress reports and charts
- Activity history
- Settings controls
- Recommendations

## Accessibility Features

### Visual Settings
- **Low Light Mode**: Dark theme for sensitive eyes
- **Reduce Animation**: Disable animations
- **Low Stimulation Mode**: Minimal visual distractions

### Audio Settings
- **Soft Audio Mode**: Quieter sounds
- **Audio Instructions**: Voice guidance
- **Text-to-Speech**: Reads content aloud
- **Volume Control**: Adjustable volume slider

### Interaction
- Large buttons (60px minimum)
- Keyboard navigation support
- Screen reader compatible
- High contrast colors

## File Structure

```
src/
├── components/       # Reusable components
│   └── Layout/      # Layout components
├── contexts/        # React context providers
├── pages/          # Page components
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Configuration

### Settings Storage
- All settings saved in `localStorage`
- Persists across browser sessions
- Key: `autism-learning-settings`

### Progress Storage
- Progress data saved in `localStorage`
- Persists across browser sessions
- Key: `autism-learning-progress`

## Development Notes

### Computer Vision
- Currently uses simulated detection
- Ready for TensorFlow.js integration
- Camera access requires HTTPS (or localhost)

### State Management
- React Context API for global state
- Local state for component-specific data
- localStorage for persistence

### Styling
- CSS modules approach
- CSS variables for theming
- Responsive design
- Mobile-friendly

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- WebRTC support for camera features
- localStorage enabled
- JavaScript enabled

## Troubleshooting

### Camera Issues
1. Check browser permissions
2. Ensure HTTPS or localhost
3. Enable computer vision in settings
4. Try different browser

### Progress Not Saving
1. Check localStorage is enabled
2. Clear browser cache
3. Check browser console for errors

### Build Issues
1. Delete `node_modules` and reinstall
2. Clear npm cache: `npm cache clean --force`
3. Update Node.js to latest LTS version

## Production Build

```bash
npm run build
```

Output will be in `dist/` folder.

## Next Steps

1. Customize colors and content
2. Add more learning activities
3. Integrate TensorFlow.js for real CV
4. Add more languages
5. Implement cloud sync
6. Add multi-child profiles

## Support

For issues or questions, refer to `PROJECT_GUIDE.md` for detailed documentation.

