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
  },
});

export default OrbitPath;
