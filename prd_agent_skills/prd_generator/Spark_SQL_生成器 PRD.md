# Spark SQL智能生成器 - 产品需求文档 v3.0

## 1. 项目信息

| 项目 | 内容 |
|------|------|
| 需求名称 | Spark SQL智能生成器 |
| 产品类型 | Web应用（内部工具） |
| 目标用户 | 数据开发工程师、BI分析师 |
| 优先级 | P0 |

## 2. 需求背景

### 现状痛点
- 业务人员依赖开发人员编写SQL，沟通成本高
- 需求描述与实现之间存在信息损耗
- SQL编写排期影响业务数据分析进度

### 业务目标
- 降低SQL获取门槛，提升数据获取效率
- 实现业务人员自助生成SQL
- 释放开发人员专注复杂任务

## 3. 需求目标

### 核心目标
- 通过表名输入/DESC查询生成可用的Spark SQL
- 支持知识库查询进行数据质量保障
- 支持表结构开发场景的Excel导入

### 次要目标
- 提供SQL性能优化建议
- 支持需求澄清交互
- 提供历史记录和复用功能

### 衡量指标
- SQL生成准确率 > 90%
- 用户满意度 > 4.5分
- 平均生成时间 < 10秒

## 4. 需求概述

### 产品定位
面向业务人员的SQL生成工具，通过简单直观的交互方式，让非技术人员也能快速获取所需的数据查询SQL。

### 核心功能
1. **表名查询** - 输入表名，DESC/知识库查询表结构
2. **知识库查询** - 数据质量保障和清洗
3. **SQL生成** - Spark SELECT语句
4. **需求澄清** - 与用户确认需求后再生成SQL
5. **SQL优化** - 性能建议、写法改进

### 用户场景（重要）

#### 场景1：查询场景 - 业务人员查询数据
用户输入表名 → 系统DESC表结构/查询知识库 → 用户描述查询需求 → 模型澄清确认 → 生成SQL

- 用户输入："dwd_sales_detail"
- 系统展示表结构desc结果
- 用户输入："帮我统计各区域销售额"
- 模型澄清："请问您是要统计2024年的销售额吗？"
- 用户确认后生成SQL

#### 场景2：表开发场景 - 开发人员创建新表
用户上传Excel（表结构、取数口径、来源表）→ 模型解读并澄清需求 → 确认后生成建表SQL

- 用户上传Excel：包含字段名、类型、描述、口径、来源表
- 模型解析Excel，识别表结构
- 模型澄清："您说的'销售额'是指GMV还是净销售额？"
- 用户确认后生成CREATE TABLE语句

#### 场景3：优化场景 - 开发人员优化SQL
用户输入SQL → 系统分析 → 提供优化建议

## 5. 详细方案

### 5.1 系统架构全景图（泳道图）

```mermaid
flowchart TB
    classDef user fill:#ecfeff,stroke:#06b6d4,stroke-width:3px
    classDef frontend fill:#ecfeff,stroke:#06b6d4,stroke-width:2px
    classDef cognitive fill:#ede9fe,stroke:#8b5cf6,stroke-width:2px
    classDef execution fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    classDef model fill:#ffedd5,stroke:#f97316,stroke-width:2px
    classDef storage fill:#f1f5f9,stroke:#64748b,stroke-width:2px,stroke-dasharray:5 5
    classDef gateway fill:#e0e7ff,stroke:#6366f1,stroke-width:2px

    User(["用户"]) --> Frontend

    subgraph Frontend["前端展示层"]
        Input["表名输入/对话"]
        ExcelUp["Excel上传\n(表开发场景)"]
        SQLShow["SQL展示"]
        Clarify["澄清确认弹窗"]
    end

    subgraph Gateway["API网关层"]
        Router["路由分发"]
        Auth["鉴权"]
    end

    subgraph Cognitive["认知层"]
        DESC["DESC表结构"]
        Intent["意图识别"]
        KBQuery["知识库查询"]
        ExcelParse["Excel解析"]
    end

    subgraph Execution["执行层"]
        SQLGen["SQL生成"]
        SQLValidate["SQL校验"]
        SQLOptimize["SQL优化"]
        ClarifyMgr["需求澄清管理"]
    end

    subgraph Model["AI模型层"]
        LLM["大模型服务"]
    end

    subgraph Storage["数据存储层"]
        MySQL[(业务库)]
        VectorDB[(知识库/向量)]
        ExcelStore[(Excel存储)]
    end

    Frontend --> Gateway
    Gateway --> Cognitive
    Cognitive --> Model
    Model --> Execution
    Execution --> Frontend

    DESC -.-> MySQL
    KBQuery -.-> VectorDB
    ExcelParse -.-> ExcelStore
    ClarifyMgr -.-> VectorDB
```

### 5.2 业务流程图 - 查询场景

```mermaid
flowchart TD
    start((开始)) --> InputTable["用户输入表名"]
    InputTable --> DESC{"DESC表结构"}
    DESC --> KBQuery["查询知识库\n(数据质量)"]
    KBQuery --> ShowSchema["展示表结构\n给用户"]
    ShowSchema --> UserQuery["用户描述查询需求"]
    UserQuery --> IntentRec{"意图识别"}
    IntentRec --> Clarify{"需要澄清?"}
    Clarify -->|是| ClarifyDialog["模型澄清问题"]
    ClarifyDialog --> UserConfirm["用户确认"]
    UserConfirm --> SQLGen["生成SQL"]
    Clarify -->|否| SQLGen
    SQLGen --> Validate{"SQL校验"}
    Validate -->|通过| Success((完成))
    Validate -->|失败| SQLGen
```

