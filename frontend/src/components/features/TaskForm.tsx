import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { Priority } from '../../types/todo';
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrioritySelect } from '../features/PrioritySelect';

interface TaskFormProps {
  onSubmit?: (task: Task) => void;
  onCancel?: () => void;
}

interface Task {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
  listId?: string;
  categoryId?: string;
  assignedTo?: string[];
  templateId?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [listId, setListId] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error('No user found');
      return;
    }

    if (!title.trim()) {
      console.error('Title is required');
      return;
    }

    try {
      const task = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        dueDate,
        priority,
        listId,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: [],
        subtasks: [],
      };

      console.log('Submitting task:', task); // Debug log

      const docRef = await addDoc(collection(db, 'todos'), task);
      console.log('Document written with ID: ', docRef.id);

      if (onSubmit) {
        onSubmit({ ...task, id: docRef.id });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setPriority('MEDIUM');
      setListId(undefined);

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Prioridade</Label>
        <PrioritySelect
          value={priority}
          onChange={setPriority}
        />
      </div>

      <div className="flex gap-4">
        <div>
          <Label>Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Adicionar Tarefa</Button>
      </div>
    </form>
  );
}
