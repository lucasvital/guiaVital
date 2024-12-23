import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, Plus, X } from 'lucide-react';
import { PrioritySelect } from './PrioritySelect';
import { Priority, Todo, SubTask } from '../../types/todo';

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTodo: (todo: Partial<Todo>) => void;
}

interface Template {
  id: string;
  name: string;
  todo: Partial<Todo>;
}

export function TemplatesDialog({ open, onOpenChange, onAddTodo }: TemplatesDialogProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Daily Standup',
      todo: {
        title: 'Daily Standup',
        priority: 'medium' as Priority,
        subtasks: [
          { id: '1', text: 'O que fiz ontem', completed: false },
          { id: '2', text: 'O que farei hoje', completed: false },
          { id: '3', text: 'Há algum impedimento?', completed: false },
        ]
      }
    },
    {
      id: '2',
      name: 'Planejamento Semanal',
      todo: {
        title: 'Planejamento Semanal',
        priority: 'high' as Priority,
        subtasks: [
          { id: '1', text: 'Definir objetivos da semana', completed: false },
          { id: '2', text: 'Revisar tarefas pendentes', completed: false },
          { id: '3', text: 'Agendar reuniões importantes', completed: false },
          { id: '4', text: 'Estabelecer prioridades', completed: false },
        ]
      }
    }
  ]);

  const [newTodo, setNewTodo] = useState<Partial<Todo>>({
    title: '',
    priority: 'medium',
    subtasks: []
  });

  const handleAddSubTask = () => {
    const newTask: SubTask = {
      id: crypto.randomUUID(),
      text: '',
      completed: false
    };

    setNewTodo(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newTask]
    }));
  };

  const handleRemoveSubTask = (taskId: string) => {
    setNewTodo(prev => ({
      ...prev,
      subtasks: prev.subtasks?.filter(task => task.id !== taskId) || []
    }));
  };

  const handleSubTaskChange = (taskId: string, text: string) => {
    setNewTodo(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map(task => 
        task.id === taskId ? { ...task, text } : task
      ) || []
    }));
  };

  const handleCreateTodo = () => {
    if (!newTodo.title?.trim()) return;

    onAddTodo({
      ...newTodo,
      title: newTodo.title.trim()
    });

    setNewTodo({
      title: '',
      priority: 'medium',
      subtasks: []
    });

    onOpenChange(false);
  };

  const handleUseTemplate = (template: Template) => {
    onAddTodo(template.todo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Tarefa</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Nova Tarefa</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newTodo.title}
                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da tarefa..."
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <PrioritySelect
                value={newTodo.priority || 'medium'}
                onChange={(priority) => setNewTodo(prev => ({ ...prev, priority }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subtarefas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubTask}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {newTodo.subtasks?.map((task) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <Input
                      value={task.text}
                      onChange={(e) => handleSubTaskChange(task.id, e.target.value)}
                      placeholder="Digite a subtarefa..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubTask(task.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateTodo}
              disabled={!newTodo.title?.trim()}
              className="w-full"
            >
              Criar Tarefa
            </Button>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleUseTemplate(template)}
              >
                <FileText className="h-4 w-4" />
                {template.name}
              </Button>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
