import React, { createContext, useContext } from 'react';

interface DemoContextType {
  isDemo: boolean;
}

const DemoContext = createContext<DemoContextType>({ isDemo: false });

export const DemoProvider: React.FC<{ children: React.ReactNode; isDemo: boolean }> = ({ children, isDemo }) => {
  return (
    <DemoContext.Provider value={{ isDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
