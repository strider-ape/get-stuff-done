import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Types ───────────────────────────────────────────────────────────────
interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface AppData {
  date: string;
  tasks: Task[];
}

// ─── Constants ───────────────────────────────────────────────────────────
const STORAGE_KEY = "daily_tasks_v2";
const DATE_KEY = "daily_date";

// ─── Utilities ───────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toDateString();
}

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function loadTasks(): Task[] {
  const saved = localStorage.getItem(DATE_KEY);
  if (saved !== todayStr()) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(DATE_KEY, todayStr());
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ─── Register Service Worker ────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ─── Main App ────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTask, setNewTask] = useState("");
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Midnight reset check
  useEffect(() => {
    const checkMidnight = () => {
      const saved = localStorage.getItem(DATE_KEY);
      if (saved !== todayStr()) {
        setTasks([]);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(DATE_KEY, todayStr());
      }
      setTimeout(checkMidnight, msUntilMidnight());
    };
    setTimeout(checkMidnight, msUntilMidnight());
    return () => {};
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setTasks(loadTasks());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────
  const addTask = useCallback(() => {
    const text = newTask.trim();
    if (!text) return;
    setTasks((prev) => [{ id: generateId(), text, done: false }, ...prev]);
    setNewTask("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [newTask]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

    // Add to recently completed for 800ms delay
    setRecentlyCompleted((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });

    // Remove after 800ms to trigger the sort
    setTimeout(() => {
      setRecentlyCompleted((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 800);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.done));
  }, []);

  // ─── Derived State ─────────────────────────────────────────────────
  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Treat a task as 'done' for sorting ONLY if it's done AND the delay has passed
      const aIsSortedAsDone = a.done && !recentlyCompleted.has(a.id);
      const bIsSortedAsDone = b.done && !recentlyCompleted.has(b.id);

      if (aIsSortedAsDone === bIsSortedAsDone) return 0;
      return aIsSortedAsDone ? 1 : -1;
    });
  }, [tasks, recentlyCompleted]);

  // ─── Render ─────────────────────────────────────────────────────────
  // Include recently completed in active section so checked items stay at top during animation
  const activeTasks = sortedTasks.filter(t => !t.done || recentlyCompleted.has(t.id));
  const completedTasks = sortedTasks.filter(t => t.done && !recentlyCompleted.has(t.id));

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>get stuff done!</h1>
          <p className="date">{dateStr}</p>
        </div>
        <span className="progress-pct">{progress}%</span>
      </header>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            id="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Input row */}
      <div className="input-row">
        <input
          ref={inputRef}
          type="text"
          className="task-input"
          id="task-input"
          placeholder="add a task..."
          maxLength={120}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
        />
        <button className="add-btn" id="add-btn" onClick={addTask}>
          +
        </button>
      </div>

      {/* Task list */}
      <div className="task-list" id="task-list">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className={twMerge("task-item", task.done && "done")}
          >
            <input
              type="checkbox"
              className="task-check"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />
            <label
              className="task-label"
              onClick={() => toggleTask(task.id)}
            >
              <span className="task-text">{task.text}</span>
            </label>
            <button
              className="del-btn"
              onClick={() => deleteTask(task.id)}
            >
              del
            </button>
          </div>
        ))}

        {/* Completed section */}
        {completedTasks.length > 0 && (
          <>
            <div className="completed-section">
              <span className="completed-label">completed</span>
              <button
                className="clear-btn"
                id="clear-btn"
                onClick={clearCompleted}
                disabled={completedTasks.length === 0}
              >
                clear
              </button>
            </div>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className={twMerge("task-item", task.done && "done")}
              >
                <input
                  type="checkbox"
                  className="task-check"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <label
                  className="task-label"
                  onClick={() => toggleTask(task.id)}
                >
                  <span className="task-text">{task.text}</span>
                </label>
                <button
                  className="del-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  del
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Empty state */}
      <div
        className="empty-state"
        id="empty-state"
        style={{ display: tasks.length === 0 ? "block" : "none" }}
      >
        no tasks yet — add one above
      </div>

      {/* Footer */}
      <footer className="footer">
        resets at midnight · stored locally
      </footer>
    </div>
  );
}
