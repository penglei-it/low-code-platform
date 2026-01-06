/**
 * API定义路由
 * API Definition routes
 */

import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = express.Router();

// API定义创建Schema
const createApiDefinitionSchema = z.object({
  name: z.string().min(1, 'API名称不能为空'),
  path: z.string().min(1, 'API路径不能为空'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']),
  description: z.string().optional(),
  queryParams: z.array(z.any()).optional(),
  headers: z.array(z.any()).optional(),
  bodySample: z.any().optional(),
  mockResponse: z.any().optional(),
});

/**
 * Get all API definitions
 * 获取所有API定义
 */
router.get('/', async (req, res) => {
  try {
    const apiDefinitions = await prisma.apiDefinition.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // 解析JSON字段
    // Parse JSON fields
    const apisWithParsedData = apiDefinitions.map((api: { queryParams: string | null; headers: string | null; bodySample: string | null; mockResponse: string | null; [key: string]: unknown }) => ({
      ...api,
      queryParams: api.queryParams ? JSON.parse(api.queryParams) : [],
      headers: api.headers ? JSON.parse(api.headers) : [],
      bodySample: api.bodySample ? JSON.parse(api.bodySample) : null,
      mockResponse: api.mockResponse ? JSON.parse(api.mockResponse) : null,
    }));
    res.json({ success: true, data: apisWithParsedData });
  } catch (error: any) {
    console.error('获取API定义列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single API definition by ID
 * 根据ID获取单个API定义
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const api = await prisma.apiDefinition.findUnique({
      where: { id },
    });
    if (!api) {
      return res.status(404).json({ success: false, error: 'API定义不存在' });
    }
    // 解析JSON字段
    const apiWithParsedData = {
      ...api,
      queryParams: api.queryParams ? JSON.parse(api.queryParams) : [],
      headers: api.headers ? JSON.parse(api.headers) : [],
      bodySample: api.bodySample ? JSON.parse(api.bodySample) : null,
      mockResponse: api.mockResponse ? JSON.parse(api.mockResponse) : null,
    };
    res.json({ success: true, data: apiWithParsedData });
  } catch (error: any) {
    console.error('获取API定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create API definition
 * 创建API定义
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createApiDefinitionSchema.parse(req.body);
    const newApi = await prisma.apiDefinition.create({
      data: {
        name: validatedData.name,
        path: validatedData.path,
        method: validatedData.method,
        description: validatedData.description || null,
        queryParams: validatedData.queryParams ? JSON.stringify(validatedData.queryParams) : null,
        headers: validatedData.headers ? JSON.stringify(validatedData.headers) : null,
        bodySample: validatedData.bodySample ? JSON.stringify(validatedData.bodySample) : null,
        mockResponse: validatedData.mockResponse ? JSON.stringify(validatedData.mockResponse) : null,
      },
    });
    // 解析JSON字段
    const apiWithParsedData = {
      ...newApi,
      queryParams: validatedData.queryParams || [],
      headers: validatedData.headers || [],
      bodySample: validatedData.bodySample || null,
      mockResponse: validatedData.mockResponse || null,
    };
    res.status(201).json({ success: true, data: apiWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('创建API定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update API definition
 * 更新API定义
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingApi = await prisma.apiDefinition.findUnique({
      where: { id },
    });
    if (!existingApi) {
      return res.status(404).json({ success: false, error: 'API定义不存在' });
    }

    const validatedData = createApiDefinitionSchema.partial().parse(req.body);
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.path) updateData.path = validatedData.path;
    if (validatedData.method) updateData.method = validatedData.method;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.queryParams !== undefined) {
      updateData.queryParams = JSON.stringify(validatedData.queryParams);
    }
    if (validatedData.headers !== undefined) {
      updateData.headers = JSON.stringify(validatedData.headers);
    }
    if (validatedData.bodySample !== undefined) {
      updateData.bodySample = JSON.stringify(validatedData.bodySample);
    }
    if (validatedData.mockResponse !== undefined) {
      updateData.mockResponse = JSON.stringify(validatedData.mockResponse);
    }

    const updatedApi = await prisma.apiDefinition.update({
      where: { id },
      data: updateData,
    });
    // 解析JSON字段
    const apiWithParsedData = {
      ...updatedApi,
      queryParams: updatedApi.queryParams ? JSON.parse(updatedApi.queryParams) : [],
      headers: updatedApi.headers ? JSON.parse(updatedApi.headers) : [],
      bodySample: updatedApi.bodySample ? JSON.parse(updatedApi.bodySample) : null,
      mockResponse: updatedApi.mockResponse ? JSON.parse(updatedApi.mockResponse) : null,
    };
    res.json({ success: true, data: apiWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('更新API定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete API definition
 * 删除API定义
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingApi = await prisma.apiDefinition.findUnique({
      where: { id },
    });
    if (!existingApi) {
      return res.status(404).json({ success: false, error: 'API定义不存在' });
    }

    await prisma.apiDefinition.delete({
      where: { id },
    });
    res.json({ success: true, message: 'API定义已删除' });
  } catch (error: any) {
    console.error('删除API定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

