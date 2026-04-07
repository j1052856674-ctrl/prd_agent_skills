// 架构图编辑器
// 支持Mermaid图表的实时编辑和预览

class DiagramEditor {
    constructor() {
        this.diagrams = new Map();
        this.currentEditor = null;
        this.mermaidLoaded = false;
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        this.loadMermaid();
        this.setupEventListeners();
    }

    /**
     * 加载Mermaid库
     */
    async loadMermaid() {
        if (this.mermaidLoaded) return;

        try {
            // 尝试从CDN加载Mermaid
            await import('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js');
            this.mermaidLoaded = true;
            this.setupMermaid();
            console.log('Mermaid加载成功');
        } catch (error) {
            console.error('Mermaid加载失败:', error);
            // 提供降级方案
            this.setupFallback();
        }
    }

    /**
     * 设置Mermaid配置
     */
    setupMermaid() {
        if (window.mermaid) {
            window.mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                themeVariables: {
                    primaryColor: '#667eea',
                    primaryTextColor: '#fff',
                    primaryBorderColor: '#667eea',
                    lineColor: '#666',
                    secondaryColor: '#764ba2',
                    tertiaryColor: '#f1f1f1'
                }
            });
        }
    }

    /**
     * 设置降级方案
     */
    setupFallback() {
        // 创建简单的SVG渲染器
        this.renderDiagram = (code) => {
            return `<pre style="background: #f5f5f5; padding: 20px; border-radius: 5px;">${code}</pre>`;
        };
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.diagram-editor')) {
                const diagramId = e.target.closest('.diagram-editor').dataset.diagramId;
                this.openEditor(diagramId);
            }
        });

        // 全局快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.saveAllDiagrams();
            }
        });
    }

    /**
     * 创建图表编辑器
     * @param {string} containerId - 容器ID
     * @param {string} initialCode - 初始代码
     * @param {string} type - 图表类型
     */
    createEditor(containerId, initialCode = '', type = 'flowchart') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器 ${containerId} 不存在`);
            return null;
        }

        const diagramId = `diagram-${Date.now()}`;
        const editorId = `editor-${diagramId}`;

        // 存储图表信息
        this.diagrams.set(diagramId, {
            id: diagramId,
            type: type,
            code: initialCode,
            container: containerId,
            history: [initialCode],
            currentStep: 0
        });

        // 创建编辑器HTML
        const editorHTML = `
            <div class="diagram-editor" data-diagram-id="${diagramId}" style="margin: 20px 0;">
                <div class="diagram-header">
                    <h3>🎨 架构图编辑器</h3>
                    <div class="diagram-controls">
                        <button class="diagram-btn" onclick="diagramEditor.validateDiagram('${diagramId}')" title="验证语法">
                            ✅ 验证
                        </button>
                        <button class="diagram-btn" onclick="diagramEditor.previewDiagram('${diagramId}')" title="预览">
                            👁️ 预览
                        </button>
                        <button class="diagram-btn" onclick="diagramEditor.exportDiagram('${diagramId}')" title="导出">
                            💾 导出
                        </button>
                        <button class="diagram-btn" onclick="diagramEditor.insertTemplate('${diagramId}')" title="插入模板">
                            📋 模板
                        </button>
                    </div>
                </div>

                <div class="diagram-editor-container">
                    <div class="editor-toolbar">
                        <select class="type-selector" onchange="diagramEditor.changeType('${diagramId}', this.value)">
                            <option value="flowchart" ${type === 'flowchart' ? 'selected' : ''}>流程图</option>
                            <option value="sequence" ${type === 'sequence' ? 'selected' : ''}>序列图</option>
                            <option value="class" ${type === 'class' ? 'selected' : ''}>类图</option>
                            <option value="state" ${type === 'state' ? 'selected' : ''}>状态图</option>
                            <option value="er" ${type === 'er' ? 'selected' : ''}>实体关系图</option>
                            <option value="gantt" ${type === 'gantt' ? 'selected' : ''}>甘特图</option>
                            <option value="pie" ${type === 'pie' ? 'selected' : ''}>饼图</option>
                        </select>
                        <span class="divider">|</span>
                        <button class="toolbar-btn" onclick="diagramEditor.undo('${diagramId}')" title="撤销">
                            ↶
                        </button>
                        <button class="toolbar-btn" onclick="diagramEditor.redo('${diagramId}')" title="重做">
                            ↷
                        </button>
                        <button class="toolbar-btn" onclick="diagramEditor.formatCode('${diagramId}')" title="格式化">
                            🎨
                        </button>
                    </div>

                    <div class="code-editor" id="${editorId}">
                        <textarea spellcheck="false">${initialCode}</textarea>
                    </div>

                    <div class="diagram-preview" id="preview-${diagramId}">
                        <div class="preview-toolbar">
                            <span>预览：</span>
                            <button class="preview-btn" onclick="diagramEditor.toggleFullscreen('${diagramId}')">
                                🔍 全屏
                            </button>
                        </div>
                        <div class="preview-content">
                            ${this.renderPreview(initialCode, type)}
                        </div>
                    </div>
                </div>

                <div class="diagram-status" id="status-${diagramId}">
                    <span class="status-indicator">✅ 就绪</span>
                </div>
            </div>
        `;

        // 插入编辑器
        container.insertAdjacentHTML('beforeend', editorHTML);

        // 设置代码编辑器
        this.setupCodeEditor(editorId);

        return diagramId;
    }

    /**
     * 设置代码编辑器
     */
    setupCodeEditor(editorId) {
        const textarea = document.querySelector(`#${editorId} textarea`);
        const editor = document.querySelector(`#${editorId}`);

        // 自动调整高度
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // 语法高亮（简化版）
        textarea.addEventListener('input', () => {
            const diagramId = editor.closest('.diagram-editor').dataset.diagramId;
            const diagram = this.diagrams.get(diagramId);
            diagram.code = textarea.value;
            this.updatePreview(diagramId);
        });

        // 快捷键支持
        textarea.addEventListener('keydown', (e) => {
            const diagramId = editor.closest('.diagram-editor').dataset.diagramId;

            // Ctrl/Cmd + S 保存
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveDiagram(diagramId);
            }

            // Tab键处理
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
        });
    }

    /**
     * 渲染预览
     */
    renderPreview(code, type = 'flowchart') {
        if (!code.trim()) {
            return '<div style="color: #999; text-align: center; padding: 40px;">请输入图表代码</div>';
        }

        if (this.mermaidLoaded && window.mermaid) {
            try {
                // 生成唯一ID
                const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // 使用Mermaid渲染
                const { svg } = window.mermaid.render(uniqueId, code);
                return `<div class="mermaid-diagram">${svg}</div>`;
            } catch (error) {
                console.error('Mermaid渲染失败:', error);
                return `<div class="error-message">
                    <strong>语法错误:</strong><br>
                    ${error.message}
                    <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 3px;">${code}</pre>
                </div>`;
            }
        } else {
            return this.renderFallback(code);
        }
    }

    /**
     * 降级渲染
     */
    renderFallback(code) {
        return `
            <div class="fallback-diagram">
                <h4>Mermaid未加载，显示代码预览</h4>
                <pre style="background: #f5f5f5; padding: 20px; border-radius: 5px; overflow-x: auto;">${code}</pre>
                <p style="margin-top: 10px; color: #666;">请确保网络连接以启用图表渲染</p>
            </div>
        `;
    }

    /**
     * 更新预览
     */
    updatePreview(diagramId) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram) return;

        const previewContainer = document.getElementById(`preview-${diagramId}`);
        const previewContent = previewContainer.querySelector('.preview-content');

        // 显示加载状态
        previewContent.innerHTML = '<div class="loading">正在渲染...</div>';

        // 延迟渲染以避免频繁更新
        clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => {
            previewContent.innerHTML = this.renderPreview(diagram.code, diagram.type);
        }, 500);
    }

    /**
     * 验证图表
     */
    validateDiagram(diagramId) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram) return;

        const status = document.getElementById(`status-${diagramId}`);
        const statusIndicator = status.querySelector('.status-indicator');

        try {
            if (this.mermaidLoaded && window.mermaid) {
                // 尝试解析
                window.mermaid.parse(diagram.code);
                statusIndicator.innerHTML = '✅ 语法正确';
                statusIndicator.className = 'status-indicator success';
            } else {
                statusIndicator.innerHTML = '⚠️ 降级模式';
                statusIndicator.className = 'status-indicator warning';
            }
        } catch (error) {
            statusIndicator.innerHTML = `❌ ${error.message}`;
            statusIndicator.className = 'status-indicator error';
        }
    }

    /**
     * 预览图表
     */
    previewDiagram(diagramId) {
        const editor = document.querySelector(`[data-diagram-id="${diagramId}"]`);
        const preview = editor.querySelector('.diagram-preview');
        preview.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 导出图表
     */
    exportDiagram(diagramId) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram) return;

        // 导出为PNG（如果支持）
        if (this.mermaidLoaded) {
            const svg = document.querySelector(`#preview-${diagramId} svg`);
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                canvas.width = svg.clientWidth;
                canvas.height = svg.clientHeight;

                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    const png = canvas.toDataURL('image/png');

                    // 下载PNG
                    const a = document.createElement('a');
                    a.href = png;
                    a.download = `diagram-${diagramId}.png`;
                    a.click();
                };

                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            }
        }

        // 同时导出代码
        const blob = new Blob([diagram.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${diagramId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 插入模板
     */
    insertTemplate(diagramId) {
        const templates = {
            flowchart: `
flowchart TB
    A[开始] --> B{条件判断}
    B -->|是| C[处理A]
    B -->|否| D[处理B]
    C --> E[结束]
    D --> E`,

            sequence: `
sequenceDiagram
    participant A as 用户
    participant B as 系统
    participant C as 数据库

    A->>B: 登录请求
    B->>C: 验证用户
    C-->>B: 返回结果
    B-->>A: 登录结果`,

            class: `
classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog extends Animal {
        +bark()
    }
    class Cat extends Animal {
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,

            er: `
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        string orderNumber
        date orderDate
    }
    LINE-ITEM {
        string productName
        int quantity
    }`
        };

        const currentType = this.diagrams.get(diagramId).type;
        const template = templates[currentType] || templates.flowchart;

        const textarea = document.querySelector(`[data-diagram-id="${diagramId}"] textarea`);
        textarea.value = template.trim();
        textarea.dispatchEvent(new Event('input'));
    }

    /**
     * 更改图表类型
     */
    changeType(diagramId, newType) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram) return;

        diagram.type = newType;
        this.updatePreview(diagramId);
    }

    /**
     * 撤销
     */
    undo(diagramId) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram || diagram.currentStep === 0) return;

        diagram.currentStep--;
        diagram.code = diagram.history[diagram.currentStep];

        const textarea = document.querySelector(`[data-diagram-id="${diagramId}"] textarea`);
        textarea.value = diagram.code;
        textarea.dispatchEvent(new Event('input'));
    }

    /**
     * 重做
     */
    redo(diagramId) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram || diagram.currentStep >= diagram.history.length - 1) return;

        diagram.currentStep++;
        diagram.code = diagram.history[diagram.currentStep];

        const textarea = document.querySelector(`[data-diagram-id="${diagramId}"] textarea`);
        textarea.value = diagram.code;
        textarea.dispatchEvent(new Event('input'));
    }

    /**
     * 格式化代码
     */
    formatCode(diagramId) {
        const textarea = document.querySelector(`[data-diagram-id="${diagramId}"] textarea`);
        let code = textarea.value;

        // 简单的格式化
        code = code
            .split('\n')
            .map(line => line.trim())
            .filter(line => line || line.trim())
            .join('\n');

        textarea.value = code;
        textarea.dispatchEvent(new Event('input'));
    }

    /**
     * 保存图表
     */
    saveDiagram(diagramId) {
        const diagram = this.diagrams.get(diagramId);
        if (!diagram) return;

        // 添加到历史
        if (diagram.currentStep < diagram.history.length - 1) {
            diagram.history = diagram.history.slice(0, diagram.currentStep + 1);
        }
        diagram.history.push(diagram.code);
        diagram.currentStep = diagram.history.length - 1;

        // 限制历史记录数量
        if (diagram.history.length > 50) {
            diagram.history.shift();
            diagram.currentStep--;
        }

        this.showNotification('图表已保存');
    }

    /**
     * 保存所有图表
     */
    saveAllDiagrams() {
        this.diagrams.forEach((diagram, diagramId) => {
            this.saveDiagram(diagramId);
        });
    }

    /**
     * 全屏预览
     */
    toggleFullscreen(diagramId) {
        const preview = document.getElementById(`preview-${diagramId}`);
        if (preview.requestFullscreen) {
            preview.requestFullscreen();
        } else if (preview.webkitRequestFullscreen) {
            preview.webkitRequestFullscreen();
        } else if (preview.msRequestFullscreen) {
            preview.msRequestFullscreen();
        }
    }

    /**
     * 显示通知
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * 获取所有图表数据
     */
    getAllDiagrams() {
        const data = {};
        this.diagrams.forEach((diagram, diagramId) => {
            data[diagramId] = {
                id: diagram.id,
                type: diagram.type,
                code: diagram.code,
                container: diagram.container
            };
        });
        return data;
    }

    /**
     * 加载图表数据
     */
    loadDiagrams(data) {
        Object.values(data).forEach(diagramData => {
            this.createEditor(diagramData.container, diagramData.code, diagramData.type);
        });
    }
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .diagram-editor {
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .diagram-header {
        background: #f8f9fa;
        padding: 15px 20px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .diagram-header h3 {
        margin: 0;
        color: #333;
    }

    .diagram-controls {
        display: flex;
        gap: 10px;
    }

    .diagram-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
    }

    .diagram-btn:hover {
        background: #0056b3;
    }

    .editor-toolbar {
        background: #f8f9fa;
        padding: 10px 15px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .type-selector {
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
    }

    .divider {
        color: #dee2e6;
        margin: 0 10px;
    }

    .toolbar-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s;
    }

    .toolbar-btn:hover {
        background: #5a6268;
    }

    .code-editor {
        position: relative;
    }

    .code-editor textarea {
        width: 100%;
        min-height: 300px;
        padding: 15px;
        border: none;
        outline: none;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
        background: #f8f9fa;
    }

    .diagram-preview {
        border-top: 1px solid #dee2e6;
    }

    .preview-toolbar {
        background: #f8f9fa;
        padding: 10px 15px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .preview-content {
        padding: 20px;
        text-align: center;
        background: white;
    }

    .mermaid-diagram {
        display: inline-block;
    }

    .error-message {
        color: #dc3545;
        text-align: left;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 15px;
    }

    .loading {
        color: #6c757d;
        padding: 40px;
    }

    .diagram-status {
        background: #f8f9fa;
        padding: 10px 15px;
        border-top: 1px solid #dee2e6;
        font-size: 14px;
    }

    .status-indicator {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
        font-weight: 500;
    }

    .status-indicator.success {
        background: #d4edda;
        color: #155724;
    }

    .status-indicator.warning {
        background: #fff3cd;
        color: #856404;
    }

    .status-indicator.error {
        background: #f8d7da;
        color: #721c24;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    /* 全屏样式 */
    :fullscreen .diagram-preview {
        background: white;
        width: 100vw;
        height: 100vh;
    }

    :-webkit-full-screen .diagram-preview {
        background: white;
        width: 100vw;
        height: 100vh;
    }
`;
document.head.appendChild(style);

// 全局实例
window.diagramEditor = new DiagramEditor();

// 使用示例：
/*
// 创建图表编辑器
window.diagramEditor.createEditor('container-id', 'flowchart TB\nA-->B', 'flowchart');

// 监听保存事件
window.addEventListener('diagram:saved', (e) => {
    console.log('图表已保存:', e.detail);
});
*/