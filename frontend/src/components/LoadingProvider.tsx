/**
 * 全局Loading提供者组件
 * Global loading provider component
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Spin } from 'antd';
import { useLoading, LoadingState } from '@/hooks/useLoading';

/**
 * Loading上下文接口
 * Loading context interface
 */
interface LoadingContextType {
  loading: LoadingState;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  hasLoading: () => boolean;
  clearLoading: () => void;
  withLoading: <T,>(key: string, asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * Loading上下文
 * Loading context
 */
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Loading提供者组件属性
 * Loading provider component props
 */
interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * Loading提供者组件
 * Loading provider component
 */
export function LoadingProvider({ children }: LoadingProviderProps) {
  const loading = useLoading();

  return <LoadingContext.Provider value={loading}>{children}</LoadingContext.Provider>;
}

/**
 * 使用Loading上下文Hook
 * Use loading context hook
 */
export function useLoadingContext(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within LoadingProvider');
  }
  return context;
}

/**
 * 全局Loading遮罩组件
 * Global loading overlay component
 */
export function GlobalLoading() {
  const { hasLoading } = useLoadingContext();

  if (!hasLoading()) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <Spin size="large" tip="加载中..." />
    </div>
  );
}

