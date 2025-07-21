// src/contexts/NotificationContext.tsx
/**
 * Contexto para sistema de notificações
 * Gerencia alertas e mensagens do sistema
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification as NotificationComponent } from '../components/Notification';
import type { Notification, NotificationType } from '../types';

interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Adiciona nova notificação
   */
  const showNotification = useCallback(
    (type: NotificationType, title: string, message?: string, duration = 5000) => {
      const id = Date.now().toString();
      const notification: Notification = {
        id,
        type,
        title,
        message,
        duration
      };

      setNotifications(prev => [...prev, notification]);

      // Remove automaticamente após duração
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  /**
   * Remove notificação
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Atalhos para tipos específicos
  const showSuccess = useCallback(
    (title: string, message?: string) => showNotification('success', title, message),
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message?: string) => showNotification('error', title, message),
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => showNotification('warning', title, message),
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => showNotification('info', title, message),
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      {/* Container de notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationComponent
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar notificações
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};
