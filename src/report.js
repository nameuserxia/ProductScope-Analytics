const get = (object, key, fallback = "") => object?.[key] ?? fallback;
const list = (items) => (Array.isArray(items) ? items : []);

const metricCategories = [
  "新增指标",
  "活跃指标",
  "留存指标",
  "付费指标",
  "转化指标",
  "关卡 / 对局 / 任务指标",
  "经济系统指标",
  "广告变现指标",
  "社交指标",
  "用户分层指标",
  "异常监控指标",
];

const table = (headers, rows) => {
  const safeRows = rows.length ? rows : [headers.map(() => "待补充")];
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...safeRows.map((row) => `| ${row.map((cell) => String(cell || "待补充").replace(/\n/g, "<br>")).join(" | ")} |`),
  ].join("\n");
};

const bullets = (items) => {
  const rows = list(items);
  return rows.length ? rows.map((item) => `- ${item}`).join("\n") : "- 待补充";
};

const pushImages = (lines, images, heading = "图片证据", headingLevel = 3) => {
  const rows = list(images);
  if (!rows.length) return;
  const headingMarks = "#".repeat(headingLevel);
  const itemHeadingMarks = "#".repeat(Math.min(headingLevel + 1, 6));
  lines.push("", `${headingMarks} ${heading}`);
  rows.forEach((image, index) => {
    lines.push(
      "",
      `${itemHeadingMarks} ${index + 1}. ${get(image, "标题", "图片证据")}`,
      "",
      get(image, "说明", ""),
      "",
      `![${get(image, "标题", "图片证据")}](${get(image, "图片数据", "")})`
    );
  });
};

