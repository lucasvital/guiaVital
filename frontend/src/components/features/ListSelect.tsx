import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { List } from '../../types/list';
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
  owner: string;
  sharedWith?: Array<{
    email: string;
    permission: 'read' | 'write' | 'admin';
    addedAt: Timestamp;
    addedBy: string;
  }>;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  todos?: any[];
}

const convertFirestoreToList = (doc: DocumentData): List => {
  const data = doc.data() as FirestoreList;
  return {
    id: doc.id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    owner: data.owner,
    sharedWith: data.sharedWith?.map(share => ({
      email: share.email,
      permission: share.permission,
      addedAt: share.addedAt.toDate(),
      addedBy: share.addedBy
    })) || [],
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate() || data.createdAt.toDate(),
    todos: data.todos || [],
  };
};

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
    const readQuery = query(
      listsRef,
      where('sharedWith', 'array-contains', { 
        email: user.email,
        permission: 'read'
      })
    );

    const writeQuery = query(
      listsRef,
      where('sharedWith', 'array-contains', { 
        email: user.email,
        permission: 'write'
      })
    );

    const adminQuery = query(
      listsRef,
      where('sharedWith', 'array-contains', { 
        email: user.email,
        permission: 'admin'
      })
    );

    // Primeiro, busca as listas onde o usuário é dono
    const unsubscribeOwner = onSnapshot(ownerQuery, (ownerSnapshot) => {
      const ownerLists = ownerSnapshot.docs.map(convertFirestoreToList);

      // Depois, busca as listas compartilhadas
      const unsubscribeRead = onSnapshot(readQuery, (readSnapshot) => {
        const unsubscribeWrite = onSnapshot(writeQuery, (writeSnapshot) => {
          const unsubscribeAdmin = onSnapshot(adminQuery, (adminSnapshot) => {
            const readLists = readSnapshot.docs.map(convertFirestoreToList);
            const writeLists = writeSnapshot.docs.map(convertFirestoreToList);
            const adminLists = adminSnapshot.docs.map(convertFirestoreToList);

            // Combinar todas as listas e remover duplicatas
            const allLists = [...ownerLists, ...readLists, ...writeLists, ...adminLists]
              .filter((list, index, self) => 
                index === self.findIndex((t) => t.id === list.id)
              );

            setLists(allLists);
          });

          return () => unsubscribeAdmin();
        });

        return () => unsubscribeWrite();
      });

      return () => unsubscribeRead();
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
