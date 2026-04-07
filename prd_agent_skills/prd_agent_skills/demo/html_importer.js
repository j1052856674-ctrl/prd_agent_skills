// HTML原型导入器
// 用于导入和管理HTML原型文件

class HTMLImporter {
    constructor() {
        this.pages = [];
        this.navigation = [];
        this.assets = [];
    }

    /**
     * 导入HTML文件
     * @param {File} file - HTML文件
     * @returns {Promise<Object>} - 导入结果
     */
    async importHTML(file) {
        try {
            const htmlContent = await this.readFile(file);
            const pages = this.parseHTML(htmlContent);
            const assets = this.extractAssets(htmlContent);

            return {
                success: true,
                pages: pages,
                assets: assets,
                navigation: this.generateNavigation(pages)
            };
        } catch (error) {
            console.error('导入失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 读取文件
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    /**
     * 解析HTML，提取页面信息
     */
    parseHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 提取所有页面标题
        const titles = Array.from(doc.querySelectorAll('h1, h2, .page-title, .title'))
            .map(el => el.textContent.trim())
            .filter(title => title.length > 0);

        // 提取主要内容区域
        const content = doc.querySelector('.content, main, .main')?.innerHTML || doc.body.innerHTML;

        // 提取链接和按钮
        const links = Array.from(doc.querySelectorAll('a, button'))
            .map(el => ({
                text: el.textContent.trim(),
                href: el.href || el.getAttribute('data-target') || '#'
            }))
            .filter(item => item.text.length > 0);

        return titles.map((title, index) => ({
            id: `page-${index + 1}`,
            title: title,
            content: this.extractPageContent(content, index),
            links: links,
            elements: this.extractInteractiveElements(content)
        }));
    }

    /**
     * 提取页面内容
     */
    extractPageContent(content, index) {
        // 简单的内容分割策略
        const sections = content.split(/<h[1-6]>|<div[^>]*class="[^"]*page[^"]*">/i);
        return sections[index] || content;
    }

    /**
     * 提取交互元素
     */
    extractInteractiveElements(content) {
        const elements = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // 提取表单元素
        const forms = tempDiv.querySelectorAll('input, textarea, select');
        forms.forEach(el => {
            elements.push({
                type: el.tagName.toLowerCase(),
                name: el.name || el.id || '',
                placeholder: el.placeholder || ''
            });
        });

        return elements;
    }

    /**
     * 提取资源文件
     */
    extractAssets(html) {
        const assets = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 提取图片
        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            if (src) {
                assets.push({
                    type: 'image',
                    url: src,
                    alt: img.alt || ''
                });
            }
        });

        return assets;
    }

    /**
     * 生成导航菜单
     */
    generateNavigation(pages) {
        return pages.map((page, index) => ({
            id: page.id,
            title: page.title,
            index: index + 1,
            hasContent: page.content.length > 0,
            hasLinks: page.links.length > 0
        }));
    }

    /**
     * 生成预览HTML
     */
    generatePreviewHTML(pages) {
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>原型预览</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .navigation {
            position: fixed;
            left: 0;
            top: 0;
            width: 250px;
            height: 100%;
            background: #2c3e50;
            color: white;
            padding: 20px;
            overflow-y: auto;
        }
        .navigation h3 {
            margin-top: 0;
            color: #ecf0f1;
        }
        .navigation ul {
            list-style: none;
            padding: 0;
        }
        .navigation li {
            margin: 5px 0;
        }
        .navigation a {
            color: #bdc3c7;
            text-decoration: none;
            display: block;
            padding: 5px;
            border-radius: 3px;
            transition: background 0.3s;
        }
        .navigation a:hover {
            background: #34495e;
            color: white;
        }
        .navigation a.active {
            background: #3498db;
            color: white;
        }
        .content {
            margin-left: 270px;
            padding: 20px;
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .page {
            display: none;
        }
        .page.active {
            display: block;
        }
        .editable {
            border: 1px dashed transparent;
            padding: 2px 4px;
            border-radius: 3px;
            cursor: text;
        }
        .editable:hover {
            background: #f0f0f0;
        }
        .editable:focus {
            outline: none;
            border-color: #3498db;
            background: white;
        }
    </style>
</head>
<body>
    <div class="navigation">
        <h3>页面导航</h3>
        <ul>
`;

        pages.forEach((page, index) => {
            html += `
            <li><a href="#${page.id}" class="${index === 0 ? 'active' : ''}">${index + 1}. ${page.title}</a></li>
`;
        });

        html += `
        </ul>
    </div>
    <div class="content">
`;

        pages.forEach((page, index) => {
            html += `
        <div id="${page.id}" class="page ${index === 0 ? 'active' : ''}">
            <h2 class="editable">${page.title}</h2>
            <div class="page-content editable">
${page.content}
            </div>
        </div>
`;
        });

        html += `
    </div>

    <script>
        // 页面切换功能
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
                        page.classList.remove('active');
                        if (page.id === targetId) {
                            page.classList.add('active');
                        }
                    });
                });
            });

            // 添加编辑功能
            const editables = document.querySelectorAll('.editable');
            editables.forEach(element => {
                element.addEventListener('click', function() {
                    this.contentEditable = true;
                    this.focus();
                });

                element.addEventListener('blur', function() {
                    this.contentEditable = false;
                    // 这里可以添加保存逻辑
                    console.log('内容已更新:', this.innerHTML);
                });

                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.blur();
                    }
                });
            });
        });
    </script>
</body>
</html>
`;

        return html;
    }

    /**
     * 导出预览HTML
     */
    exportPreviewHTML() {
        const pages = this.pages;
        const previewHTML = this.generatePreviewHTML(pages);

        const blob = new Blob([previewHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prototype-preview.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 全局实例
window.htmlImporter = new HTMLImporter();

// 使用示例：
/*
const file = document.getElementById('htmlFile').files[0];
if (file) {
    window.htmlImporter.importHTML(file).then(result => {
        if (result.success) {
            console.log('导入成功:', result);
            window.htmlExporter.exportPreviewHTML();
        } else {
            console.error('导入失败:', result.error);
        }
    });
}
*/