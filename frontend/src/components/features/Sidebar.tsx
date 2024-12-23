import { useState } from 'react';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PomodoroTimer } from './PomodoroTimer';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-background border-l w-[300px] p-6 pt-16 transform transition-transform duration-200 ease-in-out z-40 shadow-lg",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="space-y-6">
          {/* Pomodoro Timer */}
          <div className="space-y-2">
            <h3 className="font-semibold">Pomodoro Timer</h3>
            <PomodoroTimer />
          </div>

          {/* Podemos adicionar mais seções aqui no futuro */}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
