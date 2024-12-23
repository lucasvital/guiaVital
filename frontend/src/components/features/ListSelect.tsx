import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { List } from '../../types/todo';
import {
  collection,
  query,
  where,
  onSnapshot,
  CollectionReference,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ListSelectProps {
  value: string;
  onChange: (value: string) => void;
}

interface FirestoreList {
  name: string;
  color: string;
  icon?: string;
  createdBy: string;
  owner: string;
  sharedWith: string[];
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  todos: any[];
}

export function ListSelect({ value, onChange }: ListSelectProps) {
  const [lists, setLists] = useState<List[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const listsRef = collection(db, 'lists') as CollectionReference<FirestoreList>;
    const q = query(
      listsRef,
      where('owner', '==', user.uid)
    );

    const unsubscribe = onSnapshot<FirestoreList, DocumentData>(q, (snapshot: QuerySnapshot<FirestoreList>) => {
      const listsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          color: data.color,
          icon: data.icon,
          createdBy: data.createdBy,
          owner: data.owner || user.uid,
          sharedWith: data.sharedWith || [],
          members: data.members || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
          todos: data.todos || [],
        };
      });
      setLists(listsData);
    });

    return () => unsubscribe();
  }, [user]);

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
