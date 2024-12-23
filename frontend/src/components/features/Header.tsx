import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, LayoutDashboard, Timer, ListTodo } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { PomodoroTimer } from './PomodoroTimer';
import { ListManager } from './ListManager';
import { UserAvatar } from './UserAvatar';
import { NotificationBell } from './NotificationBell';
import { AuthButton } from './AuthButton';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showListManager, setShowListManager] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleSelectList = (listId: string | null) => {
    setSelectedListId(listId);
    setShowListManager(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => setShowPomodoro(true)}>
                  <Timer className="mr-2 h-4 w-4" />
                  Pomodoro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowListManager(true)}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Gerenciar Listas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span className="font-bold">TodoComplete</span>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {user && <NotificationBell />}
            <UserAvatar />
            <AuthButton />
          </nav>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showPomodoro} onOpenChange={setShowPomodoro}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pomodoro Timer</DialogTitle>
          </DialogHeader>
          <PomodoroTimer onClose={() => setShowPomodoro(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showListManager} onOpenChange={setShowListManager}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Listas</DialogTitle>
          </DialogHeader>
          <ListManager 
            selectedListId={selectedListId} 
            onSelectList={handleSelectList} 
            onClose={() => setShowListManager(false)}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
}
