import { Tree } from 'antd';
import { ComponentNode } from '@/types/component';
import { useEditorStore } from '@/stores/editorStore';
import type { DataNode } from 'antd/es/tree';

/**
 * Component tree props
 * 组件树属性
 */
interface ComponentTreeProps {
  onSelect: (id: string | null) => void;
}

/**
 * Convert component nodes to tree data
 * 将组件节点转换为树形数据
 * @param nodes - Component nodes
 * @returns {DataNode[]} Tree data nodes
 */
const convertToTreeData = (nodes: ComponentNode[]): DataNode[] => {
  return nodes.map((node) => ({
    key: node.id,
    title: `${node.name} (${node.type})`,
    children: node.children ? convertToTreeData(node.children) : undefined,
  }));
};

/**
 * Component tree component
 * Displays the component hierarchy in a tree structure
 * @param {ComponentTreeProps} props - Component props
 * @returns {JSX.Element} Component tree
 */
function ComponentTree({ onSelect }: ComponentTreeProps) {
  const { components, selectedComponent, setSelectedComponent } = useEditorStore();

  // 转换组件树数据
  const treeData = convertToTreeData(components);

  // 处理节点选择
  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const id = selectedKeys[0] as string;
      setSelectedComponent(id);
      onSelect(id);
    } else {
      setSelectedComponent(null);
      onSelect(null);
    }
  };

  if (treeData.length === 0) {
    return <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>暂无组件</div>;
  }

  return (
    <Tree
      treeData={treeData}
      selectedKeys={selectedComponent ? [selectedComponent] : []}
      onSelect={handleSelect}
      defaultExpandAll
    />
  );
}

export default ComponentTree;

