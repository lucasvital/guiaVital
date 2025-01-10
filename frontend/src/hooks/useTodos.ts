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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Todo } from '../types/todo';
import { useLists } from './useLists';

interface FirestoreTodo {
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Timestamp;
  priority: string;
  listId?: string;
  userId: string;
  tags: any[];
  subtasks: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { lists } = useLists();

  useEffect(() => {
    if (!user?.email) {
      setTodos([]);
      setLoading(false);
      return;
    }

    // Get all lists that the user has access to
    const accessibleListIds = lists
      .filter(list => {
        const isOwner = list.owner === user.email;
        const share = list.sharedWith?.find(s => s.email === user.email);
        // Incluir todas as listas que o usuário tem acesso (read, write ou admin)
        return isOwner || share;
      })
      .map(list => list.id);

    if (accessibleListIds.length === 0) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'todos'),
      where('listId', 'in', accessibleListIds)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreTodo;
        return {
          id: doc.id,
          title: data.title,
          description: data.description || '',
          completed: data.completed,
          dueDate: data.dueDate?.toDate(),
          priority: data.priority,
          listId: data.listId,
          userId: data.userId,
          tags: data.tags || [],
          subtasks: data.subtasks || [],
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Todo;
      });

      setTodos(todosData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.email, lists]);

  const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.email) throw new Error('Must be logged in to add a todo');

    // Verificar permissão para adicionar na lista
    const list = lists.find(l => l.id === todo.listId);
    if (!list) throw new Error('Lista não encontrada');

    const isOwner = list.owner === user.email;
    const share = list.sharedWith?.find(s => s.email === user.email);
    if (!isOwner && (!share || share.permission === 'read')) {
      throw new Error('Você não tem permissão para adicionar tarefas nesta lista');
    }

    const todoData = {
      ...todo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'todos'), todoData);
    return docRef.id;
  };

  const updateTodo = async (id: string, data: Partial<Todo>) => {
    if (!user?.email) throw new Error('Must be logged in to update a todo');

    const todo = todos.find(t => t.id === id);
    if (!todo) throw new Error('Tarefa não encontrada');

    // Verificar permissão para editar na lista
    const list = lists.find(l => l.id === todo.listId);
    if (!list) throw new Error('Lista não encontrada');

    const isOwner = list.owner === user.email;
    const share = list.sharedWith?.find(s => s.email === user.email);
    if (!isOwner && (!share || share.permission === 'read')) {
      throw new Error('Você não tem permissão para editar tarefas nesta lista');
    }

    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteTodo = async (id: string) => {
    if (!user?.email) throw new Error('Must be logged in to delete a todo');

    const todo = todos.find(t => t.id === id);
    if (!todo) throw new Error('Tarefa não encontrada');

    // Verificar permissão para excluir na lista
    const list = lists.find(l => l.id === todo.listId);
    if (!list) throw new Error('Lista não encontrada');

    const isOwner = list.owner === user.email;
    const share = list.sharedWith?.find(s => s.email === user.email);
    if (!isOwner && (!share || share.permission === 'read')) {
      throw new Error('Você não tem permissão para excluir tarefas nesta lista');
    }

    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
  };

  const toggleTodo = async (id: string) => {
    if (!user?.email) throw new Error('Must be logged in to toggle a todo');

    const todo = todos.find(t => t.id === id);
    if (!todo) throw new Error('Tarefa não encontrada');

    // Verificar permissão para editar na lista
    const list = lists.find(l => l.id === todo.listId);
    if (!list) throw new Error('Lista não encontrada');

    const isOwner = list.owner === user.email;
    const share = list.sharedWith?.find(s => s.email === user.email);
    if (!isOwner && (!share || share.permission === 'read')) {
      throw new Error('Você não tem permissão para editar tarefas nesta lista');
    }

    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, {
      completed: !todo.completed,
      updatedAt: serverTimestamp(),
    });
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  };
}