export function generateMarkdown(data) {
  const product = get(data, "产品基础信息", {});
  const positioning = get(data, "产品定位分析", {});
  const gameplay = get(data, "核心玩法拆解", {});
  const modules = list(get(data, "功能模块拆解", []));
  const journeys = get(data, "用户体验路径分析", {});
  const metrics = get(data, "数据指标体系", {});
  const couplings = list(get(data, "模块耦合关系", []));
  const optimizations = list(get(data, "优化建议", []));
  const interview = get(data, "面试表达版总结", {});
  const customSections = list(get(data, "自定义扩展章节", []));

  const lines = [
    `# ${get(product, "产品名称", "游戏产品")}：游戏产品拆解与数据分析报告`,
    "",
    "> 本报告由 ProductScope Analytics Studio 生成，重点展示产品拆解、数据指标体系、模块耦合和优化实验设计能力。",
    "",
    "## 1. 产品基础信息",
    "",
    table(
      ["字段", "内容"],
      ["产品名称", "游戏类型", "目标用户", "核心玩法", "商业化模式", "体验版本", "体验时间", "分析目标"].map((key) => [
        key,
        get(product, key, "待补充"),
      ])
    ),
    "",
  ];

  pushImages(lines, get(product, "图片证据", []), "基础信息图片证据", 3);

  lines.push(
    "## 2. 产品定位分析",
    "",
    "### 用户需求",
    "",
    bullets(get(positioning, "用户需求", [])),
    "",
    "### 使用场景",
    "",
    table(
      ["场景", "用户状态", "产品价值", "可能关注指标"],
      list(get(positioning, "使用场景", [])).map((item) => [
        get(item, "场景"),
        get(item, "用户状态"),
        get(item, "产品价值"),
        get(item, "指标"),
      ])
    ),
    "",
    "### 产品卖点",
    "",
    bullets(get(positioning, "产品卖点", [])),
    "",
    "### 差异化竞争点",
    "",
    bullets(get(positioning, "差异化竞争点", [])),
    "",
    "### 目标用户画像",
    "",
    table(
      ["用户分层", "用户特征", "主要需求", "关键指标"],
      list(get(positioning, "目标用户画像", [])).map((item) => [
        get(item, "名称"),
        get(item, "用户特征"),
        get(item, "主要需求"),
        get(item, "关键指标"),
      ])
    ),
    "",
    "### 用户为什么要玩这款游戏",
    "",
    get(positioning, "用户为什么要玩", "待补充")
  );

  pushImages(lines, get(positioning, "图片证据", []), "定位分析图片证据", 3);

  lines.push(
    "",
    "## 3. 核心玩法拆解",
    "",
    "### 核心循环",
    "",
    bullets(get(gameplay, "核心循环", [])),
    "",
    "### 完整路径",
    "",
    table(
      ["步骤", "用户行为", "系统反馈", "用户心理", "可能流失点", "关键指标"],
      list(get(gameplay, "完整路径", [])).map((item) => [
        get(item, "步骤"),
        get(item, "用户行为"),
        get(item, "系统反馈"),
        get(item, "用户心理"),
        get(item, "可能流失点"),
        get(item, "指标"),
      ])
    ),
    "",
    "### 核心爽点",
    "",
    bullets(get(gameplay, "核心爽点", [])),
    "",
    "### 成长路径",
    "",
    bullets(get(gameplay, "成长路径", []))
  );

  pushImages(lines, get(gameplay, "图片证据", []), "核心玩法图片证据", 3);

  lines.push("", "## 4. 功能模块拆解");

  modules.forEach((module, index) => {
    const moduleImages = list(get(module, "图片证据", []));
    lines.push(
      "",
      `### 4.${index + 1} ${get(module, "模块名称", "未命名模块")}`,
      "",
      table(
        ["分析项", "内容"],
        ["模块入口", "模块功能描述", "用户侧作用", "产品侧作用", "商业化作用", "留存作用", "活跃作用", "社交传播作用", "设计动机推测"].map(
          (key) => [key, get(module, key, "待补充")]
        )
      ),
      "",
      "#### 设计优点",
      "",
      bullets(get(module, "设计优点", [])),
      "",
      "#### 潜在风险",
      "",
      bullets(get(module, "潜在风险", [])),
      "",
      "#### 可优化方向",
      "",
      bullets(get(module, "可优化方向", [])),
      "",
      "#### 关键指标",
      "",
      table(
        ["指标", "定义", "计算口径", "业务意义"],
        list(get(module, "关键指标", [])).map((metric) => [
          get(metric, "指标名称"),
          get(metric, "指标定义"),
          get(metric, "计算口径"),
          get(metric, "业务意义"),
        ])
      ),
      "",
      "#### 可验证的数据分析方法",
      "",
      bullets(get(module, "可验证的数据分析方法", []))
    );
    pushImages(lines, moduleImages, "图片证据", 4);
  });

  lines.push("", "## 5. 用户体验路径分析");
  Object.entries(journeys).forEach(([title, rows]) => {
    lines.push(
      "",
      `### ${title}`,
      "",
      table(
        ["步骤", "用户行为", "用户心理", "可能流失原因", "关注指标", "优化策略"],
        list(rows).map((item) => [
          get(item, "步骤"),
          get(item, "用户行为"),
          get(item, "用户心理"),
          get(item, "可能流失原因"),
          get(item, "指标"),
          get(item, "优化策略"),
        ])
      )
    );
  });

  lines.push("", "## 6. 数据指标体系");
  metricCategories.forEach((category) => {
    lines.push(
      "",
      `### ${category}`,
      "",
      table(
        ["指标", "定义", "口径", "适用模块", "业务意义", "升高说明", "下降说明", "优化方向"],
        list(get(metrics, category, [])).map((metric) => [
          get(metric, "指标名称"),
          get(metric, "指标定义"),
          get(metric, "计算口径"),
          get(metric, "适用模块"),
          get(metric, "业务意义"),
          get(metric, "升高说明"),
          get(metric, "下降说明"),
          get(metric, "优化方向"),
        ])
      )
    );
  });

  pushImages(lines, get(metrics, "图片证据", []), "指标体系图片证据", 3);

  lines.push(
    "",
    "## 7. 模块耦合关系分析",
    "",
    table(
      ["来源模块", "影响模块", "关系类型", "影响逻辑", "关键指标", "潜在风险", "验证方法"],
      couplings.map((item) => [
        get(item, "来源模块"),
        get(item, "影响模块"),
        get(item, "关系类型"),
        get(item, "影响逻辑"),
        get(item, "指标"),
        get(item, "潜在风险"),
        get(item, "验证方法"),
      ])
    ),
    "",
    "## 8. 优化建议框架"
  );

  optimizations.forEach((item, index) => {
    const ab = get(item, "A/B Test 验证方案", {});
    lines.push(
      "",
      `### 8.${index + 1} ${get(item, "标题", "未命名优化建议")}`,
      "",
      table(
        ["分析项", "内容"],
        [
          ["当前问题", get(item, "当前问题")],
          ["影响用户", list(get(item, "影响用户", [])).join("、")],
          ["影响指标", list(get(item, "影响指标", [])).join("、")],
          ["优化方案", get(item, "优化方案")],
          ["预期收益", get(item, "预期收益")],
          ["成功判断标准", get(item, "成功判断标准")],
        ]
      ),
      "",
      "#### A/B Test 验证方案",
      "",
      table(
        ["项目", "设计"],
        ["实验对象", "对照组", "实验组", "核心指标", "护栏指标", "实验周期"].map((key) => [key, get(ab, key)])
      )
    );
    pushImages(lines, get(item, "图片证据", []), "优化建议图片证据", 4);
  });

  lines.push(
    "",
    "## 9. 求职作品集表达：面试版总结",
    "",
    "### 项目背景",
    "",
    get(interview, "项目背景", "待补充"),
    "",
    "### 我的分析目标",
    "",
    get(interview, "分析目标", "待补充"),
    "",
    "### 我的拆解方法",
    "",
    get(interview, "拆解方法", "待补充"),
    "",
    "### 我的核心发现",
    "",
    bullets(get(interview, "核心发现", [])),
    "",
    "### 这个项目体现的能力",
    "",
    bullets(get(interview, "能力", []))
  );

  if (customSections.length) {
    const sectionNumber = 10;
    lines.push("", `## ${sectionNumber}. 自定义扩展分析`);
    customSections.forEach((section, index) => {
      lines.push(
        "",
        `### ${sectionNumber}.${index + 1} ${get(section, "标题", "补充分析")}`,
        "",
        get(section, "内容", ""),
        "",
      bullets(get(section, "分析要点", []))
      );
      pushImages(lines, get(section, "图片证据", []), "扩展章节图片证据", 4);
    });
  }

  return lines.join("\n");
}
