# PRD Generator 项目结构

## 根目录结构

```
prd_agent_skills/
├── CLAUDE.md                    # AI协作准则
├── project_summary.md           # 项目总结
├── README_UPGRADE.md            # 升级指南
├── unified_demo.html            # 统一演示页面
├── demo/                        # 演示页面目录
│   ├── README.md                # 演示说明
│   ├── main_demo.html           # 主演示
│   ├── simple_demo.html         # 简化演示
│   ├── diagram_editor_demo.html # 架构图编辑器
│   ├── text_editor_demo.html    # 文本编辑器
│   ├── import_demo.html         # HTML导入演示
│   ├── test_page.html           # 测试页面
│   ├── data_governance_prd.md   # 示例PRD
│   ├── test_prd_generation.md   # 测试PRD
│   ├── html_importer.js         # 旧版HTML导入器
│   ├── text_editor.js           # 旧版文本编辑器
│   ├── diagram_editor.js       # 旧版架构图编辑器
│   ├── simple_text_editor.js    # 简化文本编辑器
│   └── simple_html_importer.js  # 简化HTML导入器
├── .outputs/                    # 输出文件目录
│   ├── README.md               # 输出说明
│   ├── prd/                    # PRD文档
│   │   ├── current/            # 当前PRD
│   │   ├── history/            # 历史PRD
│   │   └── templates/         # PRD模板
│   ├── diagrams/              # 架构图
│   │   ├── current/            # 当前架构图
│   │   ├── history/            # 历史架构图
│   │   └── templates/         # 架构图模板
│   ├── prototypes/            # 产品原型
│   │   ├── html/              # HTML原型
│   │   ├── images/            # 设计稿
│   │   └── wireframes/        # 线框图
│   ├── exports/               # 导出文件
│   │   ├── markdown/          # Markdown格式
│   │   ├── html/              # HTML格式
│   │   └── pdf/               # PDF格式（预留）
│   └── temp/                  # 临时文件
└── prd_generator/              # 核心技能目录
    ├── README.md              # 技能说明
    ├── USAGE.md               # 使用说明
    ├── SKILL.md               # 技能定义
    ├── prompts/               # 提示词文件
    │   └── system.md         # 系统提示词
    └── personal_knowledge_base/ # 个人知识库（内部工具）
        ├── README.md          # 知识库说明
        ├── config.json        # 配置文件
        ├── samples/           # 样本库
        │   ├── prd_templates/ # PRD模板
        │   ├── architecture_diagrams/ # 架构图
        │   ├── prototypes/    # 原型样本
        │   └── industry_insights/ # 行业洞察
        ├── user_profile/      # 用户画像
        ├── generated_content/  # 生成内容
        ├── ai_models/         # AI模型
        │   ├── classifiers/   # 分类器
        │   └── recommenders/  # 推荐引擎
        └── tools/             # 工具集
            ├── multimodal_processor.js    # 多模态处理器
            ├── search_engine.js           # 搜索引擎
            ├── diagram_classifier.js      # 图表分类器
            └── closed_loop_system.js      # 闭环系统
```

## 核心功能说明

### 1. PRD生成器 (`prd_generator/`)
- 智能PRD生成技能
- 支持对话式交互
- 集成架构图生成、文本编辑、原型导入

### 2. 个人知识库 (`personal_knowledge_base/`)
- 用户样本库
- 智能推荐系统
- 多模态输入处理
- 架构图分类管理

### 3. 输出管理 (`.outputs/`)
- 自动生成文件管理
- 版本控制
- 分类存储

### 4. 演示系统 (`demo/`)
- 功能演示页面
- 使用示例
- 旧版本工具展示

## 使用流程

1. **交互生成**：用户通过对话生成PRD
2. **内容处理**：系统使用内部工具处理输入
3. **输出管理**：结果自动保存到对应目录
4. **用户使用**：用户可以通过演示页面了解功能

## 文件命名规范

- **技能文件**：使用kebab-case命名
- **输出文件**：使用`项目名_日期_类型`格式
- **演示文件**：使用`功能名_demo.html`格式