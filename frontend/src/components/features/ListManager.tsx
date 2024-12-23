import { Plus } from 'lucide-react';
import { useState } from 'react';
import { List } from '../../types/list';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { ListCard } from './ListCard';
import { useLists } from '../../hooks/useLists';
import { Todo } from '../../types/todo';
import { EmojiPicker } from './EmojiPicker';

interface ListManagerProps {
  onSelectList: (listId: string | null) => void;
  selectedListId: string | null;
  onClose?: () => void;
}

export function ListManager({ onSelectList, selectedListId, onClose }: ListManagerProps) {
  const { lists, loading, error, createList, updateList, deleteList, shareList } = useLists();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#2563eb'); // Azul por padrão
  const [newListIcon, setNewListIcon] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newListName.trim()) return;

    try {
      if (editingList) {
        await updateList(editingList.id, {
          name: newListName,
          color: newListColor,
          icon: newListIcon,
        });
      } else {
        await createList(newListName, newListColor, newListIcon);
      }

      setNewListName('');
      setNewListColor('#2563eb');
      setNewListIcon('');
      setEditingList(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving list:', error);
      alert('Erro ao salvar a lista. Por favor, tente novamente.');
    }
  };

  const handleEdit = (list: List) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListColor(list.color);
    setNewListIcon(list.icon || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (listId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta lista?')) {
      try {
        await deleteList(listId);
        if (selectedListId === listId) {
          onSelectList(null);
        }
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Erro ao excluir a lista. Por favor, tente novamente.');
      }
    }
  };

  const handleShare = async (listId: string) => {
    const email = window.prompt('Digite o email do usuário para compartilhar:');
    if (email) {
      try {
        await shareList(listId, email);
        alert('Lista compartilhada com sucesso!');
      } catch (error) {
        console.error('Error sharing list:', error);
        alert('Erro ao compartilhar a lista. Por favor, tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p>{error}</p>
        <Button 
          variant="link" 
          className="text-red-500 p-0 h-auto text-sm"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Minhas Listas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Lista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingList ? 'Editar Lista' : 'Nova Lista'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Nome
                </label>
                <Input
                  id="name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nome da lista"
                  required
                />
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium mb-1">
                  Cor
                </label>
                <Input
                  id="color"
                  type="color"
                  value={newListColor}
                  onChange={(e) => setNewListColor(e.target.value)}
                  className="h-10 p-1"
                />
              </div>
              <div>
                <label htmlFor="icon" className="block text-sm font-medium mb-1">
                  Ícone
                </label>
                <EmojiPicker value={newListIcon} onChange={setNewListIcon} />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  {editingList ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            selected={selectedListId === list.id}
            onSelect={() => onSelectList(list.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        ))}
      </div>
    </div>
  );
}
