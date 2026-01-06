import { create } from 'zustand';
import { ComponentNode } from '@/types/component';
import { projectAPI } from '@/services/api';
import { logger } from '@/utils/logger';

/**
 * Editor store state interface
 */
interface EditorState {
  // 组件树根节点
  components: ComponentNode[];
  // 当前选中的组件ID（单选）
  selectedComponent: string | null;
  // 当前选中的组件ID列表（多选）
  selectedComponents: string[];
  // 历史记录（用于撤销/重做）
  history: ComponentNode[][];
  // 当前历史记录索引
  historyIndex: number;
}

/**
 * Editor store actions interface
 */
interface EditorActions {
  // 添加组件
  addComponent: (component: ComponentNode, parentId?: string) => void;
  // 更新组件
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  // 删除组件
  deleteComponent: (id: string) => void;
  // 设置选中组件（单选）
  setSelectedComponent: (id: string | null) => void;
  // 切换组件选中状态（多选）
  toggleComponentSelection: (id: string) => void;
  // 全选所有组件
  selectAll: () => void;
  // 清除所有选中
  clearSelection: () => void;
  // 移动组件
  moveComponent: (id: string, newParentId: string, index: number) => void;
  // 复制组件
  copyComponent: (id: string) => ComponentNode | null;
  // 粘贴组件
  pasteComponent: (component: ComponentNode, parentId?: string) => void;
  // 撤销
  undo: () => void;
  // 重做
  redo: () => void;
  // 保存历史记录
  saveHistory: () => void;
  // 清空画布
  clearCanvas: () => void;
  // 保存项目组件到后端
  saveProject: (projectId: string) => Promise<void>;
  // 从后端加载项目组件
  loadProject: (projectId: string) => Promise<void>;
}

/**
 * Editor store type
 */