### 5.3 业务流程图 - 表开发场景

```mermaid
flowchart TD
    start((开始)) --> UploadExcel["用户上传Excel\n(表结构/口径/来源)"]
    UploadExcel --> ParseExcel["解析Excel"]
    ParseExcel --> ExtractInfo["提取表信息\n字段/类型/口径/来源"]
    ExtractInfo --> ValidateInfo{"校验信息完整?"}
    ValidateInfo -->|否| AskUser["询问用户补充"]
    ValidateInfo -->|是| ClarifyNeed["模型澄清需求\n(口径/逻辑确认)"]
    ClarifyNeed --> Dialog{"与用户确认"}
    Dialog --> Confirm["用户确认"]
    Confirm --> GenDDL["生成CREATE TABLE"]
    GenDDL --> ValidateDDL{"DDL校验"}
    ValidateDDL -->|通过| Done((完成))
    ValidateDDL -->|失败| ClarifyNeed
```

### 5.4 交互流程图（序列图）

```mermaid
sequenceDiagram
    participant U as 用户
    participant FE as 前端
    participant GW as API网关
    participant DESC as 表结构服务
    participant KB as 知识库
    participant LLM as 大模型
    participant SQL as SQL生成

    Note over U,SQL: 场景1: 查询场景
    U->>FE: 输入表名"dwd_sales"
    FE->>GW: POST /api/desc
    GW->>DESC: 查询表结构
    DESC->>KB: 查询数据质量规则
    KB-->>DESC: 返回质量规则
    DESC-->>FE: 返回表结构
    FE-->>U: 显示表结构

    U->>FE: "统计各区域销售额"
    FE->>GW: POST /api/query
    GW->>LLM: 发送需求
    LLM->>LLM: 需要澄清
    LLM-->>FE: "请问要统计2024年吗?"
    FE-->>U: 显示澄清问题

    U->>FE: "是的"
    FE->>GW: 确认
    GW->>SQL: 生成SQL
    SQL-->>FE: 返回SQL
    FE-->>U: 显示SQL

    Note over U,SQL: 场景2: 表开发场景
    U->>FE: 上传Excel(表结构)
    FE->>GW: POST /api/excel
    GW->>KB: 解析并存储
    KB-->>FE: 解析结果
    LLM-->>FE: "您的口径是GMV还是净销售额?"
    FE-->>U: 澄清需求
    U->>FE: 确认
    FE->>GW: 生成DDL
    SQL-->>FE: 返回DDL
    FE-->>U: 显示建表SQL
```

### 5.5 核心模块功能详解

#### 模块1：表结构服务

| 功能 | 说明 |
|------|------|
| DESC表结构 | 查询Hive/Spark表的字段信息 |
| 知识库查询 | 查询数据质量规则、口径说明 |
| 数据预览 | 支持预览表数据样本 |

#### 模块2：意图识别与澄清

| 功能 | 说明 |
|------|------|
| 意图识别 | 判断生成/优化/解释SQL |
| 需求澄清 | 关键问题与用户确认 |
| 上下文记忆 | 多轮对话上下文 |

#### 模块3：Excel解析（表开发）

| 功能 | 说明 |
|------|------|
| 字段解析 | 提取字段名、类型、描述 |
| 口径提取 | 提取计算口径说明 |
| 来源表提取 | 提取来源表信息 |
| 模板校验 | 校验Excel格式 |

#### 模块4：SQL生成引擎

| 功能 | 说明 |
|------|------|
| SELECT生成 | 支持单表/多表JOIN |
| 聚合函数 | SUM/COUNT/AVG/MAX/MIN |
| 窗口函数 | 支持OVER/PARTITION BY |
| DDL生成 | 生成CREATE TABLE语句 |

### 5.6 表开发场景 - Excel模板规范

| 字段 | 说明 | 示例 |
|------|------|------|
| table_name | 表名 | dwd_sales_detail |
| column_name | 字段名 | sale_amount |
| column_type | 字段类型 | decimal(18,2) |
| description | 字段描述 | 销售金额 |
| calc_logic | 取数口径 | GMV - 退款金额 |
| source_table | 来源表 | ods_order |
| source_column | 来源字段 | order_amount |
| etl_rule | ETL规则 | 按天分区 |

## 6. 异常处理

| 场景 | 处理方式 |
|------|----------|
| 表名不存在 | 提示用户检查表名，支持模糊搜索 |
| 知识库无数据 | 提示用户补充口径说明 |
| Excel格式错误 | 提示具体错误位置 |
| SQL生成失败 | 返回错误原因，支持重试 |
| 模型超时 | 30秒超时提示 |
| 意图不明确 | 引导用户补充说明 |

## 7. 上线计划

| 阶段 | 时间 | 内容 |
|------|------|------|
| MVP | 2周 | 表名查询 + DESC + SQL生成 |
| V1.1 | 1周 | 需求澄清交互 |
| V1.2 | 1周 | 表开发场景(Excel导入) |
| V2.0 | 2周 | 知识库完善 + 优化建议 |

---

*文档版本：v3.0*
*创建日期：2026-04-02*
