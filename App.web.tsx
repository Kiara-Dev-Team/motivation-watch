import React from 'react';
import {View, StyleSheet} from 'react-native';
import SolarSystemView from './src/screens/SolarSystemView.web';

/**
 * Main App component for Web
 *
 * Web-optimized version without gesture handlers
 */
function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <SolarSystemView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
