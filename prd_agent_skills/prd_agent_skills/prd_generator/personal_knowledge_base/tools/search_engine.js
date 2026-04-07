// 搜索引擎
class SearchEngine {
    constructor() {
        this.index = {
            documents: {},
            terms: {},
            categories: {},
            tags: {}
        };
        this.documents = [];
    }

    /**
     * 添加文档到索引
     * @param {Object} document - 要添加的文档
     */
    addDocument(document) {
        this.documents.push(document);

        // 生成文档ID
        const docId = `doc_${this.documents.length}`;
        document.id = docId;

        // 索引文档内容
        this.indexDocument(document);
    }

    /**
     * 索引文档
     */
    indexDocument(document) {
        // 索引文档基本信息
        this.index.documents[document.id] = document;

        // 索引标题
        this.indexTerms(document.id, document.title || '');

        // 索引内容
        this.indexTerms(document.id, document.content || '');

        // 索引描述
        this.indexTerms(document.id, document.description || '');

        // 索引标签
        if (document.tags && Array.isArray(document.tags)) {
            document.tags.forEach(tag => {
                this.indexTags(tag, document.id);
            });
        }

        // 索引分类
        if (document.category) {
            this.indexCategories(document.category, document.id);
        }

        // 索引关键词
        if (document.keywords && Array.isArray(document.keywords)) {
            document.keywords.forEach(keyword => {
                this.indexTerms(document.id, keyword);
            });
        }
    }

    /**
     * 索引词项
     */
    indexTerms(docId, text) {
        if (!text) return;

        // 分词
        const terms = this.tokenize(text);

        terms.forEach(term => {
            if (!this.index.terms[term]) {
                this.index.terms[term] = [];
            }
            if (!this.index.terms[term].includes(docId)) {
                this.index.terms[term].push(docId);
            }
        });
    }

    /**
     * 索引标签
     */
    indexTags(tag, docId) {
        if (!this.index.tags[tag]) {
            this.index.tags[tag] = [];
        }
        if (!this.index.tags[tag].includes(docId)) {
            this.index.tags[tag].push(docId);
        }
    }

    /**
     * 索引分类
     */
    indexCategories(category, docId) {
        if (!this.index.categories[category]) {
            this.index.categories[category] = [];
        }
        if (!this.index.categories[category].includes(docId)) {
            this.index.categories[category].push(docId);
        }
    }

