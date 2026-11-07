// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import RootLayout from './pages/RootLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// ✅ Lazy loading for all pages (Including Login/Signup for optimization)
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransferWizard = lazy(() => import('./pages/TransferWizard'));
const SecurityFlow = lazy(() => import('./pages/SecurityFlow'));
const BudgetCards = lazy(() => import('./pages/BudgetCards'));
const Cards = lazy(() => import('./pages/Cards'));
const Invest = lazy(() => import('./pages/Invest'));
const Save = lazy(() => import('./pages/Save'));
const SettingsPage = lazy(() => import('../features/settings/index'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));

// ✅ Updated: Login & Signup ko bhi lazy load kiya
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'transfer', element: <TransferWizard /> },
          { path: 'security', element: <SecurityFlow /> },
          { path: 'budget', element: <BudgetCards /> },
          { path: 'cards', element: <Cards /> },
          { path: 'invest', element: <Invest /> },
          { path: 'save', element: <Save /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'transactions', element: <TransactionHistory /> }, 
        ],
      },
    ],
  },
]);