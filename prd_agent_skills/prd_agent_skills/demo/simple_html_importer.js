// 简化的HTML导入器
// 利用Claude的直接理解能力，简化处理逻辑

class SimpleHTMLImporter {
    constructor() {
        this.pages = [];
        this.currentFile = null;
    }

    /**
     * 导入HTML文件或图片
     * @param {File} file - HTML文件或设计稿图片
     * @returns {Promise<string>} - 生成的可编辑HTML
     */
    async import(file) {
        this.currentFile = file;
        const fileType = file.type;
        const fileSize = (file.size / 1024).toFixed(2);

        if (fileType.startsWith('image/')) {
            // 图片类型提示
            console.log(`正在处理图片文件: ${file.name} (${fileSize} KB)`);
            return await this.analyzeImage(file);
        } else if (fileType === 'text/html') {
            // HTML类型提示
            console.log(`正在处理HTML文件: ${file.name} (${fileSize} KB)`);
            return await this.parseHTML(file);
        } else {
            throw new Error(`不支持文件类型: ${file.type}，请上传HTML文件或图片`);
        }
    }

    /**
     * 解析HTML文件
     */
    async parseHTML(file) {
        const content = await file.text();

        // 简单解析，提取关键信息
        const info = {
            title: this.extractTitle(content),
            pages: this.extractPages(content),
            elements: this.extractElements(content)
        };

        // 生成可编辑版本
        const editableHTML = this.generateEditableHTML(info);
        return editableHTML;
    }

    /**
     * 分析图片（简化版本）
     */
    async analyzeImage(file) {
        // 创建文件预览
        const previewURL = URL.createObjectURL(file);

        // 返回一个简单的可编辑HTML模板
        return `
<div class="image-analysis" data-file="${file.name}">
    <div class="image-preview">
        <img src="${previewURL}" alt="设计稿预览" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px;">
    </div>
    <div class="editable-container">
        <h3 class="editable" data-placeholder="页面标题">点击编辑页面标题</h3>
        <div class="editable" data-placeholder="主要内容">
            <p>点击编辑主要内容</p>
            <p>您可以在这里添加产品描述、功能特性等内容。</p>
        </div>
        <div class="editable" data-placeholder="页脚信息">
            <p>© 2024 您的公司名称</p>
        </div>
    </div>
</div>
<style>
.image-analysis {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
}
.image-preview {
    text-align: center;
    margin-bottom: 20px;
}
.editable-container {
    background: white;
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #ddd;
}
.editable {
    border: 1px dashed #ccc;
    padding: 15px;
    margin: 15px 0;
    border-radius: 4px;
    cursor: text;
    min-height: 50px;
    transition: all 0.3s;
}
.editable:hover {
    background: #f0f0f0;
    border-color: #007bff;
}
</style>
<script>
// 初始化编辑功能
document.addEventListener('DOMContentLoaded', function() {
    const editables = document.querySelectorAll('.editable');

    editables.forEach(element => {
        element.addEventListener('click', function() {
            if (this.isContentEditable) return;

            // 保存原始内容
            const originalContent = this.innerHTML;

            // 设置为可编辑
            this.contentEditable = true;
            this.style.border = '2px solid #007bff';
            this.style.background = '#f0f8ff';

            // 聚焦
            this.focus();

            // 全选内容
            const range = document.createRange();
            range.selectNodeContents(this);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // 失去焦点时保存
            const saveEdit = () => {
                this.contentEditable = false;
                this.style.border = '1px dashed #ccc';
                this.style.background = '';

                // 触发保存
                console.log('内容已保存:', this.innerHTML);
            };

            this.addEventListener('blur', saveEdit, { once: true });
        });
    });
});
</script>
`;
    }

    /**
     * 提取页面标题
     */
    extractTitle(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        return doc.title || doc.querySelector('h1')?.textContent || '未命名页面';
    }

    /**
     * 提取页面
     */
    extractPages(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        // 查找所有主要内容区域
        const mainContent = doc.querySelector('main, .main, .content, #content')?.innerHTML;
        const sections = doc.querySelectorAll('section, .section');

        const pages = [];

        if (mainContent) {
            pages.push({
                id: 'main',
                title: '主内容',
                content: mainContent
            });
        }

        sections.forEach((section, index) => {
            pages.push({
                id: `section-${index}`,
                title: section.querySelector('h1, h2, h3')?.textContent || `章节 ${index + 1}`,
                content: section.innerHTML
            });
        });

        return pages;
    }

