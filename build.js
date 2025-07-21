// build.js
const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, 'articles');
const outputFilePath = path.join(__dirname, 'articles.json');

try {
    // 1. 读取 'articles' 文件夹下的所有文件名
    const files = fs.readdirSync(articlesDir);

    // 2. 筛选出所有的 .md 文件
    const mdFiles = files.filter(file => file.endsWith('.md'));

    // 3. 将文件名列表转换为 JSON 格式
    const jsonContent = JSON.stringify(mdFiles, null, 2);

    // 4. 将 JSON 内容写入到 'articles.json' 文件中
    fs.writeFileSync(outputFilePath, jsonContent);

    console.log(`✅成功生成文章列表: ${outputFilePath}`);
    console.log(`   共找到 ${mdFiles.length} 篇文章。`);

} catch (error) {
    console.error('❌生成文章列表时出错:');
    console.error(error);
    process.exit(1); // 如果出错，则中断构建
}
