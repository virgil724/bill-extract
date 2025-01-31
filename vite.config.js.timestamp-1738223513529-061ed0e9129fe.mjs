// vite.config.js
import { defineConfig } from "file:///C:/Users/virgi/Documents/bill-extract/node_modules/.pnpm/vite@4.5.9_@types+node@22.12.0/node_modules/vite/dist/node/index.js";
import { crx } from "file:///C:/Users/virgi/Documents/bill-extract/node_modules/.pnpm/@crxjs+vite-plugin@2.0.0-beta.30/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import vue from "file:///C:/Users/virgi/Documents/bill-extract/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@4.5.9_@types+node@22.12.0__vue@3.5.13/node_modules/@vitejs/plugin-vue/dist/index.mjs";

// src/manifest.js
import { defineManifest } from "file:///C:/Users/virgi/Documents/bill-extract/node_modules/.pnpm/@crxjs+vite-plugin@2.0.0-beta.30/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// package.json
var package_default = {
  name: "bill-extract",
  displayName: "bill-extract",
  version: "0.0.0",
  author: "virgil246",
  description: "",
  type: "module",
  license: "MIT",
  keywords: [
    "chrome-extension",
    "vue",
    "vite",
    "create-chrome-ext"
  ],
  engines: {
    node: ">=14.18.0"
  },
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    fmt: "prettier --write '**/*.{vue,js,json,css,scss,md}'",
    zip: "npm run build && node src/zip.js"
  },
  dependencies: {
    vue: "^3.2.37"
  },
  devDependencies: {
    "@crxjs/vite-plugin": "^2.0.0-beta.19",
    "@vitejs/plugin-vue": "^4.4.0",
    gulp: "^4.0.2",
    "gulp-zip": "^6.0.0",
    prettier: "^3.0.3",
    vite: "^4.4.11"
  }
};

// src/manifest.js
var isDev = process.env.NODE_ENV == "development";
var manifest_default = defineManifest({
  name: `${package_default.displayName || package_default.name}${isDev ? ` \u27A1\uFE0F Dev` : ""}`,
  description: package_default.description,
  version: package_default.version,
  manifest_version: 3,
  icons: {
    16: "img/logo-16.png",
    32: "img/logo-34.png",
    48: "img/logo-48.png",
    128: "img/logo-128.png"
  },
  action: {
    default_popup: "popup.html",
    default_icon: "img/logo-48.png"
  },
  options_page: "options.html",
  devtools_page: "devtools.html",
  background: {
    service_worker: "src/background/index.js",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/contentScript/index.js"]
    }
  ],
  side_panel: {
    default_path: "sidepanel.html"
  },
  web_accessible_resources: [
    {
      resources: ["img/logo-16.png", "img/logo-34.png", "img/logo-48.png", "img/logo-128.png"],
      matches: []
    }
  ],
  permissions: ["sidePanel", "storage"],
  chrome_url_overrides: {
    newtab: "newtab.html"
  }
});

