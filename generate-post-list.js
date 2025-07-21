// generate-post-list.js
const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'posts');
const outputFilePath = path.join(__dirname, 'posts.json');

const files = fs.readdirSync(postsDir);

const mdFiles = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
        // 从文件名中提取标题 (例如 '2025-07-21-my-first-post.md' -> 'my first post')
        const title = file
            .replace(/\.md$/, '')
            .replace(/^\d{4}-\d{2}-\d{2}-/, '') // 移除日期前缀
            .replace(/-/g, ' '); // 替换连字符为空格
        return {
            title: title.charAt(0).toUpperCase() + title.slice(1), // 首字母大写
            filename: file
        };
    })
    .reverse(); // 让最新的文章排在最前面

fs.writeFileSync(outputFilePath, JSON.stringify(mdFiles, null, 2));

console.log(`✅ Success! posts.json has been generated with ${mdFiles.length} posts.`);
