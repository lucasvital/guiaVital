import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Checkbox from '../ui/checkbox';
import { X } from 'lucide-react';
import { SubTask } from '../../types/todo';

interface SubTaskManagerProps {
  subtasks: SubTask[];
  onChange: (subtasks: SubTask[]) => void;
}

export function SubTaskManager({ subtasks, onChange }: SubTaskManagerProps) {
  const [newSubTask, setNewSubTask] = useState('');

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    
    const newTask: SubTask = {
      id: crypto.randomUUID(),
      text: newSubTask.trim(),
      completed: false
    };
    
    onChange([...subtasks, newTask]);
    setNewSubTask('');
  };

  const handleRemoveSubTask = (taskId: string) => {
    onChange(subtasks.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    onChange(
      subtasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Adicionar subtarefa..."
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSubTask()}
          className="flex-1"
        />
        <Button type="button" onClick={handleAddSubTask}>
          Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {subtasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleComplete(task.id)}
            />
            <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
              {task.text}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveSubTask(task.id)}
              className="ml-auto p-1 hover:bg-secondary rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
