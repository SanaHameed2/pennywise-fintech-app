// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import RootLayout from './pages/RootLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransferWizard = lazy(() => import('./pages/TransferWizard'));
const SecurityFlow = lazy(() => import('./pages/SecurityFlow'));
const BudgetCards = lazy(() => import('./pages/BudgetCards'));
const Cards = lazy(() => import('./pages/Cards'));
const Invest = lazy(() => import('./pages/Invest'));
const Save = lazy(() => import('./pages/Save'));
const SettingsPage = lazy(() => import('../features/settings/index'));
// ✅ Import TransactionHistory
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));

import Login from './pages/Login';
import Signup from './pages/Signup';

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
          // ✅ Add Transaction History Route
          { path: 'transactions', element: <TransactionHistory /> }, 
        ],
      },
    ],
  },
]);