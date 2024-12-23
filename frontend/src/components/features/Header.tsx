import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { LayoutDashboard, BookTemplate, Timer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { PomodoroTimer } from './PomodoroTimer';
import { TaskTemplateButton } from './TaskTemplateButton';
import { UserAvatar } from './UserAvatar';
import { NotificationBell } from './NotificationBell';
import { AuthButton } from './AuthButton';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user } = useAuth();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleUseTemplate = () => {
    // Implementar lógica de template
    console.log('Usando template...');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              TodoComplete
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/docs"
            >
              Documentação
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/about"
            >
              Sobre
            </a>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {user && (
              <DropdownMenu open={showTemplates} onOpenChange={setShowTemplates}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <BookTemplate className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <TaskTemplateButton onUseTemplate={handleUseTemplate} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <nav className="flex items-center">
            {user ? (
              <UserAvatar user={user} />
            ) : (
              <AuthButton />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
