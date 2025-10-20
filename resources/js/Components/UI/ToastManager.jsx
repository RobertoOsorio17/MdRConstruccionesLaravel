/**
 * Toast Manager - Integración del sistema de toasts
 * 
 * Componente que integra el ToastProvider con el ToastContainer
 * para proporcionar un sistema completo de notificaciones.
 * 
 * Uso en el layout principal:
 * ```jsx
 * import ToastManager from '@/Components/UI/ToastManager';
 * 
 * function App() {
 *   return (
 *     <ToastManager>
 *       <YourApp />
 *     </ToastManager>
 *   );
 * }
 * ```
 */

import React from 'react';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import ToastContainer from '@/Components/UI/Toast';

/**
 * Internal component that renders the toast container
 */
const ToastRenderer = () => {
  const { toasts, dismissToast } = useToast();
  
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
};

/**
 * Toast Manager - Wraps children with ToastProvider and renders ToastContainer
 */
const ToastManager = ({ children, config }) => {
  return (
    <ToastProvider config={config}>
      {children}
      <ToastRenderer />
    </ToastProvider>
  );
};

export default ToastManager;

