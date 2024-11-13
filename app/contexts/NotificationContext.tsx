'use client'
import React, { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem key={notification.id} type={notification.type}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <AlertCircle size={20} />}
            {notification.type === 'info' && <XCircle size={20} />}
            <span>{notification.message}</span>
            <CloseButton onClick={() => 
              setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              )
            }>
              <X size={16} />
            </CloseButton>
          </NotificationItem>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationItem = styled.div<{ type: NotificationType }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => 
    props.type === 'success' ? '#059669' :
    props.type === 'error' ? '#DC2626' :
    '#2563EB'};
  color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  margin-left: auto;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`; 