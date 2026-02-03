import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';

interface PomodoroTimerProps {
  workDuration?: number; // in minutes, default 25
  breakDuration?: number; // in minutes, default 5
  onComplete?: () => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';
type SessionType = 'work' | 'break';

/**
 * PomodoroTimer Component
 *
 * Features:
 * - Customizable work and break durations
 * - Continuous loop: work → break → work → break (until reset)
 * - Duration changes apply to next session (not current running session)
 * - Start/Pause/Reset controls
 * - Visual feedback on session type
 * - Clean digital timer display
 */
const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  workDuration = 25,
  breakDuration = 5,
  onComplete,
}) => {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(workDuration * 60); // in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const sessionTypeRef = useRef<SessionType>('work');

  // Store durations to apply on next session
  const nextWorkDurationRef = useRef(workDuration);
  const nextBreakDurationRef = useRef(breakDuration);
  const currentWorkDurationRef = useRef(workDuration);
  const currentBreakDurationRef = useRef(breakDuration);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const totalSecs = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start or resume timer
  const startTimer = () => {
    console.log('Start timer pressed, current state:', timerState);
    // When starting from idle, use the latest durations
    if (timerState === 'idle') {
      currentWorkDurationRef.current = nextWorkDurationRef.current;
      currentBreakDurationRef.current = nextBreakDurationRef.current;
    }
    setTimerState('running');
    lastTickRef.current = Date.now();
  };

  // Pause timer
  const pauseTimer = () => {
    console.log('Pause timer pressed');
    setTimerState('paused');
  };

  // Reset timer
  const resetTimer = () => {
    console.log('Reset timer pressed');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('idle');
    setSessionType('work');
    // Apply latest work duration when resetting
    currentWorkDurationRef.current = nextWorkDurationRef.current;
    setTimeRemaining(nextWorkDurationRef.current * 60);
  };

  // Update next duration refs when props change
  useEffect(() => {
    nextWorkDurationRef.current = workDuration;
    nextBreakDurationRef.current = breakDuration;
  }, [workDuration, breakDuration]);

  // Keep sessionTypeRef in sync
  useEffect(() => {
    sessionTypeRef.current = sessionType;
  }, [sessionType]);

  // Timer tick effect
  useEffect(() => {
    console.log('Timer effect triggered, state:', timerState);
    if (timerState === 'running') {
      console.log('Setting up interval');
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTickRef.current) / 1000; // seconds elapsed
        lastTickRef.current = now;

        setTimeRemaining((prev) => {
          const newTime = prev - delta;
          console.log('Timer tick:', prev, '->', newTime);

          if (newTime <= 0) {
            // Session completed - switch to next session and keep running
            if (sessionTypeRef.current === 'work') {
              // Work session done, switch to break
              console.log('Work session complete, switching to break');
              setSessionType('break');
              // Apply next break duration and update current
              currentBreakDurationRef.current = nextBreakDurationRef.current;
              lastTickRef.current = Date.now();
              if (onComplete) {
                onComplete();
              }
              return currentBreakDurationRef.current * 60;
            } else {
              // Break session done, switch back to work and keep running
              console.log('Break session complete, switching to work');
              setSessionType('work');
              // Apply next work duration and update current
              currentWorkDurationRef.current = nextWorkDurationRef.current;
              lastTickRef.current = Date.now();
              if (onComplete) {
                onComplete();
              }
              return currentWorkDurationRef.current * 60;
            }
          }

          return newTime;
        });
      }, 100);
      console.log('Interval set:', intervalRef.current);
    } else {
      if (intervalRef.current) {
        console.log('Clearing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log('Cleanup: clearing interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  // Update lastTickRef when state changes to running
  useEffect(() => {
    if (timerState === 'running') {
      lastTickRef.current = Date.now();
    }
  }, [timerState]);

  // Update timer display when duration changes (only if idle)
  useEffect(() => {
    if (timerState === 'idle') {
      const newDuration = sessionType === 'work' ? nextWorkDurationRef.current : nextBreakDurationRef.current;
      setTimeRemaining(newDuration * 60);
    }
  }, [workDuration, breakDuration, sessionType, timerState]);

  const isBreak = sessionType === 'break';

  return (
    <View style={styles.container}>
      {/* Session Type Indicator */}
      <Text style={[styles.sessionType, isBreak && styles.sessionTypeBreak]}>
        {sessionType.toUpperCase()} SESSION
      </Text>

      {/* Timer Display */}
      <Text style={[styles.timer, isBreak && timerState === 'running' && styles.timerBreak]}>
        {formatTime(timeRemaining)}
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={timerState === 'running' ? pauseTimer : startTimer}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {timerState === 'running' ? 'PAUSE' : 'START'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={resetTimer}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  sessionType: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sessionTypeBreak: {
    color: '#4CAF50',
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '300',
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  timerBreak: {
    color: '#4CAF50',
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
  },
  button: Platform.select({
    ios: {
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 12,
      backgroundColor: '#007AFF',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    android: {
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 12,
      backgroundColor: '#007AFF',
      elevation: 4,
    },
    default: {
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderWidth: 3,
      borderColor: '#FFFFFF',
      backgroundColor: 'transparent',
    },
  }),
  buttonText: Platform.select({
    ios: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    android: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    default: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 1,
    },
  }),
});

export default PomodoroTimer;
