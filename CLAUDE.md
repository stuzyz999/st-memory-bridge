# Sillytavern-Memory 项目补充约束

## 项目方法论

- 本项目以 MCP 平台为核心开发点，定位是记忆交互平台/接口，通过mcp服务交互外部记忆库
- sillytavern LLM API配置（模型拉去、多配置持久化）、正文正则清洗、上下文读取（历史正文、世界书、user设定）、内容选择、半自动摄入（楼层设置）、多tab交互、提示词系统等可复用参考项目的方案，一律移植复制，做接口适配，能少编码就尽量少编码，最快落地。
- mcp召回优先分析nocturne_memory数据特点，保留细节、入库效率和召回准确率。
- 参考目标项目做分段提示词，提示词角色定义直接照搬，数据处理核心做独立特化
- 移植为主，UI适配为辅
- 绝不开发独立算法
- 沟通汇报请使用简体中文。
  
## 参考项目

### sillytavern 扩展

- references\Engram
- references\ST-Bionic-Memory-Ecology

### 酒馆助手脚本

- references\参考脚本\index.js，依赖酒馆助手:<https://github.com/N0VI028/JS-Slash-Runner>
-

## 外部依赖

### 记忆库

- memory-db\nocturne_memory

### sillytavern mcp 通信后端

## sillytavern 插件调试验证工具

- mcpRouter/chrome devtools mcp,调试地址：<http://127.0.0.1:8008/>
- 项目开发路径位于sillytavern之外。务必等待同步到sillytavern 后再进行调试

## 项目结构（有变动时请主动迭代）

memory-bridge/
├── src/                # 源码
├── docs/               # 文档
├── references/         # 参考项目
├── .gitignore          # git忽略文件
├── CLAUDE.md           # 项目说明
