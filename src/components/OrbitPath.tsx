import React from 'react';
import {View, StyleSheet} from 'react-native';

interface OrbitPathProps {
  radius: number;
}

/**
 * OrbitPath component renders a circular orbit path.
 * These thin circular lines show the orbital paths of planets around the Sun.
 */
const OrbitPath: React.FC<OrbitPathProps> = ({radius}) => {
  return (
    <View
      style={[
        styles.orbitPath,
        {
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          // Center the orbit by offsetting by the radius
          left: -radius,
          top: -radius,
        },
      ]}
      accessibilityLabel="Orbital path"
    />
  );
};

const styles = StyleSheet.create({
  orbitPath: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(136, 136, 136, 0.3)', // Semi-transparent gray
    borderStyle: 'solid',
    // Center the orbit path so it's centered on the Sun
    // The orbit is positioned at the center of the solar system container
    // We need to offset by half the width/height to center it properly
  },
});

export default OrbitPath;
