import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { List, ListMember } from '../types/list';

interface FirestoreList {
  name: string;
  color: string;
  icon?: string;
  createdBy: string;
  members: ListMember[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  todos: string[]; // Array of todo IDs
}

const convertFirestoreToList = (doc: DocumentData): List => {
  const data = doc.data() as FirestoreList;
  return {
    id: doc.id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    createdBy: data.createdBy,
    members: data.members || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    todos: [], // Fetch todos separately if needed
  };
};

const convertListToFirestore = (list: Partial<List>): Partial<FirestoreList> => {
  const { id, todos, ...rest } = list;
  
  // Convert todos array to array of IDs if present
  const todoIds = todos?.map(todo => todo.id);
  
  const firestoreList: Partial<FirestoreList> = {
    ...rest,
    todos: todoIds,
    updatedAt: Timestamp.now(),
  };
  
  return firestoreList;
};

export function useLists() {
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

    const q = query(
      collection(db, 'lists'),
      where('members', 'array-contains', { userId: user.uid })
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const listsData = querySnapshot.docs.map(convertFirestoreToList);
        setLists(listsData);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addList = async (name: string, color: string, icon?: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const member: ListMember = {
        userId: user.uid,
        email: user.email!,
        permission: 'admin'
      };

      const listData: FirestoreList = {
        name,
        color,
        icon,
        createdBy: user.uid,
        members: [member],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        todos: [],
      };

      await addDoc(collection(db, 'lists'), listData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error creating list');
      }
      throw error;
    }
  };

  const updateList = async (id: string, list: Partial<List>) => {
    try {
      const listRef = doc(db, 'lists', id);
      await updateDoc(listRef, convertListToFirestore(list));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error updating list');
      }
      throw error;
    }
  };

  const deleteList = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'lists', id));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error deleting list');
      }
      throw error;
    }
  };

  return {
    lists,
    loading,
    error,
    addList,
    updateList,
    deleteList,
  };
}
