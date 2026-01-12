# Motivation Watch

A React Native iOS app featuring an animated Solar System visualization with beautiful animations and interactive gestures.

## Features

### Solar System Visualization
- ☀️ Sun at the center with glowing effect
- 🪐 8 planets orbiting at realistic relative speeds:
  - Mercury (gray, fast orbit)
  - Venus (yellowish, fast)
  - Earth (blue with atmosphere)
  - Mars (reddish)
  - Jupiter (large, beige/tan)
  - Saturn (medium-large, tan)
  - Uranus (light blue)
  - Neptune (dark blue)
- 🌌 Orbital paths shown as thin circular lines
- ⭐ Dark space background with scattered stars
- 📱 Smooth 60fps animations
- 🤏 Pinch-to-zoom gesture support (0.5x to 3x zoom)

## Technical Stack

- **Framework**: React Native 0.73.2
- **Language**: TypeScript
- **Animation**: react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **Minimum iOS**: 13.0
- **Target**: iPhone devices

## Architecture

```
React Native App
├── src/
│   ├── components/
│   │   ├── Planet.tsx - Individual planet with orbital animation
│   │   └── OrbitPath.tsx - Circular orbital path rings
│   └── screens/
│       └── SolarSystemView.tsx - Main screen with pinch-to-zoom
├── App.tsx - Root component
└── index.js - Entry point
```

## Getting Started

### Prerequisites
- Node.js >= 18
- iOS development environment (Xcode, CocoaPods)
- React Native CLI

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

3. Install iOS pods
```bash
cd ios && pod install && cd ..
```

4. Run on iOS
```bash
npm run ios
```

## Development

### Key Components

- **Planet.tsx**: Renders individual planets with continuous orbital animation using `react-native-reanimated`. Each planet has configurable size, color, distance from Sun, and orbital speed.

- **OrbitPath.tsx**: Renders semi-transparent circular rings showing planetary orbital paths.

- **SolarSystemView.tsx**: Main screen component that:
  - Positions Sun at screen center
  - Renders all planets and orbital paths
  - Implements pinch-to-zoom gesture
  - Displays background stars
  - Shows header text overlay

### Animation System

The app uses `react-native-reanimated` for high-performance animations:
- Planets use `useSharedValue` and `withRepeat` for continuous orbital motion
- Zoom uses `withSpring` for smooth, natural feeling scaling
- All animations run on the UI thread at 60fps

### Gesture Handling

Pinch-to-zoom is implemented using `react-native-gesture-handler`:
- Detects pinch gestures
- Scales the Solar System view between 0.5x and 3x
- Maintains focus on the Sun at screen center
- Uses spring animation for smooth zoom transitions

## Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## License

All rights reserved.