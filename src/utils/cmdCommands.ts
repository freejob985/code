import { CmdCommand, CmdCategory } from '../types';

// Default CMD commands for each technology
export const DEFAULT_CMD_COMMANDS: CmdCommand[] = [
  // Laravel Commands
  {
    id: 'laravel-1',
    command: 'php artisan list',
    description: 'عرض جميع الأوامر المتاحة في Laravel Artisan',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-2',
    command: 'php artisan help [command]',
    description: 'عرض شرح مفصل لأمر محدد في Artisan',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-3',
    command: 'php artisan serve',
    description: 'تشغيل الخادم المحلي للتطبيق',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-4',
    command: 'php artisan migrate',
    description: 'تنفيذ عمليات الهجرة لقاعدة البيانات',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-5',
    command: 'php artisan make:controller ControllerName',
    description: 'إنشاء كونترولر جديد في التطبيق',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-6',
    command: 'php artisan make:model ModelName',
    description: 'إنشاء موديل جديد في التطبيق',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-7',
    command: 'php artisan tinker',
    description: 'الدخول لواجهة تفاعل تينكر لاختبار الكود',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-8',
    command: 'php artisan config:cache',
    description: 'تجديد التخزين المؤقت لإعدادات التطبيق',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-9',
    command: 'php artisan make:command CommandName',
    description: 'إنشاء أمر مخصص جديد في Artisan',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-10',
    command: 'php artisan db:seed',
    description: 'تعبئة قاعدة البيانات بالبيانات التجريبية',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-11',
    command: 'php artisan cache:clear',
    description: 'مسح جميع أنواع الكاش في التطبيق',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-12',
    command: 'php artisan route:list',
    description: 'عرض جميع مسارات التطبيق المسجلة',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'laravel-13',
    command: 'php artisan queue:work',
    description: 'تشغيل معالج قائمة الانتظار للمهام المؤجلة',
    category: 'laravel',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Django Commands
  {
    id: 'django-1',
    command: 'django-admin startproject projectname',
    description: 'إنشاء مشروع Django جديد',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'django-2',
    command: 'python manage.py runserver',
    description: 'تشغيل خادم التطوير المحلي',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'django-3',
    command: 'python manage.py startapp appname',
    description: 'إنشاء تطبيق Django جديد داخل المشروع',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'django-4',
    command: 'python manage.py migrate',
    description: 'تنفيذ عمليات الهجرة لقاعدة البيانات',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'django-5',
    command: 'python manage.py makemigrations',
    description: 'إنشاء ملفات الهجرة للتغييرات في النماذج',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'django-6',
    command: 'python manage.py createsuperuser',
    description: 'إنشاء مستخدم مشرف جديد',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'django-7',
    command: 'python manage.py shell',
    description: 'الدخول لواجهة Python التفاعلية مع Django',
    category: 'django',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // React.js Commands
  {
    id: 'react-1',
    command: 'npx create-react-app app-name',
    description: 'إنشاء مشروع React جديد باستخدام Create React App',
    category: 'react',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'react-2',
    command: 'npm start',
    description: 'تشغيل خادم التطوير المحلي',
    category: 'react',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'react-3',
    command: 'npm run build',
    description: 'بناء المشروع للإنتاج',
    category: 'react',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'react-4',
    command: 'npm install package-name',
    description: 'تثبيت مكتبة أو حزمة جديدة',
    category: 'react',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'react-5',
    command: 'npm test',
    description: 'تشغيل اختبارات المشروع',
    category: 'react',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Vue.js Commands
  {
    id: 'vue-1',
    command: 'npm create vue@latest',
    description: 'إنشاء مشروع Vue.js جديد',
    category: 'vue',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vue-2',
    command: 'npm run dev',
    description: 'تشغيل خادم التطوير المحلي',
    category: 'vue',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vue-3',
    command: 'npm run build',
    description: 'إنتاج بناء المشروع للإنتاج',
    category: 'vue',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vue-4',
    command: 'npm install package-name',
    description: 'تثبيت مكتبة أو حزمة جديدة',
    category: 'vue',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vue-5',
    command: 'npm test',
    description: 'تشغيل اختبارات المشروع',
    category: 'vue',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Node.js Commands
  {
    id: 'node-1',
    command: 'node filename.js',
    description: 'تشغيل ملف JavaScript باستخدام Node.js',
    category: 'node',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'node-2',
    command: 'npm init',
    description: 'تهيئة مشروع Node.js جديد',
    category: 'node',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'node-3',
    command: 'npm install package-name',
    description: 'تثبيت مكتبة أو حزمة جديدة',
    category: 'node',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'node-4',
    command: 'npm update',
    description: 'تحديث جميع الحزم المثبتة',
    category: 'node',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'node-5',
    command: 'nodemon filename.js',
    description: 'تشغيل nodemon لمراقبة التغييرات وإعادة التشغيل التلقائي',
    category: 'node',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'node-6',
    command: 'npm run script-name',
    description: 'تشغيل السكريبتات المعرفة في package.json',
    category: 'node',
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// CMD Categories configuration
export const CMD_CATEGORIES: CmdCategory[] = [
  {
    id: 'laravel',
    name: 'Laravel',
    slug: 'laravel',
    icon: '🐘',
    color: '#FF2D20',
    commands: DEFAULT_CMD_COMMANDS.filter(cmd => cmd.category === 'laravel')
  },
  {
    id: 'django',
    name: 'Django',
    slug: 'django',
    icon: '🐍',
    color: '#092E20',
    commands: DEFAULT_CMD_COMMANDS.filter(cmd => cmd.category === 'django')
  },
  {
    id: 'react',
    name: 'React.js',
    slug: 'react',
    icon: '⚛️',
    color: '#61DAFB',
    commands: DEFAULT_CMD_COMMANDS.filter(cmd => cmd.category === 'react')
  },
  {
    id: 'vue',
    name: 'Vue.js',
    slug: 'vue',
    icon: '💚',
    color: '#4FC08D',
    commands: DEFAULT_CMD_COMMANDS.filter(cmd => cmd.category === 'vue')
  },
  {
    id: 'node',
    name: 'Node.js',
    slug: 'node',
    icon: '🟢',
    color: '#339933',
    commands: DEFAULT_CMD_COMMANDS.filter(cmd => cmd.category === 'node')
  }
];

// Utility functions
export const getCommandsByCategory = (category: string): CmdCommand[] => {
  return DEFAULT_CMD_COMMANDS.filter(cmd => cmd.category === category);
};

export const searchCommands = (query: string, category?: string): CmdCommand[] => {
  let commands = DEFAULT_CMD_COMMANDS;
  
  if (category) {
    commands = commands.filter(cmd => cmd.category === category);
  }
  
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    commands = commands.filter(cmd => 
      cmd.command.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm)
    );
  }
  
  return commands;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
