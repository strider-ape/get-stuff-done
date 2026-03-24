import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface AppData {
  date: string;
  tasks: Task[];
}

// ─── Constants ───────────────────────────────────────────────────────────
const STORAGE_KEY = "daily-check-v2";

// ─── Utilities ───────────────────────────────────────────────────────────
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

// ─── Register Service Worker ────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ─── Main App ────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [newTask, setNewTask] = useState("");
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

  // ─── Actions ────────────────────────────────────────────────────────
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

  // ─── Derived State ─────────────────────────────────────────────────
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

  // ─── Styles (inline for simplicity with this design system) ────────
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      padding: "2rem 1rem 4rem",
    },
    content: {
      width: "100%",
      maxWidth: "600px",
    },
    header: {
      marginBottom: "3rem",
      textAlign: "center" as const,
    },
    logo: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "0.25rem",
    },
    date: {
      fontSize: "0.875rem",
      opacity: 0.8,
    },
    progressSection: {
      marginBottom: "2rem",
    },
    progressLabel: {
      fontSize: "0.875rem",
      marginBottom: "0.75rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressBar: {
      height: "2px",
      background: "var(--border)",
      marginBottom: "1rem",
    },
    progressFill: {
      height: "100%",
      background: "var(--accent)",
      width: `${progress}%`,
    },
    clearBtn: {
      fontSize: "0.75rem",
      padding: "4px 12px",
      marginTop: "0.5rem",
    },
    addTaskForm: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "2rem",
    },
    input: {
      flex: 1,
      padding: "10px 14px",
    },
    addBtn: {
      padding: "10px 18px",
      fontSize: "1rem",
      border: "1px solid var(--accent)",
      color: "var(--accent)",
      background: "transparent",
      cursor: "pointer",
    },
    emptyState: {
      textAlign: "center" as const,
      padding: "4rem 1rem",
    },
    emptyTitle: {
      fontSize: "1rem",
      marginBottom: "0.5rem",
    },
    emptySubtitle: {
      fontSize: "0.75rem",
      opacity: 0.85,
      maxWidth: "280px",
      margin: "0 auto",
      lineHeight: 1.5,
    },
    taskList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    taskItem: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 0",
      borderBottom: "1px solid var(--border)",
    },
    checkbox: {
      width: "18px",
      height: "18px",
      border: "1px solid var(--text)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
      fontSize: "0.75rem",
    },
    taskText: {
      flex: 1,
      fontSize: "0.875rem",
      cursor: "pointer",
    },
    deleteBtn: {
      background: "transparent",
      border: "none",
      color: "var(--text)",
      opacity: 0.7,
      fontSize: "0.75rem",      cursor: "pointer",
      padding: "4px 8px",
    },
    footer: {
      marginTop: "auto",
      paddingTop: "3rem",
      textAlign: "center" as const,
      fontSize: "0.875rem",
      opacity: 0.8,
    },
  };

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.logo}>daily</h1>
          <p style={styles.date}>{dateStr}</p>
        </header>

        {/* Progress */}
        {totalCount > 0 && (
          <div style={styles.progressSection}>
            <div style={styles.progressLabel}>
              <span>
                {allDone
                  ? "all done for today"
                  : `${completedCount} of ${totalCount} completed`}
              </span>
              <span>{progress}%</span>
            </div>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
            {completedCount > 0 && !allDone && (
              <button
                onClick={clearCompleted}
                style={{ ...styles.clearBtn, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", cursor: "pointer", fontSize: "0.75rem", padding: "4px 12px" } as React.CSSProperties}
              >
                clear {completedCount} completed
              </button>
            )}
          </div>
        )}

        {/* Add Task */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          style={styles.addTaskForm}
        >
          <input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="add a task..."
            style={styles.input}
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            style={{
              ...styles.addBtn,
              opacity: newTask.trim() ? 1 : 0.6,
            } as React.CSSProperties}
          >
            +
          </button>
        </form>

        {/* Empty State */}
        {totalCount === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>your daily slate is clean</p>
            <p style={styles.emptySubtitle}>
              add your recurring tasks — they'll stay in your list and reset
              every midnight
            </p>
          </div>
        )}

        {/* Task List */}
        {totalCount > 0 && (
          <ul style={styles.taskList}>
            {tasks.map((task) => {
              const isChecked = task.completed;

              return (
                <li key={task.id} style={styles.taskItem}>
                  <button
                    onClick={() => toggleTask(task.id)}
                    style={{
                      ...styles.checkbox,
                      background: isChecked ? "var(--accent)" : "transparent",
                      color: isChecked ? "var(--bg)" : "transparent",
                    } as React.CSSProperties}
                    aria-label={isChecked ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {isChecked && "×"}
                  </button>
                  <span
                    onClick={() => toggleTask(task.id)}
                    style={{
                      ...styles.taskText,
                      textDecoration: isChecked ? "line-through" : "none",
                      opacity: isChecked ? 0.7 : 1,
                    } as React.CSSProperties}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={styles.deleteBtn}
                    aria-label="Delete task"
                  >
                    del
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* All-done CTA */}
        {allDone && totalCount > 0 && (
          <div style={{ marginTop: "1.5rem", textAlign: "center" as const }}>
            <button
              onClick={clearCompleted}
              style={{ border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", padding: "8px 20px", cursor: "pointer", fontSize: "0.75rem" } as React.CSSProperties}
            >
              clear & start fresh
            </button>
          </div>
        )}

        {/* Footer */}
        <footer style={styles.footer}>
          <p>resets at midnight · stored locally</p>
        </footer>
      </div>
    </div>
  );
}
