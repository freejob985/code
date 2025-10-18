import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to remove Bolt badge from build
    {
      name: "remove-bolt-badge",
      transformIndexHtml(html) {
        // Add additional CSS and JS to remove Bolt badge
        return html.replace(
          "</head>",
          `  <style>
    /* إخفاء شارة Bolt - Hide Bolt Badge */
    div[style*="z-index: 2147483647"],
    div[style*="Made in Bolt"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
  </style>
  <script>
    // إزالة شارة Bolt فور تحميل الصفحة
    (function() {
      const removeBolt = () => {
        try {
          document.querySelectorAll('div[style*="z-index: 2147483647"]').forEach(el => el.remove());
          document.querySelectorAll('div').forEach(el => {
            if (el.textContent && el.textContent.includes('Made in Bolt')) el.remove();
          });
        } catch(e) {}
      };
      removeBolt();
      setInterval(removeBolt, 1000);
      if (document.body) new MutationObserver(removeBolt).observe(document.body, {childList: true, subtree: true});
    })();
  </script>
</head>`
        );
      },
    },
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
