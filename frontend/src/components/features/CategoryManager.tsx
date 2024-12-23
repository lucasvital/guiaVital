import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, X } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Category {
  id: string;
  name: string;
  userId: string;
  color: string;
}

interface CategoryData extends DocumentData {
  name: string;
  userId: string;
  color: string;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
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
          color: data.color || generateRandomColor() // Fornece uma cor padrão se não existir
        });
      });
      setCategories(loadedCategories);
    });

    return () => unsubscribe();
  }, [user]);

  const addCategory = async () => {
    if (!user || !newCategory.trim()) return;

    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        userId: user.uid,
        color: generateRandomColor()
      });
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      console.error('Error removing category:', error);
    }
  };

  const generateRandomColor = () => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nova categoria..."
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
        />
        <Button onClick={addCategory} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className={`flex items-center gap-1 ${category.color}`}
          >
            {category.name}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeCategory(category.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
