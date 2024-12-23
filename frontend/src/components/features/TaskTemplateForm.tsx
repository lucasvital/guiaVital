import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { TaskTemplate, TemplateTask } from '../../types';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface TaskTemplateFormProps {
  onSubmit?: (template: TaskTemplate) => void;
  onCancel?: () => void;
}

export function TaskTemplateForm({ onSubmit, onCancel }: TaskTemplateFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [newTask, setNewTask] = useState<TemplateTask>({
    title: '',
    description: '',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const now = Timestamp.now().toDate();
      const template: Omit<TaskTemplate, 'id'> = {
        name,
        description,
        tasks,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'taskTemplates'), {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      if (onSubmit) {
        onSubmit({
          ...template,
          id: docRef.id,
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const addTask = () => {
    if (newTask.title) {
      setTasks([...tasks, newTask]);
      setNewTask({ title: '', description: '', priority: 'medium' });
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Template</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label>Tarefas do Template</Label>
        <div className="space-y-2">
          <Input
            placeholder="Título da tarefa"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({ ...newTask, title: e.target.value })
            }
          />
          <Textarea
            placeholder="Descrição da tarefa"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                priority: e.target.value as 'low' | 'medium' | 'high',
              })
            }
            className="border rounded px-2 py-1"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          <Button type="button" onClick={addTask}>
            Adicionar Tarefa
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 p-2 rounded"
            >
              <div>
                <h4 className="font-medium">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                <span className="text-xs text-gray-500">
                  Prioridade: {task.priority}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTask(index)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Salvar Template</Button>
      </div>
    </form>
  );
}
