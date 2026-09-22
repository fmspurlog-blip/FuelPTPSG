'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const BASE = process.env.FMS_TEST_URL || 'http://127.0.0.1:4173/?v=78.9#dashboard';
const local = name => path.resolve('node_modules', name);
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const width of [360, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      try {
        const page = await context.newPage();
        await page.route('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js', r => r.fulfill({ path: local('chart.js/dist/chart.umd.js'), contentType: 'application/javascript' }));
        await page.route('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0', r => r.fulfill({ path: local('chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js'), contentType: 'application/javascript' }));
        await page.route('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', r => r.fulfill({ path: local('xlsx/dist/xlsx.full.min.js'), contentType: 'application/javascript' }));
        await page.route('https://script.google.com/**', r => r.abort());
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => document.querySelector('.sidebar .nav-link') && document.querySelector('#dateFrom') && document.querySelector('#dateTo') && document.querySelector('#resetBtn'));
        const seen = { navigation: false, dateFrom: false, dateTo: false, reset: false };
        const sequence = [];
        for (let i = 0; i < 100 && !Object.values(seen).every(Boolean); i++) {
          await page.keyboard.press('Tab');
          const focus = await page.evaluate(() => {
            const el = document.activeElement;
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName, id: el.id,
              className: typeof el.className === 'string' ? el.className : '',
              navigation: el.matches('.sidebar .nav-link'),
              outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth),
              rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
              viewport: { width: document.documentElement.clientWidth, height: window.innerHeight }
            };
          });
          sequence.push(`${focus.tag}${focus.id ? '#' + focus.id : ''}${focus.className ? '.' + focus.className.trim().replace(/\s+/g, '.') : ''}`);
          const target = focus.navigation ? 'navigation' : focus.id === 'dateFrom' ? 'dateFrom' : focus.id === 'dateTo' ? 'dateTo' : focus.id === 'resetBtn' ? 'reset' : null;
          if (target) {
            assert.ok(focus.outlineStyle !== 'none' && focus.outlineWidth >= 3, `${width}px: keyboard focus outline missing on ${target}; order: ${sequence.join(' -> ')}`);
            assert.ok(focus.rect.width > 0 && focus.rect.height > 0 && focus.rect.right > 0 && focus.rect.left < focus.viewport.width && focus.rect.bottom > 0 && focus.rect.top < focus.viewport.height, `${width}px: focused ${target} is outside the visible viewport: ${JSON.stringify(focus.rect)}; order: ${sequence.join(' -> ')}`);
            seen[target] = true;
          }
        }
        assert.ok(Object.values(seen).every(Boolean), `${width}px: Tab must reach navigation, both date inputs and reset; reached: ${JSON.stringify(seen)}; order: ${sequence.join(' -> ')}`);
        console.log(`PASS ${width}px: Tab reaches visible navigation, both dates and reset with >=3px focus outline`);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