type EditorStore = EditorState & EditorActions;

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
const generateId = (): string => {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 查找组件节点
 * @param components - 组件树
 * @param id - 组件ID
 * @returns {ComponentNode | null} 找到的组件节点
 */
const findComponent = (components: ComponentNode[], id: string): ComponentNode | null => {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    if (component.children) {
      const found = findComponent(component.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 获取所有组件ID（扁平化）
 * @param components - 组件树
 * @returns {string[]} 所有组件ID列表
 */
const getAllComponentIds = (components: ComponentNode[]): string[] => {
  const ids: string[] = [];
  const traverse = (comps: ComponentNode[]) => {
    for (const comp of comps) {
      ids.push(comp.id);
      if (comp.children) {
        traverse(comp.children);
      }
    }
  };
  traverse(components);
  return ids;
};

/**
 * 删除组件节点
 * @param components - 组件树
 * @param id - 要删除的组件ID
 * @returns {ComponentNode[]} 删除后的组件树
 */
const removeComponent = (components: ComponentNode[], id: string): ComponentNode[] => {
  return components
    .filter((comp) => comp.id !== id)
    .map((comp) => ({
      ...comp,
      children: comp.children ? removeComponent(comp.children, id) : undefined,
    }));
};

/**
 * 更新组件节点
 * @param components - 组件树
 * @param id - 组件ID
 * @param updates - 更新内容
 * @returns {ComponentNode[]} 更新后的组件树
 */
const updateComponentInTree = (
  components: ComponentNode[],
  id: string,
  updates: Partial<ComponentNode>
): ComponentNode[] => {
  return components.map((comp) => {
    if (comp.id === id) {
      return { ...comp, ...updates };
    }
    if (comp.children) {
      return {
        ...comp,
        children: updateComponentInTree(comp.children, id, updates),
      };
    }
    return comp;
  });
};

/**
 * Editor store using Zustand
 * Manages editor state including components, selection, and history
 */
export const useEditorStore = create<EditorStore>((set, get) => ({
  // 初始状态
  components: [],
  selectedComponent: null,
  selectedComponents: [],
  history: [[]],
  historyIndex: 0,

  // 添加组件
  addComponent: (component, parentId) => {
    const newComponent: ComponentNode = {
      ...component,
      id: component.id || generateId(),
    };

    set((state) => {
      if (!parentId) {
        // 添加到根节点
        return {
          components: [...state.components, newComponent],
        };
      } else {
        // 添加到指定父节点
        const addToParent = (comps: ComponentNode[]): ComponentNode[] => {
          return comps.map((comp) => {
            if (comp.id === parentId) {
              return {
                ...comp,
                children: [...(comp.children || []), newComponent],
              };
            }
            if (comp.children) {
              return {
                ...comp,
                children: addToParent(comp.children),
              };
            }
            return comp;
          });
        };

        return {
          components: addToParent(state.components),
        };
      }
    });

    get().saveHistory();
  },

  // 更新组件
  updateComponent: (id, updates) => {
    set((state) => ({
      components: updateComponentInTree(state.components, id, updates),
    }));
    get().saveHistory();
  },

  // 删除组件
  deleteComponent: (id) => {
    set((state) => ({
      components: removeComponent(state.components, id),
      selectedComponent: state.selectedComponent === id ? null : state.selectedComponent,
      selectedComponents: state.selectedComponents.filter((selectedId) => selectedId !== id),
    }));
    get().saveHistory();
  },

  // 设置选中组件（单选）
  setSelectedComponent: (id) => {
    set({
      selectedComponent: id,
      selectedComponents: id ? [id] : [], // 单选时也更新多选列表
    });
  },

  // 切换组件选中状态（多选）
  toggleComponentSelection: (id) => {
    set((state) => {
      const index = state.selectedComponents.indexOf(id);
      let newSelected: string[];
      if (index === -1) {
        // 添加到选中列表
        newSelected = [...state.selectedComponents, id];
      } else {
        // 从选中列表移除
        newSelected = state.selectedComponents.filter((selectedId) => selectedId !== id);
      }
      return {
        selectedComponents: newSelected,
        selectedComponent: newSelected.length === 1 ? newSelected[0] : newSelected.length > 1 ? null : null, // 多选时清空单选
      };
    });
  },

  // 全选所有组件
  selectAll: () => {
    const state = get();
    const allIds = getAllComponentIds(state.components);
    set({
      selectedComponents: allIds,
      selectedComponent: allIds.length === 1 ? allIds[0] : null, // 只有一个组件时设为单选
    });
  },

  // 清除所有选中
  clearSelection: () => {
    set({
      selectedComponent: null,
      selectedComponents: [],
    });
  },

  // 移动组件
  moveComponent: (id, newParentId, index) => {
    const state = get();
    const component = findComponent(state.components, id);
    if (!component) return;

    // 规范化parentId：空字符串转换为null
    const normalizedParentId = newParentId === '' || newParentId === null || newParentId === undefined ? null : newParentId;

    // 查找组件的原始位置信息（包括父节点和索引）
    let originalParentId: string | null = null;
    let originalIndex = -1;
    
    const findComponentPosition = (comps: ComponentNode[], targetId: string, parentId: string | null): boolean => {
      for (let i = 0; i < comps.length; i++) {
        if (comps[i].id === targetId) {
          originalIndex = i;
          originalParentId = parentId;
          return true;
        }
        if (comps[i].children) {
          if (findComponentPosition(comps[i].children!, targetId, comps[i].id)) {
            return true;
          }
        }
      }
      return false;
    };

    findComponentPosition(state.components, id, null);

    // 如果原位置和新位置相同，不需要移动
    if (originalParentId === normalizedParentId && originalIndex === index) {
      return;
    }

    // 先从原位置删除
    const removeFromTree = (comps: ComponentNode[]): ComponentNode[] => {
      return comps
        .filter((comp) => comp.id !== id)
        .map((comp) => ({
          ...comp,
          children: comp.children ? removeFromTree(comp.children) : undefined,
        }));
    };

    // 添加到新位置
    const addToTree = (comps: ComponentNode[], parentId: string | null, targetIndex: number): ComponentNode[] => {
      if (parentId === null || parentId === '') {
        // 添加到根节点
        const newComps = [...comps];
        // 如果是从前面拖到后面，需要调整索引（因为已经删除了源元素，数组长度减1）
        let adjustedIndex = targetIndex;
        if (originalParentId === null && originalIndex !== -1 && targetIndex > originalIndex) {
          adjustedIndex = targetIndex - 1;
        }
        // 确保索引在有效范围内
        const finalIndex = Math.max(0, Math.min(adjustedIndex, newComps.length));
        newComps.splice(finalIndex, 0, component);
        return newComps;
      } else {
        // 添加到指定父节点
        return comps.map((comp) => {
          if (comp.id === parentId) {
            const children = comp.children || [];
            const newChildren = [...children];
            // 如果是在同一个父节点内移动，需要调整索引
            let adjustedIndex = targetIndex;
            if (originalParentId === parentId && originalIndex !== -1 && targetIndex > originalIndex) {
              adjustedIndex = targetIndex - 1;
            }
            const finalIndex = Math.max(0, Math.min(adjustedIndex, newChildren.length));
            newChildren.splice(finalIndex, 0, component);
            return {
              ...comp,
              children: newChildren,
            };
          }
          if (comp.children) {
            return {
              ...comp,
              children: addToTree(comp.children, parentId, targetIndex),
            };
          }
          return comp;
        });
      }
    };

    const removedComponents = removeFromTree(state.components);
    const newComponents = addToTree(removedComponents, normalizedParentId, index);

    set({ components: newComponents });
    get().saveHistory();
  },

  // 复制组件
  copyComponent: (id: string) => {
    const state = get();
    const component = findComponent(state.components, id);
    if (!component) return null;

    // 深拷贝组件
    const cloned = JSON.parse(JSON.stringify(component));
    cloned.id = generateId();
    
    // 递归更新子组件ID
    const updateIds = (comp: ComponentNode): ComponentNode => {
      comp.id = generateId();
      if (comp.children) {
        comp.children = comp.children.map(updateIds);
      }
      return comp;
    };

    return updateIds(cloned);
  },

  // 粘贴组件
  pasteComponent: (component: ComponentNode, parentId?: string) => {
    get().addComponent(component, parentId);
  },

  // 撤销
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      set({
        historyIndex: state.historyIndex - 1,
        components: state.history[state.historyIndex - 1],
      });
    }
  },

  // 重做
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      set({
        historyIndex: state.historyIndex + 1,
        components: state.history[state.historyIndex + 1],
      });
    }
  },

  // 保存历史记录
  saveHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state.components))); // 深拷贝

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // 清空画布
  clearCanvas: () => {
    set({
      components: [],
      selectedComponent: null,
    });
    get().saveHistory();
  },

  // 保存项目组件到后端
  saveProject: async (projectId: string) => {
    try {
      const { components } = get();
      await projectAPI.saveComponents(projectId, components);
      logger.info('项目组件已保存', { projectId, componentCount: components.length });
    } catch (error) {
      logger.error('保存项目组件失败', error, { projectId });
      throw error;
    }
  },

  // 从后端加载项目组件
  loadProject: async (projectId: string) => {
    try {
      const project = await projectAPI.getById(projectId);
      const components = (project.components as ComponentNode[]) || [];
      set({
        components,
        selectedComponent: null,
        selectedComponents: [],
        history: [components],
        historyIndex: 0,
      });
      logger.info('项目组件已加载', { projectId, componentCount: components.length });
    } catch (error) {
      logger.error('加载项目组件失败', error, { projectId });
      // 如果后端加载失败，尝试从localStorage加载（降级方案）
      try {
        const saved = localStorage.getItem(`project_${projectId}_components`);
        if (saved) {
          const components = JSON.parse(saved) as ComponentNode[];
          set({
            components,
            selectedComponent: null,
            selectedComponents: [],
            history: [components],
            historyIndex: 0,
          });
          logger.info('从localStorage加载项目组件', { projectId });
        }
      } catch (localError) {
        logger.error('从localStorage加载失败', localError);
        throw error;
      }
    }
  },
}));

