import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const template = readFileSync(
  new URL("../../../templates/Advertisement/Advertisement.html", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../../../static/css/Advertisement/Advertisement.css", import.meta.url),
  "utf8",
);
const js = readFileSync(new URL("./event.js", import.meta.url), "utf8");
const logoUrl = new URL("../../../static/img/Advertisement/team-logo.svg", import.meta.url);
const hasLogoFile = existsSync(logoUrl);
const logoSvg = hasLogoFile ? readFileSync(logoUrl, "utf8") : "";

function getConstValue(source, name) {
  const match = source.match(new RegExp(`const ${name} = ([^;]+);`));
  assert.ok(match, `${name} constant should exist`);
  return Number(match[1].trim());
}

function getFunctionBody(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} function should exist`);

  const bodyStart = source.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${name} function body should exist`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(bodyStart + 1, index);
      }
    }
  }

  assert.fail(`${name} function body should close`);
}

function createFunction(name, args) {
  return new Function(...args, getFunctionBody(js, name));
}

const checks = [
  {
    name: "list filter uses a status dropdown and keeps live and reported labels",
    run() {
      assert.match(template, /<select[^>]+data-list-status-filter[^>]*>/);
      assert.match(template, /<option value="all">전체 상태<\/option>/);
      assert.match(template, /<option value="active">게시중<\/option>/);
      assert.match(template, /<option value="reported">신고됨<\/option>/);
      assert.doesNotMatch(template, /data-list-status-button=/);
      assert.match(template, /data-status="active"[\s\S]*data-status-label="게시중"/);
      assert.match(template, /data-status="reported"[\s\S]*data-status-label="신고됨"/);
      assert.match(template, /data-detail-field="statusLabelBadge">게시중<\/span>/);
      assert.match(template, /data-detail-field="statusLabel">게시중<\/strong>/);
      assert.match(js, /row\.dataset\.status = "active";/);
      assert.match(js, /row\.dataset\.statusLabel = "게시중";/);
      assert.match(js, /setStatusBadge\(\$\('\[data-cell="statusLabel"\]', row\), "active", "게시중"\);/);
      assert.doesNotMatch(template, /data-list-reset/);
    },
  },
  {
    name: "status text keeps only default black and red styling with dropdown filter",
    run() {
      assert.match(css, /\.MarketplaceAdToolbarFilter[\s\S]*min-width:\s*140px;/);
      assert.match(css, /\.MarketplaceAdToolbarFilter[\s\S]*font-weight:\s*700;/);
      assert.match(css, /\.MarketplaceAdStatusBadge\s*\{[\s\S]*padding:\s*0;/);
      assert.match(css, /\.MarketplaceAdStatusBadge\s*\{[\s\S]*border:\s*0;/);
      assert.match(css, /\.MarketplaceAdStatusBadge\s*\{[\s\S]*border-radius:\s*0;/);
      assert.match(css, /\.MarketplaceAdStatusBadge\s*\{[\s\S]*background:\s*transparent;/);
      assert.doesNotMatch(css, /\.MarketplaceAdStatusBadge\.is-active\s*\{/);
      assert.match(css, /\.MarketplaceAdStatusBadge\.is-reported\s*\{[\s\S]*color:\s*#d92d20;[\s\S]*background:\s*transparent;[\s\S]*border:\s*0;/);
      assert.match(css, /\.MarketplaceAdTableActions\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;/);
      assert.match(css, /\.AdListDetailButton\s*\{[\s\S]*display:\s*inline-flex;[\s\S]*white-space:\s*nowrap;/);
    },
  },
  {
    name: "header brand uses the provided team logo asset",
    run() {
      assert.ok(hasLogoFile, "team logo asset should exist");
      assert.match(template, /<img[^>]+class="NavigationBarBrandLogo"[^>]+src="\/static\/img\/Advertisement\/team-logo\.svg"[^>]*>/);
      assert.match(template, /alt="global gates 팀 로고"/);
      assert.match(css, /\.NavigationBarBrandLogo\s*\{[\s\S]*width:\s*32px;[\s\S]*height:\s*32px;/);
      assert.match(logoSvg, /stroke="#FFFFFF"/);
      assert.match(logoSvg, /fill="#FFFFFF"/);
      assert.match(logoSvg, /<rect[^>]+x="24"[^>]+y="26"[^>]+width="30"[^>]+height="12"[^>]*>/);
      assert.doesNotMatch(logoSvg, /#193748/);
    },
  },
  {
    name: "main content starts immediately below the header",
    run() {
      assert.match(css, /\.MarketplaceAdMain\s*\{[\s\S]*padding:\s*0 24px 88px;/);
      assert.match(css, /@media \(max-width: 1024px\)[\s\S]*\.MarketplaceAdMain\s*\{[\s\S]*padding:\s*0 18px 88px;/);
      assert.match(css, /@media \(max-width: 400px\)[\s\S]*\.MarketplaceAdMain\s*\{[\s\S]*padding:\s*0 12px 72px;/);
    },
  },
  {
    name: "400px responsive breakpoint tightens logo and page spacing",
    run() {
      assert.match(css, /@media \(max-width: 400px\)/);
      assert.match(css, /@media \(max-width: 400px\)[\s\S]*\.NavigationBarBrandLogo\s*\{[\s\S]*width:\s*28px;[\s\S]*height:\s*28px;/);
      assert.match(css, /@media \(max-width: 400px\)[\s\S]*\.MarketplaceAdMain\s*\{[\s\S]*padding:\s*0 12px 72px;/);
      assert.match(css, /@media \(max-width: 400px\)[\s\S]*\.MarketplaceAdPanelHeader,\s*[\s\S]*\.MarketplaceAdPanelBody,\s*[\s\S]*\.MarketplaceAdModalHeader,\s*[\s\S]*\.MarketplaceAdModalBody,\s*[\s\S]*\.MarketplaceAdModalFooter\s*\{[\s\S]*padding-right:\s*14px;[\s\S]*padding-left:\s*14px;/);
    },
  },
  {
    name: "detail view removes operating memo bindings",
    run() {
      assert.doesNotMatch(template, /운영 메모/);
      assert.doesNotMatch(js, /notes:\s*data\.notes/);
      assert.match(js, /\[data-list-status-filter\]/);
      assert.doesNotMatch(js, /data-list-status-button/);
    },
  },
  {
    name: "budget impressions follow five views per thousand won",
    run() {
      const parseNumber = createFunction("parseNumber", ["value"]);
      const estimateImpressions = createFunction("estimateImpressions", [
        "amount",
        "parseNumber",
        "IMPRESSIONS_PER_THOUSAND_WON",
      ]);
      const impressionsPerThousandWon = getConstValue(js, "IMPRESSIONS_PER_THOUSAND_WON");

      assert.equal(impressionsPerThousandWon, 5);
      assert.equal(
        estimateImpressions("300000", parseNumber, impressionsPerThousandWon),
        1500,
      );
      assert.match(template, /data-summary-field="impressionHelper">예상 노출 1,500회<\/span>/);
      assert.match(template, /data-summary-field="impressionLabel">약 1,500회<\/strong>/);
      assert.match(template, /data-payment-field="impressionLabel">약 1,500회<\/strong>/);
      assert.doesNotMatch(js, /IMPRESSION_UNIT_COST/);
    },
  },
  {
    name: "payment confirmation button uses the shorter label",
    run() {
      assert.match(template, /data-payment-confirm[\s\S]*?>결제하기<\/button>/);
      assert.doesNotMatch(template, />부트페이로 결제하기<\/button>/);
    },
  },
];

checks.forEach(({ name, run }) => {
  run();
  console.log(`PASS ${name}`);
});
