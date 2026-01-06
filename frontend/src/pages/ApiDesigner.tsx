import { useEffect, useMemo, useState } from 'react';
import { FormListFieldData, FormListOperation } from 'antd/es/form';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
  Tabs,
  Divider,
  Alert,
  Tooltip,
  Descriptions,
  Collapse,
  Typography,
  Empty,
  Switch,
  List,
  AutoComplete,
} from 'antd';
import {
  PlusOutlined,
  ApiOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  FormatPainterOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { ApiDefinition, ApiTestResult, HttpMethod, ApiEnvironment, ApiErrorType, ApiParam } from '@/types/api';
import { commonRules, apiPathRule, httpMethodRule, jsonRule } from '@/utils/validation';
import { useLoadingContext } from '@/components/LoadingProvider';
import { apiDefinitionAPI, ApiDefinitionData } from '@/services/api';
import { handleError } from '@/utils/errorHandler';

// 使用ApiTestResult作为TestResult类型
type TestResult = ApiTestResult;

// 常见的HTTP请求头名称列表（用于自动补全）
const COMMON_HTTP_HEADERS = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Length',
  'Content-Type',
  'Cookie',
  'Date',
  'Expect',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'User-Agent',
  'Via',
  'Warning',
  'X-Requested-With',
  'X-Forwarded-For',
  'X-Forwarded-Proto',
  'X-Real-IP',
  'X-CSRF-Token',
  'X-API-Key',
  'X-Auth-Token',
  'X-Request-ID',
  'X-Correlation-ID',
];

