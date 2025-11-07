# 🌟 SAMARTHYA - Autism Learning Platform

An interactive, AI-powered learning platform designed specifically for children with autism. Features engaging activities including flashcards, puzzles, object recognition, and progress tracking.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.10.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📚 Flashcards
- Interactive flashcards for letters, numbers, shapes, colors, and objects
- **Voice Recognition** - Speak answers using your microphone
- Real-time feedback with visual and audio cues
- Progress tracking and accuracy monitoring

### 🧩 Image Puzzles
- Drag-and-drop jigsaw puzzles with colorful images
- Multiple difficulty levels (Easy: 2x2, Medium: 3x3, Hard: 4x4)
- Side-by-side layout for easy piece placement
- Score tracking and completion celebration

### 📷 Object Recognition (Camera Games)
- **AI-Powered Detection** using COCO-SSD
- Two modes:
  - **Learning Mode**: Explore and learn object names
  - **Quiz Mode**: Find specific objects for points
- Real-time object detection with bounding boxes
- Supports 90+ everyday objects

### 🎮 Learning Activities
- Matching games for shapes, colors, and patterns
- Memory card games with visual themes
- Interactive sorting and categorization

### 📊 Progress Dashboard
- Visual charts showing learning progress
- Activity history and statistics
- Accuracy tracking across all modules
- Motivational achievements and badges

### ⚙️ Customizable Settings
- Text-to-speech toggle
- Audio instructions control
- High contrast mode for better visibility
- Low-light theme for reduced eye strain
- Computer vision module toggle

## 🚀 Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router** 6.20.0 - Navigation
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### AI/ML
- **TensorFlow.js** 4.10.0 - Machine learning
- **COCO-SSD** - Object detection model (CPU-optimized)
- **Web Speech API** - Voice recognition (Chrome/Edge)

### Visualization
- **Recharts** - Progress charts and analytics

### Build Tools
- **Vite** 5.0.8 - Fast development server and build tool
- **npm** - Package manager

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- Modern browser (Chrome/Edge recommended for voice features)
- Webcam (for object recognition features)
- Microphone (for voice recognition features)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/SAMARTHYA.git
cd SAMARTHYA
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

The build files will be in the `dist` folder.

## 📁 Project Structure

```
SAMARTHYA/
├── src/
│   ├── components/
│   │   └── Layout/          # Navigation and settings panel
│   ├── contexts/
│   │   ├── ProgressContext.jsx    # Learning progress state
│   │   └── SettingsContext.jsx    # App settings state
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Dashboard.jsx         # Progress overview
│   │   ├── Flashcards.jsx        # Voice-enabled flashcards
│   │   ├── Puzzles.jsx           # Image jigsaw puzzles
│   │   ├── ComputerVision.jsx    # Camera-based games
│   │   ├── LearningActivities.jsx # Interactive games
│   │   └── Progress.jsx          # Detailed analytics
│   ├── utils/
│   │   ├── computerVision.js     # COCO-SSD object detection
│   │   ├── speechRecognition.js  # Web Speech API wrapper
│   │   └── gestureDetection.js   # Hand gesture utilities
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── public/
│   └── images/                   # Puzzle images
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Usage

### For Children
1. **Start with Flashcards** - Learn letters, numbers, and words
2. **Practice with Puzzles** - Develop problem-solving skills
3. **Explore Camera Games** - Interact with real-world objects
4. **Track Progress** - See achievements and improvements

### For Parents/Educators
1. Monitor progress through the **Dashboard**
2. Customize settings for optimal learning
3. Review activity history and accuracy
4. Adjust difficulty levels as child progresses

## 🌐 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Flashcards | ✅ | ✅ | ✅ | ✅ |
| Puzzles | ✅ | ✅ | ✅ | ✅ |
| Object Detection | ✅ | ✅ | ✅ | ✅ |
| Voice Recognition | ✅ | ✅ | ❌ | ❌ |

**Note**: Voice recognition requires Chrome or Edge browser.

## 🔒 Privacy & Security

- **No data collection** - All processing happens locally in browser
- **No server communication** - Fully client-side application
- **Camera/Microphone access** - Only used when explicitly enabled
- **Local storage only** - Progress saved in browser's local storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- TensorFlow.js team for COCO-SSD model
- React community for excellent documentation
- Families and educators working with children with autism

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Offline voice recognition
- [ ] More puzzle images
- [ ] Social stories feature
- [ ] Parent dashboard with detailed analytics
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Emotion recognition games
- [ ] Daily routine scheduler

---

Made with ❤️ for children with autism
