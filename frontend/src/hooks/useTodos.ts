import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Todo, Priority } from '../types/todo';

interface FirestoreTodo {
  title: string;
  description?: string;
  completed: boolean;
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
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  dueDate?: Timestamp;
  reminder?: Timestamp;
}

const convertFirestoreToTodo = (doc: DocumentData): Todo => {
  const data = doc.data() as FirestoreTodo;
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    completed: data.completed,
    priority: data.priority,
    dueDate: data.dueDate?.toDate(),
    reminder: data.reminder?.toDate(),
    listId: data.listId,
    categoryId: data.categoryId,
    tags: data.tags || [],
    subtasks: data.subtasks || [],
    userId: data.userId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

const convertTodoToFirestore = (todo: Partial<Todo>): Partial<FirestoreTodo> => {
  const firestoreTodo: Partial<FirestoreTodo> = {
    ...todo,
    dueDate: todo.dueDate ? Timestamp.fromDate(todo.dueDate) : undefined,
    reminder: todo.reminder ? Timestamp.fromDate(todo.reminder) : undefined,
    createdAt: todo.createdAt ? Timestamp.fromDate(todo.createdAt) : Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Remove id as it's stored separately
  delete (firestoreTodo as any).id;
  
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

    const q = query(
      collection(db, 'todos'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const todosData = querySnapshot.docs.map(convertFirestoreToTodo);
        setTodos(todosData);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTodo = async (todo: Partial<Todo>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const todoData = {
        ...convertTodoToFirestore(todo),
        userId: user.uid,
        completed: false,
        priority: todo.priority || 'medium',
        tags: todo.tags || [],
        subtasks: todo.subtasks || [],
      };

      await addDoc(collection(db, 'todos'), todoData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error adding todo');
      }
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        completed,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error updating todo');
      }
    }
  };

  const updateTodo = async (id: string, todo: Partial<Todo>) => {
    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, convertTodoToFirestore(todo));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error updating todo');
      }
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error deleting todo');
      }
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  };
}
