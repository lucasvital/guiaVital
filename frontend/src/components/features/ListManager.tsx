import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { List } from '../../types/list';
import { ListCard } from './ListCard';
import { useLists } from '../../hooks/useLists';
import { EmojiPicker } from './EmojiPicker';

interface ListManagerProps {
  selectedListId?: string | null;
  onSelectList?: (listId: string) => void;
}

export function ListManager({ selectedListId, onSelectList }: ListManagerProps) {
  const { lists, loading, error, createList, updateList, deleteList, shareList } = useLists();
  const [showNewList, setShowNewList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#2563eb');
  const [newListIcon, setNewListIcon] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName) return;

    try {
      await createList(newListName, newListColor, newListIcon);
      setNewListName('');
      setNewListColor('#2563eb');
      setNewListIcon('');
      setShowNewList(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDelete = async (listId: string) => {
    try {
      await deleteList(listId);
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleShare = async (listId: string, email: string, permission: 'read' | 'write' | 'admin') => {
    try {
      await shareList(listId, email, permission);
    } catch (error) {
      console.error('Error sharing list:', error);
    }
  };

  const filteredLists = lists.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Erro ao carregar listas: {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar listas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setShowNewList(true)}>Nova Lista</Button>
      </div>

      <div className="grid gap-4">
        {filteredLists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onSelect={onSelectList || (() => {})}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showNewList && (
        <Dialog open={true} onOpenChange={() => setShowNewList(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Lista</DialogTitle>
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ícone (opcional)
                </label>
                <EmojiPicker value={newListIcon} onChange={setNewListIcon} />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Criar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
