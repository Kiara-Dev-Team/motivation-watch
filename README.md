# Motivation Watch 🚀⏱️

A space-themed pomodoro timer that helps you stay focused and motivated with a beautiful animated Solar System visualization. Start as a web app, evolving into an iOS app.

## What is Motivation Watch?

Motivation Watch combines the proven productivity technique of the Pomodoro method with an immersive space experience. Watch the planets orbit around the Sun as you work through your focus sessions, making time management both functional and visually captivating.

## Core Features

### 🍅 Pomodoro Timer
- Focus sessions with customizable work/break intervals
- Visual countdown integrated with space animation
- Clean, distraction-free main screen
- Session tracking and statistics

### 🌌 Space Visualization
- Stunning Solar System with 8 orbiting planets
- Real-time animated orbital movements
- Beautiful star-filled space background
- Smooth 60fps animations
- Pinch-to-zoom gesture support (0.5x to 3x)

### ⚙️ Settings Panel
- Accessible via gear icon
- Customize timer durations
- Adjust visual preferences
- Keeps the main screen clean and focused

## Roadmap

### Version 1.0 (Current Focus)
- **Web App** - Accessible from any browser
- Core pomodoro functionality
- Space-themed UI with gear icon for settings
- Clean, minimalist main screen

### Future Plans
- **iOS Native App** - Enhanced mobile experience
- Advanced statistics and insights
- Customizable space themes
- Notification system

## Technical Stack

- **Framework**: React Native 0.73.2 (cross-platform ready)
- **Language**: TypeScript
- **Animation**: react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **Platform Support**: Web (current), iOS (planned)

## Project Structure

```
motivation-watch/
├── src/
│   ├── components/
│   │   ├── Planet.tsx           # Orbiting planet animations
│   │   ├── OrbitPath.tsx        # Orbital path rings
│   │   ├── PomodoroTimer.tsx    # Timer logic & display (planned)
│   │   └── SettingsPanel.tsx    # Settings gear menu (planned)
│   └── screens/
│       └── SolarSystemView.tsx  # Main space visualization
├── App.tsx
└── index.js
```

## Getting Started

### Prerequisites
- Node.js 20.x
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Kiara-Dev-Team/motivation-watch.git
cd motivation-watch
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm start
```

4. For iOS (future)
```bash
cd ios && pod install && cd ..
npm run ios
```

## Design Philosophy

**Clean & Focused**: The main screen remains minimal and distraction-free, with all controls tucked away in the settings panel.

**Beautiful & Functional**: The space theme isn't just decoration—it provides a calming, meditative backdrop that helps you maintain focus during work sessions.

**Progressive Enhancement**: Start on web, scale to native iOS for enhanced mobile experience.

## Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation improvements
- 🎨 UI/UX enhancements

Please feel free to open issues or submit pull requests.

## Reference Design

The UI is inspired by a clean, space-themed pomodoro concept with:
- Central focus on the timer
- Gear icon for accessing settings
- Minimalist control panel
- Immersive space background

## License

All rights reserved.

---

**Stay focused. Reach for the stars.** 🌟