// 常见HTTP请求头的示例值映射（用于智能提示）
const HEADER_VALUE_SUGGESTIONS: Record<string, string[]> = {
  'Accept': ['application/json', 'application/xml', 'text/html', 'text/plain', '*/*'],
  'Accept-Charset': ['UTF-8', 'ISO-8859-1', 'GBK'],
  'Accept-Encoding': ['gzip, deflate, br', 'gzip, deflate', 'identity'],
  'Accept-Language': ['zh-CN,zh;q=0.9,en;q=0.8', 'en-US,en;q=0.9', 'zh-CN'],
  'Authorization': ['Bearer <token>', 'Basic <credentials>', 'Digest <credentials>'],
  'Cache-Control': ['no-cache', 'no-store', 'max-age=3600', 'public', 'private'],
  'Content-Type': ['application/json', 'application/xml', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'],
  'Content-Length': ['<number>'],
  'Cookie': ['sessionId=xxx', 'token=xxx', 'sap-usercontext=sap-client=900'],
  'Origin': ['https://example.com', 'http://localhost:3000'],
  'Referer': ['https://example.com/page', 'http://localhost:3000'],
  'User-Agent': ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Apifox/1.0.0'],
  'X-Requested-With': ['XMLHttpRequest', 'X'],
  'X-API-Key': ['<your-api-key>'],
  'X-Auth-Token': ['<your-token>'],
  'X-CSRF-Token': ['<csrf-token>'],
  'X-Forwarded-For': ['<client-ip>'],
  'X-Forwarded-Proto': ['https', 'http'],
  'X-Real-IP': ['<client-ip>'],
};

/**
 * 根据请求头名称获取示例值建议
 * @param headerName 请求头名称
 * @returns 示例值数组
 */
function getHeaderValueSuggestions(headerName: string): string[] {
  if (!headerName) return [];
  const normalizedName = headerName.trim();
  // 精确匹配
  if (HEADER_VALUE_SUGGESTIONS[normalizedName]) {
    return HEADER_VALUE_SUGGESTIONS[normalizedName];
}
  // 大小写不敏感匹配
  const lowerName = normalizedName.toLowerCase();
  for (const [key, values] of Object.entries(HEADER_VALUE_SUGGESTIONS)) {
    if (key.toLowerCase() === lowerName) {
      return values;
    }
  }
  return [];
}

/**
 * API Designer page
 * @returns {JSX.Element} API designer and tester
 */
function ApiDesigner() {
  const [apis, setApis] = useState<ApiDefinition[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiDefinition | null>(null);
  const [form] = Form.useForm();
  const [testerForm] = Form.useForm();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [currentEnvironment, setCurrentEnvironment] = useState<string>('dev');
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([
    { id: 'dev', name: '开发环境', baseUrl: 'http://localhost:3001', description: '本地开发环境' },
    { id: 'test', name: '测试环境', baseUrl: 'https://test-api.example.com', description: '测试服务器' },
    { id: 'prod', name: '生产环境', baseUrl: 'https://api.example.com', description: '生产服务器' },
  ]);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [envForm] = Form.useForm();
  const [responseView, setResponseView] = useState<'pretty' | 'raw' | 'preview'>('pretty');
  const [enableValidation, setEnableValidation] = useState(false);
  const [expectedStatus, setExpectedStatus] = useState<number>(200);
  const [expectedFormat, setExpectedFormat] = useState<'json' | 'text' | 'any'>('json');
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python' | 'java' | 'php' | 'go'>('curl');
  const [useMockResponse, setUseMockResponse] = useState<boolean>(false); // 是否使用Mock响应
  const [sendCredentials, setSendCredentials] = useState<boolean>(true); // 是否发送Cookie（credentials），默认开启以匹配Apifox行为
  const [useProxy, setUseProxy] = useState<boolean>(true); // 是否使用代理（绕过CORS），默认开启
  const { withLoading } = useLoadingContext();

  // load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('api_designer_defs');
    if (saved) {
      try {
        setApis(JSON.parse(saved));
      } catch {
        // ignore broken cache
      }
    }
    // 加载环境配置
    const savedEnvs = localStorage.getItem('api_environments');
    if (savedEnvs) {
      try {
        setEnvironments(JSON.parse(savedEnvs));
      } catch {
        // ignore broken cache
      }
    }
    // 加载当前环境
    const savedEnv = localStorage.getItem('api_current_environment');
    if (savedEnv) {
      setCurrentEnvironment(savedEnv);
    }
  }, []);

  // 保存API定义到后端（带降级方案）
  const saveApi = async (api: ApiDefinition) => {
    try {
      const apiData: ApiDefinitionData = {
        name: api.name,
        path: api.path,
        method: api.method,
        description: api.description,
        queryParams: api.queryParams,
        headers: api.headers,
        bodySample: api.bodySample,
        mockResponse: api.mockResponse,
      };

      if (api.id && api.id.startsWith('api_')) {
        // 新创建的API，调用创建接口
        const created = await apiDefinitionAPI.create(apiData);
        // 更新本地状态
        // Update local state
        setApis((prev) => {
          const filtered = prev.filter((a) => a.id !== api.id);
          // 转换类型以确保兼容
          // Convert types to ensure compatibility
          const converted: ApiDefinition = {
            ...created,
            method: created.method as HttpMethod,
            queryParams: Array.isArray(created.queryParams) ? (created.queryParams as ApiParam[]) : undefined,
            headers: Array.isArray(created.headers) ? (created.headers as ApiParam[]) : undefined,
            bodySample: typeof created.bodySample === 'string' ? created.bodySample : (created.bodySample ? JSON.stringify(created.bodySample) : undefined),
          };
          return [...filtered, converted];
        });
        return created;
      } else {
        // 已存在的API，调用更新接口
        const updated = await apiDefinitionAPI.update(api.id, apiData);
        // 更新本地状态
        setApis((prev) => prev.map((a) => (a.id === api.id ? (updated as ApiDefinition) : a)));
        return updated as ApiDefinition;
      }
    } catch (error) {
      handleError(error, {
        customMessage: '保存失败，已保存到本地',
        logError: true,
      });
      // 降级方案：保存到localStorage
      const next = [...apis.filter((a) => a.id !== api.id), api];
      setApis(next);
      localStorage.setItem('api_designer_defs', JSON.stringify(next));
      return api;
    }
  };

  // 格式化JSON字符串
  const formatJSON = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  // 过滤API列表（搜索功能）
  const filteredApis = useMemo(() => {
    if (!searchText) return apis;
    const lowerSearch = searchText.toLowerCase();
    return apis.filter(
      (api) =>
        api.name.toLowerCase().includes(lowerSearch) ||
        api.path.toLowerCase().includes(lowerSearch) ||
        api.method.toLowerCase().includes(lowerSearch) ||
        (api.description && api.description.toLowerCase().includes(lowerSearch))
    );
  }, [apis, searchText]);

  // 获取当前环境的基础URL
  const getCurrentBaseUrl = (): string => {
    const env = environments.find((e) => e.id === currentEnvironment);
    return env?.baseUrl || '';
  };

  // 构建完整的API URL
  const buildFullUrl = (path: string): string => {
    // 如果是完整URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      // 如果启用代理且是外部URL，使用代理路径
      if (useProxy) {
        try {
          const url = new URL(path);
          // 检查是否是跨域请求
          const isCrossOrigin = url.origin !== window.location.origin;
          if (isCrossOrigin) {
            // 使用代理路径：/proxy-api + 原始路径（不包含协议和域名）
            // 代理服务器会转发到配置的target
            return `/proxy-api${url.pathname}${url.search}${url.hash}`;
          }
        } catch (e) {
          // URL解析失败，直接返回原路径
          console.warn('URL解析失败:', e);
        }
      }
      return path;
    }
    // 相对路径：使用环境基础URL
    const baseUrl = getCurrentBaseUrl();
    if (!baseUrl) return path;
    
    // 如果环境基础URL是外部URL且启用代理，也需要使用代理
    if (useProxy && (baseUrl.startsWith('http://') || baseUrl.startsWith('https://'))) {
      try {
        const baseUrlObj = new URL(baseUrl);
        const isCrossOrigin = baseUrlObj.origin !== window.location.origin;
        if (isCrossOrigin) {
          // 构建完整URL并使用代理
          const cleanBase = baseUrl.replace(/\/$/, '');
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          const fullUrl = `${cleanBase}${cleanPath}`;
          // 使用代理路径
          return `/proxy-api${new URL(fullUrl).pathname}${new URL(fullUrl).search}${new URL(fullUrl).hash}`;
        }
      } catch (e) {
        console.warn('URL解析失败:', e);
      }
    }
    
    // 确保baseUrl不以/结尾，path以/开头
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  // 生成请求代码
  const generateRequestCode = (language: string): string => {
    const values = testerForm.getFieldsValue();
    if (!values.method || !values.path) {
      return '// 请先配置请求方法和路径';
    }

    const fullUrl = buildFullUrl(values.path);
    const method = values.method;
    
    // 构建请求头：先使用API定义中配置的headers，再添加默认值
    const headers: Record<string, string> = {};
    
    // 从API定义中读取配置的请求头
    const selectedApi = apis.find((api) => api.id === values.target);
    if (selectedApi && selectedApi.headers && selectedApi.headers.length > 0) {
      selectedApi.headers.forEach((header) => {
        // 从description字段读取请求头的值（表单中"示例值 / 描述"输入框）
        const headerValue = header.description 
          ? header.description.trim()
          : (header.defaultValue ? String(header.defaultValue) : '');
        
        if (header.name && headerValue) {
          headers[header.name] = headerValue;
        }
      });
    }
    
    // 添加默认请求头（如果未配置）
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (!headers['Accept'] && !headers['accept']) {
      headers['Accept'] = 'application/json';
    }
    
    const body = values.body;

    switch (language) {
      case 'curl':
        let curlCmd = `curl --location --request ${method} '${fullUrl}' \\\n`;
        Object.entries(headers).forEach(([key, value]) => {
          curlCmd += `  --header '${key}: ${value}' \\\n`;
        });
        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          // 转义单引号
          const escapedBody = body.replace(/'/g, "'\\''");
          curlCmd += `  --data-raw '${escapedBody}'`;
        } else {
          curlCmd = curlCmd.slice(0, -3); // 移除最后的 \n
        }
        return curlCmd;

      case 'javascript':
        let jsCode = `fetch('${fullUrl}', {\n  method: '${method}',\n  headers: {\n`;
        Object.entries(headers).forEach(([key, value]) => {
          jsCode += `    '${key}': '${value}',\n`;
        });
        jsCode = jsCode.slice(0, -2) + '\n  }';
        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          try {
            // 尝试解析JSON，如果成功则使用JSON.stringify
            JSON.parse(body);
            jsCode += `,\n  body: JSON.stringify(${body})`;
          } catch {
            // 如果不是有效JSON，直接使用字符串
            jsCode += `,\n  body: '${body.replace(/'/g, "\\'")}'`;
          }
        }
        jsCode += '\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(\'Error:\', error));';
        return jsCode;

      case 'python':
        let pyCode = `import requests\n\nurl = '${fullUrl}'\nheaders = {\n`;
        Object.entries(headers).forEach(([key, value]) => {
          pyCode += `    '${key}': '${value}',\n`;
        });
        pyCode += '}\n';
        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          try {
            // 尝试解析JSON
            const parsed = JSON.parse(body);
            pyCode += `data = ${JSON.stringify(parsed, null, 2)}\n`;
            pyCode += `response = requests.${method.toLowerCase()}(url, headers=headers, json=data)\n`;
          } catch {
            pyCode += `data = '${body.replace(/'/g, "\\'")}'\n`;
            pyCode += `response = requests.${method.toLowerCase()}(url, headers=headers, data=data)\n`;
          }
        } else {
          pyCode += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
        }
        pyCode += 'print(response.json())';
        return pyCode;

      case 'java':
        let javaCode = `HttpClient client = HttpClient.newHttpClient();\n`;
        javaCode += `HttpRequest request = HttpRequest.newBuilder()\n`;
        javaCode += `  .uri(URI.create("${fullUrl}"))\n`;
        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          javaCode += `  .${method.toLowerCase()}(HttpRequest.BodyPublishers.ofString("${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"))\n`;
        } else {
          javaCode += `  .${method.toLowerCase()}()\n`;
        }
        Object.entries(headers).forEach(([key, value]) => {
          javaCode += `  .header("${key}", "${value}")\n`;
        });
        javaCode += `  .build();\n`;
        javaCode += `HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n`;
        javaCode += `System.out.println(response.body());`;
        return javaCode;

      case 'php':
        let phpCode = `<?php\n$url = '${fullUrl}';\n$headers = [\n`;
        Object.entries(headers).forEach(([key, value]) => {
          phpCode += `  '${key}' => '${value}',\n`;
        });
        phpCode += '];\n';
        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          try {
            const parsed = JSON.parse(body);
            phpCode += `$data = ${JSON.stringify(parsed)};\n`;
          } catch {
            phpCode += `$data = '${body.replace(/'/g, "\\'")}';\n`;
          }
          phpCode += `$ch = curl_init($url);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n`;
          phpCode += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));\n`;
        } else {
          phpCode += `$ch = curl_init($url);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n`;
        }
        phpCode += `curl_setopt($ch, CURLOPT_HTTPHEADER, array_map(function($k, $v) { return "$k: $v"; }, array_keys($headers), $headers));\n`;
        phpCode += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
        phpCode += `$response = curl_exec($ch);\n`;
        phpCode += `curl_close($ch);\n`;
        phpCode += `echo $response;`;
        return phpCode;

      case 'go':
        let goCode = `package main\n\nimport (\n\t"bytes"\n\t"encoding/json"\n\t"net/http"\n\t"fmt"\n)\n\nfunc main() {\n\turl := "${fullUrl}"\n`;
        if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          try {
            const parsed = JSON.parse(body);
            goCode += `\tjsonData := ${JSON.stringify(parsed)}\n`;
            goCode += `\tjsonValue, _ := json.Marshal(jsonData)\n`;
          } catch {
            goCode += `\tjsonValue := []byte(\`${body.replace(/`/g, '\\`')}\`)\n`;
          }
          goCode += `\treq, _ := http.NewRequest("${method}", url, bytes.NewBuffer(jsonValue))\n`;
        } else {
          goCode += `\treq, _ := http.NewRequest("${method}", url, nil)\n`;
        }
        Object.entries(headers).forEach(([key, value]) => {
          goCode += `\treq.Header.Set("${key}", "${value}")\n`;
        });
        goCode += `\tclient := &http.Client{}\n`;
        goCode += `\tresp, _ := client.Do(req)\n`;
        goCode += `\tdefer resp.Body.Close()\n`;
        goCode += `\tfmt.Println(resp.Status)\n`;
        goCode += `}`;
        return goCode;

      default:
        return '// 不支持的语言';
    }
  };

  const columns = useMemo(
    () => [
      { title: '名称', dataIndex: 'name', key: 'name' },
      {
        title: '方法',
        dataIndex: 'method',
        key: 'method',
        render: (m: HttpMethod) => <Tag color="blue">{m}</Tag>,
      },
      { title: '路径', dataIndex: 'path', key: 'path' },
      { title: '描述', dataIndex: 'description', key: 'description' },
      {
        title: '操作',
        key: 'actions',
        render: (_: unknown, record: ApiDefinition) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
            <Button type="link" onClick={() => handleFillTester(record)}>
              测试
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      method: 'GET',
      queryParams: [{ name: 'id', type: 'string', required: true }],
      headers: [{ name: 'Content-Type', type: 'string', required: true, description: 'application/json' }],
      mockResponse: '{\n  "code": 0,\n  "data": []\n}',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: ApiDefinition) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      bodySample: record.bodySample || '{\n  "example": true\n}',
      mockResponse: record.mockResponse || '{\n  "code": 0,\n  "data": []\n}',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除？',
      onOk: async () => {
        try {
          // 如果ID不是临时ID，调用后端删除
          if (!id.startsWith('api_')) {
            await apiDefinitionAPI.delete(id);
          }
          // 更新本地状态
          const next = apis.filter((api: ApiDefinition) => api.id !== id);
          setApis(next);
          // 同时更新localStorage作为备份
          localStorage.setItem('api_designer_defs', JSON.stringify(next));
          message.success('已删除');
        } catch (error) {
          handleError(error, {
            customMessage: '删除失败，已从本地移除',
            logError: true,
          });
          // 降级方案：从本地状态移除
          const next = apis.filter((api: ApiDefinition) => api.id !== id);
          setApis(next);
          localStorage.setItem('api_designer_defs', JSON.stringify(next));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: ApiDefinition = {
        id: editing ? editing.id : `api_${Date.now()}`,
        ...values,
      };
      
      // 保存到后端
      const saved = await saveApi(payload);
      
      setIsModalOpen(false);
      message.success(editing ? '已更新' : '已新增');
    } catch (error) {
      handleError(error, {
        customMessage: '保存失败',
        logError: true,
      });
    }
  };

  const handleFillTester = (record: ApiDefinition) => {
    setSelectedApiId(record.id);
    testerForm.setFieldsValue({
      target: record.id,
      method: record.method,
      path: record.path,
      body: record.bodySample || '',
    });
    setTestResult(null);
    message.info('已填充到测试器');
  };

  // Execute a mock or real request
  const handleTest = async () => {
    await withLoading('api-test', async () => {
    try {
      const values = await testerForm.validateFields();
        const target = apis.find((api: ApiDefinition) => api.id === values.target);
      if (!target) {
        message.error('请选择API');
        return;
      }

        // 检查是否使用Mock响应
        // 优先级：1. 路径是完整URL时强制使用真实请求 2. 用户手动选择使用Mock 3. 有环境URL时优先使用真实请求
        const isFullUrl = target.path.startsWith('http');
        const useMock = !isFullUrl && useMockResponse && target.mockResponse;
        const useRealApi = isFullUrl || (!useMock && (getCurrentBaseUrl() || !target.mockResponse));

        if (useMock) {
          // 使用Mock响应
          try {
            const mockData = JSON.parse(target.mockResponse!);
            setTestResult({
              status: 'success',
              output: mockData,
            });
            message.success('测试成功（Mock）');
          } catch {
            message.error('Mock响应格式错误');
          }
        } else if (useRealApi) {
          // 发送真实请求
          const fullUrl = buildFullUrl(values.path);
          const startTime = Date.now();
          try {
            // 构建请求头：先使用API定义中配置的headers，再添加Content-Type
            const requestHeaders: Record<string, string> = {};
            
            // 从API定义中读取配置的请求头
            // 注意：根据表单设计，请求头的值存储在description字段中
            if (target.headers && target.headers.length > 0) {
              target.headers.forEach((header) => {
                // 从header的description字段获取值（表单中"示例值 / 描述"输入框）
                // 如果description为空，尝试从defaultValue获取
                const headerValue = header.description 
                  ? header.description.trim()
                  : (header.defaultValue ? String(header.defaultValue) : '');
                
                // 只有当header名称和值都存在时才添加
                if (header.name && headerValue) {
                  requestHeaders[header.name] = headerValue;
                }
              });
            }
            
            // 如果请求体存在，确保Content-Type被设置（如果未配置）
            const requestBody = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(values.method) ? values.body : undefined;
            if (requestBody && !requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
              requestHeaders['Content-Type'] = 'application/json';
            }
            
            // 构建fetch选项
            const fetchOptions: RequestInit = {
              method: values.method,
              headers: requestHeaders,
              body: requestBody,
            };
            
            // 如果使用代理，不需要设置credentials和mode（代理是同源请求）
            // 如果不使用代理，需要设置CORS相关选项
            if (!useProxy || !fullUrl.startsWith('/proxy-api')) {
              // 重要：设置credentials以发送Cookie（与Apifox行为一致）
              // 'include' - 总是发送Cookie，即使是跨域请求（需要服务器支持Access-Control-Allow-Credentials: true）
              // 'same-origin' - 仅同源请求发送Cookie
              // 'omit' - 不发送Cookie
              fetchOptions.credentials = sendCredentials ? 'include' : 'same-origin';
              // 设置mode以处理CORS
              fetchOptions.mode = 'cors';
      } else {
              // 使用代理时，请求是同源的，不需要特殊CORS配置
              fetchOptions.credentials = 'same-origin';
              fetchOptions.mode = 'same-origin';
            }
            
            const res = await fetch(fullUrl, fetchOptions);

            // 获取响应头
            const responseHeaders: Record<string, string> = {};
            res.headers.forEach((value, key) => {
              responseHeaders[key] = value;
            });

            const responseTime = Date.now() - startTime;
            const contentType = res.headers.get('content-type') || '';

            // 尝试解析响应（无论状态码如何）
            let output: unknown;
            let responseSize = 0;
            let errorMessage: string | undefined;

            try {
              const responseText = await res.text();
              responseSize = new Blob([responseText]).size;

              if (contentType.includes('application/json')) {
                try {
                  output = responseText ? JSON.parse(responseText) : {};
                  // 如果是错误响应，尝试提取错误信息
                  if (!res.ok && typeof output === 'object' && output !== null) {
                    const errorObj = output as Record<string, unknown>;
                    // 尝试从常见错误字段提取信息
                    errorMessage =
                      (errorObj.error as string) ||
                      (errorObj.message as string) ||
                      (errorObj.msg as string) ||
                      (errorObj.errorMessage as string) ||
                      (errorObj.detail as string) ||
                      responseText;
                  }
                } catch {
                  output = responseText;
                  if (!res.ok) {
                    errorMessage = responseText;
                  }
                }
      } else {
                output = responseText;
                if (!res.ok) {
                  errorMessage = responseText || `HTTP ${res.status} ${res.statusText}`;
                }
              }
            } catch (parseError) {
              output = '无法解析响应';
              if (!res.ok) {
                errorMessage = `HTTP ${res.status} ${res.statusText}`;
              }
            }

            // 构建错误信息
            let errorType: ApiErrorType = 'unknown';
            let errorSuggestions: string[] = [];
            
            if (!res.ok) {
              // 根据状态码判断错误类型
              if (res.status >= 500) {
                errorType = 'server';
                errorSuggestions = [
                  '服务器内部错误，请联系后端开发人员',
                  '检查服务器日志查看详细错误信息',
                  '确认服务器是否正常运行',
                ];
              } else if (res.status >= 400) {
                errorType = 'client';
                if (res.status === 401) {
                  errorSuggestions = ['检查认证信息是否正确', '确认Token是否有效', '检查是否需要登录'];
                } else if (res.status === 403) {
                  errorSuggestions = ['检查是否有访问权限', '确认用户角色和权限配置', '检查CSRF Token是否正确'];
                } else if (res.status === 404) {
                  errorSuggestions = ['检查API路径是否正确', '确认资源是否存在', '检查路由配置'];
                } else if (res.status === 405) {
                  errorSuggestions = [
                    '检查HTTP方法是否正确（GET/POST/PUT/DELETE）',
                    '如果是OPTIONS预检请求，确保服务器支持OPTIONS方法',
                    '检查CORS配置是否正确',
                  ];
                } else if (res.status === 422) {
                  errorSuggestions = ['检查请求参数格式是否正确', '验证必填字段是否都已提供', '检查数据验证规则'];
                } else {
                  errorSuggestions = [`HTTP ${res.status} 错误，请检查请求参数和服务器配置`];
                }
              }
              
              if (!errorMessage) {
                errorMessage = `HTTP ${res.status} ${res.statusText}`;
                if (typeof output === 'string' && output.trim()) {
                  errorMessage = output.trim();
                } else if (typeof output === 'object' && output !== null) {
                  const errorObj = output as Record<string, unknown>;
                  errorMessage =
                    (errorObj.error as string) ||
                    (errorObj.message as string) ||
                    (errorObj.msg as string) ||
                    (errorObj.errorMessage as string) ||
                    (errorObj.detail as string) ||
                    errorMessage;
                }
              }
            }

            setTestResult({
              status: res.ok ? 'success' : 'error',
              output,
              statusCode: res.status,
              responseTime,
              isMock: false,
              requestUrl: fullUrl,
              requestMethod: values.method,
              requestHeaders,
              requestBody: requestBody || undefined,
              responseHeaders,
              responseSize,
              contentType,
              error: errorMessage,
              errorType: res.ok ? undefined : errorType,
              errorSuggestions: res.ok ? undefined : errorSuggestions,
              errorDetails: res.ok ? undefined : `HTTP ${res.status} ${res.statusText}`,
            });

            if (res.ok) {
              message.success('测试成功');
            } else {
              message.warning(`请求完成但返回错误状态: ${res.status}`);
            }
          } catch (fetchError) {
            // 智能错误分析和友好提示
            let errorMessage = '网络请求失败';
            let errorType: ApiErrorType = 'unknown';
            let errorSuggestions: string[] = [];
            let errorDetails = '';
            
            // 分析错误类型和原因
            if (fetchError instanceof TypeError) {
              const msg = fetchError.message.toLowerCase();
              errorDetails = fetchError.message;
              
              // 检查是否是CORS错误（Failed to fetch通常是CORS或连接问题）
              if (msg.includes('failed to fetch')) {
                // 尝试判断是CORS还是连接问题
                const requestUrl = buildFullUrl(values.path);
                const isCrossOrigin = requestUrl.startsWith('http') && 
                  !requestUrl.startsWith(window.location.origin);
                
                if (isCrossOrigin) {
                  errorType = 'cors';
                  errorMessage = 'CORS跨域错误：服务器不允许跨域请求';
                  errorSuggestions = [
                    '在服务器端配置CORS响应头：Access-Control-Allow-Origin: * 或指定域名',
                    '检查请求方法是否被允许：Access-Control-Allow-Methods',
                    '检查请求头是否被允许：Access-Control-Allow-Headers',
                    '如果是OPTIONS预检请求失败（405），确保服务器正确处理OPTIONS请求',
                    '检查服务器是否返回了正确的CORS响应头',
                  ];
                } else {
                  errorType = 'network';
                  errorMessage = '无法连接到服务器';
                  errorSuggestions = [
                    `检查服务器地址是否正确：${requestUrl}`,
                    '确认服务器是否已启动并运行',
                    '检查网络连接是否正常',
                    '检查防火墙或代理设置',
                    '如果使用localhost，确认端口号是否正确',
                  ];
                }
              } else if (msg.includes('networkerror')) {
                errorType = 'network';
                errorMessage = '网络错误';
                errorSuggestions = [
                  '检查网络连接',
                  '确认服务器地址可访问',
                  '检查防火墙设置',
                ];
              } else {
                errorMessage = fetchError.message || '网络请求失败';
                errorType = 'network';
              }
            } else if (fetchError instanceof Error) {
              errorMessage = fetchError.message;
              errorDetails = fetchError.stack || fetchError.message;
              
              const msg = fetchError.message.toLowerCase();
              if (msg.includes('cors') || msg.includes('cross-origin')) {
                errorType = 'cors';
                errorMessage = 'CORS跨域错误';
                errorSuggestions = [
                  '在服务器端配置CORS头（Access-Control-Allow-Origin）',
                  '使用代理服务器转发请求',
                  '检查请求头配置',
                ];
              } else if (msg.includes('timeout')) {
                errorType = 'timeout';
                errorMessage = '请求超时';
                errorSuggestions = [
                  '检查服务器是否正常运行',
                  '检查网络连接速度',
                  '增加请求超时时间',
                ];
              } else {
                errorType = 'network';
              }
            } else {
              errorDetails = String(fetchError);
            }
            
            setTestResult({
              status: 'error',
              output: null,
              error: errorMessage,
              requestUrl: buildFullUrl(values.path),
              requestMethod: values.method,
              isMock: false,
              errorType,
              errorSuggestions,
              errorDetails,
            });
            message.error(`测试失败: ${errorMessage}`);
          }
        } else {
          // 既没有Mock响应，也没有环境URL，且路径不是完整URL
          message.warning('该API未配置Mock响应，且未配置环境基础URL。请配置Mock响应或设置环境基础URL，或使用完整URL');
          setTestResult({
            status: 'error',
            output: null,
            error: '无法发送请求：未配置Mock响应且未配置环境基础URL',
            requestUrl: buildFullUrl(values.path),
            requestMethod: values.method,
            isMock: false,
          });
        }
      } catch (error) {
        message.error('测试失败');
        setTestResult({
          status: 'error',
          output: error,
          error: error instanceof Error ? error.message : '未知错误',
        });
      }
    });
  };

  // 检查当前选择的API是否配置了Mock响应
  const selectedApi = apis.find((api) => api.id === selectedApiId);
  const showMockWarning = selectedApi && !selectedApi.mockResponse;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {showMockWarning && (
        <Alert
          message="该API未配置Mock响应"
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      <Card
        title={
          <Space>
            <ApiOutlined />
            API设计器
          </Space>
        }
        extra={
          <Space>
            {/* 环境选择 */}
            <Select
              value={currentEnvironment}
              onChange={(value) => {
                setCurrentEnvironment(value);
                localStorage.setItem('api_current_environment', value);
              }}
              style={{ width: 120 }}
              suffixIcon={<EnvironmentOutlined />}
            >
              {environments.map((env) => (
                <Select.Option key={env.id} value={env.id}>
                  {env.name}
                </Select.Option>
              ))}
            </Select>
            {/* 环境配置按钮 */}
            <Tooltip title="环境配置">
              <Button icon={<SettingOutlined />} onClick={() => setIsEnvModalOpen(true)}>
                环境
              </Button>
            </Tooltip>
            {/* 新建API按钮 */}
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建API
          </Button>
          </Space>
        }
      >
        {/* 搜索框 */}
        <Input
          placeholder="搜索API（按名称、路径、方法、描述）"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />
        <Table dataSource={filteredApis} columns={columns} rowKey="id" pagination={false} />
      </Card>

      <Card title="接口测试">
        <Form form={testerForm} layout="vertical">
          <Form.Item label="选择API" name="target" rules={[{ required: true, message: '请选择API' }]}>
            <Select
              placeholder="请选择API"
              onChange={(value) => {
                setSelectedApiId(value);
                const selected = apis.find((api) => api.id === value);
                if (selected) {
                  testerForm.setFieldsValue({
                    method: selected.method,
                    path: selected.path,
                  });
                }
              }}
            >
              {apis.map((api: ApiDefinition) => (
                <Select.Option value={api.id} key={api.id}>
                  {api.name} ({api.method} {api.path})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="请求方法" name="method" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="请求地址" name="path" rules={[{ required: true }]}>
            <Input
              placeholder="例如：/api/users 或 https://api.example.com/users"
              addonBefore={
                <Select
                  value={currentEnvironment}
                  onChange={(value) => {
                    setCurrentEnvironment(value);
                    localStorage.setItem('api_current_environment', value);
                  }}
                  style={{ width: 100 }}
                >
                  {environments.map((env) => (
                    <Select.Option key={env.id} value={env.id}>
                      {env.name}
                    </Select.Option>
                  ))}
                </Select>
              }
              suffix={
                <Tooltip title="格式化JSON">
                  <Button
                    type="text"
                    size="small"
                    icon={<FormatPainterOutlined />}
                    onClick={() => {
                      const path = testerForm.getFieldValue('path');
                      if (path) {
                        try {
                          testerForm.setFieldsValue({ path: formatJSON(path) });
                          message.success('格式化成功');
                        } catch {
                          message.error('JSON格式错误，无法格式化');
                        }
                      }
                    }}
                  />
                </Tooltip>
              }
            />
          </Form.Item>
          <Form.Item
            label="请求体（JSON）"
            name="body"
            extra={
              <Space>
                <Tooltip title="格式化JSON">
                  <Button
                    type="link"
                    size="small"
                    icon={<FormatPainterOutlined />}
                    onClick={() => {
                      const body = testerForm.getFieldValue('body');
                      if (body) {
                        try {
                          testerForm.setFieldsValue({ body: formatJSON(body) });
                          message.success('格式化成功');
                        } catch {
                          message.error('JSON格式错误，无法格式化');
                        }
                      }
                    }}
                  >
                    格式化
                  </Button>
                </Tooltip>
                <Tooltip title="复制JSON">
                  <Button
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      const body = testerForm.getFieldValue('body');
                      if (body) {
                        navigator.clipboard.writeText(body);
                        message.success('已复制到剪贴板');
                      }
                    }}
                  >
                    复制
                  </Button>
                </Tooltip>
              </Space>
            }
          >
            <Input.TextArea rows={6} placeholder='例如：{"name":"Tom"}' />
          </Form.Item>
          <Space>
            {/* Mock响应开关 - 仅当API配置了Mock且路径不是完整URL时显示 */}
            {(() => {
              const selectedApi = apis.find((api) => api.id === testerForm.getFieldValue('target'));
              const hasMock = selectedApi && selectedApi.mockResponse && !selectedApi.path.startsWith('http');
              if (hasMock) {
                return (
                  <Space>
                    <Typography.Text type="secondary">使用Mock:</Typography.Text>
                    <Switch
                      checked={useMockResponse}
                      onChange={setUseMockResponse}
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                    />
                  </Space>
                );
              }
              return null;
            })()}
            {/* Cookie开关 - 控制是否发送Cookie（credentials） */}
            <Space>
              <Typography.Text type="secondary">发送Cookie:</Typography.Text>
              <Switch
                checked={sendCredentials}
                onChange={setSendCredentials}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
              <Tooltip title="开启后会在请求中包含Cookie（如sap-usercontext），与Apifox行为一致。需要服务器支持Access-Control-Allow-Credentials: true">
                <InfoCircleOutlined style={{ color: '#999', cursor: 'help' }} />
              </Tooltip>
            </Space>
            {/* 代理开关 - 控制是否使用代理绕过CORS */}
            <Space>
              <Typography.Text type="secondary">使用代理:</Typography.Text>
              <Switch
                checked={useProxy}
                onChange={setUseProxy}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
              <Tooltip title="开启后外部API请求将通过开发服务器代理转发，可绕过CORS限制（与Apifox类似）。关闭则直接请求，需要服务器正确配置CORS">
                <InfoCircleOutlined style={{ color: '#999', cursor: 'help' }} />
              </Tooltip>
            </Space>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleTest}>
            发送测试
          </Button>
          </Space>
        </Form>

        <Divider />
        <Card
          title={
            <Space>
              <span>测试结果</span>
              {testResult && (
                <>
                  {testResult.status === 'success' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  {testResult.statusCode && (
                    <Tag color={testResult.statusCode < 400 ? 'green' : testResult.statusCode < 500 ? 'orange' : 'red'}>
                      {testResult.statusCode}
                    </Tag>
                  )}
                  {testResult.isMock && <Tag color="purple">Mock</Tag>}
                  {testResult.responseTime !== undefined && (
                    <Tag color="blue">{testResult.responseTime}ms</Tag>
                  )}
                  {testResult.responseSize !== undefined && (
                    <Tag color="cyan">
                      {testResult.responseSize < 1024
                        ? `${testResult.responseSize}B`
                        : `${(testResult.responseSize / 1024).toFixed(2)}KB`}
                    </Tag>
                  )}
                </>
              )}
            </Space>
          }
          extra={
            testResult && (
              <Space>
                <Tooltip title="复制结果">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      if (testResult.output !== null && testResult.output !== undefined) {
                        const text =
                          typeof testResult.output === 'string'
                            ? testResult.output
                            : JSON.stringify(testResult.output, null, 2);
                        navigator.clipboard.writeText(text);
                        message.success('已复制到剪贴板');
                      }
                    }}
                  />
                </Tooltip>
              </Space>
            )
          }
        >
          {testResult ? (
            <Tabs
              defaultActiveKey="response"
              items={[
                {
                  key: 'response',
                  label: (
                    <Space>
                      <FileTextOutlined />
                      响应
                    </Space>
                  ),
                  children: (
                    <div>
                      {/* 错误信息展示 - 更醒目的位置和更详细的信息 */}
                      {(testResult.error || (testResult.statusCode && testResult.statusCode >= 400)) && (
                        <Alert
                          message={
                            <Space>
                              <span>请求错误</span>
                              {testResult.statusCode && (
                                <Tag color={testResult.statusCode < 500 ? 'orange' : 'red'}>
                                  {testResult.statusCode}
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <div>
                              <Typography.Text strong style={{ display: 'block', marginBottom: 8, fontSize: '14px' }}>
                                错误详情：
                              </Typography.Text>
                              <Typography.Text
                                code
                                style={{
                                  display: 'block',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  fontSize: '13px',
                                  padding: '8px',
                                  backgroundColor: '#fff2f0',
                                  borderRadius: '4px',
                                  color: '#ff4d4f',
                                }}
                              >
                                {(() => {
                                  // 优先显示响应体中的错误信息
                                  if (testResult.output) {
                                    if (typeof testResult.output === 'string' && testResult.output.trim()) {
                                      return testResult.output.trim();
                                    }
                                    if (typeof testResult.output === 'object' && testResult.output !== null) {
                                      const errorObj = testResult.output as Record<string, unknown>;
                                      const errorText =
                                        (errorObj.error as string) ||
                                        (errorObj.message as string) ||
                                        (errorObj.msg as string) ||
                                        (errorObj.errorMessage as string) ||
                                        (errorObj.detail as string) ||
                                        JSON.stringify(testResult.output, null, 2);
                                      return String(errorText);
                                    }
                                  }
                                  // 其次显示error字段
                                  if (testResult.error) {
                                    return testResult.error;
                                  }
                                  // 最后显示状态码
                                  return testResult.statusCode
                                    ? `HTTP ${testResult.statusCode} 错误`
                                    : '未知错误';
                                })()}
                              </Typography.Text>
                              {/* 如果响应体是对象，也显示完整内容 */}
                              {testResult.output &&
                                typeof testResult.output === 'object' &&
                                testResult.output !== null &&
                                !testResult.error && (
                                  <div style={{ marginTop: 12 }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                      完整响应内容：
                                    </Typography.Text>
                                    <div
                                      className="api-tester-result-error-message"
                                      style={{
                                        maxHeight: '200px',
                                        overflow: 'auto',
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-all',
                                        overflowWrap: 'break-word',
                                      }}
                                    >
                                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {String(JSON.stringify(testResult.output, null, 2))}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                            </div>
                          }
                          type="error"
                          showIcon
                          style={{ marginBottom: 16 }}
                          closable
                        />
                      )}
                      {testResult.output !== null && testResult.output !== undefined ? (
                        <div>
                          {/* 响应视图切换 */}
                          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                              <Typography.Text type="secondary">视图:</Typography.Text>
                              <Button.Group>
                                <Button
                                  type={responseView === 'pretty' ? 'primary' : 'default'}
                                  size="small"
                                  onClick={() => setResponseView('pretty')}
                                >
                                  Pretty
                                </Button>
                                <Button
                                  type={responseView === 'raw' ? 'primary' : 'default'}
                                  size="small"
                                  onClick={() => setResponseView('raw')}
                                >
                                  Raw
                                </Button>
                                <Button
                                  type={responseView === 'preview' ? 'primary' : 'default'}
                                  size="small"
                                  onClick={() => setResponseView('preview')}
                                  disabled={typeof testResult.output !== 'string' || !testResult.contentType?.includes('html')}
                                >
                                  Preview
                                </Button>
                              </Button.Group>
                            </Space>
                            <Space>
                              <Typography.Text type="secondary">响应类型:</Typography.Text>
                              <Tag>{testResult.contentType || 'application/json'}</Tag>
                            </Space>
                          </div>

                          {/* 响应内容展示 */}
                          {responseView === 'pretty' && (
                            <div className="api-tester-result-container">
                              <pre>
                                {typeof testResult.output === 'string'
                                  ? (() => {
                                      try {
                                        const parsed = JSON.parse(testResult.output);
                                        return JSON.stringify(parsed, null, 2);
                                      } catch {
                                        return testResult.output;
                                      }
                                    })()
                                  : JSON.stringify(testResult.output, null, 2)}
                              </pre>
                            </div>
                          )}
                          {responseView === 'raw' && (
                            <div className="api-tester-result-container">
                              <pre>
                                {typeof testResult.output === 'string'
                                  ? testResult.output
                                  : JSON.stringify(testResult.output)}
                              </pre>
                            </div>
                          )}
                          {responseView === 'preview' && typeof testResult.output === 'string' && (
                            <div
                              style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                padding: '16px',
                                backgroundColor: '#fff',
                                minHeight: '200px',
                              }}
                              dangerouslySetInnerHTML={{ __html: testResult.output }}
                            />
                          )}
                        </div>
                      ) : (
                        <Empty description="无响应数据" />
                      )}

                      {/* 响应校验 */}
                      <Divider style={{ margin: '16px 0' }} />
                      <div>
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <Typography.Text strong>校验响应</Typography.Text>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => setEnableValidation(!enableValidation)}
                            >
                              {enableValidation ? '关闭' : '开启'}
                            </Button>
                          </Space>
                        </div>
                        {enableValidation && (
                          <div>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                              <Space>
                                <Typography.Text type="secondary">期望状态码:</Typography.Text>
                                <Select
                                  value={expectedStatus}
                                  onChange={setExpectedStatus}
                                  style={{ width: 120 }}
                                  size="small"
                                >
                                  <Select.Option value={200}>200 OK</Select.Option>
                                  <Select.Option value={201}>201 Created</Select.Option>
                                  <Select.Option value={204}>204 No Content</Select.Option>
                                  <Select.Option value={400}>400 Bad Request</Select.Option>
                                  <Select.Option value={401}>401 Unauthorized</Select.Option>
                                  <Select.Option value={403}>403 Forbidden</Select.Option>
                                  <Select.Option value={404}>404 Not Found</Select.Option>
                                  <Select.Option value={500}>500 Server Error</Select.Option>
                                </Select>
                                <Typography.Text type="secondary">期望格式:</Typography.Text>
                                <Select
                                  value={expectedFormat}
                                  onChange={setExpectedFormat}
                                  style={{ width: 100 }}
                                  size="small"
                                >
                                  <Select.Option value="json">JSON</Select.Option>
                                  <Select.Option value="text">Text</Select.Option>
                                  <Select.Option value="any">Any</Select.Option>
                                </Select>
                              </Space>
                              <div>
                                <Typography.Text strong>校验结果:</Typography.Text>
                                <div style={{ marginTop: 8 }}>
                                  {testResult.statusCode !== undefined && (
                                    <div style={{ marginBottom: 8 }}>
                                      {testResult.statusCode === expectedStatus ? (
                                        <Space>
                                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                          <Typography.Text>
                                            HTTP 状态码应当是 {expectedStatus}
                                          </Typography.Text>
                                        </Space>
                                      ) : (
                                        <Space>
                                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                          <Typography.Text type="danger">
                                            HTTP 状态码应当是 {expectedStatus}，实际为 {testResult.statusCode}
                                          </Typography.Text>
                                        </Space>
                                      )}
                                    </div>
                                  )}
                                  {expectedFormat === 'json' && (
                                    <div>
                                      {(() => {
                                        try {
                                          if (typeof testResult.output === 'string') {
                                            JSON.parse(testResult.output);
                                          } else {
                                            JSON.stringify(testResult.output);
                                          }
                                          return (
                                            <Space>
                                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                              <Typography.Text>
                                                返回的数据格式应当是 JSON
                                              </Typography.Text>
                                            </Space>
                                          );
                                        } catch {
                                          return (
                                            <Space>
                                              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                              <Typography.Text type="danger">
                                                返回的数据格式应当是 JSON
                                              </Typography.Text>
                                            </Space>
                                          );
                                        }
                                      })()}
                                    </div>
                                  )}
                                  {expectedFormat === 'text' && (
                                    <div>
                                      {typeof testResult.output === 'string' ? (
                                        <Space>
                                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                          <Typography.Text>
                                            返回的数据格式是文本
                                          </Typography.Text>
                                        </Space>
                                      ) : (
                                        <Space>
                                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                          <Typography.Text type="danger">
                                            返回的数据格式应当是文本，实际为 JSON
                                          </Typography.Text>
                                        </Space>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Space>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'headers',
                  label: (
                    <Space>
                      <InfoCircleOutlined />
                      响应头
                    </Space>
                  ),
                  children: testResult.responseHeaders ? (
                    <Descriptions column={1} bordered size="small">
                      {Object.entries(testResult.responseHeaders).map(([key, value]) => (
                        <Descriptions.Item key={key} label={key}>
                          {value}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  ) : (
                    <Empty description="无响应头信息" />
                  ),
                },
                {
                  key: 'request',
                  label: (
                    <Space>
                      <CodeOutlined />
                      请求信息
                    </Space>
                  ),
                  children: (
                    <Collapse
                      items={[
                        {
                          key: 'url',
                          label: '请求URL',
                          children: (
                            <Typography.Text code copyable>
                              {testResult.requestUrl || 'N/A'}
                            </Typography.Text>
                          ),
                        },
                        {
                          key: 'method',
                          label: '请求方法',
                          children: (
                            <Tag color="blue">{testResult.requestMethod || 'N/A'}</Tag>
                          ),
                        },
                        {
                          key: 'requestHeaders',
                          label: '请求头',
                          children: testResult.requestHeaders ? (
                            <Descriptions column={1} bordered size="small">
                              {Object.entries(testResult.requestHeaders).map(([key, value]) => (
                                <Descriptions.Item key={key} label={key}>
                                  {value}
                                </Descriptions.Item>
                              ))}
                            </Descriptions>
                          ) : (
                            <Empty description="无请求头信息" />
                          ),
                        },
                        {
                          key: 'requestBody',
                          label: '请求体',
                          children: testResult.requestBody ? (
                            <pre className="api-tester-result" style={{ maxHeight: '300px' }}>
                              {testResult.requestBody}
                            </pre>
                          ) : (
                            <Typography.Text type="secondary">无请求体</Typography.Text>
                          ),
                        },
                        {
                          key: 'requestCode',
                          label: '请求代码',
                          children: (
                            <div>
                              <div style={{ marginBottom: 12 }}>
                                <Space>
                                  <Typography.Text strong>选择语言:</Typography.Text>
                                  <Select
                                    value={codeLanguage}
                                    onChange={setCodeLanguage}
                                    style={{ width: 150 }}
                                    size="small"
                                  >
                                    <Select.Option value="curl">Shell (cURL)</Select.Option>
                                    <Select.Option value="javascript">JavaScript</Select.Option>
                                    <Select.Option value="python">Python</Select.Option>
                                    <Select.Option value="java">Java</Select.Option>
                                    <Select.Option value="php">PHP</Select.Option>
                                    <Select.Option value="go">Go</Select.Option>
                                  </Select>
                                  <Button
                                    type="link"
                                    size="small"
                                    icon={<CopyOutlined />}
                                    onClick={() => {
                                      const code = generateRequestCode(codeLanguage);
                                      navigator.clipboard.writeText(code);
                                      message.success('代码已复制到剪贴板');
                                    }}
                                  >
                                    复制代码
                                  </Button>
                                </Space>
                              </div>
                              <pre
                                className="api-tester-result"
                                style={{
                                  maxHeight: '400px',
                                  overflow: 'auto',
                                  fontSize: '12px',
                                  lineHeight: '1.5',
                                }}
                              >
                                {generateRequestCode(codeLanguage)}
                              </pre>
                            </div>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <Empty description="暂未测试，点击'发送测试'按钮开始测试" />
          )}
        </Card>
      </Card>

      <Modal
        open={isModalOpen}
        title={editing ? '编辑API' : '新建API'}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="名称" name="name" rules={[commonRules.required('请输入API名称')]}>
            <Input placeholder="例如：查询用户列表" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input placeholder="接口用途描述" />
          </Form.Item>
          <Form.Item label="方法" name="method" rules={[commonRules.required('请选择HTTP方法'), httpMethodRule()]}>
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="路径"
            name="path"
            rules={[commonRules.required('请输入API路径'), apiPathRule()]}
          >
            <Input placeholder="/api/users 或 https://api.example.com/users" />
          </Form.Item>

          <Tabs
            defaultActiveKey="query"
            items={[
              {
                key: 'query',
                label: '查询参数',
                children: (
                  <Form.List name="queryParams">
                    {(fields: FormListFieldData[], { add, remove }: FormListOperation) => (
                      <>
                        {fields.map((field) => {
                          const { key, name, ...rest } = field;
                          return (
                          <Space key={key} align="baseline" style={{ marginBottom: 8 }}>
                            <Form.Item {...rest} name={[name, 'name']} rules={[{ required: true }]}>
                              <Input placeholder="名称" />
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'type']} initialValue="string">
                              <Input placeholder="类型" />
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'required']} initialValue>
                              <Select style={{ width: 90 }}>
                                <Select.Option value={true}>必填</Select.Option>
                                <Select.Option value={false}>可选</Select.Option>
                              </Select>
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'description']}>
                              <Input placeholder="描述" />
                            </Form.Item>
                            <Button type="link" danger onClick={() => remove(name)}>
                              删除
                            </Button>
                          </Space>
                          );
                        })}
                        <Button type="dashed" onClick={() => add()} block>
                          添加查询参数
                        </Button>
                      </>
                    )}
                  </Form.List>
                ),
              },
              {
                key: 'headers',
                label: '请求头',
                children: (
                  <Form.List name="headers">
                    {(fields: FormListFieldData[], { add, remove }: FormListOperation) => (
                      <>
                        {fields.map((field) => {
                          const { key, name, ...rest } = field;
                          return (
                          <Space key={key} align="baseline" style={{ marginBottom: 8 }}>
                            <Form.Item {...rest} name={[name, 'name']} rules={[{ required: true, message: '请输入请求头名称' }]}>
                              <AutoComplete
                                placeholder="请求头名称（如：Content-Type）"
                                options={COMMON_HTTP_HEADERS.map((header) => ({
                                  value: header,
                                  label: header,
                                }))}
                                filterOption={(inputValue, option) =>
                                  option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                                }
                                allowClear
                                style={{ width: 200 }}
                              />
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'type']} initialValue="string">
                              <Input placeholder="类型" />
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'required']} initialValue>
                              <Select style={{ width: 90 }}>
                                <Select.Option value={true}>必填</Select.Option>
                                <Select.Option value={false}>可选</Select.Option>
                              </Select>
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'description']}>
                              <Form.Item noStyle shouldUpdate={(prevValues, curValues) => {
                                // 监听请求头名称变化，更新示例值建议
                                const prevHeaderName = prevValues?.headers?.[name]?.name;
                                const curHeaderName = curValues?.headers?.[name]?.name;
                                return prevHeaderName !== curHeaderName;
                              }}>
                                {({ getFieldValue }) => {
                                  const headerName = getFieldValue(['headers', name, 'name']) || '';
                                  const suggestions = getHeaderValueSuggestions(headerName);
                                  
                                  return (
                                    <AutoComplete
                                      placeholder="示例值 / 描述（如：application/json）"
                                      options={suggestions.length > 0 ? suggestions.map((value) => ({
                                        value,
                                        label: value,
                                      })) : []}
                                      filterOption={(inputValue, option) =>
                                        option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                                      }
                                      allowClear
                                      onSelect={(value) => {
                                        // 选中后自动填充
                                        form.setFieldValue(['headers', name, 'description'], value);
                                      }}
                                      style={{ width: 250 }}
                                    />
                                  );
                                }}
                              </Form.Item>
                            </Form.Item>
                            <Button type="link" danger onClick={() => remove(name)}>
                              删除
                            </Button>
                          </Space>
                          );
                        })}
                        <Button type="dashed" onClick={() => add()} block>
                          添加请求头
                        </Button>
                      </>
                    )}
                  </Form.List>
                ),
              },
              {
                key: 'body',
                label: '请求体示例',
                children: (
                  <Form.Item
                    name="bodySample"
                    extra={
                      <Space>
                        <Tooltip title="格式化JSON">
                          <Button
                            type="link"
                            size="small"
                            icon={<FormatPainterOutlined />}
                            onClick={() => {
                              const body = form.getFieldValue('bodySample');
                              if (body) {
                                try {
                                  form.setFieldsValue({ bodySample: formatJSON(body) });
                                  message.success('格式化成功');
                                } catch {
                                  message.error('JSON格式错误，无法格式化');
                                }
                              }
                            }}
                          >
                            格式化
                          </Button>
                        </Tooltip>
                      </Space>
                    }
                  >
                    <Input.TextArea rows={6} placeholder='例如：{"name":"Tom"}' />
                  </Form.Item>
                ),
              },
              {
                key: 'mock',
                label: 'Mock响应',
                children: (
                  <Form.Item
                    name="mockResponse"
                    rules={[jsonRule('请输入有效的JSON格式')]}
                    extra={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tooltip title="格式化JSON">
                            <Button
                              type="link"
                              size="small"
                              icon={<FormatPainterOutlined />}
                              onClick={() => {
                                const mock = form.getFieldValue('mockResponse');
                                if (mock) {
                                  try {
                                    form.setFieldsValue({ mockResponse: formatJSON(mock) });
                                    message.success('格式化成功');
                                  } catch {
                                    message.error('JSON格式错误，无法格式化');
                                  }
                                }
                              }}
                            >
                              格式化
                            </Button>
                          </Tooltip>
                        </Space>
                        <Alert
                          message="Mock响应说明"
                          description={
                            <div>
                              <p>
                                <strong>Mock响应的目的：</strong>
                              </p>
                              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li>
                                  <strong>前端开发独立：</strong>
                                  无需等待后端接口完成，前端可以独立开发和测试
                                </li>
                                <li>
                                  <strong>快速迭代：</strong>
                                  可以快速验证前端功能，提高开发效率
                                </li>
                                <li>
                                  <strong>数据模拟：</strong>
                                  模拟各种数据场景（成功、失败、边界情况）
                                </li>
                                <li>
                                  <strong>离线开发：</strong>
                                  即使后端服务不可用，也能继续开发
                                </li>
                              </ul>
                              <p style={{ marginTop: '8px' }}>
                                <strong>使用规则：</strong>
                                当API路径是相对路径（如 <code>/api/users</code>
                                ）时，测试会使用Mock响应；当路径是完整URL（如{' '}
                                <code>https://api.example.com/users</code>
                                ）时，会发送真实请求。
                              </p>
                            </div>
                          }
                          type="info"
                          showIcon
                          style={{ marginTop: 8 }}
                        />
                      </Space>
                    }
                  >
                    <Input.TextArea rows={8} placeholder='例如：{"code":0,"data":[]}' />
                  </Form.Item>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      {/* 环境配置弹窗 */}
      <Modal
        open={isEnvModalOpen}
        title="环境配置"
        onCancel={() => setIsEnvModalOpen(false)}
        onOk={() => {
          const values = envForm.getFieldsValue();
          const newEnvs = environments.map((env) =>
            env.id === values.id ? { ...env, ...values } : env
          );
          setEnvironments(newEnvs);
          localStorage.setItem('api_environments', JSON.stringify(newEnvs));
          setIsEnvModalOpen(false);
          message.success('环境配置已保存');
        }}
        width={600}
      >
        <Form form={envForm} layout="vertical">
          <Form.Item label="选择环境" name="id" rules={[{ required: true }]}>
            <Select
              placeholder="选择要配置的环境"
              onChange={(value) => {
                const env = environments.find((e) => e.id === value);
                if (env) {
                  envForm.setFieldsValue(env);
                }
              }}
            >
              {environments.map((env) => (
                <Select.Option key={env.id} value={env.id}>
                  {env.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="环境名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="例如：开发环境" />
          </Form.Item>
          <Form.Item label="基础URL" name="baseUrl" rules={[{ required: true }]}>
            <Input placeholder="例如：http://localhost:3001" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={2} placeholder="环境描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default ApiDesigner;

