import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Usuń stare cache przeglądarki i stare Service Workery, aby każdy link (firebaseapp.com i web.app) miał zawsze najświeższy kod
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then(names => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Błąd aplikacji:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#1e1f20] border border-[#444746] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-medium text-white">Wystąpił nieoczekiwany problem</h2>
            <p className="text-sm text-[#9aa0a6]">
              {this.state.error?.message || 'Nastąpił błąd podczas ładowania widoku.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-5 py-2 bg-[#a8c7fa] hover:bg-[#b8d4ff] text-[#041e49] font-medium rounded-full text-sm transition"
            >
              Odśwież aplikację
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
