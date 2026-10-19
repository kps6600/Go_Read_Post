import React from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught render error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '540px',
            background: 'var(--bg-secondary, #f8fafc)',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            border: '1px solid var(--border-light, #e2e8f0)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Something Went Wrong
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              We encountered a temporary issue loading this section. You can return to the homepage or try reloading the page.
            </p>
            {this.state.error && (
              <div style={{ textAlign: 'left', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#b91c1c', marginBottom: '1.5rem', overflowX: 'auto' }}>
                <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="modern-pitch-btn"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              >
                <ArrowLeft size={15} /> Return Home
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-medium, #cbd5e1)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
