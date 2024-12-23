import { useState, useEffect, useCallback } from 'react';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  CollectionReference,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { List } from '../../types/list';

interface ListSelectProps {
  value: string;
  onChange: (value: string) => void;
}

type ListData = {
  name: string;
  color: string;
  icon?: string;
  createdBy: string;
  members: List['members'];
  createdAt: List['createdAt'];
  updatedAt: List['updatedAt'];
  todos: List['todos'];
}

export function ListSelect({ value, onChange }: ListSelectProps) {
  const [lists, setLists] = useState<List[]>([]);
  const { user } = useAuth();

  const loadLists = useCallback(async () => {
    if (!user) return;

    const listsRef = collection(db, 'lists') as CollectionReference<ListData>;
    const q = query(
      listsRef,
      where('createdBy', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const loadedLists = querySnapshot.docs.map(doc => {
      const data = doc.data() as ListData;
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        createdBy: data.createdBy,
        members: data.members,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        todos: data.todos,
      };
    });

    setLists(loadedLists);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user, loadLists]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma lista" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No list</SelectItem>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            <div className="flex items-center gap-2">
              {list.icon && <span>{list.icon}</span>}
              <span style={{ color: list.color }}>{list.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
