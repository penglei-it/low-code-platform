import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingProvider, GlobalLoading } from './components/LoadingProvider';
import Layout from './layouts/Layout';
import Editor from './pages/Editor';
import Home from './pages/Home';
import Projects from './pages/Projects';
import DataModels from './pages/DataModels';
import Workflows from './pages/Workflows';
import FormDesigner from './pages/FormDesigner';
import ApiDesigner from './pages/ApiDesigner';
import { dataSyncService } from './services/dataSync';
import { logger } from './utils/logger';

/**
 * Main application component
 * 主应用组件
 * @returns {JSX.Element} The root application component
 */
function App() {
  // 启用数据同步服务
  useEffect(() => {
    // 应用启动时，尝试从后端加载数据
    const initDataSync = async () => {
      try {
        // 静默同步，不显示错误提示（避免在数据库未初始化时显示错误）
        await dataSyncService.syncAll().catch((error) => {
          logger.debug('数据同步失败（可能是数据库未初始化）', error);
        });
      } catch (error) {
        logger.debug('数据同步初始化失败', error);
      }
    };

    // 延迟执行，避免阻塞应用启动
    const timer = setTimeout(initDataSync, 1000);

    // 启动自动同步（每5分钟同步一次）
    const stopAutoSync = dataSyncService.startAutoSync(5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      stopAutoSync();
    };
  }, []);

  return (
    <ErrorBoundary>
      <LoadingProvider>
        <DndProvider backend={HTML5Backend}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="editor/:projectId?" element={<Editor />} />
                <Route path="projects" element={<Projects />} />
                <Route path="data-models" element={<DataModels />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="form-designer" element={<FormDesigner />} />
                <Route path="api-designer" element={<ApiDesigner />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DndProvider>
        <GlobalLoading />
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;

