# unzip-zhcn

解压缩中文文件，解决乱码问题


## 安装配置

安装：`npm install unzip-zhcn --save-dev`。


## 使用

var unzip = require('unzip-zhcn');

unzip.extractSync(zipFilePath, targetPath, 'cp936');