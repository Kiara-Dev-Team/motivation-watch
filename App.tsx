import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import SolarSystemView from './src/screens/SolarSystemView';

/**
 * Main App component
 *
 * This app displays an animated Solar System visualization with:
 * - Sun at the center with a glowing effect
 * - 8 planets orbiting at different speeds (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
 * - Orbital path rings
 * - Dark space background with scattered stars
 * - Pinch-to-zoom gesture support (0.5x to 3x)
 *
 * Optimized for iPhone with:
 * - Safe area handling
 * - Smooth 60fps animations using react-native-reanimated
 * - Responsive layout
 */
function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SolarSystemView />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
