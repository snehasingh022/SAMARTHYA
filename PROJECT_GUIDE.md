# Autism-Friendly Learning Platform - Project Guide

## 🎯 Project Overview

This is a comprehensive, accessible, and visually engaging website for autistic children focused on fun-based learning. The platform includes interactive learning features, progress tracking, parent/teacher dashboards, and computer vision capabilities.

## 📁 Project Structure

```
AUTISM/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Layout.jsx
│   │       ├── Layout.css
│   │       ├── Navigation.jsx
│   │       ├── SettingsPanel.jsx
│   │       └── SettingsPanel.css
│   ├── contexts/
│   │   ├── SettingsContext.jsx
│   │   └── ProgressContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── Flashcards.jsx
│   │   ├── Flashcards.css
│   │   ├── Puzzles.jsx
│   │   ├── Puzzles.css
│   │   ├── LearningActivities.jsx
│   │   ├── LearningActivities.css
│   │   ├── ComputerVision.jsx
│   │   ├── ComputerVision.css
│   │   ├── Progress.jsx
│   │   ├── Progress.css
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## ✨ Features Implemented

### 1. Interactive Learning Features

#### Flashcards
- **Letters**: A-Z alphabet learning
- **Numbers**: 0-9 number recognition
- **Shapes**: Circle, Square, Triangle, etc.
- **Colors**: Red, Blue, Green, Yellow, etc.
- **Objects**: Common everyday objects

#### Puzzle Games
- Three difficulty levels (Easy, Medium, Hard)
- Color-based pattern matching
- Progressive unlocking system
- Score tracking and accuracy metrics

#### Learning Activities
- **Matching Game**: Card matching with emoji pairs
- **Sorting Game**: (Coming soon)
- **Memory Game**: (Coming soon)

#### Computer Vision Modules
- **Object Recognition**: Show objects to camera for identification
- **Gesture Learning**: (Coming soon)
- **Emotion Recognition**: (Coming soon)
- **Shape Matching**: (Coming soon)

### 2. Progress Tracking

- Level-by-level progress tracking
- Performance analytics for each activity
- Streak tracking (daily learning streaks)
- Badge system for achievements
- Activity history with timestamps
- Accuracy metrics per category

### 3. Parent/Teacher Dashboard

- **Login System**: Password-protected access (parent123/teacher123)
- **Progress Reports**: Visual charts and graphs
- **Activity History**: Detailed logs of all activities
- **Recommendations**: AI-suggested next lessons
- **Settings Controls**: Enable/disable features, adjust difficulty

### 4. Autism-Friendly UI

#### Visual Design
- Soft, calming color palette
- Large icons and buttons (60px minimum)
- Minimal clutter
- High contrast text
- Rounded corners and soft shadows

#### Accessibility Features
- **Low Light Mode**: Dark theme for sensitive eyes
- **Reduce Animation**: Disables animations for motion sensitivity
- **Soft Audio Mode**: Quieter sound settings
- **Audio Instructions**: Voice guidance for activities
- **Text-to-Speech**: Reads content aloud
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML

#### Sensory Comfort Modes
- Low-light mode toggle
- Reduced animation mode
- Soft-audio mode
- Low-stimulation mode

### 5. AI Features

- **Adaptive Learning Path**: Recommendations based on progress
- **Personalized Suggestions**: Activity recommendations
- **Real-time Feedback**: Immediate response to interactions
- **Progress Analysis**: Tracks strengths and areas for improvement

## 🎨 Design Principles

### Color Palette
- Primary Blue: `#6B9BD2`
- Primary Green: `#7FB3A8`
- Primary Purple: `#9B8FB8`
- Primary Pink: `#D4A5C7`
- Primary Yellow: `#F5D76E`
- Primary Orange: `#F7A072`

### Typography
- Font: Comic Sans MS, Segoe UI (accessible, friendly fonts)
- Large text sizes (minimum 1.125rem)
- High contrast ratios

### Interactive Elements
- Minimum button size: 60px height
- Large touch targets
- Clear visual feedback
- Consistent spacing

## 🔧 Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Router**: Navigation
- **TensorFlow.js**: (Ready for computer vision implementation)
- **Framer Motion**: (Ready for animations)
- **Recharts**: Progress visualization
- **Lucide React**: Icons

## 📱 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Requires WebRTC for camera features
- HTTPS required for camera access (or localhost)

## 🔒 Security & Privacy

- All data stored locally (localStorage)
- No external API calls
- Camera access requires user permission
- Password-protected dashboard

## 🚧 Future Enhancements

### Computer Vision
- Integrate TensorFlow.js models:
  - COCO-SSD for object detection
  - Face Landmarks for emotion recognition
  - Hand Pose for gesture recognition
- Real-time shape/letter matching

### Additional Features
- More puzzle types
- Advanced sorting games
- Memory game sequences
- Multi-language support
- Cloud sync for progress
- Multi-child profiles
- Print-friendly progress reports

## 📝 Usage Guide

### For Children
1. Navigate using the menu (hamburger icon)
2. Choose an activity (Flashcards, Puzzles, Activities, Camera Games)
3. Follow on-screen instructions
4. Complete activities to earn progress
5. View progress in "My Progress"

### For Parents/Teachers
1. Click "Parent Dashboard"
2. Login with password: `parent123` or `teacher123`
3. View progress reports and analytics
4. Adjust settings as needed
5. Review activity history
6. Get recommendations for next lessons

### Settings
1. Click the settings icon (gear) in header
2. Adjust visual settings (low-light, animations)
3. Adjust audio settings (volume, text-to-speech)
4. Enable/disable computer vision modules
5. Settings are saved automatically

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS (or use localhost)
- Try a different browser
- Check if computer vision modules are enabled in settings

### Progress not saving
- Check browser localStorage is enabled
- Clear cache and try again
- Check browser console for errors

### Audio not playing
- Check volume settings
- Ensure audio is enabled in browser
- Check if text-to-speech is enabled in settings

## 📄 License

This project is created for educational purposes.

## 🙏 Acknowledgments

Designed with accessibility and inclusivity in mind for children with autism spectrum disorder.

