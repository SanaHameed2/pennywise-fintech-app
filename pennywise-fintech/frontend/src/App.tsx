import { RouterProvider } from 'react-router-dom';
import { DarkModeProvider } from './providers/DarkModeProvider';
import { router } from './router';

function App() {
  return (
    <DarkModeProvider>
      <RouterProvider router={router} />
    </DarkModeProvider>
  );
}

export default App;