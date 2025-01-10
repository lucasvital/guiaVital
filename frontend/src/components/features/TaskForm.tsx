import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useLists } from '../../hooks/useLists';
import { useAuth } from '../../contexts/AuthContext';
import { Priority, Todo } from '../../types/todo';
import { serverTimestamp } from 'firebase/firestore';

interface TaskFormProps {
  onSubmit: (task: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [listId, setListId] = useState<string>('');
  const { lists } = useLists();
  const { user } = useAuth();

  // Filtrar apenas listas que o usuário pode editar
  const editableLists = lists.filter(list => {
    const isOwner = list.owner === user?.email;
    const share = list.sharedWith?.find(s => s.email === user?.email);
    return isOwner || (share && (share.permission === 'write' || share.permission === 'admin'));
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !title.trim() || !listId) return;

    const task: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      completed: false,
      dueDate,
      priority,
      listId,
      userId: user.uid,
      tags: [],
      subtasks: [],
    };

    onSubmit(task);
    
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority('MEDIUM');
    setListId('');

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Input
          type="text"
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Select 
          value={listId} 
          onValueChange={(value: string) => setListId(value)}
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
      <div className="grid gap-2">
        <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Baixa</SelectItem>
            <SelectItem value="MEDIUM">Média</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Data de vencimento</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date: Date | undefined) => setDueDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button type="submit" className="w-full">
        Adicionar Tarefa
      </Button>
    </form>
  );
}
