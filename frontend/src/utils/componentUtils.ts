import { ComponentNode } from '@/types/component';

/**
 * Find component by ID in component tree
 * 在组件树中根据ID查找组件
 * @param components - Component tree
 * @param id - Component ID
 * @returns {ComponentNode | null} Found component or null
 */
export function findComponent(
  components: ComponentNode[],
  id: string
): ComponentNode | null {
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
}

/**
 * Get all component IDs in the tree
 * 获取组件树中所有组件ID
 * @param components - Component tree
 * @returns {string[]} Array of component IDs
 */
export function getAllComponentIds(components: ComponentNode[]): string[] {
  const ids: string[] = [];
  const traverse = (nodes: ComponentNode[]) => {
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(components);
  return ids;
}

/**
 * Clone component node
 * 克隆组件节点
 * @param node - Component node to clone
 * @returns {ComponentNode} Cloned component node
 */
export function cloneComponent(node: ComponentNode): ComponentNode {
  return JSON.parse(JSON.stringify(node));
}

