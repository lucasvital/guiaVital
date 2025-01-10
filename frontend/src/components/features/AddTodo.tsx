import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TagManager } from './TagManager';
import { SubTaskManager } from './SubTaskManager';
import { PrioritySelect } from './PrioritySelect';
import { DatePicker } from './DatePicker';
import { useAuth } from '../../contexts/AuthContext';
import { useLists } from '../../hooks/useLists';
import { db } from '../../config/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Todo, Tag, SubTask, Priority } from '../../types/todo';
import { Card, CardContent } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AddTodoProps {
  onClose?: () => void;
  listId?: string;
}

interface FirestoreTodo {
  completed: boolean;
  createdAt: Timestamp;
  dueDate: Timestamp | null;
  listId: string | null;
  ownerId: string;
  priority: Priority;
  reminder: Timestamp | null;
  subTasks: SubTask[];
  tags: Tag[];
  text: string;
}

export function AddTodo({ onClose, listId: defaultListId }: AddTodoProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(defaultListId || null);
  const { user } = useAuth();
  const { lists } = useLists();

  // Filtrar apenas listas que o usuário pode editar
  const editableLists = lists.filter(list => {
    const isOwner = list.owner === user?.email;
    const share = list.sharedWith?.find(s => s.email === user?.email);
    return isOwner || (share && (share.permission === 'write' || share.permission === 'admin'));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim() || !selectedListId) return;

    try {
      const firestoreTodo: FirestoreTodo = {
        text: text.trim(),
        completed: false,
        priority,
        tags,
        subTasks: subtasks,
        ownerId: user.uid,
        createdAt: Timestamp.now(),
        dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
        reminder: reminder ? Timestamp.fromDate(reminder) : null,
        listId: selectedListId,
      };

      await addDoc(collection(db, 'todos'), firestoreTodo);

      // Limpar o formulário e fechar
      setText('');
      setPriority('MEDIUM');
      setDueDate(null);
      setReminder(null);
      setTags([]);
      setSubtasks([]);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Erro ao criar tarefa. Por favor, tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Digite o título da tarefa..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Lista</Label>
          <Select 
            value={selectedListId || ''} 
            onValueChange={setSelectedListId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma lista" />
            </SelectTrigger>
            <SelectContent>
              {editableLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: list.color }} 
                    />
                    {list.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <PrioritySelect
              value={priority}
              onChange={setPriority}
            />
          </div>

          <div className="space-y-2">
            <Label>Data de vencimento</Label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Lembrete</Label>
          <DatePicker
            value={reminder}
            onChange={setReminder}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <TagManager
            tags={tags}
            onChange={setTags}
          />
        </div>

        <div className="space-y-2">
          <Label>Subtarefas</Label>
          <SubTaskManager
            subtasks={subtasks}
            onChange={setSubtasks}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Adicionar Tarefa</Button>
      </div>
    </form>
  );
}
