// Portal HTML to TSX converter - v2
const fs = require('fs');

function convertStyles(styleStr) {
  const props = styleStr.split(';').filter(function(p) { return p.trim(); }).map(function(prop) {
    const colonIdx = prop.indexOf(':');
    if (colonIdx === -1) return null;
    let key = prop.slice(0, colonIdx).trim();
    let val = prop.slice(colonIdx + 1).trim();
    key = key.replace(/-([a-z])/g, function(m, c) { return c.toUpperCase(); });
    val = val.replace(/'/g, '"');
    return key + ": '" + val + "'";
  }).filter(Boolean);
  return 'style={{ ' + props.join(', ') + ' }}';
}

function htmlToJsx(html) {
  let r = html;
  // Convert HTML comments to JSX comments
  r = r.replace(/<!--([\s\S]*?)-->/g, function(m, content) {
    return '{/* ' + content.replace(/\*\//g, '* /') + ' */}';
  });
  r = r.replace(/\bclass=/g, 'className=');
  r = r.replace(/\bfor=/g, 'htmlFor=');
  r = r.replace(/<(input|br|hr|img|meta|link)([^>]*?)(?<!\/)>/g, '<$1$2 />');
  r = r.replace(/\bonclick=/g, 'onClick=');
  r = r.replace(/\bonchange=/g, 'onChange=');
  r = r.replace(/\boninput=/g, 'onInput=');
  r = r.replace(/stroke-width=/g, 'strokeWidth=');
  r = r.replace(/stroke-linecap=/g, 'strokeLinecap=');
  r = r.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  r = r.replace(/fill-rule=/g, 'fillRule=');
  r = r.replace(/clip-rule=/g, 'clipRule=');
  r = r.replace(/viewbox=/gi, 'viewBox=');
  r = r.replace(/&middot;/g, '\u00b7');
  r = r.replace(/&mdash;/g, '\u2014');
  r = r.replace(/&rarr;/g, '\u2192');
  r = r.replace(/&#64;/g, '@');
  r = r.replace(/style="([^"]+)"/g, function(m, s) { return convertStyles(s); });
  r = r.replace(/\bchecked(?!\s*=)/g, 'defaultChecked');
  // readonly → readOnly
  r = r.replace(/\breadonly(?!\s*=)/g, 'readOnly');
  return r;
}

function fixPageVisibility(jsx) {
  // page active -> state-based
  jsx = jsx.replace(/className="page active" id="page-([^"]+)"/g, function(m, id) {
    return 'className={`page ${activePage === \'' + id + '\' ? \'active\' : \'\'}`} id="page-' + id + '"';
  });
  jsx = jsx.replace(/className="page" id="page-([^"]+)"/g, function(m, id) {
    return 'className={`page ${activePage === \'' + id + '\' ? \'active\' : \'\'}`} id="page-' + id + '"';
  });
  return jsx;
}

function fixNavItems(jsx) {
  jsx = jsx.replace(/className="nav-item active" data-page="([^"]+)"/g, function(m, page) {
    return 'className={`nav-item ${isNavActive(\'' + page + '\') ? \'active\' : \'\'}`} onClick={() => showPage(\'' + page + '\')}';
  });
  jsx = jsx.replace(/className="nav-item" data-page="([^"]+)"/g, function(m, page) {
    return 'className={`nav-item ${isNavActive(\'' + page + '\') ? \'active\' : \'\'}`} onClick={() => showPage(\'' + page + '\')}';
  });
  return jsx;
}

function fixShowPageCalls(jsx) {
  jsx = jsx.replace(/onClick="showPage\('([^']+)'\)"/g, "onClick={() => showPage('$1')}");
  jsx = jsx.replace(/onClick="toggleTheme\(\)"/g, "onClick={toggleTheme}");
  jsx = jsx.replace(/onClick="setLang\('en'\)"/g, "onClick={() => setLangFn('en')}");
  jsx = jsx.replace(/onClick="setLang\('fr'\)"/g, "onClick={() => setLangFn('fr')}");
  jsx = jsx.replace(/onClick="switchTab\(this\)"/g, "onClick={switchTab}");
  return jsx;
}

// Merge duplicate style={{ ... }} style={{ ... }} attributes on the same element
function fixDuplicateStyles(jsx) {
  // Find patterns: style={{ X }} style={{ Y }} and merge into style={{ X, Y }}
  // Run multiple times in case of triple duplicates
  for (let i = 0; i < 3; i++) {
    jsx = jsx.replace(/style=\{\{ ([^}]+) \}\} style=\{\{ ([^}]+) \}\}/g, function(m, a, b) {
      return 'style={{ ' + a + ', ' + b + ' }}';
    });
  }
  return jsx;
}

