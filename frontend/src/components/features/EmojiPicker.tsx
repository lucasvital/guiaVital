import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

const EMOJIS = ['📝', '📅', '🏠', '🛒', '💼', '🎮', '🎵', '📚', '✈️', '🎨', '🏃', '⚫'];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          <span className="text-lg">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="flex flex-wrap items-center p-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className={`text-base p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                value === emoji ? 'bg-slate-100 dark:bg-slate-800' : ''
              }`}
              onClick={() => {
                onChange(emoji);
                setIsOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
