import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Priority } from '../types/todo';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  reminder?: Date;
  priority: Priority;
  listId?: string;
  categoryId?: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  subtasks: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface FirestoreTodo {
  text: string;
  description?: string;
  completed: boolean;
  dueDate?: Timestamp;
  reminder?: Timestamp;
  priority: Priority;
  list?: string;
  categoryId?: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  subTasks: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const convertFirestoreToTodo = (doc: DocumentData): Todo => {
  const data = doc.data();
  console.log('Converting Firestore doc:', doc.id, data);
  
  return {
    id: doc.id,
    title: data.text || '', 
    description: data.description || '',
    completed: data.completed || false,
    dueDate: data.dueDate?.toDate() || null,
    reminder: data.reminder?.toDate() || null,
    priority: data.priority || 'MEDIUM',
    listId: data.list || null, 
    categoryId: data.categoryId || null,
    tags: data.tags || [],
    subtasks: data.subTasks || [], 
    userId: data.ownerId || '', 
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || null,
  };
};

const convertTodoToFirestore = (todo: Partial<Todo>): Partial<FirestoreTodo> => {
  console.log('Converting todo to Firestore:', todo);
  
  const firestoreTodo: Partial<FirestoreTodo> = {
    text: todo.title || '', 
    description: todo.description,
    completed: todo.completed || false,
    priority: todo.priority || 'MEDIUM',
    ownerId: todo.userId, 
    list: todo.listId, 
    subTasks: todo.subtasks || [], 
    tags: todo.tags || [],
    createdAt: todo.createdAt ? Timestamp.fromDate(todo.createdAt) : Timestamp.now(),
  };

  if (todo.dueDate) {
    firestoreTodo.dueDate = Timestamp.fromDate(todo.dueDate);
  }
  if (todo.reminder) {
    firestoreTodo.reminder = Timestamp.fromDate(todo.reminder);
  }
  if (todo.updatedAt) {
    firestoreTodo.updatedAt = Timestamp.fromDate(todo.updatedAt);
  }
  
  return firestoreTodo;
};

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Primeiro, buscar as listas compartilhadas com o usuário
    const listsRef = collection(db, 'lists');
    const listsQuery = query(
      listsRef,
      where('sharedWith', 'array-contains', { email: user.email, permission: 'read' })
    );

    // Buscar IDs das listas compartilhadas
    const unsubscribeLists = onSnapshot(listsQuery, async (listsSnapshot) => {
      // Buscar todas as listas compartilhadas (read, write, admin)
      const sharedListsQuery = query(
        collection(db, 'lists'),
        where('sharedWith', 'array-contains', { email: user.email })
      );

      const sharedListsSnapshot = await getDocs(sharedListsQuery);
      const sharedListIds = sharedListsSnapshot.docs.map(doc => doc.id);

      console.log('IDs das listas compartilhadas:', sharedListIds);

      // Query para tarefas próprias do usuário
      const ownTodosQuery = query(
        collection(db, 'todos'),
        where('ownerId', '==', user.uid)
      );

      // Query para tarefas das listas compartilhadas
      const sharedTodosQuery = query(
        collection(db, 'todos'),
        where('list', 'in', sharedListIds.length > 0 ? sharedListIds : ['no-lists'])
      );

      // Combinar os resultados das duas queries
      const unsubscribeOwnTodos = onSnapshot(
        ownTodosQuery,
        (ownTodosSnapshot) => {
          const unsubscribeSharedTodos = onSnapshot(
            sharedTodosQuery,
            (sharedTodosSnapshot) => {
              console.log('Tarefas próprias encontradas:', ownTodosSnapshot.docs.length);
              console.log('Tarefas compartilhadas encontradas:', sharedTodosSnapshot.docs.length);

              const ownTodos = ownTodosSnapshot.docs.map(doc => {
                const todo = convertFirestoreToTodo(doc);
                console.log('Tarefa própria:', todo);
                return todo;
              });

              const sharedTodos = sharedTodosSnapshot.docs.map(doc => {
                const todo = convertFirestoreToTodo(doc);
                console.log('Tarefa compartilhada:', todo);
                return todo;
              });

              // Combinar e remover duplicatas
              const allTodos = [...ownTodos, ...sharedTodos].filter((todo, index, self) =>
                index === self.findIndex((t) => t.id === todo.id)
              );

              console.log('Total de tarefas após combinar:', allTodos.length);
              setTodos(allTodos);
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching shared todos:', error);
              setError('Failed to load todos. Please try again later.');
              setLoading(false);
            }
          );

          return () => unsubscribeSharedTodos();
        },
        (error) => {
          console.error('Error fetching own todos:', error);
          setError('Failed to load todos. Please try again later.');
          setLoading(false);
        }
      );

      return () => {
        unsubscribeOwnTodos();
      };
    });

    return () => {
      unsubscribeLists();
    };
  }, [user]);

  const addTodo = async (todo: Partial<Todo>) => {
    if (!user) throw new Error('Must be logged in to add a todo');

    try {
      const firestoreTodo = convertTodoToFirestore({
        ...todo,
        userId: user.uid,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await addDoc(collection(db, 'todos'), firestoreTodo);
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  };

  const updateTodo = async (id: string, data: Partial<Todo>) => {
    if (!user) throw new Error('Must be logged in to update a todo');

    try {
      const todoRef = doc(db, 'todos', id);
      const firestoreTodo = convertTodoToFirestore({
        ...data,
        updatedAt: new Date(),
      });
      await updateDoc(todoRef, firestoreTodo);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete a todo');
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid todo ID');
    }

    try {
      const todoRef = doc(db, 'todos', id.trim());
      await deleteDoc(todoRef);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!user) throw new Error('Must be logged in to toggle a todo');

    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, { 
        completed,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
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
