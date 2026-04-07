// 架构图分类器
class DiagramClassifier {
    constructor() {
        this.diagramTypes = {
            'system_architecture': {
                name: '系统架构图',
                keywords: ['架构', '系统', '组件', '模块', '分层', '微服务'],
                patterns: [
                    /subgraph\s+/,
                    /flowchart\s+(TB|LR|BT|RL)/,
                    /interface\s+/,
                    /class\s+/,
                    /service\s+/
                ],
                complexity: 'high'
            },
            'business_flow': {
                name: '业务流程图',
                keywords: ['流程', '步骤', '开始', '结束', '决策', '活动'],
                patterns: [
                    /flowchart\s+(TD|LR)/,
                    /\b(?:开始|结束|步骤|决策|活动)\b/,
                    /\b(?:Start|End|Process|Decision)\b/,
                    /->\s*/,
                    /\|\s*\|\s*/
                ],
                complexity: 'medium'
            },
            'interaction_sequence': {
                name: '交互时序图',
                keywords: ['时序', '交互', '调用', '消息', '角色'],
                patterns: [
                    /sequenceDiagram/,
                    /participant\s+/,
                    ->>,
                    <->
                    Note\s+over/
                ],
                complexity: 'medium'
            },
            'data_model': {
                name: '数据模型图',
                keywords: ['数据', '实体', '关系', '属性', 'ER', '模型'],
                patterns: [
                    /class\s+/,
                    /\b(?:Entity|Table|Column|Field|Relation)\b/,
                    |\s*|\s*|,
                    /\b(?:PK|FK|UK)\b/
                ],
                complexity: 'medium'
            },
            'deployment': {
                name: '部署架构图',
                keywords: ['部署', '服务器', '容器', '节点', '集群', '环境'],
                patterns: [
                    /graph\s+(TD|LR)/,
                    /\b(?:server|container|node|cluster|environment)\b/,
                    /\b(?:docker|k8s|pod|deployment)\b/
                ],
                complexity: 'high'
            },
            'state_machine': {
                name: '状态机图',
                keywords: ['状态', '转换', '触发', '事件', '机'],
                patterns: [
                    /stateDiagram/,
                    /state\s+/,
                    /-\->\s*/,
                    /\b(?:State|Transition|Trigger|Event)\b/
                ],
                complexity: 'medium'
            },
            'network': {
                name: '网络拓扑图',
                keywords: ['网络', '拓扑', '连接', '路由', '协议'],
                patterns: [
                    /graph\s+(TB|LR)/,
                    /\b(?:network|topology|connection|router|protocol)\b/,
                    --,
                    .-.
                ],
                complexity: 'medium'
            },
            'mindmap': {
                name: '思维导图',
                keywords: ['思维', '导图', '中心', '分支', '概念'],
                patterns: [
                    /mindmap/,
                    /\*\s+/,
                    /\+\s+/,
                    /\b(?:root|branch|concept)\b/
                ],
                complexity: 'low'
            },
            'ui_mockup': {
                name: 'UI原型图',
                keywords: ['UI', '界面', '原型', '页面', '组件'],
                patterns: [
                    /\b(?:ui|interface|mockup|prototype|screen)\b/,
                    /\b(?:button|input|form|page|layout)\b/
                ],
                complexity: 'low'
            },
            'gantt': {
                name: '甘特图',
                keywords: ['甘特', '项目', '进度', '计划', '任务'],
                patterns: [
                    /gantt/,
                    /\b(?:title|section|dateFormat|task)\b/,
                    /\b(?:Project|Schedule|Plan|Task)\b/
                ],
                complexity: 'medium'
            }
        };

        this.categoryHierarchy = {
            '架构设计': ['system_architecture', 'deployment', 'network'],
            '业务流程': ['business_flow', 'interaction_sequence', 'state_machine'],
            '数据设计': ['data_model'],
            '项目管理': ['gantt', 'mindmap'],
            '界面设计': ['ui_mockup']
        };
    }

    /**
     * 分类架构图
     * @param {string} content - 架构图内容
     * @returns {Object} 分类结果
     */
    classify(content) {
        // 预处理内容
        const cleanContent = this.preprocessContent(content);

        // 计算各类别得分
        const scores = this.calculateScores(cleanContent);

        // 获取最佳匹配
        const bestMatch = this.getBestMatch(scores);

        // 生成标签
        const tags = this.generateTags(bestMatch, cleanContent);

        // 确定复杂度
        const complexity = this.determineComplexity(cleanContent);

        return {
            type: bestMatch.type,
            confidence: bestMatch.score,
            category: this.getCategory(bestMatch.type),
            tags: tags,
            complexity: complexity,
            features: this.extractFeatures(cleanContent),
            suggested_filename: this.generateFilename(bestMatch.type, tags),
            recommendations: this.generateRecommendations(bestMatch.type)
        };
    }

