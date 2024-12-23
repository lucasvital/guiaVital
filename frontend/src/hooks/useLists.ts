import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { List } from '../types/list';
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
  Timestamp,
} from 'firebase/firestore';

interface UseListsReturn {
  lists: List[];
  loading: boolean;
  error: string | null;
  createList: (name: string, color: string, icon: string) => Promise<void>;
  updateList: (listId: string, data: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  shareList: (listId: string, email: string, permission?: 'read' | 'write' | 'admin') => Promise<void>;
}

export function useLists(): UseListsReturn {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'lists'),
      where('owner', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const listsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            color: data.color,
            icon: data.icon,
            owner: data.owner,
            sharedWith: data.sharedWith?.map((share: any) => ({
              ...share,
              addedAt: share.addedAt?.toDate(),
            })) || [],
            createdAt: data.createdAt?.toDate(),
            todos: data.todos || [],
          } as List;
        });
        setLists(listsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching lists:', error);
        setError('Failed to load lists. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createList = async (name: string, color: string, icon: string) => {
    if (!user) throw new Error('Must be logged in to create a list');

    try {
      await addDoc(collection(db, 'lists'), {
        name,
        color,
        icon,
        owner: user.email,
        sharedWith: [],
        createdAt: Timestamp.now(),
        todos: [],
      });
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  };

  const updateList = async (listId: string, data: Partial<List>) => {
    if (!user) throw new Error('Must be logged in to update a list');

    try {
      const listRef = doc(db, 'lists', listId);
      await updateDoc(listRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) throw new Error('Must be logged in to delete a list');

    try {
      await deleteDoc(doc(db, 'lists', listId));
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };

  const shareList = async (listId: string, email: string, permission: 'read' | 'write' | 'admin' = 'read') => {
    if (!user) throw new Error('Must be logged in to share a list');

    try {
      const listRef = doc(db, 'lists', listId);
      await updateDoc(listRef, {
        sharedWith: arrayUnion({
          email,
          permission,
          addedAt: Timestamp.now(),
          addedBy: user.email,
        }),
      });
    } catch (error) {
      console.error('Error sharing list:', error);
      throw error;
    }
  };

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    shareList,
  };
}
