import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Planet from '../components/Planet';
import OrbitPath from '../components/OrbitPath';

const {width, height} = Dimensions.get('window');
const CENTER_X = width / 2;
const CENTER_Y = height / 2;

// Planet data: name, size, color, distance from sun, orbital period (seconds)
// Distances and speeds are scaled for mobile screen visualization
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
 * SolarSystemView is the main screen component featuring an animated Solar System
 * with pinch-to-zoom functionality.
 *
 * Features:
 * - Sun at center with glow effect
 * - 8 planets orbiting at different speeds and distances
 * - Orbital paths shown as thin circular lines
 * - Dark space background with stars
 * - Pinch gesture for zoom control (0.5x to 3x)
 * - Smooth animations at 60fps using react-native-reanimated
 */
const SolarSystemView: React.FC = () => {
  // Shared values for pinch-to-zoom gesture
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Pinch gesture handler
  // Users can pinch to zoom in/out while maintaining focus on the Sun at center
  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      // Calculate new scale with limits (0.5x to 3x)
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(newScale, 0.5), 3);
    })
    .onEnd(() => {
      // Save the final scale value for next gesture
      savedScale.value = scale.value;
    });

  // Animated style for the zoom container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: withSpring(scale.value, {damping: 15, stiffness: 150})},
      ],
    };
  });

  // Render stars in the background
  const renderStars = useCallback(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      const starSize = Math.random() * 2 + 1;
      const starX = Math.random() * width;
      const starY = Math.random() * height;
      const opacity = Math.random() * 0.5 + 0.3;

      stars.push(
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
    return stars;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Background stars */}
      <View style={styles.starsContainer}>{renderStars()}</View>

      {/* Header text */}
      <View style={styles.header}>
        <Text style={styles.title}>Solar System - Top View</Text>
        <Text style={styles.subtitle}>Pinch to zoom</Text>
      </View>

      {/* Solar System with pinch-to-zoom gesture */}
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.gestureContainer]}>
          <Animated.View
            style={[
              styles.solarSystemContainer,
              {
                left: CENTER_X,
                top: CENTER_Y,
              },
              animatedStyle,
            ]}>
            {/* Sun at center with glow effect */}
            <View style={styles.sunGlow}>
              <View style={styles.sun} />
            </View>

            {/* Render orbital paths */}
            {PLANETS.map(planet => (
              <OrbitPath key={`orbit-${planet.name}`} radius={planet.distance} />
            ))}

            {/* Render planets */}
            {PLANETS.map((planet, index) => (
              <Planet
                key={planet.name}
                name={planet.name}
                size={planet.size}
                color={planet.color}
                distance={planet.distance}
                speed={planet.speed}
                initialAngle={(index * Math.PI) / 4} // Distribute planets initially
              />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark space background
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
  gestureContainer: {
    flex: 1,
  },
  solarSystemContainer: {
    position: 'absolute',
    // Container centered at specified coordinates
    // All child elements positioned relative to this center point
  },
  sun: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFA500', // Orange
    position: 'absolute',
    left: -15, // Center the sun
    top: -15,
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  sunGlow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.3)', // Yellow glow
    position: 'absolute',
    left: -25,
    top: -25,
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
});

export default SolarSystemView;
