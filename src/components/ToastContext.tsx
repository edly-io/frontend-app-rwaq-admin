/**
 * App-wide toast feedback.
 *
 * Mutations report success and failure through `showToast()`; Alert stays
 * reserved for persistent inline states (empty lists, unsaved changes).
 * One Toast is rendered at the app root so it survives a modal closing
 * immediately after the mutation that triggered it.
 */
import {
  createContext, useCallback, useContext, useMemo, useState, ReactNode,
} from 'react';
import { Toast } from '@openedx/paragon';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

/** How long a toast stays up, in ms. */
const TOAST_DELAY = 5000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast onClose={() => setIsOpen(false)} show={isOpen} delay={TOAST_DELAY}>
        {message}
      </Toast>
    </ToastContext.Provider>
  );
};

/** Read the toast dispatcher. Safe to call outside a provider (no-ops). */
export const useToast = () => useContext(ToastContext);

export default ToastContext;
