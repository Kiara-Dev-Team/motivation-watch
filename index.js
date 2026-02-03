/**
 * @format
 */

import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import {name as appName} from './app.json';

// Register the TrackPlayer service
TrackPlayer.registerPlaybackService(() => require('./service.js'));

AppRegistry.registerComponent(appName, () => App);
