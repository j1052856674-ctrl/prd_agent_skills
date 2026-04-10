# 个人知识库目录结构

## 目录说明

本文档定义了PRD Generator的个人知识库目录结构，支持智能样本管理和个性化推荐。

```
/personal_knowledge_base/
├── README.md                          # 本文件
├── config.json                       # 配置文件
├── samples/                          # 样本库
│   ├── prd_templates/               # PRD模板库
│   │   ├── template_index.json      # 模板索引
│   │   ├── 完整PRD模板.md           # 完整模板
│   │   ├── 快速验证模板.md          # 简洁模板
│   │   ├── 电商行业模板.md          # 行业模板
│   │   ├── 金融行业模板.md          # 行业模板
│   │   ├── 教育行业模板.md          # 行业模板
│   │   ├── 医疗行业模板.md          # 行业模板
│   │   ├── 社交应用模板.md          # 行业模板
│   │   └── 工具类软件模板.md        # 行业模板
│   ├── architecture_diagrams/       # 架构图库
│   │   ├── index.json               # 图表索引
│   │   ├── system_architecture/     # 系统架构图
│   │   │   ├── index.json
│   │   │   ├── 微服务架构图.md
│   │   │   ├── 分层架构图.md
│   │   │   ├── 系统组件图.md
│   │   │   └── 领域驱动设计.md
│   │   ├── business_flow/           # 业务流程图
│   │   │   ├── index.json
│   │   │   ├── 订单流程图.md
│   │   │   ├── 用户注册流程.md
│   │   │   ├── 支付流程图.md
│   │   │   └── 审批流程图.md
│   │   ├── interaction_sequence/    # 交互时序图
│   │   │   ├── index.json
│   │   │   ├── API调用时序.md
│   │   │   ├── 用户操作时序.md
│   │   │   ├── 数据同步时序.md
│   │   │   └── 异常处理时序.md
│   │   ├── data_model/              # 数据模型图
│   │   │   ├── index.json
│   │   │   ├── ER关系图.md
│   │   │   ├── 数据流图.md
│   │   │   ├── 实体关系图.md
│   │   │   └── 数据字典.md
│   │   ├── deployment/              # 部署架构图
│   │   │   ├── index.json
│   │   │   ├── 容器部署图.md
│   │   │   ├── 负载均衡架构.md
│   │   │   ├── 监控系统图.md
│   │   │   └── 灾备方案图.md
│   │   └── misc/                    # 其他图表
│   │       ├── index.json
│   │       ├── 思维导图.md
│   │       ├── 状态转换图.md
│   │       └── 组织结构图.md
│   ├── prototypes/                  # 原型库
│   │   ├── index.json
│   │   ├── html_prototypes/         # HTML原型
│   │   │   ├── index.json
│   │   │   ├── 登录页面原型.html
│   │   │   ├── 商品详情页.html
│   │   │   ├── 用户中心原型.html
│   │   │   └── 管理后台原型.html
│   │   ├── design_samples/          # 设计稿样本
│   │   │   ├── index.json
│   │   │   ├── UI设计稿.png
│   │   │   ├── 交互原型.sketch
│   │   │   └── 界面规范.pdf
│   │   └── wireframes/              # 线框图
│   │       ├── index.json
│   │       ├── 低保真线框.md
│   │       └── 高保真线框.md
│   └── industry_insights/          # 行业洞察
│       ├── index.json
│       ├── tech_trends/             # 技术趋势
│       │   ├── index.json
│       │   ├── AI应用趋势.md
│       │   ├── 云原生发展.md
│       │   └── 前端技术演进.md
│       ├── best_practices/          # 最佳实践
│       │   ├── index.json
│       │   ├── 架构设计原则.md
│       │   ├── 开发规范.md
│       │   └── 安全开发指南.md
│       ├── risk_assessments/        # 风险评估
│       │   ├── index.json
│       │   ├── 技术风险评估.md
│       │   ├── 市场风险评估.md
│       │   └── 合规风险清单.md
│       └── case_studies/           # 案例研究
│           ├── index.json
│           ├── 成功案例分析.md
│           ├── 失败案例总结.md
│           └── 行业标杆研究.md
├── user_profile/                    # 用户画像
│   ├── profile.json                 # 用户基本信息
│   ├── preferences.json            # 偏好设置
│   ├── skills.json                  # 技能树
│   └── history.json                 # 历史记录
├── generated_content/              # 生成内容库
│   ├── index.json
│   ├── successful_prds/            # 成功的PRD
│   │   ├── index.json
│   │   ├── 电商系统PRD_20240401.md
│   │   ├── 教育AppPRD_20240402.md
│   │   └── ...                     # 按日期命名
│   ├── high_quality_diagrams/      # 高质量架构图
│   │   ├── index.json
│   │   ├── 系统架构图_优秀_20240401.md
│   │   └── ...
│   ├── user_feedback/              # 用户反馈
│   │   ├── index.json
│   │   ├── feedback_20240401.json
│   │   └── ...
│   └── versions/                   # 版本管理
│       ├── prd_versions/
│       │   ├── index.json
│       │   └── ...
│       └── diagram_versions/
│           ├── index.json
│           └── ...
├── ai_models/                      # AI模型
│   ├── embeddings/                 # 向量库
│   │   ├── sample_embeddings.json
│   │   └── ...
│   ├── classifiers/                # 分类器
│   │   ├── diagram_type_classifier.json
│   │   └── industry_classifier.json
│   └── recommenders/               # 推荐模型
│       ├── template_recommender.json
│       └── content_recommender.json
└── tools/                         # 工具集
    ├── file_utils.js              # 文件操作工具
    ├── search_engine.js           # 搜索引擎
    ├── classifier.js              # 分类器
    ├── recommender.js             # 推荐引擎
    └── merger.js                  # 内容合并工具
```

## 索引文件格式

### template_index.json
```json
{
  "templates": [
    {
      "id": "complete_prd",
      "name": "完整PRD模板",
      "filename": "完整PRD模板.md",
      "description": "11章完整版PRD模板",
      "industry": "通用",
      "complexity": "high",
      "usage_count": 10,
      "success_rate": 0.9,
      "tags": ["完整", "标准", "推荐"],
      "created_at": "2024-01-01",
      "updated_at": "2024-04-01"
    }
  ]
}
```

### diagram_index.json
```json
{
  "diagrams": [
    {
      "id": "microservice_arch",
      "name": "微服务架构图",
      "type": "system_architecture",
      "category": "架构设计",
      "filename": "微服务架构图.md",
      "description": "展示微服务系统的架构组成",
      "complexity": "medium",
      "industry": "互联网",
      "usage_count": 5,
      "rating": 4.5,
      "tags": ["微服务", "分布式", "架构"],
      "created_at": "2024-01-15"
    }
  ]
}
```

## 智能管理功能

### 1. 自动分类
- 基于内容特征自动分类存储
- 支持标签化管理
- 智能推荐相关内容

### 2. 版本控制
- 保存生成历史
- 支持版本对比
- 自动清理旧版本

### 3. 质量评估
- 用户反馈评分
- 使用频率统计
- 成功率分析

### 4. 个性化推荐
- 基于用户偏好
- 历史行为分析
- 智能内容匹配

## 使用说明

1. **添加样本**：将新的模板、架构图或原型存入对应目录
2. **更新索引**：修改对应的index.json文件
3. **配置搜索**：使用搜索引擎进行内容检索
4. **管理版本**：通过versions目录管理历史版本
5. **个性化**：根据user_profile调整推荐策略