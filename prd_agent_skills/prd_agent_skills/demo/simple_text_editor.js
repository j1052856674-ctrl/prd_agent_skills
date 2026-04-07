// 极简文字编辑器
// 只保留核心编辑功能

class SimpleTextEditor {
    constructor(options = {}) {
        this.options = {
            selector: '.editable',
            autoSave: true,
            history: true,
            ...options
        };
        this.editables = [];
        this.history = new Map();
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        this.editables = document.querySelectorAll(this.options.selector);
        this.setupEventListeners();
        console.log(`初始化完成，找到 ${this.editables.length} 个可编辑元素`);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.editables.forEach(element => {
            // 点击编辑
            element.addEventListener('click', (e) => this.edit(e));

            // 自动高度调整
            if (element.tagName === 'TEXTAREA') {
                element.addEventListener('input', () => this.autoResize(element));
            }
        });

        // 全局保存
        if (this.options.autoSave) {
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('editable') || e.target.closest('.editable')) {
                    this.saveAll();
                }
            });
        }
    }

    /**
     * 进入编辑模式
     */
    edit(e) {
        const element = e.currentTarget;

        // 如果已经是可编辑状态，不重复处理
        if (element.isContentEditable) return;

        // 保存原始内容
        const originalContent = element.innerHTML || element.textContent;
        this.saveHistory(element, originalContent);

        // 设置为可编辑
        element.contentEditable = true;
        element.classList.add('editing');

        // 聚焦并选中所有内容
        this.selectAll(element);

        // 添加编辑样式
        this.addEditStyles(element);

        // 监听失去焦点
        element.addEventListener('blur', () => {
            this.save(element);
            element.contentEditable = false;
            element.classList.remove('editing');
            this.removeEditStyles(element);
        }, { once: true });

        // 监听键盘事件
        element.addEventListener('keydown', (e) => this.handleKeydown(e, element));
    }

    /**
     * 保存内容
     */
    save(element) {
        const content = element.innerHTML || element.textContent;
        const elementId = this.getElementId(element);

        // 更新历史
        if (this.options.history) {
            this.addToHistory(elementId, content);
        }

        // 触发保存事件
        this.triggerSave(elementId, content);

        // 显示保存反馈
        this.showSaveFeedback(element);
    }

    /**
     * 保存所有
     */
    saveAll() {
        this.editables.forEach(element => {
            if (element.isContentEditable) {
                this.save(element);
            }
        });
    }

    /**
     * 选择所有内容
     */
    selectAll(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * 自动调整大小
     */
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    /**
     * 处理键盘事件
     */
    handleKeydown(e, element) {
        // Enter 保存
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            element.blur();
        }

        // Escape 取消
        if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelEdit(element);
        }

        // Ctrl/Cmd + Z 撤销
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            this.undo(element);
        }

        // Tab 键处理
        if (e.key === 'Tab') {
            e.preventDefault();
            const indent = '    ';
            const start = element.selectionStart;
            const end = element.selectionEnd;
            element.value = element.value.substring(0, start) + indent + element.value.substring(end);
            element.selectionStart = element.selectionEnd = start + indent.length;
        }
    }

    /**
     * 添加编辑样式
     */
    addEditStyles(element) {
        element.style.outline = 'none';
        element.style.border = '2px solid #007bff';
        element.style.borderRadius = '4px';
        element.style.padding = '5px';
        element.style.background = '#f0f8ff';
    }

    /**
     * 移除编辑样式
     */
    removeEditStyles(element) {
        element.style.outline = '';
        element.style.border = '';
        element.style.borderRadius = '';
        element.style.padding = '';
        element.style.background = '';
    }

    /**
     * 取消编辑
     */
    cancelEdit(element) {
        const elementId = this.getElementId(element);
        const history = this.history.get(elementId);

        if (history && history.length > 0) {
            const originalContent = history[0].content;
            element.innerHTML = originalContent;
        }

        element.contentEditable = false;
        element.classList.remove('editing');
        this.removeEditStyles(element);
    }

    /**
     * 保存到历史
     */
    saveHistory(element, content) {
        const elementId = this.getElementId(element);

        if (!this.history.has(elementId)) {
            this.history.set(elementId, []);
        }

        const history = this.history.get(elementId);
        history.push({
            content: content,
            timestamp: Date.now()
        });

        // 限制历史记录数量
        if (history.length > 20) {
            history.shift();
        }
    }

    /**
     * 添加到历史记录
     */
    addToHistory(elementId, content) {
        if (!this.history.has(elementId)) {
            this.history.set(elementId, []);
        }

        const history = this.history.get(elementId);

        // 如果当前内容与历史记录不同，则添加
        if (history.length === 0 || history[history.length - 1].content !== content) {
            history.push({
                content: content,
                timestamp: Date.now()
            });

            // 限制历史记录数量
            if (history.length > 20) {
                history.shift();
            }
        }
    }

    /**
     * 撤销
     */
    undo(element) {
        const elementId = this.getElementId(element);
        const history = this.history.get(elementId);

        if (history && history.length > 1) {
            history.pop(); // 移除当前
            const previous = history[history.length - 1];
            element.innerHTML = previous.content;
        }
    }

    /**
     * 获取元素ID
     */
    getElementId(element) {
        if (element.id) return element.id;
        if (element.className) return element.className;
        return Array.from(this.editables).indexOf(element);
    }

    /**
     * 触发保存事件
     */
    triggerSave(elementId, content) {
        const event = new CustomEvent('simpleEditor:save', {
            detail: {
                elementId: elementId,
                content: content,
                timestamp: Date.now()
            },
            bubbles: true
        });
        element.dispatchEvent(event);
    }

    /**
     * 显示保存反馈
     */
    showSaveFeedback(element) {
        const originalBg = element.style.background;
        element.style.background = '#d4edda';
        element.style.transition = 'background 0.3s';

        setTimeout(() => {
            element.style.background = originalBg;
        }, 300);
    }

    /**
     * 导出所有内容
     */
    exportAll() {
        const data = {};
        this.editables.forEach(element => {
            const elementId = this.getElementId(element);
            data[elementId] = {
                content: element.innerHTML || element.textContent,
                tagName: element.tagName
            };
        });

        return {
            timestamp: Date.now(),
            data: data
        };
    }

    /**
     * 导入内容
     */
    importAll(data) {
        Object.entries(data.data).forEach(([elementId, content]) => {
            const element = this.editables.find(el => this.getElementId(el) === elementId);
            if (element) {
                element.innerHTML = content.content;
            }
        });
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const stats = {
            total: this.editables.length,
            editing: 0,
            saved: 0,
            totalCharacters: 0,
            totalWords: 0
        };

        this.editables.forEach(element => {
            const text = element.textContent || '';
            const content = element.innerHTML || '';

            stats.totalCharacters += text.length;
            stats.totalWords += text.trim().split(/\s+/).filter(w => w.length > 0).length;

            if (element.classList.contains('editing')) {
                stats.editing++;
            } else {
                stats.saved++;
            }
        });

        return stats;
    }

    /**
     * 清除所有历史
     */
    clearHistory() {
        this.history.clear();
    }
}

// 创建默认实例
window.simpleTextEditor = new SimpleTextEditor();

/**
 * 初始化文本编辑器
 * @param {string} selector 可编辑元素的CSS选择器
 */
window.simpleTextEditor.init = function(selector = '.editable') {
    // 自动查找并初始化所有可编辑元素
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        // 避免重复初始化
        if (!element.dataset.simpleEditorInitialized) {
            this.makeEditable(element);
            element.dataset.simpleEditorInitialized = 'true';
        }
    });

    console.log(`已初始化 ${elements.length} 个可编辑元素`);
};

// 使用示例：
/*
// 初始化
window.simpleTextEditor.init('.editable');

// 监听保存事件
document.addEventListener('simpleEditor:save', (e) => {
    console.log('内容已保存:', e.detail);
});

// 导出内容
const data = window.simpleTextEditor.exportAll();
console.log('导出数据:', data);
*/