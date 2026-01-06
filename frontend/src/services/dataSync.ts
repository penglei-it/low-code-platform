/**
 * 数据同步服务
 * Data synchronization service
 * 用于在localStorage和后端API之间同步数据
 */

import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import { projectAPI, dataModelAPI, apiDefinitionAPI, formDefinitionAPI, workflowAPI } from './api';
import { Project } from './api';
import { DataModel } from '@/types/api';
import { ApiDefinition } from './api';
import { FormDefinition } from './api';

/**
 * 同步状态
 * Sync status
 */
export interface SyncStatus {
  syncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

/**
 * 数据同步服务类
 * Data synchronization service class
 */
class DataSyncService {
  private syncStatus: SyncStatus = {
    syncing: false,
    lastSyncTime: null,
    error: null,
  };

  /**
   * 获取同步状态
   * Get sync status
   */
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * 同步项目数据到后端
   * Sync project data to backend
   */
  async syncProjects(): Promise<void> {
    if (this.syncStatus.syncing) {
      logger.warn('数据同步正在进行中，跳过本次同步');
      return;
    }

    this.syncStatus.syncing = true;
    this.syncStatus.error = null;

    try {
      // 从localStorage读取项目数据
      const localProjects = this.getLocalProjects();

      // 同步到后端
      for (const project of localProjects) {
        try {
          if (project.id && project.id.startsWith('project_')) {
            // 新项目，创建
            await projectAPI.create({
              name: project.name,
              description: project.description,
            });
            logger.info('项目同步成功', { name: project.name });
          } else {
            // 已存在项目，更新
            await projectAPI.update(project.id, {
              name: project.name,
              description: project.description,
            });
            logger.info('项目更新成功', { id: project.id });
          }
        } catch (error) {
          logger.error('项目同步失败', error, { projectId: project.id });
          // 继续同步其他项目
        }
      }

      this.syncStatus.lastSyncTime = Date.now();
      logger.info('所有项目同步完成');
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : '同步失败';
      handleError(error, {
        customMessage: '数据同步失败，请检查网络连接',
        logError: true,
      });
      throw error;
    } finally {
      this.syncStatus.syncing = false;
    }
  }

  /**
   * 从后端加载项目数据
   * Load project data from backend
   */
  async loadProjectsFromBackend(): Promise<Project[]> {
    try {
      const projects = await projectAPI.getAll();
      // 保存到localStorage作为缓存
      localStorage.setItem('projects', JSON.stringify(projects));
      logger.info('从后端加载项目数据成功', { count: projects.length });
      return projects;
    } catch (error) {
      handleError(error, {
        customMessage: '加载项目数据失败，使用本地缓存',
        logError: true,
      });
      // 失败时返回本地缓存
      return this.getLocalProjects();
    }
  }

  /**
   * 获取本地项目数据
   * Get local project data
   */
  private getLocalProjects(): Project[] {
    try {
      const saved = localStorage.getItem('projects');
      return saved ? (JSON.parse(saved) as Project[]) : [];
    } catch (error) {
      logger.error('读取本地项目数据失败', error);
      return [];
    }
  }

  /**
   * 同步数据模型到后端
   * Sync data models to backend
   */
  async syncDataModels(): Promise<void> {
    if (this.syncStatus.syncing) {
      logger.warn('数据同步正在进行中，跳过本次同步');
      return;
    }

    this.syncStatus.syncing = true;
    this.syncStatus.error = null;

    try {
      // 从localStorage读取数据模型
      const localModels = this.getLocalDataModels();

      // 从后端获取已有数据模型
      let backendModels: DataModel[] = [];
      try {
        backendModels = await dataModelAPI.getAll();
      } catch (error) {
        logger.warn('获取后端数据模型失败，将创建新模型', error);
      }

      // 同步到后端
      for (const model of localModels) {
        try {
          const existingModel = backendModels.find((m) => m.id === model.id);
          if (existingModel) {
            // 已存在模型，更新
            await dataModelAPI.update(model.id, {
              name: model.name,
              fields: model.fields,
              description: model.description,
            });
            logger.info('数据模型更新成功', { id: model.id, name: model.name });
          } else {
            // 新模型，创建
            if (model.id && model.id.startsWith('model_')) {
              // 本地生成的ID，创建新模型
              const created = await dataModelAPI.create({
                name: model.name,
                fields: model.fields,
                description: model.description,
              });
              // 更新本地存储的ID
              const updatedModels = localModels.map((m) =>
                m.id === model.id ? { ...m, id: created.id } : m
              );
              localStorage.setItem('data_models', JSON.stringify(updatedModels));
              logger.info('数据模型创建成功', { id: created.id, name: model.name });
            } else {
              // 已有ID，直接创建
              await dataModelAPI.create({
                name: model.name,
                fields: model.fields,
                description: model.description,
              });
              logger.info('数据模型创建成功', { id: model.id, name: model.name });
            }
          }
        } catch (error) {
          logger.error('数据模型同步失败', error, { modelId: model.id });
          // 继续同步其他模型
        }
      }

      this.syncStatus.lastSyncTime = Date.now();
      logger.info('所有数据模型同步完成', { count: localModels.length });
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : '同步失败';
      handleError(error, {
        customMessage: '数据模型同步失败',
        logError: true,
      });
      throw error;
    } finally {
      this.syncStatus.syncing = false;
    }
  }

  /**
   * 获取本地数据模型
   * Get local data models
   */
  private getLocalDataModels(): DataModel[] {
    try {
      const saved = localStorage.getItem('data_models');
      return saved ? (JSON.parse(saved) as DataModel[]) : [];
    } catch (error) {
      logger.error('读取本地数据模型失败', error);
      return [];
    }
  }

