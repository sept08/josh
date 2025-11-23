// 主题色配置
const THEME_COLOR = '#35B378';

// 获取DOM元素
const markdownInput = document.getElementById('markdown-input');
const markdownPreview = document.getElementById('markdown-preview');
const clearBtn = document.getElementById('clear-btn');
const toolbar = document.querySelector('.toolbar');

// 创建字数统计元素
const wordCountElement = document.createElement('span');
wordCountElement.className = 'word-count';
wordCountElement.textContent = '字数: 0';
toolbar.appendChild(wordCountElement);

// 配置 marked.js
marked.setOptions({
    highlight: function(code, lang) {
        // 如果提供了语言并且highlight.js支持该语言，则进行高亮
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('代码高亮错误:', err);
            }
        }
        // 否则进行自动检测
        return hljs.highlightAuto(code).value;
    },
    breaks: true,      // 将换行符转换为 <br>
    gfm: true,         // 启用GitHub风格的Markdown
    headerIds: true,   // 为标题添加id属性
    mangle: false      // 不转义email地址
});

// 初始化编辑器内容（可选的示例文本）
const initialText = `# Markdown 编辑器示例

## 基本语法

### 文本格式化

**粗体文本** 和 *斜体文本*，还有 ~~删除线~~。

### 列表

#### 无序列表
- 项目 1
- 项目 2
- 项目 3

#### 有序列表
1. 第一项
2. 第二项
3. 第三项

### 链接和图片

[GitHub](https://github.com) 是一个代码托管平台。

图片示例：
![示例图片](https://via.placeholder.com/150)

### 代码

行内代码：\`const hello = "Hello, World!"\`

代码块：
\`\`\`javascript
function greet(name) {
    return \`Hello, ${name}!\`;
}

console.log(greet("World"));
\`\`\`

### 引用

> 这是一段引用文本。
> 可以有多行。

### 表格

| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务 1
- [ ] 未完成任务 2
`;

// 设置初始内容
markdownInput.value = initialText;

// 渲染Markdown内容的函数
function renderMarkdown() {
    const markdownText = markdownInput.value;
    const htmlContent = marked.parse(markdownText);
    markdownPreview.innerHTML = htmlContent;
    
    // 为预览区域中的代码块应用highlight.js高亮
    markdownPreview.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}



// 清空内容功能
function clearContent() {
    if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
        markdownInput.value = '';
        renderMarkdown();
        markdownInput.focus();
    }
}



// 自动保存内容到localStorage
function saveToLocalStorage() {
    localStorage.setItem('markdown-editor-content', markdownInput.value);
    
    // 更新自动保存时间显示
    const lastSavedElement = document.querySelector('.last-saved');
    if (lastSavedElement) {
        const now = new Date();
        lastSavedElement.textContent = `上次保存: ${now.toLocaleTimeString()}`;
    }
}

