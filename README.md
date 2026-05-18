# 游戏产品拆解与数据分析报告框架

这是一个面向数据分析、游戏数据运营、产品分析岗位作品集的可复用框架。它不是单纯记录“我玩了什么、感觉如何”的体验报告，而是帮助你用统一结构回答：

- 这个游戏为什么存在，服务谁，解决什么需求？
- 核心玩法、功能模块、用户路径和商业化设计如何协同？
- 每个模块影响哪些留存、活跃、付费、广告、转化和社交指标？
- 如果指标异常，可能是什么问题，如何用数据验证？
- 如果要优化，应该怎么设计实验和判断收益？

## 适用场景

- 求职作品集：游戏数据分析、游戏运营、产品分析、用户研究。
- 个人训练：每体验一款游戏，都按同一口径做结构化拆解。
- 面试表达：将体验、产品理解和数据分析思维整理成可复述案例。
- 扩展分析：后续可迁移到电商、出行、社区、工具类产品。

## 项目结构

```text
game-product-analysis-framework/
├─ README.md
├─ templates/
│  ├─ product_analysis_template.md
│  ├─ ux_journey_template.md
│  ├─ module_analysis_template.md
│  ├─ metrics_system_template.md
│  ├─ module_coupling_template.md
│  ├─ optimization_proposal_template.md
│  └─ interview_summary_template.md
├─ data/
│  ├─ sample_game.yaml
│  └─ schema_notes.md
├─ scripts/
│  └─ generate_report.py
├─ reports/
│  └─ sample_report.md
└─ docs/
   └─ extend_to_other_products.md
```

## 快速开始

1. 安装依赖：

```bash
pip install pyyaml
```

2. 生成示例报告：

```bash
python scripts/generate_report.py data/sample_game.yaml reports/sample_report.md
```

3. 查看生成结果：

```bash
open reports/sample_report.md
```

Windows PowerShell 可以使用：

```powershell
notepad reports/sample_report.md
```

## 如何分析一款新游戏

1. 复制 `data/sample_game.yaml`，命名为新的游戏文件，例如 `data/my_game.yaml`。
2. 替换产品基础信息、定位、核心玩法、模块、指标、耦合关系和优化建议。
3. 运行生成脚本：

```bash
python scripts/generate_report.py data/my_game.yaml reports/my_game_report.md
```

4. 在报告中补充真实截图、体验记录、竞品对比、数据假设或公开数据。

## 推荐分析方法

一份优秀的游戏产品分析报告，建议按照“体验事实 -> 产品判断 -> 指标假设 -> 数据验证 -> 优化实验”的顺序展开：

- 体验事实：用户在什么场景下做了什么？
- 产品判断：该设计服务了哪类用户需求？
- 指标假设：它主要影响留存、活跃、付费、广告、社交还是转化？
- 数据验证：需要哪些事件埋点、分群、漏斗、留存或 A/B Test？
- 优化实验：改什么、影响谁、收益是什么、风险是什么？

## 作品集展示建议

建议最终放入作品集的内容包括：

- 1 页项目背景：说明为什么选择该游戏，以及目标岗位相关性。
- 1 张核心循环图：展示玩法、成长、任务、奖励、商业化之间的闭环。
- 1 张指标体系表：体现你能从业务问题落到数据口径。
- 2 到 3 个模块深拆：选择新手引导、任务系统、付费/广告系统等高价值模块。
- 1 到 2 个优化建议：必须包含证据、指标影响、实验方案和成功标准。
- 1 段面试表达：用业务语言说明你的分析方法和可迁移能力。

## 示例说明

`data/sample_game.yaml` 使用虚构休闲游戏《星糖消消乐》作为案例。示例不会引用真实游戏内部数据，重点展示分析框架和数据思维。

## 常见扩展

- 加入真实埋点事件表。
- 加入 SQL 分析样例。
- 加入 Python 可视化脚本。
- 加入竞品对比模板。
- 加入 Notion / 飞书文档导出。
- 加入 Streamlit 看板，将 Markdown 报告扩展为交互式分析项目。
