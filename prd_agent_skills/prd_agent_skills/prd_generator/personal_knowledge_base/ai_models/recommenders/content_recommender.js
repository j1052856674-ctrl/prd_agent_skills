// 智能内容推荐引擎
class ContentRecommender {
    constructor() {
        this.userProfile = null;
        this.contentDatabase = null;
        this.embeddings = null;
        this.cosineSimilarity = this.cosineSimilarity.bind(this);
    }

    /**
     * 初始化推荐引擎
     * @param {Object} userProfile - 用户画像
     * @param {Array} contentDatabase - 内容数据库
     * @param {Object} embeddings - 向量嵌入数据
     */
    init(userProfile, contentDatabase, embeddings) {
        this.userProfile = userProfile;
        this.contentDatabase = contentDatabase;
        this.embeddings = embeddings;
    }

    /**
     * 推荐相关内容
     * @param {string} query - 查询文本
     * @param {Object} filters - 过滤条件
     * @param {number} maxResults - 最大结果数
     * @returns {Array} 推荐内容列表
     */
    recommend(query, filters = {}, maxResults = 10) {
        // 1. 文本预处理
        const processedQuery = this.preprocessText(query);

        // 2. 计算相似度
        const scoredContent = this.contentDatabase.map(content => {
            const similarity = this.calculateSimilarity(processedQuery, content);
            return { ...content, similarity };
        });

        // 3. 应用过滤条件
        let filtered = this.applyFilters(scoredContent, filters);

        // 4. 排序和截取
        filtered = filtered
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults);

