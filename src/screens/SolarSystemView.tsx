import React, {useMemo, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, {Circle, Defs, RadialGradient, Stop, G, Text as SvgText} from 'react-native-svg';
import PomodoroTimer from '../components/PomodoroTimer';
import SettingsPanel, {Settings, DEFAULT_SETTINGS} from '../components/SettingsPanel';
import BackgroundMusic from '../components/BackgroundMusic';

// Realistic planet data with accurate information
const PLANETS = [
  {name: 'Mercury', color: '#b5b5b5', size: 2.4, distance: 58, speed: 4.15, moons: 0, dayLength: '59 days', year: '88 days'},
  {name: 'Venus', color: '#e6c87a', size: 6, distance: 108, speed: 1.62, moons: 0, dayLength: '243 days', year: '225 days'},
  {name: 'Earth', color: '#6b93d6', size: 6.4, distance: 150, speed: 1, moons: 1, dayLength: '24 hours', year: '365 days'},
  {name: 'Mars', color: '#c1440e', size: 3.4, distance: 228, speed: 0.53, moons: 2, dayLength: '24.6 hours', year: '687 days'},
  {name: 'Jupiter', color: '#d8ca9d', size: 35, distance: 778, speed: 0.084, moons: 95, dayLength: '10 hours', year: '12 years'},
  {name: 'Saturn', color: '#f4d59e', size: 29, distance: 1427, speed: 0.034, moons: 146, hasRings: true, dayLength: '10.7 hours', year: '29 years'},
  {name: 'Uranus', color: '#d1e7e7', size: 13, distance: 2871, speed: 0.012, moons: 28, dayLength: '17 hours', year: '84 years'},
  {name: 'Neptune', color: '#5b5ddf', size: 12, distance: 4497, speed: 0.006, moons: 16, dayLength: '16 hours', year: '165 years'},
];

// Scale distance logarithmically for better visualization
const scaleDistance = (d: number) => 35 + Math.pow(d, 0.45) * 3.5;

interface Planet {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  moons: number;
  dayLength: string;
  year: string;
  hasRings?: boolean;
}

/**
 * SolarSystemView is the main screen component featuring an advanced animated Solar System
 * with all features from the web version ported to React Native using react-native-svg.
 *
 * Features:
 * - Advanced sun with multiple gradient layers (core, glow, corona)
 * - 8 planets with realistic data and orbital mechanics
 * - 400 stars in background
 * - 200 asteroid belt particles
 * - Saturn's rings
 * - Earth's moon
 * - Planet selection with detailed info panel
 * - Speed controls (0.1x-10x) and zoom controls (0.3x-3x)
 * - Toggle buttons for orbits/labels/asteroids
 * - Quick select bar for planets
 * - Pomodoro timer with customizable durations
 * - Settings panel accessible via gear icon
 */
const SolarSystemView: React.FC = () => {
  // Settings state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);

  // Animation state
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // UI state
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showAsteroidBelt, setShowAsteroidBelt] = useState(true);

  // Dynamic dimensions state
  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  // Load settings from AsyncStorage/localStorage on mount
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

  // Animation loop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.008 * speed);
    }, 16);
    return () => clearInterval(interval);
  }, [isPaused, speed]);

  // Generate asteroid belt
  const asteroids = useMemo(
    () =>
      [...Array(200)].map((_, i) => ({
        angle: (i / 200) * Math.PI * 2 + Math.random() * 0.3,
        distance: scaleDistance(400) + (Math.random() - 0.5) * 30,
        size: Math.random() * 1.5 + 0.5,
        speed: 0.15 + Math.random() * 0.1,
        opacity: Math.random() * 0.5 + 0.3,
      })),
    [],
  );

  // Generate stars
  const stars = useMemo(
    () =>
      [...Array(400)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
      })),
    [],
  );

  const viewBox = useMemo(() => {
    const size = 500 / zoom;
    return `-${size} -${size} ${size * 2} ${size * 2}`;
  }, [zoom]);

  // Handle container layout to get actual dimensions inside SafeAreaView
  const handleLayout = (event: any) => {
    const {width, height} = event.nativeEvent.layout;
    setDimensions({width, height});
  };

  return (
    <SafeAreaView style={styles.container} onLayout={handleLayout}>
      {typeof StatusBar !== 'undefined' && <StatusBar barStyle="light-content" backgroundColor="#000000" />}

      {/* Star background */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {stars.map((star, i) => (
          <Circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="white"
            opacity={star.opacity}
          />
        ))}
      </Svg>

      {/* Main Solar System */}
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Sun gradients */}
          <RadialGradient id="sunCore">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="30%" stopColor="#fff5d4" />
            <Stop offset="60%" stopColor="#ffd700" />
            <Stop offset="100%" stopColor="#ff8c00" />
          </RadialGradient>

          <RadialGradient id="sunGlow">
            <Stop offset="0%" stopColor="#ffd700" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#ff6600" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="sunCorona">
            <Stop offset="0%" stopColor="#ffcc00" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </RadialGradient>

          {/* Planet gradients */}
          {PLANETS.map(planet => (
            <RadialGradient key={`grad-${planet.name}`} id={`planet-${planet.name}`} cx="35%" cy="35%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <Stop offset="30%" stopColor={planet.color} />
              <Stop offset="100%" stopColor={planet.color} />
            </RadialGradient>
          ))}
        </Defs>

        {/* Orbit paths */}
        {showOrbits &&
          PLANETS.map(planet => {
            const orbitRadius = scaleDistance(planet.distance);
            const isSelected = selectedPlanet?.name === planet.name;

            return (
              <Circle
                key={`orbit-${planet.name}`}
                cx="0"
                cy="0"
                r={orbitRadius}
                fill="none"
                stroke={isSelected ? planet.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={isSelected ? 1.5 : 0.5}
                strokeDasharray={isSelected ? undefined : '4,6'}
              />
            );
          })}

        {/* Asteroid belt */}
        {showAsteroidBelt &&
          asteroids.map((asteroid, i) => {
            const angle = asteroid.angle + time * asteroid.speed;
            const x = Math.cos(angle) * asteroid.distance;
            const y = Math.sin(angle) * asteroid.distance;

            return <Circle key={i} cx={x} cy={y} r={asteroid.size} fill="#8b7355" opacity={asteroid.opacity} />;
          })}

        {/* Sun */}
        <G>
          <Circle cx="0" cy="0" r="45" fill="url(#sunCorona)" />
          <Circle cx="0" cy="0" r="30" fill="url(#sunGlow)" />
          <Circle cx="0" cy="0" r="18" fill="url(#sunCore)" />
        </G>

        {/* Planets */}
        {PLANETS.map((planet, index) => {
          const orbitRadius = scaleDistance(planet.distance);
          const angle = time * planet.speed * 0.3;
          const x = Math.cos(angle) * orbitRadius;
          const y = Math.sin(angle) * orbitRadius;
          const isSelected = selectedPlanet?.name === planet.name;
          const displaySize = Math.max(planet.size * 0.35, 3) * (isSelected ? 1.2 : 1);

          return (
            <G
              key={planet.name}
              onPress={() => setSelectedPlanet(isSelected ? null : planet)}>
              {isSelected && (
                <Circle
                  cx={x}
                  cy={y}
                  r={displaySize + 8}
                  fill="none"
                  stroke={planet.color}
                  strokeWidth="1"
                  opacity="0.6"
                  strokeDasharray="3,3"
                />
              )}

              {planet.hasRings && (
                <>
                  <Circle
                    cx={x}
                    cy={y}
                    r={displaySize * 2.2}
                    fill="none"
                    stroke="#c9b896"
                    strokeWidth={displaySize * 0.5}
                    opacity="0.3"
                  />
                  <Circle
                    cx={x}
                    cy={y}
                    r={displaySize * 1.7}
                    fill="none"
                    stroke="#d4c4a8"
                    strokeWidth={displaySize * 0.3}
                    opacity="0.4"
                  />
                </>
              )}

              <Circle cx={x} cy={y} r={displaySize} fill={`url(#planet-${planet.name})`} />

              <Circle cx={x - displaySize * 0.3} cy={y - displaySize * 0.3} r={displaySize * 0.35} fill="white" opacity="0.25" />

              {planet.name === 'Earth' && (
                <Circle
                  cx={x + Math.cos(time * 13) * (displaySize + 6)}
                  cy={y + Math.sin(time * 13) * (displaySize + 6)}
                  r={1.5}
                  fill="#c0c0c0"
                />
              )}

              {showLabels && (
                <SvgText
                  x={x}
                  y={y - displaySize - 6}
                  fill="white"
                  fontSize="8"
                  textAnchor="middle"
                  opacity={isSelected ? 1 : 0.7}
                  fontFamily="system-ui">
                  {planet.name}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.controlTitle}>DeepZen</Text>
        <Text style={styles.controlSubtitle}>Top-down view (90° above ecliptic)</Text>

        <View style={styles.controlsContainer}>
          {/* Play/Pause */}
          <View style={styles.playSpeedRow}>
            <TouchableOpacity style={styles.playButton} onPress={() => setIsPaused(!isPaused)}>
              <Text style={styles.playButtonText}>{isPaused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Speed: {speed.toFixed(1)}×</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={10}
                step={0.1}
                value={speed}
                onValueChange={setSpeed}
                minimumTrackTintColor="#3B82F6"
                maximumTrackTintColor="#4B5563"
              />
            </View>
          </View>

          {/* Zoom */}
          <View style={styles.sliderWrapper}>
            <Text style={styles.sliderLabel}>Zoom: {zoom.toFixed(1)}×</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.3}
              maximumValue={3}
              step={0.1}
              value={zoom}
              onValueChange={setZoom}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor="#4B5563"
            />
          </View>

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleButton, showOrbits && styles.toggleButtonActive]} onPress={() => setShowOrbits(!showOrbits)}>
              <Text style={[styles.toggleText, showOrbits && styles.toggleTextActive]}>Orbits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleButton, showLabels && styles.toggleButtonActive]} onPress={() => setShowLabels(!showLabels)}>
              <Text style={[styles.toggleText, showLabels && styles.toggleTextActive]}>Labels</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, showAsteroidBelt && styles.toggleButtonActive]}
              onPress={() => setShowAsteroidBelt(!showAsteroidBelt)}>
              <Text style={[styles.toggleText, showAsteroidBelt && styles.toggleTextActive]}>Asteroids</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Planet Info Panel */}
      {selectedPlanet && (
        <ScrollView style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <View style={styles.infoPanelTitleRow}>
              <View style={[styles.planetBadge, {backgroundColor: selectedPlanet.color}]} />
              <View>
                <Text style={styles.infoPanelTitle}>{selectedPlanet.name}</Text>
                <Text style={styles.infoPanelSubtitle}>
                  {selectedPlanet.hasRings ? 'Gas Giant • Ringed' : selectedPlanet.size > 10 ? 'Gas Giant' : 'Rocky Planet'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedPlanet(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Distance from Sun</Text>
              <Text style={styles.infoBoxValue}>{selectedPlanet.distance.toLocaleString()} M km</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Known Moons</Text>
              <Text style={styles.infoBoxValue}>{selectedPlanet.moons}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Day Length</Text>
              <Text style={styles.infoBoxValue}>{selectedPlanet.dayLength}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>Year Length</Text>
              <Text style={styles.infoBoxValue}>{selectedPlanet.year}</Text>
            </View>
          </View>

          {selectedPlanet.hasRings && (
            <View style={styles.ringsBadge}>
              <Text style={styles.ringsBadgeText}>◈ Features prominent ring system made of ice and rock</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Planet Quick Select */}
      <View style={styles.quickSelect}>
        <View style={styles.quickSelectInner}>
          <Text style={styles.sunEmoji}>☀</Text>
          {PLANETS.map(planet => {
            const isSelected = selectedPlanet?.name === planet.name;
            return (
              <TouchableOpacity
                key={planet.name}
                onPress={() => setSelectedPlanet(isSelected ? null : planet)}
                style={[
                  styles.quickSelectButton,
                  {backgroundColor: planet.color},
                  isSelected && styles.quickSelectButtonActive,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Settings Icon - Top Right */}
      <TouchableOpacity style={styles.settingsIcon} onPress={() => setSettingsPanelVisible(true)}>
        <View style={styles.settingsIconInner}>
          <View style={styles.settingsLine} />
          <View style={styles.settingsLine} />
          <View style={styles.settingsLine} />
        </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controlPanel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    width: 256,
    zIndex: 100,
  },
  controlTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  controlSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  controlsContainer: {
    gap: 16,
  },
  playSpeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sliderContainer: {
    flex: 1,
  },
  sliderWrapper: {
    marginTop: 16,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleButtonActive: {
    backgroundColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  infoPanel: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    width: 288,
    maxHeight: '80%',
    zIndex: 100,
  },
  infoPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoPanelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planetBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoPanelSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  closeButton: {
    color: '#6B7280',
    fontSize: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoBox: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  infoBoxLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoBoxValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ringsBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderRadius: 8,
    padding: 8,
  },
  ringsBadgeText: {
    fontSize: 12,
    color: '#FDE68A',
  },
  quickSelect: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{translateX: -150}],
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickSelectInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sunEmoji: {
    fontSize: 18,
    color: '#FBBF24',
    marginRight: 8,
  },
  quickSelectButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  quickSelectButtonActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  settingsIcon: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
    zIndex: 100,
  },
  settingsIconInner: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLine: {
    width: 20,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.25,
  },
  timerContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    zIndex: 100,
  },
});

export default SolarSystemView;