// Convert all remaining onClick/onChange/onInput string handlers to no-ops or wrapped calls
function fixRemainingHandlers(jsx) {
  // Generic tab switchers not yet converted - wrap as arrow functions
  jsx = jsx.replace(/onClick="switchUnitTab\('([^']+)'\)"/g, "onClick={(e) => switchUnitTab('$1', e)}");
  jsx = jsx.replace(/onClick="switchDealerTab\('([^']+)'\)"/g, "onClick={(e) => switchDealerTab('$1', e)}");
  jsx = jsx.replace(/onClick="switchDclTab\('([^']+)'\)"/g, "onClick={(e) => switchClTab('$1', e)}");
  jsx = jsx.replace(/onClick="switchDealerSettings\('([^']+)'\)"/g, "onClick={(e) => switchSettings('$1', e)}");
  jsx = jsx.replace(/onClick="switchClTab\('([^']+)'\)"/g, "onClick={(e) => switchClTab('$1', e)}");
  // File input clicks - generic pattern
  jsx = jsx.replace(/onClick="document\.getElementById\('([^']+)'\)\.click\(\)"/g, function(m, id) {
    return "onClick={() => { const el = document.getElementById('" + id + "') as HTMLInputElement; if(el) el.click(); }}";
  });
  // onChange file handlers - generic
  jsx = jsx.replace(/onChange="updateUnitPhoto\(this\)"/g, "onChange={(e) => { const inp = e.target as HTMLInputElement; if(inp.files && inp.files[0]) { const r = new FileReader(); r.onload = (ev) => { const img = document.getElementById('unit-photo-display') as HTMLImageElement; if(img) img.src = ev.target?.result as string; }; r.readAsDataURL(inp.files[0]); } }}");
  jsx = jsx.replace(/onChange="previewLogo\(this\)"/g, "onChange={(e) => updateLogo(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onChange="updateProfileImage\(this\)"/g, "onChange={(e) => updateProfile(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onChange="previewUnitPhoto\(this\)"/g, "onChange={(e) => previewUnitPhoto(e.target as HTMLInputElement)}");
  // onInput handlers
  jsx = jsx.replace(/onInput="document\.getElementById\('([^']+)'\)\.textContent\s*=\s*this\.value"/g, function(m, id) {
    return "onInput={(e) => { const el = document.getElementById('" + id + "'); if(el) el.textContent = (e.target as HTMLInputElement).value; }}";
  });
  jsx = jsx.replace(/onInput="([^"]+)"/g, "onInput={(e) => { /* $1 */ }}");
  // onClick string handlers that remain (catch-all for simple function calls)
  jsx = jsx.replace(/onClick="previewBranding\(\)"/g, "onClick={() => {}}");
  jsx = jsx.replace(/onClick="([a-zA-Z_$][a-zA-Z0-9_$]*)\(\)"/g, "onClick={$1}");
  jsx = jsx.replace(/onClick="([a-zA-Z_$][a-zA-Z0-9_$]*)\(this\)"/g, "onClick={(e) => $1(e.currentTarget)}");
  // onChange string handlers that remain
  jsx = jsx.replace(/onChange="([a-zA-Z_$][a-zA-Z0-9_$]*)\(this\)"/g, "onChange={(e) => $1(e.target as HTMLInputElement)}");
  // Any remaining quoted string handlers (last resort)
  jsx = jsx.replace(/onClick="[^"]+"/g, "onClick={() => {}}");
  jsx = jsx.replace(/onChange="[^"]+"/g, "onChange={() => {}}");
  jsx = jsx.replace(/onInput="[^"]+"/g, "onInput={() => {}}");
  return jsx;
}

function fixHeaderTitles(jsx) {
  // id="page-title">Dashboard  -- the > is actually from </div> in original, but we replaced it
  // The pattern in original HTML is: id="page-title">Dashboard</div>
  // After our initial regex it becomes: id="page-title">{pageTitle}/div>  -- wrong
  // We need to fix the replacement to be safe
  // Actually the regex was: replace id="page-title">Dashboard with id="page-title">{pageTitle}
  // That consumed the ">" at the end which was part of the id attribute pattern
  // We should fix the replacement differently - just replace text content after id="page-title">
  jsx = jsx.replace(/id="page-title">\{pageTitle\}/g, 'id="page-title">{pageTitle}<');
  // Wait, the original was: <div class="header-title" id="page-title">Dashboard</div>
  // After htmlToJsx: <div className="header-title" id="page-title">Dashboard</div>
  // Our replacement: id="page-title">Dashboard -> id="page-title">{pageTitle}
  // So it becomes: <div className="header-title" id="page-title">{pageTitle}</div> -- CORRECT
  // But the error shows /div> which means the closing </div> tag's > was included in the replacement
  // That's because the regex was: .replace(/id="page-title">Dashboard</g, ...)
  // The $ was inadvertently included. Let's just fix any broken patterns:
  jsx = jsx.replace(/\{pageTitle\}\/div>/g, '{pageTitle}</div>');
  jsx = jsx.replace(/\{pageSub\}\/div>/g, '{pageSub}</div>');
  return jsx;
}

function makeSharedState(portalName, titlesStr, parentsStr, i18nStr) {
  return "import { useState, useEffect } from 'react';\n\nexport default function " + portalName + "() {\n  const [activePage, setActivePage] = useState('dashboard');\n  const [pageTitle, setPageTitle] = useState('Dashboard');\n  const [pageSub, setPageSub] = useState('');\n  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');\n  const [lang, setLang] = useState<'en'|'fr'>(() => {\n    const saved = localStorage.getItem('ds360-lang');\n    if (saved === 'fr') return 'fr';\n    return (navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en';\n  });\n\n  const titles: Record<string, [string, string]> = " + titlesStr + ";\n  const parents: Record<string, string> = " + parentsStr + ";\n  const i18n: Record<string, string> = " + i18nStr + ";\n  const i18n_r: Record<string, string> = {};\n  Object.keys(i18n).forEach((k: string) => { i18n_r[i18n[k]] = k; });\n\n  const showPage = (id: string) => {\n    setActivePage(id);\n    if (titles[id]) {\n      setPageTitle(titles[id][0]);\n      setPageSub(titles[id][1]);\n    }\n    window.scrollTo(0, 0);\n  };\n\n  const isNavActive = (pageId: string) => {\n    if (activePage === pageId) return true;\n    if (parents[activePage] === pageId) return true;\n    return false;\n  };\n\n  const toggleTheme = () => {\n    const next = theme === 'dark' ? '' : 'dark';\n    setTheme(next);\n    document.documentElement.setAttribute('data-theme', next);\n    localStorage.setItem('ds360-theme', next);\n  };\n\n  const setLangFn = (l: 'en' | 'fr') => {\n    setLang(l);\n    localStorage.setItem('ds360-lang', l);\n    document.documentElement.setAttribute('lang', l);\n    setTimeout(() => translatePage(l), 50);\n  };\n\n  const translatePage = (l: 'en' | 'fr') => {\n    const dict = l === 'fr' ? i18n : i18n_r;\n    document.querySelectorAll('.nav-item,.nav-label,.pn-t,.pn-a,.cd-section-h,.cd-label,.detail-title,.detail-meta,.header-title,.sc-l,.al-t,.al-d,.al-a,.act-t,.qb-t,.settings-link,.svc-title,.svc-desc,.fi-card-title,.fi-card-desc').forEach(function(el: Element) {\n      el.childNodes.forEach(function(n: ChildNode) {\n        if (n.nodeType === 3 && n.textContent && n.textContent.trim()) {\n          const t = n.textContent.trim();\n          if (dict[t]) n.textContent = n.textContent.replace(t, dict[t]);\n        }\n      });\n    });\n    document.querySelectorAll('.btn,button,th').forEach(function(el: Element) {\n      const htmlEl = el as HTMLElement;\n      if (htmlEl.children.length === 0 || (htmlEl.children.length === 1 && htmlEl.children[0].tagName === 'SVG')) {\n        const t = htmlEl.textContent ? htmlEl.textContent.trim() : '';\n        if (dict[t]) htmlEl.textContent = dict[t];\n      } else {\n        el.childNodes.forEach(function(n: ChildNode) {\n          if (n.nodeType === 3 && n.textContent && n.textContent.trim()) {\n            const t = n.textContent.trim();\n            if (dict[t]) n.textContent = n.textContent.replace(t, dict[t]);\n          }\n        });\n      }\n    });\n    document.querySelectorAll('label,.form-group label').forEach(function(el: Element) {\n      const t = el.textContent ? el.textContent.trim() : '';\n      if (dict[t]) el.textContent = dict[t];\n    });\n    document.querySelectorAll('.bg,.nb,.mfr,.sidebar-badge').forEach(function(el: Element) {\n      const t = el.textContent ? el.textContent.trim() : '';\n      if (dict[t]) el.textContent = dict[t];\n    });\n    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(function(el: Element) {\n      const inp = el as HTMLInputElement;\n      const t = inp.getAttribute('placeholder') || '';\n      if (dict[t]) inp.setAttribute('placeholder', dict[t]);\n    });\n    document.querySelectorAll('.tab').forEach(function(el: Element) {\n      el.childNodes.forEach(function(n: ChildNode) {\n        if (n.nodeType === 3 && n.textContent && n.textContent.trim()) {\n          const raw = n.textContent.trim().replace(/\\s*\\(\\d+\\)\\s*/, '');\n          if (dict[raw]) {\n            const num = n.textContent.match(/\\((\\d+)\\)/);\n            n.textContent = num ? ' ' + dict[raw] + ' ' + num[0] : ' ' + dict[raw] + ' ';\n          }\n        }\n      });\n    });\n  };\n\n  useEffect(() => {\n    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');\n    if (lang === 'fr') setTimeout(() => translatePage('fr'), 50);\n  }, []);\n\n";
}

// Deduplicate i18n object literal string (removes duplicate keys from JS object literal)
function dedupeI18n(i18nStr) {
  // Parse key-value pairs from the object literal
  const pairs = {};
  const regex = /"([^"]+)"\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = regex.exec(i18nStr)) !== null) {
    pairs[m[1]] = m[2];
  }
  const entries = Object.entries(pairs).map(function(kv) {
    return '"' + kv[0] + '": "' + kv[1] + '"';
  });
  return '{\n  ' + entries.join(',\n  ') + '\n}';
}

