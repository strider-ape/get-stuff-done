import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface AppData {
  date: string;
  tasks: Task[];
}

// ─── Constants ───────────────────────────────────────────────
const STORAGE_KEY = "daily-check-v2";

// ─── Utilities ───────────────────────────────────────────────
function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: AppData = JSON.parse(raw);
      if (data.date !== getToday()) {
        // New day → keep tasks but reset completed
        return {
          date: getToday(),
          tasks: data.tasks.map((t) => ({ ...t, completed: false })),
        };
      }
      return data;
    }
  } catch {
    // Corrupted data → fresh start
  }
  return { date: getToday(), tasks: [] };
}

function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable
  }
}

// ─── Register Service Worker ─────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ─── Checkbox Icon ───────────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      className="w-3 h-3 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// ─── Delete Icon ─────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [newTask, setNewTask] = useState("");
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Midnight reset check (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getToday();
      setData((prev) => {
        if (prev.date !== today) {
          return {
            date: today,
            tasks: prev.tasks.map((t) => ({ ...t, completed: false })),
          };
        }
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setData(loadData());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ─── Actions ─────────────────────────────────────────────
  const addTask = useCallback(() => {
    const text = newTask.trim();
    if (!text) return;
    setData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        { id: generateId(), text, completed: false },
      ],
    }));
    setNewTask("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [newTask]);

  const toggleTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
    setBouncingId(id);
    setTimeout(() => setBouncingId(null), 350);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const clearCompleted = useCallback(() => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !t.completed),
    }));
  }, []);

  // ─── Derived State ───────────────────────────────────────
  const { tasks } = data;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-gradient-to-br from-violet-50/80 via-stone-50 to-amber-50/40 selection:bg-violet-200">
      <div className="max-w-md mx-auto px-5 py-8 pb-24">
        {/* ── Header ─────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Daily
              <span className="text-violet-500">✓</span>
            </h1>
          </div>
          <p className="text-stone-400 mt-0.5 text-sm font-medium tracking-wide">
            {dateStr}
          </p>
        </header>

        {/* ── Progress Card ──────────────────────────────── */}
        {totalCount > 0 && (
          <div
            className={`rounded-3xl p-5 mb-6 transition-all duration-500 ${
              allDone
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 animate-celebrate"
                : "bg-white/70 backdrop-blur-sm border border-stone-200/40 shadow-sm shadow-stone-200/40"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-sm font-semibold transition-colors duration-300 ${
                  allDone ? "text-emerald-700" : "text-stone-500"
                }`}
              >
                {allDone
                  ? "🎉 All done for today!"
                  : `${completedCount} of ${totalCount} completed`}
              </span>
              <span
                className={`text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full transition-colors duration-300 ${
                  allDone
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-violet-100 text-violet-600"
                }`}
              >
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  allDone
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                    : "bg-gradient-to-r from-violet-500 to-purple-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Clear completed */}
            {completedCount > 0 && !allDone && (
              <button
                onClick={clearCompleted}
                className="mt-3 text-xs text-stone-400 hover:text-red-400 transition-colors font-medium"
              >
                Clear {completedCount} completed
              </button>
            )}
          </div>
        )}

        {/* ── Add Task ───────────────────────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="flex gap-2.5 mb-8"
        >
          <input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 min-w-0 px-5 py-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/50 shadow-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 transition-all text-[15px]"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="w-[52px] h-[52px] rounded-2xl bg-violet-600 text-white font-bold shadow-md shadow-violet-200/60 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-300/40 active:scale-95 disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-150 text-xl flex items-center justify-center flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </form>

        {/* ── Empty State ────────────────────────────────── */}
        {totalCount === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100/60 mb-5">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-stone-500 text-sm font-semibold mb-1">
              Your daily slate is clean
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-[240px] mx-auto">
              Add your recurring tasks — they'll stay in your list and reset
              every midnight.
            </p>
          </div>
        )}

        {/* ── Task List ──────────────────────────────────── */}
        {totalCount > 0 && (
          <ul className="space-y-2.5">
            {tasks.map((task, index) => {
              const isChecked = task.completed;
              const isBouncing = bouncingId === task.id && isChecked;

              return (
                <li
                  key={task.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div
                    className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      isChecked
                        ? "bg-stone-50/80 border border-stone-100"
                        : "bg-white/80 backdrop-blur-sm border border-stone-200/40 shadow-sm shadow-stone-100/60"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-lg"
                      aria-label={
                        isChecked ? "Mark as incomplete" : "Mark as complete"
                      }
                    >
                      <div
                        className={`w-[24px] h-[24px] rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                          isBouncing ? "animate-check" : ""
                        } ${
                          isChecked
                            ? "bg-violet-500 border-violet-500 shadow-sm shadow-violet-200"
                            : "border-stone-300/80 hover:border-violet-400 bg-white"
                        }`}
                      >
                        {isChecked && <CheckIcon />}
                      </div>
                    </button>

                    {/* Task Text */}
                    <span
                      onClick={() => toggleTask(task.id)}
                      className={`flex-1 min-w-0 text-[15px] leading-snug cursor-pointer select-none transition-all duration-300 break-words ${
                        isChecked
                          ? "text-stone-400 line-through decoration-stone-300 decoration-[1.5px]"
                          : "text-stone-700"
                      }`}
                    >
                      {task.text}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 active:scale-90 opacity-40 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-all duration-200"
                      aria-label="Delete task"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── All-done CTA ───────────────────────────────── */}
        {allDone && (
          <div className="mt-6 text-center animate-fade-in">
            <button
              onClick={clearCompleted}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 active:scale-95 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Clear &amp; start fresh
            </button>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="mt-16 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-stone-300">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-[11px] font-medium tracking-wide">
                Resets at midnight
              </span>
            </div>
            <span className="text-stone-200">·</span>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-[11px] font-medium tracking-wide">
                Stored locally
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
