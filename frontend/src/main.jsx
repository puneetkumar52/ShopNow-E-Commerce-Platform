import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import router from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1C1C28',
            color: '#F0F0FF',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#4CAF50', secondary: '#1C1C28' } },
          error: { iconTheme: { primary: '#F44336', secondary: '#1C1C28' } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
