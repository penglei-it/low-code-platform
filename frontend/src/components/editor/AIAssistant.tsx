import { useState } from 'react';
import { Card, Input, Button, Space, Typography, Spin, message } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import { aiAPI } from '@/services/api';
import { useEditorStore } from '@/stores/editorStore';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

/**
 * AI Assistant component
 * Provides AI-powered features like code generation and component recommendations
 * AI助手组件，提供代码生成和组件推荐等功能
 * @returns {JSX.Element} AI Assistant component
 */
function AIAssistant() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    code?: string;
    explanation?: string;
    recommendations?: Array<{ type: string; reason: string }>;
  } | null>(null);
  const { components, addComponent } = useEditorStore();

  // 处理AI代码生成
  const handleGenerateCode = async () => {
    if (!input.trim()) {
      message.warning('请输入需求描述');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // API拦截器已经提取了data字段，直接使用返回的数据
      // 类型定义：Promise<AICodeResponse>，即 { code: string; explanation?: string }
      const response = await aiAPI.generateCode(input, {
        components: components,
      });

      // 正常响应：拦截器返回的是 { code, explanation }
      if (response.code) {
        setResult({
          code: response.code,
          explanation: response.explanation,
        });
        message.success('代码生成成功');
      } else {
        message.error('生成失败：返回数据格式错误');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      // 错误会被拦截器捕获并抛出异常，这里处理错误信息
      const errorMessage = error?.message || error?.response?.data?.error || '生成失败，请稍后重试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 处理组件推荐
  const handleRecommendComponents = async () => {
    if (!input.trim()) {
      message.warning('请输入场景描述');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const existingTypes = components.map((c) => c.type);
      // API拦截器已经提取了data字段，直接使用返回的数据
      // 类型定义：Promise<{ recommendations: Array<{ type: string; reason: string }> }>
      const response = await aiAPI.recommendComponents(input, existingTypes);

      // 正常响应：拦截器返回的是 { recommendations: [...] }
      if (response.recommendations && response.recommendations.length > 0) {
        setResult({
          recommendations: response.recommendations,
        });
        message.success('推荐生成成功');
      } else {
        message.error('推荐失败：未获取到推荐结果');
      }
    } catch (error: any) {
      console.error('AI recommendation error:', error);
      // 错误会被拦截器捕获并抛出异常，这里处理错误信息
      const errorMessage = error?.message || error?.response?.data?.error || '推荐失败，请稍后重试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 应用生成的代码
  const handleApplyCode = () => {
    if (!result?.code) return;

    try {
      const componentConfig = JSON.parse(result.code);
      addComponent(componentConfig);
      message.success('组件已添加到画布');
      setResult(null);
      setInput('');
    } catch (error) {
      message.error('代码格式错误，无法应用');
    }
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI助手</span>
        </Space>
      }
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="描述您的需求，例如：创建一个包含用户名和密码输入框的登录表单"
          rows={4}
          onPressEnter={(e) => {
            if (e.shiftKey) {
              // Shift+Enter 换行
              return;
            }
            // Enter 发送
            e.preventDefault();
            handleGenerateCode();
          }}
        />

        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleGenerateCode}
            loading={loading}
          >
            生成代码
          </Button>
          <Button onClick={handleRecommendComponents} loading={loading}>
            推荐组件
          </Button>
        </Space>

        {loading && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin size="large" />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">AI正在思考中...</Text>
            </div>
          </div>
        )}

        {result && !loading && (
          <Card size="small" style={{ backgroundColor: '#f0f7ff' }}>
            {result.explanation && (
              <div style={{ marginBottom: 12 }}>
                <Text strong>说明：</Text>
                <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                  {result.explanation}
                </Paragraph>
              </div>
            )}

            {result.code && (
              <div style={{ marginBottom: 12 }}>
                <Text strong>生成的代码：</Text>
                <pre
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    overflow: 'auto',
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  {result.code}
                </pre>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleApplyCode}
                  style={{ marginTop: 8 }}
                >
                  应用到画布
                </Button>
              </div>
            )}

            {result.recommendations && (
              <div>
                <Text strong>推荐组件：</Text>
                <div style={{ marginTop: 8 }}>
                  {result.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 8,
                        marginBottom: 4,
                        backgroundColor: '#fff',
                        borderRadius: 4,
                      }}
                    >
                      <Text strong>{rec.type}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {rec.reason}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </Space>
    </Card>
  );
}

export default AIAssistant;

