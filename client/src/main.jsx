import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('React render error:', error); }
  render() {
    if (this.state.error) return <main className="fatal"><h1>Helpdesk AI could not load</h1><p>{this.state.error.message}</p><p>Open browser DevTools (F12) → Console for details.</p></main>;
    return this.props.children;
  }
}
const root = document.getElementById('root');
if (!root) throw new Error('Root element #root was not found in index.html');
createRoot(root).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);
