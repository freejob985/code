// إزالة شارة Bolt بشكل دوري - Remove Bolt Badge Periodically
(function() {
    'use strict';
    
    // دالة إزالة شارة Bolt
    function removeBoltBadge() {
        try {
            // البحث عن العنصر بطرق مختلفة
            const selectors = [
                'div[style*="position: fixed"][style*="bottom: 1rem"][style*="right: 1rem"][style*="z-index: 2147483647"]',
                'div[style*="position:fixed"][style*="bottom:1rem"][style*="right:1rem"][style*="z-index:2147483647"]',
                'div[style*="2147483647"]',
                '.bolt-badge',
                '#bolt-badge'
            ];
            
            let removed = false;
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        element.remove();
                        removed = true;
                    }
                });
            });
            
            // البحث عن العناصر التي تحتوي على "Made in Bolt"
            const allDivs = document.querySelectorAll('div');
            allDivs.forEach(div => {
                if (div.textContent && div.textContent.includes('Made in Bolt')) {
                    div.remove();
                    removed = true;
                }
                
                // فحص الـ shadow DOM
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
            
            if (removed) {
                console.log('Bolt badge removed successfully - تم إزالة شارة Bolt بنجاح');
            }
            
        } catch (error) {
            console.error('Error removing Bolt badge:', error);
        }
    }
    
    // تشغيل الدالة فور تحميل الصفحة
    removeBoltBadge();
    
    // تشغيل الدالة كل ثانية للتأكد من الإزالة المستمرة
    setInterval(removeBoltBadge, 1000);
    
    // تشغيل الدالة عند تغيير DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                removeBoltBadge();
            }
        });
    });
    
    // مراقبة التغييرات في DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // تشغيل الدالة عند تحميل المحتوى
    document.addEventListener('DOMContentLoaded', removeBoltBadge);
    
    // تشغيل الدالة عند تحميل النافذة
    window.addEventListener('load', removeBoltBadge);
    
    // تشغيل الدالة عند تغيير الحالة
    document.addEventListener('readystatechange', removeBoltBadge);
    
})();