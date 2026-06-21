import { createHashRouter, Navigate } from 'react-router-dom';
import { ControlPage } from '../pages/ControlPage';

export const tauriRouter = createHashRouter([
  {
    path: '/',
    element: <ControlPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
