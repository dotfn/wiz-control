import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { DemoPage } from '../pages/DemoPage';
import { DownloadPage } from '../pages/DownloadPage';

export const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/demo',
    element: <DemoPage />,
  },
  {
    path: '/download',
    element: <DownloadPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
