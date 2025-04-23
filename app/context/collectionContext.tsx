// collectionContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CollectionContextType {
    collectionName: string;
    setCollectionName: (name: string) => void;
    previewImage: string | null;
    setPreviewImage: (image: string) => void;
    selectedOutfits: string[];
    setSelectedOutfits: React.Dispatch<React.SetStateAction<string[]>>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
    const [collectionName, setCollectionName] = useState<string>('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedOutfits, setSelectedOutfits] = useState<string[]>([]);

    return (
        <CollectionContext.Provider value={{ collectionName, setCollectionName, previewImage, setPreviewImage, selectedOutfits, setSelectedOutfits }}>
            {children}
        </CollectionContext.Provider>
    );
};

export const useCollectionContext = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollectionContext must be used within a CollectionProvider');
  }
  return context;
};