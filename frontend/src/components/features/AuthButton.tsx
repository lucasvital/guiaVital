import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MouseEvent } from 'react';

export function AuthButton() {
  const { user, signInWithGoogle, signOut } = useAuth();

  const handleSignIn = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" onClick={handleSignIn}>
        <LogIn className="mr-2 h-4 w-4" />
        Entrar com Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserAvatar user={user} showUploadButton={false} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
