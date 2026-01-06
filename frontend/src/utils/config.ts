/**
 * 配置管理工具
 * Configuration management utility
 */

/**
 * 应用配置接口
 * Application configuration interface
 */
export interface AppConfig {
  apiBaseUrl: string;
  appTitle: string;
  debug: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableRemoteLogging: boolean;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}

/**
 * 默认配置
 * Default configuration
 */
const defaultConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  appTitle: import.meta.env.VITE_APP_TITLE || '低代码开发平台',
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: (import.meta.env.VITE_LOG_LEVEL as AppConfig['logLevel']) || 'debug',
  enableRemoteLogging: import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
};

/**
 * 配置管理器类
 * Configuration manager class
 */
class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = { ...defaultConfig };
    this.loadFromStorage();
  }

  /**
   * 从localStorage加载配置
   * Load configuration from localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('app_config');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppConfig>;
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('加载配置失败，使用默认配置', error);
    }
  }

  /**
   * 保存配置到localStorage
   * Save configuration to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('app_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('保存配置失败', error);
    }
  }

  /**
   * 获取配置值
   * Get configuration value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * 获取所有配置
   * Get all configuration
   */
  getAll(): AppConfig {
    return { ...this.config };
  }

  /**
   * 设置配置值
   * Set configuration value
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
    this.saveToStorage();
  }

  /**
   * 批量设置配置
   * Set multiple configuration values
   */
  setMultiple(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
  }

  /**
   * 重置配置为默认值
   * Reset configuration to default
   */
  reset(): void {
    this.config = { ...defaultConfig };
    this.saveToStorage();
  }

  /**
   * 检查配置是否有效
   * Check if configuration is valid
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.apiBaseUrl) {
      errors.push('API基础URL不能为空');
    }

    if (!this.config.appTitle) {
      errors.push('应用标题不能为空');
    }

    const validLogLevels: AppConfig['logLevel'][] = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logLevel)) {
      errors.push(`日志级别必须是: ${validLogLevels.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 导出单例配置管理器
 * Export singleton configuration manager
 */
export const configManager = new ConfigManager();

/**
 * 获取配置值的便捷函数
 * Convenience function to get configuration value
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return configManager.get(key);
}

/**
 * 设置配置值的便捷函数
 * Convenience function to set configuration value
 */
export function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
  configManager.set(key, value);
}

