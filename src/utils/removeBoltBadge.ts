// إزالة شارة Bolt - Remove Bolt Badge Utility
export const removeBoltBadge = (): void => {
  try {
    // قائمة بالمحددات المختلفة للعثور على شارة Bolt
    const selectors = [
      'div[style*="position: fixed"][style*="bottom: 1rem"][style*="right: 1rem"][style*="z-index: 2147483647"]',
      'div[style*="position:fixed"][style*="bottom:1rem"][style*="right:1rem"][style*="z-index:2147483647"]',
      'div[style*="2147483647"]',
      '.bolt-badge',
      '#bolt-badge',
      '[data-bolt-badge]',
      '.badge[style*="Made in Bolt"]'
    ];
    
    let removed = false;
    
    // إزالة العناصر باستخدام المحددات
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element) {
          element.remove();
          removed = true;
        }
      });
    });
    
    // البحث في جميع العناصر div عن النص "Made in Bolt"
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
      if (div.textContent && div.textContent.includes('Made in Bolt')) {
        div.remove();
        removed = true;
      }
      
      // فحص الـ shadow DOM إذا كان موجوداً
      if (div.shadowRoot) {
        const shadowElements = div.shadowRoot.querySelectorAll('*');
        shadowElements.forEach(shadowEl => {
          if (shadowEl.textContent && shadowEl.textContent.includes('Made in Bolt')) {
            div.remove();
            removed = true;
          }
        });
      }
    });
    
    // البحث في template elements
    const templates = document.querySelectorAll('template[shadowrootmode="open"]');
    templates.forEach(template => {
      if (template.parentElement) {
        template.parentElement.remove();
        removed = true;
      }
    });
    
    // البحث في span elements
    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
      if (span.textContent && span.textContent.includes('Made in Bolt')) {
        // إزالة العنصر الأب إذا كان div
        const parent = span.closest('div');
        if (parent) {
          parent.remove();
          removed = true;
        } else {
          span.remove();
          removed = true;
        }
      }
    });
    
    if (removed) {
      console.log('🚫 Bolt badge removed successfully - تم إزالة شارة Bolt بنجاح');
    }
    
  } catch (error) {
    console.error('❌ Error removing Bolt badge:', error);
  }
};

// دالة لإعداد مراقب DOM للإزالة التلقائية
export const setupBoltBadgeRemover = (): (() => void) => {
  // تشغيل الدالة فوراً
  removeBoltBadge();
  
  // إعداد interval للتحقق كل ثانية
  const interval = setInterval(removeBoltBadge, 1000);
  
  // إعداد MutationObserver لمراقبة التغييرات في DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        removeBoltBadge();
      }
    });
  });
  
  // بدء مراقبة التغييرات
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // إضافة مستمعين للأحداث
  document.addEventListener('DOMContentLoaded', removeBoltBadge);
  window.addEventListener('load', removeBoltBadge);
  document.addEventListener('readystatechange', removeBoltBadge);
  
  // إرجاع دالة التنظيف
  return () => {
    clearInterval(interval);
    observer.disconnect();
    document.removeEventListener('DOMContentLoaded', removeBoltBadge);
    window.removeEventListener('load', removeBoltBadge);
    document.removeEventListener('readystatechange', removeBoltBadge);
  };
};

// تشغيل تلقائي عند تحميل الملف
if (typeof window !== 'undefined') {
  setupBoltBadgeRemover();
}