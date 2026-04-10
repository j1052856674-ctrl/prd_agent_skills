// 多模态输入处理器
class MultimodalProcessor {
    constructor() {
        this.supportedFormats = {
            documents: ['md', 'txt', 'docx', 'pdf'],
            images: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
            tables: ['xlsx', 'csv'],
            voice: ['mp3', 'wav', 'm4a']
        };
        this.processors = {
            documents: this.processDocument.bind(this),
            images: this.processImage.bind(this),
            tables: this.processTable.bind(this),
            voice: this.processVoice.bind(this)
        };
    }

    /**
     * 处理输入文件
     * @param {File} file - 用户上传的文件
     * @returns {Promise<Object>} 处理结果
     */
    async process(file) {
        const fileType = this.getFileType(file);
        const processor = this.processors[fileType];

        if (!processor) {
            throw new Error(`不支持的文件类型: ${file.type}`);
        }

        try {
            const result = await processor(file);
            return {
                success: true,
                type: fileType,
                data: result,
                metadata: {
                    filename: file.name,
                    size: file.size,
                    processed_at: new Date().toISOString()
                }
            };
        } catch (error) {
            throw new Error(`处理文件失败: ${error.message}`);
        }
    }

    /**
     * 判断文件类型
     */
    getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const mimeType = file.type;

        // 文档类型
        if (this.supportedFormats.documents.includes(extension)) {
            return 'documents';
        }

        // 图片类型
        if (this.supportedFormats.images.includes(extension) || mimeType.startsWith('image/')) {
            return 'images';
        }

        // 表格类型
        if (this.supportedFormats.tables.includes(extension)) {
            return 'tables';
        }

        // 语音类型
        if (this.supportedFormats.voice.includes(extension) || mimeType.startsWith('audio/')) {
            return 'voice';
        }

