import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Animated,
} from 'react-native';

export interface Settings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  showOrbits: boolean;
  starDensity: number; // 0-100
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
};

/**
 * SettingsPanel Component - Web version
 *
 * Features:
 * - Modal overlay
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

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'motivationWatchSettings',
        JSON.stringify(localSettings),
      );
    }
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.panel}>
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
                  value={localSettings.workDuration.toString()}
                  onChangeText={text => {
                    const num = parseInt(text) || 1;
                    setLocalSettings({
                      ...localSettings,
                      workDuration: Math.max(1, Math.min(60, num)),
                    });
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={styles.setting}>
                <Text style={styles.label}>Break Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={localSettings.breakDuration.toString()}
                  onChangeText={text => {
                    const num = parseInt(text) || 1;
                    setLocalSettings({
                      ...localSettings,
                      breakDuration: Math.max(1, Math.min(30, num)),
                    });
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            {/* Visual Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visual</Text>

              <View style={styles.setting}>
                <Text style={styles.label}>Show Orbital Paths</Text>
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={() =>
                    setLocalSettings({
                      ...localSettings,
                      showOrbits: !localSettings.showOrbits,
                    })
                  }
                >
                  <View
                    style={[
                      styles.toggleTrack,
                      localSettings.showOrbits && styles.toggleTrackActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        localSettings.showOrbits && styles.toggleThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
                <Text style={styles.secondaryButtonText}>Reset to Default</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
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
});

export default SettingsPanel;
export {DEFAULT_SETTINGS};
