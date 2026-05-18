import { useEffect, useMemo, useRef, useState } from "react";
import yaml from "js-yaml";
import { marked } from "marked";
import {
  AlertCircle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileDown,
  FileUp,
  Layers3,
  ImagePlus,
  LineChart,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import sampleYaml from "../data/sample_game.yaml?raw";
import { generateMarkdown } from "./report.js";

const tabs = [
  { id: "basic", label: "基础信息", icon: Target },
  { id: "position", label: "定位玩法", icon: Sparkles },
  { id: "modules", label: "功能模块", icon: Boxes },
  { id: "metrics", label: "指标体系", icon: BarChart3 },
  { id: "optimizations", label: "优化实验", icon: LineChart },
  { id: "images", label: "图片证据", icon: ImagePlus },
  { id: "extensions", label: "扩展章节", icon: Layers3 },
  { id: "preview", label: "报告预览", icon: Eye },
];

const productFields = ["产品名称", "游戏类型", "目标用户", "核心玩法", "商业化模式", "体验版本", "体验时间", "分析目标"];
const moduleTextFields = [
  "模块入口",
  "模块功能描述",
  "用户侧作用",
  "产品侧作用",
  "商业化作用",
  "留存作用",
  "活跃作用",
  "社交传播作用",
  "设计动机推测",
];
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

const parseYaml = (text) => yaml.load(text);
const ensureArray = (value) => (Array.isArray(value) ? value : []);
const lineSplit = (text) => text.split("\n").map((item) => item.trim()).filter(Boolean);
const lineJoin = (items) => ensureArray(items).join("\n");
const draftKey = "productscope.analytics.studio.draft.v1";
const maxImageSize = 2 * 1024 * 1024;

function loadInitialData() {
  if (typeof window === "undefined") {
    return parseYaml(sampleYaml);
  }

  const draft = window.localStorage.getItem(draftKey);
  if (!draft) {
    return parseYaml(sampleYaml);
  }

  try {
    const parsed = JSON.parse(draft);
    return parsed.data || parseYaml(sampleYaml);
  } catch {
    return parseYaml(sampleYaml);
  }
}

function formatSavedAt(value) {
  if (!value) return "尚未自动保存";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function clone(value) {
  return structuredClone(value);
}

function downloadFile(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [data, setData] = useState(() => loadInitialData());
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedModule, setSelectedModule] = useState(0);
  const [selectedMetricCategory, setSelectedMetricCategory] = useState("留存指标");
  const [importError, setImportError] = useState("");
  const [saveState, setSaveState] = useState(() => {
    if (typeof window === "undefined") return { label: "尚未自动保存", savedAt: "" };
    const draft = window.localStorage.getItem(draftKey);
    if (!draft) return { label: "尚未自动保存", savedAt: "" };
    try {
      const parsed = JSON.parse(draft);
      return { label: `已恢复草稿 ${formatSavedAt(parsed.savedAt)}`, savedAt: parsed.savedAt || "" };
    } catch {
      return { label: "草稿读取失败，已载入示例", savedAt: "" };
    }
  });
  const fileRef = useRef(null);
  const imageFileRef = useRef(null);
  const firstSaveRef = useRef(true);

  const product = data["产品基础信息"] || {};
  const modules = ensureArray(data["功能模块拆解"]);
  const metrics = data["数据指标体系"] || {};
  const markdown = useMemo(() => generateMarkdown(data), [data]);
  const previewHtml = useMemo(() => marked.parse(markdown), [markdown]);
  const quality = useMemo(() => getQualityChecks(data), [data]);
  const score = Math.round((quality.filter((item) => item.done).length / quality.length) * 100);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (firstSaveRef.current) {
      firstSaveRef.current = false;
      return undefined;
    }

    setSaveState((current) => ({ ...current, label: "正在自动保存..." }));
    const timer = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(draftKey, JSON.stringify({ data, savedAt }));
      setSaveState({ label: `已自动保存 ${formatSavedAt(savedAt)}`, savedAt });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [data]);

  const updateSection = (section, nextSection) => {
    setData((current) => ({ ...current, [section]: nextSection }));
  };

  const updateProduct = (key, value) => {
    updateSection("产品基础信息", { ...product, [key]: value });
  };

  const updateListSection = (section, key, value) => {
    const next = { ...(data[section] || {}) };
    next[key] = value;
    updateSection(section, next);
  };

  const updateModule = (index, patch) => {
    const nextModules = clone(modules);
    nextModules[index] = { ...nextModules[index], ...patch };
    updateSection("功能模块拆解", nextModules);
  };

  const addModule = () => {
    const nextModules = [
      ...modules,
      {
        模块名称: "新模块",
        模块入口: "待补充",
        模块功能描述: "待补充",
        用户侧作用: "待补充",
        产品侧作用: "待补充",
        商业化作用: "待补充",
        留存作用: "待补充",
        活跃作用: "待补充",
        社交传播作用: "待补充",
        设计动机推测: "待补充",
        设计优点: [],
        潜在风险: [],
        可优化方向: [],
        关联模块: [],
        关键指标: [],
        可验证的数据分析方法: [],
      },
    ];
    updateSection("功能模块拆解", nextModules);
    setSelectedModule(nextModules.length - 1);
  };

  const removeModule = (index) => {
    const nextModules = modules.filter((_, itemIndex) => itemIndex !== index);
    updateSection("功能模块拆解", nextModules);
    setSelectedModule(Math.max(0, index - 1));
  };

  const updateMetric = (category, index, patch) => {
    const nextMetrics = clone(metrics);
    const rows = ensureArray(nextMetrics[category]);
    rows[index] = { ...rows[index], ...patch };
    nextMetrics[category] = rows;
    updateSection("数据指标体系", nextMetrics);
  };

  const addMetric = (category) => {
    const nextMetrics = clone(metrics);
    nextMetrics[category] = [
      ...ensureArray(nextMetrics[category]),
      {
        指标名称: "新指标",
        指标定义: "待补充",
        计算口径: "待补充",
        适用模块: "待补充",
        业务意义: "待补充",
        升高说明: "待补充",
        下降说明: "待补充",
        优化方向: "待补充",
      },
    ];
    updateSection("数据指标体系", nextMetrics);
  };

  const removeMetric = (category, index) => {
    const nextMetrics = clone(metrics);
    nextMetrics[category] = ensureArray(nextMetrics[category]).filter((_, itemIndex) => itemIndex !== index);
    updateSection("数据指标体系", nextMetrics);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setData(parseYaml(text));
      setImportError("");
      setSaveState({ label: "已导入，正在自动保存...", savedAt: "" });
    } catch (error) {
      setImportError(`导入失败：${error.message}`);
    } finally {
      event.target.value = "";
    }
  };

  const exportYaml = () => {
    downloadFile("productscope-analysis.yaml", yaml.dump(data, { lineWidth: 120, noRefs: true }), "application/x-yaml;charset=utf-8");
  };

  const exportMarkdown = () => {
    downloadFile("productscope-report.md", markdown, "text/markdown;charset=utf-8");
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const acceptedImages = [];
    const skippedFiles = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        skippedFiles.push(`${file.name} 不是图片`);
        continue;
      }
      if (file.size > maxImageSize) {
        skippedFiles.push(`${file.name} 超过 2MB`);
        continue;
      }
      const dataUrl = await readFileAsDataUrl(file);
      acceptedImages.push({
        标题: file.name.replace(/\.[^.]+$/, ""),
        说明: "补充这张图对应的数据结论、用户路径证据或问题证据。",
        文件名: file.name,
        图片数据: dataUrl,
      });
    }

    if (acceptedImages.length) {
      setData((current) => ({
        ...current,
        数据图片: [...ensureArray(current["数据图片"]), ...acceptedImages],
      }));
    }
    setImportError(skippedFiles.length ? `部分图片未导入：${skippedFiles.join("；")}` : "");
    event.target.value = "";
  };

  const resetDraft = () => {
    const nextData = parseYaml(sampleYaml);
    setData(nextData);
    setSelectedModule(0);
    window.localStorage.removeItem(draftKey);
    setSaveState({ label: "已清空草稿并恢复示例", savedAt: "" });
  };

  const selected = modules[selectedModule] || {};

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PS</div>
          <div>
            <strong>ProductScope</strong>
            <span>Analytics Studio</span>
          </div>
        </div>

        <nav className="nav-stack">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <section className="score-panel">
          <div className="score-ring" style={{ "--score": `${score}%` }}>
            <span>{score}</span>
          </div>
          <div>
            <strong>作品集完整度</strong>
            <p>{quality.filter((item) => item.done).length}/{quality.length} 项已覆盖</p>
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">游戏产品拆解与数据分析报告框架</p>
            <h1>{product["产品名称"] || "未命名产品"}</h1>
          </div>
          <div className="top-actions">
            <div className="save-status">
              <Save size={15} />
              <span>{saveState.label}</span>
            </div>
            <input ref={fileRef} type="file" accept=".yaml,.yml" onChange={handleImport} hidden />
            <button className="tool-button" onClick={() => fileRef.current?.click()}>
              <FileUp size={17} />
              导入 YAML
            </button>
            <button className="tool-button" onClick={exportYaml}>
              <Save size={17} />
              导出 YAML
            </button>
            <button className="tool-button" onClick={resetDraft}>
              <RotateCcw size={17} />
              清空草稿
            </button>
            <button className="primary-button" onClick={exportMarkdown}>
              <FileDown size={17} />
              导出报告
            </button>
          </div>
        </header>

        {importError && <div className="alert-row">{importError}</div>}

        <section className="quality-strip">
          {quality.map((item) => (
            <div className={`quality-chip ${item.done ? "done" : ""}`} key={item.label}>
              {item.done ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {item.label}
            </div>
          ))}
        </section>

        <div className="content-grid">
          <section className="editor-panel">
            {activeTab === "basic" && (
              <Panel title="产品基础信息" note="先把产品说清楚，后面的模块和指标才不会漂。">
                <div className="form-grid">
                  {productFields.map((field) => (
                    <Field key={field} label={field}>
                      {field === "分析目标" || field === "核心玩法" || field === "目标用户" ? (
                        <textarea value={product[field] || ""} onChange={(event) => updateProduct(field, event.target.value)} />
                      ) : (
                        <input value={product[field] || ""} onChange={(event) => updateProduct(field, event.target.value)} />
                      )}
                    </Field>
                  ))}
                </div>
              </Panel>
            )}

            {activeTab === "position" && (
              <Panel title="定位玩法" note="用短句写用户需求、卖点和核心循环，便于面试时直接复述。">
                <TextareaList
                  label="用户需求"
                  value={lineJoin(data["产品定位分析"]?.["用户需求"])}
                  onChange={(value) => updateListSection("产品定位分析", "用户需求", lineSplit(value))}
                />
                <TextareaList
                  label="产品卖点"
                  value={lineJoin(data["产品定位分析"]?.["产品卖点"])}
                  onChange={(value) => updateListSection("产品定位分析", "产品卖点", lineSplit(value))}
                />
                <TextareaList
                  label="差异化竞争点"
                  value={lineJoin(data["产品定位分析"]?.["差异化竞争点"])}
                  onChange={(value) => updateListSection("产品定位分析", "差异化竞争点", lineSplit(value))}
                />
                <TextareaList
                  label="核心循环"
                  value={lineJoin(data["核心玩法拆解"]?.["核心循环"])}
                  onChange={(value) => updateListSection("核心玩法拆解", "核心循环", lineSplit(value))}
                />
              </Panel>
            )}

            {activeTab === "modules" && (
              <Panel
                title="功能模块"
                note="每个模块都回答：为什么存在、服务谁、影响什么指标、如何验证优化。"
                action={
                  <button className="mini-button" onClick={addModule}>
                    <Plus size={16} />
                    新增模块
                  </button>
                }
              >
                <div className="module-layout">
                  <div className="module-list">
                    {modules.map((module, index) => (
                      <button
                        className={`module-item ${selectedModule === index ? "active" : ""}`}
                        key={`${module["模块名称"]}-${index}`}
                        onClick={() => setSelectedModule(index)}
                      >
                        <span>{module["模块名称"] || `模块 ${index + 1}`}</span>
                        <small>{module["留存作用"] || "待补充留存作用"}</small>
                      </button>
                    ))}
                  </div>
                  <div className="module-editor">
                    <div className="inline-title-row">
                      <input
                        className="title-input"
                        value={selected["模块名称"] || ""}
                        onChange={(event) => updateModule(selectedModule, { 模块名称: event.target.value })}
                      />
                      <button className="icon-button danger" onClick={() => removeModule(selectedModule)} title="删除模块">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="form-grid">
                      {moduleTextFields.map((field) => (
                        <Field label={field} key={field}>
                          <textarea value={selected[field] || ""} onChange={(event) => updateModule(selectedModule, { [field]: event.target.value })} />
                        </Field>
                      ))}
                    </div>
                    <TextareaList
                      label="设计优点"
                      value={lineJoin(selected["设计优点"])}
                      onChange={(value) => updateModule(selectedModule, { 设计优点: lineSplit(value) })}
                    />
                    <TextareaList
                      label="潜在风险"
                      value={lineJoin(selected["潜在风险"])}
                      onChange={(value) => updateModule(selectedModule, { 潜在风险: lineSplit(value) })}
                    />
                    <TextareaList
                      label="可优化方向"
                      value={lineJoin(selected["可优化方向"])}
                      onChange={(value) => updateModule(selectedModule, { 可优化方向: lineSplit(value) })}
                    />
                    <TextareaList
                      label="可验证的数据分析方法"
                      value={lineJoin(selected["可验证的数据分析方法"])}
                      onChange={(value) => updateModule(selectedModule, { 可验证的数据分析方法: lineSplit(value) })}
                    />
                  </div>
                </div>
              </Panel>
            )}

            {activeTab === "metrics" && (
              <Panel
                title="指标体系"
                note="把主观判断落到指标口径，求职作品集会立刻更像真实业务分析。"
                action={
                  <button className="mini-button" onClick={() => addMetric(selectedMetricCategory)}>
                    <Plus size={16} />
                    新增指标
                  </button>
                }
              >
                <div className="segmented">
                  {metricCategories.map((category) => (
                    <button
                      className={selectedMetricCategory === category ? "selected" : ""}
                      key={category}
                      onClick={() => setSelectedMetricCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="metric-stack">
                  {ensureArray(metrics[selectedMetricCategory]).map((metric, index) => (
                    <article className="metric-row" key={`${metric["指标名称"]}-${index}`}>
                      <div className="metric-row-head">
                        <input
                          value={metric["指标名称"] || ""}
                          onChange={(event) => updateMetric(selectedMetricCategory, index, { 指标名称: event.target.value })}
                        />
                        <button className="icon-button danger" onClick={() => removeMetric(selectedMetricCategory, index)} title="删除指标">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="metric-grid">
                        {["指标定义", "计算口径", "适用模块", "业务意义", "升高说明", "下降说明", "优化方向"].map((field) => (
                          <Field label={field} key={field}>
                            <textarea
                              value={metric[field] || ""}
                              onChange={(event) => updateMetric(selectedMetricCategory, index, { [field]: event.target.value })}
                            />
                          </Field>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            )}

            {activeTab === "optimizations" && (
              <Panel title="优化实验" note="建议始终写清楚问题、指标、方案、风险、A/B Test 和成功标准。">
                <OptimizationEditor data={data} setData={setData} />
              </Panel>
            )}

            {activeTab === "images" && (
              <Panel
                title="图片证据"
                note="上传图表、漏斗截图、留存曲线或竞品截图，让报告有可视化证据。单张建议小于 2MB。"
                action={
                  <>
                    <input ref={imageFileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
                    <button className="mini-button" onClick={() => imageFileRef.current?.click()}>
                      <ImagePlus size={16} />
                      上传图片
                    </button>
                  </>
                }
              >
                <ImageEvidenceEditor data={data} setData={setData} />
              </Panel>
            )}

            {activeTab === "extensions" && (
              <Panel title="扩展章节" note="这里用来放竞品、埋点、SQL、访谈、截图观察和版本复盘。">
                <ExtensionEditor data={data} setData={setData} />
              </Panel>
            )}

            {activeTab === "preview" && (
              <Panel title="报告预览" note="这里展示当前配置生成的 Markdown 报告效果。">
                <div className="markdown-preview full" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </Panel>
            )}
          </section>

          <aside className="preview-panel">
            <div className="preview-head">
              <div>
                <span>实时预览</span>
                <strong>{markdown.split("\n").length} 行 Markdown</strong>
              </div>
              <button className="mini-button" onClick={exportMarkdown}>
                <Download size={15} />
                下载
              </button>
            </div>
            <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, note, action, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p>{note}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextareaList({ label, value, onChange }) {
  return (
    <label className="field wide">
      <span>{label}</span>
      <textarea className="list-textarea" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function OptimizationEditor({ data, setData }) {
  const rows = ensureArray(data["优化建议"]);
  const update = (index, patch) => {
    const next = clone(rows);
    next[index] = { ...next[index], ...patch };
    setData((current) => ({ ...current, 优化建议: next }));
  };
  const add = () => {
    setData((current) => ({
      ...current,
      优化建议: [
        ...rows,
        {
          标题: "新优化建议",
          当前问题: "待补充",
          影响用户: [],
          影响指标: [],
          优化方案: "待补充",
          预期收益: "待补充",
          潜在风险: [],
          "A/B Test 验证方案": {
            实验对象: "待补充",
            对照组: "待补充",
            实验组: "待补充",
            核心指标: "待补充",
            护栏指标: "待补充",
            实验周期: "待补充",
          },
          成功判断标准: "待补充",
        },
      ],
    }));
  };
  return (
    <div className="section-stack">
      <button className="mini-button self-start" onClick={add}>
        <Plus size={16} />
        新增优化建议
      </button>
      {rows.map((item, index) => (
        <article className="experiment-block" key={`${item["标题"]}-${index}`}>
          <Field label="标题">
            <input value={item["标题"] || ""} onChange={(event) => update(index, { 标题: event.target.value })} />
          </Field>
          <div className="form-grid">
            {["当前问题", "优化方案", "预期收益", "成功判断标准"].map((field) => (
              <Field label={field} key={field}>
                <textarea value={item[field] || ""} onChange={(event) => update(index, { [field]: event.target.value })} />
              </Field>
            ))}
          </div>
          <TextareaList label="影响用户" value={lineJoin(item["影响用户"])} onChange={(value) => update(index, { 影响用户: lineSplit(value) })} />
          <TextareaList label="影响指标" value={lineJoin(item["影响指标"])} onChange={(value) => update(index, { 影响指标: lineSplit(value) })} />
        </article>
      ))}
    </div>
  );
}

function ExtensionEditor({ data, setData }) {
  const rows = ensureArray(data["自定义扩展章节"]);
  const update = (index, patch) => {
    const next = clone(rows);
    next[index] = { ...next[index], ...patch };
    setData((current) => ({ ...current, 自定义扩展章节: next }));
  };
  const add = () => {
    setData((current) => ({
      ...current,
      自定义扩展章节: [...rows, { 标题: "新扩展分析", 内容: "待补充", 分析要点: [] }],
    }));
  };
  return (
    <div className="section-stack">
      <button className="mini-button self-start" onClick={add}>
        <Plus size={16} />
        新增扩展章节
      </button>
      {rows.map((item, index) => (
        <article className="experiment-block" key={`${item["标题"]}-${index}`}>
          <Field label="标题">
            <input value={item["标题"] || ""} onChange={(event) => update(index, { 标题: event.target.value })} />
          </Field>
          <Field label="内容">
            <textarea value={item["内容"] || ""} onChange={(event) => update(index, { 内容: event.target.value })} />
          </Field>
          <TextareaList label="分析要点" value={lineJoin(item["分析要点"])} onChange={(value) => update(index, { 分析要点: lineSplit(value) })} />
        </article>
      ))}
    </div>
  );
}

function ImageEvidenceEditor({ data, setData }) {
  const rows = ensureArray(data["数据图片"]);
  const update = (index, patch) => {
    const next = clone(rows);
    next[index] = { ...next[index], ...patch };
    setData((current) => ({ ...current, 数据图片: next }));
  };
  const remove = (index) => {
    setData((current) => ({ ...current, 数据图片: rows.filter((_, itemIndex) => itemIndex !== index) }));
  };

  if (!rows.length) {
    return (
      <div className="empty-state">
        <ImagePlus size={34} />
        <strong>还没有图片证据</strong>
        <p>上传留存曲线、漏斗截图、指标异常图、竞品截图或用户路径截图，报告会自动生成图片章节。</p>
      </div>
    );
  }

  return (
    <div className="image-grid">
      {rows.map((item, index) => (
        <article className="image-card" key={`${item["文件名"]}-${index}`}>
          <div className="image-frame">
            <img src={item["图片数据"]} alt={item["标题"] || "图片证据"} />
          </div>
          <div className="image-card-body">
            <div className="inline-title-row">
              <input value={item["标题"] || ""} onChange={(event) => update(index, { 标题: event.target.value })} />
              <button className="icon-button danger" onClick={() => remove(index)} title="删除图片">
                <Trash2 size={16} />
              </button>
            </div>
            <Field label="说明">
              <textarea value={item["说明"] || ""} onChange={(event) => update(index, { 说明: event.target.value })} />
            </Field>
            <p className="file-caption">{item["文件名"]}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function getQualityChecks(data) {
  const text = JSON.stringify(data);
  const modules = ensureArray(data["功能模块拆解"]);
  const optimizations = ensureArray(data["优化建议"]);
  return [
    { label: "留存指标", done: text.includes("留存") || text.includes("D1") },
    { label: "付费分析", done: text.includes("付费") || text.includes("ARPU") },
    { label: "广告变现", done: text.includes("广告") || text.includes("eCPM") },
    { label: "用户分层", done: text.includes("分层") || text.includes("高价值用户") },
    { label: "A/B Test", done: text.includes("A/B Test") || text.includes("实验组") },
    { label: "图片证据", done: ensureArray(data["数据图片"]).length > 0 },
    { label: "模块拆解", done: modules.length >= 3 },
    { label: "优化建议", done: optimizations.length >= 1 },
  ];
}

export default App;
