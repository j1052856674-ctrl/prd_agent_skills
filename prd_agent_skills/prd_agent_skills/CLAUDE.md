# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个PRD（产品需求文档）生成器技能，专注于通过交互式对话生成结构化的产品需求文档。该技能采用模块化设计，包含三大核心功能：架构图生成、文本编辑和原型导入，所有功能均本地运行，无需外部依赖。

## 核心架构

### 主要组件

1. **PRD生成器核心** (`prd_generator.js`)
   - 驱动整个对话流程
   - 调用各功能模块
   - 处理用户输入和上下文管理

2. **架构图编辑器** (`diagram_editor.js`)
   - Mermaid图表编辑器
   - 支持多种图表类型：流程图、序列图、类图、状态图、ER图、甘特图、饼图
   - 实时预览和语法验证
   - 提供模板库快速开始

3. **简化文本编辑器** (`simple_text_editor.js`)
   - 轻量级内容编辑功能
   - 点击编辑模式
   - 自动保存和历史记录
   - 支持撤销/重做

4. **简化HTML导入器** (`simple_html_importer.js`)
   - 利用Claude的图像理解能力
   - 支持HTML文件和设计稿图片导入
   - 生成可编辑的HTML原型

### 技术栈

- 纯JavaScript实现，无外部依赖
- 使用Mermaid进行图表渲染
- ContentEditable API实现富文本编辑
- File API处理本地文件导入

## 开发指南

### 运行和测试

1. **运行演示页面**
   ```bash
   # 直接在浏览器中打开HTML文件即可
   simple_demo.html              # 简化版主界面
   diagram_editor_demo.html      # 架构图编辑器演示
   text_editor_demo.html         # 文本编辑器演示
   ```

2. **功能测试流程**
   - 测试文件上传功能（HTML文件、图片）
   - 验证图表编辑器的实时预览
   - 测试文本编辑的点击编辑功能
   - 确保所有功能离线可用

### 代码组织原则

1. **功能模块化**
   - 每个功能独立为单独的类
   - 保持单一职责原则
   - 模块间通过接口交互

2. **简化优先**
   - 优先使用原生API
   - 避免复杂的第三方依赖
   - 保持代码简洁易读

3. **渐进增强**
   - 核心功能必须稳定
   - 高级特性提供优雅降级
   - 考虑浏览器兼容性

### 重要约定

1. **命名规范**
   - 类名使用PascalCase（如`SimpleTextEditor`）
   - 方法名使用camelCase（如`saveContent`）
   - 常量使用UPPER_SNAKE_CASE（如`MAX_HISTORY`）

2. **文件命名**
   - 使用kebab-case命名（如`simple_text_editor.js`）
   - 文件名明确反映功能
   - 演示文件以`_demo.html`结尾

3. **代码风格**
   - 使用ES6+语法
   - 保持一致的缩进（2或4空格）
   - 适当添加注释说明复杂逻辑

### 与Claude Code的协作

1. **功能实现策略**
   - 充分利用Claude的代码生成能力
   - 保持代码清晰可读
   - 提供完整的错误处理

2. **测试要求**
   - 所有新功能需有对应的演示页面
   - 关键功能需要用户交互测试
   - 确保跨浏览器兼容性

3. **文档维护**
   - 及时更新CLAUDE.md
   - 保持README.md的功能描述准确
   - 更新SKILL.md展示可用功能

## 已知问题与待办

- 依赖较大的Mermaid库可能导致页面加载缓慢
- 部分浏览器对ContentEditable的支持不完善
- 图片生成的HTML原型可能需要手动调整样式