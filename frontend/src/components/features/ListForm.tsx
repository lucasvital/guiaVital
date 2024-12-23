import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChromePicker } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../../contexts/AuthContext';
import { List } from '../../types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ListFormProps {
  onSubmit?: (list: List) => void;
  onCancel?: () => void;
}

export function ListForm({ onSubmit, onCancel }: ListFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [emoji, setEmoji] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'editor' | 'reader'>('editor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newList = {
        name,
        color,
        emoji,
        ownerId: user.uid,
        members: members.map(email => ({
          email,
          role: memberRole,
          joinedAt: serverTimestamp(),
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'lists'), newList);
      
      if (onSubmit) {
        onSubmit({
          ...newList,
          id: docRef.id,
          members: members.map(email => ({
            email,
            role: memberRole,
            userId: '', // This will be updated when the user accepts the invitation
            joinedAt: new Date(),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const addMember = () => {
    if (memberEmail && !members.includes(memberEmail)) {
      setMembers([...members, memberEmail]);
      setMemberEmail('');
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(m => m !== email));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Lista</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <div>
          <Label>Cor</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-[100px] h-[40px]"
                style={{ backgroundColor: color }}
              >
                &nbsp;
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <ChromePicker
                color={color}
                onChange={(color) => setColor(color.hex)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Emoji</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-[100px] h-[40px]"
              >
                {emoji || 'Selecionar'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <EmojiPicker
                onEmojiClick={(emojiData) => setEmoji(emojiData.emoji)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label>Membros</Label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="Email do membro"
          />
          <select
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as 'admin' | 'editor' | 'reader')}
            className="border rounded px-2"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="reader">Leitor</option>
          </select>
          <Button type="button" onClick={addMember}>
            Adicionar
          </Button>
        </div>
        <div className="mt-2">
          {members.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between bg-gray-100 p-2 rounded mt-1"
            >
              <span>{email}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMember(email)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
