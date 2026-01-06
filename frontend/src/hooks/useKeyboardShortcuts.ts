import { useEffect } from 'react';
import { message } from 'antd';
import { useEditorStore } from '@/stores/editorStore';

/**
 * Keyboard shortcuts hook
 * 键盘快捷键Hook
 * @returns {void}
 */
export function useKeyboardShortcuts() {
  const {
    selectedComponent,
    selectedComponents,
    deleteComponent,
    copyComponent,
    pasteComponent,
    undo,
    redo,
    clearCanvas,
    selectAll,
    clearSelection,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的快捷键
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        message.info('已撤销');
        return;
      }

      // Ctrl/Cmd + Shift + Z: 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        message.info('已重做');
        return;
      }

      // Ctrl/Cmd + Y: 重做（备用）
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        message.info('已重做');
        return;
      }

      // Delete/Backspace: 删除选中组件
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedComponent || selectedComponents.length > 0)) {
        e.preventDefault();
        // 删除所有选中的组件
        const idsToDelete = selectedComponents.length > 0 ? selectedComponents : (selectedComponent ? [selectedComponent] : []);
        idsToDelete.forEach((id) => deleteComponent(id));
        message.success(`已删除 ${idsToDelete.length} 个组件`);
        return;
      }

      // Ctrl/Cmd + C: 复制
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedComponent) {
        e.preventDefault();
        const copied = copyComponent(selectedComponent);
        if (copied) {
          // 存储到剪贴板
          sessionStorage.setItem('copiedComponent', JSON.stringify(copied));
          message.success('组件已复制');
        }
        return;
      }

      // Ctrl/Cmd + V: 粘贴
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const copiedData = sessionStorage.getItem('copiedComponent');
        if (copiedData) {
          try {
            const component = JSON.parse(copiedData);
            pasteComponent(component);
            message.success('组件已粘贴');
          } catch (error) {
            message.error('粘贴失败：数据格式错误');
          }
        } else {
          message.warning('剪贴板为空');
        }
        return;
      }

      // Ctrl/Cmd + A: 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
        const state = useEditorStore.getState();
        if (state.selectedComponents.length > 0) {
          message.success(`已选中 ${state.selectedComponents.length} 个组件`);
        } else {
          message.info('画布中没有组件');
        }
        return;
      }

      // Escape: 取消选择
      if (e.key === 'Escape' && (selectedComponent || selectedComponents.length > 0)) {
        e.preventDefault();
        clearSelection();
        message.info('已取消选择');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponent, selectedComponents, deleteComponent, copyComponent, pasteComponent, undo, redo, selectAll, clearSelection]);
}

