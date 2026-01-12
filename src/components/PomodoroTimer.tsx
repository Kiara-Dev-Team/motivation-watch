import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

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
 * - Start/Pause/Reset controls
 * - Visual feedback on completion
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const totalSecs = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start or resume timer
  const startTimer = () => {
    setTimerState('running');
    lastTickRef.current = Date.now();
  };

  // Pause timer
  const pauseTimer = () => {
    setTimerState('paused');
  };

  // Reset timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('idle');
    setSessionType('work');
    setTimeRemaining(workDuration * 60);
  };

  // Timer tick effect
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const delta = (now - lastTickRef.current) / 1000; // seconds elapsed
        lastTickRef.current = now;

        setTimeRemaining((prev) => {
          const newTime = prev - delta;

          if (newTime <= 0) {
            // Clear interval immediately
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            // Session completed
            if (sessionType === 'work') {
              // Work session done, switch to break
              setSessionType('break');
              lastTickRef.current = Date.now();
              if (onComplete) {
                onComplete();
              }
              return breakDuration * 60;
            } else {
              // Break session done, stop timer and reset to work session
              setTimerState('idle');
              setSessionType('work');
              if (onComplete) {
                onComplete();
              }
              return workDuration * 60;
            }
          }

          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState, onComplete, sessionType, workDuration, breakDuration]);

  // Update lastTickRef when state changes to running
  useEffect(() => {
    if (timerState === 'running') {
      lastTickRef.current = Date.now();
    }
  }, [timerState]);

  // Update timer display when duration changes (only if not running)
  useEffect(() => {
    if (timerState === 'idle') {
      const newDuration = sessionType === 'work' ? workDuration : breakDuration;
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
        >
          <Text style={styles.buttonText}>
            {timerState === 'running' ? 'PAUSE' : 'START'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={resetTimer}>
          <Text style={styles.buttonText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default PomodoroTimer;
