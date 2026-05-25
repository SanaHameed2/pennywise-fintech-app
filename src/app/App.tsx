import { RouterProvider } from 'react-router';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { router } from './routes';

export default function App() {
  return (
    <DarkModeProvider>
      <RouterProvider router={router} />
    </DarkModeProvider>
  );
}