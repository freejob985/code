// Consistent button styling system for the application
export const buttonStyles = {
  // Primary buttons - main actions
  primary: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Secondary buttons - secondary actions
  secondary: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 border border-gray-300 dark:border-gray-600",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Success buttons - positive actions
  success: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Warning buttons - caution actions
  warning: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Danger buttons - destructive actions
  danger: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Info buttons - informational actions
  info: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500 shadow-sm hover:shadow-md",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Purple buttons - special actions
  purple: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 shadow-sm hover:shadow-md",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Ghost buttons - minimal actions
  ghost: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 focus:ring-gray-500",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    }
  },

  // Icon buttons - icon-only actions
  icon: {
    base: "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus:ring-gray-500",
    sizes: {
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
      xl: "p-4"
    }
  },

  // Tab buttons - navigation tabs
  tab: {
    base: "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    active: "bg-blue-600 text-white shadow-sm",
    inactive: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    }
  },

  // Floating action buttons
  fab: {
    base: "fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    colors: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 hover:shadow-xl",
    sizes: {
      sm: "w-12 h-12",
      md: "w-14 h-14",
      lg: "w-16 h-16"
    }
  }
};

// Helper function to create button classes
export function createButtonClass(
  variant: keyof typeof buttonStyles,
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  isActive?: boolean
): string {
  const style = buttonStyles[variant];
  
  if (variant === 'tab') {
    return `${style.base} ${style.sizes[size]} ${isActive ? style.active : style.inactive}`;
  }
  
  return `${style.base} ${style.colors} ${style.sizes[size]}`;
}

// Predefined button classes for common use cases
export const buttonClasses = {
  // Primary actions
  primary: createButtonClass('primary'),
  primarySm: createButtonClass('primary', 'sm'),
  primaryLg: createButtonClass('primary', 'lg'),
  
  // Secondary actions
  secondary: createButtonClass('secondary'),
  secondarySm: createButtonClass('secondary', 'sm'),
  secondaryLg: createButtonClass('secondary', 'lg'),
  
  // Success actions
  success: createButtonClass('success'),
  successSm: createButtonClass('success', 'sm'),
  successLg: createButtonClass('success', 'lg'),
  
  // Warning actions
  warning: createButtonClass('warning'),
  warningSm: createButtonClass('warning', 'sm'),
  warningLg: createButtonClass('warning', 'lg'),
  
  // Danger actions
  danger: createButtonClass('danger'),
  dangerSm: createButtonClass('danger', 'sm'),
  dangerLg: createButtonClass('danger', 'lg'),
  
  // Info actions
  info: createButtonClass('info'),
  infoSm: createButtonClass('info', 'sm'),
  infoLg: createButtonClass('info', 'lg'),
  
  // Purple actions
  purple: createButtonClass('purple'),
  purpleSm: createButtonClass('purple', 'sm'),
  purpleLg: createButtonClass('purple', 'lg'),
  
  // Ghost actions
  ghost: createButtonClass('ghost'),
  ghostSm: createButtonClass('ghost', 'sm'),
  ghostLg: createButtonClass('ghost', 'lg'),
  
  // Icon buttons
  icon: createButtonClass('icon'),
  iconSm: createButtonClass('icon', 'sm'),
  iconLg: createButtonClass('icon', 'lg'),
  
  // Tab buttons
  tab: (isActive: boolean = false) => createButtonClass('tab', 'md', isActive),
  tabSm: (isActive: boolean = false) => createButtonClass('tab', 'sm', isActive),
  tabLg: (isActive: boolean = false) => createButtonClass('tab', 'lg', isActive),
  
  // FAB buttons
  fab: createButtonClass('fab', 'md'),
  fabSm: createButtonClass('fab', 'sm'),
  fabLg: createButtonClass('fab', 'lg')
};
