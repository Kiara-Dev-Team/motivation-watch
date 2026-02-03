import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
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
};

/**
 * Custom Slider Component for Android compatibility
 */
interface CustomSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
}) => {
  const sliderWidth = useRef(0);
  const sliderX = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => {
      const x = evt.nativeEvent.pageX - sliderX.current;
      handleTouch(x);
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.pageX - sliderX.current;
      handleTouch(x);
    },
  });

  const handleTouch = (x: number) => {
    if (sliderWidth.current === 0) return;

    const percentage = Math.max(0, Math.min(1, x / sliderWidth.current));
    const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));

    onValueChange(clampedValue);
  };

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View
      style={styles.customSliderContainer}
      onLayout={(e) => {
        sliderWidth.current = e.nativeEvent.layout.width;
        e.nativeEvent.layout.x && (sliderX.current = e.nativeEvent.layout.x);
      }}
      onStartShouldSetResponder={() => true}
      {...panResponder.panHandlers}
    >
      <View
        style={styles.customSliderTrack}
        onLayout={(e) => {
          e.target.measure((x, y, width, height, pageX, pageY) => {
            sliderX.current = pageX;
          });
        }}
      >
        <View style={[styles.customSliderFill, {width: `${percentage}%`}]} />
      </View>
      <View style={[styles.customSliderThumb, {left: `${percentage}%`}]} />
    </View>
  );
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
          <ScrollView contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity onPress={onClose}>
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
              <Text style={styles.label}>Animation Speed: {localSettings.speed.toFixed(1)}×</Text>
              <CustomSlider
                value={localSettings.speed}
                minimumValue={0.1}
                maximumValue={10}
                step={0.1}
                onValueChange={(value) => applySettingsImmediately({...localSettings, speed: value})}
              />
            </View>

            {/* Zoom Level */}
            <View style={styles.setting}>
              <Text style={styles.label}>Zoom Level: {localSettings.zoom.toFixed(1)}×</Text>
              <CustomSlider
                value={localSettings.zoom}
                minimumValue={0.3}
                maximumValue={3}
                step={0.1}
                onValueChange={(value) => applySettingsImmediately({...localSettings, zoom: value})}
              />
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
  customSliderContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginTop: 12,
    marginBottom: 8,
  },
  customSliderTrack: {
    height: 6,
    backgroundColor: '#444444',
    borderRadius: 3,
    overflow: 'hidden',
  },
  customSliderFill: {
    height: '100%',
    backgroundColor: '#4169E1',
    borderRadius: 3,
  },
  customSliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginLeft: -12,
    top: '50%',
    marginTop: -12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
