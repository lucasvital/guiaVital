import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { List } from '../types/list';
import { useNotifications } from './useNotifications';

interface FirestoreList {
  name: string;
  color: string;
  icon?: string;
  owner: string;
  sharedWith: {
    email: string;
    permission: 'read' | 'write' | 'admin';
    addedAt: Timestamp;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  todos?: any[];
  [key: string]: any; // Para campos dinâmicos como sharedWith_email
}

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (!user?.email) {
      setLists([]);
      setLoading(false);
      return;
    }

    const userEmail = user.email; // Garantir que o email é uma string

    const listsRef = collection(db, 'lists');

    // Query para listas onde o usuário é dono
    const ownerQuery = query(
      listsRef,
      where('owner', '==', userEmail)
    );

    // Query para listas compartilhadas usando o campo específico do usuário
    const userEmailKey = `sharedWith_${userEmail.replace(/[.@]/g, '_')}`;
    const sharedQuery = query(
      listsRef,
      where(userEmailKey, '!=', null)
    );

    const unsubscribeOwner = onSnapshot(ownerQuery, (ownerSnapshot) => {
      const ownerLists = ownerSnapshot.docs.map(doc => {
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
            addedBy: data.owner,
          })) || [],
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt?.toDate() || data.createdAt.toDate(),
          todos: data.todos || [],
        } as List;
      });

      const unsubscribeShared = onSnapshot(sharedQuery, (sharedSnapshot) => {
        const sharedLists = sharedSnapshot.docs.map(doc => {
          const data = doc.data() as FirestoreList;
          const userShareData = data[userEmailKey];
          
          // Garantir que o usuário atual está na lista sharedWith
          const sharedWith = data.sharedWith || [];
          if (userShareData && !sharedWith.some(s => s.email === userEmail)) {
            sharedWith.push({
              email: userEmail,
              permission: userShareData.permission,
              addedAt: userShareData.addedAt,
            });
          }

          return {
            id: doc.id,
            name: data.name,
            color: data.color,
            icon: data.icon,
            owner: data.owner,
            sharedWith: sharedWith.map(share => ({
              email: share.email,
              permission: share.permission,
              addedAt: share.addedAt.toDate(),
              addedBy: data.owner,
            })),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate() || data.createdAt.toDate(),
            todos: data.todos || [],
          } as List;
        });

        const allLists = [...ownerLists, ...sharedLists]
          .filter((list, index, self) => 
            index === self.findIndex((t) => t.id === list.id)
          );

        setLists(allLists);
        setLoading(false);
      });

      return () => unsubscribeShared();
    });

    return () => unsubscribeOwner();
  }, [user?.email]);

  const createList = async (name: string, color: string, icon?: string) => {
    if (!user?.email) throw new Error('Must be logged in to create a list');

    const newList: Omit<FirestoreList, 'createdAt' | 'updatedAt'> = {
      name,
      color,
      icon,
      owner: user.email,
      sharedWith: [],
      todos: [],
    };

    const docRef = await addDoc(collection(db, 'lists'), {
      ...newList,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const updateList = async (id: string, data: Partial<List>) => {
    const listRef = doc(db, 'lists', id);
    await updateDoc(listRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteList = async (id: string) => {
    const listRef = doc(db, 'lists', id);
    await deleteDoc(listRef);
  };

  const shareList = async (listId: string, email: string, permission: 'read' | 'write' | 'admin' = 'read') => {
    if (!user?.email) throw new Error('Must be logged in to share a list');

    const listRef = doc(db, 'lists', listId);
    const shareData = {
      email,
      permission,
      addedAt: serverTimestamp(),
    };

    // Criar campo específico para o usuário (para queries mais eficientes)
    const userEmailKey = `sharedWith_${email.replace(/[.@]/g, '_')}`;

    // Adicionar ao array sharedWith e criar campo específico
    await updateDoc(listRef, {
      sharedWith: arrayUnion(shareData),
      [userEmailKey]: shareData,
    });

    // Criar notificação para o usuário
    await createNotification({
      type: 'list_shared',
      title: 'Nova lista compartilhada',
      message: `${user.email} compartilhou uma lista com você`,
      recipientEmail: email,
      data: {
        listId,
        senderId: user.uid,
      },
    });
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
