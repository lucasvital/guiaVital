import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { MouseEvent, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';

export function AuthButton() {
  console.log('AuthButton rendering...');
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  console.log('AuthButton hooks loaded, user:', user);

  useEffect(() => {
    console.log('AuthButton mounted, user state:', user);
  }, [user]);

  const handleSignIn = () => {
    console.log('Button clicked directly!');
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('Sign in successful:', result);
      })
      .catch((error) => {
        console.error('Sign in error:', error);
        alert(error.message);
      });
  };

  const handleSignOut = async (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      await signOut();
      console.log('Sign-out successful!');
    } catch (error) {
      console.error('Error signing out:', error);
      if (error instanceof Error) {
        alert(`Error signing out: ${error.message}`);
      } else {
        alert('An unknown error occurred while signing out');
      }
    }
  };

  console.log('Rendering AuthButton with user:', user);

  if (!user) {
    return (
      <Button 
        variant="outline" 
        onClick={handleSignIn}
      >
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
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === 'light' ? (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Modo Escuro</span>
            </>
          ) : (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Modo Claro</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
