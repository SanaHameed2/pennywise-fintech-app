import { createBrowserRouter } from 'react-router';
import RootLayout from './pages/RootLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'dashboard', Component: Dashboard },
      { path: 'login', Component: Login },
      { path: 'signup', Component: Signup },
    ],
  },
]);