// 更新字数统计
function updateWordCount() {
    const text = markdownInput.value;
    // 移除Markdown标记，只计算实际单词
    const plainText = text
        .replace(/[#*_`~\[\](){}]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    
    // 中文按字符计算，英文按空格分隔计算
    const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = plainText.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const totalWords = chineseChars + englishWords;
    
    wordCountElement.textContent = `字数: ${totalWords}`;
}

// 从localStorage加载保存的内容
function loadFromLocalStorage() {
    const savedContent = localStorage.getItem('markdown-editor-content');
    if (savedContent) {
        markdownInput.value = savedContent;
    }
}

// 添加事件监听器
markdownInput.addEventListener('input', function() {
    renderMarkdown();
    saveToLocalStorage();
    updateWordCount();
});

// 添加滚动同步功能
let isScrollingSync = true;

// 编辑器滚动同步到预览
markdownInput.addEventListener('scroll', function() {
    if (!isScrollingSync) return;
    
    isScrollingSync = false;
    
    const scrollPercentage = this.scrollTop / (this.scrollHeight - this.clientHeight);
    const previewHeight = markdownPreview.scrollHeight - markdownPreview.clientHeight;
    
    markdownPreview.scrollTop = scrollPercentage * previewHeight;
    
    // 避免滚动事件循环
    setTimeout(() => {
        isScrollingSync = true;
    }, 100);
});

// 预览滚动同步到编辑器
markdownPreview.addEventListener('scroll', function() {
    if (!isScrollingSync) return;
    
    isScrollingSync = false;
    
    const scrollPercentage = this.scrollTop / (this.scrollHeight - this.clientHeight);
    const editorHeight = markdownInput.scrollHeight - markdownInput.clientHeight;
    
    markdownInput.scrollTop = scrollPercentage * editorHeight;
    
    // 避免滚动事件循环
    setTimeout(() => {
        isScrollingSync = true;
    }, 100);
});





// 复制预览区域的富文本内容（针对微信公众号优化）
function copyRichText() {
    const previewElement = document.getElementById('markdown-preview');
    
    // 创建临时容器来保存富文本内容
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = previewElement.innerHTML;
    
    // 移除所有背景色样式，避免微信公众号出现灰色背景
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
        element.style.backgroundColor = '';
        element.style.background = '';
    });
    
    // 表格样式优化（移除交替行背景色）
    const tables = tempDiv.querySelectorAll('table');
    tables.forEach(table => {
        table.style.display = 'table';
        table.style.width = '100%';
        table.style.overflow = 'auto';
        table.style.marginBottom = '16px';
        table.style.borderSpacing = '0';
        table.style.borderCollapse = 'collapse';
        table.style.border = '1px solid #d0d7de'; // 表格边框
    });
    
    const tableCells = tempDiv.querySelectorAll('th, td');
    tableCells.forEach(cell => {
        cell.style.padding = '6px 13px';
        cell.style.border = '1px solid #d0d7de';
    });
    
    // 表头样式
    const tableHeaders = tempDiv.querySelectorAll('th');
    tableHeaders.forEach(th => {
        th.style.fontWeight = '600';
        th.style.backgroundColor = '#f6f8fa'; // 仅表头保留浅色背景
    });
    
    // 移除表格交替行背景色
    const tableRows = tempDiv.querySelectorAll('tr:nth-child(2n)');
    tableRows.forEach(row => {
        row.style.backgroundColor = ''; // 移除背景色
    });
    
    // 引用样式优化
    const blockquotes = tempDiv.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
        blockquote.style.margin = '16px 0';
        blockquote.style.padding = '10px 16px';
        blockquote.style.color = '#3f3f3f';
        blockquote.style.borderLeft = `4px solid ${THEME_COLOR}`;
        blockquote.style.backgroundColor = '#f5f9f5';
    });
    
    // 列表样式
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
        list.style.paddingLeft = '2em';
        list.style.marginBottom = '16px';
        list.style.listStyle = 'none'; // 移除默认列表样式
    });
    
    // 任务列表特殊处理 - 确保勾选框和文本同行显示
    const taskListItems = tempDiv.querySelectorAll('li');
    taskListItems.forEach(li => {
        // 检查是否是任务列表项（包含checkbox）
        if (li.textContent.includes('[ ]') || li.textContent.includes('[x]')) {
            li.style.listStyle = 'none';
            li.style.paddingLeft = '0';
            li.style.marginBottom = '8px';
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.lineHeight = '1.6';
            
            // 处理checkbox标记
            let text = li.innerHTML;
            if (text.includes('[ ]')) {
                li.innerHTML = text.replace('[ ]', '<span style="margin-right: 8px; font-size: 16px; color: #d0d7de;">☐</span>');
            } else if (text.includes('[x]')) {
                li.innerHTML = text.replace('[x]', `<span style="margin-right: 8px; font-size: 16px; color: ${THEME_COLOR};">☑</span>`);
            }
        }
    });
    
    // 链接样式（微信公众号兼容）
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = THEME_COLOR;
        link.style.textDecoration = 'none';
    });
    
    // 标题样式优化
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        heading.style.marginTop = '24px';
        heading.style.marginBottom = '16px';
        heading.style.fontWeight = '600';
        heading.style.lineHeight = '1.25';
        heading.style.color = '#24292f'; // 统一标题颜色
    });
    
    // 一级标题特殊样式（带序号）
    const h1Elements = tempDiv.querySelectorAll('h1');
    h1Elements.forEach((h1, index) => {
        h1.style.fontSize = '24px';
        h1.style.paddingBottom = '0.3em';
        h1.style.borderBottom = '1px solid #d0d7de';
        h1.style.position = 'relative';
        
        // 添加序号前缀
        const counter = (index + 1).toString().padStart(2, '0');
        const counterSpan = document.createElement('span');
        counterSpan.textContent = counter;
        counterSpan.style.color = THEME_COLOR;
        counterSpan.style.fontWeight = '700';
        counterSpan.style.marginRight = '12px';
        counterSpan.style.fontSize = '24px';
        
        h1.insertBefore(counterSpan, h1.firstChild);
    });
    
    const h2Elements = tempDiv.querySelectorAll('h2');
    h2Elements.forEach(h2 => {
        h2.style.fontSize = '1.5em';
        h2.style.paddingBottom = '0.3em';
        h2.style.borderBottom = '1px solid #d0d7de';
    });
    
    // 段落样式
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.style.lineHeight = '1.6';
    });
    
    // 加粗文本样式
    const strongElements = tempDiv.querySelectorAll('strong, b');
    strongElements.forEach(strong => {
        strong.style.color = THEME_COLOR;
        strong.style.fontWeight = '600';
    });
    
    // 斜体文本样式
    const emElements = tempDiv.querySelectorAll('em, i');
    emElements.forEach(em => {
        em.style.color = THEME_COLOR;
        em.style.fontStyle = 'italic';
    });
    
    // 图片样式
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.boxSizing = 'content-box';
        img.style.height = 'auto';
    });
    
    // 代码块样式
    const codeElements = tempDiv.querySelectorAll('code');
    codeElements.forEach(code => {
        code.style.padding = '0.2em 0.4em';
        code.style.margin = '0';
        code.style.fontSize = '85%';
        code.style.backgroundColor = '#f6f8fa';
        code.style.color = '#24292e';
        code.style.borderRadius = '3px';
        code.style.fontFamily = 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace';
    });
    
    const preElements = tempDiv.querySelectorAll('pre');
    preElements.forEach(pre => {
        pre.style.padding = '16px';
        pre.style.overflow = 'auto';
        pre.style.fontSize = '14px';
        pre.style.lineHeight = '1.5';
        pre.style.backgroundColor = '#f6f8fa';
        pre.style.border = '1px solid #e1e4e8';
        pre.style.borderRadius = '6px';
        pre.style.marginBottom = '16px';
    });
    
    // 基础样式优化
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.color = '#3f3f3f';
    tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
    tempDiv.style.fontSize = '16px';

    // 选择临时div的内容
    document.body.appendChild(tempDiv);
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        // 执行复制命令
        const successful = document.execCommand('copy');
        
        if (successful) {
            // 显示成功提示
            const copyBtn = document.getElementById('copy-preview');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制!';
            copyBtn.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        } else {
            throw new Error('复制失败');
        }
    } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动选择并复制内容');
    } finally {
        // 清理
        document.body.removeChild(tempDiv);
        selection.removeAllRanges();
    }
}
    
    // 页面加载时渲染初始内容// 页面加载时执行初始化操作
