import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { List } from '../types/list';
import { useNotifications } from './useNotifications';
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
  DocumentData,
  getDoc,
} from 'firebase/firestore';

interface FirestoreList extends DocumentData {
  name: string;
  color: string;
  icon?: string;
  owner: string;
  sharedWith?: Array<{
    email: string;
    permission: 'read' | 'write' | 'admin';
    addedAt: Timestamp;
  }>;
  createdAt: Timestamp;
  todos?: any[];
}

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
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Busca todas as listas
    const q = query(
      collection(db, 'lists'),
      where('owner', '==', user.email)
    );

    // Busca listas compartilhadas
    const sharedQ = query(
      collection(db, 'lists'),
      where('sharedWith', 'array-contains', { email: user.email })
    );

    let allLists: List[] = [];

    // Inscreve-se para atualizações das listas do usuário
    const unsubscribeOwner = onSnapshot(q, 
      (snapshot) => {
        const ownerLists = snapshot.docs.map(doc => {
          const data = doc.data() as FirestoreList;
          return {
            id: doc.id,
            name: data.name,
            color: data.color,
            icon: data.icon,
            owner: data.owner,
            sharedWith: data.sharedWith?.map(share => ({
              ...share,
              addedAt: share.addedAt.toDate(),
            })) || [],
            createdAt: data.createdAt.toDate(),
            todos: data.todos || [],
          } as List;
        });
        allLists = [...ownerLists];
        setLists(allLists);
      },
      (error) => {
        console.error('Error fetching lists:', error);
        setError('Failed to load lists. Please try again later.');
        setLoading(false);
      }
    );

    // Inscreve-se para atualizações das listas compartilhadas
    const unsubscribeShared = onSnapshot(sharedQ,
      (snapshot) => {
        const sharedLists = snapshot.docs.map(doc => {
          const data = doc.data() as FirestoreList;
          return {
            id: doc.id,
            name: data.name,
            color: data.color,
            icon: data.icon,
            owner: data.owner,
            sharedWith: data.sharedWith?.map(share => ({
              ...share,
              addedAt: share.addedAt.toDate(),
            })) || [],
            createdAt: data.createdAt.toDate(),
            todos: data.todos || [],
          } as List;
        });
        allLists = [...allLists, ...sharedLists];
        setLists(allLists);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching shared lists:', error);
        setError('Failed to load lists. Please try again later.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeOwner();
      unsubscribeShared();
    };
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
      const listDoc = await getDoc(listRef);

      if (!listDoc.exists()) {
        throw new Error('Lista não encontrada');
      }

      const listData = listDoc.data() as FirestoreList;
      
      // Verifica se o usuário tem permissão para editar
      if (listData.owner !== user.email) {
        const share = listData.sharedWith?.find(s => s.email === user.email);
        if (!share || (share.permission !== 'write' && share.permission !== 'admin')) {
          throw new Error('Você não tem permissão para editar esta lista');
        }
      }

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
      const listRef = doc(db, 'lists', listId);
      const listDoc = await getDoc(listRef);

      if (!listDoc.exists()) {
        throw new Error('Lista não encontrada');
      }

      const listData = listDoc.data() as FirestoreList;
      
      // Verifica se o usuário tem permissão para excluir
      if (listData.owner !== user.email) {
        const share = listData.sharedWith?.find(s => s.email === user.email);
        if (!share || share.permission !== 'admin') {
          throw new Error('Você não tem permissão para excluir esta lista');
        }
      }

      await deleteDoc(listRef);
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  };

  const shareList = async (listId: string, email: string, permission: 'read' | 'write' | 'admin' = 'read') => {
    if (!user) throw new Error('Must be logged in to share a list');

    try {
      const listRef = doc(db, 'lists', listId);
      const listDoc = await getDoc(listRef);

      if (!listDoc.exists()) {
        throw new Error('Lista não encontrada');
      }

      const listData = listDoc.data() as FirestoreList;
      
      if (listData.owner !== user.email) {
        const share = listData.sharedWith?.find(s => s.email === user.email);
        if (!share || share.permission !== 'admin') {
          throw new Error('Você não tem permissão para compartilhar esta lista');
        }
      }

      if (email === user.email) {
        throw new Error('Você não pode compartilhar uma lista com você mesmo');
      }

      const sharedWith = listData.sharedWith || [];
      const existingShare = sharedWith.find(share => share.email === email);

      if (existingShare) {
        throw new Error('Esta lista já foi compartilhada com este usuário');
      }

      // Atualiza a lista com o novo compartilhamento
      await updateDoc(listRef, {
        sharedWith: arrayUnion({
          email,
          permission,
          addedAt: Timestamp.now(),
        }),
      });

      // Cria uma notificação para o usuário que recebeu o compartilhamento
      await createNotification({
        type: 'list_shared',
        title: 'Nova lista compartilhada',
        message: `${user.email} compartilhou a lista "${listData.name}" com você`,
        recipientEmail: email,
        data: {
          listId,
          senderId: user.uid,
        },
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
