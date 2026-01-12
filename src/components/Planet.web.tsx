import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

interface PlanetProps {
  name: string;
  size: number;
  color: string;
  distance: number;
  speed: number; // Orbital period in seconds for one complete orbit
  initialAngle?: number;
}

/**
 * Planet component - Web version using state-based animation
 * Each planet orbits around the center (Sun) at different speeds and distances.
 */
const PlanetWeb: React.FC<PlanetProps> = ({
  name,
  size,
  color,
  distance,
  speed,
  initialAngle = 0,
}) => {
  const [angle, setAngle] = useState(initialAngle);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Calculate angular velocity (radians per second)
      const angularVelocity = (Math.PI * 2) / speed;

      // Update angle
      setAngle(prevAngle => {
        const newAngle = prevAngle + angularVelocity * deltaTime;
        // Keep angle in range [0, 2π] to prevent overflow
        return newAngle % (Math.PI * 2);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  // Calculate planet position based on current angle
  // Offset by half the planet size to center it
  const x = Math.cos(angle) * distance - size / 2;
  const y = Math.sin(angle) * distance - size / 2;

  return (
    <View
      style={[
        styles.planet,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
        },
      ]}
      accessibilityLabel={`${name} planet`}
    />
  );
};

const styles = StyleSheet.create({
  planet: {
    position: 'absolute',
  },
});

export default PlanetWeb;
