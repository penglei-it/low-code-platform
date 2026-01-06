import express from 'express';
import { z } from 'zod';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// 代码生成请求Schema
const generateCodeSchema = z.object({
  description: z.string().min(1, '描述不能为空'),
  context: z.object({
    components: z.array(z.any()).optional(),
    requirements: z.string().optional(),
  }).optional(),
});

// 组件推荐请求Schema
const recommendComponentsSchema = z.object({
  context: z.string().min(1, '上下文不能为空'),
  existingComponents: z.array(z.string()).optional(),
});

// 代码优化请求Schema
const optimizeCodeSchema = z.object({
  code: z.string().min(1, '代码不能为空'),
  optimizationType: z.enum(['performance', 'readability', 'security']).optional(),
});

/**
 * Generate code from natural language description
 * 根据自然语言描述生成代码
 */
router.post('/generate-code', async (req, res) => {
  try {
    const validatedData = generateCodeSchema.parse(req.body);
    const result = await aiService.generateCode(
      validatedData.description,
      validatedData.context
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('AI code generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Recommend components based on context
 * 根据上下文推荐组件
 */
router.post('/recommend-components', async (req, res) => {
  try {
    const validatedData = recommendComponentsSchema.parse(req.body);
    const result = await aiService.recommendComponents(
      validatedData.context,
      validatedData.existingComponents
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('AI component recommendation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Optimize code
 * 优化代码
 */
router.post('/optimize-code', async (req, res) => {
  try {
    const validatedData = optimizeCodeSchema.parse(req.body);
    const result = await aiService.optimizeCode(
      validatedData.code,
      validatedData.optimizationType
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('AI code optimization error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Generate test cases
 * 生成测试用例
 */
router.post('/generate-tests', async (req, res) => {
  try {
    const { code, componentType } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: '代码不能为空' });
    }

    const result = await aiService.generateTests(code, componentType);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('AI test generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Analyze code quality
 * 分析代码质量
 */
router.post('/analyze-code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: '代码不能为空' });
    }

    const result = await aiService.analyzeCodeQuality(code);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('AI code analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

