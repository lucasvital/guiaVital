import { List } from '../../types/list';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MoreVertical, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ShareListDialog } from './ShareListDialog';
import { useLists } from '../../hooks/useLists';

interface ListCardProps {
  list: List;
  onSelect: (listId: string) => void;
  onDelete: (listId: string) => void;
}

export function ListCard({ list, onSelect, onDelete }: ListCardProps) {
  const { shareList } = useLists();

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
          <ShareListDialog 
            listId={list.id} 
            onShare={async (email, permission) => {
              await shareList(list.id, email, permission);
            }} 
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(list.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {list.sharedWith.length > 0 && (
            <p>{list.sharedWith.length} usuário(s) compartilhado(s)</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
