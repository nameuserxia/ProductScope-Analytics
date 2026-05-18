# YAML 数据结构说明

`sample_game.yaml` 是自动生成报告的结构化输入。建议复制后改成自己的游戏分析数据。

当前示例优先使用中文字段名，例如 `产品基础信息`、`功能模块拆解`、`数据指标体系`。生成器也兼容旧版英文字段名，例如 `product`、`modules`、`metrics`，所以你可以选择自己更习惯的写法。

## 顶层字段

| 字段 | 中文说明 |
| --- | --- |
| `product` | 产品基础信息 |
| `positioning` | 产品定位分析 |
| `core_gameplay` | 核心玩法拆解 |
| `modules` | 功能模块列表 |
| `user_journeys` | 用户体验路径 |
| `metrics` | 数据指标体系 |
| `couplings` | 模块耦合关系 |
| `optimizations` | 优化建议 |
| `interview_summary` | 面试表达版总结 |
| `custom_sections` / `自定义扩展章节` | 自定义扩展分析内容 |

## product

| 字段 | 中文说明 |
| --- | --- |
| `name` | 产品名称 |
| `genre` | 游戏类型 |
| `target_users` | 目标用户 |
| `core_gameplay` | 核心玩法一句话描述 |
| `monetization` | 商业化模式 |
| `version` | 体验版本 |
| `experience_time` | 体验时间 |
| `analysis_goal` | 分析目标 |

## positioning

| 字段 | 中文说明 |
| --- | --- |
| `user_needs` | 用户需求列表 |
| `scenarios` | 使用场景列表 |
| `selling_points` | 产品卖点列表 |
| `differentiation` | 差异化竞争点列表 |
| `target_personas` | 目标用户画像列表 |
| `why_play` | 用户为什么要玩 |

## core_gameplay

| 字段 | 中文说明 |
| --- | --- |
| `core_loop` | 核心循环步骤 |
| `full_path` | 从进入游戏到获得反馈的完整路径 |
| `fun_points` | 核心爽点 |
| `growth_path` | 成长路径 |
| `goal_feedback_achievement` | 目标感、反馈感、成就感设计 |

## modules

每个模块建议包含：

| 字段 | 中文说明 |
| --- | --- |
| `name` | 模块名称 |
| `entry` | 模块入口 |
| `description` | 模块功能描述 |
| `user_value` | 用户侧作用 |
| `product_value` | 产品侧作用 |
| `monetization_value` | 商业化作用 |
| `retention_value` | 留存作用 |
| `activity_value` | 活跃作用 |
| `social_value` | 社交传播作用 |
| `design_motivation` | 设计动机推测 |
| `advantages` | 设计优点 |
| `risks` | 潜在问题 |
| `optimization_directions` | 可优化方向 |
| `related_modules` | 关联模块 |
| `key_metrics` | 关键指标 |
| `abnormal_reasons` | 指标异常时的可能原因 |
| `analysis_methods` | 可验证的数据分析方法 |

## metrics

建议按以下分类填写：

- `acquisition`：新增指标
- `activity`：活跃指标
- `retention`：留存指标
- `payment`：付费指标
- `conversion`：转化指标
- `level_task`：关卡 / 对局 / 任务指标
- `economy`：经济系统指标
- `ads`：广告变现指标
- `social`：社交指标
- `segmentation`：用户分层指标
- `monitoring`：异常监控指标

每个指标建议包含：

| 字段 | 中文说明 |
| --- | --- |
| `name` | 指标名称 |
| `definition` | 指标定义 |
| `formula` | 计算口径 |
| `modules` | 适用模块 |
| `meaning` | 业务意义 |
| `up_means` | 指标升高说明什么 |
| `down_means` | 指标下降说明什么 |
| `optimization` | 可以如何优化 |

## optimizations

每条优化建议建议包含：

| 字段 | 中文说明 |
| --- | --- |
| `title` | 优化建议标题 |
| `current_problem` | 当前问题 |
| `evidence` | 问题证据 |
| `affected_users` | 影响用户 |
| `affected_metrics` | 影响指标 |
| `solution` | 优化方案 |
| `expected_benefit` | 预期收益 |
| `risks` | 潜在风险 |
| `ab_test` | A/B Test 验证方案 |
| `success_criteria` | 成功判断标准 |

## 填写建议

- 先写事实，再写判断，再写指标假设。
- 如果没有真实数据，可以明确写“假设数据”或“待验证指标”。
- 每个模块至少关联 2 到 3 个核心指标。
- 优化建议必须包含实验设计和护栏指标。
- 面试版总结建议控制在 2 到 3 分钟可讲完。

## 自定义扩展章节

当主模板不够用时，可以在 YAML 顶层加入 `自定义扩展章节`。它不会影响原有报告结构，会追加在报告末尾。

```yaml
自定义扩展章节:
  - 标题: "竞品对比补充"
    内容: "这里写和竞品 A、竞品 B 的关键差异。"
    分析要点:
      - "对比新手引导时长。"
      - "对比广告触发场景。"
      - "对比首付礼包价值。"
```

适合放入自定义扩展章节的内容：

- 竞品对比
- 埋点事件设计
- SQL 分析样例
- 用户访谈或问卷摘要
- 截图观察
- 版本迭代复盘
- 数据可视化结论
