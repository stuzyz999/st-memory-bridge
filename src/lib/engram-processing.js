/**
 * Engram Processing Utilities (Ported from Engram project)
 * 提供正则处理、文本清洗、标签捕获和长文本切分功能。
 */

// ─── 正则处理 (RegexProcessor.ts) ───────────────────────────────────────────

/**
 * 捕获标签内容
 * @param {string} text 源文本
 * @param {string} tagName 标签名 (如 'thought', 'output')
 * @returns {string|null} 标签内容，未找到返回 null
 */
function captureTag(text, tagName) {
    if (!text) return null;
    try {
        // 支持属性和空格: <tag attr="..."> content </tag>
        const regex = new RegExp(`<${tagName}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${tagName}\\s*>`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : null;
    } catch (e) {
        console.warn('Failed to capture tag:', tagName, e);
        return null;
    }
}

/**
 * 移除指定标签及其内容
 * @param {string} text 源文本
 * @param {string} tagName 标签名
 * @returns {string} 处理后的文本
 */
function removeTag(text, tagName) {
    if (!text) return '';
    try {
        const regex = new RegExp(`<${tagName}(?:\\s+[^>]*)?>[\\s\\S]*?<\\/${tagName}\\s*>`, 'gi');
        return text.replace(regex, '').trim();
    } catch (e) {
        console.warn('Failed to remove tag:', tagName, e);
        return text;
    }
}

/**
 * 捕获多个标签内容
 * @param {string} text 源文本
 * @param {string[]} tagNames 标签名数组
 * @returns {Object} 标签内容映射
 */
function captureTags(text, tagNames) {
    const result = {};
    for (const tag of tagNames) {
        result[tag] = captureTag(text, tag);
    }
    return result;
}

// ─── 文本清洗 (TextProcessor.ts) ────────────────────────────────────────────

const DEFAULT_TRIM_RULES = [
    { pattern: /\n{3,}/g, replacement: '\n\n' }, // 移除多余空行
    { pattern: /^[ \t]+|[ \t]+$/gm, replacement: '' }, // 移除行首行尾空白
    { pattern: /```\w*\n?/g, replacement: '' }, // 移除 Markdown 代码块标记（保留内容）
    { pattern: /[“”]/g, replacement: '"' }, // 统一中文双引号
    { pattern: /[‘’]/g, replacement: "'" }, // 统一中文单引号
];

/**
 * 清洗文本（移除伪影并规范化空白）
 * @param {string} text 原始文本
 * @returns {string} 清洗后的文本
 */
function cleanText(text) {
    if (!text) return '';
    let result = text;
    for (const rule of DEFAULT_TRIM_RULES) {
        result = result.replace(rule.pattern, rule.replacement);
    }
    return result.trim();
}

/**
 * 提取纯文本（移除所有 Markdown 格式标记和代码块）
 * @param {string} text 原始文本
 * @returns {string} 纯文本
 */
function extractPlainText(text) {
    if (!text) return '';
    return text
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，仅保留文本
        .replace(/[*_~`#]/g, '') // 移除 Markdown 标记
        .replace(/\n{2,}/g, '\n') // 压缩换行
        .trim();
}

/**
 * 截断文本到指定长度
 * @param {string} text 文本
 * @param {number} maxLength 最大长度
 * @param {string} suffix 截断后缀 (默认 '...')
 * @returns {string} 截断后的文本
 */
function truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

// ─── 文本分块 (BatchUtils.ts) ──────────────────────────────────────────────

/**
 * 将长文本切分为带重叠区的小块 (Sliding Window)
 * @param {string} text 源文本
 * @param {number} chunkSize 每个块的最大字符数
 * @param {number} overlapSize 重叠部分的字符数
 * @returns {string[]} 分块后的文本数组
 */
function chunkText(text, chunkSize, overlapSize) {
    if (!text) return [];

    // 防御性校验：overlapSize >= chunkSize 会导致 start 指针无法前进（死循环）
    let actualOverlap = overlapSize;
    if (actualOverlap >= chunkSize) {
        actualOverlap = Math.max(0, chunkSize - 1);
    }

    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));

        start = end - actualOverlap;

        // 如果 start 指针不再前进，或者已经到达文本末尾，则退出
        if (start >= text.length - actualOverlap) break;
    }
    return chunks;
}
