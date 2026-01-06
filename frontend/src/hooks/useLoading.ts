/**
 * 全局Loading状态管理Hook
 * Global loading state management hook
 */

import { useState, useCallback } from 'react';

/**
 * Loading状态接口
 * Loading state interface
 */
export interface LoadingState {
  [key: string]: boolean;
}

/**
 * 全局Loading状态管理Hook
 * Global loading state management hook
 * @returns Loading状态和操作方法
 */
export function useLoading() {
  const [loading, setLoading] = useState<LoadingState>({});

  /**
   * 设置指定key的loading状态
   * Set loading state for specific key
   */
  const setLoadingState = useCallback((key: string, value: boolean) => {
    setLoading((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * 开始loading
   * Start loading
   */
  const startLoading = useCallback(
    (key: string) => {
      setLoadingState(key, true);
    },
    [setLoadingState]
  );

  /**
   * 停止loading
   * Stop loading
   */
  const stopLoading = useCallback(
    (key: string) => {
      setLoadingState(key, false);
    },
    [setLoadingState]
  );

  /**
   * 检查指定key是否正在loading
   * Check if specific key is loading
   */
  const isLoading = useCallback(
    (key: string) => {
      return loading[key] === true;
    },
    [loading]
  );

  /**
   * 检查是否有任何loading
   * Check if any loading is active
   */
  const hasLoading = useCallback(() => {
    return Object.values(loading).some((value) => value === true);
  }, [loading]);

  /**
   * 清除所有loading状态
   * Clear all loading states
   */
  const clearLoading = useCallback(() => {
    setLoading({});
  }, []);

  /**
   * 执行异步操作并自动管理loading状态
   * Execute async operation with automatic loading management
   */
  const withLoading = useCallback(
    async <T,>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
      try {
        startLoading(key);
        return await asyncFn();
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  return {
    loading,
    startLoading,
    stopLoading,
    isLoading,
    hasLoading,
    clearLoading,
    withLoading,
  };
}

