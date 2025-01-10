import { List } from '../../types/list';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MoreVertical, Trash, Share2, User2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ShareListDialog } from './ShareListDialog';
import { useLists } from '../../hooks/useLists';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface ListCardProps {
  list: List;
  onSelect: (listId: string) => void;
  onDelete: (listId: string) => void;
}

export function ListCard({ list, onSelect, onDelete }: ListCardProps) {
  const { user } = useAuth();
  const { shareList } = useLists();
  const [showShareDialog, setShowShareDialog] = useState(false);

  const isOwner = user?.email === list.owner;
  const isShared = list.sharedWith?.some(share => share.email === user?.email);

  console.log('ListCard rendering:', {
    listId: list.id,
    listName: list.name,
    owner: list.owner,
    userEmail: user?.email,
    isOwner,
    isShared,
    sharedWith: list.sharedWith
  });

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50" 
      onClick={() => onSelect(list.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: list.color }} 
            />
            {list.name}
          </div>
        </CardTitle>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isOwner && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                setShowShareDialog(true);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(list.id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {!isOwner && (
            <div className="flex items-center gap-2">
              <User2 className="h-3 w-3" />
              <span>Compartilhado por {list.owner}</span>
            </div>
          )}
          {isOwner && list.sharedWith?.length > 0 && (
            <div className="flex items-center gap-2">
              <User2 className="h-3 w-3" />
              <span>Compartilhado com {list.sharedWith.length} usuário(s)</span>
            </div>
          )}
        </div>
      </CardContent>
      {showShareDialog && (
        <ShareListDialog 
          listId={list.id}
          onShare={async (email, permission) => {
            console.log('Sharing list:', list.id, 'with:', email, 'permission:', permission);
            await shareList(list.id, email, permission);
            setShowShareDialog(false);
          }}
          onOpenChange={setShowShareDialog}
          open={showShareDialog}
        />
      )}
    </Card>
  );
}
