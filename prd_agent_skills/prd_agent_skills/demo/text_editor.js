// 文字编辑器
// 为HTML内容提供可编辑功能

class TextEditor {
    constructor() {
        this.editables = [];
        this.history = [];
        this.maxHistory = 50;
        this.currentElement = null;
    }

    /**
     * 初始化编辑器
     * @param {string} selector - 可编辑元素的选择器
     */
    init(selector = '.editable') {
        this.editables = document.querySelectorAll(selector);
        this.setupEventListeners();
        console.log(`初始化编辑器，找到 ${this.editables.length} 个可编辑元素`);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        this.editables.forEach(element => {
            // 点击进入编辑模式
            element.addEventListener('click', (e) => this.enterEditMode(e));

            // 失去焦点保存
            element.addEventListener('blur', (e) => this.saveContent(e));

            // 键盘快捷键
            element.addEventListener('keydown', (e) => this.handleKeyDown(e));

            // 双击全选
            element.addEventListener('dblclick', (e) => this.selectAll(e));

            // 粘贴时清理格式
            element.addEventListener('paste', (e) => this.handlePaste(e));
        });

        // 全局快捷键
        document.addEventListener('keydown', (e) => this.handleGlobalKeys(e));
    }

    /**
     * 进入编辑模式
     */
    enterEditMode(e) {
        const element = e.currentTarget;
        if (element.isContentEditable || element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return;
        }

        this.currentElement = element;
        element.classList.add('editing');
        element.contentEditable = true;
        element.focus();

        // 设置光标位置
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // 添加工具栏
        this.showToolbar(element);
    }

    /**
     * 保存内容
     */
    saveContent(e) {
        const element = e.currentTarget;
        if (!element.isContentEditable) {
            return;
        }

        element.classList.remove('editing');
        element.contentEditable = false;

        // 保存到历史
        const content = element.innerHTML;
        const elementId = this.getElementId(element);
        this.addToHistory(elementId, content);

        // 隐藏工具栏
        this.hideToolbar();

        // 触发保存事件
        this.triggerSaveEvent(elementId, content);
    }

    /**
     * 处理键盘事件
     */
    handleKeyDown(e) {
        const element = e.currentTarget;

        // Enter键保存（Shift+Enter换行）
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            element.blur();
        }