  /**
   * 同步所有数据
   * Sync all data
   */
  async syncAll(): Promise<void> {
    try {
      await Promise.all([
        this.syncProjects(),
        this.syncDataModels(),
        this.syncApiDefinitions(),
        this.syncFormDefinitions(),
        this.syncWorkflows(),
      ]);
      logger.info('所有数据同步完成');
    } catch (error) {
      logger.error('数据同步失败', error);
      throw error;
    }
  }

  /**
   * 同步API定义到后端
   * Sync API definitions to backend
   */
  async syncApiDefinitions(): Promise<void> {
    try {
      const localApis = this.getLocalApiDefinitions();
      if (localApis.length === 0) {
        return;
      }

      for (const api of localApis) {
        try {
          if (api.id && api.id.startsWith('api_')) {
            // 新API，创建
            await apiDefinitionAPI.create({
              name: api.name,
              path: api.path,
              method: api.method as any,
              description: api.description,
              queryParams: api.queryParams,
              headers: api.headers,
              bodySample: api.bodySample,
              mockResponse: api.mockResponse,
            });
            logger.info('API定义同步成功', { name: api.name });
          } else {
            // 已存在API，更新
            await apiDefinitionAPI.update(api.id, {
              name: api.name,
              path: api.path,
              method: api.method as any,
              description: api.description,
              queryParams: api.queryParams,
              headers: api.headers,
              bodySample: api.bodySample,
              mockResponse: api.mockResponse,
            });
            logger.info('API定义更新成功', { id: api.id });
          }
        } catch (error) {
          logger.error('API定义同步失败', error, { apiId: api.id });
        }
      }
    } catch (error) {
      logger.error('API定义同步过程失败', error);
    }
  }

  /**
   * 获取本地API定义
   * Get local API definitions
   */
  private getLocalApiDefinitions(): ApiDefinition[] {
    try {
      const saved = localStorage.getItem('api_designer_defs');
      return saved ? (JSON.parse(saved) as ApiDefinition[]) : [];
    } catch (error) {
      logger.error('读取本地API定义失败', error);
      return [];
    }
  }

  /**
   * 同步表单定义到后端
   * Sync form definitions to backend
   */
  async syncFormDefinitions(): Promise<void> {
    try {
      const localForms = this.getLocalFormDefinitions();
      if (localForms.length === 0) {
        return;
      }

      for (const form of localForms) {
        try {
          if (form.id && form.id.startsWith('form_')) {
            // 新表单，创建
            await formDefinitionAPI.create({
              name: form.name,
              description: form.description,
              config: form.config,
              fields: form.fields,
            });
            logger.info('表单定义同步成功', { name: form.name });
          } else {
            // 已存在表单，更新
            await formDefinitionAPI.update(form.id, {
              name: form.name,
              description: form.description,
              config: form.config,
              fields: form.fields,
            });
            logger.info('表单定义更新成功', { id: form.id });
          }
        } catch (error) {
          logger.error('表单定义同步失败', error, { formId: form.id });
        }
      }
    } catch (error) {
      logger.error('表单定义同步过程失败', error);
    }
  }

  /**
   * 获取本地表单定义
   * Get local form definitions
   */
  private getLocalFormDefinitions(): FormDefinition[] {
    try {
      const saved = localStorage.getItem('savedForms');
      return saved ? (JSON.parse(saved) as FormDefinition[]) : [];
    } catch (error) {
      logger.error('读取本地表单定义失败', error);
      return [];
    }
  }

  /**
   * 同步工作流到后端
   * Sync workflows to backend
   */
  async syncWorkflows(): Promise<void> {
    try {
      const localWorkflows = this.getLocalWorkflows();
      if (localWorkflows.length === 0) {
        return;
      }

      for (const workflow of localWorkflows) {
        try {
          if (workflow.id && typeof workflow.id === 'string' && workflow.id.startsWith('workflow_')) {
            // 新工作流，创建
            await workflowAPI.create({
              name: workflow.name,
              description: workflow.description,
              nodes: workflow.nodes,
              edges: workflow.edges,
            } as any);
            logger.info('工作流同步成功', { name: workflow.name });
          } else if (workflow.id) {
            // 已存在工作流，更新
            await workflowAPI.update(workflow.id as string, {
              name: workflow.name,
              description: workflow.description,
              nodes: workflow.nodes,
              edges: workflow.edges,
            } as any);
            logger.info('工作流更新成功', { id: workflow.id });
          }
        } catch (error) {
          logger.error('工作流同步失败', error, { workflowId: workflow.id });
        }
      }
    } catch (error) {
      logger.error('工作流同步过程失败', error);
    }
  }

  /**
   * 获取本地工作流
   * Get local workflows
   */
  private getLocalWorkflows(): any[] {
    try {
      const saved = localStorage.getItem('workflows');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logger.error('读取本地工作流失败', error);
      return [];
    }
  }

  /**
   * 自动同步（定时同步）
   * Auto sync (scheduled sync)
   */
  startAutoSync(interval: number = 5 * 60 * 1000): () => void {
    const syncInterval = setInterval(() => {
      this.syncAll().catch((error) => {
        logger.error('自动同步失败', error);
      });
    }, interval);

    logger.info('自动同步已启动', { interval });

    // 返回停止函数
    return () => {
      clearInterval(syncInterval);
      logger.info('自动同步已停止');
    };
  }
}

/**
 * 导出单例实例
 * Export singleton instance
 */
export const dataSyncService = new DataSyncService();

