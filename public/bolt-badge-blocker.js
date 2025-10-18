// حاجب شارة Bolt - Bolt Badge Blocker
// هذا السكريبت يعمل على منع ظهور شارة Bolt نهائياً

(function() {
    'use strict';
    
    // منع إنشاء العناصر التي تحتوي على شارة Bolt
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        // مراقبة العناصر الجديدة
        if (element instanceof HTMLElement) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' || mutation.type === 'childList') {
                        if (element.textContent && element.textContent.includes('Made in Bolt')) {
                            element.remove();
                        }
                        if (element.style && element.style.zIndex === '2147483647') {
                            element.remove();
                        }
                    }
                });
            });
            
            observer.observe(element, {
                attributes: true,
                childList: true,
                subtree: true
            });
        }
        
        return element;
    };
    
    // منع إضافة العناصر التي تحتوي على شارة Bolt
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
        if (child instanceof HTMLElement) {
            // فحص المحتوى
            if (child.textContent && child.textContent.includes('Made in Bolt')) {
                console.log('🚫 Blocked Bolt badge element from being added');
                return child; // إرجاع العنصر دون إضافته
            }
            
            // فحص الستايل
            if (child.style && child.style.zIndex === '2147483647') {
                console.log('🚫 Blocked high z-index element (likely Bolt badge)');
                return child;
            }
            
            // فحص الخصائص
            if (child.getAttribute && child.getAttribute('style')) {
                const style = child.getAttribute('style');
                if (style.includes('z-index: 2147483647') || 
                    style.includes('position: fixed') && style.includes('bottom: 1rem') && style.includes('right: 1rem')) {
                    console.log('🚫 Blocked Bolt badge based on style attributes');
                    return child;
                }
            }
        }
        
        return originalAppendChild.call(this, child);
    };
    
    // منع إدراج HTML يحتوي على شارة Bolt
    const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value) {
            if (typeof value === 'string' && value.includes('Made in Bolt')) {
                console.log('🚫 Blocked innerHTML containing Bolt badge');
                return;
            }
            originalSetInnerHTML.call(this, value);
        },
        get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get
    });
    
    // دالة تنظيف شاملة
    function deepCleanBoltBadge() {
        try {
            // إزالة العناصر المشبوهة بطريقة منفصلة
            const selectors = [
                'div[style*="z-index: 2147483647"]',
                'div[style*="position: fixed"][style*="bottom"]',
                'template[shadowrootmode="open"]'
            ];
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        el.remove();
                        console.log('🚫 Removed suspicious element:', el);
                    });
                } catch (e) {
                    console.warn('Could not remove elements with selector:', selector, e);
                }
            });
            
            // فحص جميع العناصر للنص المشبوه
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Made in Bolt')) {
                    textNodes.push(node);
                }
            }
            
            textNodes.forEach(textNode => {
                try {
                    const parent = textNode.parentElement;
                    if (parent) {
                        parent.remove();
                        console.log('🚫 Removed parent of text node containing "Made in Bolt"');
                    }
                } catch (e) {
                    console.warn('Could not remove text node parent:', e);
                }
            });
            
        } catch (error) {
            console.error('Error in deepCleanBoltBadge:', error);
        }
    }
    
    // تشغيل التنظيف بشكل دوري
    setInterval(deepCleanBoltBadge, 500);
    
    // تشغيل التنظيف عند الأحداث المهمة
    document.addEventListener('DOMContentLoaded', deepCleanBoltBadge);
    window.addEventListener('load', deepCleanBoltBadge);
    
    // مراقبة إضافة عناصر جديدة
    const globalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node instanceof HTMLElement) {
                        if (node.textContent && node.textContent.includes('Made in Bolt')) {
                            node.remove();
                            console.log('🚫 Removed newly added Bolt badge element');
                        }
                    }
                });
            }
        });
    });
    
    globalObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('🛡️ Bolt Badge Blocker activated - حاجب شارة Bolt مُفعل');
    
})();