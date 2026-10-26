import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './admin-cms.css'
import App from './App.jsx'
import { NavigationProvider } from './context/NavigationContext.jsx'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("RootErrorBoundary caught error:", error, info);
    // Also post to backend if possible or log
    fetch('/api/client-error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error?.message,
        stack: error?.stack,
        componentStack: info?.componentStack
      })
    }).catch(() => {});
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', color: '#b91c1c', background: '#fef2f2', minHeight: '100vh' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>⚠️ Client Runtime Error Caught:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    fetch('/api/client-error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'window.error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    }).catch(() => {});
  });
  window.addEventListener('unhandledrejection', (event) => {
    fetch('/api/client-error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'unhandledrejection',
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      })
    }).catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </RootErrorBoundary>
  </StrictMode>,
)
