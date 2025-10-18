// إزالة شارة Bolt البسيط - Simple Bolt Badge Remover
(function() {
    'use strict';
    
    function removeBoltBadge() {
        try {
            // إزالة العناصر بناءً على z-index العالي
            const highZElements = document.querySelectorAll('div[style*="2147483647"]');
            highZElements.forEach(el => el.remove());
            
            // إزالة العناصر المثبتة في الأسفل اليمين
            const fixedElements = document.querySelectorAll('div[style*="position: fixed"][style*="bottom"][style*="right"]');
            fixedElements.forEach(el => {
                if (el.textContent && el.textContent.includes('Made in Bolt')) {
                    el.remove();
                }
            });
            
            // إزالة العناصر التي تحتوي على النص مباشرة
            const allDivs = document.querySelectorAll('div');
            allDivs.forEach(div => {
                if (div.textContent && div.textContent.includes('Made in Bolt')) {
                    div.remove();
                }
            });
            
            // إزالة العناصر مع scale: 0.8
            const scaledElements = document.querySelectorAll('div[style*="scale: 0.8"]');
            scaledElements.forEach(el => {
                if (el.textContent && el.textContent.includes('Made in Bolt')) {
                    el.remove();
                }
            });
            
            // إزالة template elements
            const templates = document.querySelectorAll('template');
            templates.forEach(template => {
                if (template.getAttribute('shadowrootmode') === 'open') {
                    const parent = template.parentElement;
                    if (parent) parent.remove();
                }
            });
            
        } catch (error) {
            console.warn('Bolt remover error:', error);
        }
    }
    
    // تشغيل فوري
    removeBoltBadge();
    
    // تشغيل دوري
    setInterval(removeBoltBadge, 1000);
    
    // مراقبة التغييرات
    function setupObserver() {
        if (typeof MutationObserver !== 'undefined' && document.body) {
            const observer = new MutationObserver(removeBoltBadge);
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            // إعادة المحاولة بعد قليل إذا لم يكن body جاهزاً
            setTimeout(setupObserver, 100);
        }
    }
    setupObserver();
    
    // أحداث التحميل
    document.addEventListener('DOMContentLoaded', removeBoltBadge);
    window.addEventListener('load', removeBoltBadge);
    
})();