        return filtered;
    }

    /**
     * 计算内容相似度
     */
    calculateSimilarity(query, content) {
        let totalScore = 0;
        let factorCount = 0;

        // 1. 向量相似度（如果有嵌入数据）
        if (this.embeddings && content.id in this.embeddings) {
            const vectorSimilarity = this.cosineSimilarity(
                this.embeddings[content.id],
                this.generateQueryEmbedding(query)
            );
            totalScore += vectorSimilarity * 0.5;
            factorCount++;
        }

        // 2. 关键词匹配
        const keywordScore = this.keywordMatch(query, content);
        if (keywordScore > 0) {
            totalScore += keywordScore * 0.3;
            factorCount++;
        }

        // 3. 语义相似度（基于同义词和主题）
        const semanticScore = this.semanticSimilarity(query, content);
        if (semanticScore > 0) {
            totalScore += semanticScore * 0.2;
            factorCount++;
        }

        return factorCount > 0 ? totalScore / factorCount : 0;
    }

    /**
     * 文本预处理
     */
    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1)
            .join(' ');
    }

    /**
     * 生成查询向量（简化版）
     */
    generateQueryEmbedding(query) {
        // 这里应该使用真正的向量嵌入模型
        // 简化版：使用词频统计
        const words = query.split(' ');
        const embedding = {};

        // 假设我们有几个关键主题维度
        const topics = ['技术', '业务', '用户体验', '安全', '性能'];

        topics.forEach(topic => {
            embedding[topic] = words.filter(word =>
                topic.includes(word) || word.includes(topic)
            ).length / words.length;
        });

        return embedding;
    }

    /**
     * 余弦相似度计算
     */
    cosineSimilarity(vecA, vecB) {
        const dotProduct = Object.keys(vecA).reduce((sum, key) => {
            return sum + (vecA[key] || 0) * (vecB[key] || 0);
        }, 0);

        const magnitudeA = Math.sqrt(Object.values(vecA).reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(Object.values(vecB).reduce((sum, val) => sum + val * val, 0));

        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * 关键词匹配得分
     */
    keywordMatch(query, content) {
        const queryWords = new Set(query.split(' '));
        const contentWords = new Set(this.preprocessText(content.content || content.title).split(' '));

        const intersection = new Set([...queryWords].filter(x => contentWords.has(x)));
        const union = new Set([...queryWords, ...contentWords]);

        return union.size > 0 ? intersection.size / union.size : 0;
    }

    /**
     * 语义相似度计算
     */
    semanticSimilarity(query, content) {
        // 简化的语义匹配
        const semanticMap = {
            '登录': ['用户认证', '身份验证', '登录'],
            '支付': ['付款', '交易', '购买'],
            '商品': ['产品', '物品', 'SKU'],
            '订单': ['交易单', '购买记录', '订单']
        };

        let score = 0;
        const queryWords = query.split(' ');

        Object.entries(semanticMap).forEach(([key, synonyms]) => {
            if (queryWords.some(word => key.includes(word))) {
                const contentScore = synonyms.reduce((max, synonym) => {
                    const contentWords = this.preprocessText(content.content || '').split(' ');
                    return Math.max(max, contentWords.filter(w => w.includes(synonym)).length / contentWords.length);
                }, 0);
                score += contentScore;
            }
        });

        return Math.min(score, 1.0);
    }

    /**
     * 应用过滤条件
     */
    applyFilters(content, filters) {
        return content.filter(item => {
            // 行业过滤
            if (filters.industry && item.industry !== filters.industry) {
                return false;
            }

            // 类型过滤
            if (filters.type && item.type !== filters.type) {
                return false;
            }

            // 复杂度过滤
            if (filters.complexity && item.complexity !== filters.complexity) {
                return false;
            }

            // 日期范围过滤
            if (filters.dateRange) {
                const itemDate = new Date(item.created_at || item.timestamp);
                if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
                    return false;
                }
            }

            // 评分过滤
            if (filters.minRating) {
                if ((item.rating || 0) < filters.minRating) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * 获取相关内容推荐
     * @param {string} contentId - 内容ID
     * @param {number} maxResults - 最大结果数
     * @returns {Array} 相关内容列表
     */
    getRelatedContent(contentId, maxResults = 5) {
        const content = this.contentDatabase.find(c => c.id === contentId);
        if (!content) return [];

        // 基于内容的相关性推荐
        const related = this.contentDatabase
            .filter(c => c.id !== contentId)
            .map(c => ({
                ...c,
                similarity: this.calculateSimilarity(
                    content.content || content.title,
                    c
                )
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxResults);

        return related;
    }

    /**
     * 更新用户行为数据
     * @param {string} contentId - 内容ID
     * @param {Object} behavior - 用户行为（浏览、点赞、收藏等）
     */
    updateUserBehavior(contentId, behavior) {
        if (!this.userProfile) return;

        const behaviorHistory = this.userProfile.behavior_history || {};
        if (!behaviorHistory[contentId]) {
            behaviorHistory[contentId] = [];
        }

        behaviorHistory[contentId].push({
            ...behavior,
            timestamp: new Date().toISOString()
        });

        // 更新用户兴趣模型
        this.updateInterestModel(contentId, behavior);

        this.saveUserProfile();
    }

    /**
     * 更新用户兴趣模型
     */
    updateInterestModel(contentId, behavior) {
        const content = this.contentDatabase.find(c => c.id === contentId);
        if (!content) return;

        const interest = this.userProfile.interests || {};
        const type = content.type || 'default';

        if (!interest[type]) {
            interest[type] = {
                total_interactions: 0,
                positive_interactions: 0,
                last_interaction: null
            };
        }

        const typeInterest = interest[type];
        typeInterest.total_interactions++;

        if (behavior.type === 'like' || behavior.type === 'bookmark') {
            typeInterest.positive_interactions++;
        }

        typeInterest.last_interaction = new Date().toISOString();
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
window.contentRecommender = new ContentRecommender();

// 使用示例：
/*
const recommender = window.contentRecommender;

// 初始化
const userProfile = {
    interests: {},
    behavior_history: {}
};

const contentDatabase = [
    {
        id: 'content1',
        title: '电商系统架构设计',
        content: '一个完整的电商系统架构设计...',
        type: 'architecture',
        industry: '电商',
        complexity: 'high'
    }
];

const embeddings = {
    'content1': {
        '技术': 0.8,
        '业务': 0.6,
        '用户体验': 0.3
    }
};

recommender.init(userProfile, contentDatabase, embeddings);

// 推荐相关内容
const query = '电商系统';
const recommendations = recommender.recommend(query, {
    industry: '电商',
    type: 'architecture'
});

console.log('推荐结果:', recommendations);
*/