'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const BASE = process.env.FMS_TEST_URL || 'http://127.0.0.1:4173/?v=78.9#dashboard';
const out = path.resolve('test-results/chart-refactor/mobile-layout-metrics.json');
// Verified run #83 after mobile KPI and filter layout: page 3435px,
// first chart panel at 987px at both 360px and 390px. Keep a modest buffer.
const MAX_PAGE_HEIGHT = 3575;
const MAX_FIRST_PANEL_TOP = 1080;
function local(name) { return path.resolve('node_modules', name); }
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const width of [360, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      try {
        await page.route('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js', r => r.fulfill({ path: local('chart.js/dist/chart.umd.js'), contentType: 'application/javascript' }));
        await page.route('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0', r => r.fulfill({ path: local('chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js'), contentType: 'application/javascript' }));
        await page.route('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', r => r.fulfill({ path: local('xlsx/dist/xlsx.full.min.js'), contentType: 'application/javascript' }));
        await page.route('https://script.google.com/**', r => r.abort());
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => window.Chart && Chart.getChart(document.getElementById('dailyChart')), { timeout: 20000 });
        const measurement = await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const panels = [...document.querySelectorAll('#dashboard .panel')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
          const rects = panels.map((el, index) => { const r = el.getBoundingClientRect(); return { index, className: el.className, top: Math.round(r.top + scrollY), height: Math.round(r.height), width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) }; });
          const kpis = [...document.querySelectorAll('#dashboard .kpis article')].map(el => { const r = el.getBoundingClientRect(); return { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), width: Math.round(r.width) }; });
          return { viewportWidth: innerWidth, pageHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight, horizontalOverflow: document.documentElement.scrollWidth - innerWidth, panelCount: rects.length, firstPanelTop: rects.length ? rects[0].top : null, panels: rects, kpis };
        });
        results.push(measurement);
        assert.ok(measurement.panelCount >= 3, `${width}px: dashboard panels missing`);
        assert.ok(measurement.horizontalOverflow <= 2, `${width}px: horizontal overflow ${measurement.horizontalOverflow}px`);
        assert.ok(measurement.panels.every(p => p.width > 20 && p.height > 20 && p.left >= -2 && p.right <= width + 2), `${width}px: panel outside viewport`);
        assert.equal(measurement.kpis.length, 6, `${width}px: expected six primary KPI cards`);
        assert.ok(measurement.kpis.every(k => k.width > 50 && k.left >= -2 && k.right <= width + 2), `${width}px: KPI card clipped or too narrow`);
        assert.ok(Math.abs(measurement.kpis[0].top - measurement.kpis[1].top) <= 2 && measurement.kpis[1].left > measurement.kpis[0].left + 20, `${width}px: first KPI pair must share a two-column row`);
        assert.ok(Math.abs(measurement.kpis[2].top - measurement.kpis[3].top) <= 2 && measurement.kpis[2].top > measurement.kpis[0].top + 20, `${width}px: second KPI pair must share the next row`);
        assert.ok(Math.abs(measurement.kpis[4].top - measurement.kpis[5].top) <= 2 && measurement.kpis[4].top > measurement.kpis[2].top + 20, `${width}px: third KPI pair must share the final row`);
        assert.ok(measurement.firstPanelTop <= MAX_FIRST_PANEL_TOP, `${width}px: first chart panel pushed down to ${measurement.firstPanelTop}px (run #83: 987px)`);
        assert.ok(measurement.pageHeight <= MAX_PAGE_HEIGHT, `${width}px: page grew to ${measurement.pageHeight}px (run #83: 3435px)`);
        console.log(`PASS ${width}px mobile layout: first panel ${measurement.firstPanelTop}px, ${measurement.panelCount} panels, ${measurement.pageHeight}px page, ${measurement.horizontalOverflow}px horizontal overflow; six KPI cards in three rows`);
      } finally { await context.close(); }
    }
  } finally {
    await browser.close();
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(results, null, 2) + '\n');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
