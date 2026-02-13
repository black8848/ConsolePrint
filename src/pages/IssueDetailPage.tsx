import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';
import {
  issueApi,
  configApi,
  logApi,
  type Issue,
  type Config,
  type ConsoleLog,
} from '../services/api';
import { parseConsoleContent } from '../utils/parseConsole';
import { getLogColors } from '../utils/logColors';
import { CodeBlock, SUPPORTED_LANGUAGES, detectLanguageFromPath } from '../components/CodeBlock';

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'configs' | 'logs'>('logs');
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Editable impact
  const [editingImpact, setEditingImpact] = useState(false);
  const [impactValue, setImpactValue] = useState('');

  // Config form state
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configMode, setConfigMode] = useState<'paste' | 'manual'>('paste');
  const [configPaste, setConfigPaste] = useState('');
  const [configForm, setConfigForm] = useState({ filePath: '', content: '', language: 'text', note: '' });

  // Log form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [logMode, setLogMode] = useState<'paste' | 'manual'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [logForm, setLogForm] = useState({
    prompt: '',
    command: '',
    output: '',
    note: '',
    logType: 'info' as ConsoleLog['logType'],
  });

  useEffect(() => {
    if (id) {
      loadData(parseInt(id, 10));
    }
  }, [id]);

  const loadData = async (issueId: number) => {
    setLoading(true);
    try {
      const [issueData, configsData, logsData] = await Promise.all([
        issueApi.get(issueId),
        configApi.listByIssue(issueId),
        logApi.listByIssue(issueId),
      ]);
      setIssue(issueData);
      setImpactValue(issueData.impact || '');
      setConfigs(configsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: Issue['status']) => {
    if (!issue) return;
    try {
      const updated = await issueApi.update(issue.id, { status });
      setIssue(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleImpactSave = async () => {
    if (!issue) return;
    try {
      const updated = await issueApi.update(issue.id, { impact: impactValue });
      setIssue(updated);
      setEditingImpact(false);
    } catch (error) {
      console.error('Failed to update impact:', error);
    }
  };

  // Parse config paste content: first line is command (cat /path/to/file), rest is content
  const parseConfigPaste = (content: string): { filePath: string; content: string; language: string } => {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return { filePath: '', content: '', language: 'text' };

    const firstLine = lines[0];
    // Try to extract file path from command like "root@host:~# cat /path/to/file"
    const catMatch = firstLine.match(/cat\s+([^\s]+)/);
    if (catMatch) {
      const filePath = catMatch[1];
      return {
        filePath,
        content: lines.slice(1).join('\n'),
        language: detectLanguageFromPath(filePath),
      };
    }

    // If no cat command found, treat first line as file path if it looks like a path
    if (firstLine.startsWith('/') || firstLine.includes(':\\')) {
      return {
        filePath: firstLine,
        content: lines.slice(1).join('\n'),
        language: detectLanguageFromPath(firstLine),
      };
    }

    // Otherwise, no file path detected
    return { filePath: '', content: content.trim(), language: 'text' };
  };

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;

    let data = configForm;
    if (configMode === 'paste' && configPaste.trim()) {
      const parsed = parseConfigPaste(configPaste);
      data = {
        filePath: parsed.filePath,
        content: parsed.content,
        language: parsed.language,
        note: configForm.note,
      };
    }

    if (!data.filePath && !data.content) return;

    try {
      await configApi.create({
        issueId: issue.id,
        ...data,
        note: data.note || null,
      });
      setConfigPaste('');
      setConfigForm({ filePath: '', content: '', language: 'text', note: '' });
      setShowConfigForm(false);
      const updated = await configApi.listByIssue(issue.id);
      setConfigs(updated);
    } catch (error) {
      console.error('Failed to add config:', error);
    }
  };

  const handleDeleteConfig = async (configId: number) => {
    if (!issue) return;
    try {
      await configApi.delete(configId);
      const data = await configApi.listByIssue(issue.id);
      setConfigs(data);
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;

    let logData = logForm;
    if (logMode === 'paste' && pasteContent.trim()) {
      const parsed = parseConsoleContent(pasteContent);
      logData = {
        ...parsed,
        note: logForm.note,
        logType: detectLogType(parsed.output),
      };
    }

    if (!logData.command && !logData.output) return;

    try {
      await logApi.create({
        issueId: issue.id,
        ...logData,
        note: logData.note || null,
      });
      setPasteContent('');
      setLogForm({ prompt: '', command: '', output: '', note: '', logType: 'info' });
      setShowLogForm(false);
      const data = await logApi.listByIssue(issue.id);
      setLogs(data);
    } catch (error) {
      console.error('Failed to add log:', error);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!issue) return;
    try {
      await logApi.delete(logId);
      const data = await logApi.listByIssue(issue.id);
      setLogs(data);
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  };

  const detectLogType = (output: string): ConsoleLog['logType'] => {
    const lower = output.toLowerCase();
    if (lower.includes('error') || lower.includes('exception') || lower.includes('fail')) {
      return 'error';
    }
    if (lower.includes('warn')) {
      return 'warning';
    }
    if (lower.includes('success') || lower.includes('done') || lower.includes('ok')) {
      return 'success';
    }
    return 'info';
  };

  const handleScreenshot = async () => {
    if (!logsContainerRef.current || logs.length === 0) return;

    try {
      const dataUrl = await domToPng(logsContainerRef.current, {
        scale: 2,
        backgroundColor: '#f5f5f0',
      });

      const link = document.createElement('a');
      link.download = `issue-${id}-logs-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('截图失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-600 mb-4">问题不存在</h2>
          <Link to="/" className="text-blue-600 hover:underline">返回列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800 mb-2">{issue.title}</h1>
              {issue.description && (
                <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {issue.location && <span>位置: {issue.location}</span>}
                <div className="flex items-center gap-2">
                  <span>影响:</span>
                  {editingImpact ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={impactValue}
                        onChange={(e) => setImpactValue(e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      />
                      <button
                        onClick={handleImpactSave}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingImpact(false);
                          setImpactValue(issue.impact || '');
                        }}
                        className="text-gray-500 hover:text-gray-600"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => setEditingImpact(true)}
                      className="cursor-pointer hover:text-blue-600 hover:underline"
                      title="点击编辑"
                    >
                      {issue.impact || '(点击添加)'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value as Issue['status'])}
                className={`px-3 py-1.5 text-sm rounded-lg border ${getStatusColor(issue.status)} cursor-pointer`}
              >
                <option value="open">待处理</option>
                <option value="investigating">排查中</option>
                <option value="resolved">已解决</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            控制台线索 ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'configs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            相关配置 ({configs.length})
          </button>
          {activeTab === 'logs' && logs.length > 0 && (
            <button
              onClick={handleScreenshot}
              className="ml-auto px-3 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              截图
            </button>
          )}
        </div>

        {/* Configs Tab */}
        {activeTab === 'configs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">相关配置</h2>
              <button
                onClick={() => setShowConfigForm(!showConfigForm)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showConfigForm ? '取消' : '添加配置'}
              </button>
            </div>

            {showConfigForm && (
              <form onSubmit={handleAddConfig} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setConfigMode('paste')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      configMode === 'paste' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    粘贴解析
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfigMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      configMode === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    手动输入
                  </button>
                </div>

                {configMode === 'paste' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        粘贴配置内容（首行为 cat 命令或文件路径，后续为配置内容）
                      </label>
                      <textarea
                        placeholder="root@host:~# cat /path/to/config.json&#10;{&#10;  &quot;key&quot;: &quot;value&quot;&#10;}"
                        value={configPaste}
                        onChange={(e) => setConfigPaste(e.target.value)}
                        rows={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="备注（可选）- 你对这个配置的看法"
                      value={configForm.note}
                      onChange={(e) => setConfigForm({ ...configForm, note: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="文件路径（如 /etc/nginx/nginx.conf）"
                        value={configForm.filePath}
                        onChange={(e) => {
                          const filePath = e.target.value;
                          const detectedLang = detectLanguageFromPath(filePath);
                          setConfigForm({ ...configForm, filePath, language: detectedLang });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      />
                      <select
                        value={configForm.language}
                        onChange={(e) => setConfigForm({ ...configForm, language: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      placeholder="配置内容"
                      value={configForm.content}
                      onChange={(e) => setConfigForm({ ...configForm, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <input
                      type="text"
                      placeholder="备注（可选）- 你对这个配置的看法"
                      value={configForm.note}
                      onChange={(e) => setConfigForm({ ...configForm, note: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div className="mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    添加
                  </button>
                </div>
              </form>
            )}

            {configs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">暂无配置</div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-gray-700">{config.filePath}</span>
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {SUPPORTED_LANGUAGES.find((l) => l.value === config.language)?.label || config.language}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <CodeBlock code={config.content} language={config.language} />
                    {config.note && (
                      <div className="px-4 py-2 border-t border-gray-200 bg-amber-50">
                        <span className="text-xs text-amber-600 font-medium">备注: </span>
                        <span className="text-sm text-amber-800">{config.note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">控制台线索</h2>
              <button
                onClick={() => setShowLogForm(!showLogForm)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showLogForm ? '取消' : '添加线索'}
              </button>
            </div>

            {showLogForm && (
              <form onSubmit={handleAddLog} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setLogMode('paste')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      logMode === 'paste' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    粘贴解析
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      logMode === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    手动输入
                  </button>
                </div>

                {logMode === 'paste' ? (
                  <div className="space-y-4">
                    <textarea
                      placeholder="粘贴控制台内容，自动解析提示符、命令和输出..."
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <input
                      type="text"
                      placeholder="备注（可选）- 你对这个报错的看法"
                      value={logForm.note}
                      onChange={(e) => setLogForm({ ...logForm, note: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="提示符（如 user@host$）"
                        value={logForm.prompt}
                        onChange={(e) => setLogForm({ ...logForm, prompt: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      />
                      <select
                        value={logForm.logType}
                        onChange={(e) => setLogForm({ ...logForm, logType: e.target.value as ConsoleLog['logType'] })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="success">Success</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="命令"
                      value={logForm.command}
                      onChange={(e) => setLogForm({ ...logForm, command: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <textarea
                      placeholder="输出"
                      value={logForm.output}
                      onChange={(e) => setLogForm({ ...logForm, output: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <input
                      type="text"
                      placeholder="备注（可选）- 你对这个报错的看法"
                      value={logForm.note}
                      onChange={(e) => setLogForm({ ...logForm, note: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                <div className="mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    添加
                  </button>
                </div>
              </form>
            )}

            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">暂无线索</div>
            ) : (
              <div ref={logsContainerRef} className="space-y-4">
                {logs.map((log) => {
                  const colors = getLogColors(log.logType);
                  return (
                    <div
                      key={log.id}
                      className={`rounded-lg border ${colors.border} overflow-hidden`}
                    >
                      <div className={`px-4 py-2 ${colors.header} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          {log.prompt && (
                            <span className="font-mono text-sm text-gray-600">{log.prompt}</span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded ${colors.badge}`}>
                            {log.logType.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString('zh-CN')}
                          </span>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={`px-4 py-3 ${colors.bg}`}>
                        {log.command && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Command</div>
                            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">{log.command}</pre>
                          </div>
                        )}
                        {log.output && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Output</div>
                            <pre className={`font-mono text-sm whitespace-pre-wrap ${colors.text}`}>{log.output}</pre>
                          </div>
                        )}
                      </div>
                      {log.note && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-amber-50">
                          <span className="text-xs text-amber-600 font-medium">备注: </span>
                          <span className="text-sm text-amber-800">{log.note}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