window.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderMarkdown();
    updateWordCount();
    
    // 为窗口大小变化添加事件监听，以适应响应式布局
    window.addEventListener('resize', renderMarkdown);
});

// 添加清空按钮事件监听
clearBtn.addEventListener('click', clearContent);

// 添加复制按钮事件监听
const copyBtn = document.getElementById('copy-preview');
copyBtn.addEventListener('click', copyRichText);

// 监听输入更新字数统计
markdownInput.addEventListener('input', updateWordCount);

// 为编辑器添加快捷键支持
markdownInput.addEventListener('keydown', function(e) {
    // Ctrl+B (Windows/Linux) 或 Cmd+B (Mac) 加粗选中文本
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const selectedText = this.value.substring(start, end);
        const replacement = `**${selectedText}**`;
        
        this.value = this.value.substring(0, start) + replacement + this.value.substring(end);
        this.selectionStart = start + 2;
        this.selectionEnd = start + 2 + selectedText.length;
        
        renderMarkdown();
        saveToLocalStorage();
    }
    
    // Ctrl+I (Windows/Linux) 或 Cmd+I (Mac) 斜体选中文本
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const selectedText = this.value.substring(start, end);
        const replacement = `*${selectedText}*`;
        
        this.value = this.value.substring(0, start) + replacement + this.value.substring(end);
        this.selectionStart = start + 1;
        this.selectionEnd = start + 1 + selectedText.length;
        
        renderMarkdown();
        saveToLocalStorage();
    }
});

// 防止用户意外关闭页面时丢失未保存的内容
window.addEventListener('beforeunload', function(e) {
    // 如果内容有变化，可以提示用户
    if (markdownInput.value.trim() !== '') {
        // 尝试静默保存最终版本
        saveToLocalStorage();
        
        // 不显示提示，因为我们已经自动保存了
        // 这样用户体验更好
    }
});