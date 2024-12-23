import { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Upload } from 'lucide-react';

export interface UserAvatarProps {
  user: User;
  showUploadButton?: boolean;
  onUpload?: () => void;
}

export function UserAvatar({ user, showUploadButton = false, onUpload }: UserAvatarProps) {
  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  return (
    <div className="relative">
      <Avatar>
        <AvatarImage src={user.photoURL || undefined} alt={user.email || 'User'} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      {showUploadButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full"
          onClick={onUpload}
        >
          <Upload className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
