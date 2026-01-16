import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
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
  starDensity: number; // 0-100
  backgroundMusic: boolean;
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
  starDensity: 100,
  backgroundMusic: false,
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
    setLocalSettings(DEFAULT_SETTINGS);
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
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Timer Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timer</Text>

              <View style={styles.setting}>
                <Text style={styles.label}>Work Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={workDurationText}
                  onChangeText={setWorkDurationText}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="1-60"
                />
              </View>

              <View style={styles.setting}>
                <Text style={styles.label}>Break Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={breakDurationText}
                  onChangeText={setBreakDurationText}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="1-30"
                />
              </View>
            </View>

            {/* Visual & Audio Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visual & Audio</Text>

              <View style={styles.setting}>
                <Text style={styles.label}>Show Orbital Paths</Text>
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={() => setLocalSettings({...localSettings, showOrbits: !localSettings.showOrbits})}
                >
                  <View style={[styles.toggleTrack, localSettings.showOrbits && styles.toggleTrackActive]}>
                    <View style={[styles.toggleThumb, localSettings.showOrbits && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.setting}>
                <Text style={styles.label}>Background Music</Text>
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={() => setLocalSettings({...localSettings, backgroundMusic: !localSettings.backgroundMusic})}
                >
                  <View style={[styles.toggleTrack, localSettings.backgroundMusic && styles.toggleTrackActive]}>
                    <View style={[styles.toggleThumb, localSettings.backgroundMusic && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>
              </View>
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
    gap: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
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
