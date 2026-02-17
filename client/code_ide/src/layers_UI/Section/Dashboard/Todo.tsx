import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare } from "lucide-react";
import { useState } from "react";

export default function Todo() {
     const [tasks, setTasks] = useState([
    'Setup AI environment',
    'Connect GitHub repo',
    'Create new playground'
  ])
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (!newTask) return
    setTasks([...tasks, newTask])
    setNewTask('')
  }
    return(
        <>
{/*         
        Todo Section */}
        <Card className="p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Todo</h2>
          <div className="flex gap-2 mb-4">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task..."
            />
            <Button onClick={addTask}>Add</Button>
          </div>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/40"
              >
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>{task}</span>
              </div>
            ))}
          </div>
        </Card>
        
        </>
    )
};
