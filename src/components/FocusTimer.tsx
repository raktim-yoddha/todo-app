import React, { useState } from "react";
import { TimerState, PomodoroPhase, TodoItem, PomodoroSettings } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Plus, 
  Volume2, 
  VolumeX, 
  Settings2, 
  CheckCircle2, 
  Target,
  Flag,
  X
} from "lucide-react";

interface FocusTimerProps {
  timer: TimerState;
  todos: TodoItem[];
  accentColor: string;
  onTogglePlay: () => void;
  onReset: () => void;
  onSetMode: (mode: "pomodoro" | "countdown" | "stopwatch") => void;
  onSetPhase: (phase: PomodoroPhase) => void;
  onSkipPhase: () => void;
  onAddFiveMinutes: () => void;
  onSetCountdownDuration: (seconds: number) => void;
  onAddLap: () => void;
  onSetActiveTodoId: (id: string | null) => void;
  onCompleteTodo: (id: string) => Promise<void>;
  onUpdateSettings: (partial: Partial<PomodoroSettings>) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatStopwatch(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  timer,
  todos,
  accentColor,
  onTogglePlay,
  onReset,
  onSetMode,
  onSetPhase,
  onSkipPhase,
  onAddFiveMinutes,
  onSetCountdownDuration,
  onAddLap,
  onSetActiveTodoId,
  onCompleteTodo,
  onUpdateSettings,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("10");

  const activeTodo = todos.find((t) => t.id === timer.activeTodoId);

  // Circular progress calculation
  const radius = 105;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = timer.targetDuration > 0
    ? (timer.targetDuration - timer.timeRemaining) / timer.targetDuration
    : 0;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressFraction)));

  const handleCustomCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      onSetCountdownDuration(mins * 60);
    }
  };

  return (
    <div className="bg-[#0b0d12] border border-neutral-800/80 rounded-2xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background ambient radial glow matching accent color */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Header: Mode Switcher & Quick Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60 z-10">
        {/* Segmented Mode Control */}
        <div className="flex items-center bg-black/60 p-1 rounded-xl border border-neutral-800/80">
          <button
            type="button"
            onClick={() => onSetMode("pomodoro")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timer.mode === "pomodoro"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            🍅 Pomodoro
          </button>
          <button
            type="button"
            onClick={() => onSetMode("countdown")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timer.mode === "countdown"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            ⏳ Timer
          </button>
          <button
            type="button"
            onClick={() => onSetMode("stopwatch")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timer.mode === "stopwatch"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            ⏱️ Stopwatch
          </button>
        </div>

        {/* Sound toggle & Settings button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onUpdateSettings({ soundEnabled: !timer.settings.soundEnabled })}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title={timer.settings.soundEnabled ? "Mute notification chime" : "Enable notification chime"}
          >
            {timer.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showSettings
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
            }`}
            title="Timer durations & settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      {showSettings && (
        <div className="mt-4 p-4 rounded-xl bg-neutral-900/95 border border-neutral-700/80 shadow-xl space-y-4 animate-in fade-in duration-200 z-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Pomodoro Durations
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-neutral-400 mb-1 font-medium">Focus (min)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={Math.round(timer.settings.focusDuration / 60)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) onUpdateSettings({ focusDuration: val * 60 });
                }}
                className="w-full bg-black/60 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 mb-1 font-medium">Short Break</label>
              <input
                type="number"
                min="1"
                max="60"
                value={Math.round(timer.settings.shortBreakDuration / 60)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) onUpdateSettings({ shortBreakDuration: val * 60 });
                }}
                className="w-full bg-black/60 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 mb-1 font-medium">Long Break</label>
              <input
                type="number"
                min="1"
                max="90"
                value={Math.round(timer.settings.longBreakDuration / 60)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) onUpdateSettings({ longBreakDuration: val * 60 });
                }}
                className="w-full bg-black/60 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
            <span className="text-neutral-300">Auto-start Breaks</span>
            <input
              type="checkbox"
              checked={timer.settings.autoStartBreaks}
              onChange={(e) => onUpdateSettings({ autoStartBreaks: e.target.checked })}
              className="accent-sky-500 cursor-pointer w-4 h-4"
            />
          </div>
        </div>
      )}

      {/* Pomodoro Phase Buttons */}
      {timer.mode === "pomodoro" && (
        <div className="flex items-center justify-center gap-2 mt-4 z-10">
          <button
            type="button"
            onClick={() => onSetPhase("focus")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              timer.pomodoroPhase === "focus"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "bg-black/40 text-neutral-400 border border-transparent hover:text-white"
            }`}
          >
            Focus
          </button>
          <button
            type="button"
            onClick={() => onSetPhase("shortBreak")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              timer.pomodoroPhase === "shortBreak"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-black/40 text-neutral-400 border border-transparent hover:text-white"
            }`}
          >
            Short Break
          </button>
          <button
            type="button"
            onClick={() => onSetPhase("longBreak")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              timer.pomodoroPhase === "longBreak"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                : "bg-black/40 text-neutral-400 border border-transparent hover:text-white"
            }`}
          >
            Long Break
          </button>
        </div>
      )}

      {/* Linked Task Banner */}
      <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-black/40 border border-neutral-800/80 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <Target className="w-4 h-4 text-sky-400 shrink-0" />
          {activeTodo ? (
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
                Current Focus Task
              </span>
              <span className={`text-xs font-medium truncate block ${activeTodo.completed ? "line-through text-neutral-500" : "text-white"}`}>
                {activeTodo.text}
              </span>
            </div>
          ) : (
            <div className="truncate">
              <span className="text-xs text-neutral-400">
                No task linked. Select one below to focus on it.
              </span>
            </div>
          )}
        </div>

        {activeTodo ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onCompleteTodo(activeTodo.id)}
              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Mark task completed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
            <button
              type="button"
              onClick={() => onSetActiveTodoId(null)}
              className="p-1 text-neutral-500 hover:text-neutral-300 rounded cursor-pointer"
              title="Unlink task"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          todos.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onSetActiveTodoId(e.target.value);
              }}
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-[11px] text-neutral-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="" disabled>Link task...</option>
              {todos.map((t) => (
                <option key={t.id} value={t.id} disabled={t.completed}>
                  {t.completed ? "✓ " : ""}{t.text}
                </option>
              ))}
            </select>
          )
        )}
      </div>

      {/* Main Visual Display (SVG Circular Ring for Pomodoro/Countdown, or Digital Stopwatch) */}
      <div className="flex flex-col items-center justify-center my-6 relative z-10">
        {timer.mode !== "stopwatch" ? (
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg width="250" height="250" className="transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="125"
                cy="125"
                r={radius}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress Value Stroke */}
              <circle
                cx="125"
                cy="125"
                r={radius}
                stroke={accentColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Content Inside the Ring */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-1">
                {timer.mode === "pomodoro"
                  ? timer.pomodoroPhase === "focus"
                    ? "Focus Session"
                    : timer.pomodoroPhase === "shortBreak"
                    ? "Short Break"
                    : "Long Break"
                  : "Countdown"}
              </span>

              {/* Big Digital Monospace Clock */}
              <span className="text-5xl font-extrabold tracking-tight text-white font-mono select-none drop-shadow-md">
                {formatTime(timer.timeRemaining)}
              </span>

              {/* Rounds dots for Pomodoro */}
              {timer.mode === "pomodoro" && (
                <div className="flex items-center gap-1.5 mt-3">
                  {Array.from({ length: timer.settings.longBreakInterval }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx + 1 <= timer.currentRound
                          ? "bg-sky-400 shadow-sm shadow-sky-500/50"
                          : "bg-neutral-800 border border-neutral-700"
                      }`}
                      title={`Round ${idx + 1} of ${timer.settings.longBreakInterval}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Stopwatch Display */
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-2">
              Stopwatch
            </span>
            <span className="text-6xl font-extrabold tracking-tight text-white font-mono select-none drop-shadow-md">
              {formatStopwatch(timer.elapsedTime)}
            </span>
          </div>
        )}

        {/* Quick presets for Countdown Mode */}
        {timer.mode === "countdown" && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {[5, 10, 15, 25, 30, 45, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSetCountdownDuration(m * 60)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  timer.targetDuration === m * 60
                    ? "bg-sky-500 text-slate-950 font-bold"
                    : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
                }`}
              >
                {m}m
              </button>
            ))}

            <form onSubmit={handleCustomCountdown} className="flex items-center gap-1 ml-1">
              <input
                type="number"
                min="1"
                max="300"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="w-12 bg-neutral-900 border border-neutral-700 rounded-lg px-1.5 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-sky-500"
                placeholder="m"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg font-medium cursor-pointer"
              >
                Set
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Main Play / Pause Controls Row */}
      <div className="flex items-center justify-center gap-4 z-10">
        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          className="p-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full border border-neutral-800 transition-all shadow cursor-pointer active:scale-95"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Primary Play / Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className="px-7 py-3.5 rounded-full font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: timer.isRunning ? "#ef4444" : accentColor,
            color: timer.isRunning ? "#ffffff" : "#0a0c10",
          }}
        >
          {timer.isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start</span>
            </>
          )}
        </button>

        {/* Stopwatch Lap or Pomodoro Skip */}
        {timer.mode === "stopwatch" ? (
          <button
            type="button"
            onClick={onAddLap}
            disabled={!timer.isRunning}
            className="p-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full border border-neutral-800 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Record Lap"
          >
            <Flag className="w-4 h-4" />
          </button>
        ) : timer.mode === "pomodoro" ? (
          <button
            type="button"
            onClick={onSkipPhase}
            className="p-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full border border-neutral-800 transition-all shadow cursor-pointer active:scale-95"
            title="Skip to next phase"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddFiveMinutes}
            className="p-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full border border-neutral-800 transition-all shadow cursor-pointer active:scale-95"
            title="+5 Minutes"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stopwatch Laps Table */}
      {timer.mode === "stopwatch" && timer.laps.length > 0 && (
        <div className="mt-5 max-h-36 overflow-y-auto border-t border-neutral-800 pt-3 z-10">
          <div className="flex justify-between text-[11px] font-bold text-neutral-500 uppercase px-2 mb-1">
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          <div className="flex flex-col gap-1">
            {timer.laps.map((lap) => (
              <div
                key={lap.id}
                className="flex justify-between text-xs font-mono text-neutral-300 px-2 py-1 bg-black/30 rounded-lg"
              >
                <span className="text-neutral-500 font-sans font-medium">#{lap.lapNumber}</span>
                <span>+{formatStopwatch(lap.lapTime)}</span>
                <span className="text-white font-semibold">{formatStopwatch(lap.totalTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
