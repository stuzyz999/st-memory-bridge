# memory-bridge 落地计划 (Nocturne Memory & Engram Deep Adaptation)

> 基于 references/Engram 调研 + 现有代码分析，实现“摘要+原文”双层存储与原子化元数据适配。
> 更新：2026-04-01

---

## 核心目标
实现 Engram 记忆管理系统向 `nocturne_memory` 的深度适配。保证记忆完整度（摘要+原文），提升召回精确度（原子化元数据），并优化后端写入性能。支持用户审查重写、一聊一档、及原子化关系追踪。

## 实施阶段

### Phase 1: 提示词与数据映射 (Frontend/Plugin)
- [x] **提示词移植**：更新 `src/index.js` 中的 `import` 模板为 Engram 风格（含 CoT 思维链、反八股准则）。
- [x] **关键词增强**：优化 `rewriteRecallQuery` 解析逻辑，支持清洗后的关键词提取。
- [x] **双层存储落地**：修改 `runSelectedImport`，入库 `content` 变更为 `[摘要]\n---\n[清洗后原文]`。
- [x] **原子化元数据适配**：在 `runSelectedImport` 中解析 LLM 输出的 `meta` 标签，并填充至 `nocturne_memory` 的 `disclosure` 字段。
- [x] **闪回式 Disclosure**：重构 `disclosure` 提示词，从陈述性摘要转向引导性“闪回入口”。
- [x] **审查/重写工作流**：实现 `showMemoryReviewDialog`，支持用户手动编辑及输入反馈让 LLM 重写摘要。
- [x] **实体关系提取**：引入 `entities` 任务模板，采用 JSON Patch (RFC 6902) 风格增量更新人物/地点/关系状态。
- **Status:** complete

### Phase 2: 后端与架构优化 (Backend/Gateway & DB)
- [x] **写入请求队列**：在 `backend/st-memory-gateway/src/McpClient.ts` 中实现 `writeQueue`。
- [x] **URI 命名空间隔离**：实现基于 `{character_name}/{chat_id}` 的 URI 路径自动跟随，达成逻辑上的“一聊一档”。
- [x] **Glossary 自动化**：实现自动从摘要及 Patch 数据中提取 `keywords` 并通过 `manage_triggers` 绑定到节点（对应 Nocturne Glossary）。
- **Status:** complete

### Phase 3: 验证与验收
- [ ] **质量验证**：检查 `nocturne_memory` 数据库中 `content` 是否包含原文，`disclosure` 是否包含逻辑标签。
- [ ] **重写功能验证**：测试在审查弹窗中输入“反馈”后，摘要是否按要求更新。
- [ ] **隔离验证**：切换不同角色卡，确认记忆写入路径是否自动切换。
- [ ] **关系态验证**：检查 `manage_triggers` 是否正确绑定了从 `entities` 提取的原子关键词。
- **Status:** pending

## 关键决策记录
| 决策 | 理由 |
|----------|-----------|
| 摘要+原文合并存储 | 摘要用于 LLM 快速理解，原文用于保留语气细节和真相，确保记忆完整度。 |
| 闪回入口 (Disclosure) | 专门设计引导性提示词，模拟人脑闪回机制，提升 FTS 检索效率。 |
| 写入请求队列 | 解决 SQLite 在高频写入时的并发锁定问题。 |
| 逻辑隔离 (URI Namespace) | 在后端暂不支持多库动态切换时，通过 URI 前缀实现一聊一档。 |
| 原子化关系提取 | 引入 {{user}} 中心意识，通过独立任务提取实体状态变化，弥补线性摘要在关系追踪上的不足。 |

## 历史错误记录
| Error | Attempt | Resolution |
|----------|---------|------------|
| String not found in Edit | 1 | 重新 Read 文件确定精确的缩进和内容后重试 |
| LLM Token Limit | 1 | 调大 `import` 任务的 `maxTokens` 至 1000 |
