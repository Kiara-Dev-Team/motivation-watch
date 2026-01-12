import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PlanetProps {
  name: string;
  size: number;
  color: string;
  distance: number;
  speed: number; // Orbital period in seconds for one complete orbit
  initialAngle?: number;
}

/**
 * Planet component represents a single planet in the solar system.
 * Each planet orbits around the center (Sun) at different speeds and distances.
 *
 * Orbital mechanics:
 * - Inner planets (Mercury, Venus, Earth, Mars) orbit faster
 * - Outer planets (Jupiter, Saturn, Uranus, Neptune) orbit slower
 * - Uses continuous animation with react-native-reanimated for smooth 60fps performance
 */
const Planet: React.FC<PlanetProps> = ({
  name,
  size,
  color,
  distance,
  speed,
  initialAngle = 0,
}) => {
  // Shared value for the orbital angle (in radians)
  const angle = useSharedValue(initialAngle);

  useEffect(() => {
    // Convert speed (seconds per orbit) to animation duration
    // Use withRepeat to create continuous orbital motion
    angle.value = withRepeat(
      withTiming(initialAngle + Math.PI * 2, {
        duration: speed * 1000, // Convert seconds to milliseconds
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false, // Don't reverse
    );
  }, [angle, speed, initialAngle]);

  // Calculate planet position based on angle and distance
  // Using circular orbit: x = cos(angle) * distance, y = sin(angle) * distance
  const animatedStyle = useAnimatedStyle(() => {
    const x = Math.cos(angle.value) * distance;
    const y = Math.sin(angle.value) * distance;

    return {
      transform: [
        {translateX: x},
        {translateY: y},
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.planet,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
      accessibilityLabel={`${name} planet`}
    />
  );
};

const styles = StyleSheet.create({
  planet: {
    position: 'absolute',
    // Shadow for depth effect
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default Planet;