    /**
     * 分词
     */
    tokenize(text) {
        // 简化的分词逻辑
        return text
            .toLowerCase()
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1);
    }

    /**
     * 搜索
     * @param {string} query - 查询字符串
     * @param {Object} options - 搜索选项
     * @returns {Array} 搜索结果
     */
    search(query, options = {}) {
        // 预处理查询
        const processedQuery = this.tokenize(query);

        // 收集所有相关文档
        const relevantDocs = new Set();

        // 1. 基于词项搜索
        processedQuery.forEach(term => {
            if (this.index.terms[term]) {
                this.index.terms[term].forEach(docId => {
                    relevantDocs.add(docId);
                });
            }
        });

        // 2. 计算得分
        const scoredDocs = Array.from(relevantDocs).map(docId => {
            const document = this.index.documents[docId];
            const score = this.calculateScore(document, processedQuery, options);
            return { ...document, score };
        });

        // 3. 过滤
        let filteredDocs = this.applyFilters(scoredDocs, options);

        // 4. 排序
        filteredDocs.sort((a, b) => b.score - a.score);

        // 5. 分页
        if (options.limit) {
            const start = (options.page || 0) * options.limit;
            filteredDocs = filteredDocs.slice(start, start + options.limit);
        }

        return {
            results: filteredDocs,
            total: filteredDocs.length,
            query: query
        };
    }

    /**
     * 计算文档得分
     */
    calculateScore(document, query, options) {
        let score = 0;

        // 1. 标题匹配 (权重: 0.3)
        if (document.title) {
            const titleScore = this.calculateTextMatch(document.title, query);
            score += titleScore * 0.3;
        }

        // 2. 内容匹配 (权重: 0.3)
        if (document.content) {
            const contentScore = this.calculateTextMatch(document.content, query);
            score += contentScore * 0.3;
        }

        // 3. 描述匹配 (权重: 0.2)
        if (document.description) {
            const descScore = this.calculateTextMatch(document.description, query);
            score += descScore * 0.2;
        }

        // 4. 标签匹配 (权重: 0.2)
        if (document.tags) {
            const tagScore = this.calculateTagMatch(document.tags, query);
            score += tagScore * 0.2;
        }

        // 5. 热度加分
        if (document.usage_count) {
            score += Math.min(document.usage_count / 100, 0.1);
        }

        // 6. 评分加分
        if (document.rating) {
            score += (document.rating / 5) * 0.1;
        }

        return Math.min(score, 1.0);
    }

    /**
     * 计算文本匹配得分
     */
    calculateTextMatch(text, query) {
        const textTokens = this.tokenize(text);
        let matchCount = 0;

        query.forEach(term => {
            if (textTokens.includes(term)) {
                matchCount++;
            }
        });

        return query.length > 0 ? matchCount / query.length : 0;
    }

    /**
     * 计算标签匹配得分
     */
    calculateTagMatch(tags, query) {
        if (!tags || tags.length === 0) return 0;

        let matchCount = 0;

        query.forEach(term => {
            if (tags.some(tag => tag.includes(term) || term.includes(tag))) {
                matchCount++;
            }
        });

        return query.length > 0 ? matchCount / query.length : 0;
    }

    /**
     * 应用过滤条件
     */
    applyFilters(documents, options) {
        return documents.filter(doc => {
            // 分类过滤
            if (options.category && doc.category !== options.category) {
                return false;
            }

            // 类型过滤
            if (options.type && doc.type !== options.type) {
                return false;
            }

            // 标签过滤
            if (options.tags) {
                if (!Array.isArray(options.tags)) {
                    options.tags = [options.tags];
                }
                const hasTag = options.tags.some(tag =>
                    doc.tags && doc.tags.includes(tag)
                );
                if (!hasTag) return false;
            }

            // 评分过滤
            if (options.minRating && (doc.rating || 0) < options.minRating) {
                return false;
            }

            // 使用次数过滤
            if (options.minUsage && (doc.usage_count || 0) < options.minUsage) {
                return false;
            }

            // 日期范围过滤
            if (options.dateRange) {
                const docDate = new Date(doc.created_at);
                if (docDate < options.dateRange.start || docDate > options.dateRange.end) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * 获取分类列表
     */
    getCategories() {
        return Object.keys(this.index.categories);
    }

    /**
     * 获取标签列表
     */
    getTags() {
        return Object.keys(this.index.tags);
    }

    /**
     * 获取建议
     */
    getSuggestions(query, limit = 5) {
        const terms = Object.keys(this.index.terms);
        const suggestions = [];

        terms.forEach(term => {
            if (term.includes(query) && term !== query) {
                suggestions.push({
                    term: term,
                    count: this.index.terms[term].length
                });
            }
        });

        return suggestions
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * 重建索引
     */
    rebuildIndex() {
        this.index = {
            documents: {},
            terms: {},
            categories: {},
            tags: {}
        };

        this.documents.forEach(doc => {
            this.indexDocument(doc);
        });
    }

    /**
     * 清除索引
     */
    clear() {
        this.index = {
            documents: {},
            terms: {},
            categories: {},
            tags: {}
        };
        this.documents = [];
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            total_documents: this.documents.length,
            total_terms: Object.keys(this.index.terms).length,
            total_categories: Object.keys(this.index.categories).length,
            total_tags: Object.keys(this.index.tags).length
        };
    }
}

// 创建全局实例
window.searchEngine = new SearchEngine();

// 使用示例：
/*
const engine = window.searchEngine;

// 添加文档
const documents = [
    {
        title: '微服务架构设计',
        content: '微服务是一种架构风格，它将应用程序构建为一组小型服务',
        description: '介绍微服务架构的核心概念',
        category: '架构设计',
        tags: ['微服务', '架构'],
        type: 'architecture',
        usage_count: 10,
        rating: 4.5
    },
    {
        title: '用户注册流程',
        content: '用户注册包括信息填写、验证、激活等步骤',
        description: '完整的用户注册流程设计',
        category: '业务流程',
        tags: ['注册', '流程'],
        type: 'flow',
        usage_count: 20,
        rating: 4.0
    }
];

documents.forEach(doc => engine.addDocument(doc));

// 搜索
const results = engine.search('微服务', {
    category: '架构设计',
    limit: 10
});

console.log('搜索结果:', results);

// 获取分类
const categories = engine.getCategories();
console.log('分类列表:', categories);

// 获取建议
const suggestions = engine.getSuggestions('微');
console.log('搜索建议:', suggestions);

// 获取统计信息
const stats = engine.getStats();
console.log('索引统计:', stats);
*/