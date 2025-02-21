const express = require('express');
const fileUpload = require('express-fileupload');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = 3000;

// 中间件配置
app.use(fileUpload());
app.use(express.static('public'));

// 转换路由
app.post('/convert', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ success: false, error: '未上传文件' });
    }

    const file = req.files.file;
    const format = req.body.format;
    // 将路径从 uploads/ 改为绝对路径
const inputPath = `${process.env.HOME}/storage/shared/file-converter/uploads/${file.name}`;
const outputPath = `${process.env.HOME}/storage/shared/file-converter/converted/converted.${format}`;

    // 保存上传文件
    await file.mv(inputPath);

    // 调用 FFmpeg 转换
    try {
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        res.json({
            success: true,
            downloadUrl: `/download?path=${outputPath}`
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// 文件下载路由
app.get('/download', (req, res) => {
    const filePath = req.query.path;
    res.download(filePath);
});

// 启动服务
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
