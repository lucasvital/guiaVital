import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus } from 'lucide-react';
import { ShareList } from './ShareList';
import { ListItem } from './ListItem';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';

interface ListManagerProps {
  onSelectList: (listId: string | null) => void;
  selectedListId: string | null;
}

interface TodoList {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
}

interface FirestoreList {
  title: string;
  userId: string;
  createdAt: Timestamp;
}

export function ListManager({ onSelectList, selectedListId }: ListManagerProps) {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [newListTitle, setNewListTitle] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'lists'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedLists: TodoList[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreList;
        loadedLists.push({
          id: doc.id,
          title: data.title,
          userId: data.userId,
          createdAt: data.createdAt.toDate(),
        });
      });
      setLists(loadedLists);
    });

    return () => unsubscribe();
  }, [user]);

  const createList = async () => {
    if (!user || !newListTitle.trim()) return;

    try {
      await addDoc(collection(db, 'lists'), {
        title: newListTitle.trim(),
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      setNewListTitle('');
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'lists', listId));
      if (selectedListId === listId) {
        onSelectList(null);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const shareList = async (listId: string, email: string, permission: 'read' | 'write' | 'admin' = 'read') => {
    if (!user) return;

    try {
      const listRef = doc(db, 'lists', listId);
      await updateDoc(listRef, {
        sharedWith: arrayUnion({
          email,
          permission,
          addedAt: Timestamp.now(),
          addedBy: user.uid,
        }),
      });

      await addDoc(collection(db, 'notifications'), {
        type: 'LIST_SHARE',
        listId,
        toEmail: email,
        fromUserId: user.uid,
        permission,
        createdAt: Timestamp.now(),
        read: false,
      });
    } catch (error) {
      console.error('Error sharing list:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nova lista..."
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createList()}
        />
        <Button onClick={createList} disabled={!newListTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {lists.map((list) => (
          <ListItem
            key={list.id}
            list={list}
            selected={selectedListId === list.id}
            onSelect={onSelectList}
            onDelete={deleteList}
            onShare={(list) => (
              <ShareList
                listId={list.id}
                onShare={shareList}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}
