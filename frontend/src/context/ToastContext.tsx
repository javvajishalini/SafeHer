import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global dispatcher reference so non-component contexts/services can dispatch if needed
let globalToastDispatcher: ToastContextType | null = null;
export const showToast = {
  success: (msg: string, d?: number) => globalToastDispatcher?.success(msg, d),
  error: (msg: string, d?: number) => globalToastDispatcher?.error(msg, d),
  warning: (msg: string, d?: number) => globalToastDispatcher?.warning(msg, d),
  info: (msg: string, d?: number) => globalToastDispatcher?.info(msg, d),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentMessagesRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    if (!message || !message.trim()) return;

    // Deduplication check: ignore identical message + type if dispatched within 1.5 seconds
    const key = `${type}:${message.trim()}`;
    const now = Date.now();
    const lastTime = recentMessagesRef.current.get(key) || 0;
    if (now - lastTime < 1500) {
      return;
    }
    recentMessagesRef.current.set(key, now);

    // Default duration: error gets 5000ms, others get 3500ms
    const autoDismissMs = duration ?? (type === 'error' ? 5000 : 3500);
    const id = `${now}-${Math.random().toString(36).substring(2, 7)}`;

    setToasts((prev) => [...prev, { id, type, message: message.trim(), duration: autoDismissMs }]);

    if (autoDismissMs > 0) {
      window.setTimeout(() => {
        dismiss(id);
      }, autoDismissMs);
    }
  }, [dismiss]);

  const success = useCallback((msg: string, d?: number) => addToast('success', msg, d), [addToast]);
  const error = useCallback((msg: string, d?: number) => addToast('error', msg, d), [addToast]);
  const warning = useCallback((msg: string, d?: number) => addToast('warning', msg, d), [addToast]);
  const info = useCallback((msg: string, d?: number) => addToast('info', msg, d), [addToast]);

  const value = { success, error, warning, info, dismiss };
  globalToastDispatcher = value;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Render Portal / Container */}
      <div 
        className="safeher-toast-container" 
        role="region" 
        aria-live="polite" 
        aria-label="Notification Center"
      >
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          return (
            <div 
              key={toast.id} 
              className={`safeher-toast safeher-toast-${toast.type} animate-slide-in-right`}
              role="alert"
            >
              <div className="safeher-toast-icon-wrapper" style={{ color: config.iconColor }}>
                {config.icon}
              </div>
              <div className="safeher-toast-content">
                <p className="safeher-toast-message">{toast.message}</p>
              </div>
              <button 
                type="button" 
                onClick={() => dismiss(toast.id)}
                className="safeher-toast-close-btn"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function getToastConfig(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle2 size={20} />,
        iconColor: '#10b981'
      };
    case 'error':
      return {
        icon: <AlertCircle size={20} />,
        iconColor: '#ef4444'
      };
    case 'warning':
      return {
        icon: <AlertTriangle size={20} />,
        iconColor: '#f59e0b'
      };
    case 'info':
    default:
      return {
        icon: <Info size={20} />,
        iconColor: '#6366f1'
      };
  }
}