        throw new Error(`不支持的文件类型: ${extension}`);
    }

    /**
     * 处理文档文件
     */
    async processDocument(file) {
        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'md':
            case 'txt':
                return await this.processTextFile(file);

            case 'docx':
                return await this.processDocx(file);

            case 'pdf':
                return await this.processPdf(file);

            default:
                throw new Error(`不支持的文档格式: ${extension}`);
        }
    }

    /**
     * 处理文本文件
     */
    async processTextFile(file) {
        const content = await file.text();

        // 提取关键信息
        const extracted = this.extractTextInfo(content);

        return {
            content: content,
            extracted: extracted,
            word_count: content.split(/\s+/).length,
            character_count: content.length,
            preview: content.substring(0, 200) + '...'
        };
    }

    /**
     * 处理DOCX文件（简化版）
     */
    async processDocx(file) {
        // 这里应该使用docx库处理
        // 简化版：读取文本内容
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // 简单的文本提取（实际应该使用专门的解析器）
        const text = this.extractTextFromDocx(uint8Array);

        return {
            content: text,
            extracted: this.extractTextInfo(text),
            word_count: text.split(/\s+/).length,
            character_count: text.length,
            preview: text.substring(0, 200) + '...'
        };
    }

    /**
     * 处理PDF文件（简化版）
     */
    async processPdf(file) {
        // 这里应该使用pdf.js处理
        // 简化版：读取文本内容
        const arrayBuffer = await file.arrayBuffer();

        // 简单的文本提取（实际应该使用PDF解析器）
        const text = 'PDF文件内容（需要专门的PDF解析器）';

        return {
            content: text,
            extracted: this.extractTextInfo(text),
            page_count: 1, // 需要实际解析
            word_count: text.split(/\s+/).length,
            preview: text.substring(0, 200) + '...'
        };
    }

    /**
     * 处理图片文件
     */
    async processImage(file) {
        // 创建预览URL
        const previewUrl = URL.createObjectURL(file);

        // 提取图片信息
        const info = await this.extractImageInfo(file);

        // 图像分析（这里应该使用OCR或图像识别）
        const analysis = await this.analyzeImage(file);

        return {
            preview_url: previewUrl,
            width: info.width,
            height: info.height,
            format: info.format,
            size: file.size,
            extracted: analysis,
            ocr_text: analysis.ocr_text || '',
            elements: analysis.elements || []
        };
    }

    /**
     * 处理表格文件
     */
    async processTable(file) {
        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'csv':
                return await this.processCsv(file);
            case 'xlsx':
                return await this.processExcel(file);
            default:
                throw new Error(`不支持的表格格式: ${extension}`);
        }
    }

    /**
     * 处理CSV文件
     */
    async processCsv(file) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        // 解析CSV
        const headers = this.parseCsvLine(lines[0]);
        const rows = lines.slice(1).map(line => this.parseCsvLine(line));

        return {
            headers: headers,
            rows: rows,
            row_count: rows.length,
            column_count: headers.length,
            preview: {
                headers: headers,
                first_rows: rows.slice(0, 5)
            }
        };
    }

    /**
     * 处理Excel文件（简化版）
     */
    async processExcel(file) {
        // 这里应该使用xlsx库处理
        // 简化版：模拟Excel数据
        const mockData = {
            sheets: {
                'Sheet1': {
                    headers: ['产品名称', '价格', '库存'],
                    data: [
                        ['商品A', '100', '50'],
                        ['商品B', '200', '30']
                    ]
                }
            },
            sheet_names: ['Sheet1']
        };

        return {
            sheets: mockData.sheets,
            sheet_names: mockData.sheet_names,
            total_sheets: Object.keys(mockData.sheets).length,
            preview: mockData.sheets['Sheet1']
        };
    }

    /**
     * 处理语音文件
     */
    async processVoice(file) {
        // 创建音频URL
        const audioUrl = URL.createObjectURL(file);

        // 语音识别（这里应该使用Web Speech API或第三方服务）
        const transcription = await this.transcribeAudio(file);

        return {
            audio_url: audioUrl,
            duration: await this.getAudioDuration(file),
            format: file.name.split('.').pop(),
            transcription: transcription,
            confidence: transcription.confidence || 0,
            segments: transcription.segments || []
        };
    }

    /**
     * 提取文本信息
     */
    extractTextInfo(text) {
        // 提取标题
        const titleMatch = text.match(/^# (.+)$/m);
        const title = titleMatch ? titleMatch[1] : '无标题';

        // 提取关键信息
        const sections = this.extractSections(text);

        // 识别关键词
        const keywords = this.extractKeywords(text);

        // 识别需求类型
        const requirements = this.extractRequirements(text);

        return {
            title: title,
            sections: sections,
            keywords: keywords,
            requirements: requirements,
            summary: text.substring(0, 200) + '...'
        };
    }

    /**
     * 提取文档章节
     */
    extractSections(text) {
        const sectionRegex = /^## (.+)$/gm;
        const sections = [];
        let match;

        while ((match = sectionRegex.exec(text)) !== null) {
            sections.push({
                title: match[1],
                start: match.index,
                end: text.indexOf('\n', match.index)
            });
        }

        return sections;
    }

    /**
     * 提取关键词
     */
    extractKeywords(text) {
        // 简化的关键词提取
        const commonWords = ['的', '了', '和', '是', '在', '有', '我', '你', '他', '它'];
        const words = text
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1 && !commonWords.includes(word))
            .reduce((count, word) => {
                count[word] = (count[word] || 0) + 1;
                return count;
            }, {});

        // 返回频率最高的10个词
        return Object.entries(words)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    /**
     * 提取需求信息
     */
    extractRequirements(text) {
        const requirements = [];
        const patterns = [
            /需要\s+(.+?)\s+功能/g,
            /要求\s+(.+?)\s+能力/g,
            /支持\s+(.+?)\s+特性/g,
            /实现\s+(.+?)\s+功能/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                requirements.push({
                    type: 'functional',
                    description: match[1],
                    position: match.index
                });
            }
        });

        return requirements;
    }

    /**
     * 提取图片信息
     */
    async extractImageInfo(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    format: file.name.split('.').pop().toLowerCase()
                });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 分析图片内容
     */
    async analyzeImage(file) {
        // 这里应该使用图像识别API
        // 简化版：返回模拟数据
        return {
            ocr_text: '图片中的文字内容（需要OCR）',
            elements: [
                {
                    type: 'text',
                    position: { x: 100, y: 100 },
                    content: '标题'
                },
                {
                    type: 'button',
                    position: { x: 200, y: 200 },
                    content: '按钮'
                }
            ],
            layout: {
                type: 'ui_design',
                sections: ['header', 'content', 'footer']
            }
        };
    }

    /**
     * 语音转文字
     */
    async transcribeAudio(file) {
        // 这里应该使用Web Speech API或第三方服务
        // 简化版：返回模拟数据
        return {
            text: '语音转文字内容',
            confidence: 0.95,
            segments: [
                {
                    start: 0,
                    end: 5,
                    text: '这是第一句话'
                },
                {
                    start: 5,
                    end: 10,
                    text: '这是第二句话'
                }
            ]
        };
    }

    /**
     * 获取音频时长
     */
    async getAudioDuration(file) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.onloadedmetadata = () => {
                resolve(audio.duration);
            };
            audio.onerror = () => {
                resolve(0);
            };
            audio.src = URL.createObjectURL(file);
        });
    }

    /**
     * 解析CSV行
     */
    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * 从DOCX提取文本（简化版）
     */
    extractTextFromDocx(uint8Array) {
        // 这里应该使用专门的DOCX解析器
        // 简化版：返回示例文本
        return 'DOCX文档内容（需要专门的解析器）';
    }

    /**
     * 清理URL对象
     */
    cleanup(url) {
        if (url) {
            URL.revokeObjectURL(url);
        }
    }
}

// 创建全局实例
window.multimodalProcessor = new MultimodalProcessor();

// 使用示例：
/*
const processor = window.multimodalProcessor;

// 处理文件
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const result = await processor.process(file);
            console.log('处理结果:', result);

            // 根据类型显示不同内容
            switch (result.type) {
                case 'documents':
                    console.log('文档内容:', result.data.content);
                    break;
                case 'images':
                    console.log('图片预览:', result.data.preview_url);
                    break;
                case 'tables':
                    console.log('表格数据:', result.data.preview);
                    break;
                case 'voice':
                    console.log('语音转录:', result.data.transcription);
                    break;
            }
        } catch (error) {
            console.error('处理失败:', error);
        }
    }
});
*/