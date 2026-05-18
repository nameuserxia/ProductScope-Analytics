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
  Maximize2,
  Layers3,
  ImagePlus,
  LineChart,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import sampleYaml from "../data/sample_game.yaml?raw";
import { generateMarkdown } from "./report.js";

const tabs = [
  { id: "basic", label: "基础信息", icon: Target },
  { id: "position", label: "产品定位", icon: Sparkles },
  { id: "gameplay", label: "核心玩法", icon: Target },
  { id: "modules", label: "功能模块", icon: Boxes },
  { id: "metrics", label: "指标体系", icon: BarChart3 },
  { id: "optimizations", label: "优化实验", icon: LineChart },
  { id: "extensions", label: "扩展章节", icon: Layers3 },
  { id: "preview", label: "报告预览", icon: Eye },
];

const productFields = ["产品名称", "游戏类型", "目标用户", "核心玩法", "商业化模式", "体验版本", "体验时间", "分析目标"];
const productLongTextFields = ["目标用户", "核心玩法", "商业化模式", "分析目标"];
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
const contentToText = (value) => (Array.isArray(value) ? value.join("\n") : value || "");
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
  const [fullscreenEditor, setFullscreenEditor] = useState(null);
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
  const firstSaveRef = useRef(true);

  const product = data["产品基础信息"] || {};
  const modules = ensureArray(data["功能模块拆解"]);
  const metrics = data["数据指标体系"] || {};
  const gameplay = data["核心玩法拆解"] || {};
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
        图片证据: [],
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
                      {productLongTextFields.includes(field) ? (
                        <SmartTextarea
                          label={field}
                          value={product[field] || ""}
                          onChange={(value) => updateProduct(field, value)}
                          openFullscreen={setFullscreenEditor}
                        />
                      ) : (
                        <input value={product[field] || ""} onChange={(event) => updateProduct(field, event.target.value)} />
                      )}
                    </Field>
                  ))}
                </div>
                <EvidenceSection
                  title="基础信息图片证据"
                  note="可上传产品截图、版本记录、体验环境截图或作品集封面草图。"
                  images={ensureArray(product["图片证据"])}
                  onChange={(nextImages) => updateProduct("图片证据", nextImages)}
                  setError={setImportError}
                />
              </Panel>
            )}

            {activeTab === "position" && (
              <Panel title="产品定位" note="用短句写清楚用户需求、卖点、差异化和用户为什么要玩。">
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
                <Field label="用户为什么要玩">
                  <SmartTextarea
                    label="用户为什么要玩"
                    value={data["产品定位分析"]?.["用户为什么要玩"] || ""}
                    onChange={(value) => updateListSection("产品定位分析", "用户为什么要玩", value)}
                    openFullscreen={setFullscreenEditor}
                  />
                </Field>
                <EvidenceSection
                  title="定位分析图片证据"
                  note="可上传用户画像、竞品定位图、用户需求脑图或使用场景图。"
                  images={ensureArray(data["产品定位分析"]?.["图片证据"])}
                  onChange={(nextImages) => updateListSection("产品定位分析", "图片证据", nextImages)}
                  setError={setImportError}
                />
              </Panel>
            )}

            {activeTab === "gameplay" && (
              <Panel title="核心玩法拆解" note="完整编辑第 3 章：核心循环、完整路径、爽点、成长路径和目标反馈成就。">
                <TextareaList
                  label="核心循环"
                  value={lineJoin(gameplay["核心循环"])}
                  onChange={(value) => updateListSection("核心玩法拆解", "核心循环", lineSplit(value))}
                />
                <JourneyTableEditor
                  title="完整路径"
                  rows={ensureArray(gameplay["完整路径"])}
                  onChange={(rows) => updateListSection("核心玩法拆解", "完整路径", rows)}
                />
                <TextareaList
                  label="核心爽点"
                  value={lineJoin(gameplay["核心爽点"])}
                  onChange={(value) => updateListSection("核心玩法拆解", "核心爽点", lineSplit(value))}
                />
                <TextareaList
                  label="成长路径"
                  value={lineJoin(gameplay["成长路径"])}
                  onChange={(value) => updateListSection("核心玩法拆解", "成长路径", lineSplit(value))}
                />
                <div className="form-grid">
                  {["目标感", "反馈感", "成就感"].map((field) => (
                    <Field label={field} key={field}>
                      <SmartTextarea
                        label={field}
                        value={gameplay["目标反馈成就"]?.[field] || ""}
                        onChange={(value) =>
                          updateListSection("核心玩法拆解", "目标反馈成就", {
                            ...(gameplay["目标反馈成就"] || {}),
                            [field]: value,
                          })
                        }
                        openFullscreen={setFullscreenEditor}
                      />
                    </Field>
                  ))}
                </div>
                <EvidenceSection
                  title="核心玩法图片证据"
                  note="可上传核心循环图、玩法流程图、成长路径图或系统关系图。"
                  images={ensureArray(gameplay["图片证据"])}
                  onChange={(nextImages) => updateListSection("核心玩法拆解", "图片证据", nextImages)}
                  setError={setImportError}
                />
              </Panel>
            )}

            {activeTab === "modules" && (
              <Panel
                title="功能模块"
                note="每个模块都回答：为什么存在、服务谁、影响什么指标、如何验证优化；图片证据也跟随模块保存。"
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
                          <SmartTextarea
                            label={field}
                            value={selected[field] || ""}
                            onChange={(value) => updateModule(selectedModule, { [field]: value })}
                            openFullscreen={setFullscreenEditor}
                          />
                        </Field>
                      ))}
                    </div>
                    {["设计优点", "潜在风险", "可优化方向", "可验证的数据分析方法"].map((field) => (
                      <Field label={field} key={field}>
                        <SmartTextarea
                          label={field}
                          value={contentToText(selected[field])}
                          onChange={(value) => updateModule(selectedModule, { [field]: value })}
                          openFullscreen={setFullscreenEditor}
                        />
                      </Field>
                    ))}
                    <EvidenceSection
                      title="模块图片证据"
                      note="上传这个模块对应的图表、路径截图、竞品截图或问题证据。"
                      images={ensureArray(selected["图片证据"])}
                      onChange={(nextImages) => updateModule(selectedModule, { 图片证据: nextImages })}
                      setError={setImportError}
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
                            <SmartTextarea
                              label={field}
                              value={metric[field] || ""}
                              onChange={(value) => updateMetric(selectedMetricCategory, index, { [field]: value })}
                              openFullscreen={setFullscreenEditor}
                            />
                          </Field>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
                <EvidenceSection
                  title="指标体系图片证据"
                  note="可上传指标树、北极星指标图、漏斗图、留存曲线或数据看板截图。"
                  images={ensureArray(metrics["图片证据"])}
                  onChange={(nextImages) => updateSection("数据指标体系", { ...metrics, 图片证据: nextImages })}
                  setError={setImportError}
                />
              </Panel>
            )}

            {activeTab === "optimizations" && (
              <Panel title="优化实验" note="建议始终写清楚问题、指标、方案、风险、A/B Test 和成功标准。">
                <OptimizationEditor data={data} setData={setData} setError={setImportError} openFullscreen={setFullscreenEditor} />
              </Panel>
            )}

            {activeTab === "extensions" && (
              <Panel title="扩展章节" note="这里用来放竞品、埋点、SQL、访谈、截图观察和版本复盘。">
                <ExtensionEditor data={data} setData={setData} setError={setImportError} openFullscreen={setFullscreenEditor} />
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
      {fullscreenEditor && (
        <FullscreenTextarea
          editor={fullscreenEditor}
          onClose={() => setFullscreenEditor(null)}
        />
      )}
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
      <textarea className="list-textarea smart-textarea" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function JourneyTableEditor({ title, rows, onChange }) {
  const updateRow = (index, patch) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const addRow = () => {
    onChange([
      ...rows,
      {
        步骤: "新步骤",
        用户行为: "待补充",
        系统反馈: "待补充",
        用户心理: "待补充",
        可能流失点: "待补充",
        指标: "待补充",
      },
    ]);
  };
  const removeRow = (index) => onChange(rows.filter((_, itemIndex) => itemIndex !== index));

  return (
    <section className="journey-editor">
      <div className="inline-title-row">
        <h3>{title}</h3>
        <button className="mini-button" onClick={addRow}>
          <Plus size={16} />
          新增步骤
        </button>
      </div>
      <div className="journey-stack">
        {rows.map((row, index) => (
          <article className="journey-card" key={`${row["步骤"]}-${index}`}>
            <div className="metric-row-head">
              <input value={row["步骤"] || ""} onChange={(event) => updateRow(index, { 步骤: event.target.value })} />
              <button className="icon-button danger" onClick={() => removeRow(index)} title="删除步骤">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="metric-grid">
              {["用户行为", "系统反馈", "用户心理", "可能流失点", "指标"].map((field) => (
                <Field label={field} key={field}>
                  <textarea value={row[field] || ""} onChange={(event) => updateRow(index, { [field]: event.target.value })} />
                </Field>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SmartTextarea({ label, value, onChange, openFullscreen }) {
  const isMarkdownTable = value.includes("|") && value.includes("---");
  const lineCount = Math.max(6, Math.min(18, String(value || "").split("\n").length + 2));

  return (
    <div className="smart-textarea-wrap">
      <textarea
        className={`smart-textarea ${isMarkdownTable ? "markdown-mode" : ""}`}
        style={{ minHeight: `${lineCount * 24}px` }}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="textarea-expand"
        onClick={() => openFullscreen({ label, value: value || "", onChange })}
        title="全屏编辑"
      >
        <Maximize2 size={15} />
        全屏
      </button>
    </div>
  );
}

function FullscreenTextarea({ editor, onClose }) {
  const [draft, setDraft] = useState(editor.value || "");
  const isMarkdownTable = draft.includes("|") && draft.includes("---");

  const saveAndClose = () => {
    editor.onChange(draft);
    onClose();
  };

  return (
    <div className="editor-modal" role="dialog" aria-modal="true">
      <div className="editor-modal-card">
        <div className="editor-modal-head">
          <div>
            <span>沉浸式编辑</span>
            <strong>{editor.label}</strong>
          </div>
          <button className="icon-button" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>
        <textarea
          className={`fullscreen-textarea ${isMarkdownTable ? "markdown-mode" : ""}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="editor-modal-foot">
          <span>{draft.split("\n").length} 行 · {draft.length} 字符</span>
          <div>
            <button className="tool-button" onClick={onClose}>取消</button>
            <button className="primary-button" onClick={saveAndClose}>保存并关闭</button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function readImagesFromFiles(files, setError) {
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
  setError(skippedFiles.length ? `部分图片未导入：${skippedFiles.join("；")}` : "");
  return acceptedImages;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function EvidenceSection({ title, note, images, onChange, setError }) {
  const inputRef = useRef(null);
  const rows = ensureArray(images);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const acceptedImages = await readImagesFromFiles(files, setError);
    if (acceptedImages.length) {
      onChange([...rows, ...acceptedImages]);
    }
    event.target.value = "";
  };

  return (
    <section className="evidence-section">
      <div className="evidence-head">
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} hidden />
        <button className="mini-button" onClick={() => inputRef.current?.click()}>
          <ImagePlus size={16} />
          上传图片
        </button>
      </div>
      <ImageEvidenceEditor images={rows} onChange={onChange} />
    </section>
  );
}

function OptimizationEditor({ data, setData, setError, openFullscreen }) {
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
                <SmartTextarea
                  label={field}
                  value={item[field] || ""}
                  onChange={(value) => update(index, { [field]: value })}
                  openFullscreen={openFullscreen}
                />
              </Field>
            ))}
          </div>
          <TextareaList label="影响用户" value={lineJoin(item["影响用户"])} onChange={(value) => update(index, { 影响用户: lineSplit(value) })} />
          <TextareaList label="影响指标" value={lineJoin(item["影响指标"])} onChange={(value) => update(index, { 影响指标: lineSplit(value) })} />
          <EvidenceSection
            title="优化建议图片证据"
            note="可上传问题截图、实验方案图、A/B Test 分流图或指标变化图。"
            images={ensureArray(item["图片证据"])}
            onChange={(nextImages) => update(index, { 图片证据: nextImages })}
            setError={setError}
          />
        </article>
      ))}
    </div>
  );
}

function ExtensionEditor({ data, setData, setError, openFullscreen }) {
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
            <SmartTextarea
              label="内容"
              value={item["内容"] || ""}
              onChange={(value) => update(index, { 内容: value })}
              openFullscreen={openFullscreen}
            />
          </Field>
          <TextareaList label="分析要点" value={lineJoin(item["分析要点"])} onChange={(value) => update(index, { 分析要点: lineSplit(value) })} />
          <EvidenceSection
            title="扩展章节图片证据"
            note="可上传竞品截图、埋点图、SQL 结果图、访谈归纳图或版本复盘图。"
            images={ensureArray(item["图片证据"])}
            onChange={(nextImages) => update(index, { 图片证据: nextImages })}
            setError={setError}
          />
        </article>
      ))}
    </div>
  );
}

function ImageEvidenceEditor({ images, onChange }) {
  const rows = ensureArray(images);
  const update = (index, patch) => {
    const next = clone(rows);
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const remove = (index) => {
    onChange(rows.filter((_, itemIndex) => itemIndex !== index));
  };

  if (!rows.length) {
    return (
      <div className="empty-state">
        <ImagePlus size={34} />
        <strong>这里还没有图片证据</strong>
        <p>上传流程图、思维导图、数据图表、指标异常图、竞品截图或用户路径截图。</p>
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
  const hasImages = (value) => {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(hasImages);
    if (ensureArray(value["图片证据"]).length > 0) return true;
    return Object.values(value).some(hasImages);
  };
  return [
    { label: "留存指标", done: text.includes("留存") || text.includes("D1") },
    { label: "付费分析", done: text.includes("付费") || text.includes("ARPU") },
    { label: "广告变现", done: text.includes("广告") || text.includes("eCPM") },
    { label: "用户分层", done: text.includes("分层") || text.includes("高价值用户") },
    { label: "A/B Test", done: text.includes("A/B Test") || text.includes("实验组") },
    { label: "图片证据", done: hasImages(data) },
    { label: "模块拆解", done: modules.length >= 3 },
    { label: "优化建议", done: optimizations.length >= 1 },
  ];
}

export default App;