        // Escape键取消编辑
        if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelEdit(element);
        }

        // Ctrl/Cmd + Z 撤销
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            this.undo(element);
        }

        // Ctrl/Cmd + Y 重做
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            this.redo(element);
        }

        // Tab键处理
        if (e.key === 'Tab') {
            e.preventDefault();
            this.handleTab(e);
        }
    }

    /**
     * 全选文本
     */
    selectAll(e) {
        const element = e.currentTarget;
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * 处理粘贴
     */
    handlePaste(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    }

    /**
     * 显示工具栏
     */
    showToolbar(element) {
        // 移除旧的工具栏
        const oldToolbar = document.querySelector('.text-editor-toolbar');
        if (oldToolbar) {
            oldToolbar.remove();
        }

        const toolbar = document.createElement('div');
        toolbar.className = 'text-editor-toolbar';
        toolbar.innerHTML = `
            <button class="toolbar-btn" onclick="textEditor.bold()" title="加粗">
                <strong>B</strong>
            </button>
            <button class="toolbar-btn" onclick="textEditor.italic()" title="斜体">
                <em>I</em>
            </button>
            <button class="toolbar-btn" onclick="textEditor.underline()" title="下划线">
                <u>U</u>
            </button>
            <span class="toolbar-divider">|</span>
            <button class="toolbar-btn" onclick="textEditor.insertLink()" title="插入链接">
                🔗
            </button>
            <button class="toolbar-btn" onclick="textEditor.insertList()" title="无序列表">
                • 列表
            </button>
            <button class="toolbar-btn" onclick="textEditor.insertNumberedList()" title="有序列表">
                1. 列表
            </button>
            <span class="toolbar-divider">|</span>
            <button class="toolbar-btn" onclick="textEditor.undo()" title="撤销">
                ↶
            </button>
            <button class="toolbar-btn" onclick="textEditor.redo()" title="重做">
                ↷
            </button>
            <span class="toolbar-divider">|</span>
            <button class="toolbar-btn" onclick="textEditor.clearFormat()" title="清除格式">
                ✗
            </button>
        `;

        // 定位工具栏
        const rect = element.getBoundingClientRect();
        toolbar.style.position = 'fixed';
        toolbar.style.top = (rect.top - 40) + 'px';
        toolbar.style.left = rect.left + 'px';
        toolbar.style.zIndex = '1000';
        toolbar.style.background = 'white';
        toolbar.style.border = '1px solid #ddd';
        toolbar.style.borderRadius = '4px';
        toolbar.style.padding = '5px';
        toolbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

        document.body.appendChild(toolbar);

        // 点击其他地方时隐藏工具栏
        setTimeout(() => {
            document.addEventListener('click', this.hideToolbar.bind(this), { once: true });
        }, 100);
    }

    /**
     * 隐藏工具栏
     */
    hideToolbar(e) {
        if (e && e.target.closest('.text-editor-toolbar')) {
            return;
        }
        const toolbar = document.querySelector('.text-editor-toolbar');
        if (toolbar) {
            toolbar.remove();
        }
    }

    /**
     * 格式化文本
     */
    format(command, value = null) {
        document.execCommand(command, false, value);
        this.currentElement.focus();
    }

    /**
     * 撤销
     */
    undo(element) {
        if (element) {
            this.undoElement(element);
        } else {
            // 撤销当前元素
            if (this.currentElement) {
                this.undoElement(this.currentElement);
            }
        }
    }

    /**
     * 重做
     */
    redo(element) {
        if (element) {
            this.redoElement(element);
        } else {
            // 重做当前元素
            if (this.currentElement) {
                this.redoElement(this.currentElement);
            }
        }
    }

    /**
     * 添加到历史记录
     */
    addToHistory(elementId, content) {
        if (!this.history[elementId]) {
            this.history[elementId] = [];
        }

        // 移除当前位置之后的历史
        if (this.history[elementId].currentPosition) {
            this.history[elementId] = this.history[elementId].slice(0, this.history[elementId].currentPosition);
        }

        // 添加新内容
        this.history[elementId].push({
            content: content,
            timestamp: Date.now()
        });

        // 限制历史记录数量
        if (this.history[elementId].length > this.maxHistory) {
            this.history[elementId].shift();
        }

        // 更新当前位置
        this.history[elementId].currentPosition = this.history[elementId].length - 1;
    }

    /**
     * 撤销元素
     */
    undoElement(element) {
        const elementId = this.getElementId(element);
        if (!this.history[elementId] || this.history[elementId].currentPosition === 0) {
            return;
        }

        this.history[elementId].currentPosition--;
        const state = this.history[elementId][this.history[elementId].currentPosition];
        element.innerHTML = state.content;
    }

    /**
     * 重做元素
     */
    redoElement(element) {
        const elementId = this.getElementId(element);
        if (!this.history[elementId] ||
            this.history[elementId].currentPosition >= this.history[elementId].length - 1) {
            return;
        }

        this.history[elementId].currentPosition++;
        const state = this.history[elementId][this.history[elementId].currentPosition];
        element.innerHTML = state.content;
    }

    /**
     * 取消编辑
     */
    cancelEdit(element) {
        const elementId = this.getElementId(element);
        if (this.history[elementId] && this.history[elementId].currentPosition > 0) {
            const previousState = this.history[elementId][this.history[elementId].currentPosition - 1];
            element.innerHTML = previousState.content;
        }

        element.classList.remove('editing');
        element.contentEditable = false;
        this.hideToolbar();
    }

    /**
     * 获取元素ID
     */
    getElementId(element) {
        if (element.id) {
            return element.id;
        }
        if (element.className) {
            return element.className;
        }
        return 'element-' + Array.from(this.editables).indexOf(element);
    }

    /**
     * 触发保存事件
     */
    triggerSaveEvent(elementId, content) {
        const event = new CustomEvent('textEditor:save', {
            detail: {
                elementId: elementId,
                content: content,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 处理Tab键
     */
    handleTab(e) {
        const element = e.currentTarget;
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // 插入4个空格
        const tabNode = document.createTextNode('    ');
        range.insertNode(tabNode);
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * 全局快捷键处理
     */
    handleGlobalKeys(e) {
        // Ctrl/Cmd + S 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveAll();
        }
    }

    /**
     * 保存所有内容
     */
    saveAll() {
        this.editables.forEach(element => {
            if (element.isContentEditable) {
                element.blur();
            }
        });
        console.log('所有内容已保存');
    }

    /**
     * 插入链接
     */
    insertLink() {
        const url = prompt('请输入链接地址:');
        if (url) {
            this.format('createLink', url);
        }
    }

    /**
     * 插入列表
     */
    insertList() {
        this.format('insertUnorderedList');
    }

    /**
     * 插入有序列表
     */
    insertNumberedList() {
        this.format('insertOrderedList');
    }

    /**
     * 清除格式
     */
    clearFormat() {
        this.format('removeFormat');
    }

    /**
     * 加粗
     */
    bold() {
        this.format('bold');
    }

    /**
     * 斜体
     */
    italic() {
        this.format('italic');
    }

    /**
     * 下划线
     */
    underline() {
        this.format('underline');
    }

    /**
     * 导出所有内容
     */
    exportAll() {
        const contents = {};
        this.editables.forEach(element => {
            const elementId = this.getElementId(element);
            contents[elementId] = {
                content: element.innerHTML,
                text: element.textContent
            };
        });

        return {
            timestamp: Date.now(),
            contents: contents
        };
    }

    /**
     * 导入内容
     */
    importAll(data) {
        Object.entries(data.contents).forEach(([elementId, content]) => {
            const element = this.editables.find(el => this.getElementId(el) === elementId);
            if (element) {
                element.innerHTML = content.content;
                this.addToHistory(elementId, content.content);
            }
        });
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const stats = {
            totalElements: this.editables.length,
            editableElements: 0,
            editedElements: 0,
            totalWords: 0,
            totalCharacters: 0
        };

        this.editables.forEach(element => {
            const text = element.textContent;
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);

            stats.totalWords += words.length;
            stats.totalCharacters += text.length;
            stats.editableElements += (element.isContentEditable ? 1 : 0);
            stats.editedElements += (element.classList.contains('edited') ? 1 : 0);
        });

        return stats;
    }
}

// 全局实例
window.textEditor = new TextEditor();

// 使用示例：
/*
// 初始化编辑器
window.textEditor.init('.editable');

// 监听保存事件
document.addEventListener('textEditor:save', (e) => {
    console.log('内容已保存:', e.detail);
});
*/