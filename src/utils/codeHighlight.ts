import hljs from 'highlight.js/lib/core';

// Import specific languages to reduce bundle size
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import php from 'highlight.js/lib/languages/php';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import django from 'highlight.js/lib/languages/django';
import ruby from 'highlight.js/lib/languages/ruby';
import kotlin from 'highlight.js/lib/languages/kotlin';
import swift from 'highlight.js/lib/languages/swift';
import scala from 'highlight.js/lib/languages/scala';
import perl from 'highlight.js/lib/languages/perl';
import r from 'highlight.js/lib/languages/r';
import matlab from 'highlight.js/lib/languages/matlab';
import dart from 'highlight.js/lib/languages/dart';
import elixir from 'highlight.js/lib/languages/elixir';
import haskell from 'highlight.js/lib/languages/haskell';
import lua from 'highlight.js/lib/languages/lua';
import powershell from 'highlight.js/lib/languages/powershell';
import vim from 'highlight.js/lib/languages/vim';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('php', php);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('django', django);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('r', r);
hljs.registerLanguage('matlab', matlab);
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('elixir', elixir);
hljs.registerLanguage('haskell', haskell);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('vim', vim);

// Language categories with colors and icons
export const LANGUAGE_CATEGORIES = {
  frontend: {
    name: 'Frontend Development',
    color: '#3B82F6',
    icon: '🎨',
    languages: ['javascript', 'typescript', 'html', 'css', 'json', 'dart']
  },
  backend: {
    name: 'Backend Development',
    color: '#10B981',
    icon: '⚙️',
    languages: ['python', 'django', 'java', 'php', 'csharp', 'go', 'rust', 'ruby', 'kotlin', 'scala', 'elixir', 'haskell']
  },
  mobile: {
    name: 'Mobile Development',
    color: '#F59E0B',
    icon: '📱',
    languages: ['swift', 'kotlin', 'java', 'dart']
  },
  database: {
    name: 'Database Management',
    color: '#8B5CF6',
    icon: '🗄️',
    languages: ['sql']
  },
  devops: {
    name: 'DevOps & Automation',
    color: '#EF4444',
    icon: '🚀',
    languages: ['bash', 'json', 'powershell', 'vim']
  },
  data_science: {
    name: 'Data Science & Analytics',
    color: '#06B6D4',
    icon: '📊',
    languages: ['python', 'r', 'matlab', 'scala']
  },
  systems: {
    name: 'Systems Programming',
    color: '#84CC16',
    icon: '🔧',
    languages: ['cpp', 'rust', 'go', 'perl', 'lua']
  },
  frameworks: {
    name: 'Web Frameworks',
    color: '#F97316',
    icon: '🏗️',
    languages: ['django', 'laravel', 'nodejs', 'codeigniter']
  }
};

export const SUPPORTED_LANGUAGES = [
  // Frontend
  { value: 'javascript', label: 'JavaScript', category: 'frontend', framework: 'Vanilla JS' },
  { value: 'typescript', label: 'TypeScript', category: 'frontend', framework: 'TypeScript' },
  { value: 'html', label: 'HTML', category: 'frontend', framework: 'HTML5' },
  { value: 'css', label: 'CSS', category: 'frontend', framework: 'CSS3' },
  
  // Backend
  { value: 'python', label: 'Python', category: 'backend', framework: 'Python' },
  { value: 'django', label: 'Django', category: 'backend', framework: 'Django' },
  { value: 'laravel', label: 'Laravel', category: 'frameworks', framework: 'Laravel' },
  { value: 'nodejs', label: 'Node.js', category: 'frameworks', framework: 'Node.js' },
  { value: 'codeigniter', label: 'CodeIgniter', category: 'frameworks', framework: 'CodeIgniter' },
  { value: 'java', label: 'Java', category: 'backend', framework: 'Spring Boot' },
  { value: 'php', label: 'PHP', category: 'backend', framework: 'Laravel' },
  { value: 'csharp', label: 'C#', category: 'backend', framework: '.NET Core' },
  { value: 'go', label: 'Go', category: 'backend', framework: 'Gin/Echo' },
  { value: 'rust', label: 'Rust', category: 'backend', framework: 'Actix/Rocket' },
  { value: 'ruby', label: 'Ruby', category: 'backend', framework: 'Ruby on Rails' },
  { value: 'kotlin', label: 'Kotlin', category: 'backend', framework: 'Spring Boot' },
  { value: 'scala', label: 'Scala', category: 'backend', framework: 'Play Framework' },
  { value: 'elixir', label: 'Elixir', category: 'backend', framework: 'Phoenix' },
  { value: 'haskell', label: 'Haskell', category: 'backend', framework: 'Haskell' },
  
  // Mobile
  { value: 'swift', label: 'Swift', category: 'mobile', framework: 'iOS' },
  { value: 'dart', label: 'Dart', category: 'mobile', framework: 'Flutter' },
  
  // Database
  { value: 'sql', label: 'SQL', category: 'database', framework: 'SQL' },
  
  // DevOps
  { value: 'bash', label: 'Bash', category: 'devops', framework: 'Shell Scripts' },
  { value: 'powershell', label: 'PowerShell', category: 'devops', framework: 'PowerShell' },
  { value: 'vim', label: 'Vim Script', category: 'devops', framework: 'Vim' },
  { value: 'json', label: 'JSON', category: 'devops', framework: 'Configuration' },
  
  // Data Science
  { value: 'r', label: 'R', category: 'data_science', framework: 'R' },
  { value: 'matlab', label: 'MATLAB', category: 'data_science', framework: 'MATLAB' },
  
  // Systems
  { value: 'cpp', label: 'C++', category: 'systems', framework: 'C++' },
  { value: 'perl', label: 'Perl', category: 'systems', framework: 'Perl' },
  { value: 'lua', label: 'Lua', category: 'systems', framework: 'Lua' },
];

export function highlightCode(code: string, language: string): string {
  try {
    if (hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }
    return hljs.highlightAuto(code).value;
  } catch {
    return code;
  }
}

export function getLanguageExtension(language: string): string {
  const extensions: { [key: string]: string } = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    django: 'py',
    java: 'java',
    php: 'php',
    cpp: 'cpp',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    kotlin: 'kt',
    swift: 'swift',
    scala: 'scala',
    perl: 'pl',
    r: 'r',
    matlab: 'm',
    dart: 'dart',
    elixir: 'ex',
    haskell: 'hs',
    lua: 'lua',
    powershell: 'ps1',
    vim: 'vim',
    laravel: 'php',
    nodejs: 'js',
    codeigniter: 'php',
    html: 'html',
    css: 'css',
    sql: 'sql',
    json: 'json',
    bash: 'sh',
  };
  return extensions[language] || 'txt';
}

export function getLanguageCategory(language: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.value === language);
  return lang?.category || 'other';
}

export function getCategoryColor(category: string): string {
  return LANGUAGE_CATEGORIES[category as keyof typeof LANGUAGE_CATEGORIES]?.color || '#6B7280';
}

export function getCategoryIcon(category: string): string {
  return LANGUAGE_CATEGORIES[category as keyof typeof LANGUAGE_CATEGORIES]?.icon || '📄';
}