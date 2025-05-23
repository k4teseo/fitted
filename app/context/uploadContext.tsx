import React, { createContext, useContext, useState, ReactNode } from "react";

export type BrandTag = {
  id: string;
  brand: string;
  x: number;
  y: number;
};

type UploadContextType = {
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  selectedOccasions: string[];
  setSelectedOccasions: React.Dispatch<React.SetStateAction<string[]>>;
  brandTags: BrandTag[];
  setBrandTags: React.Dispatch<React.SetStateAction<BrandTag[]>>;
};

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [brandTags, setBrandTags] = useState<BrandTag[]>([]);

  return (
    <UploadContext.Provider
      value={{ selectedBrands, setSelectedBrands, selectedOccasions, setSelectedOccasions, brandTags, setBrandTags,  }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUploadContext = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUploadContext must be used within an UploadProvider");
  }
  return context;
};
