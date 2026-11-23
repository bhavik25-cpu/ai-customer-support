import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="logo-mark">H</div><p>Loading your workspace…</p></div>;
  return user ? <ChatPage /> : <AuthPage />;
}
export default function App() { return <AuthProvider><AppContent /></AuthProvider>; }