    /**
     * 预处理内容
     */
    preprocessContent(content) {
        return content
            .toLowerCase()
            .replace(/```mermaid\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 计算各类别得分
     */
    calculateScores(content) {
        const scores = [];

        Object.entries(this.diagramTypes).forEach(([type, config]) => {
            let score = 0;

            // 1. 关键词匹配 (权重: 0.4)
            const keywordScore = this.calculateKeywordScore(content, config.keywords);
            score += keywordScore * 0.4;

            // 2. 模式匹配 (权重: 0.4)
            const patternScore = this.calculatePatternScore(content, config.patterns);
            score += patternScore * 0.4;

            // 3. 结构特征 (权重: 0.2)
            const structureScore = this.calculateStructureScore(content, type);
            score += structureScore * 0.2;

            scores.push({
                type: type,
                score: score
            });
        });

        return scores;
    }

    /**
     * 计算关键词得分
     */
    calculateKeywordScore(content, keywords) {
        if (keywords.length === 0) return 0;

        const contentWords = content.split(' ');
        let matchCount = 0;

        keywords.forEach(keyword => {
            if (contentWords.some(word => word.includes(keyword) || keyword.includes(word))) {
                matchCount++;
            }
        });

        return matchCount / keywords.length;
    }

    /**
     * 计算模式得分
     */
    calculatePatternScore(content, patterns) {
        if (patterns.length === 0) return 0;

        let matchCount = 0;

        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                matchCount++;
            }
        });

        return matchCount / patterns.length;
    }

    /**
     * 计算结构得分
     */
    calculateStructureScore(content, type) {
        let score = 0;

        switch (type) {
            case 'system_architecture':
                // 检查分层结构
                if (content.includes('subgraph')) {
                    score += 0.5;
                }
                if (content.includes('interface') || content.includes('class')) {
                    score += 0.3;
                }
                break;

            case 'business_flow':
                // 检查流程结构
                if (content.includes('->') || content.includes('|')) {
                    score += 0.5;
                }
                if (content.includes('开始') || content.includes('Start')) {
                    score += 0.3;
                }
                break;

            case 'interaction_sequence':
                // 检查时序结构
                if (content.includes('sequenceDiagram')) {
                    score += 0.8;
                }
                if (content.includes('participant')) {
                    score += 0.2;
                }
                break;

            case 'data_model':
                // 检查数据结构
                if (content.includes('class') && content.includes('|')) {
                    score += 0.6;
                }
                break;

            case 'deployment':
                // 检查部署结构
                if (content.includes('server') || content.includes('container')) {
                    score += 0.5;
                }
                break;
        }

        return score;
    }

    /**
     * 获取最佳匹配
     */
    getBestMatch(scores) {
        return scores.reduce((best, current) =>
            current.score > best.score ? current : best
        );
    }

    /**
     * 获取分类
     */
    getCategory(type) {
        for (const [category, types] of Object.entries(this.categoryHierarchy)) {
            if (types.includes(type)) {
                return category;
            }
        }
        return '其他';
    }

    /**
     * 生成标签
     */
    generateTags(match, content) {
        const tags = [];
        const config = this.diagramTypes[match.type];

        // 添加类型标签
        tags.push(config.name);

        // 添加特征标签
        if (match.score > 0.8) {
            tags.push('高质量');
        }
        if (match.score < 0.5) {
            tags.push('需要确认');
        }

        // 添加复杂度标签
        tags.push(match.confidence > 0.7 ? '复杂' : '简单');

        return tags;
    }

    /**
     * 确定复杂度
     */
    determineComplexity(content) {
        const lineCount = content.split('\n').length;
        const uniqueElements = new Set(content.split(/\s+/)).size;

        if (lineCount > 50 && uniqueElements > 100) {
            return 'high';
        } else if (lineCount > 20 && uniqueElements > 50) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * 提取特征
     */
    extractFeatures(content) {
        const features = {};

        // 元素类型
        features.has_subgraphs = content.includes('subgraph');
        features.has_interfaces = content.includes('interface');
        features.has_classes = content.includes('class');
        features.has_sequences = content.includes('sequenceDiagram');
        features.has_decisions = content.includes('decision') || content.includes('菱形');

        // 统计信息
        features.line_count = content.split('\n').length;
        features.element_count = (content.match(/->|\|\s*\||-\->|<->/g) || []).length;

        return features;
    }

    /**
     * 生成建议文件名
     */
    generateFilename(type, tags) {
        const typeMap = {
            'system_architecture': '系统架构图',
            'business_flow': '业务流程图',
            'interaction_sequence': '交互时序图',
            'data_model': '数据模型图',
            'deployment': '部署架构图',
            'state_machine': '状态机图',
            'network': '网络拓扑图',
            'mindmap': '思维导图',
            'ui_mockup': 'UI原型图',
            'gantt': '甘特图'
        };

        const name = typeMap[type] || '架构图';
        const date = new Date().toISOString().slice(0, 10);
        const tagStr = tags.filter(tag => tag !== '高质量' && tag !== '需要确认').join('_');

        return `${name}_${date}${tagStr ? '_' + tagStr : ''}`;
    }

    /**
     * 生成推荐
     */
    generateRecommendations(type) {
        const recommendations = {
            templates: [],
            examples: [],
            tools: []
        };

        switch (type) {
            case 'system_architecture':
                recommendations.templates = ['微服务架构模板', '分层架构模板'];
                recommendations.examples = ['电商平台架构', '支付系统架构'];
                recommendations.tools = ['draw.io', 'lucidchart'];
                break;

            case 'business_flow':
                recommendations.templates = ['标准流程模板', '审批流程模板'];
                recommendations.examples = ['订单处理流程', '用户注册流程'];
                recommendations.tools = ['Visio', 'BPMN.io'];
                break;

            case 'interaction_sequence':
                recommendations.templates = ['API调用时序', '用户操作时序'];
                recommendations.examples = ['登录时序', '支付时序'];
                break;

            case 'data_model':
                recommendations.templates = ['ER模型模板', '数据流模板'];
                recommendations.examples = ['用户数据模型', '订单数据模型'];
                recommendations.tools = ['PowerDesigner', 'ER/Studio'];
                break;

            case 'deployment':
                recommendations.templates = ['容器部署模板', '云原生模板'];
                recommendations.examples = ['K8s部署架构', '微服务集群'];
                recommendations.tools = ['Kubernetes', 'Docker Compose'];
                break;
        }

        return recommendations;
    }

    /**
     * 批量分类多个图表
     */
    batch classify(diagrams) {
        return diagrams.map(diagram => ({
            ...diagram,
            classification: this.classify(diagram.content)
        }));
    }

    /**
     * 构建搜索索引
     */
    buildSearchIndex(diagrams) {
        const index = {
            by_type: {},
            by_category: {},
            by_tag: {},
            by_keyword: {}
        };

        diagrams.forEach(diagram => {
            const cls = diagram.classification;

            // 按类型索引
            if (!index.by_type[cls.type]) {
                index.by_type[cls.type] = [];
            }
            index.by_type[cls.type].push(diagram);

            // 按分类索引
            if (!index.by_category[cls.category]) {
                index.by_category[cls.category] = [];
            }
            index.by_category[cls.category].push(diagram);

            // 按标签索引
            cls.tags.forEach(tag => {
                if (!index.by_tag[tag]) {
                    index.by_tag[tag] = [];
                }
                index.by_tag[tag].push(diagram);
            });

            // 按关键词索引
            cls.keywords?.forEach(keyword => {
                if (!index.by_keyword[keyword]) {
                    index.by_keyword[keyword] = [];
                }
                index.by_keyword[keyword].push(diagram);
            });
        });

        return index;
    }
}

// 创建全局实例
window.diagramClassifier = new DiagramClassifier();

// 使用示例：
/*
const classifier = window.diagramClassifier;

// 分类单个图表
const diagramContent = `
flowchart TB
    subgraph 用户层
        A[用户]
    end
    subgraph 网关层
        B[API网关]
    end
    subgraph 业务层
        C[业务服务]
    end
`;

const result = classifier.classify(diagramContent);
console.log('分类结果:', result);

// 批量分类
const diagrams = [
    { id: 1, content: diagramContent, name: '系统架构图' },
    { id: 2, content: 'sequenceDiagram\n用户->>系统: 登录', name: '登录时序图' }
];

const batchResults = classifier.batchClassify(diagrams);
console.log('批量分类结果:', batchResults);

// 构建搜索索引
const index = classifier.buildSearchIndex(batchResults);
console.log('搜索索引:', index);
*/