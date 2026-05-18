"""
根据 YAML 结构化数据生成游戏产品拆解 Markdown 报告。

使用方式：
    python scripts/generate_report.py data/sample_game.yaml reports/sample_report.md

依赖：
    pip install pyyaml
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError as exc:
    raise SystemExit("缺少依赖 PyYAML，请先运行：pip install pyyaml") from exc


Metric = dict[str, Any]
Section = list[str]


METRIC_CATEGORY_NAMES = {
    "acquisition": "新增指标",
    "activity": "活跃指标",
    "retention": "留存指标",
    "payment": "付费指标",
    "conversion": "转化指标",
    "level_task": "关卡 / 对局 / 任务指标",
    "economy": "经济系统指标",
    "ads": "广告变现指标",
    "social": "社交指标",
    "segmentation": "用户分层指标",
    "monitoring": "异常监控指标",
}

JOURNEY_NAMES = {
    "new_user": "新用户路径",
    "active_user": "老用户日常路径",
    "paid_user": "付费用户路径",
    "churn_risk_user": "流失用户可能卡点",
    "returning_user": "回流用户路径",
}


def load_yaml(path: str | Path) -> dict[str, Any]:
    """读取 YAML 文件并返回字典。"""
    with Path(path).open("r", encoding="utf-8") as file:
        data = yaml.safe_load(file)
    if not isinstance(data, dict):
        raise ValueError("YAML 顶层结构必须是字典。")
    return data


def value(data: dict[str, Any], key: str, default: str = "待补充") -> str:
    """安全读取字典字段，并把空值转换为中文占位。"""
    item = data.get(key, default)
    if item is None or item == "":
        return default
    return str(item)


def as_list(items: Any) -> list[Any]:
    """把空值、单个值或列表统一转换为列表。"""
    if items is None:
        return []
    if isinstance(items, list):
        return items
    return [items]


def bullet_list(items: Any) -> str:
    """渲染 Markdown bullet list。"""
    rows = []
    for item in as_list(items):
        rows.append(f"- {item}")
    return "\n".join(rows) if rows else "- 待补充"


def table(headers: list[str], rows: list[list[Any]]) -> str:
    """渲染 Markdown 表格。"""
    header_row = "| " + " | ".join(headers) + " |"
    divider_row = "| " + " | ".join(["---"] * len(headers)) + " |"
    body_rows = []
    for row in rows:
        cells = [str(cell).replace("\n", "<br>") if cell is not None else "待补充" for cell in row]
        body_rows.append("| " + " | ".join(cells) + " |")
    return "\n".join([header_row, divider_row, *body_rows])


def render_basic_info(data: dict[str, Any]) -> str:
    product = data.get("product", {})
    rows = [
        ["产品名称", value(product, "name")],
        ["游戏类型", value(product, "genre")],
        ["目标用户", value(product, "target_users")],
        ["核心玩法", value(product, "core_gameplay")],
        ["商业化模式", value(product, "monetization")],
        ["体验版本", value(product, "version")],
        ["体验时间", value(product, "experience_time")],
        ["分析目标", value(product, "analysis_goal")],
    ]
    return "\n".join(["## 1. 产品基础信息", "", table(["字段", "内容"], rows)])


def render_positioning(data: dict[str, Any]) -> str:
    positioning = data.get("positioning", {})
    scenario_rows = []
    for item in as_list(positioning.get("scenarios")):
        if isinstance(item, dict):
            scenario_rows.append(
                [
                    value(item, "scene"),
                    value(item, "user_state"),
                    value(item, "product_value"),
                    value(item, "metrics"),
                ]
            )
    persona_rows = []
    for item in as_list(positioning.get("target_personas")):
        if isinstance(item, dict):
            persona_rows.append(
                [
                    value(item, "name"),
                    value(item, "characteristics"),
                    value(item, "needs"),
                    value(item, "key_metrics"),
                ]
            )

    return "\n".join(
        [
            "## 2. 产品定位分析",
            "",
            "### 用户需求",
            "",
            bullet_list(positioning.get("user_needs")),
            "",
            "### 使用场景",
            "",
            table(["场景", "用户状态", "产品价值", "可能关注指标"], scenario_rows or [["待补充", "待补充", "待补充", "待补充"]]),
            "",
            "### 产品卖点",
            "",
            bullet_list(positioning.get("selling_points")),
            "",
            "### 差异化竞争点",
            "",
            bullet_list(positioning.get("differentiation")),
            "",
            "### 目标用户画像",
            "",
            table(["用户分层", "用户特征", "主要需求", "关键指标"], persona_rows or [["待补充", "待补充", "待补充", "待补充"]]),
            "",
            "### 用户为什么要玩这款游戏",
            "",
            value(positioning, "why_play"),
        ]
    )


def render_core_loop(data: dict[str, Any]) -> str:
    core = data.get("core_gameplay", {})
    path_rows = []
    for item in as_list(core.get("full_path")):
        if isinstance(item, dict):
            path_rows.append(
                [
                    value(item, "step"),
                    value(item, "user_action"),
                    value(item, "system_feedback"),
                    value(item, "psychology"),
                    value(item, "churn_risk"),
                    value(item, "metrics"),
                ]
            )
    achievement = core.get("goal_feedback_achievement", {})
    achievement_rows = []
    if isinstance(achievement, dict):
        achievement_rows = [
            ["目标感", value(achievement, "goal")],
            ["反馈感", value(achievement, "feedback")],
            ["成就感", value(achievement, "achievement")],
        ]

    return "\n".join(
        [
            "## 3. 核心玩法拆解",
            "",
            "### 核心循环",
            "",
            bullet_list(core.get("core_loop")),
            "",
            "### 用户从进入游戏到获得反馈的完整路径",
            "",
            table(
                ["步骤", "用户行为", "系统反馈", "用户心理", "可能流失点", "关键指标"],
                path_rows or [["待补充", "待补充", "待补充", "待补充", "待补充", "待补充"]],
            ),
            "",
            "### 核心爽点",
            "",
            bullet_list(core.get("fun_points")),
            "",
            "### 用户成长路径",
            "",
            bullet_list(core.get("growth_path")),
            "",
            "### 游戏如何制造目标感、反馈感、成就感",
            "",
            table(["维度", "设计说明"], achievement_rows or [["待补充", "待补充"]]),
        ]
    )


def render_metric_table(metrics: list[Metric]) -> str:
    rows = []
    for metric in metrics:
        rows.append(
            [
                value(metric, "name"),
                value(metric, "definition"),
                value(metric, "formula"),
                value(metric, "modules"),
                value(metric, "meaning"),
                value(metric, "up_means"),
                value(metric, "down_means"),
                value(metric, "optimization"),
            ]
        )
    return table(
        ["指标", "指标定义", "计算口径", "适用模块", "业务意义", "升高说明", "下降说明", "优化方向"],
        rows or [["待补充"] * 8],
    )


def render_modules(data: dict[str, Any]) -> str:
    sections: Section = ["## 4. 功能模块拆解"]
    modules = as_list(data.get("modules"))
    if not modules:
        return "\n".join([*sections, "", "待补充"])

    for index, module in enumerate(modules, start=1):
        if not isinstance(module, dict):
            continue
        key_metric_rows = []
        for metric in as_list(module.get("key_metrics")):
            if isinstance(metric, dict):
                key_metric_rows.append(
                    [
                        value(metric, "name"),
                        value(metric, "definition"),
                        value(metric, "formula"),
                        value(metric, "meaning"),
                    ]
                )

        sections.extend(
            [
                "",
                f"### 4.{index} {value(module, 'name')}",
                "",
                table(
                    ["分析项", "内容"],
                    [
                        ["模块入口", value(module, "entry")],
                        ["模块功能描述", value(module, "description")],
                        ["用户侧作用", value(module, "user_value")],
                        ["产品侧作用", value(module, "product_value")],
                        ["商业化作用", value(module, "monetization_value")],
                        ["留存作用", value(module, "retention_value")],
                        ["活跃作用", value(module, "activity_value")],
                        ["社交传播作用", value(module, "social_value")],
                        ["设计动机推测", value(module, "design_motivation")],
                    ],
                ),
                "",
                "#### 设计优点",
                "",
                bullet_list(module.get("advantages")),
                "",
                "#### 潜在问题",
                "",
                bullet_list(module.get("risks")),
                "",
                "#### 可优化方向",
                "",
                bullet_list(module.get("optimization_directions")),
                "",
                "#### 关联模块",
                "",
                bullet_list(module.get("related_modules")),
                "",
                "#### 关键指标",
                "",
                table(["指标", "定义", "计算口径", "业务意义"], key_metric_rows or [["待补充", "待补充", "待补充", "待补充"]]),
                "",
                "#### 指标异常时的可能原因",
                "",
                bullet_list(module.get("abnormal_reasons")),
                "",
                "#### 可验证的数据分析方法",
                "",
                bullet_list(module.get("analysis_methods")),
            ]
        )
    return "\n".join(sections)


def render_user_journeys(data: dict[str, Any]) -> str:
    journeys = data.get("user_journeys", {})
    sections: Section = ["## 5. 用户体验路径分析"]
    if not isinstance(journeys, dict) or not journeys:
        return "\n".join([*sections, "", "待补充"])

    for key, title in JOURNEY_NAMES.items():
        rows = []
        for item in as_list(journeys.get(key)):
            if isinstance(item, dict):
                rows.append(
                    [
                        value(item, "step"),
                        value(item, "behavior"),
                        value(item, "psychology"),
                        value(item, "churn_reason"),
                        value(item, "metrics"),
                        value(item, "optimization"),
                    ]
                )
        sections.extend(
            [
                "",
                f"### {title}",
                "",
                table(["步骤", "用户行为", "用户心理", "可能流失原因", "关注指标", "优化策略"], rows or [["待补充"] * 6]),
            ]
        )
    return "\n".join(sections)


def render_metrics(data: dict[str, Any]) -> str:
    metrics = data.get("metrics", {})
    sections: Section = [
        "## 6. 数据指标体系",
        "",
        "指标体系按游戏数据分析场景拆分，重点关注新增、活跃、留存、付费、转化、玩法、经济、广告、社交、用户分层和异常监控。",
    ]
    if not isinstance(metrics, dict):
        return "\n".join([*sections, "", "待补充"])

    for key, title in METRIC_CATEGORY_NAMES.items():
        sections.extend(["", f"### {title}", "", render_metric_table(as_list(metrics.get(key)))])
    return "\n".join(sections)


def render_couplings(data: dict[str, Any]) -> str:
    rows = []
    for item in as_list(data.get("couplings")):
        if isinstance(item, dict):
            rows.append(
                [
                    value(item, "source"),
                    value(item, "target"),
                    value(item, "relation_type"),
                    value(item, "logic"),
                    value(item, "metrics"),
                    value(item, "risk"),
                    value(item, "validation"),
                ]
            )
    return "\n".join(
        [
            "## 7. 模块耦合关系分析",
            "",
            "模块耦合关系用于判断一个模块的改动如何影响另一个模块的行为和结果指标，避免只看孤立功能。",
            "",
            table(
                ["来源模块", "影响模块", "关系类型", "影响逻辑", "关键指标", "潜在风险", "验证方法"],
                rows or [["待补充"] * 7],
            ),
        ]
    )


def render_optimizations(data: dict[str, Any]) -> str:
    sections: Section = ["## 8. 优化建议框架"]
    optimizations = as_list(data.get("optimizations"))
    if not optimizations:
        return "\n".join([*sections, "", "待补充"])

    for index, item in enumerate(optimizations, start=1):
        if not isinstance(item, dict):
            continue
        ab_test = item.get("ab_test", {})
        ab_rows = []
        if isinstance(ab_test, dict):
            ab_rows = [
                ["实验对象", value(ab_test, "target")],
                ["对照组", value(ab_test, "control")],
                ["实验组", value(ab_test, "experiment")],
                ["核心指标", value(ab_test, "core_metrics")],
                ["护栏指标", value(ab_test, "guardrail_metrics")],
                ["实验周期", value(ab_test, "duration")],
            ]
        sections.extend(
            [
                "",
                f"### 8.{index} {value(item, 'title')}",
                "",
                table(
                    ["分析项", "内容"],
                    [
                        ["当前问题", value(item, "current_problem")],
                        ["影响用户", "、".join(str(user) for user in as_list(item.get("affected_users"))) or "待补充"],
                        ["影响指标", "、".join(str(metric) for metric in as_list(item.get("affected_metrics"))) or "待补充"],
                        ["优化方案", value(item, "solution")],
                        ["预期收益", value(item, "expected_benefit")],
                        ["成功判断标准", value(item, "success_criteria")],
                    ],
                ),
                "",
                "#### 问题证据",
                "",
                bullet_list(item.get("evidence")),
                "",
                "#### 潜在风险",
                "",
                bullet_list(item.get("risks")),
                "",
                "#### A/B Test 验证方案",
                "",
                table(["项目", "设计"], ab_rows or [["待补充", "待补充"]]),
            ]
        )
    return "\n".join(sections)


def render_interview_summary(data: dict[str, Any]) -> str:
    summary = data.get("interview_summary", {})
    if not isinstance(summary, dict):
        summary = {}
    return "\n".join(
        [
            "## 9. 求职作品集表达：面试版总结",
            "",
            "### 项目背景",
            "",
            value(summary, "background"),
            "",
            "### 我的分析目标",
            "",
            value(summary, "analysis_goal"),
            "",
            "### 我的拆解方法",
            "",
            value(summary, "method"),
            "",
            "### 我的核心发现",
            "",
            bullet_list(summary.get("findings")),
            "",
            "### 我的指标体系设计",
            "",
            value(summary, "metrics_design"),
            "",
            "### 我的优化建议",
            "",
            value(summary, "optimization"),
            "",
            "### 如果有数据，我会如何验证",
            "",
            value(summary, "validation"),
            "",
            "### 这个项目体现了我的哪些能力",
            "",
            bullet_list(summary.get("abilities")),
        ]
    )


def generate_report(data: dict[str, Any]) -> str:
    product = data.get("product", {})
    product_name = value(product, "name", "游戏产品")
    sections = [
        f"# {product_name}：游戏产品拆解与数据分析报告",
        "",
        "> 本报告由结构化 YAML 数据自动生成，重点展示产品拆解、数据指标体系、模块耦合和优化实验设计能力。",
        "",
        render_basic_info(data),
        "",
        render_positioning(data),
        "",
        render_core_loop(data),
        "",
        render_modules(data),
        "",
        render_user_journeys(data),
        "",
        render_metrics(data),
        "",
        render_couplings(data),
        "",
        render_optimizations(data),
        "",
        render_interview_summary(data),
        "",
    ]
    return "\n".join(sections)


def write_report(markdown: str, output_path: str | Path) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(markdown, encoding="utf-8")


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("用法：python scripts/generate_report.py data/sample_game.yaml reports/sample_report.md")
        return 1

    input_path = Path(argv[1])
    output_path = Path(argv[2])

    data = load_yaml(input_path)
    markdown = generate_report(data)
    write_report(markdown, output_path)
    print(f"报告已生成：{output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
