import React, {useEffect, useRef, useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

interface BackgroundMusicProps {
  enabled: boolean;
  volume?: number; // 0 to 1
}

// Playlist of background music files
const PLAYLIST = [
  '/audio/night-london.mp3',
  '/audio/night-stockholm.mp3',
  '/audio/night-greece.mp3',
];

/**
 * BackgroundMusic Component
 *
 * Plays background music playlist sequentially
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio element (web only)
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio(PLAYLIST[0]);
      audio.volume = volume;
      audioRef.current = audio;

      // Handle track end - play next in playlist
      const handleEnded = () => {
        setCurrentTrackIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % PLAYLIST.length;
          if (audioRef.current) {
            audioRef.current.src = PLAYLIST[nextIndex];
            audioRef.current.play().catch(err => {
              console.error('Failed to play next track:', err);
            });
          }
          return nextIndex;
        });
      };

      audio.addEventListener('ended', handleEnded);

      // Cleanup
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  // Handle enabled state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled && !isPlaying) {
      // Try to play, handle autoplay restrictions
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.log('Autoplay prevented:', err);
          setIsPlaying(false);
        });
    } else if (!enabled && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [enabled]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  if (!enabled) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={toggleMute}
        accessibilityLabel={isMuted ? 'Unmute music' : 'Mute music'}
      >
        <Text style={styles.icon}>{isMuted ? '🔇' : '🔊'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 110,
    flexDirection: 'row',
    gap: 10,
    zIndex: 100,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 20,
  },
});

export default BackgroundMusic;
