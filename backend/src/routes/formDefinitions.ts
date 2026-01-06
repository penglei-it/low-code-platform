/**
 * 表单定义路由
 * Form Definition routes
 */

import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

const router = express.Router();

// 表单定义创建Schema
const createFormDefinitionSchema = z.object({
  name: z.string().min(1, '表单名称不能为空'),
  description: z.string().optional(),
  config: z.any().optional(),
  fields: z.array(z.any()),
});

/**
 * Get all form definitions
 * 获取所有表单定义
 */
router.get('/', async (req, res) => {
  try {
    const formDefinitions = await prisma.formDefinition.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    // 解析JSON字段
    // Parse JSON fields
    const formsWithParsedData = formDefinitions.map((form: { config: string | null; fields: string | null; [key: string]: unknown }) => ({
      ...form,
      config: form.config ? JSON.parse(form.config) : {},
      fields: form.fields ? JSON.parse(form.fields) : [],
    }));
    res.json({ success: true, data: formsWithParsedData });
  } catch (error: any) {
    console.error('获取表单定义列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single form definition by ID
 * 根据ID获取单个表单定义
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const form = await prisma.formDefinition.findUnique({
      where: { id },
    });
    if (!form) {
      return res.status(404).json({ success: false, error: '表单定义不存在' });
    }
    // 解析JSON字段
    const formWithParsedData = {
      ...form,
      config: form.config ? JSON.parse(form.config) : {},
      fields: form.fields ? JSON.parse(form.fields) : [],
    };
    res.json({ success: true, data: formWithParsedData });
  } catch (error: any) {
    console.error('获取表单定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create form definition
 * 创建表单定义
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = createFormDefinitionSchema.parse(req.body);
    const newForm = await prisma.formDefinition.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        config: validatedData.config ? JSON.stringify(validatedData.config) : JSON.stringify({}),
        fields: JSON.stringify(validatedData.fields || []),
      },
    });
    // 解析JSON字段
    const formWithParsedData = {
      ...newForm,
      config: validatedData.config || {},
      fields: validatedData.fields || [],
    };
    res.status(201).json({ success: true, data: formWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('创建表单定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update form definition
 * 更新表单定义
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingForm = await prisma.formDefinition.findUnique({
      where: { id },
    });
    if (!existingForm) {
      return res.status(404).json({ success: false, error: '表单定义不存在' });
    }

    const validatedData = createFormDefinitionSchema.partial().parse(req.body);
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.config !== undefined) {
      updateData.config = JSON.stringify(validatedData.config);
    }
    if (validatedData.fields !== undefined) {
      updateData.fields = JSON.stringify(validatedData.fields);
    }

    const updatedForm = await prisma.formDefinition.update({
      where: { id },
      data: updateData,
    });
    // 解析JSON字段
    const formWithParsedData = {
      ...updatedForm,
      config: updatedForm.config ? JSON.parse(updatedForm.config) : {},
      fields: updatedForm.fields ? JSON.parse(updatedForm.fields) : [],
    };
    res.json({ success: true, data: formWithParsedData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('更新表单定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete form definition
 * 删除表单定义
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existingForm = await prisma.formDefinition.findUnique({
      where: { id },
    });
    if (!existingForm) {
      return res.status(404).json({ success: false, error: '表单定义不存在' });
    }

    await prisma.formDefinition.delete({
      where: { id },
    });
    res.json({ success: true, message: '表单定义已删除' });
  } catch (error: any) {
    console.error('删除表单定义失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Submit form data
 * 提交表单数据
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const form = await prisma.formDefinition.findUnique({
      where: { id },
    });
    if (!form) {
      return res.status(404).json({ success: false, error: '表单定义不存在' });
    }

    const { data } = req.body;
    const submission = await prisma.formSubmission.create({
      data: {
        formId: id,
        formName: form.name,
        data: JSON.stringify(data || {}),
      },
    });
    // 解析JSON字段
    const submissionWithParsedData = {
      ...submission,
      data: submission.data ? JSON.parse(submission.data) : {},
    };
    res.status(201).json({ success: true, data: submissionWithParsedData });
  } catch (error: any) {
    console.error('提交表单数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get form submissions
 * 获取表单提交数据
 */
router.get('/:id/submissions', async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: id },
      orderBy: { submittedAt: 'desc' },
    });
    // 解析JSON字段
    // Parse JSON fields
    const submissionsWithParsedData = submissions.map((submission: { data: string | null; [key: string]: unknown }) => ({
      ...submission,
      data: submission.data ? JSON.parse(submission.data) : {},
    }));
    res.json({ success: true, data: submissionsWithParsedData });
  } catch (error: any) {
    console.error('获取表单提交数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

