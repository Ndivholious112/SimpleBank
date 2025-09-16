import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Root from './routes/Root'
import Login from './routes/Login'
import Register from './routes/Register'
import Dashboard from './routes/Dashboard'
import Analysis from './routes/Analysis'
import TransactionsPage from './routes/TransactionsPage'
import Profile from './routes/Profile'
import { ToastProvider } from './components/ui/Toast'
import MobileOnlyWrapper from './components/MobileOnlyWrapper'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'analysis', element: <Analysis /> },
      { path: 'transaction', element: <TransactionsPage /> },
      { path: 'profile', element: <Profile /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
])

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobileOnlyWrapper>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </MobileOnlyWrapper>
  </React.StrictMode>,
)
