import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { TagManager } from './TagManager';
import { SubTaskManager } from './SubTaskManager';
import { PrioritySelect } from './PrioritySelect';
import { DatePicker } from './DatePicker';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Todo, Tag, SubTask, Priority } from '../../types/todo';

interface FirestoreTodo {
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Timestamp;
  reminder?: Timestamp;
  listId?: string;
  categoryId?: string;
  tags: Tag[];
  subtasks: SubTask[];
  userId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export function AddTodo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    try {
      const firestoreTodo: Omit<FirestoreTodo, 'id'> = {
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        tags,
        subtasks,
        userId: user.uid,
        createdAt: Timestamp.now(),
      };

      if (dueDate) {
        firestoreTodo.dueDate = Timestamp.fromDate(dueDate);
      }

      if (reminder) {
        firestoreTodo.reminder = Timestamp.fromDate(reminder);
      }

      await addDoc(collection(db, 'todos'), firestoreTodo);

      // Limpar o formulário
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setReminder(null);
      setTags([]);
      setSubtasks([]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Título da tarefa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <PrioritySelect
          value={priority}
          onChange={setPriority}
        />

        <DatePicker
          label="Data de vencimento"
          value={dueDate}
          onChange={setDueDate}
        />

        <DatePicker
          label="Lembrete"
          value={reminder}
          onChange={setReminder}
        />
      </div>

      <TagManager
        selectedTags={tags}
        onTagsChange={setTags}
      />

      <SubTaskManager
        selectedSubTasks={subtasks}
        onSubTasksChange={setSubtasks}
      />

      <Button
        type="submit"
        disabled={!title.trim()}
        className="w-full"
      >
        Adicionar Tarefa
      </Button>
    </form>
  );
}