// ===== OPERATOR PORTAL =====
function buildOperator() {
  const html = fs.readFileSync('C:/Users/hello/Downloads/operator-portal.html', 'utf8');
  const bodyStart = html.indexOf('<body>') + 6;
  const scriptStart = html.indexOf('<script>');
  const body = html.slice(bodyStart, scriptStart).trim();
  const script = html.slice(scriptStart + 8, html.lastIndexOf('</script>'));

  const titlesMatch = script.match(/var titles=(\{[\s\S]*?\});\s*\n/);
  const titlesStr = titlesMatch ? titlesMatch[1] : '{}';
  const parentsMatch = script.match(/var parents=(\{[^}]+\})/);
  const parentsStr = parentsMatch ? parentsMatch[1] : '{}';
  const i18nMatch = script.match(/var i18n=(\{[\s\S]*?\});\s*var i18n_r/);
  const i18nStr = i18nMatch ? i18nMatch[1] : '{}';

  let jsx = htmlToJsx(body);
  jsx = fixPageVisibility(jsx);
  jsx = fixNavItems(jsx);
  jsx = fixShowPageCalls(jsx);

  // Fix operator-specific onClick calls
  jsx = jsx.replace(/onClick="switchDealerTab\('([^']+)'\)"/g, "onClick={(e) => switchDealerTab('$1', e)}");
  jsx = jsx.replace(/onClick="switchUnitTab\('([^']+)'\)"/g, "onClick={(e) => switchUnitTab('$1', e)}");
  jsx = jsx.replace(/onClick="switchSettings\('([^']+)'\)"/g, "onClick={(e) => switchSettings('$1', e)}");
  jsx = jsx.replace(/onClick="switchClTab\('([^']+)'\)"/g, "onClick={(e) => switchClTab('$1', e)}");
  jsx = jsx.replace(/onClick="toggleUnitEdit\(\)"/g, "onClick={toggleUnitEdit}");
  jsx = jsx.replace(/onClick="addServiceRow\(\)"/g, "onClick={addServiceRow}");
  jsx = jsx.replace(/onClick="addPartRow\(\)"/g, "onClick={addPartRow}");
  jsx = jsx.replace(/onClick="removeInvRow\(this\)"/g, "onClick={(e) => removeInvRow(e.currentTarget as HTMLButtonElement)}");
  jsx = jsx.replace(/onClick="document\.getElementById\('op-profile-input'\)\.click\(\)"/g, "onClick={() => { const el = document.getElementById('op-profile-input') as HTMLInputElement; if(el) el.click(); }}");
  jsx = jsx.replace(/onChange="updateOpProfile\(this\)"/g, "onChange={(e) => updateOpProfile(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onChange="updateOpUnitPhoto\(this\)"/g, "onChange={(e) => updateOpUnitPhoto(e.target as HTMLInputElement)}");

  // Fix header title/sub - use React state via the specific IDs
  jsx = jsx.replace(/(<div[^>]*id="page-title"[^>]*>)[^<]+(<\/div>)/g, '$1{pageTitle}$2');
  jsx = jsx.replace(/(<div[^>]*id="page-sub"[^>]*>)[^<]+(<\/div>)/g, '$1{pageSub}$2');

  // Fix dealer tabs display
  jsx = jsx.replace(/className="pn dtab active" id="dtab-([^"]+)"/g, function(m, id) {
    return 'className="pn dtab" id="dtab-' + id + '" style={{ display: dealerTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn dtab" id="dtab-([^"]+)"(?! style)/g, function(m, id) {
    return 'className="pn dtab" id="dtab-' + id + '" style={{ display: dealerTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  // Fix existing style= on dtabs that got set to display:none
  jsx = jsx.replace(/className="pn dtab" id="dtab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn dtab" id="dtab-' + id + '" style={{ display: dealerTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Fix unit tabs
  jsx = jsx.replace(/className="pn utab active" id="utab-([^"]+)"/g, function(m, id) {
    return 'className="pn utab" id="utab-' + id + '" style={{ display: unitTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn utab" id="utab-([^"]+)"(?! style)/g, function(m, id) {
    return 'className="pn utab" id="utab-' + id + '" style={{ display: unitTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn utab" id="utab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn utab" id="utab-' + id + '" style={{ display: unitTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Fix settings tabs
  jsx = jsx.replace(/className="pn stab active" id="stab-([^"]+)"/g, function(m, id) {
    return 'className="pn stab" id="stab-' + id + '" style={{ display: settingsTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn stab" id="stab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn stab" id="stab-' + id + '" style={{ display: settingsTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Fix changelog tabs
  jsx = jsx.replace(/className="pn cltab active" id="cltab-([^"]+)"/g, function(m, id) {
    return 'className="pn cltab" id="cltab-' + id + '" style={{ display: clTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn cltab" id="cltab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn cltab" id="cltab-' + id + '" style={{ display: clTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Merge any duplicate style attributes created by tab injection
  jsx = fixDuplicateStyles(jsx);
  // Fix any remaining unconverted event handlers
  jsx = fixRemainingHandlers(jsx);

  // Fix bare > in JSX text contexts (polyline points, path d values excluded - those are in attributes)
  // Bare > in text: like "Settings > ..." text
  // We need to find > that appears as text content (not in tags)
  // The issue is lines like: Dealers > [Dealer] > Subscription
  // These appear in regular text and need to be escaped
  jsx = jsx.replace(/>([^<{]*) &gt; ([^<{]*)</g, '>$1 &gt; $2<');

  const operatorExtras = "  const [dealerTab, setDealerTab] = useState('d-batches');\n  const [unitTab, setUnitTab] = useState('u-details');\n  const [settingsTab, setSettingsTab] = useState('s-profile');\n  const [clTab, setClTab] = useState('cl-current');\n\n  const switchDealerTab = (id: string, e: React.MouseEvent) => {\n    setDealerTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const tabs = document.querySelectorAll('#dealer-tabs .tab');\n    tabs.forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchUnitTab = (id: string, e: React.MouseEvent) => {\n    setUnitTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const tabs = document.querySelectorAll('#unit-tabs .tab');\n    tabs.forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchSettings = (id: string, e: React.MouseEvent) => {\n    setSettingsTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const links = document.querySelectorAll('.settings-link');\n    links.forEach((l: Element) => l.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchClTab = (id: string, e: React.MouseEvent) => {\n    setClTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const tabs = document.querySelectorAll('#cl-tabs .tab');\n    tabs.forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchTab = (e: React.MouseEvent) => {\n    const target = e.currentTarget as HTMLElement;\n    const parent = target.parentElement;\n    if (parent) {\n      parent.querySelectorAll('.tab').forEach((t: Element) => t.classList.remove('active'));\n    }\n    target.classList.add('active');\n  };\n\n  const toggleUnitEdit = () => {\n    const v = document.getElementById('unit-view-mode');\n    const e = document.getElementById('unit-edit-mode');\n    const b = document.getElementById('edit-unit-btn');\n    if (e && v && b) {\n      if (e.style.display === 'none') {\n        e.style.display = 'block'; v.style.display = 'none';\n        b.textContent = 'Cancel Edit'; (b as HTMLButtonElement).className = 'btn btn-d btn-sm';\n      } else {\n        e.style.display = 'none'; v.style.display = 'block';\n        b.textContent = 'Edit Unit'; (b as HTMLButtonElement).className = 'btn btn-o btn-sm';\n      }\n    }\n  };\n\n  const removeInvRow = (btn: HTMLButtonElement) => {\n    const row = btn.closest('tr');\n    if (row) row.remove();\n  };\n\n  const addServiceRow = () => {\n    const tb = document.getElementById('inv-lines');\n    if (!tb) return;\n    const tr = document.createElement('tr');\n    tr.innerHTML = '<td style=\"padding:14px 16px\"><select style=\"width:100%;padding:8px 10px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa;margin-bottom:6px\"><option>Select item...</option><optgroup label=\"Subscriptions\"><option>Plan A Monthly Subscription</option><option>Plan B Wallet Top-Up</option></optgroup><optgroup label=\"Claim Fees\"><option>Claim Processing Fee (10%)</option><option>DAF Inspection Fee</option><option>PDI Processing Fee</option></optgroup><optgroup label=\"Service Add-ons\"><option>Financing Services</option><option>F&amp;I Services</option><option>Parts &amp; Accessories</option></optgroup></select><input placeholder=\"Add description...\" style=\"width:100%;padding:6px 10px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa\"></td><td style=\"text-align:center;padding:14px 8px\"><input value=\"1\" style=\"width:50px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:center;font-family:inherit\"></td><td style=\"text-align:right;padding:14px 8px\"><input placeholder=\"0.00\" style=\"width:90px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:right;font-family:inherit\"></td><td style=\"text-align:right;padding:14px 16px;font-weight:600;font-size:13px\">$0.00</td><td style=\"padding:14px 8px;text-align:center\"><button onclick=\"this.closest(\\'tr\\').remove()\" style=\"background:none;border:none;color:#ccc;cursor:pointer;font-size:18px\">&times;</button></td>';\n    tb.appendChild(tr);\n    const sel = tr.querySelector('select') as HTMLSelectElement;\n    if (sel) sel.focus();\n  };\n\n  const addPartRow = () => {\n    const tb = document.getElementById('inv-lines');\n    if (!tb) return;\n    const tr = document.createElement('tr');\n    tr.innerHTML = '<td style=\"padding:14px 16px\"><div style=\"position:relative\"><input placeholder=\"Search parts...\" style=\"width:100%;padding:8px 10px 8px 30px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa;margin-bottom:6px\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2\" style=\"position:absolute;left:10px;top:10px\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/></svg></div><input placeholder=\"Add description...\" style=\"width:100%;padding:6px 10px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa\"></td><td style=\"text-align:center;padding:14px 8px\"><input value=\"1\" style=\"width:50px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:center;font-family:inherit\"></td><td style=\"text-align:right;padding:14px 8px\"><input placeholder=\"0.00\" style=\"width:90px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:right;font-family:inherit\"></td><td style=\"text-align:right;padding:14px 16px;font-weight:600;font-size:13px\">$0.00</td><td style=\"padding:14px 8px;text-align:center\"><button onclick=\"this.closest(\\'tr\\').remove()\" style=\"background:none;border:none;color:#ccc;cursor:pointer;font-size:18px\">&times;</button></td>';\n    tb.appendChild(tr);\n    const inp = tr.querySelector('input') as HTMLInputElement;\n    if (inp) inp.focus();\n  };\n\n  const updateOpProfile = (input: HTMLInputElement) => {\n    if (input.files && input.files[0]) {\n      const reader = new FileReader();\n      reader.onload = function(e) {\n        const result = e.target ? e.target.result as string : '';\n        const av1 = document.getElementById('op-profile-avatar');\n        const av2 = document.getElementById('op-user-avatar');\n        if (av1) av1.innerHTML = '<img src=\"' + result + '\" style=\"width:100%;height:100%;object-fit:cover;border-radius:50%\">';\n        if (av2) av2.innerHTML = '<img src=\"' + result + '\" style=\"width:100%;height:100%;object-fit:cover;border-radius:50%\">';\n      };\n      reader.readAsDataURL(input.files[0]);\n    }\n  };\n\n  const updateOpUnitPhoto = (input: HTMLInputElement) => {\n    if (input.files && input.files[0]) {\n      const reader = new FileReader();\n      reader.onload = function(e) {\n        const result = e.target ? e.target.result as string : '';\n        const img = document.getElementById('op-unit-photo-img') as HTMLImageElement;\n        if (img) { img.src = result; img.style.display = 'block'; }\n        const ph = document.getElementById('op-unit-photo-ph');\n        if (ph) ph.style.display = 'none';\n      };\n      reader.readAsDataURL(input.files[0]);\n    }\n  };\n\n";

  const shared = makeSharedState("OperatorPortal", titlesStr, parentsStr, dedupeI18n(i18nStr));
  const jsxLines = jsx.split('\n').map(function(line) { return '      ' + line; }).join('\n');

  const tsx = shared + operatorExtras + "  return (\n    <>\n" + jsxLines + "\n    </>\n  );\n}\n";
  fs.writeFileSync('client/src/portals/OperatorPortal.tsx', tsx);
  console.log('OperatorPortal.tsx written:', tsx.split('\n').length, 'lines');
}

// ===== DEALER PORTAL =====
function buildDealer() {
  const html = fs.readFileSync('C:/Users/hello/Downloads/dealer-portal.html', 'utf8');
  const bodyStart = html.indexOf('<body>') + 6;
  const scriptStart = html.indexOf('<script>');
  const body = html.slice(bodyStart, scriptStart).trim();
  const script = html.slice(scriptStart + 8, html.lastIndexOf('</script>'));

  const titlesMatch = script.match(/var titles=(\{[\s\S]*?\});\s*\n/);
  const titlesStr = titlesMatch ? titlesMatch[1] : '{}';
  const parentsMatch = script.match(/var parents=(\{[^}]+\})/);
  const parentsStr = parentsMatch ? parentsMatch[1] : '{}';
  const i18nMatch = script.match(/var i18n=(\{[\s\S]*?\});\s*var i18n_r/);
  const i18nStr = i18nMatch ? i18nMatch[1] : '{}';

  let jsx = htmlToJsx(body);
  jsx = fixPageVisibility(jsx);
  jsx = fixNavItems(jsx);
  jsx = fixShowPageCalls(jsx);

  // Dealer-specific
  jsx = jsx.replace(/onClick="switchSettings\('([^']+)'\)"/g, "onClick={(e) => switchSettings('$1', e)}");
  jsx = jsx.replace(/onClick="switchClTab\('([^']+)'\)"/g, "onClick={(e) => switchClTab('$1', e)}");
  jsx = jsx.replace(/onClick="switchTab\(this\)"/g, "onClick={switchTab}");
  jsx = jsx.replace(/onClick="switchTicketTab\('([^']+)'\)"/g, "onClick={(e) => switchTicketTab('$1', e)}");
  jsx = jsx.replace(/onClick="applyBranding\(\)"/g, "onClick={applyBranding}");
  jsx = jsx.replace(/onClick="restoreBranding\(\)"/g, "onClick={restoreBranding}");
  jsx = jsx.replace(/onClick="document\.getElementById\('logo-input'\)\.click\(\)"/g, "onClick={() => { const el = document.getElementById('logo-input') as HTMLInputElement; if(el) el.click(); }}");
  jsx = jsx.replace(/onClick="document\.getElementById\('user-input'\)\.click\(\)"/g, "onClick={() => { const el = document.getElementById('user-input') as HTMLInputElement; if(el) el.click(); }}");
  jsx = jsx.replace(/onChange="updateProfile\(this\)"/g, "onChange={(e) => updateProfile(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onChange="updateLogo\(this\)"/g, "onChange={(e) => updateLogo(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onChange="previewUnitPhoto\(this\)"/g, "onChange={(e) => previewUnitPhoto(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onInput="updateHeaderName\(this\)"/g, "onInput={(e) => updateHeaderName(e.target as HTMLInputElement)}");

  // Fix header title/sub
  jsx = jsx.replace(/(<div[^>]*id="page-title"[^>]*>)[^<]+(<\/div>)/g, '$1{pageTitle}$2');
  jsx = jsx.replace(/(<div[^>]*id="page-sub"[^>]*>)[^<]+(<\/div>)/g, '$1{pageSub}$2');

  // Settings tabs
  jsx = jsx.replace(/className="pn stab active" id="stab-([^"]+)"/g, function(m, id) {
    return 'className="pn stab" id="stab-' + id + '" style={{ display: settingsTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn stab" id="stab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn stab" id="stab-' + id + '" style={{ display: settingsTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Changelog tabs
  jsx = jsx.replace(/className="pn cltab active" id="cltab-([^"]+)"/g, function(m, id) {
    return 'className="pn cltab" id="cltab-' + id + '" style={{ display: clTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn cltab" id="cltab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn cltab" id="cltab-' + id + '" style={{ display: clTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Ticket tabs
  jsx = jsx.replace(/className="pn ttab active" id="ttab-([^"]+)"/g, function(m, id) {
    return 'className="pn ttab" id="ttab-' + id + '" style={{ display: ticketTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn ttab" id="ttab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn ttab" id="ttab-' + id + '" style={{ display: ticketTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Merge any duplicate style attributes and fix remaining event handlers
  jsx = fixDuplicateStyles(jsx);
  jsx = fixRemainingHandlers(jsx);

  const dealerExtras = "  const [settingsTab, setSettingsTab] = useState('ds-profile');\n  const [clTab, setClTab] = useState('cl-new');\n  const [ticketTab, setTicketTab] = useState('t-open');\n\n  const switchSettings = (id: string, e: React.MouseEvent) => {\n    setSettingsTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const links = document.querySelectorAll('.settings-link');\n    links.forEach((l: Element) => l.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchClTab = (id: string, e: React.MouseEvent) => {\n    setClTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const tabs = document.querySelectorAll('#cl-tabs .tab');\n    tabs.forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchTicketTab = (id: string, e: React.MouseEvent) => {\n    setTicketTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const tabs = target.parentElement ? target.parentElement.querySelectorAll('.tab') : [];\n    tabs.forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchTab = (e: React.MouseEvent) => {\n    const target = e.currentTarget as HTMLElement;\n    const parent = target.parentElement;\n    if (parent) parent.querySelectorAll('.tab').forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const applyBranding = () => {\n    const primary = (document.getElementById('brand-primary') as HTMLInputElement);\n    const logo = document.getElementById('sidebar-logo-svg');\n    if (primary && logo) {\n      (logo as HTMLElement).style.fill = primary.value;\n    }\n  };\n\n  const restoreBranding = () => {};\n\n  const updateProfile = (input: HTMLInputElement) => {\n    if (input.files && input.files[0]) {\n      const reader = new FileReader();\n      reader.onload = function(e) {\n        const result = e.target ? e.target.result as string : '';\n        const av = document.getElementById('user-avatar');\n        if (av) av.innerHTML = '<img src=\"' + result + '\" style=\"width:100%;height:100%;object-fit:cover;border-radius:50%\">';\n      };\n      reader.readAsDataURL(input.files[0]);\n    }\n  };\n\n  const updateLogo = (input: HTMLInputElement) => {\n    if (input.files && input.files[0]) {\n      const reader = new FileReader();\n      reader.onload = function(e) {\n        const result = e.target ? e.target.result as string : '';\n        const logo = document.getElementById('sidebar-logo-svg') as HTMLElement;\n        if (logo) logo.innerHTML = '<img src=\"' + result + '\" style=\"width:36px;height:36px;object-fit:contain;border-radius:8px\">';\n      };\n      reader.readAsDataURL(input.files[0]);\n    }\n  };\n\n  const previewUnitPhoto = (input: HTMLInputElement) => {\n    if (input.files && input.files[0]) {\n      const reader = new FileReader();\n      reader.onload = function(e) {\n        const result = e.target ? e.target.result as string : '';\n        const img = document.getElementById('unit-photo-preview') as HTMLImageElement;\n        if (img) { img.src = result; img.style.display = 'block'; }\n      };\n      reader.readAsDataURL(input.files[0]);\n    }\n  };\n\n  const updateHeaderName = (input: HTMLInputElement) => {\n    const el = document.getElementById('header-dealer-name');\n    const sn = document.getElementById('sidebar-name');\n    if (el) el.textContent = input.value;\n    if (sn) sn.textContent = input.value;\n  };\n\n";

  const shared = makeSharedState("DealerPortal", titlesStr, parentsStr, dedupeI18n(i18nStr));
  const jsxLines = jsx.split('\n').map(function(line) { return '      ' + line; }).join('\n');
  const tsx = shared + dealerExtras + "  return (\n    <>\n" + jsxLines + "\n    </>\n  );\n}\n";
  fs.writeFileSync('client/src/portals/DealerPortal.tsx', tsx);
  console.log('DealerPortal.tsx written:', tsx.split('\n').length, 'lines');
}

