import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Category {
  id: string;
  name: string;
  userId: string;
  color?: string;
}

interface CategoryData extends DocumentData {
  name: string;
  userId: string;
  color?: string;
}

interface CategorySelectProps {
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

const NO_CATEGORY = 'no_category';

export function CategorySelect({ selectedCategory, onSelect }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedCategories: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as CategoryData;
        loadedCategories.push({
          id: doc.id,
          name: data.name,
          userId: data.userId,
          color: data.color
        });
      });
      setCategories(loadedCategories);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Select
      value={selectedCategory || NO_CATEGORY}
      onValueChange={(value) => onSelect(value === NO_CATEGORY ? null : value)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecionar categoria..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_CATEGORY} className="text-muted-foreground">
          Sem categoria
        </SelectItem>
        {categories.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id}
            className="flex items-center gap-2"
          >
            {category.color && (
              <div className={`w-2 h-2 rounded-full ${category.color}`} />
            )}
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
