import React, {useMemo, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import PlanetWeb from '../components/Planet.web';
import OrbitPath from '../components/OrbitPath';
import PomodoroTimer from '../components/PomodoroTimer';
import SettingsPanel, {Settings, DEFAULT_SETTINGS} from '../components/SettingsPanel.web';
import BackgroundMusic from '../components/BackgroundMusic';

const {width, height} = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;

// Planet data: name, size, color, distance from sun, orbital period (seconds)
const PLANETS = [
  {name: 'Mercury', size: 8, color: '#8C7853', distance: 40, speed: 12},
  {name: 'Venus', size: 12, color: '#FFC870', distance: 55, speed: 18},
  {name: 'Earth', size: 13, color: '#4169E1', distance: 70, speed: 24},
  {name: 'Mars', size: 10, color: '#CD5C5C', distance: 85, speed: 30},
  {name: 'Jupiter', size: 28, color: '#DAA520', distance: 115, speed: 48},
  {name: 'Saturn', size: 24, color: '#F4A460', distance: 145, speed: 60},
  {name: 'Uranus', size: 16, color: '#4FD5D5', distance: 170, speed: 72},
  {name: 'Neptune', size: 16, color: '#4169E1', distance: 190, speed: 84},
];

/**
 * SolarSystemView - Web optimized version
 *
 * Features:
 * - Sun at center with glow effect
 * - 8 planets orbiting at different speeds and distances
 * - Dark space background with stars
 * - Pomodoro timer with customizable durations
 * - Settings panel accessible via gear icon
 * - Mouse wheel zoom (web-friendly)
 */
const SolarSystemView: React.FC = () => {
  // Settings state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
  const [scale, setScale] = useState(1);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedSettings = localStorage.getItem('motivationWatchSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Failed to load settings:', e);
        }
      }
    }
  }, []);

  // Mouse wheel zoom handler
  const handleWheel = (e: any) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(scale + delta, 0.5), 3);
    setScale(newScale);
  };

  // Render stars in the background
  const stars = useMemo(() => {
    const starElements = [];
    for (let i = 0; i < 100; i++) {
      const starSize = Math.random() * 2 + 1;
      const starX = Math.random() * width;
      const starY = Math.random() * height;
      const opacity = Math.random() * 0.5 + 0.3;

      starElements.push(
        <View
          key={`star-${i}`}
          style={[
            styles.star,
            {
              width: starSize,
              height: starSize,
              left: starX,
              top: starY,
              opacity,
            },
          ]}
        />,
      );
    }
    return starElements;
  }, []);

  return (
    <View style={styles.container}>
      {/* Background stars */}
      <View style={styles.starsContainer}>{stars}</View>

      {/* Header text */}
      <View style={styles.header}>
        <Text style={styles.title}>Motivation Watch 🚀⏱️</Text>
        <Text style={styles.subtitle}>Scroll to zoom</Text>
      </View>

      {/* Solar System - scrollable container for zoom */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e: any) => {
          // Handle wheel event for zoom
          if (e.nativeEvent && e.nativeEvent.deltaY) {
            handleWheel(e.nativeEvent);
          }
        }}
        scrollEnabled={false}
      >
        <View
          style={[
            styles.solarSystemContainer,
            {
              transform: [{scale}],
              left: CENTER_X,
              top: CENTER_Y,
            },
          ]}
          onWheel={handleWheel}
        >
          {/* Sun at center with glow effect */}
          <View style={styles.sunGlow}>
            <View style={styles.sun} />
          </View>

          {/* Render orbital paths */}
          {settings.showOrbits &&
            PLANETS.map(planet => (
              <OrbitPath key={`orbit-${planet.name}`} radius={planet.distance} />
            ))}

          {/* Render planets */}
          {PLANETS.map((planet, index) => (
            <PlanetWeb
              key={planet.name}
              name={planet.name}
              size={planet.size}
              color={planet.color}
              distance={planet.distance}
              speed={planet.speed}
              initialAngle={(index * Math.PI) / 4}
            />
          ))}
        </View>
      </ScrollView>

      {/* Settings Gear Icon - Bottom Left */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => setSettingsPanelVisible(true)}
        accessibilityLabel="Open settings"
      >
        <Text style={styles.gearIcon}>⚙️</Text>
      </TouchableOpacity>

      {/* Background Music Controls */}
      <BackgroundMusic enabled={settings.backgroundMusic} volume={0.3} />

      {/* Pomodoro Timer - Bottom Right */}
      <View style={styles.timerContainer}>
        <PomodoroTimer
          workDuration={settings.workDuration}
          breakDuration={settings.breakDuration}
          onComplete={() => {
            console.log('Timer completed!');
          }}
        />
      </View>

      {/* Settings Panel */}
      <SettingsPanel
        visible={settingsPanelVisible}
        onClose={() => setSettingsPanelVisible(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '400',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  solarSystemContainer: {
    position: 'absolute',
  },
  sun: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFA500',
    position: 'absolute',
    left: -15,
    top: -15,
  },
  sunGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    position: 'absolute',
    left: -25,
    top: -25,
  },
  settingsIcon: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    width: 50,
    height: 50,
    zIndex: 100,
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearIcon: {
    fontSize: 40,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    zIndex: 100,
  },
});

export default SolarSystemView;
