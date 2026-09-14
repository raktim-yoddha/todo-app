import { useState, useEffect, useRef, useCallback } from "react";
import { TimerMode, PomodoroPhase, PomodoroSettings, TimerState, LapTime } from "../types";
import { playTimerChime, playClickSound } from "../utils/sound";
import { emit, listen } from "@tauri-apps/api/event";

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25 * 60, // 25 min
  shortBreakDuration: 5 * 60, // 5 min
  longBreakDuration: 15 * 60, // 15 min
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
};

const INITIAL_STATE: TimerState = {
  mode: "pomodoro",
  isRunning: false,
  timeRemaining: 25 * 60,
  elapsedTime: 0,
  targetDuration: 25 * 60,
  pomodoroPhase: "focus",
  currentRound: 1,
  activeTodoId: null,
  laps: [],
  settings: DEFAULT_SETTINGS,
};

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>(INITIAL_STATE);
  const stateRef = useRef(timerState);
  stateRef.current = timerState;

  // Track if we are broadcasting to avoid self-echo loops
  const isInternalUpdate = useRef(false);

  // Sync state changes with other Tauri windows (e.g. Sticky Widget)
  const broadcastState = useCallback((newState: TimerState) => {
    isInternalUpdate.current = true;
    emit("timer-state-sync", newState).catch(() => {});
  }, []);

  // Listen for sync events from other windows
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let isMounted = true;

    listen<TimerState>("timer-state-sync", (event) => {
      if (!isMounted) return;
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }
      if (event.payload) {
        setTimerState(event.payload);
      }
    }).then((fn) => {
      if (isMounted) unlisten = fn;
      else fn();
    }).catch(() => {});

    return () => {
      isMounted = false;
      if (unlisten) unlisten();
    };
  }, []);

  // Main active timer interval
  useEffect(() => {
    if (!timerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (!prev.isRunning) return prev;

        if (prev.mode === "stopwatch") {
          const next = {
            ...prev,
            elapsedTime: prev.elapsedTime + 1,
          };
          broadcastState(next);
          return next;
        }

        // For Pomodoro & Countdown:
        if (prev.timeRemaining > 1) {
          const next = {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
          broadcastState(next);
          return next;
        }

        // Timer has reached 0!
        if (prev.settings.soundEnabled) {
          playTimerChime();
        }

        if (prev.mode === "countdown") {
          const next: TimerState = {
            ...prev,
            isRunning: false,
            timeRemaining: 0,
          };
          broadcastState(next);
          return next;
        }

        // Pomodoro Phase Completion Transition:
        if (prev.pomodoroPhase === "focus") {
          const isLongBreak = prev.currentRound % prev.settings.longBreakInterval === 0;
          const nextPhase: PomodoroPhase = isLongBreak ? "longBreak" : "shortBreak";
          const nextDuration = isLongBreak
            ? prev.settings.longBreakDuration
            : prev.settings.shortBreakDuration;

          const next: TimerState = {
            ...prev,
            pomodoroPhase: nextPhase,
            timeRemaining: nextDuration,
            targetDuration: nextDuration,
            isRunning: prev.settings.autoStartBreaks,
          };
          broadcastState(next);
          return next;
        } else {
          // Break is finished -> advance round and return to Focus
          const nextRound = prev.pomodoroPhase === "longBreak" ? 1 : prev.currentRound + 1;
          const nextDuration = prev.settings.focusDuration;

          const next: TimerState = {
            ...prev,
            pomodoroPhase: "focus",
            currentRound: nextRound,
            timeRemaining: nextDuration,
            targetDuration: nextDuration,
            isRunning: prev.settings.autoStartFocus,
          };
          broadcastState(next);
          return next;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, broadcastState]);

  const togglePlay = useCallback(() => {
    setTimerState((prev) => {
      if (prev.settings.soundEnabled) {
        playClickSound();
      }
      const next = { ...prev, isRunning: !prev.isRunning };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const resetTimer = useCallback(() => {
    setTimerState((prev) => {
      let resetTime = prev.targetDuration;
      if (prev.mode === "pomodoro") {
        if (prev.pomodoroPhase === "focus") resetTime = prev.settings.focusDuration;
        else if (prev.pomodoroPhase === "shortBreak") resetTime = prev.settings.shortBreakDuration;
        else resetTime = prev.settings.longBreakDuration;
      }
      const next: TimerState = {
        ...prev,
        isRunning: false,
        timeRemaining: resetTime,
        elapsedTime: 0,
        laps: prev.mode === "stopwatch" ? [] : prev.laps,
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const setMode = useCallback((mode: TimerMode) => {
    setTimerState((prev) => {
      let target = prev.targetDuration;
      let remaining = prev.timeRemaining;

      if (mode === "pomodoro") {
        target = prev.settings.focusDuration;
        remaining = target;
      } else if (mode === "countdown") {
        target = 10 * 60; // 10m default countdown
        remaining = target;
      }

      const next: TimerState = {
        ...prev,
        mode,
        isRunning: false,
        timeRemaining: remaining,
        elapsedTime: 0,
        targetDuration: target,
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const setPomodoroPhase = useCallback((phase: PomodoroPhase) => {
    setTimerState((prev) => {
      let duration = prev.settings.focusDuration;
      if (phase === "shortBreak") duration = prev.settings.shortBreakDuration;
      if (phase === "longBreak") duration = prev.settings.longBreakDuration;

      const next: TimerState = {
        ...prev,
        mode: "pomodoro",
        pomodoroPhase: phase,
        isRunning: false,
        timeRemaining: duration,
        targetDuration: duration,
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const skipPhase = useCallback(() => {
    setTimerState((prev) => {
      if (prev.pomodoroPhase === "focus") {
        const isLongBreak = prev.currentRound % prev.settings.longBreakInterval === 0;
        const nextPhase: PomodoroPhase = isLongBreak ? "longBreak" : "shortBreak";
        const nextDuration = isLongBreak
          ? prev.settings.longBreakDuration
          : prev.settings.shortBreakDuration;
        const next = {
          ...prev,
          pomodoroPhase: nextPhase,
          timeRemaining: nextDuration,
          targetDuration: nextDuration,
          isRunning: false,
        };
        broadcastState(next);
        return next;
      } else {
        const nextRound = prev.pomodoroPhase === "longBreak" ? 1 : prev.currentRound + 1;
        const next = {
          ...prev,
          pomodoroPhase: "focus" as PomodoroPhase,
          currentRound: nextRound,
          timeRemaining: prev.settings.focusDuration,
          targetDuration: prev.settings.focusDuration,
          isRunning: false,
        };
        broadcastState(next);
        return next;
      }
    });
  }, [broadcastState]);

  const addFiveMinutes = useCallback(() => {
    setTimerState((prev) => {
      const next = {
        ...prev,
        timeRemaining: prev.timeRemaining + 300,
        targetDuration: prev.targetDuration + 300,
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const setCountdownDuration = useCallback((seconds: number) => {
    setTimerState((prev) => {
      const next: TimerState = {
        ...prev,
        mode: "countdown",
        isRunning: false,
        timeRemaining: seconds,
        targetDuration: seconds,
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const addLap = useCallback(() => {
    setTimerState((prev) => {
      if (prev.mode !== "stopwatch" || prev.elapsedTime === 0) return prev;
      const lastTotal = prev.laps.length > 0 ? prev.laps[0].totalTime : 0;
      const currentLapTime = prev.elapsedTime - lastTotal;
      const newLap: LapTime = {
        id: `lap-${Date.now()}`,
        lapNumber: prev.laps.length + 1,
        lapTime: currentLapTime,
        totalTime: prev.elapsedTime,
      };
      const next = {
        ...prev,
        laps: [newLap, ...prev.laps],
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const setActiveTodoId = useCallback((id: string | null) => {
    setTimerState((prev) => {
      const next = { ...prev, activeTodoId: id };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  const updateSettings = useCallback((partial: Partial<PomodoroSettings>) => {
    setTimerState((prev) => {
      const newSettings = { ...prev.settings, ...partial };
      // Adjust current timeRemaining if paused and duration changed
      let newTime = prev.timeRemaining;
      let newTarget = prev.targetDuration;
      if (!prev.isRunning && prev.mode === "pomodoro") {
        if (prev.pomodoroPhase === "focus") {
          newTime = newSettings.focusDuration;
          newTarget = newSettings.focusDuration;
        } else if (prev.pomodoroPhase === "shortBreak") {
          newTime = newSettings.shortBreakDuration;
          newTarget = newSettings.shortBreakDuration;
        } else {
          newTime = newSettings.longBreakDuration;
          newTarget = newSettings.longBreakDuration;
        }
      }
      const next: TimerState = {
        ...prev,
        settings: newSettings,
        timeRemaining: newTime,
        targetDuration: newTarget,
      };
      broadcastState(next);
      return next;
    });
  }, [broadcastState]);

  return {
    timerState,
    togglePlay,
    resetTimer,
    setMode,
    setPomodoroPhase,
    skipPhase,
    addFiveMinutes,
    setCountdownDuration,
    addLap,
    setActiveTodoId,
    updateSettings,
  };
}

export type UseTimerReturn = ReturnType<typeof useTimer>;
