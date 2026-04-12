import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Priority = "high" | "medium" | "low";

interface Task {
  id: number;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: string;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const PRIORITY_LABELS: Priority[] = ["high", "medium", "low"];

const initialTasks: Task[] = [
  { id: 1, text: "Setup AI environment", done: false, priority: "high", createdAt: "Today" },
  { id: 2, text: "Connect GitHub repo", done: false, priority: "medium", createdAt: "Today" },
  { id: 3, text: "Create new playground", done: true, priority: "low", createdAt: "Yesterday" },
];

let nextId = 4;

export default function Todo() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filterDone, setFilterDone] = useState<"all" | "active" | "done">("all");

  const addTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      { id: nextId++, text: trimmed, done: false, priority, createdAt: "Just now" },
      ...prev,
    ]);
    setNewTask("");
  };

  const toggleTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: number) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => setTasks((prev) => prev.filter((t) => !t.done));

  const filtered = tasks.filter((t) => {
    if (filterDone === "active") return !t.done;
    if (filterDone === "done") return t.done;
    return true;
  });

  const doneCount = tasks.filter((t) => t.done).length;
  const activeCount = tasks.filter((t) => !t.done).length;
  const progress = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your tasks and stay on top of your workflow.
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="fade-in-up delay-100 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{doneCount} of {tasks.length} completed</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{activeCount} active</span>
            <span>·</span>
            <span>{doneCount} done</span>
          </div>
        </Card>

        {/* Input */}
        <Card className="fade-in-up delay-200 rounded-2xl p-5 space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button onClick={addTask} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {/* Priority selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority:</span>
            {PRIORITY_LABELS.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize transition-all ${priority === p
                    ? PRIORITY_STYLES[p]
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Card>

        {/* Filter Tabs + Clear Done */}
        <div className="fade-in-up delay-300 flex items-center justify-between">
          <div className="flex gap-1">
            {(["all", "active", "done"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filterDone === f ? "default" : "ghost"}
                onClick={() => setFilterDone(f)}
                className="capitalize text-xs"
              >
                {f}
              </Button>
            ))}
          </div>
          {doneCount > 0 && (
            <Button size="sm" variant="ghost" onClick={clearDone} className="text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear done
            </Button>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-2 fade-in-up delay-400">
          <AnimatePresence initial={false}>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-muted-foreground text-sm"
              >
                {filterDone === "done" ? "No completed tasks yet." : "No tasks here. Add one above!"}
              </motion.div>
            ) : (
              filtered.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  {/* Check button */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {task.done
                      ? <CheckCircle2 className="h-5 w-5 text-primary" />
                      : <Circle className="h-5 w-5" />}
                  </button>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate transition-all ${task.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                      {task.text}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{task.createdAt}</p>
                  </div>

                  {/* Priority badge */}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
