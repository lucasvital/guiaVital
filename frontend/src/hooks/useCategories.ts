import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { Category } from '../types/todo';

interface FirestoreCategory {
  name: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

const convertFirestoreToCategory = (doc: DocumentData): Category => {
  const data = doc.data() as FirestoreCategory;
  return {
    id: doc.id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    userId: data.userId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(convertFirestoreToCategory);
      setCategories(categoriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { categories, loading };
}
