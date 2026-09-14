import React, { useState, useRef, useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { invoke } from "@tauri-apps/api/core";
import { OverlayState, TodoItem } from "../types";
import { 
  Check, 
  Plus, 
  Settings, 
  Trash2, 
  Pin, 
  X, 
  GripVertical,
  ChevronUp,
  ChevronDown,
  Play,
  Pause
} from "lucide-react";
import { UseTimerReturn } from "../hooks/useTimer";
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

interface StickyWidgetProps {
  state: OverlayState;
  timer?: UseTimerReturn;
  onAddTodo: (text: string) => Promise<void>;
  onToggleTodo: (id: string) => Promise<void>;
  onEditTodo: (id: string, text: string) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onReorderTodos: (fromIndex: number, toIndex: number) => Promise<void>;
  onSetTitle: (title: string) => Promise<void>;
}

function hexToRgba(hex: string, alpha: number) {
  if (!hex) return "rgba(10, 12, 16, 0.95)";
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const fontFamilies: Record<string, string> = {
  inter: "'Inter', sans-serif",
  jakarta: "'Plus Jakarta Sans', sans-serif",
  space: "'JetBrains Mono', monospace",
  serif: "Georgia, serif",
};

interface SortableItemProps {
  todo: TodoItem;
  index: number;
  totalTodos: number;
  density: string;
  completedStyle: string;
  accentColor: string;
  editingId: string | null;
  editingText: string;
  editInputRef: React.RefObject<HTMLInputElement | null>;
  onToggle: (id: string) => void;
  onStartEdit: (todo: TodoItem) => void;
  onTextChange: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: (id: string) => void;
}

const SortableTodoItem: React.FC<SortableItemProps> = ({
  todo,
  index,
  totalTodos,
  density,
  completedStyle,
  accentColor,
  editingId,
  editingText,
  editInputRef,
  onToggle,
  onStartEdit,
  onTextChange,
  onSaveEdit,
  onCancelEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
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

  const isEditing = editingId === todo.id;
  const isCompleted = todo.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2.5 group/item transition-colors rounded-lg px-1 ${
        density === "compact" ? "py-1" : "py-1.5"
      } ${isDragging ? "bg-white/5 shadow-lg" : "hover:bg-white/[0.03]"}`}
    >
      {/* Hold and Drag Grip Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mt-1 p-0.5 cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-300 opacity-60 hover:opacity-100 transition-opacity touch-none"
        title="Hold and drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Custom Rounded Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        className="mt-0.5 w-[19px] h-[19px] min-w-[19px] rounded-[5px] flex items-center justify-center transition-all duration-200 border-2"
        style={{
          borderColor: isCompleted ? accentColor : "rgba(148, 163, 184, 0.4)",
          backgroundColor: isCompleted ? accentColor : "rgba(15, 23, 42, 0.4)",
        }}
      >
        {isCompleted && (
          <Check className="w-3 h-3 text-white stroke-[3.5]" />
        )}
      </button>

      {/* Todo Text / Inline Edit - Responsive, wraps fluidly */}
      <div className="flex-1 min-w-0 pr-1">
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editingText}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            className="w-full bg-black/60 border border-sky-400/70 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
          />
        ) : (
          <div
            onDoubleClick={() => onStartEdit(todo)}
            className={`text-[0.92rem] font-medium leading-snug cursor-pointer transition-all break-words whitespace-normal select-text ${
              isCompleted
                ? completedStyle === "strike"
                  ? "line-through opacity-40 text-neutral-400"
                  : completedStyle === "dim"
                  ? "opacity-35 text-neutral-400"
                  : "opacity-85 text-neutral-200"
                : "text-neutral-100 opacity-95"
            }`}
            title="Double-click to edit text"
          >
            {todo.text}
          </div>
        )}
      </div>

      {/* Quick Move Up/Down/Delete on hover */}
      <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0 mt-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 rounded text-neutral-500 hover:text-white disabled:opacity-20 hover:bg-white/10"
          title="Move up"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === totalTodos - 1}
          className="p-0.5 rounded text-neutral-500 hover:text-white disabled:opacity-20 hover:bg-white/10"
          title="Move down"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          className="p-0.5 rounded text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const StickyWidget: React.FC<StickyWidgetProps> = ({
  state,
  timer,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onReorderTodos,
  onSetTitle,
}) => {
  const [newText, setNewText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(state.title);
  const [isPinned, setIsPinned] = useState(true);

  const editInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const { theme, todos } = state;
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  // Robust Tauri Window Dragging
  const handleStartDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, a, [data-no-drag]")) return;
    try {
      const appWindow = getCurrentWebviewWindow();
      appWindow.startDragging();
    } catch (err) {
      console.warn("startDragging error:", err);
    }
  };

  // Robust Tauri Window Resizing (Native startResizeDragging + pointer fallback)
  const handleStartResize = async (
    e: React.MouseEvent,
    direction: "SouthEast" | "East" | "South"
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      const appWindow = getCurrentWebviewWindow();
      await appWindow.startResizeDragging(direction);
    } catch (err) {
      console.warn("Native startResizeDragging error, using pointer fallback:", err);
      startManualResize(e, direction);
    }
  };

  const startManualResize = async (
    startEvent: React.MouseEvent,
    direction: "SouthEast" | "East" | "South"
  ) => {
    try {
      const appWindow = getCurrentWebviewWindow();
      let startWidth = 380;
      let startHeight = 320;
      try {
        const size = await appWindow.innerSize();
        startWidth = size.width;
        startHeight = size.height;
      } catch {
        startWidth = window.innerWidth;
        startHeight = window.innerHeight;
      }

      const startX = startEvent.screenX;
      const startY = startEvent.screenY;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.screenX - startX;
        const deltaY = moveEvent.screenY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (direction === "East" || direction === "SouthEast") {
          newWidth = Math.max(240, startWidth + deltaX);
        }
        if (direction === "South" || direction === "SouthEast") {
          newHeight = Math.max(140, startHeight + deltaY);
        }

        try {
          appWindow.setSize(new LogicalSize(newWidth, newHeight));
        } catch {
          // ignore in preview
        }
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } catch (err) {
      console.error("Manual resize error:", err);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await invoke("show_main_window");
    } catch (e) {
      console.error("Failed to open main app window", e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await onAddTodo(newText.trim());
    setNewText("");
    setIsAdding(false);
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = async () => {
    if (editingId && editingText.trim()) {
      await onEditTodo(editingId, editingText.trim());
    }
    setEditingId(null);
  };

  const handleSaveTitle = async () => {
    if (titleInput.trim()) {
      await onSetTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTogglePin = async () => {
    try {
      const appWindow = getCurrentWebviewWindow();
      const nextPinned = !isPinned;
      await appWindow.setAlwaysOnTop(nextPinned);
      setIsPinned(nextPinned);
    } catch (e) {
      console.error("Window control error", e);
    }
  };

  const handleClose = async () => {
    try {
      await invoke("close_widget_window");
    } catch (e) {
      try {
        const appWindow = getCurrentWebviewWindow();
        await appWindow.hide();
      } catch (err) {
        console.error(err);
      }
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

  const opacityDecimal = (theme.opacity || 96) / 100;
  const bgStyle = hexToRgba(theme.cardColor || "#0a0c10", opacityDecimal);
  const accentColor = theme.accentColor || "#60a5fa";
  const fontFamily = fontFamilies[theme.font || "inter"] || fontFamilies.inter;

  const showTitle = theme.showTitle !== false;
  const showFraction = theme.progressStyle !== "bar";
  const showBar = theme.progressStyle !== "fraction";

  return (
    <div className="w-screen h-screen p-1 box-border overflow-hidden bg-transparent flex flex-col select-none relative">
      {/* Edge resize strips */}
      <div
        onMouseDown={(e) => handleStartResize(e, "East")}
        data-no-drag="true"
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-50 hover:bg-sky-400/10"
        title="Resize width"
      />
      <div
        onMouseDown={(e) => handleStartResize(e, "South")}
        data-no-drag="true"
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-50 hover:bg-sky-400/10"
        title="Resize height"
      />

      {/* Main Card Container - Fills the widget window cleanly */}
      <div
        className="w-full h-full flex flex-col relative group box-border overflow-hidden"
        style={{
          backgroundColor: bgStyle,
          backdropFilter: `blur(${theme.blur || 20}px)`,
          WebkitBackdropFilter: `blur(${theme.blur || 20}px)`,
          borderRadius: `${theme.radius || 20}px`,
          padding: `${theme.padding || 20}px`,
          fontFamily,
          color: theme.textColor || "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Floating Quick Action / Window Drag Bar */}
        <div 
          data-tauri-drag-region
          onMouseDown={handleStartDrag}
          className="flex items-center justify-between pb-2 mb-1 border-b border-white/5 opacity-50 hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing shrink-0"
        >
          <div 
            data-tauri-drag-region
            onMouseDown={handleStartDrag}
            className="flex items-center gap-1.5 text-xs text-neutral-400"
          >
            <GripVertical className="w-3.5 h-3.5 opacity-70" />
            <span className="font-mono text-[10px] tracking-wider uppercase opacity-75">
              Sticky Widget
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Add task"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleTogglePin}
              className={`p-1 rounded-md transition-colors ${
                isPinned ? "text-sky-400 bg-sky-500/10" : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              title={isPinned ? "Unpin from top" : "Keep always on top"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleOpenSettings}
              className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-sky-400 transition-colors"
              title="Open App & Customizer"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
              title="Hide Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Header matching screenshot: Title & Fraction */}
        {(showTitle || showFraction) && (
          <div 
            data-tauri-drag-region
            onMouseDown={handleStartDrag}
            className="flex items-center justify-between mt-1 mb-1 gap-2 cursor-grab shrink-0"
          >
            {showTitle && (
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    className="w-full bg-black/40 border border-white/20 rounded px-2 py-0.5 text-sm font-bold tracking-wider uppercase text-white focus:outline-none"
                  />
                ) : (
                  <h1
                    onDoubleClick={() => setIsEditingTitle(true)}
                    className="text-[0.95rem] font-extrabold tracking-[0.08em] uppercase text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                    title="Double-click to rename title"
                  >
                    {state.title || "TONIGHT'S GOAL"}
                  </h1>
                )}
              </div>
            )}

            {showFraction && (
              <div className="font-extrabold text-[1.05rem] tracking-tight text-white tabular-nums shrink-0">
                {completedCount}/{totalCount}
              </div>
            )}
          </div>
        )}

        {/* Optional mini timer strip */}
        {timer && (
          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 my-1 shrink-0 text-xs select-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px]">
                {timer.timerState.mode === "stopwatch" ? "⏱️" : timer.timerState.mode === "pomodoro" ? "🍅" : "⏳"}
              </span>
              <span className="font-mono font-bold text-white text-[11px]">
                {timer.timerState.mode === "stopwatch"
                  ? `${Math.floor(timer.timerState.elapsedTime / 60)}:${(timer.timerState.elapsedTime % 60).toString().padStart(2, "0")}`
                  : `${Math.floor(timer.timerState.timeRemaining / 60)}:${(timer.timerState.timeRemaining % 60).toString().padStart(2, "0")}`}
              </span>
              {timer.timerState.mode === "pomodoro" && (
                <span className="text-[10px] text-sky-400 font-semibold uppercase">
                  {timer.timerState.pomodoroPhase === "focus" ? "Focus" : "Break"}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={timer.togglePlay}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                timer.timerState.isRunning ? "text-amber-400 hover:text-amber-300" : "text-sky-400 hover:text-sky-300"
              }`}
              title={timer.timerState.isRunning ? "Pause timer" : "Start timer"}
            >
              {timer.timerState.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
          </div>
        )}

        {/* Thin divider & progress bar line */}
        {showBar && (
          <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden my-2.5 relative shrink-0">
            <div
              className="h-full rounded-full transition-all duration-400 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}

        {/* Inline Quick Add Input */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="mb-2.5 flex items-center gap-2 shrink-0">
            <input
              ref={addInputRef}
              type="text"
              placeholder="Type goal & press Enter..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1 bg-black/40 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              Add
            </button>
          </form>
        )}

        {/* Todo List Items with Drag-and-Drop Reordering - Expands fluidly vertically & horizontally */}
        <div
          className="flex-1 min-h-0 overflow-y-auto flex flex-col pr-0.5"
          style={{ gap: `${theme.spacing || 10}px` }}
        >
          {todos.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-500">
              No tasks yet. Click <span className="text-sky-400">+</span> above or open Studio!
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {todos.map((todo, index) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    index={index}
                    totalTodos={todos.length}
                    density={theme.density || "comfortable"}
                    completedStyle={theme.completedStyle || "strike"}
                    accentColor={accentColor}
                    editingId={editingId}
                    editingText={editingText}
                    editInputRef={editInputRef}
                    onToggle={onToggleTodo}
                    onStartEdit={handleStartEdit}
                    onTextChange={setEditingText}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onMoveUp={() => onReorderTodos(index, index - 1)}
                    onMoveDown={() => onReorderTodos(index, index + 1)}
                    onDelete={onDeleteTodo}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Visible Bottom-Right Corner Resize Grip Handle */}
        <div
          onMouseDown={(e) => handleStartResize(e, "SouthEast")}
          data-no-drag="true"
          className="absolute bottom-1 right-1 p-1.5 cursor-nwse-resize text-white/30 hover:text-white/90 active:text-sky-400 transition-colors z-50 select-none touch-none"
          title="Drag to resize widget window"
        >
          <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="8.5" cy="8.5" r="1.2" />
            <circle cx="8.5" cy="4.5" r="1.2" />
            <circle cx="4.5" cy="8.5" r="1.2" />
          </svg>
        </div>
      </div>
    </div>
  );
};
