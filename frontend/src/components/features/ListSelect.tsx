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

interface SharedUser {
  email: string;
  permission: string;
  addedAt: Timestamp;
}

interface FirestoreList {
  name: string;
  color: string;
  icon?: string;
  createdBy: string;
  owner: string;
  sharedWith: SharedUser[];
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
    
    // Query para listas que o usuário é dono
    const ownerQuery = query(
      listsRef,
      where('owner', 'in', [user.uid, user.email])
    );

    // Query para listas compartilhadas com o usuário
    const sharedQuery = query(
      listsRef,
      where('sharedWith', 'array-contains', { email: user.email, permission: 'read' })
    );

    // Combinar os resultados das duas queries
    const unsubscribeOwner = onSnapshot<FirestoreList, DocumentData>(ownerQuery, (ownerSnapshot) => {
      const unsubscribeShared = onSnapshot<FirestoreList, DocumentData>(sharedQuery, (sharedSnapshot) => {
        const ownerLists = ownerSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          color: doc.data().color,
          icon: doc.data().icon,
          createdBy: doc.data().createdBy,
          owner: doc.data().owner,
          sharedWith: doc.data().sharedWith || [],
          members: doc.data().members || [],
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate(),
          todos: doc.data().todos || [],
        }));

        const sharedLists = sharedSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          color: doc.data().color,
          icon: doc.data().icon,
          createdBy: doc.data().createdBy,
          owner: doc.data().owner,
          sharedWith: doc.data().sharedWith || [],
          members: doc.data().members || [],
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate(),
          todos: doc.data().todos || [],
        }));

        // Combinar e remover duplicatas
        const allLists = [...ownerLists, ...sharedLists];
        const uniqueLists = allLists.filter((list, index, self) =>
          index === self.findIndex((l) => l.id === list.id)
        );

        setLists(uniqueLists);
      });

      return () => unsubscribeShared();
    });

    return () => unsubscribeOwner();
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
