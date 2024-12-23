import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { PrioritySelect } from './PrioritySelect';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { BookTemplate } from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Priority } from '../../types/todo';

interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  userId: string;
  createdAt: Date;
}

interface FirestoreTemplate {
  title: string;
  description?: string;
  priority: Priority;
  userId: string;
  createdAt: Timestamp;
}

interface TaskTemplateButtonProps {
  onUseTemplate: (template: TaskTemplate) => void;
}

export function TaskTemplateButton({ onUseTemplate }: TaskTemplateButtonProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<TaskTemplate, 'id' | 'createdAt' | 'userId'>>({
    title: '',
    description: '',
    priority: 'medium',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'taskTemplates'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTemplates: TaskTemplate[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreTemplate;
        loadedTemplates.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          userId: data.userId,
          createdAt: data.createdAt.toDate(),
        });
      });
      setTemplates(loadedTemplates);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateTemplate = async () => {
    if (!user || !newTemplate.title.trim()) return;

    try {
      await addDoc(collection(db, 'taskTemplates'), {
        title: newTemplate.title.trim(),
        description: newTemplate.description?.trim(),
        priority: newTemplate.priority,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });

      setNewTemplate({
        title: '',
        description: '',
        priority: 'medium',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed bottom-4 right-4" onClick={() => setIsOpen(true)}>
          <BookTemplate className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Templates de Tarefas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="font-medium">Criar Novo Template</h3>
            <Input
              placeholder="Título do template"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição (opcional)"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
            />
            <PrioritySelect
              value={newTemplate.priority}
              onChange={(priority: Priority) => setNewTemplate(prev => ({ ...prev, priority }))}
            />
            <Button
              onClick={handleCreateTemplate}
              disabled={!newTemplate.title.trim()}
              className="w-full"
            >
              Criar Template
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Templates Salvos</h3>
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium">{template.title}</p>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onUseTemplate(template);
                    setIsOpen(false);
                  }}
                >
                  Usar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
