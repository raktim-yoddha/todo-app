import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { OverlayState, OverlayTheme, TodoItem } from "../types";
import { UseTimerReturn } from "../hooks/useTimer";
import { FocusTimer } from "./FocusTimer";
import { AppearanceSettings } from "./AppearanceSettings";
import { 
  Check, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Square, 
  RotateCcw, 
  GripVertical,
  Target,
  LayoutGrid,
  CheckSquare,
  Timer,
  Palette
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AppDashboardProps {
  state: OverlayState;
  timer: UseTimerReturn;
  onAddTodo: (text: string) => Promise<void>;
  onToggleTodo: (id: string) => Promise<void>;
  onEditTodo: (id: string, text: string) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onReorderTodos: (fromIndex: number, toIndex: number) => Promise<void>;
  onSetTitle: (title: string) => Promise<void>;
  onUpdateTheme: (newTheme: OverlayTheme) => Promise<void>;
}

type DashboardView = "split" | "tasks" | "timer" | "appearance";

interface SortableGoalRowProps {
  todo: TodoItem;
  index: number;
  total: number;
  accentColor: string;
  isFocused: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onFocusTask: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const SortableGoalRow: React.FC<SortableGoalRowProps> = ({
  todo,
  index,
  total,
  accentColor,
  isFocused,
  onToggle,
  onEdit,
  onDelete,
  onFocusTask,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.4 : 1,
  };

  const [localText, setLocalText] = useState(todo.text);

  useEffect(() => {
    setLocalText(todo.text);
  }, [todo.text]);

  const handleBlur = () => {
    if (localText.trim() && localText !== todo.text) {
      onEdit(todo.id, localText.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-black/40 hover:bg-black/60 border rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all ${
        isFocused
          ? "border-sky-500/60 bg-sky-500/[0.04] ring-1 ring-sky-500/30"
          : "border-white/[0.06] hover:border-white/12"
      } ${isDragging ? "ring-2 ring-sky-500/50" : ""}`}
    >
      {/* Checkbox button */}
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        className="w-[19px] h-[19px] min-w-[19px] rounded-md border flex items-center justify-center transition-all cursor-pointer hover:border-neutral-400"
        style={{
          borderColor: todo.completed ? accentColor : "rgba(115, 115, 115, 0.4)",
          backgroundColor: todo.completed ? accentColor : "transparent",
        }}
      >
        {todo.completed && (
          <Check className="w-3 h-3 text-white stroke-[3.5]" />
        )}
      </button>

      {/* Six-dot Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing text-neutral-600 group-hover:text-neutral-400 transition-colors touch-none select-none"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Task text editable input */}
      <input
        type="text"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleBlur();
        }}
        className={`flex-1 bg-transparent text-xs font-medium text-white focus:outline-none focus:bg-white/[0.04] rounded px-1.5 py-0.5 transition-colors ${
          todo.completed ? "line-through text-neutral-500" : ""
        }`}
      />

      {/* Action buttons on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Link to focus timer */}
        <button
          type="button"
          onClick={() => onFocusTask(todo.id)}
          className={`p-1 rounded text-xs transition-colors cursor-pointer ${
            isFocused
              ? "text-sky-400 bg-sky-500/10"
              : "text-neutral-500 hover:text-sky-400 hover:bg-neutral-800"
          }`}
          title={isFocused ? "Currently active focus task" : "Focus on this task in Timer"}
        >
          <Target className="w-3.5 h-3.5" />
        </button>

        {/* Up arrow */}
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          className="p-1 text-neutral-500 hover:text-white disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>

        {/* Down arrow */}
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="p-1 text-neutral-500 hover:text-white disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const AppDashboard: React.FC<AppDashboardProps> = ({
  state,
  timer,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onReorderTodos,
  onSetTitle,
  onUpdateTheme,
}) => {
  const [activeView, setActiveView] = useState<DashboardView>("split");
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [titleInput, setTitleInput] = useState(state.title);
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const { theme, todos } = state;
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const accentColor = theme.accentColor || "#60a5fa";

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    setTitleInput(state.title);
  }, [state.title]);

  // Check widget visibility on load & periodically
  useEffect(() => {
    const checkVisibility = async () => {
      try {
        const open = await invoke<boolean>("is_widget_open");
        setIsWidgetOpen(open);
      } catch (err) {
        console.warn("Could not check widget state", err);
      }
    };
    checkVisibility();
    const interval = setInterval(checkVisibility, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleWidget = async () => {
    try {
      const nextState = await invoke<boolean>("toggle_widget_window");
      setIsWidgetOpen(nextState);
    } catch (err) {
      console.error("Error toggling widget window:", err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    await onAddTodo(newTodoText.trim());
    setNewTodoText("");
  };

  const handleResetAll = async () => {
    for (const t of todos) {
      if (t.completed) {
        await onToggleTodo(t.id);
      }
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    for (const t of completedTodos) {
      await onDeleteTodo(t.id);
    }
  };

  const handleTitleBlur = async () => {
    if (titleInput.trim() && titleInput !== state.title) {
      await onSetTitle(titleInput.trim());
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderTodos(oldIndex, newIndex);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040609] text-neutral-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* Native Desktop Window Header Bar */}
      <header className="border-b border-neutral-900 bg-[#080a0f]/90 px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        {/* Left: App Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white text-black font-extrabold rounded-lg flex items-center justify-center text-sm shadow-sm select-none">
            T
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white select-none block leading-tight">
              Todo Studio
            </span>
            <span className="text-[10px] text-neutral-500 font-medium select-none">
              Focus & Productivity
            </span>
          </div>
        </div>

        {/* Center: Desktop View Navigation Switcher */}
        <nav className="flex items-center bg-black/60 p-1 rounded-xl border border-neutral-800/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveView("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === "split"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            title="Split View: Tasks and Timer side-by-side"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Split Focus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("tasks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === "tasks"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            title="Tasks Only"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("timer")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === "timer"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            title="Focus Timer Hub"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Timer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("appearance")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === "appearance"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            title="Appearance & Theme Builder"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance</span>
          </button>
        </nav>

        {/* Right: Running Timer Status + Sticky Widget Toggle */}
        <div className="flex items-center gap-3">
          {/* Mini Running Timer Badge */}
          {timer.timerState.isRunning && (
            <button
              type="button"
              onClick={() => setActiveView("timer")}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold animate-pulse cursor-pointer"
              title="Click to view running timer"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>
                {timer.timerState.mode === "stopwatch"
                  ? "⏱️"
                  : timer.timerState.mode === "pomodoro"
                  ? "🍅"
                  : "⏳"}
                {" "}
                {Math.floor(timer.timerState.timeRemaining / 60)}:
                {(timer.timerState.timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </button>
          )}

          {/* Sticky Widget Toggle Button */}
          <button
            type="button"
            onClick={handleToggleWidget}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              isWidgetOpen
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white"
            }`}
            title="Toggle floating on-top sticky widget"
          >
            {isWidgetOpen ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Sticky Widget Active</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Turn ON Sticky Widget</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeView === "appearance" ? (
          <AppearanceSettings theme={theme} onUpdateTheme={onUpdateTheme} />
        ) : (
          <div
            className={`grid gap-6 items-start ${
              activeView === "split"
                ? "grid-cols-1 lg:grid-cols-12"
                : "grid-cols-1 max-w-2xl mx-auto"
            }`}
          >
            {/* Tasks Panel */}
            {(activeView === "split" || activeView === "tasks") && (
              <div
                className={`${
                  activeView === "split" ? "lg:col-span-7" : "w-full"
                } flex flex-col gap-4`}
              >
                {/* Tasks Container Card */}
                <div className="bg-[#0b0d12] border border-neutral-800/80 rounded-2xl p-5 shadow-2xl flex flex-col">
                  {/* Top Bar: Title & Counters */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTitleBlur();
                        }}
                        className="bg-transparent text-base font-bold text-white tracking-tight focus:outline-none focus:bg-white/[0.04] rounded px-1.5 py-0.5 uppercase"
                        placeholder="Today's Focus"
                      />
                    </div>

                    {/* Progress pill & Quick Actions */}
                    <div className="flex items-center gap-2">
                      <span className="bg-neutral-900 border border-neutral-800 rounded-full px-2.5 py-0.5 text-xs text-neutral-400 font-mono">
                        {completedCount}/{totalCount} complete
                      </span>

                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer rounded"
                        title="Reset all tasks to incomplete"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {completedCount > 0 && (
                        <button
                          type="button"
                          onClick={handleClearCompleted}
                          className="text-[11px] text-red-400 hover:text-red-300 font-medium px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Delete all completed tasks"
                        >
                          Clear done
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden my-3">
                    <div
                      className="h-full rounded-full transition-all duration-400 ease-out"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: accentColor,
                      }}
                    />
                  </div>

                  {/* Quick Add Task Input Form */}
                  <form onSubmit={handleAddSubmit} className="mt-1 mb-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a new task & press Enter..."
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      className="flex-1 bg-black/50 border border-neutral-800 hover:border-neutral-700 focus:border-sky-500/70 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      <span>Add</span>
                    </button>
                  </form>

                  {/* Filter tabs: All, Active, Completed */}
                  <div className="flex items-center gap-1 pb-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFilter("all")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        filter === "all"
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      All ({totalCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter("active")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        filter === "active"
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Active ({totalCount - completedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter("completed")}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        filter === "completed"
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>

                  {/* Sortable List of Todos */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {filteredTodos.length === 0 ? (
                      <div className="text-center py-10 text-xs text-neutral-500">
                        {filter === "completed"
                          ? "No completed tasks yet"
                          : filter === "active"
                          ? "All tasks completed! Great job 🎉"
                          : "No tasks yet. Add one above to get started."}
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={filteredTodos.map((t) => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredTodos.map((todo, index) => (
                            <SortableGoalRow
                              key={todo.id}
                              todo={todo}
                              index={index}
                              total={filteredTodos.length}
                              accentColor={accentColor}
                              isFocused={timer.timerState.activeTodoId === todo.id}
                              onToggle={onToggleTodo}
                              onEdit={onEditTodo}
                              onDelete={onDeleteTodo}
                              onFocusTask={(id) => timer.setActiveTodoId(id)}
                              onMoveUp={() => onReorderTodos(index, index - 1)}
                              onMoveDown={() => onReorderTodos(index, index + 1)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>

                  {/* Bottom App Keyboard Guide */}
                  <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-500 select-none">
                    <span>💡 Tip: Click Target icon on any task to focus it in Timer</span>
                    <span>Hold & drag to reorder</span>
                  </div>
                </div>
              </div>
            )}

            {/* Focus Timer Hub */}
            {(activeView === "split" || activeView === "timer") && (
              <div className={`${activeView === "split" ? "lg:col-span-5" : "w-full"}`}>
                <FocusTimer
                  timer={timer.timerState}
                  todos={todos}
                  accentColor={accentColor}
                  onTogglePlay={timer.togglePlay}
                  onReset={timer.resetTimer}
                  onSetMode={timer.setMode}
                  onSetPhase={timer.setPomodoroPhase}
                  onSkipPhase={timer.skipPhase}
                  onAddFiveMinutes={timer.addFiveMinutes}
                  onSetCountdownDuration={timer.setCountdownDuration}
                  onAddLap={timer.addLap}
                  onSetActiveTodoId={timer.setActiveTodoId}
                  onCompleteTodo={onToggleTodo}
                  onUpdateSettings={timer.updateSettings}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
