// 智能模板推荐引擎
class TemplateRecommender {
    constructor() {
        this.userProfile = null;
        this.templateDatabase = null;
        this.similarityThreshold = 0.7;
    }

    /**
     * 初始化推荐引擎
     * @param {Object} userProfile - 用户画像数据
     * @param {Array} templateDatabase - 模板数据库
     */
    init(userProfile, templateDatabase) {
        this.userProfile = userProfile;
        this.templateDatabase = templateDatabase;
    }

    /**
     * 推荐最适合的模板
     * @param {Object} userRequest - 用户请求信息
     * @param {number} maxResults - 最大推荐数量
     * @returns {Array} 推荐的模板列表
     */
    recommend(userRequest, maxResults = 5) {
        // 计算所有模板的得分
        const scoredTemplates = this.templateDatabase.map(template => {
            const score = this.calculateScore(template, userRequest);
            return { ...template, score };
        });

        // 过滤和排序
        const filtered = scoredTemplates
            .filter(t => t.score >= this.similarityThreshold)
            .sort((a, b) => b.score - a.score);

        return filtered.slice(0, maxResults);
    }

    /**
     * 计算模板得分
     * @param {Object} template - 模板信息
     * @param {Object} request - 用户请求
     * @returns {number} 得分 (0-1)
     */
    calculateScore(template, request) {
        let totalScore = 0;
        let factorCount = 0;

        // 1. 行业匹配 (权重: 0.4)
        const industryScore = this.matchIndustry(template, request);
        if (industryScore > 0) {
            totalScore += industryScore * 0.4;
            factorCount++;
        }

        // 2. 复杂度匹配 (权重: 0.3)
        const complexityScore = this.matchComplexity(template, request);
        if (complexityScore > 0) {
            totalScore += complexityScore * 0.3;
            factorCount++;
        }

        // 3. 历史使用偏好 (权重: 0.2)
        const preferenceScore = this.matchUserPreference(template, request);
        if (preferenceScore > 0) {
            totalScore += preferenceScore * 0.2;
            factorCount++;
        }

        // 4. 热度评分 (权重: 0.1)
        const popularityScore = this.matchPopularity(template);
        totalScore += popularityScore * 0.1;
        factorCount++;

        // 归一化
        return factorCount > 0 ? totalScore / factorCount : 0;
    }

    /**
     * 行业匹配度计算
     */
    matchIndustry(template, request) {
        // 如果用户指定了行业
        if (request.industry && template.industry === request.industry) {
            return 1.0;
        }

        // 基于用户历史偏好
        if (this.userProfile && this.userProfile.preferences.industries.includes(template.industry)) {
            return 0.8;
        }

        // 默认通用模板
        if (template.industry === '通用') {
            return 0.6;
        }

        return 0;
    }

    /**
     * 复杂度匹配度计算
     */
    matchComplexity(template, request) {
        const complexityMap = {
            'low': 'simple',
            'medium': 'medium',
            'high': 'complex'
        };

        // 如果用户指定了复杂度
        if (request.complexity && complexityMap[request.complexity] === template.complexity) {
            return 1.0;
        }

        // 基于用户历史偏好
        if (this.userProfile && this.userProfile.preferences.complexity_levels.includes(template.complexity)) {
            return 0.8;
        }

        // 默认推荐中等复杂度
        if (template.complexity === 'medium') {
            return 0.7;
        }

        return 0.5;
    }

    /**
     * 用户偏好匹配度计算
     */
    matchUserPreference(template, request) {
        if (!this.userProfile) return 0.5;

        let score = 0;
        const prefs = this.userProfile.preferences;

        // 检查模板类型偏好
        if (prefs.template_types.includes(template.id)) {
            score += 0.4;
        }

        // 检查标签匹配
        const matchingTags = template.tags.filter(tag =>
            prefs.tags && prefs.tags.includes(tag)
        );
        score += (matchingTags.length / template.tags.length) * 0.6;

        return Math.min(score, 1.0);
    }

    /**
     * 热度评分计算
     */
    matchPopularity(template) {
        // 基于使用次数
        const usageScore = Math.min(template.usage_count / 100, 1.0);

        // 基于成功率
        const successScore = template.success_rate || 0.5;

        return (usageScore + successScore) / 2;
    }

    /**
     * 获取推荐理由
     * @param {Object} template - 模板信息
     * @param {Object} request - 用户请求
     * @returns {Array} 推荐理由列表
     */
    getRecommendationReasons(template, request) {
        const reasons = [];

        if (template.industry === request.industry) {
            reasons.push(`✅ 行业匹配：这是${template.industry}行业的专用模板`);
        } else if (template.industry === '通用') {
            reasons.push(`✅ 通用模板：适用于各种行业场景`);
        }

        if (template.tags.some(tag => request.keywords?.includes(tag))) {
            reasons.push(`✅ 功能匹配：包含您提到的核心功能`);
        }

        if (this.userProfile && this.userProfile.preferences.template_types.includes(template.id)) {
            reasons.push(`✅ 您常用：这是您经常使用的模板类型`);
        }

        if (template.success_rate > 0.8) {
            reasons.push(`✅ 高质量：历史生成成功率${Math.round(template.success_rate * 100)}%`);
        }

        return reasons;
    }

    /**
     * 更新用户偏好
     * @param {string} templateId - 使用的模板ID
     * @param {number} rating - 用户评分 (1-5)
     */
    updatePreference(templateId, rating) {
        if (!this.userProfile) return;

        // 更新使用历史
        const usageHistory = this.userProfile.usage_history || {};
        usageHistory[templateId] = {
            used_at: new Date().toISOString(),
            rating: rating
        };

        // 更新偏好权重
        if (rating >= 4) {
            // 增加偏好
            this.userProfile.preferences.template_types.push(templateId);
        } else if (rating <= 2) {
            // 减少偏好
            const index = this.userProfile.preferences.template_types.indexOf(templateId);
            if (index > -1) {
                this.userProfile.preferences.template_types.splice(index, 1);
            }
        }

        // 保存更新
        this.saveUserProfile();
    }

    /**
     * 保存用户画像
     */
    saveUserProfile() {
        if (this.userProfile) {
            // 这里可以实现实际的保存逻辑
            console.log('用户画像已更新:', this.userProfile);
        }
    }
}

// 创建全局实例
window.templateRecommender = new TemplateRecommender();

// 使用示例：
/*
const recommender = window.templateRecommender;

// 初始化
const userProfile = {
    preferences: {
        template_types: ['complete_prd'],
        industries: ['电商'],
        complexity_levels: ['medium']
    },
    usage_history: {}
};

const templateDatabase = [
    {
        id: 'complete_prd',
        name: '完整PRD模板',
        industry: '通用',
        complexity: 'high',
        tags: ['完整', '标准'],
        usage_count: 50,
        success_rate: 0.9
    }
];

recommender.init(userProfile, templateDatabase);

// 推荐模板
const request = {
    industry: '电商',
    complexity: 'high',
    keywords: ['商品', '订单', '支付']
};

const recommendations = recommender.recommend(request);
console.log('推荐结果:', recommendations);
*/