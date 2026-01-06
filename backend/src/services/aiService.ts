import OpenAI from 'openai';

/**
 * AI Service
 * Provides AI-powered features for the low-code platform
 * AI服务，为低代码平台提供AI功能
 */
class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    // 初始化OpenAI客户端（如果配置了API密钥）
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate code from natural language description
   * 根据自然语言描述生成代码
   * @param description - Natural language description
   * @param context - Additional context (existing components, requirements)
   * @returns {Promise<{code: string, explanation: string}>} Generated code and explanation
   */
  async generateCode(
    description: string,
    context?: { components?: any[]; requirements?: string }
  ): Promise<{ code: string; explanation: string }> {
    // 如果没有配置OpenAI，返回模拟数据
    if (!this.openai) {
      return this.mockGenerateCode(description, context);
    }

    try {
      const prompt = this.buildCodeGenerationPrompt(description, context);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的低代码平台AI助手，擅长根据用户需求生成组件配置代码。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      const parsed = this.parseAIResponse(content);

      return {
        code: parsed.code,
        explanation: parsed.explanation,
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      // 如果API调用失败，返回模拟数据
      return this.mockGenerateCode(description, context);
    }
  }

  /**
   * Recommend components based on context
   * 根据上下文推荐组件
   * @param context - Context description
   * @param existingComponents - Already used component types
   * @returns {Promise<{recommendations: Array<{type: string, reason: string}>}>} Component recommendations
   */
  async recommendComponents(
    context: string,
    existingComponents?: string[]
  ): Promise<{ recommendations: Array<{ type: string; reason: string }> }> {
    if (!this.openai) {
      return this.mockRecommendComponents(context, existingComponents);
    }

    try {
      const prompt = `根据以下场景推荐合适的低代码组件：
场景：${context}
${existingComponents ? `已使用组件：${existingComponents.join(', ')}` : ''}

请推荐3-5个最合适的组件，并说明推荐理由。`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的低代码平台AI助手，擅长推荐合适的组件。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseRecommendations(content);
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return this.mockRecommendComponents(context, existingComponents);
    }
  }

  /**
   * Optimize code
   * 优化代码
   * @param code - Code to optimize
   * @param optimizationType - Type of optimization (performance, readability, security)
   * @returns {Promise<{optimizedCode: string, suggestions: string[]}>} Optimized code and suggestions
   */
  async optimizeCode(
    code: string,
    optimizationType?: 'performance' | 'readability' | 'security'
  ): Promise<{ optimizedCode: string; suggestions: string[] }> {
    if (!this.openai) {
      return this.mockOptimizeCode(code, optimizationType);
    }

    try {
      const optimizationTypeText = {
        performance: '性能',
        readability: '可读性',
        security: '安全性',
      }[optimizationType || 'performance'];

      const prompt = `请优化以下代码，重点关注${optimizationTypeText}：
\`\`\`
${code}
\`\`\`

请提供优化后的代码和优化建议。`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码优化专家。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseOptimizationResponse(content, code);
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return this.mockOptimizeCode(code, optimizationType);
    }
  }

  /**
   * Generate test cases
   * 生成测试用例
   * @param code - Code to test
   * @param componentType - Component type
   * @returns {Promise<{testCases: Array<{name: string, code: string}>}>} Generated test cases
   */
  async generateTests(
    code: string,
    componentType?: string
  ): Promise<{ testCases: Array<{ name: string; code: string }> }> {
    // 模拟实现
    return {
      testCases: [
        {
          name: '基本渲染测试',
          code: `test('should render component', () => {
  // 测试代码
});`,
        },
      ],
    };
  }

  /**
   * Analyze code quality
   * 分析代码质量
   * @param code - Code to analyze
   * @returns {Promise<{score: number, issues: Array<{type: string, message: string}>}>} Code quality analysis
   */
  async analyzeCodeQuality(
    code: string
  ): Promise<{ score: number; issues: Array<{ type: string; message: string }> }> {
    // 模拟实现
    return {
      score: 85,
      issues: [
        {
          type: 'warning',
          message: '建议添加错误处理',
        },
      ],
    };
  }

  // 私有辅助方法

  /**
   * Build code generation prompt
   * 构建代码生成提示
   */
  private buildCodeGenerationPrompt(
    description: string,
    context?: { components?: any[]; requirements?: string }
  ): string {
    let prompt = `用户需求：${description}\n\n`;

    if (context?.requirements) {
      prompt += `额外要求：${context.requirements}\n\n`;
    }

    if (context?.components && context.components.length > 0) {
      prompt += `已有组件：${JSON.stringify(context.components, null, 2)}\n\n`;
    }

    prompt += `请根据用户需求生成组件配置JSON。如果需求涉及多个组件（如表单、列表等），请使用容器组件（type: "container"）作为父组件，并在children数组中包含子组件。

可用的组件类型包括：
- container: 容器组件（可包含children，用于布局）
- input: 输入框组件（props.placeholder: 占位符文本，props.type: 输入类型如"password"）
- button: 按钮组件（props.text: 按钮文本，props.type: 按钮类型如"primary"）
- checkbox: 复选框组件（props.label: 标签文本）
- radio: 单选框组件
- select: 下拉选择框
- text: 文本组件（props.content: 文本内容，可用于标题、链接等）
- image: 图片组件
- card: 卡片组件

组件配置格式：
{
  "type": "组件类型",
  "name": "组件名称",
  "props": {
    // 组件属性，如placeholder、text等
  },
  "style": {
    // 组件样式，如padding、margin、width等
  },
  "children": [
    // 可选：子组件数组（仅容器组件支持）
    {
      "type": "子组件类型",
      "name": "子组件名称",
      "props": {},
      "style": {}
    }
  ]
}

重要提示：
1. 如果需求是创建表单（如登录表单、注册表单等），请生成一个容器组件，并在children中包含所需的输入框和按钮
2. 登录表单应包含：用户名输入框、密码输入框（props.type: "password"）和登录按钮
3. 确保生成的JSON格式正确，可以直接被JSON.parse()解析
4. 只返回JSON代码，不要包含其他文本说明

请生成符合需求的组件配置JSON：`;

    return prompt;
  }

  /**
   * Parse AI response
   * 解析AI响应
   */
  private parseAIResponse(content: string): { code: string; explanation: string } {
    // 尝试提取JSON代码块（支持多行JSON）
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const jsonStr = codeBlockMatch[1].trim();
      try {
        // 验证JSON有效性
        JSON.parse(jsonStr);
        return {
          code: jsonStr,
          explanation: content.replace(/```[\s\S]*?```/g, '').trim(),
        };
      } catch (e) {
        // JSON解析失败，继续尝试其他方法
      }
    }

    // 如果没有代码块，尝试提取JSON对象（支持嵌套结构）
    try {
      // 查找第一个 { 和最后一个匹配的 }
      const firstBrace = content.indexOf('{');
      if (firstBrace !== -1) {
        let braceCount = 0;
        let lastBrace = -1;
        for (let i = firstBrace; i < content.length; i++) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastBrace = i;
              break;
            }
          }
        }
        if (lastBrace !== -1) {
          const jsonStr = content.substring(firstBrace, lastBrace + 1);
          JSON.parse(jsonStr); // 验证JSON有效性
          return {
            code: jsonStr,
            explanation: content.substring(0, firstBrace).trim() + 
                        content.substring(lastBrace + 1).trim(),
          };
        }
      }
    } catch (e) {
      // JSON解析失败
    }

    // 默认返回模拟数据
    return {
      code: JSON.stringify({
        type: 'container',
        name: '生成的容器',
        props: {},
        style: {},
      }),
      explanation: content || '已根据您的需求生成组件配置',
    };
  }

  /**
   * Parse recommendations
   * 解析推荐结果
   */
  private parseRecommendations(content: string): {
    recommendations: Array<{ type: string; reason: string }>;
  } {
    // 模拟解析逻辑
    const recommendations = [
      { type: 'form', reason: '适合数据输入场景' },
      { type: 'table', reason: '适合数据展示' },
      { type: 'button', reason: '需要操作按钮' },
    ];

    return { recommendations };
  }

  /**
   * Parse optimization response
   * 解析优化响应
   */
  private parseOptimizationResponse(
    content: string,
    originalCode: string
  ): { optimizedCode: string; suggestions: string[] } {
    // 尝试提取优化后的代码
    const codeMatch = content.match(/```(?:typescript|javascript|tsx|jsx)?\s*([\s\S]*?)\s*```/);
    const optimizedCode = codeMatch ? codeMatch[1] : originalCode;

    // 提取建议
    const suggestions = content
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter((line) => line.length > 0);

    return {
      optimizedCode,
      suggestions: suggestions.length > 0 ? suggestions : ['代码已优化'],
    };
  }

  // 模拟方法（当没有配置AI服务时使用）

  private mockGenerateCode(
    description: string,
    context?: { components?: any[]; requirements?: string }
  ): { code: string; explanation: string } {
    // 根据描述关键词生成合适的组件结构
    const lowerDescription = description.toLowerCase();
    
    // 登录表单 - 生成完整的登录表单结构
    if (lowerDescription.includes('登录') || lowerDescription.includes('登陆') || 
        (lowerDescription.includes('用户名') && lowerDescription.includes('密码'))) {
      return {
        code: JSON.stringify({
          type: 'container',
          name: '登录表单容器',
          props: {},
          style: {
            padding: '40px',
            width: '400px',
            maxWidth: '90%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
          children: [
            {
              type: 'text',
              name: '标题',
              props: {
                content: '欢迎登录',
              },
              style: {
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '8px',
                color: '#333333',
              },
            },
            {
              type: 'text',
              name: '副标题',
              props: {
                content: '请输入您的账号信息',
              },
              style: {
                fontSize: '14px',
                textAlign: 'center',
                color: '#666666',
                marginBottom: '24px',
              },
            },
            {
              type: 'input',
              name: '用户名输入框',
              props: {
                placeholder: '请输入用户名或邮箱',
              },
              style: {
                width: '100%',
                padding: '12px',
                fontSize: '14px',
              },
            },
            {
              type: 'input',
              name: '密码输入框',
              props: {
                placeholder: '请输入密码',
                type: 'password',
              },
              style: {
                width: '100%',
                padding: '12px',
                fontSize: '14px',
              },
            },
            {
              type: 'container',
              name: '辅助功能容器',
              props: {},
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginTop: '-8px',
                marginBottom: '-8px',
              },
              children: [
                {
                  type: 'checkbox',
                  name: '记住我',
                  props: {
                    label: '记住我',
                  },
                  style: {},
                },
                {
                  type: 'text',
                  name: '忘记密码链接',
                  props: {
                    content: '忘记密码？',
                  },
                  style: {
                    fontSize: '14px',
                    color: '#1890ff',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  },
                },
              ],
            },
            {
              type: 'button',
              name: '登录按钮',
              props: {
                text: '登录',
                type: 'primary',
              },
              style: {
                width: '100%',
                height: '40px',
                fontSize: '16px',
                marginTop: '8px',
              },
            },
            {
              type: 'text',
              name: '注册提示',
              props: {
                content: '还没有账号？立即注册',
              },
              style: {
                fontSize: '14px',
                textAlign: 'center',
                color: '#666666',
                marginTop: '8px',
                cursor: 'pointer',
              },
            },
          ],
        }),
        explanation: '根据您的需求，我生成了一个完整的登录表单，包含：标题、用户名输入框、密码输入框、记住我复选框、忘记密码链接、登录按钮和注册提示。表单采用现代化设计，包含适当的间距、圆角和阴影效果。',
      };
    }
    
    // 注册表单
    if (lowerDescription.includes('注册')) {
      return {
        code: JSON.stringify({
          type: 'container',
          name: '注册表单',
          props: {},
          style: {
            padding: '24px',
            width: '400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          },
          children: [
            {
              type: 'input',
              name: '用户名输入框',
              props: {
                placeholder: '请输入用户名',
              },
              style: {
                width: '100%',
              },
            },
            {
              type: 'input',
              name: '邮箱输入框',
              props: {
                placeholder: '请输入邮箱',
              },
              style: {
                width: '100%',
              },
            },
            {
              type: 'input',
              name: '密码输入框',
              props: {
                placeholder: '请输入密码',
                type: 'password',
              },
              style: {
                width: '100%',
              },
            },
            {
              type: 'input',
              name: '确认密码输入框',
              props: {
                placeholder: '请确认密码',
                type: 'password',
              },
              style: {
                width: '100%',
              },
            },
            {
              type: 'button',
              name: '注册按钮',
              props: {
                text: '注册',
                type: 'primary',
              },
              style: {
                width: '100%',
              },
            },
          ],
        }),
        explanation: '根据您的需求，我生成了一个注册表单，包含用户名、邮箱、密码、确认密码输入框和注册按钮。',
      };
    }
    
    // 搜索框
    if (lowerDescription.includes('搜索')) {
      return {
        code: JSON.stringify({
          type: 'container',
          name: '搜索框',
          props: {},
          style: {
            display: 'flex',
            gap: '8px',
            width: '100%',
          },
          children: [
            {
              type: 'input',
              name: '搜索输入框',
              props: {
                placeholder: '请输入搜索关键词',
              },
              style: {
                flex: 1,
              },
            },
            {
              type: 'button',
              name: '搜索按钮',
              props: {
                text: '搜索',
                type: 'primary',
              },
            },
          ],
        }),
        explanation: '根据您的需求，我生成了一个搜索框，包含搜索输入框和搜索按钮。',
      };
    }
    
    // 默认返回容器组件
    return {
      code: JSON.stringify({
        type: 'container',
        name: 'AI生成的容器',
        props: {},
        style: { padding: '16px' },
      }),
      explanation: `根据您的描述"${description}"，我生成了一个容器组件。您可以在属性面板中进一步配置，或手动添加子组件。`,
    };
  }

  private mockRecommendComponents(
    context: string,
    existingComponents?: string[]
  ): { recommendations: Array<{ type: string; reason: string }> } {
    return {
      recommendations: [
        { type: 'form', reason: '适合数据输入和验证' },
        { type: 'table', reason: '适合数据展示和操作' },
        { type: 'card', reason: '适合内容分组展示' },
      ],
    };
  }

  private mockOptimizeCode(
    code: string,
    optimizationType?: 'performance' | 'readability' | 'security'
  ): { optimizedCode: string; suggestions: string[] } {
    return {
      optimizedCode: code,
      suggestions: [
        '建议添加错误处理',
        '可以考虑使用更高效的算法',
        '建议添加代码注释',
      ],
    };
  }
}

export const aiService = new AIService();

