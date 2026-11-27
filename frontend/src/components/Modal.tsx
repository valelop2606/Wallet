import { ReactNode, useEffect, useRef } from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="sheet-backdrop absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 max-h-[88vh] overflow-y-auto shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 -mr-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <Icon name="x" size={16} strokeWidth={2.2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
