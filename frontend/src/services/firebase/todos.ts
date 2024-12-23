import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  FirestoreError,
  FieldValue,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Todo, Priority } from '../../types/todo';

interface FirestoreTodo {
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Timestamp;
  reminder?: Timestamp;
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
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp;
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
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

const convertTodoToFirestore = (todo: Partial<Todo>): Partial<FirestoreTodo> => {
  const firestoreTodo: Partial<FirestoreTodo> = {
    ...todo,
    dueDate: todo.dueDate ? Timestamp.fromDate(todo.dueDate) : undefined,
    reminder: todo.reminder ? Timestamp.fromDate(todo.reminder) : undefined,
    createdAt: todo.createdAt ? Timestamp.fromDate(todo.createdAt) : serverTimestamp(),
    updatedAt: Timestamp.now(),
  };

  // Remove id as it's stored separately
  delete (firestoreTodo as any).id;
  
  return firestoreTodo;
};

export const todosCollection = collection(db, 'todos');

export const subscribeTodos = (
  userId: string | undefined,
  onTodosUpdate: (todos: Todo[]) => void,
  onError: (error: FirestoreError) => void
) => {
  if (!userId) {
    onTodosUpdate([]);
    return () => {};
  }

  try {
    const q = query(
      todosCollection,
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const todos = snapshot.docs.map(convertFirestoreToTodo);
        onTodosUpdate(todos);
      },
      onError
    );
  } catch (error) {
    onError(error as FirestoreError);
    return () => {};
  }
};

export const getTodos = async (userId: string): Promise<Todo[]> => {
  const q = query(collection(db, 'todos'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertFirestoreToTodo);
};

export const addTodo = async (todo: Partial<Todo>): Promise<string> => {
  const todoRef = await addDoc(collection(db, 'todos'), convertTodoToFirestore(todo));
  return todoRef.id;
};

export const updateTodo = async (id: string, todo: Partial<Todo>): Promise<void> => {
  const todoRef = doc(db, 'todos', id);
  await updateDoc(todoRef, convertTodoToFirestore(todo));
};

export const deleteTodo = async (id: string): Promise<void> => {
  const todoRef = doc(db, 'todos', id);
  await deleteDoc(todoRef);
};

export const sortTodos = (todos: Todo[]) => {
  return [...todos].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return b.dueDate.getTime() - a.dueDate.getTime();
  });
};
