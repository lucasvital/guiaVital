import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import { Share } from 'lucide-react';

interface ShareListDialogProps {
  listId: string;
  onShare: (email: string, permission: 'read' | 'write' | 'admin') => Promise<void>;
}

export function ShareListDialog({ listId, onShare }: ShareListDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!email) {
      setError('Por favor, insira um email');
      return;
    }

    try {
      await onShare(email, permission);
      setEmail('');
      setPermission('read');
      setError(null);
      setIsOpen(false);
    } catch (error) {
      setError('Erro ao compartilhar lista');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar Lista</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email do usuário</label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="permission">Nível de permissão</label>
            <Select value={permission} onValueChange={(value: 'read' | 'write' | 'admin') => setPermission(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Leitura</SelectItem>
                <SelectItem value="write">Escrita</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleShare}>Compartilhar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
