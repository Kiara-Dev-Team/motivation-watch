import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface Settings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  showOrbits: boolean;
  showLabels: boolean;
  showAsteroidBelt: boolean;
  speed: number; // 0.1-10
  zoom: number; // 0.3-3
  starDensity: number; // 0-100
  backgroundMusic: boolean;
  animationPaused: boolean;
}

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  breakDuration: 5,
  showOrbits: true,
  showLabels: true,
  showAsteroidBelt: true,
  speed: 1,
  zoom: 1.8,
  starDensity: 100,
  backgroundMusic: false,
  animationPaused: false,
};


/**
 * SettingsPanel Component
 *
 * Features:
 * - Slide-in panel from left
 * - Customize work and break durations
 * - Visual preference controls
 * - Settings persistence via localStorage
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [workDurationText, setWorkDurationText] = useState(settings.workDuration.toString());
  const [breakDurationText, setBreakDurationText] = useState(settings.breakDuration.toString());
  const slideAnim = useSharedValue(visible ? 0 : -400);

  // Sync local state with incoming settings when panel opens
  useEffect(() => {
    if (visible) {
      setLocalSettings(settings);
      setWorkDurationText(settings.workDuration.toString());
      setBreakDurationText(settings.breakDuration.toString());
    }
  }, [visible, settings]);

  useEffect(() => {
    slideAnim.value = withTiming(visible ? 0 : -400, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: slideAnim.value}],
    };
  });

  // Apply settings immediately for sliders and toggles
  const applySettingsImmediately = (newSettings: Settings) => {
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    // Persist to localStorage (web only)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('motivationWatchSettings', JSON.stringify(newSettings));
    }
  };

  const handleSave = () => {
    // Parse text values before saving
    const workDuration = parseInt(workDurationText) || 1;
    const breakDuration = parseInt(breakDurationText) || 1;

    const finalSettings = {
      ...localSettings,
      workDuration: Math.max(1, Math.min(60, workDuration)),
      breakDuration: Math.max(1, Math.min(30, breakDuration)),
    };

    onSettingsChange(finalSettings);
    // Persist to localStorage (web only)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('motivationWatchSettings', JSON.stringify(finalSettings));
    }
    onClose();
  };

  const handleReset = () => {
    const resetSettings = {
      ...DEFAULT_SETTINGS,
      workDuration: parseInt(workDurationText) || DEFAULT_SETTINGS.workDuration,
      breakDuration: parseInt(breakDurationText) || DEFAULT_SETTINGS.breakDuration,
    };
    applySettingsImmediately(resetSettings);
    setWorkDurationText(DEFAULT_SETTINGS.workDuration.toString());
    setBreakDurationText(DEFAULT_SETTINGS.breakDuration.toString());
  };

  // Check if save button should be disabled
  const isSaveDisabled = workDurationText.trim() === '' || breakDurationText.trim() === '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[styles.panel, animatedStyle]}>
          <ScrollView
            contentContainerStyle={styles.content}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButtonContainer}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Work Duration */}
            <View style={styles.setting}>
              <Text style={styles.label}>Work Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={workDurationText}
                onChangeText={setWorkDurationText}
                keyboardType="numeric"
                maxLength={2}
                placeholder="1-60"
                placeholderTextColor="#666"
              />
            </View>

            {/* Break Duration */}
            <View style={styles.setting}>
              <Text style={styles.label}>Break Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={breakDurationText}
                onChangeText={setBreakDurationText}
                keyboardType="numeric"
                maxLength={2}
                placeholder="1-30"
                placeholderTextColor="#666"
              />
            </View>

            {/* Animation Speed */}
            <View style={styles.setting}>
              <Text style={styles.label}>Animation Speed</Text>
              <View style={styles.valueControl}>
                <TouchableOpacity
                  style={[styles.controlButton, localSettings.speed <= 0.1 && styles.controlButtonDisabled]}
                  onPress={() => applySettingsImmediately({...localSettings, speed: Math.max(0.1, localSettings.speed - 0.1)})}
                  disabled={localSettings.speed <= 0.1}
                >
                  <Text style={[styles.controlButtonText, localSettings.speed <= 0.1 && styles.controlButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.valueLabel}>{localSettings.speed.toFixed(1)}×</Text>
                <TouchableOpacity
                  style={[styles.controlButton, localSettings.speed >= 10 && styles.controlButtonDisabled]}
                  onPress={() => applySettingsImmediately({...localSettings, speed: Math.min(10, localSettings.speed + 0.1)})}
                  disabled={localSettings.speed >= 10}
                >
                  <Text style={[styles.controlButtonText, localSettings.speed >= 10 && styles.controlButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Zoom Level */}
            <View style={styles.setting}>
              <Text style={styles.label}>Zoom Level</Text>
              <View style={styles.valueControl}>
                <TouchableOpacity
                  style={[styles.controlButton, localSettings.zoom <= 0.3 && styles.controlButtonDisabled]}
                  onPress={() => applySettingsImmediately({...localSettings, zoom: Math.max(0.3, localSettings.zoom - 0.1)})}
                  disabled={localSettings.zoom <= 0.3}
                >
                  <Text style={[styles.controlButtonText, localSettings.zoom <= 0.3 && styles.controlButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.valueLabel}>{localSettings.zoom.toFixed(1)}×</Text>
                <TouchableOpacity
                  style={[styles.controlButton, localSettings.zoom >= 3 && styles.controlButtonDisabled]}
                  onPress={() => applySettingsImmediately({...localSettings, zoom: Math.min(3, localSettings.zoom + 0.1)})}
                  disabled={localSettings.zoom >= 3}
                >
                  <Text style={[styles.controlButtonText, localSettings.zoom >= 3 && styles.controlButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Show Orbits */}
            <View style={styles.setting}>
              <Text style={styles.label}>Show Orbital Paths</Text>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => applySettingsImmediately({...localSettings, showOrbits: !localSettings.showOrbits})}
              >
                <View style={[styles.toggleTrack, localSettings.showOrbits && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, localSettings.showOrbits && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Show Labels */}
            <View style={styles.setting}>
              <Text style={styles.label}>Show Planet Labels</Text>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => applySettingsImmediately({...localSettings, showLabels: !localSettings.showLabels})}
              >
                <View style={[styles.toggleTrack, localSettings.showLabels && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, localSettings.showLabels && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Show Asteroid Belt */}
            <View style={styles.setting}>
              <Text style={styles.label}>Show Asteroid Belt</Text>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => applySettingsImmediately({...localSettings, showAsteroidBelt: !localSettings.showAsteroidBelt})}
              >
                <View style={[styles.toggleTrack, localSettings.showAsteroidBelt && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, localSettings.showAsteroidBelt && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Background Music */}
            <View style={styles.setting}>
              <Text style={styles.label}>Background Music</Text>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => applySettingsImmediately({...localSettings, backgroundMusic: !localSettings.backgroundMusic})}
              >
                <View style={[styles.toggleTrack, localSettings.backgroundMusic && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, localSettings.backgroundMusic && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Pause Animation */}
            <View style={styles.setting}>
              <Text style={styles.label}>Pause Animation</Text>
              <TouchableOpacity
                style={styles.toggle}
                onPress={() => applySettingsImmediately({...localSettings, animationPaused: !localSettings.animationPaused})}
              >
                <View style={[styles.toggleTrack, localSettings.animationPaused && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, localSettings.animationPaused && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                <Text style={styles.secondaryButtonText}>Reset to Default</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, isSaveDisabled && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaveDisabled}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 400,
    maxWidth: '90%',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 20,
  },
  content: {
    padding: 30,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  closeButtonContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 22,
    width: 22,
    height: 22,
    textAlign: 'center',
  },
  setting: {
    gap: 8,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444444',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 16,
    borderRadius: 4,
  },
  valueControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
    opacity: 0.4,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
  controlButtonTextDisabled: {
    color: '#666666',
  },
  valueLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  toggle: {
    alignSelf: 'flex-start',
  },
  toggleTrack: {
    width: 60,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#444444',
    justifyContent: 'center',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#4169E1',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  actions: {
    gap: 15,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#4169E1',
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#666666',
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
  },
  secondaryButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
});

export default SettingsPanel;
export {DEFAULT_SETTINGS};
