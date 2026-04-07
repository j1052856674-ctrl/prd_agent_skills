// PRD生成闭环系统
class ClosedLoopSystem {
    constructor() {
        this.knowledgeBase = {
            samples: [],
            userFeedback: [],
            qualityMetrics: [],
            recommendations: []
        };
        this.qualityThreshold = {
            completeness: 0.8,
            clarity: 0.8,
            structure: 0.8,
            professionalism: 0.8
        };
    }

    /**
     * 处理新生成的PRD
     * @param {Object} prd - 生成的PRD对象
     * @returns {Promise<Object>} 处理结果
     */
    async processNewPRD(prd) {
        // 1. 质量评估
        const qualityScore = await this.assessQuality(prd);

        // 2. 保存到知识库
        await this.saveToKnowledgeBase(prd, qualityScore);

        // 3. 生成改进建议
        const improvements = await this.generateImprovements(prd, qualityScore);

        // 4. 更新推荐模型
        await this.updateRecommendationModel(prd, qualityScore);

        return {
            prd: prd,
            quality: qualityScore,
            improvements: improvements,
            recommendations: await this.generatePersonalizedRecommendations(prd)
        };
    }

    /**
     * 质量评估
     */
    async assessQuality(prd) {
        const metrics = {
            completeness: this.assessCompleteness(prd),
            clarity: this.assessClarity(prd),
            structure: this.assessStructure(prd),
            professionalism: this.assessProfessionalism(prd)
        };

        // 计算总体得分
        const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;

        return {
            overall: overallScore,
            metrics: metrics,
            passed: overallScore >= Object.values(this.qualityThreshold).reduce((sum, val) => sum + val, 0) / Object.keys(this.qualityThreshold).length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 评估完整性
     */
    assessCompleteness(prd) {
        const requiredSections = [
            '项目信息',
            '需求背景',
            '需求目标',
            '需求概述',
            '详细方案',
            '异常处理',
            '上线计划'
        ];

        let score = 0;
        const content = JSON.stringify(prd).toLowerCase();

        requiredSections.forEach(section => {
            if (content.includes(section.toLowerCase())) {
                score += 1;
            }
        });

        return score / requiredSections.length;
    }

    /**
     * 评估清晰度
     */
    assessClarity(prd) {
        // 简化的清晰度评估
        const content = prd.content || '';

        // 检查是否有模糊表述
        const vagueWords = ['可能', '大概', '或许', '差不多', '一些'];
        let vagueCount = 0;

        vagueWords.forEach(word => {
            vagueCount += (content.match(new RegExp(word, 'g')) || []).length;
        });

        // 检查段落长度
        const avgParagraphLength = content.split('\n').reduce((sum, line) => sum + line.length, 0) / content.split('\n').length;

        let score = 1.0;

        // 扣除模糊表述的分数
        score -= Math.min(vagueCount / 10, 0.3);

        // 段落过长也会影响清晰度
        if (avgParagraphLength > 200) {
            score -= 0.2;
        }

        return Math.max(score, 0);
    }

    /**
     * 评估结构
     */
    assessStructure(prd) {
        const content = prd.content || '';

        // 检查标题层级
        const hasProperHeadings = /#{1,6}\s+/.test(content);
        const hasLists = /[\*\-\+]\s+/.test(content) || /\d+\.\s+/.test(content);
        const hasTables = /\|.*\|/.test(content);

        let score = 0;

        if (hasProperHeadings) score += 0.4;
        if (hasLists) score += 0.3;
        if (hasTables) score += 0.3;

        return score;
    }

    /**
     * 评估专业性
     */
    assessProfessionalism(prd) {
        const content = prd.content || '';

        // 检查专业术语
        const technicalTerms = [
            'API', 'SDK', '数据库', '缓存', '队列', '负载均衡',
            '微服务', '分布式', '事务', '索引', '备份', '监控'
        ];

        const termCount = technicalTerms.reduce((count, term) => {
            return count + (content.match(new RegExp(term, 'gi')) || []).length;
        }, 0);

        // 检查是否包含技术方案
        const hasTechnicalSolution = /(架构|设计|实现|部署|运维)/.test(content);

        let score = 0;
        score += Math.min(termCount / 10, 0.5);
        if (hasTechnicalSolution) score += 0.5;

        return score;
    }

    /**
     * 保存到知识库
     */
    async saveToKnowledgeBase(prd, qualityScore) {
        // 生成唯一ID
        const id = `prd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const record = {
            id: id,
            prd: prd,
            quality: qualityScore,
            created_at: new Date().toISOString(),
            tags: this.generateTags(prd, qualityScore),
            category: this.categorizePRD(prd),
            version: '1.0'
        };

        // 保存到样本库
        this.knowledgeBase.samples.push(record);

        // 保存质量指标
        this.knowledgeBase.qualityMetrics.push({
            id: id,
            score: qualityScore.overall,
            metrics: qualityScore.metrics,
            timestamp: record.created_at
        });

        // 更新统计信息
        this.updateStatistics();

        return record;
    }

    /**
     * 生成标签
     */
    generateTags(prd, qualityScore) {
        const tags = [];

        // 根据行业标签
        if (prd.industry) {
            tags.push(prd.industry);
        }

        // 根据质量标签
        if (qualityScore.overall >= 0.9) {
            tags.push('高质量');
        } else if (qualityScore.overall < 0.7) {
            tags.push('需要改进');
        }

        // 根据内容特征
        if (prd.has_architecture_diagrams) {
            tags.push('含架构图');
        }

        if (prd.has_prototype) {
            tags.push('含原型');
        }

        return tags;
    }

    /**
     * 分类PRD
     */
    categorizePRD(prd) {
        const content = JSON.stringify(prd).toLowerCase();

        if (content.includes('电商') || content.includes('商品') || content.includes('订单')) {
            return '电商';
        } else if (content.includes('金融') || content.includes('支付') || content.includes('银行')) {
            return '金融';
        } else if (content.includes('教育') || content.includes('学习') || content.includes('课程')) {
            return '教育';
        } else if (content.includes('社交') || content.includes('用户') || content.includes('社区')) {
            return '社交';
        } else {
            return '通用';
        }
    }

    /**
     * 生成改进建议
     */
    async generateImprovements(prd, qualityScore) {
        const improvements = [];

        // 基于质量评分生成建议
        Object.entries(qualityScore.metrics).forEach(([metric, score]) => {
            if (score < this.qualityThreshold[metric]) {
                switch (metric) {
                    case 'completeness':
                        improvements.push({
                            type: 'section',
                            priority: 'high',
                            message: `建议补充${this.getMissingSections(prd)}相关章节`,
                            suggestion: '添加缺失的需求章节，确保PRD完整性'
                        });
                        break;

                    case 'clarity':
                        improvements.push({
                            type: 'clarity',
                            priority: 'medium',
                            message: '部分描述不够清晰，建议使用更具体的表达',
                            suggestion: '避免模糊表述，添加量化指标'
                        });
                        break;

                    case 'structure':
                        improvements.push({
                            type: 'structure',
                            priority: 'medium',
                            message: '文档结构可以进一步优化',
                            suggestion: '添加更多小标题和列表，提高可读性'
                        });
                        break;

                    case 'professionalism':
                        improvements.push({
                            type: 'professional',
                            priority: 'low',
                            message: '可以增加更多专业术语和技术方案',
                            suggestion: '添加技术实现细节和架构设计'
                        });
                        break;
                }
            }
        });

        return improvements;
    }

    /**
     * 获取缺失章节
     */
    getMissingSections(prd) {
        const content = JSON.stringify(prd).toLowerCase();
        const required = ['需求背景', '需求目标', '详细方案', '异常处理'];
        const missing = [];

        required.forEach(section => {
            if (!content.includes(section.toLowerCase())) {
                missing.push(section);
            }
        });

        return missing.join('、');
    }

    /**
     * 更新推荐模型
     */
    async updateRecommendationModel(prd, qualityScore) {
        // 这里可以更新用户的推荐偏好
        // 根据质量好的PRD类型调整推荐策略

        if (qualityScore.overall > 0.8) {
            // 优质PRD，增加相关模板的推荐权重
            this.increaseTemplateWeights(prd);
        }
    }

    /**
     * 增加模板权重
     */
    increaseTemplateWeights(prd) {
        // 更新模板推荐权重
        // 这里可以更新到模板推荐引擎
        console.log(`增加模板权重: ${prd.template_type}`);
    }

    /**
     * 生成个性化推荐
     */
    async generatePersonalizedRecommendations(prd) {
        const recommendations = {
            templates: [],
            diagrams: [],
            best_practices: []
        };

        // 基于用户历史推荐模板
        recommendations.templates = await this.recommendTemplates(prd);

        // 基于当前PRD推荐架构图
        recommendations.diagrams = await this.recommendDiagrams(prd);

        // 推荐最佳实践
        recommendations.best_practices = await this.getBestPractices(prd.category);

        return recommendations;
    }

    /**
     * 推荐模板
     */
    async recommendTemplates(prd) {
        // 基于PRD类型和用户历史
        const templateTypes = this.getSimilarTemplateTypes(prd);
        return templateTypes.slice(0, 3);
    }

    /**
     * 推荐架构图
     */
    async recommendDiagrams(prd) {
        // 基于PRD内容推荐合适的架构图类型
        const diagramTypes = this.analyzeDiagramNeeds(prd);
        return diagramTypes;
    }

    /**
     * 获取最佳实践
     */
    async getBestPractices(category) {
        // 从知识库中获取该类别的最佳实践
        const practices = this.knowledgeBase.samples
            .filter(sample =>
                sample.category === category &&
                sample.quality.overall > 0.8
            )
            .map(sample => ({
                title: sample.prd.title,
                key_points: this.extractKeyPoints(sample.prd)
            }));

        return practices.slice(0, 5);
    }

    /**
     * 提取关键点
     */
    extractKeyPoints(prd) {
        // 简化版提取关键点
        return [
            '清晰的业务目标定义',
            '完整的功能需求描述',
            '详细的系统架构设计',
            '全面的异常处理方案'
        ];
    }

    /**
     * 更新统计信息
     */
    updateStatistics() {
        const totalSamples = this.knowledgeBase.samples.length;
        const highQualitySamples = this.knowledgeBase.samples.filter(
            sample => sample.quality.overall > 0.8
        ).length;

        this.statistics = {
            total_generations: totalSamples,
            success_rate: totalSamples > 0 ? highQualitySamples / totalSamples : 0,
            average_quality: totalSamples > 0 ?
                this.knowledgeBase.qualityMetrics.reduce((sum, m) => sum + m.score, 0) / totalSamples : 0,
            improvement_rate: this.calculateImprovementRate()
        };
    }

    /**
     * 计算改进率
     */
    calculateImprovementRate() {
        // 计算通过用户反馈改进的PRD比例
        const improved = this.knowledgeBase.samples.filter(
            sample => sample.user_feedback && sample.user_feedback.improvements_applied
        ).length;

        return this.knowledgeBase.samples.length > 0 ? improved / this.knowledgeBase.samples.length : 0;
    }

    /**
     * 收集用户反馈
     */
    async collectUserFeedback(prdId, feedback) {
        const feedbackRecord = {
            prd_id: prdId,
            rating: feedback.rating,
            comments: feedback.comments,
            improvements: feedback.improvements,
            timestamp: new Date().toISOString()
        };

        this.knowledgeBase.userFeedback.push(feedbackRecord);

        // 更新对应的PRD记录
        const prdRecord = this.knowledgeBase.samples.find(s => s.id === prdId);
        if (prdRecord) {
            prdRecord.user_feedback = feedbackRecord;
        }

        return feedbackRecord;
    }

    /**
     * 获取系统统计
     */
    getSystemStats() {
        return {
            knowledge_base: this.knowledgeBase,
            statistics: this.statistics || {
                total_generations: 0,
                success_rate: 0,
                average_quality: 0,
                improvement_rate: 0
            },
            quality_threshold: this.qualityThreshold
        };
    }
}

// 创建全局实例
window.closedLoopSystem = new ClosedLoopSystem();

// 使用示例：
/*
const system = window.closedLoopSystem;

// 处理新PRD
const prd = {
    title: '电商系统PRD',
    content: '这是一个完整的电商系统产品需求文档...',
    industry: '电商',
    has_architecture_diagrams: true,
    has_prototype: true,
    template_type: 'complete_prd'
};

system.processNewPRD(prd).then(result => {
    console.log('PRD处理结果:', result);
});

// 收集用户反馈
const feedback = {
    rating: 4,
    comments: '内容很详细，但架构图可以更完善',
    improvements: ['添加更多技术细节', '完善架构图设计']
};

system.collectUserFeedback('prd_123', feedback).then(record => {
    console.log('用户反馈已记录:', record);
});

// 获取系统统计
const stats = system.getSystemStats();
console.log('系统统计:', stats);
*/