# SVG 编辑器 CLI — 架构方案

> Lab1 Phase 1。本文件随提交增量更新，当前对应**提交 1：工程骨架与核心抽象**。

## 1. 模块划分

工程按"领域内核 → 命令控制 → 表现层"自下而上分层，每个模块单一职责：

| 模块（目录） | 职责 | 当前状态 |
|---|---|---|
| `src/shape/` | 图形领域模型（Composite：`Shape` 抽象、叶子图形、`Group` 容器、`ShapeFactory`） | 抽象基类已建，具体图形待提交 2 |
| `src/document/` | 文档聚合根 `SvgDocument`：画布尺寸、根 Shape、id 注册表 | 骨架已建 |
| `src/io/` | SVG 序列化/解析，IO 隔离 | 待提交 2 |
| `src/command/` | Command 模式：`Command` 接口、各命令实现 | 接口已建，命令待提交 2-4 |
| `src/history/` | undo/redo 历史栈 | 待提交 4 |
| `src/cli/` | REPL 主循环、命令分发、`HelpCommand` | REPL + help 已建 |

### 组件图

```plantuml
@startuml
skinparam componentStyle rectangle
component [cli\n(Repl / Dispatcher)] as cli
component [command] as command
component [history] as history
component [document\n(SvgDocument)] as document
component [shape\n(Shape / Group / Factory)] as shape
component [io\n(Serializer / Parser)] as io

cli --> command : 注册/分发
cli --> history : 驱动 undo/redo
cli --> document : 持有当前文档
command --> document : 读写文档
command --> shape : 构造/操作图形
document --> shape : 聚合根持有 Shape 树
io --> document : 装载/导出
io --> shape : 序列化图形
history --> command : 栈存 Command
@enduml
```

## 2. 设计模式的选择

| 模式 | 落地位置 | 作用 |
|---|---|---|
| **Command** | `src/command/`：每条命令一个类，实现 `execute/undo/redo` | 把每次编辑封装成对象，天然支持 undo/redo；REPL 只负责解析与分发，不关心命令内部 |
| **Composite** | `src/shape/`：`Shape` 统一接口，`Group` 容器与叶子图形同构 | `move/scale/set/delete` 对容器与叶子一视同仁，递归操作由容器负责 |
| **Factory** | `src/shape/ShapeFactory`：类型名 → 类 | `create` 命令按字符串类型构造图形，是作业允许的"按名字分派"两处之一 |

**Command 接口**（`src/command/Command.ts`）：

```typescript
export interface Command {
  readonly kind: string;
  readonly category: CommandCategory; // Edit | Display | Document
  execute(): CommandResult;
  undo(): CommandResult;
  redo(): CommandResult;
}
```

`category` 决定是否进入 undo 栈：`Edit` 入栈、`Display` 跳过、`Document` 执行后禁止 undo/redo（对应作业 4.3 粒度规则）。

## 3. 依赖方向规则

| 模块 | 允许依赖 | 理由 |
|---|---|---|
| `shape` | （无） | 纯领域模型，不依赖任何上层 |
| `document` | `shape` | 聚合根持有 Shape 树 |
| `io` | `document`, `shape` | 装载/导出需要读写文档与图形 |
| `command` | `document`, `shape` | 命令操作文档与图形 |
| `history` | `command` | 栈中存放 Command 对象 |
| `cli` | `command`, `history`, `document` | 表现层组装一切 |

**禁止的依赖**（违反即为待处理项）：
- `shape` → 任何上层（领域不依赖控制/表现）
- `document` → `cli` / `command`（聚合根不依赖表现与控制）
- `command` → `cli`（命令不依赖 REPL）
- 任何模块 → `history`（除 `cli`）（历史栈只被表现层驱动）

## 4. 变化点假设

| # | 可能变化 | 留了什么 / 为何不留 |
|---|---|---|
| 1 | **新增图形类型**（如 `box` 复合图形，见作业 4.4） | 留 `ShapeFactory` + 后续 `ShapeProvider` 插槽；本阶段 `create box` 报 `unknown shape type`，插件化阶段零改内核 |
| 2 | **新增命令** | 留 Command 接口 + 分发注册表，新命令只需实现接口并在 Dispatcher 注册 |
| 3 | **IO 格式变化**（如读写 PNG 预览） | 留 `src/io/` 隔离，序列化/解析不渗入领域 |
| 4 | **交互通道扩展**（agent / 鼠标） | 命令层与 REPL 分离，同一套 Command 可被非 REPL 通道复用 |
| 5 | **undo 策略**（如宏命令合并） | 不留：当前"一条编辑 = 一个单元"足够，过度设计无收益 |

---

## 过程记录

（随提交增量补充。当前为提交 1，记录骨架阶段的决策。）

- **命名 `SvgDocument` 而非 `Document`**：避免与 DOM 全局 `Document` 混淆，同时遵循"一类一文件、文件名 = 类名"约定（`SvgDocument.ts`）。
- **Command 接口引入 `category` 字段**：作业 4.3 要求文档类命令后禁止 undo/redo、显示类不入栈，用枚举显式表达三类命令的栈语义，避免在 Dispatcher 里用 `switch(kind)` 判断。
- **REPL 提交 1 仅注册 `help`**：其余命令统一回 `error: unknown command`，保证骨架可启动、可编译，为提交 2 起的命令落地留出分发入口。

## 一致性自查

（提交 5 完成。当前阶段：骨架与方案一致。）

## 质量保证手段

（提交 5 完成。当前阶段：`tsc --noEmit` 通过 + `help` 可运行。）
