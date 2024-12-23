import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Share } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ShareListProps {
  onShare: (listId: string, email: string, permission?: 'read' | 'write' | 'admin') => Promise<void>;
  listId: string;
}

export function ShareList({ onShare, listId }: ShareListProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;

    try {
      await onShare(listId, email.trim(), permission);
      setEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sharing list:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar Lista</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Permissão</label>
            <Select value={permission} onValueChange={(value: 'read' | 'write' | 'admin') => setPermission(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Leitura</SelectItem>
                <SelectItem value="write">Escrita</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleShare}
            disabled={!email.trim()}
            className="w-full"
          >
            Compartilhar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
