import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RatingData } from '../types';

interface DataContextType {
  data: RatingData | null;
  loading: boolean;
  error: string | null;
  updateData: (newData: RatingData) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if there's a draft in localStorage (for admin preview)
        const draft = localStorage.getItem('rating_data_draft');
        if (draft) {
          setData(JSON.parse(draft));
          setLoading(false);
          return;
        }

        const response = await fetch('/data/rating.json');
        if (!response.ok) {
          throw new Error('Failed to load rating data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = useCallback((newData: RatingData) => {
    setData(newData);
    localStorage.setItem('rating_data_draft', JSON.stringify(newData));
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error, updateData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
