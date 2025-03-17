import React, { createContext, useContext, useState, ReactNode } from "react";

type UploadContextType = {
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  selectedOccasions: string[];
  setSelectedOccasions: React.Dispatch<React.SetStateAction<string[]>>;
};

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  return (
    <UploadContext.Provider
      value={{ selectedBrands, setSelectedBrands, selectedOccasions, setSelectedOccasions }}
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
