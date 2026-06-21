import React from 'react';
import { DemoProvider } from '../context/DemoContext';
import { ControlPage } from './ControlPage';

export const DemoPage: React.FC = () => {
  return (
    <DemoProvider isDemo={true}>
      <ControlPage />
    </DemoProvider>
  );
};
