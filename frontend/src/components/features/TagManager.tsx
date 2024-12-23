import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X } from 'lucide-react';
import { Tag } from '../../types/todo';

export interface TagManagerProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagManager({ tags, onChange }: TagManagerProps) {
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6'); // default blue color

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const tagName = newTag.trim().toLowerCase();
    if (!tags.some(tag => tag.name === tagName)) {
      const newTagObj: Tag = {
        id: crypto.randomUUID(),
        name: tagName,
        color: newColor
      };
      onChange([...tags, newTagObj]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(tags.filter(tag => tag.id !== tagId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Adicionar tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-12 p-1 h-10"
        />
        <Button 
          type="button"
          variant="outline"
          onClick={handleAddTag}
          disabled={!newTag.trim()}
        >
          Adicionar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="p-0.5 hover:bg-black/5 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
