import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Priority } from '../../types/todo';
import { FileText, Plus } from 'lucide-react';

interface TemplateTask {
  title: string;
  priority: Priority;
}

interface Template {
  id: string;
  name: string;
  description: string;
  tasks: TemplateTask[];
}

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: '',
    description: '',
    tasks: [],
  });
  const [newTask, setNewTask] = useState<Partial<TemplateTask>>({
    title: '',
    priority: 'medium',
  });

  const handleAddTask = () => {
    if (!newTask.title) return;

    setNewTemplate(prev => ({
      ...prev,
      tasks: [
        ...(prev.tasks || []),
        { 
          title: newTask.title!, 
          priority: newTask.priority || 'medium' 
        } as TemplateTask
      ],
    }));

    setNewTask({
      title: '',
      priority: 'medium',
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name) return;

    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      tasks: newTemplate.tasks || [],
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      description: '',
      tasks: [],
    });
  };

  return (
    <Tabs defaultValue="browse" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="browse">Modelos</TabsTrigger>
        <TabsTrigger value="create">Criar Modelo</TabsTrigger>
      </TabsList>

      <TabsContent value="browse">
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setTemplates(templates.filter(t => t.id !== template.id))}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Tarefas: {template.tasks.length}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {templates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum modelo criado ainda
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="create">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Modelo</Label>
            <Input
              id="name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <Label>Tarefas</Label>
            {newTemplate.tasks?.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-sm">{task.title}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewTemplate(prev => ({
                      ...prev,
                      tasks: prev.tasks?.filter((_, i) => i !== index),
                    }));
                  }}
                >
                  Remover
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Nova tarefa"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
              <Button type="button" size="icon" onClick={handleAddTask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleCreateTemplate}
            disabled={!newTemplate.name || !newTemplate.tasks?.length}
          >
            Criar Modelo
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
