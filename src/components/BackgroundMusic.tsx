import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  RepeatMode,
} from 'react-native-track-player';

interface BackgroundMusicProps {
  enabled: boolean;
  volume?: number; // 0 to 1
}

// Playlist of background music files
const PLAYLIST = [
  {
    id: '1',
    url: require('../../assets/audio/night-london.mp3'),
    title: 'Night London',
    artist: 'Deep Zen',
  },
  {
    id: '2',
    url: require('../../assets/audio/night-stockholm.mp3'),
    title: 'Night Stockholm',
    artist: 'Deep Zen',
  },
  {
    id: '3',
    url: require('../../assets/audio/night-greece.mp3'),
    title: 'Night Greece',
    artist: 'Deep Zen',
  },
];

/**
 * BackgroundMusic Component - Mobile Version
 *
 * Plays background music playlist sequentially using react-native-track-player
 * Features:
 * - Auto-play when enabled
 * - Sequential playlist playback
 * - Mute/unmute control
 * - Continues playing when unmuted
 */
const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  enabled,
  volume = 0.3,
}) => {
  const playbackState = usePlaybackState();
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize TrackPlayer
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        // Check if player is already set up
        const currentTrack = await TrackPlayer.getActiveTrackIndex();
        if (currentTrack !== null && currentTrack !== undefined) {
          setIsPlayerReady(true);
          return;
        }
      } catch (error) {
        // Player not set up yet, continue with setup
      }

      try {
        await TrackPlayer.setupPlayer();

        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
        });

        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
        await TrackPlayer.setVolume(volume);
        await TrackPlayer.add(PLAYLIST);

        setIsPlayerReady(true);
      } catch (error) {
        console.error('Failed to setup player:', error);
      }
    };

    setupPlayer();

    return () => {
      // Cleanup - stop and reset player
      TrackPlayer.reset().catch(err =>
        console.error('Failed to reset player:', err),
      );
    };
  }, []);

  // Handle enabled state changes
  useEffect(() => {
    if (!isPlayerReady) return;

    const handlePlayback = async () => {
      try {
        const state = await TrackPlayer.getPlaybackState();

        if (enabled) {
          if (state.state !== State.Playing) {
            await TrackPlayer.play();
          }
        } else {
          if (state.state === State.Playing) {
            await TrackPlayer.pause();
          }
        }
      } catch (error) {
        console.error('Failed to handle playback:', error);
      }
    };

    handlePlayback();
  }, [enabled, isPlayerReady]);

  // Handle volume changes
  useEffect(() => {
    if (!isPlayerReady) return;

    const updateVolume = async () => {
      try {
        await TrackPlayer.setVolume(isMuted ? 0 : volume);
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    };

    updateVolume();
  }, [volume, isMuted, isPlayerReady]);

  const toggleMute = async () => {
    if (!isPlayerReady) return;

    try {
      if (isMuted) {
        await TrackPlayer.setVolume(volume);
        setIsMuted(false);
      } else {
        await TrackPlayer.setVolume(0);
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  if (!enabled) return null;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={toggleMute}
      accessibilityLabel={isMuted ? 'Unmute music' : 'Mute music'}
    >
      <View style={styles.speakerIcon}>
        {/* Speaker cone */}
        <View style={styles.speakerCone} />
        <View style={styles.speakerBox} />

        {/* Sound waves or mute indicator */}
        {!isMuted ? (
          <>
            <View style={[styles.soundWave, styles.wave1]} />
            <View style={[styles.soundWave, styles.wave2]} />
            <View style={[styles.soundWave, styles.wave3]} />
          </>
        ) : (
          <View style={styles.muteX}>
            <View style={styles.muteLine1} />
            <View style={styles.muteLine2} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 22,
  },
  speakerIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerBox: {
    position: 'absolute',
    left: 2,
    width: 6,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 1,
    borderBottomLeftRadius: 1,
  },
  speakerCone: {
    position: 'absolute',
    left: 8,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  soundWave: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  wave1: {
    right: 6,
    height: 4,
  },
  wave2: {
    right: 3,
    height: 8,
  },
  wave3: {
    right: 0,
    height: 6,
  },
  muteX: {
    position: 'absolute',
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteLine1: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{rotate: '45deg'}],
  },
  muteLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{rotate: '-45deg'}],
  },
});

export default BackgroundMusic;
