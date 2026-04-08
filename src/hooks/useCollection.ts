import { useEffect, useState } from 'react';
import { CollectedAnimal, AnimalCategory } from '../types/animal';
import { subscribeToUserAnimals } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export function useCollection(category: AnimalCategory | null = null) {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<CollectedAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAnimals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserAnimals(user.uid, category, (data) => {
      setAnimals(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user, category]);

  return { animals, loading };
}
