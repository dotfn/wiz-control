import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { isTauri } from '../utils/tauri';
import { tauriRouter } from '../router/tauri';
import { webRouter } from '../router/web';

export const App: React.FC = () => {
  const router = isTauri() ? tauriRouter : webRouter;

  return <RouterProvider router={router} />;
};
export default App;
