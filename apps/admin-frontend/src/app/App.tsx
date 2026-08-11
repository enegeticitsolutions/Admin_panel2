/**
 * MaiHoonNa Senior Care Operations Portal - Main Application Entry Point
 * A comprehensive RBAC-enabled portal for managing senior care operations
 */

import React from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { SystemConfigProvider } from './context/SystemConfigContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';
import SiteGatekeeper from './components/auth/SiteGatekeeper';

export default function App() {
  return (
    <AuthProvider>
      <SystemConfigProvider>
        <SiteGatekeeper>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </SiteGatekeeper>
      </SystemConfigProvider>
    </AuthProvider>
  );
}