// vite.config.js
var vite_config_default = defineConfig(({ mode }) => {
  const production = mode === "production";
  return {
    build: {
      emptyOutDir: true,
      outDir: "build",
      rollupOptions: {
        output: {
          chunkFileNames: "assets/chunk-[hash].js"
        }
      }
    },
    plugins: [crx({ manifest: manifest_default }), vue()]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL21hbmlmZXN0LmpzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHZpcmdpXFxcXERvY3VtZW50c1xcXFxiaWxsLWV4dHJhY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHZpcmdpXFxcXERvY3VtZW50c1xcXFxiaWxsLWV4dHJhY3RcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3ZpcmdpL0RvY3VtZW50cy9iaWxsLWV4dHJhY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgY3J4IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9zcmMvbWFuaWZlc3QuanMnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IHByb2R1Y3Rpb24gPSBtb2RlID09PSAncHJvZHVjdGlvbidcblxuICByZXR1cm4ge1xuICAgIGJ1aWxkOiB7XG4gICAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICAgIG91dERpcjogJ2J1aWxkJyxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvY2h1bmstW2hhc2hdLmpzJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbY3J4KHsgbWFuaWZlc3QgfSksIHZ1ZSgpXSxcbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdmlyZ2lcXFxcRG9jdW1lbnRzXFxcXGJpbGwtZXh0cmFjdFxcXFxzcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHZpcmdpXFxcXERvY3VtZW50c1xcXFxiaWxsLWV4dHJhY3RcXFxcc3JjXFxcXG1hbmlmZXN0LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy92aXJnaS9Eb2N1bWVudHMvYmlsbC1leHRyYWN0L3NyYy9tYW5pZmVzdC5qc1wiO2ltcG9ydCB7IGRlZmluZU1hbmlmZXN0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IHBhY2thZ2VEYXRhIGZyb20gJy4uL3BhY2thZ2UuanNvbicgYXNzZXJ0IHsgdHlwZTogJ2pzb24nIH1cblxuY29uc3QgaXNEZXYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PSAnZGV2ZWxvcG1lbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZU1hbmlmZXN0KHtcbiAgbmFtZTogYCR7cGFja2FnZURhdGEuZGlzcGxheU5hbWUgfHwgcGFja2FnZURhdGEubmFtZX0ke2lzRGV2ID8gYCBcdTI3QTFcdUZFMEYgRGV2YCA6ICcnfWAsXG4gIGRlc2NyaXB0aW9uOiBwYWNrYWdlRGF0YS5kZXNjcmlwdGlvbixcbiAgdmVyc2lvbjogcGFja2FnZURhdGEudmVyc2lvbixcbiAgbWFuaWZlc3RfdmVyc2lvbjogMyxcbiAgaWNvbnM6IHtcbiAgICAxNjogJ2ltZy9sb2dvLTE2LnBuZycsXG4gICAgMzI6ICdpbWcvbG9nby0zNC5wbmcnLFxuICAgIDQ4OiAnaW1nL2xvZ28tNDgucG5nJyxcbiAgICAxMjg6ICdpbWcvbG9nby0xMjgucG5nJyxcbiAgfSxcbiAgYWN0aW9uOiB7XG4gICAgZGVmYXVsdF9wb3B1cDogJ3BvcHVwLmh0bWwnLFxuICAgIGRlZmF1bHRfaWNvbjogJ2ltZy9sb2dvLTQ4LnBuZycsXG4gIH0sXG4gIG9wdGlvbnNfcGFnZTogJ29wdGlvbnMuaHRtbCcsXG4gIGRldnRvb2xzX3BhZ2U6ICdkZXZ0b29scy5odG1sJyxcbiAgYmFja2dyb3VuZDoge1xuICAgIHNlcnZpY2Vfd29ya2VyOiAnc3JjL2JhY2tncm91bmQvaW5kZXguanMnLFxuICAgIHR5cGU6ICdtb2R1bGUnLFxuICB9LFxuICBjb250ZW50X3NjcmlwdHM6IFtcbiAgICB7XG4gICAgICBtYXRjaGVzOiBbJ2h0dHA6Ly8qLyonLCAnaHR0cHM6Ly8qLyonXSxcbiAgICAgIGpzOiBbJ3NyYy9jb250ZW50U2NyaXB0L2luZGV4LmpzJ10sXG4gICAgfSxcbiAgXSxcbiAgc2lkZV9wYW5lbDoge1xuICAgIGRlZmF1bHRfcGF0aDogJ3NpZGVwYW5lbC5odG1sJyxcbiAgfSxcbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbXG4gICAge1xuICAgICAgcmVzb3VyY2VzOiBbJ2ltZy9sb2dvLTE2LnBuZycsICdpbWcvbG9nby0zNC5wbmcnLCAnaW1nL2xvZ28tNDgucG5nJywgJ2ltZy9sb2dvLTEyOC5wbmcnXSxcbiAgICAgIG1hdGNoZXM6IFtdLFxuICAgIH0sXG4gIF0sXG4gIHBlcm1pc3Npb25zOiBbJ3NpZGVQYW5lbCcsICdzdG9yYWdlJ10sXG4gIGNocm9tZV91cmxfb3ZlcnJpZGVzOiB7XG4gICAgbmV3dGFiOiAnbmV3dGFiLmh0bWwnLFxuICB9LFxufSlcbiIsICJ7XG4gIFwibmFtZVwiOiBcImJpbGwtZXh0cmFjdFwiLFxuICBcImRpc3BsYXlOYW1lXCI6IFwiYmlsbC1leHRyYWN0XCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMC4wXCIsXG4gIFwiYXV0aG9yXCI6IFwidmlyZ2lsMjQ2XCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcImNocm9tZS1leHRlbnNpb25cIixcbiAgICBcInZ1ZVwiLFxuICAgIFwidml0ZVwiLFxuICAgIFwiY3JlYXRlLWNocm9tZS1leHRcIlxuICBdLFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIj49MTQuMTguMFwiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcImZtdFwiOiBcInByZXR0aWVyIC0td3JpdGUgJyoqLyoue3Z1ZSxqcyxqc29uLGNzcyxzY3NzLG1kfSdcIixcbiAgICBcInppcFwiOiBcIm5wbSBydW4gYnVpbGQgJiYgbm9kZSBzcmMvemlwLmpzXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwidnVlXCI6IFwiXjMuMi4zN1wiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjcnhqcy92aXRlLXBsdWdpblwiOiBcIl4yLjAuMC1iZXRhLjE5XCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNC40LjBcIixcbiAgICBcImd1bHBcIjogXCJeNC4wLjJcIixcbiAgICBcImd1bHAtemlwXCI6IFwiXjYuMC4wXCIsXG4gICAgXCJwcmV0dGllclwiOiBcIl4zLjAuM1wiLFxuICAgIFwidml0ZVwiOiBcIl40LjQuMTFcIlxuICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUyxTQUFTLG9CQUFvQjtBQUN4VSxTQUFTLFdBQVc7QUFDcEIsT0FBTyxTQUFTOzs7QUNGbVMsU0FBUyxzQkFBc0I7OztBQ0FsVjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsYUFBZTtBQUFBLEVBQ2YsU0FBVztBQUFBLEVBQ1gsUUFBVTtBQUFBLEVBQ1YsYUFBZTtBQUFBLEVBQ2YsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsVUFBWTtBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFDVCxNQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBVztBQUFBLElBQ1QsS0FBTztBQUFBLElBQ1AsT0FBUztBQUFBLElBQ1QsU0FBVztBQUFBLElBQ1gsS0FBTztBQUFBLElBQ1AsS0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGNBQWdCO0FBQUEsSUFDZCxLQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDakIsc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsTUFBUTtBQUFBLElBQ1IsWUFBWTtBQUFBLElBQ1osVUFBWTtBQUFBLElBQ1osTUFBUTtBQUFBLEVBQ1Y7QUFDRjs7O0FEaENBLElBQU0sUUFBUSxRQUFRLElBQUksWUFBWTtBQUV0QyxJQUFPLG1CQUFRLGVBQWU7QUFBQSxFQUM1QixNQUFNLEdBQUcsZ0JBQVksZUFBZSxnQkFBWSxJQUFJLEdBQUcsUUFBUSxzQkFBWSxFQUFFO0FBQUEsRUFDN0UsYUFBYSxnQkFBWTtBQUFBLEVBQ3pCLFNBQVMsZ0JBQVk7QUFBQSxFQUNyQixrQkFBa0I7QUFBQSxFQUNsQixPQUFPO0FBQUEsSUFDTCxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixLQUFLO0FBQUEsRUFDUDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxjQUFjO0FBQUEsRUFDZCxlQUFlO0FBQUEsRUFDZixZQUFZO0FBQUEsSUFDVixnQkFBZ0I7QUFBQSxJQUNoQixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsaUJBQWlCO0FBQUEsSUFDZjtBQUFBLE1BQ0UsU0FBUyxDQUFDLGNBQWMsYUFBYTtBQUFBLE1BQ3JDLElBQUksQ0FBQyw0QkFBNEI7QUFBQSxJQUNuQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFlBQVk7QUFBQSxJQUNWLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsMEJBQTBCO0FBQUEsSUFDeEI7QUFBQSxNQUNFLFdBQVcsQ0FBQyxtQkFBbUIsbUJBQW1CLG1CQUFtQixrQkFBa0I7QUFBQSxNQUN2RixTQUFTLENBQUM7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUFBLEVBQ0EsYUFBYSxDQUFDLGFBQWEsU0FBUztBQUFBLEVBQ3BDLHNCQUFzQjtBQUFBLElBQ3BCLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzs7O0FEdkNELElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sYUFBYSxTQUFTO0FBRTVCLFNBQU87QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNMLGFBQWE7QUFBQSxNQUNiLFFBQVE7QUFBQSxNQUNSLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxJQUFJLEVBQUUsMkJBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUFBLEVBQ3BDO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
