import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { List } from '../../types/todo';
import {
  collection,
  query,
  where,
  onSnapshot,
  CollectionReference,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLists } from '../../hooks/useLists';

interface ListSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function ListSelect({ value, onChange, required = false }: ListSelectProps) {
  const { lists } = useLists();
  const { user } = useAuth();

  // Filtrar apenas listas que o usuário pode editar
  const editableLists = lists.filter(list => {
    const isOwner = list.owner === user?.email;
    const share = list.sharedWith?.find(s => s.email === user?.email);
    return isOwner || (share && (share.permission === 'write' || share.permission === 'admin'));
  });

  return (
    <Select value={value} onValueChange={onChange} required={required}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma lista" />
      </SelectTrigger>
      <SelectContent>
        {editableLists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: list.color }} 
              />
              {list.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
