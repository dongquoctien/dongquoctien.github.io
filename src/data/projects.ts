export type Project = {
  name: string;
  title: string;
  description: string;
  stack: string[];
  tier: 'featured' | 'mcp' | 'tools' | 'experiments';
  year: number;
  links: {
    repo?: string;
    demo?: string;
  };
};

export const projects: Project[] = [
  // ───── Featured ─────
  {
    name: 'chatlingua',
    title: 'ChatLingua',
    description:
      'Conversational language-learning companion. Practice real dialogue with AI, get corrections in context.',
    stack: ['TypeScript', 'AI', 'Web'],
    tier: 'featured',
    year: 2026,
    links: {
      repo: 'https://github.com/dongquoctien/ChatLingua',
      demo: 'https://chatlingua.online',
    },
  },
  {
    name: 'qa-annotator-extension',
    title: 'QA Annotator',
    description:
      'Browser extension for QA engineers. Pick DOM elements, resolve nearest Figma frame, file Jira issues — without leaving the page.',
    stack: ['JavaScript', 'Chrome Extension', 'Figma API', 'Jira'],
    tier: 'featured',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/qa-annotator-extension' },
  },
  {
    name: 'loto',
    title: 'Loto Vietnam',
    description:
      'Lô tô bingo game faithful to the Vietnamese street-fair version, multiplayer-ready.',
    stack: ['TypeScript', 'Game', 'Realtime'],
    tier: 'featured',
    year: 2026,
    links: {
      repo: 'https://github.com/dongquoctien/loto',
      demo: 'https://loto.dongquoctien.online',
    },
  },
  {
    name: 'homnayangi',
    title: 'Hôm Nay Ăn Gì?',
    description:
      'Decision helper for the eternal Vietnamese question — what to eat today.',
    stack: ['TypeScript', 'Web'],
    tier: 'featured',
    year: 2026,
    links: {
      repo: 'https://github.com/dongquoctien/homnayangi',
      demo: 'https://dongquoctien.github.io/homnayangi/',
    },
  },
  {
    name: 'mcp-planner-microsoft',
    title: 'MCP Planner Microsoft',
    description:
      'Model Context Protocol server giving AI assistants access to Microsoft Planner via Graph API.',
    stack: ['TypeScript', 'MCP', 'Microsoft Graph'],
    tier: 'featured',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/mcp-planner-microsoft' },
  },

  // ───── MCP work ─────
  {
    name: 'mcp-server-mysql',
    title: 'MCP Server — MySQL',
    description:
      'Read-only MySQL access for LLMs: schema introspection plus safe query execution.',
    stack: ['MCP', 'MySQL'],
    tier: 'mcp',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/mcp-server-mysql' },
  },
  {
    name: 'ms-365-mcp-server',
    title: 'MCP Server — Microsoft 365',
    description: 'Microsoft 365 + Graph API access for AI assistants.',
    stack: ['MCP', 'Microsoft 365'],
    tier: 'mcp',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/ms-365-mcp-server' },
  },
  {
    name: 'teams-mcp',
    title: 'MCP Server — Teams',
    description: 'Microsoft Teams messaging, search, and user management for agents.',
    stack: ['MCP', 'Teams', 'Graph API'],
    tier: 'mcp',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/teams-mcp' },
  },
  {
    name: 'bitbucket-mcp',
    title: 'MCP Server — Bitbucket',
    description: 'Bitbucket Cloud and Server APIs through MCP — PRs, pipelines, comments.',
    stack: ['MCP', 'Bitbucket'],
    tier: 'mcp',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/bitbucket-mcp' },
  },
  {
    name: 'mcp-grafana',
    title: 'MCP Server — Grafana',
    description: 'Query Grafana dashboards and metrics from an LLM.',
    stack: ['MCP', 'Grafana'],
    tier: 'mcp',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/mcp-grafana' },
  },
  {
    name: 'mcp-server-redmine',
    title: 'MCP Server — Redmine',
    description: 'Issue tracking and time entries for Redmine via MCP.',
    stack: ['MCP', 'TypeScript', 'Redmine'],
    tier: 'mcp',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/mcp-server-redmine' },
  },

  // ───── Tools ─────
  {
    name: 'svg-image-viewer',
    title: 'SVG Image Viewer',
    description:
      'Browse local SVG folders and generate ready-to-paste HTML/SCSS code snippets.',
    stack: ['JavaScript', 'Web'],
    tier: 'tools',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/SVG-Image-Viewer' },
  },
  {
    name: 'html-inline-style-conversion',
    title: 'HTML Inline Style Conversion',
    description:
      'VS Code extension that converts inline HTML styles into clean class-based stylesheets.',
    stack: ['TypeScript', 'VS Code Extension'],
    tier: 'tools',
    year: 2024,
    links: {
      repo: 'https://github.com/dongquoctien/html-inline-style-conversion',
      demo: 'https://marketplace.visualstudio.com/items?itemName=itdongquoctien.html-inline-style-conversion',
    },
  },
  {
    name: 'pdf-to-md',
    title: 'PDF → Markdown',
    description: 'Convert PDF documents to clean Markdown for LLM ingestion.',
    stack: ['Python'],
    tier: 'tools',
    year: 2026,
    links: { repo: 'https://github.com/dongquoctien/pdf-to-md' },
  },

  // ───── Experiments ─────
  {
    name: 'esp32-lab',
    title: 'ESP32 Lab',
    description: 'Embedded experiments on ESP32 — sensors, BLE, firmware sketches.',
    stack: ['C++', 'Embedded'],
    tier: 'experiments',
    year: 2025,
    links: { repo: 'https://github.com/dongquoctien/esp32-lab' },
  },
  {
    name: 'n8n-teams',
    title: 'n8n × Teams',
    description: 'Workflow automation experiments with n8n and Microsoft Teams.',
    stack: ['n8n', 'Automation'],
    tier: 'experiments',
    year: 2025,
    links: { repo: 'https://github.com/dongquoctien/n8n-teams' },
  },
  {
    name: 'figma-mcp',
    title: 'Figma MCP',
    description: 'Bridging Figma layouts to AI agents — design-to-code experiments.',
    stack: ['JavaScript', 'MCP', 'Figma'],
    tier: 'experiments',
    year: 2025,
    links: { repo: 'https://github.com/dongquoctien/figma-mcp' },
  },
];

export const TIER_LABELS: Record<Project['tier'], string> = {
  featured: 'Featured',
  mcp: 'MCP servers',
  tools: 'Tools',
  experiments: 'Experiments',
};

export const TIER_ORDER: Project['tier'][] = ['featured', 'mcp', 'tools', 'experiments'];
