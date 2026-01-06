import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { logger } from '@/utils/logger';
import '@/styles/common.css';

/**
 * 错误边界组件属性
 * Error boundary component props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * 错误边界组件状态
 * Error boundary component state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * React错误边界，用于捕获子组件树中的JavaScript错误
 * Error boundary component to catch JavaScript errors in child component tree
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 捕获错误
   * Catch errors
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 记录错误信息
   * Log error information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误到日志系统
    logger.error('组件渲染错误', error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      errorInfo,
    });

    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * 重置错误状态
   * Reset error state
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 渲染错误UI
   * Render error UI
   */
  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用自定义fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <Result
          status="500"
          title="页面渲染错误"
          subTitle={
            process.env.NODE_ENV === 'development'
              ? this.state.error?.message || '发生了未知错误'
              : '抱歉，页面渲染时发生了错误，请刷新页面重试'
          }
          extra={[
            <Button type="primary" key="reload" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
            <Button key="reset" onClick={this.handleReset}>
              重试
            </Button>,
          ]}
        >
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <div className="error-boundary-code">
              <pre>
                {this.state.error?.stack}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