    /**
     * 提取元素
     */
    extractElements(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const elements = {
            links: Array.from(doc.querySelectorAll('a')).map(a => a.textContent),
            buttons: Array.from(doc.querySelectorAll('button')).map(b => b.textContent),
            images: Array.from(doc.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt
            }))
        };

        return elements;
    }

    /**
     * 生成可编辑HTML
     */
    generateEditableHTML(info) {
        let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${info.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .editable {
            border: 1px dashed transparent;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            cursor: text;
            transition: all 0.3s;
            min-height: 50px;
        }
        .editable:hover {
            background: #f9f9f9;
            border-color: #007bff;
        }
        .editable:focus {
            outline: none;
            border-color: #007bff;
            background: white;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        .page {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .page h2 {
            margin-top: 0;
            color: #333;
        }
        .navigation {
            position: fixed;
            left: 0;
            top: 0;
            width: 200px;
            height: 100%;
            background: #2c3e50;
            padding: 20px;
            color: white;
        }
        .navigation a {
            display: block;
            color: #ecf0f1;
            text-decoration: none;
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
            transition: background 0.3s;
        }
        .navigation a:hover {
            background: #34495e;
        }
        .navigation a.active {
            background: #3498db;
        }
        .content {
            margin-left: 240px;
        }
        .toolbar {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        .toolbar button {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .toolbar button:hover {
            background: #0056b3;
        }
        .placeholder {
            color: #6c757d;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="navigation">
        <h3>页面导航</h3>
`;

        // 添加页面导航
        info.pages.forEach((page, index) => {
            html += `
        <a href="#page-${index}" class="${index === 0 ? 'active' : ''}">${page.title}</a>
`;
        });

        html += `
    </div>
    <div class="content">
        <div class="toolbar">
            <button onclick="exportContent()">💾 导出内容</button>
            <button onclick="addNewPage()">➕ 添加页面</button>
            <button onclick="toggleEditMode()">✏️ ${localStorage.getItem('editMode') === 'true' ? '预览' : '编辑'}模式</button>
        </div>
        <div class="container">
`;

        // 添加可编辑页面
        info.pages.forEach((page, index) => {
            html += `
            <div id="page-${index}" class="page" style="display: ${index === 0 ? 'block' : 'none'};">
                <h2 class="editable" data-placeholder="页面标题">${page.title}</h2>
                <div class="editable" data-placeholder="页面内容">
${page.content}
                </div>
            </div>
`;
        });

        html += `
        </div>
    </div>

    <script>
        // 简单的页面切换
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.navigation a');
            const pages = document.querySelectorAll('.page');

            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();

                    // 更新导航状态
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');

                    // 切换页面
                    const targetId = this.getAttribute('href').substring(1);
                    pages.forEach(page => {
                        page.style.display = 'none';
                    });
                    document.getElementById(targetId).style.display = 'block';
                });
            });

            // 添加编辑功能
            initEditFunctionality();
        });

        // 编辑功能
        function initEditFunctionality() {
            const editables = document.querySelectorAll('.editable');

            editables.forEach(element => {
                element.addEventListener('click', function() {
                    if (localStorage.getItem('editMode') === 'true') {
                        enterEditMode(this);
                    }
                });

                element.addEventListener('blur', function() {
                    if (this.isContentEditable) {
                        saveContent(this);
                    }
                });

                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.blur();
                    }
                });
            });
        }

        // 进入编辑模式
        function enterEditMode(element) {
            element.contentEditable = true;
            element.focus();

            // 设置光标位置
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // 保存内容
        function saveContent(element) {
            element.contentEditable = false;
            console.log('内容已保存:', element.innerHTML);

            // 添加保存动画
            element.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }

        // 导出内容
        function exportContent() {
            const pages = [];
            document.querySelectorAll('.page').forEach((page, index) => {
                const title = page.querySelector('.editable').textContent;
                const content = page.querySelectorAll('.editable')[1].innerHTML;
                pages.push({
                    title: title,
                    content: content
                });
            });

            const data = {
                title: document.title,
                pages: pages,
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'editable-pages.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        // 添加新页面
        function addNewPage() {
            const pageCount = document.querySelectorAll('.page').length;
            const newPageHTML = \`
            <div id="page-\${pageCount}" class="page">
                <h2 class="editable" data-placeholder="新页面标题">新页面</h2>
                <div class="editable" data-placeholder="页面内容">
                    点击编辑内容
                </div>
            </div>
            \`;

            document.querySelector('.container').insertAdjacentHTML('beforeend', newPageHTML);

            // 更新导航
            const nav = document.querySelector('.navigation');
            nav.insertAdjacentHTML('beforeend', \`
            <a href="#page-\${pageCount}">新页面</a>
            \`);

            // 切换到新页面
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            document.getElementById(\`page-\${pageCount}\`).style.display = 'block';

            // 初始化编辑功能
            const newEditables = document.querySelectorAll('#page-' + pageCount + ' .editable');
            newEditables.forEach(element => {
                element.addEventListener('click', function() {
                    if (localStorage.getItem('editMode') === 'true') {
                        enterEditMode(this);
                    }
                });
            });
        }

        // 切换编辑模式
        function toggleEditMode() {
            const isEditMode = localStorage.getItem('editMode') !== 'true';
            localStorage.setItem('editMode', isEditMode);
            location.reload();
        }

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = \`
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>
`;

        return html;
    }

    /**
     * 生成可编辑的HTML文件
     */
    exportEditableHTML(html) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'editable-prototype.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 全局实例
window.simpleHTMLImporter = new SimpleHTMLImporter();

// 使用示例：
/*
const file = document.getElementById('fileInput').files[0];
if (file) {
    window.simpleHTMLImporter.import(file).then(html => {
        // 显示预览
        document.getElementById('preview').innerHTML = html;

        // 或者导出
        window.simpleHTMLImporter.exportEditableHTML(html);
    });
}
*/