// ===== CUSTOMER PORTAL =====
function buildCustomer() {
  const html = fs.readFileSync('C:/Users/hello/Downloads/customer-portal.html', 'utf8');
  const bodyStart = html.indexOf('<body>') + 6;
  const scriptStart = html.indexOf('<script>');
  const body = html.slice(bodyStart, scriptStart).trim();
  const script = html.slice(scriptStart + 8, html.lastIndexOf('</script>'));

  const titlesMatch = script.match(/var titles=(\{[\s\S]*?\});\s*\n/);
  const titlesStr = titlesMatch ? titlesMatch[1] : '{}';
  const parentsMatch = script.match(/var parents=(\{[^}]+\})/);
  const parentsStr = parentsMatch ? parentsMatch[1] : '{}';
  const i18nMatch = script.match(/var i18n=(\{[\s\S]*?\});\s*var i18n_r/);
  const i18nStr = i18nMatch ? i18nMatch[1] : '{}';

  let jsx = htmlToJsx(body);
  jsx = fixPageVisibility(jsx);
  jsx = fixNavItems(jsx);
  jsx = fixShowPageCalls(jsx);

  // Customer-specific
  jsx = jsx.replace(/onClick="switchSettings\('([^']+)'\)"/g, "onClick={(e) => switchSettings('$1', e)}");
  jsx = jsx.replace(/onClick="switchTab\(this\)"/g, "onClick={switchTab}");
  jsx = jsx.replace(/onChange="updateCustProfile\(this\)"/g, "onChange={(e) => updateCustProfile(e.target as HTMLInputElement)}");
  jsx = jsx.replace(/onClick="document\.getElementById\('cust-input'\)\.click\(\)"/g, "onClick={() => { const el = document.getElementById('cust-input') as HTMLInputElement; if(el) el.click(); }}");

  // Fix header title/sub
  jsx = jsx.replace(/(<div[^>]*id="page-title"[^>]*>)[^<]+(<\/div>)/g, '$1{pageTitle}$2');
  jsx = jsx.replace(/(<div[^>]*id="page-sub"[^>]*>)[^<]+(<\/div>)/g, '$1{pageSub}$2');

  // Settings tabs
  jsx = jsx.replace(/className="pn stab active" id="stab-([^"]+)"/g, function(m, id) {
    return 'className="pn stab" id="stab-' + id + '" style={{ display: settingsTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });
  jsx = jsx.replace(/className="pn stab" id="stab-([^"]+)" style=\{\{ display: 'none' \}\}/g, function(m, id) {
    return 'className="pn stab" id="stab-' + id + '" style={{ display: settingsTab === \'' + id + '\' ? \'block\' : \'none\' }}';
  });

  // Merge any duplicate style attributes and fix remaining event handlers
  jsx = fixDuplicateStyles(jsx);
  jsx = fixRemainingHandlers(jsx);

  // Fix div imbalance: the original customer portal HTML has an extra </div> in the
  // sidebar nav area. The sequence is: Settings</div></div>\n  </div>\n  <div class="sidebar-footer">
  // We need to remove one of the extra </div> tags so the nav structure is balanced.
  // Pattern: Settings nav-item closes with </div></div> (nav-item + sidebar-nav), then
  // there's an extra </div> before sidebar-footer that needs to be removed.
  jsx = jsx.replace(/(Settings<\/div><\/div>)(\s*)<\/div>(\s*<div className="sidebar-footer")/, '$1$2$3');

  const customerExtras = "  const [settingsTab, setSettingsTab] = useState('cs-profile');\n\n  const switchSettings = (id: string, e: React.MouseEvent) => {\n    setSettingsTab(id);\n    const target = e.currentTarget as HTMLElement;\n    const links = document.querySelectorAll('.settings-link');\n    links.forEach((l: Element) => l.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const switchTab = (e: React.MouseEvent) => {\n    const target = e.currentTarget as HTMLElement;\n    const parent = target.parentElement;\n    if (parent) parent.querySelectorAll('.tab').forEach((t: Element) => t.classList.remove('active'));\n    target.classList.add('active');\n  };\n\n  const updateCustProfile = (input: HTMLInputElement) => {\n    if (input.files && input.files[0]) {\n      const reader = new FileReader();\n      reader.onload = function(e) {\n        const result = e.target ? e.target.result as string : '';\n        const av = document.getElementById('cust-avatar');\n        if (av) av.innerHTML = '<img src=\"' + result + '\" style=\"width:100%;height:100%;object-fit:cover;border-radius:50%\">';\n      };\n      reader.readAsDataURL(input.files[0]);\n    }\n  };\n\n";

  const shared = makeSharedState("CustomerPortal", titlesStr, parentsStr, dedupeI18n(i18nStr));
  const jsxLines = jsx.split('\n').map(function(line) { return '      ' + line; }).join('\n');
  const tsx = shared + customerExtras + "  return (\n    <>\n" + jsxLines + "\n    </>\n  );\n}\n";
  fs.writeFileSync('client/src/portals/CustomerPortal.tsx', tsx);
  console.log('CustomerPortal.tsx written:', tsx.split('\n').length, 'lines');
}

buildOperator();
buildDealer();
buildCustomer();
console.log('All portals built!');
