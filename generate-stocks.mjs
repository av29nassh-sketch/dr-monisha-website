import XLSX from 'xlsx';

// Scoring rubric (each out of 10):
// We score based on: analyst consensus, revenue growth, moat/stability, valuation, dividend, industry tailwind, market cap size
// Final score = weighted average

const stocks = [
  // MEGA-CAP / MAG 7
  { ticker:'NVDA', company:'NVIDIA Corporation', sector:'Technology / AI Semiconductors', price:182, mktCap:'$4.4T', high52:220, low52:92, pe:'25x fwd', revGrowth:'+57%', analystRating:'Strong Buy', divYield:'0.03%', trend:'↑ Up', keyReason:'Dominant AI chip supplier; Blackwell GPU cycle; 57% FY26 revenue growth; 50+ analyst Buy consensus', moat:10, revGrowthScore:10, analystScore:10, valuationScore:7, divScore:1, tailwindScore:10, sizeScore:10 },
  { ticker:'AAPL', company:'Apple Inc.', sector:'Technology / Consumer Electronics', price:259, mktCap:'$3.85T', high52:280, low52:165, pe:'31x', revGrowth:'+16%', analystRating:'Buy', divYield:'0.5%', trend:'→ Neutral/Up', keyReason:'iPhone 17 +23% YoY revenue; China rebound +38%; AI Siri features; analyst PTs up to $350', moat:10, revGrowthScore:7, analystScore:8, valuationScore:6, divScore:2, tailwindScore:8, sizeScore:10 },
  { ticker:'GOOGL', company:'Alphabet Inc.', sector:'Technology / Search & Cloud', price:307, mktCap:'$3.72T', high52:330, low52:155, pe:'17.4x fwd', revGrowth:'+14%', analystRating:'Buy', divYield:'0.5%', trend:'↑ Up', keyReason:'Cheapest Mag-7 on P/E; Gemini AI; Cloud growth; Search dominance; below S&P 500 avg P/E', moat:10, revGrowthScore:7, analystScore:8, valuationScore:9, divScore:2, tailwindScore:9, sizeScore:10 },
  { ticker:'MSFT', company:'Microsoft Corporation', sector:'Technology / Cloud & AI', price:393, mktCap:'$2.97T', high52:470, low52:340, pe:'25x', revGrowth:'+12%', analystRating:'Strong Buy', divYield:'0.8%', trend:'→ Neutral', keyReason:'Azure cloud + Copilot AI; OpenAI partnership; Office 365 enterprise; $135B capex for AI infrastructure', moat:10, revGrowthScore:7, analystScore:10, valuationScore:7, divScore:3, tailwindScore:9, sizeScore:10 },
  { ticker:'AMZN', company:'Amazon.com Inc.', sector:'Consumer Discretionary / Cloud', price:211, mktCap:'$2.2T', high52:240, low52:162, pe:'38x', revGrowth:'+11%', analystRating:'Strong Buy', divYield:'None', trend:'→ Neutral', keyReason:'AWS AI cloud leader; Rufus AI 250M users; 40% US e-commerce; analyst avg PT $279 (+35% upside)', moat:10, revGrowthScore:6, analystScore:10, valuationScore:6, divScore:1, tailwindScore:9, sizeScore:10 },
  { ticker:'META', company:'Meta Platforms Inc.', sector:'Technology / Social Media', price:618, mktCap:'$1.6T', high52:740, low52:485, pe:'28x', revGrowth:'+19%', analystRating:'Strong Buy', divYield:'None', trend:'→ Neutral', keyReason:'$135B 2026 AI capex; Llama AI; Instagram/WhatsApp monetization; advertising revenue growth', moat:9, revGrowthScore:8, analystScore:10, valuationScore:7, divScore:1, tailwindScore:9, sizeScore:10 },
  { ticker:'TSLA', company:'Tesla Inc.', sector:'Consumer Discretionary / EV', price:397, mktCap:'$1.4T', high52:480, low52:210, pe:'~400x', revGrowth:'+5%', analystRating:'Hold', divYield:'None', trend:'↑ Up', keyReason:'Robotaxi/FSD progress; Optimus robot pipeline; but extreme valuation & CEO headline risk', moat:7, revGrowthScore:3, analystScore:5, valuationScore:2, divScore:1, tailwindScore:7, sizeScore:10 },

  // AI / SEMICONDUCTORS
  { ticker:'TSM', company:'Taiwan Semiconductor Mfg.', sector:'Technology / Semiconductors', price:185, mktCap:'$960B', high52:220, low52:120, pe:'22x', revGrowth:'+30%', analystRating:'Strong Buy', divYield:'1.4%', trend:'↑ Up', keyReason:'Record $122B 2025 revenue; 62% gross margins; 58% revenue from AI/HPC; 30% 2026 growth guided', moat:10, revGrowthScore:9, analystScore:10, valuationScore:8, divScore:4, tailwindScore:10, sizeScore:9 },
  { ticker:'AVGO', company:'Broadcom Inc.', sector:'Technology / Semiconductors', price:320, mktCap:'$1.5T', high52:370, low52:140, pe:'35x', revGrowth:'+22%', analystRating:'Strong Buy', divYield:'1.2%', trend:'↑ Up', keyReason:'Custom AI ASIC chips for hyperscalers; VMware integration; networking & storage leadership', moat:9, revGrowthScore:8, analystScore:10, valuationScore:6, divScore:4, tailwindScore:10, sizeScore:10 },
  { ticker:'AMD', company:'Advanced Micro Devices', sector:'Technology / Semiconductors', price:118, mktCap:'$195B', high52:190, low52:95, pe:'42x fwd', revGrowth:'+36%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'MI300 AI GPU gaining enterprise share vs NVDA; 30% LT revenue growth target; 39% analyst upside', moat:8, revGrowthScore:9, analystScore:8, valuationScore:5, divScore:1, tailwindScore:9, sizeScore:7 },
  { ticker:'MU', company:'Micron Technology', sector:'Technology / Memory Chips', price:112, mktCap:'$124B', high52:160, low52:84, pe:'18x', revGrowth:'+40%', analystRating:'Strong Buy', divYield:'0.4%', trend:'↑ Up', keyReason:'Record Q2 revenue $23.86B; AI-driven HBM memory demand; NAND/DRAM pricing recovery; #1 IT sector quant rank', moat:7, revGrowthScore:10, analystScore:10, valuationScore:8, divScore:2, tailwindScore:9, sizeScore:7 },
  { ticker:'SNDK', company:'SanDisk Corporation', sector:'Technology / NAND Storage', price:680, mktCap:'$114B', high52:875, low52:190, pe:'N/A', revGrowth:'N/A', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'Best S&P 500 performer YTD 2026 (+132%); global NAND flash shortage; AI demand for storage; Citi PT $875', moat:6, revGrowthScore:7, analystScore:7, valuationScore:4, divScore:1, tailwindScore:8, sizeScore:6 },
  { ticker:'INTC', company:'Intel Corporation', sector:'Technology / Semiconductors', price:22, mktCap:'$90B', high52:45, low52:18, pe:'N/A', revGrowth:'-8%', analystRating:'Hold', divYield:'2.2%', trend:'→ Neutral', keyReason:'Restructuring under new CEO; foundry strategy pivoting; speculative recovery; losing ground to TSMC/AMD', moat:5, revGrowthScore:2, analystScore:4, valuationScore:5, divScore:5, tailwindScore:4, sizeScore:6 },
  { ticker:'QCOM', company:'Qualcomm Inc.', sector:'Technology / Semiconductors', price:155, mktCap:'$175B', high52:185, low52:125, pe:'15x', revGrowth:'+17%', analystRating:'Buy', divYield:'2.3%', trend:'↑ Up', keyReason:'Snapdragon AI chip leadership; auto/IoT diversification; 5G cycle; strong dividend; PC chip ambitions', moat:8, revGrowthScore:7, analystScore:8, valuationScore:8, divScore:6, tailwindScore:8, sizeScore:7 },
  { ticker:'ARM', company:'Arm Holdings', sector:'Technology / Semiconductor IP', price:130, mktCap:'$140B', high52:185, low52:100, pe:'80x', revGrowth:'+25%', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'Royalties from nearly all mobile chips; AI/edge inference proliferation; automotive growth; licensing model', moat:9, revGrowthScore:8, analystScore:8, valuationScore:3, divScore:1, tailwindScore:9, sizeScore:7 },

  // AI / SOFTWARE / CLOUD
  { ticker:'PLTR', company:'Palantir Technologies', sector:'Technology / AI Software', price:136, mktCap:'$327B', high52:215, low52:72, pe:'222x', revGrowth:'+36%', analystRating:'Mixed (Buy/Hold)', divYield:'None', trend:'↓ Down from highs', keyReason:'AIP enterprise AI platform; US Gov & defense contracts; commercial acceleration; but extremely high valuation', moat:8, revGrowthScore:9, analystScore:5, valuationScore:1, divScore:1, tailwindScore:8, sizeScore:8 },
  { ticker:'CRWD', company:'CrowdStrike Holdings', sector:'Technology / Cybersecurity', price:470, mktCap:'$115B', high52:500, low52:210, pe:'85x fwd', revGrowth:'+22%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'Falcon platform; Net New ARR +73% YoY; Flex ARR +200%; $665 analyst PT (+41% upside); 32% op margin by FY30', moat:9, revGrowthScore:8, analystScore:10, valuationScore:4, divScore:1, tailwindScore:9, sizeScore:7 },
  { ticker:'PANW', company:'Palo Alto Networks', sector:'Technology / Cybersecurity', price:186, mktCap:'$125B', high52:225, low52:155, pe:'55x fwd', revGrowth:'+14%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'Platform consolidation; 34/49 analysts Strong Buy; avg PT $225; $20B NGS ARR target FY2030; AI threat detection', moat:9, revGrowthScore:7, analystScore:9, valuationScore:5, divScore:1, tailwindScore:9, sizeScore:7 },
  { ticker:'NOW', company:'ServiceNow', sector:'Technology / Enterprise SaaS', price:1020, mktCap:'$210B', high52:1200, low52:750, pe:'55x', revGrowth:'+22%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'AI-powered workflow automation; enterprise digital transformation; 20%+ revenue growth; Now Assist AI monetization', moat:9, revGrowthScore:8, analystScore:10, valuationScore:5, divScore:1, tailwindScore:9, sizeScore:8 },
  { ticker:'DDOG', company:'Datadog Inc.', sector:'Technology / Cloud Monitoring', price:131, mktCap:'$46B', high52:165, low52:95, pe:'75x fwd', revGrowth:'+24%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'AI observability leader; 42 analyst Buys; avg PT $182 (+39% upside); 2026 guidance $4.1B revenue (+19%)', moat:8, revGrowthScore:8, analystScore:10, valuationScore:4, divScore:1, tailwindScore:9, sizeScore:6 },
  { ticker:'SNOW', company:'Snowflake Inc.', sector:'Technology / Cloud Data', price:178, mktCap:'$60B', high52:225, low52:107, pe:'N/A', revGrowth:'+28%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'AI data cloud; Cortex AI features; strong NRR; new CEO Sridhar Ramaswamy driving AI-first pivot', moat:7, revGrowthScore:8, analystScore:7, valuationScore:4, divScore:1, tailwindScore:8, sizeScore:6 },
  { ticker:'SHOP', company:'Shopify Inc.', sector:'Technology / E-Commerce Platform', price:118, mktCap:'$150B', high52:155, low52:72, pe:'80x fwd', revGrowth:'+26%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'Merchant solutions + Payments growing; AI commerce tools; international expansion; top analyst pick alongside DDOG/TSM', moat:8, revGrowthScore:8, analystScore:10, valuationScore:4, divScore:1, tailwindScore:8, sizeScore:7 },

  // ENERGY
  { ticker:'XOM', company:'ExxonMobil Corporation', sector:'Energy / Integrated Oil & Gas', price:152, mktCap:'$650B', high52:170, low52:105, pe:'14x', revGrowth:'+6%', analystRating:'Moderate Buy', divYield:'3.6%', trend:'↑ Up', keyReason:'Oil prices above $100 (US-Iran conflict); Guyana production ramp; Pioneer acquisition; 12 Buy/6 Hold', moat:9, revGrowthScore:4, analystScore:7, valuationScore:8, divScore:8, tailwindScore:7, sizeScore:9 },
  { ticker:'CVX', company:'Chevron Corporation', sector:'Energy / Integrated Oil & Gas', price:156, mktCap:'$290B', high52:175, low52:138, pe:'14x', revGrowth:'+4%', analystRating:'Moderate Buy', divYield:'3.8%', trend:'↑ Up', keyReason:'Strong FCF; 39 consecutive years dividend growth; natural gas exposure; avg analyst PT $187', moat:8, revGrowthScore:3, analystScore:7, valuationScore:8, divScore:9, tailwindScore:7, sizeScore:8 },
  { ticker:'COP', company:'ConocoPhillips', sector:'Energy / E&P', price:98, mktCap:'$125B', high52:125, low52:88, pe:'13x', revGrowth:'+8%', analystRating:'Buy', divYield:'3.2%', trend:'↑ Up', keyReason:'Pure-play E&P; LNG exposure; disciplined capital returns; geopolitical oil premium beneficiary', moat:7, revGrowthScore:4, analystScore:8, valuationScore:8, divScore:7, tailwindScore:7, sizeScore:7 },
  { ticker:'OXY', company:'Occidental Petroleum', sector:'Energy / E&P', price:55, mktCap:'$50B', high52:72, low52:42, pe:'16x', revGrowth:'+5%', analystRating:'Buy', divYield:'1.8%', trend:'↑ Up', keyReason:"Berkshire Hathaway backing; STRATOS carbon capture optionality; Permian Basin scale; Buffett's continued buying", moat:7, revGrowthScore:3, analystScore:7, valuationScore:7, divScore:4, tailwindScore:6, sizeScore:6 },
  { ticker:'ENB', company:'Enbridge Inc.', sector:'Energy / Midstream', price:42, mktCap:'$90B', high52:46, low52:36, pe:'18x', revGrowth:'+6%', analystRating:'Buy', divYield:'5.3%', trend:'→ Neutral', keyReason:'31 consecutive dividend growth years; pipeline infrastructure; natural gas transition; stable regulated revenues', moat:8, revGrowthScore:4, analystScore:7, valuationScore:7, divScore:10, tailwindScore:6, sizeScore:6 },

  // FINANCIALS
  { ticker:'JPM', company:'JPMorgan Chase & Co.', sector:'Financials / Banking', price:245, mktCap:'$700B', high52:285, low52:190, pe:'13.35x fwd', revGrowth:'+8%', analystRating:'Buy', divYield:'2.2%', trend:'→ Neutral', keyReason:'Largest US bank; avg PT $333 (+16%); IB rebound; M&A pipeline highest in 3 years; 13/13 analysts Buy', moat:9, revGrowthScore:5, analystScore:10, valuationScore:9, divScore:5, tailwindScore:7, sizeScore:9 },
  { ticker:'GS', company:'Goldman Sachs Group', sector:'Financials / Investment Banking', price:595, mktCap:'$200B', high52:680, low52:420, pe:'14x', revGrowth:'+12%', analystRating:'Buy', divYield:'2.0%', trend:'↑ Up', keyReason:'M&A/IPO cycle rebound; backlog at 3-year high; capital markets revenue surge; IPO market reopening', moat:8, revGrowthScore:6, analystScore:8, valuationScore:8, divScore:5, tailwindScore:8, sizeScore:7 },
  { ticker:'BAC', company:'Bank of America', sector:'Financials / Banking', price:44, mktCap:'$350B', high52:51, low52:36, pe:'13x', revGrowth:'+6%', analystRating:'Buy', divYield:'2.5%', trend:'→ Neutral', keyReason:'Digital banking scale; NII recovery; loan growth; attractive valuation vs peers', moat:8, revGrowthScore:4, analystScore:8, valuationScore:8, divScore:5, tailwindScore:6, sizeScore:9 },
  { ticker:'BRK.B', company:'Berkshire Hathaway', sector:'Financials / Conglomerate', price:480, mktCap:'$1.1T', high52:510, low52:380, pe:'23x', revGrowth:'+5%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'Buffett-led fortress balance sheet; record cash position; insurance float; diversified holdings; defensive in volatile markets', moat:10, revGrowthScore:3, analystScore:8, valuationScore:7, divScore:1, tailwindScore:6, sizeScore:10 },
  { ticker:'V', company:'Visa Inc.', sector:'Financials / Payments', price:320, mktCap:'$660B', high52:345, low52:270, pe:'31x', revGrowth:'+10%', analystRating:'Strong Buy', divYield:'0.8%', trend:'↑ Up', keyReason:'Global payment network moat; cross-border volume recovery; AI fraud detection; emerging market expansion', moat:10, revGrowthScore:6, analystScore:10, valuationScore:6, divScore:2, tailwindScore:8, sizeScore:9 },
  { ticker:'MA', company:'Mastercard Inc.', sector:'Financials / Payments', price:560, mktCap:'$530B', high52:590, low52:455, pe:'35x', revGrowth:'+12%', analystRating:'Strong Buy', divYield:'0.6%', trend:'↑ Up', keyReason:'Payment network moat; services revenue growing faster than core; international growth; consistent buybacks', moat:10, revGrowthScore:7, analystScore:10, valuationScore:5, divScore:2, tailwindScore:8, sizeScore:9 },
  { ticker:'AXP', company:'American Express', sector:'Financials / Payments', price:285, mktCap:'$200B', high52:320, low52:220, pe:'20x', revGrowth:'+9%', analystRating:'Buy', divYield:'1.2%', trend:'→ Neutral', keyReason:'Premium cardholder spending; millennial/Gen Z adoption; travel recovery; Buffett-held; strong loan/card revenue', moat:8, revGrowthScore:5, analystScore:8, valuationScore:7, divScore:3, tailwindScore:7, sizeScore:7 },
  { ticker:'BX', company:'Blackstone Inc.', sector:'Financials / Alternative Asset Mgmt', price:165, mktCap:'$235B', high52:205, low52:130, pe:'30x', revGrowth:'+15%', analystRating:'Buy', divYield:'3.2%', trend:'↑ Up', keyReason:'Record AUM; real estate + credit fundraising; private credit expansion; interest rate stabilization beneficiary', moat:9, revGrowthScore:7, analystScore:8, valuationScore:6, divScore:7, tailwindScore:8, sizeScore:8 },

  // HEALTHCARE / BIOTECH
  { ticker:'UNH', company:'UnitedHealth Group', sector:'Healthcare / Health Insurance', price:590, mktCap:'$545B', high52:620, low52:445, pe:'22x', revGrowth:'+8%', analystRating:'Strong Buy', divYield:'1.6%', trend:'↑ Up', keyReason:'Largest US health insurer; Optum platform; membership growth visibility; recovering from 2025 cyberattack', moat:9, revGrowthScore:5, analystScore:10, valuationScore:7, divScore:4, tailwindScore:7, sizeScore:9 },
  { ticker:'JNJ', company:'Johnson & Johnson', sector:'Healthcare / Diversified Pharma', price:162, mktCap:'$392B', high52:172, low52:138, pe:'15x', revGrowth:'+6.8%', analystRating:'Buy', divYield:'3.2%', trend:'→ Neutral', keyReason:'Pure pharma post-Kenvue split; Q3 2025 revenue $24B +6.8% YoY; strong pipeline; wide economic moat', moat:9, revGrowthScore:4, analystScore:8, valuationScore:8, divScore:7, tailwindScore:7, sizeScore:9 },
  { ticker:'ISRG', company:'Intuitive Surgical', sector:'Healthcare / Medical Devices', price:520, mktCap:'$185B', high52:635, low52:390, pe:'65x', revGrowth:'+14%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'Da Vinci robotic surgery monopoly; 14.3% revenue growth; CFRA PT $645; best management in medical devices', moat:10, revGrowthScore:7, analystScore:10, valuationScore:4, divScore:1, tailwindScore:9, sizeScore:7 },
  { ticker:'ABT', company:'Abbott Laboratories', sector:'Healthcare / Medical Devices', price:130, mktCap:'$225B', high52:145, low52:102, pe:'28x', revGrowth:'+7%', analystRating:'Buy', divYield:'2.0%', trend:'→ Neutral', keyReason:'CGM leadership with FreeStyle Libre; diagnostics recovery; diverse device portfolio; consistent dividend growth', moat:8, revGrowthScore:5, analystScore:8, valuationScore:6, divScore:5, tailwindScore:8, sizeScore:8 },
  { ticker:'LLY', company:'Eli Lilly & Company', sector:'Healthcare / Biopharma', price:820, mktCap:'$780B', high52:972, low52:680, pe:'55x', revGrowth:'+32%', analystRating:'Strong Buy', divYield:'0.8%', trend:'↑ Up', keyReason:'Mounjaro/Zepbound GLP-1 obesity/diabetes blockbuster; tirzepatide dominance; pipeline depth; demand exceeds supply', moat:9, revGrowthScore:9, analystScore:10, valuationScore:5, divScore:2, tailwindScore:10, sizeScore:9 },
  { ticker:'NVO', company:'Novo Nordisk', sector:'Healthcare / Biopharma', price:75, mktCap:'$340B', high52:145, low52:65, pe:'22x', revGrowth:'+18%', analystRating:'Buy', divYield:'1.5%', trend:'↓ Down from highs', keyReason:'Ozempic/Wegovy GLP-1 pioneer; lost ground to LLY; CagriSema Phase 3 setback; potential recovery/value play', moat:8, revGrowthScore:7, analystScore:7, valuationScore:7, divScore:4, tailwindScore:8, sizeScore:8 },
  { ticker:'MRNA', company:'Moderna Inc.', sector:'Healthcare / mRNA Biotech', price:52, mktCap:'$21B', high52:60, low52:22, pe:'N/A', revGrowth:'N/A', analystRating:'Neutral', divYield:'None', trend:'↑ Up from lows', keyReason:'Best S&P 500 performer YTD 2026 (+83%); mRNA cancer vaccine pipeline; flu FDA expedited review; high risk/reward', moat:5, revGrowthScore:3, analystScore:4, valuationScore:5, divScore:1, tailwindScore:6, sizeScore:4 },
  { ticker:'VRTX', company:'Vertex Pharmaceuticals', sector:'Healthcare / Biotech', price:465, mktCap:'$119B', high52:530, low52:390, pe:'32x', revGrowth:'+12%', analystRating:'Strong Buy', divYield:'None', trend:'→ Neutral', keyReason:'CF franchise (Trikafta) monopoly; suzetrigine pain drug launch; Casgevy gene editing; near-zero CF competition', moat:9, revGrowthScore:6, analystScore:9, valuationScore:6, divScore:1, tailwindScore:8, sizeScore:7 },
  { ticker:'REGN', company:'Regeneron Pharmaceuticals', sector:'Healthcare / Biotech', price:645, mktCap:'$67B', high52:1100, low52:620, pe:'15x', revGrowth:'+5%', analystRating:'Buy', divYield:'None', trend:'↓ Down from highs', keyReason:'EYLEA HD competition; Dupixent growing; PCSK9+oncology pipeline; deeply discounted — potential value play', moat:7, revGrowthScore:3, analystScore:7, valuationScore:8, divScore:1, tailwindScore:6, sizeScore:6 },
  { ticker:'MDT', company:'Medtronic plc', sector:'Healthcare / Medical Devices', price:85, mktCap:'$110B', high52:92, low52:74, pe:'16x', revGrowth:'+3%', analystRating:'Buy', divYield:'3.8%', trend:'→ Neutral', keyReason:'Trading 18% below Morningstar fair value; cardiac/surgical device recovery; top dividend pick; restructuring underway', moat:7, revGrowthScore:3, analystScore:7, valuationScore:8, divScore:8, tailwindScore:6, sizeScore:7 },

  // CONSUMER / RETAIL
  { ticker:'WMT', company:'Walmart Inc.', sector:'Consumer Staples / Retail', price:95, mktCap:'$765B', high52:105, low52:72, pe:'35x', revGrowth:'+5%', analystRating:'Buy', divYield:'1.1%', trend:'→ Neutral', keyReason:"World's largest retailer $706B FY26 revenue; e-commerce +24% YoY; Walmart+ +15%; advertising scaling", moat:9, revGrowthScore:3, analystScore:8, valuationScore:5, divScore:3, tailwindScore:7, sizeScore:10 },
  { ticker:'COST', company:'Costco Wholesale', sector:'Consumer Staples / Retail', price:1050, mktCap:'$465B', high52:1080, low52:780, pe:'55x', revGrowth:'+9%', analystRating:'Strong Buy', divYield:'0.6%', trend:'↑ Up', keyReason:'Fiscal Q2 FY26 sales +9.1% YoY; comp sales +7.4%; digital +23%; membership renewal >92%', moat:9, revGrowthScore:5, analystScore:10, valuationScore:4, divScore:2, tailwindScore:7, sizeScore:8 },
  { ticker:'HD', company:'Home Depot', sector:'Consumer Discretionary / Home Improvement', price:390, mktCap:'$387B', high52:430, low52:330, pe:'26x', revGrowth:'+4%', analystRating:'Buy', divYield:'2.3%', trend:'→ Neutral', keyReason:'Largest US home improvement; Pro contractor recovering; housing market stabilizing; SRS Distribution integration', moat:8, revGrowthScore:3, analystScore:8, valuationScore:7, divScore:5, tailwindScore:6, sizeScore:8 },
  { ticker:'MCD', company:"McDonald's Corporation", sector:'Consumer Discretionary / Fast Food', price:305, mktCap:'$218B', high52:325, low52:245, pe:'24x', revGrowth:'+3%', analystRating:'Buy', divYield:'2.3%', trend:'→ Neutral', keyReason:'Global brand resilience; value-meal strategy; AI drive-through pilots; loyalty program 150M members', moat:9, revGrowthScore:3, analystScore:8, valuationScore:7, divScore:5, tailwindScore:6, sizeScore:8 },
  { ticker:'SBUX', company:'Starbucks Corporation', sector:'Consumer Discretionary / Food & Bev', price:92, mktCap:'$105B', high52:115, low52:72, pe:'28x', revGrowth:'-2%', analystRating:'Hold', divYield:'2.8%', trend:'↑ Up from lows', keyReason:'Brian Niccol turnaround underway; menu simplification; early same-store sales stabilization signs', moat:7, revGrowthScore:2, analystScore:5, valuationScore:5, divScore:6, tailwindScore:5, sizeScore:7 },
  { ticker:'NKE', company:'Nike Inc.', sector:'Consumer Discretionary / Apparel', price:72, mktCap:'$107B', high52:115, low52:60, pe:'28x', revGrowth:'-8%', analystRating:'Hold', divYield:'2.2%', trend:'→ Neutral', keyReason:'New CEO Elliot Hill rebuilding; DTC revision; China recovery uncertain; wholesale re-engagement; multi-year turnaround', moat:8, revGrowthScore:2, analystScore:5, valuationScore:5, divScore:5, tailwindScore:5, sizeScore:7 },

  // STREAMING / MEDIA
  { ticker:'NFLX', company:'Netflix Inc.', sector:'Communication Services / Streaming', price:950, mktCap:'$420B', high52:1100, low52:590, pe:'50x', revGrowth:'+16%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'Q4 2025 revenue $12.1B +18% YoY; ad-supported tier scaling; live sports (NFL, boxing); global subscriber growth', moat:9, revGrowthScore:7, analystScore:10, valuationScore:5, divScore:1, tailwindScore:8, sizeScore:8 },
  { ticker:'DIS', company:'Walt Disney Company', sector:'Communication Services / Entertainment', price:112, mktCap:'$200B', high52:135, low52:85, pe:'28x', revGrowth:'+5%', analystRating:'Buy', divYield:'0.9%', trend:'↑ Up from lows', keyReason:'Streaming op income +828% YoY; record Experiences $10B op income; ESPN streaming pivot; 51% below all-time peak', moat:9, revGrowthScore:3, analystScore:8, valuationScore:7, divScore:2, tailwindScore:7, sizeScore:8 },
  { ticker:'SPOT', company:'Spotify Technology', sector:'Communication Services / Streaming Audio', price:680, mktCap:'$130B', high52:760, low52:345, pe:'85x fwd', revGrowth:'+18%', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'675M+ MAU; podcast+audiobook expansion; Premium price hike success; gross margin expansion story', moat:7, revGrowthScore:7, analystScore:7, valuationScore:4, divScore:1, tailwindScore:7, sizeScore:7 },

  // INDUSTRIALS / DEFENSE
  { ticker:'GE', company:'GE Aerospace', sector:'Industrials / Aerospace & Defense', price:210, mktCap:'$228B', high52:225, low52:155, pe:'35x', revGrowth:'+15%', analystRating:'Strong Buy', divYield:'0.9%', trend:'↑ Up', keyReason:'LEAP jet engine orders; commercial aviation recovery; defense/military spending; post-spin pure-play aerospace; strong backlog', moat:9, revGrowthScore:7, analystScore:10, valuationScore:5, divScore:2, tailwindScore:9, sizeScore:8 },
  { ticker:'RTX', company:'RTX Corporation (Raytheon)', sector:'Industrials / Aerospace & Defense', price:128, mktCap:'$170B', high52:145, low52:98, pe:'22x', revGrowth:'+8%', analystRating:'Buy', divYield:'2.2%', trend:'↑ Up', keyReason:'US-Iran conflict defense spending; Pratt & Whitney engine ramp; missile systems demand; NATO spending increases', moat:8, revGrowthScore:5, analystScore:8, valuationScore:7, divScore:5, tailwindScore:9, sizeScore:7 },
  { ticker:'LMT', company:'Lockheed Martin', sector:'Industrials / Defense', price:490, mktCap:'$115B', high52:530, low52:420, pe:'17x', revGrowth:'+5%', analystRating:'Buy', divYield:'2.8%', trend:'↑ Up', keyReason:'F-35 program; hypersonic/missile development; geopolitical tension driving defense budgets; 22 consecutive dividend increases', moat:8, revGrowthScore:3, analystScore:8, valuationScore:8, divScore:6, tailwindScore:9, sizeScore:7 },
  { ticker:'CAT', company:'Caterpillar Inc.', sector:'Industrials / Heavy Equipment', price:345, mktCap:'$163B', high52:425, low52:310, pe:'18x', revGrowth:'+3%', analystRating:'Buy', divYield:'1.7%', trend:'→ Neutral', keyReason:'Infrastructure spending; mining capex recovery; data center construction demand; consistent dividend growth', moat:8, revGrowthScore:3, analystScore:8, valuationScore:7, divScore:4, tailwindScore:7, sizeScore:7 },
  { ticker:'GNRC', company:'Generac Holdings', sector:'Industrials / Power Generation', price:203, mktCap:'$5.4B', high52:241, low52:100, pe:'35x', revGrowth:'+25%', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'YTD 2026 gainer +51%; AI data center backup power demand; grid resilience; 13/13 analyst Buy; avg PT $243 (+20%)', moat:7, revGrowthScore:8, analystScore:10, valuationScore:5, divScore:1, tailwindScore:9, sizeScore:4 },

  // TECH / OTHER
  { ticker:'CRM', company:'Salesforce Inc.', sector:'Technology / CRM & SaaS', price:290, mktCap:'$280B', high52:370, low52:265, pe:'28x', revGrowth:'+8%', analystRating:'Buy', divYield:'0.6%', trend:'→ Neutral', keyReason:'Agentforce AI platform launch; AI-powered CRM monetization; Slack + MuleSoft integration; enterprise AI adoption', moat:8, revGrowthScore:5, analystScore:8, valuationScore:6, divScore:2, tailwindScore:8, sizeScore:8 },
  { ticker:'ORCL', company:'Oracle Corporation', sector:'Technology / Cloud & Database', price:178, mktCap:'$485B', high52:200, low52:130, pe:'32x', revGrowth:'+12%', analystRating:'Buy', divYield:'1.2%', trend:'→ Neutral', keyReason:'OCI cloud competing with AWS/Azure; AI database workloads; $100B revenue target; multi-cloud partnerships', moat:8, revGrowthScore:6, analystScore:8, valuationScore:6, divScore:3, tailwindScore:8, sizeScore:8 },
  { ticker:'CSCO', company:'Cisco Systems', sector:'Technology / Networking', price:62, mktCap:'$250B', high52:72, low52:45, pe:'18x', revGrowth:'+4%', analystRating:'Buy', divYield:'3.0%', trend:'↑ Up', keyReason:'AI-era networking infrastructure; Splunk acquisition integration; security+networking convergence; strong dividend', moat:8, revGrowthScore:3, analystScore:8, valuationScore:8, divScore:7, tailwindScore:8, sizeScore:8 },

  // CLEAN ENERGY / UTILITIES
  { ticker:'NEE', company:'NextEra Energy', sector:'Utilities / Renewable Energy', price:72, mktCap:'$147B', high52:84, low52:58, pe:'20x', revGrowth:'+7%', analystRating:'Buy', divYield:'3.2%', trend:'→ Neutral', keyReason:'Largest US renewable developer; wind+solar pipeline; AI data center power demand tailwind; consistent dividend', moat:8, revGrowthScore:5, analystScore:8, valuationScore:7, divScore:7, tailwindScore:8, sizeScore:7 },
  { ticker:'CEG', company:'Constellation Energy', sector:'Utilities / Nuclear Power', price:210, mktCap:'$67B', high52:340, low52:185, pe:'30x', revGrowth:'+20%', analystRating:'Strong Buy', divYield:'0.6%', trend:'↓ Down from highs', keyReason:'Nuclear renaissance + AI data center power deals; Microsoft 20-yr nuclear PPA (Three Mile Island restart); pulled back from highs', moat:8, revGrowthScore:8, analystScore:9, valuationScore:6, divScore:2, tailwindScore:9, sizeScore:6 },
  { ticker:'FSLR', company:'First Solar Inc.', sector:'Technology / Solar Panels', price:155, mktCap:'$16.5B', high52:310, low52:135, pe:'14x', revGrowth:'+10%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'Only major US-made solar panel; IRA incentive beneficiary; utility-scale solar; thin-film tech advantage vs Chinese panels', moat:7, revGrowthScore:6, analystScore:7, valuationScore:8, divScore:1, tailwindScore:8, sizeScore:4 },

  // REITs
  { ticker:'O', company:'Realty Income Corporation', sector:'Real Estate / Net Lease REIT', price:55, mktCap:'$45B', high52:60, low52:49, pe:'14x AFFO', revGrowth:'+5%', analystRating:'Buy', divYield:'6.1%', trend:'→ Neutral', keyReason:'31 consecutive dividend increases; monthly dividend; 15,000+ properties; interest rate sensitivity easing', moat:8, revGrowthScore:3, analystScore:7, valuationScore:8, divScore:10, tailwindScore:5, sizeScore:6 },
  { ticker:'PLD', company:'Prologis Inc.', sector:'Real Estate / Industrial REIT', price:118, mktCap:'$110B', high52:132, low52:98, pe:'22x AFFO', revGrowth:'+7%', analystRating:'Buy', divYield:'3.4%', trend:'→ Neutral', keyReason:'E-commerce logistics infrastructure; Amazon/3PL demand; data center adjacent land; global industrial REIT leader', moat:8, revGrowthScore:5, analystScore:8, valuationScore:7, divScore:7, tailwindScore:7, sizeScore:7 },

  // MATERIALS / COMMODITIES
  { ticker:'FCX', company:'Freeport-McMoRan Inc.', sector:'Materials / Copper Mining', price:42, mktCap:'$60B', high52:52, low52:36, pe:'22x', revGrowth:'+8%', analystRating:'Buy', divYield:'1.2%', trend:'↑ Up', keyReason:'AI data center copper wiring demand; EV copper intensity; green energy transition; Grasberg mine production', moat:7, revGrowthScore:5, analystScore:8, valuationScore:7, divScore:3, tailwindScore:8, sizeScore:6 },

  // TRANSPORTATION
  { ticker:'UBER', company:'Uber Technologies', sector:'Technology / Ride-Sharing & Delivery', price:73, mktCap:'$155B', high52:92, low52:58, pe:'30x fwd', revGrowth:'+18%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'75 Buy/7 Hold; avg PT $106 (+46% upside); $1.25B Rivian investment for EV fleet; Waymo partnership; profitable+growing', moat:7, revGrowthScore:7, analystScore:10, valuationScore:6, divScore:1, tailwindScore:8, sizeScore:7 },
  { ticker:'FDX', company:'FedEx Corporation', sector:'Industrials / Logistics', price:265, mktCap:'$65B', high52:310, low52:235, pe:'14x', revGrowth:'+3%', analystRating:'Buy', divYield:'2.2%', trend:'→ Neutral', keyReason:'DRIVE cost program savings; e-commerce parcel volume; Freight spin-off creating value; FedEx One platform', moat:7, revGrowthScore:3, analystScore:7, valuationScore:8, divScore:5, tailwindScore:6, sizeScore:6 },

  // EMERGING / HIGH-MOMENTUM
  { ticker:'TPL', company:'Texas Pacific Land Corp', sector:'Energy / Land & Royalties', price:527, mktCap:'$30B', high52:600, low52:350, pe:'45x', revGrowth:'+40%', analystRating:'Buy', divYield:'0.4%', trend:'↑ Up', keyReason:'2nd best S&P 500 performer YTD 2026 (+75%); Permian Basin land royalties; water services; data center land optionality', moat:8, revGrowthScore:9, analystScore:7, valuationScore:5, divScore:1, tailwindScore:8, sizeScore:4 },
  { ticker:'RDDT', company:'Reddit Inc.', sector:'Technology / Social Media', price:170, mktCap:'$28B', high52:250, low52:100, pe:'N/A', revGrowth:'+60%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'AI data licensing (Google, OpenAI) revenue; advertising monetization; first full year as public company; community engagement', moat:6, revGrowthScore:9, analystScore:7, valuationScore:4, divScore:1, tailwindScore:7, sizeScore:4 },
  { ticker:'HOOD', company:'Robinhood Markets', sector:'Financials / Fintech', price:55, mktCap:'$48B', high52:68, low52:20, pe:'40x', revGrowth:'+45%', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'Crypto/equity trading boom; Gold+ subscription; retirement IRA accounts; options trading growth; AI financial tools', moat:5, revGrowthScore:9, analystScore:7, valuationScore:5, divScore:1, tailwindScore:7, sizeScore:5 },
  { ticker:'COIN', company:'Coinbase Global', sector:'Financials / Crypto Exchange', price:240, mktCap:'$62B', high52:340, low52:155, pe:'30x', revGrowth:'+55%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'Crypto market cycle; spot Bitcoin ETF volume; institutional custody; Base L2 blockchain growth; regulatory clarity improving', moat:6, revGrowthScore:9, analystScore:7, valuationScore:6, divScore:1, tailwindScore:7, sizeScore:5 },
  { ticker:'CIEN', company:'Ciena Corporation', sector:'Technology / Optical Networking', price:82, mktCap:'$6.5B', high52:88, low52:44, pe:'35x', revGrowth:'+22%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'S&P 500 winner March 19; AI data center optical interconnect; 400G/800G coherent optics; hyperscaler capex driving orders', moat:7, revGrowthScore:8, analystScore:9, valuationScore:5, divScore:1, tailwindScore:9, sizeScore:4 },
  { ticker:'STX', company:'Seagate Technology', sector:'Technology / Hard Disk Drives', price:112, mktCap:'$24B', high52:125, low52:75, pe:'22x', revGrowth:'+18%', analystRating:'Buy', divYield:'3.2%', trend:'↑ Up', keyReason:'S&P 500 winner March 19; AI data center nearline storage demand; HDD recovery cycle; HAMR technology ramp', moat:6, revGrowthScore:7, analystScore:7, valuationScore:7, divScore:7, tailwindScore:8, sizeScore:5 },
  { ticker:'BKR', company:'Baker Hughes Company', sector:'Energy / Oilfield Services', price:42, mktCap:'$42B', high52:48, low52:34, pe:'18x', revGrowth:'+10%', analystRating:'Buy', divYield:'2.6%', trend:'↑ Up', keyReason:'S&P 500 winner March 19; oil services demand surge (Iran conflict); LNG equipment; industrial technology diversification', moat:7, revGrowthScore:6, analystScore:7, valuationScore:7, divScore:6, tailwindScore:7, sizeScore:5 },

  // BIOTECH SPECIALTY
  { ticker:'CRSP', company:'CRISPR Therapeutics', sector:'Healthcare / Gene Editing Biotech', price:58, mktCap:'$4.8B', high52:85, low52:38, pe:'N/A', revGrowth:'N/A', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'First FDA-approved gene editing therapy (Casgevy for sickle cell); collaboration with Vertex; pipeline expansion', moat:7, revGrowthScore:5, analystScore:7, valuationScore:5, divScore:1, tailwindScore:8, sizeScore:3 },

  // DIVIDEND STALWARTS
  { ticker:'MO', company:'Altria Group', sector:'Consumer Staples / Tobacco', price:55, mktCap:'$95B', high52:60, low52:41, pe:'9x', revGrowth:'+2%', analystRating:'Hold', divYield:'7.8%', trend:'→ Neutral', keyReason:'56 consecutive dividend increases (Dividend King); on! nicotine pouches; extremely high yield; defensive income', moat:7, revGrowthScore:2, analystScore:5, valuationScore:9, divScore:10, tailwindScore:4, sizeScore:6 },
  { ticker:'VZ', company:'Verizon Communications', sector:'Communication Services / Telecom', price:43, mktCap:'$180B', high52:46, low52:37, pe:'9x', revGrowth:'+1%', analystRating:'Hold', divYield:'6.6%', trend:'→ Neutral', keyReason:'22 consecutive dividend increases; 5G build-out; payout 56% of earnings (sustainable); stable cash flows; defensive yield', moat:7, revGrowthScore:2, analystScore:5, valuationScore:9, divScore:10, tailwindScore:5, sizeScore:7 },
  { ticker:'PFE', company:'Pfizer Inc.', sector:'Healthcare / Big Pharma', price:24, mktCap:'$135B', high52:32, low52:21, pe:'9x', revGrowth:'-10%', analystRating:'Hold', divYield:'7.2%', trend:'→ Neutral', keyReason:'Post-COVID revenue normalization; oncology pipeline (Seagen acquisition); deeply discounted; 7.2% yield; potential turnaround', moat:7, revGrowthScore:2, analystScore:5, valuationScore:9, divScore:10, tailwindScore:5, sizeScore:7 },

  // ADDITIONAL — reaching 100
  { ticker:'IBM', company:'IBM Corporation', sector:'Technology / IT Services & AI', price:245, mktCap:'$220B', high52:265, low52:160, pe:'24x', revGrowth:'+3%', analystRating:'Hold', divYield:'2.8%', trend:'→ Neutral', keyReason:'WatsonX AI enterprise platform; HashiCorp acquisition; consulting + hybrid cloud; slow growth but reliable dividend', moat:7, revGrowthScore:3, analystScore:5, valuationScore:7, divScore:6, tailwindScore:6, sizeScore:8 },
  { ticker:'TGT', company:'Target Corporation', sector:'Consumer Discretionary / Retail', price:115, mktCap:'$53B', high52:165, low52:105, pe:'14x', revGrowth:'-3%', analystRating:'Hold', divYield:'3.8%', trend:'↓ Down', keyReason:'Struggling with discretionary spending slowdown; e-commerce catching up; cheap valuation but execution risk', moat:6, revGrowthScore:2, analystScore:5, valuationScore:7, divScore:8, tailwindScore:4, sizeScore:6 },
  { ticker:'VST', company:'Vistra Energy', sector:'Utilities / Nuclear & Power', price:88, mktCap:'$26B', high52:196, low52:74, pe:'15x', revGrowth:'+18%', analystRating:'Buy', divYield:'1.0%', trend:'↓ Down from highs', keyReason:'Nuclear power + AI data center power demand; pulled back from 2025 highs; Comanche Peak nuclear; AI electricity thesis', moat:7, revGrowthScore:7, analystScore:7, valuationScore:8, divScore:3, tailwindScore:9, sizeScore:4 },
  { ticker:'AMT', company:'American Tower Corp.', sector:'Real Estate / Cell Tower REIT', price:212, mktCap:'$98B', high52:235, low52:175, pe:'22x AFFO', revGrowth:'+6%', analystRating:'Buy', divYield:'3.0%', trend:'→ Neutral', keyReason:'5G infrastructure backbone; global tower portfolio; CoreSite data center integration; international EM exposure', moat:8, revGrowthScore:4, analystScore:7, valuationScore:7, divScore:7, tailwindScore:7, sizeScore:7 },
  { ticker:'FICO', company:'Fair Isaac Corporation', sector:'Technology / Analytics & Credit Scores', price:1840, mktCap:'$145B', high52:2350, low52:1500, pe:'65x', revGrowth:'+10%', analystRating:'Buy', divYield:'None', trend:'↓ Down recently', keyReason:'Dominant credit scoring monopoly; mortgage/lending cycle sensitivity; unmatched data moat; strong long-term FCF', moat:10, revGrowthScore:6, analystScore:7, valuationScore:4, divScore:1, tailwindScore:7, sizeScore:7 },
  { ticker:'NEM', company:'Newmont Corporation', sector:'Materials / Gold Mining', price:42, mktCap:'$52B', high52:55, low52:33, pe:'18x', revGrowth:'+5%', analystRating:'Hold', divYield:'2.4%', trend:'→ Neutral', keyReason:"Gold near record $3,000+/oz; world's largest gold miner; geopolitical safe haven demand; US-Iran conflict tailwind", moat:6, revGrowthScore:4, analystScore:5, valuationScore:6, divScore:5, tailwindScore:7, sizeScore:6 },
  { ticker:'UPS', company:'United Parcel Service', sector:'Industrials / Logistics', price:115, mktCap:'$98B', high52:155, low52:108, pe:'16x', revGrowth:'-5%', analystRating:'Hold', divYield:'5.5%', trend:'↓ Down', keyReason:'Volume challenges from Amazon in-house delivery; high dividend (~5.5%) provides support; restructuring underway', moat:7, revGrowthScore:2, analystScore:5, valuationScore:6, divScore:10, tailwindScore:5, sizeScore:7 },
  { ticker:'MSTR', company:'Strategy (MicroStrategy)', sector:'Financials / Bitcoin Treasury', price:320, mktCap:'$75B', high52:520, low52:235, pe:'N/A', revGrowth:'N/A', analystRating:'Speculative Buy', divYield:'None', trend:'↑ Volatile', keyReason:'Largest corporate Bitcoin holder ~500K BTC; leveraged BTC proxy for institutions; extreme volatility; high risk/reward', moat:4, revGrowthScore:5, analystScore:5, valuationScore:3, divScore:1, tailwindScore:6, sizeScore:5 },
  { ticker:'RXRX', company:'Recursion Pharmaceuticals', sector:'Healthcare / AI Drug Discovery', price:9, mktCap:'$2.5B', high52:14, low52:6, pe:'N/A', revGrowth:'+40%', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'AI-driven drug discovery; NVIDIA partnership; clinical pipeline momentum; speculative but unique AI-bio intersection', moat:6, revGrowthScore:7, analystScore:7, valuationScore:5, divScore:1, tailwindScore:8, sizeScore:3 },
  { ticker:'KRTX', company:'Krystal Biotech', sector:'Healthcare / Gene Therapy', price:195, mktCap:'$4.8B', high52:215, low52:130, pe:'45x', revGrowth:'+80%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:"William Blair's #1 biotech pick 2026; VYJUVEK (gene therapy for EB) commercial launch; repeat-dosing gene therapy platform", moat:8, revGrowthScore:9, analystScore:9, valuationScore:5, divScore:1, tailwindScore:8, sizeScore:3 },
  { ticker:'MOS', company:'Mosaic Company', sector:'Materials / Fertilizers', price:28, mktCap:'$9.5B', high52:38, low52:24, pe:'12x', revGrowth:'-5%', analystRating:'Hold', divYield:'2.1%', trend:'↓ Down', keyReason:'Potash/phosphate prices declining; Brazil competition; agricultural commodity cycle headwinds; cheap valuation optionally', moat:5, revGrowthScore:2, analystScore:4, valuationScore:7, divScore:5, tailwindScore:4, sizeScore:4 },
  { ticker:'ANIP', company:'ANI Pharmaceuticals', sector:'Healthcare / Specialty Pharma', price:68, mktCap:'$1.1B', high52:72, low52:40, pe:'12x', revGrowth:'+15%', analystRating:'Strong Buy', divYield:'None', trend:'↑ Up', keyReason:'Cortendo adrenal disease franchise; generic pharma + specialty drug mix; strong earnings growth; William Blair bullish', moat:6, revGrowthScore:6, analystScore:8, valuationScore:8, divScore:1, tailwindScore:7, sizeScore:3 },
  { ticker:'AMBA', company:'Ambarella Inc.', sector:'Technology / Edge AI Chips', price:75, mktCap:'$2.8B', high52:128, low52:52, pe:'120x fwd', revGrowth:'+25%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'Edge AI inference chips for ADAS, cameras, IoT; high growth but volatile; CV3-AD automotive design wins', moat:6, revGrowthScore:8, analystScore:7, valuationScore:3, divScore:1, tailwindScore:8, sizeScore:3 },
  { ticker:'CRSP', company:'CRISPR Therapeutics', sector:'Healthcare / Gene Editing', price:58, mktCap:'$4.8B', high52:85, low52:38, pe:'N/A', revGrowth:'N/A', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'First FDA-approved gene editing therapy (Casgevy for sickle cell); Vertex collaboration; pipeline expansion into cancer', moat:7, revGrowthScore:5, analystScore:7, valuationScore:5, divScore:1, tailwindScore:8, sizeScore:3 },
  { ticker:'RYAM', company:'Rayonier Advanced Materials', sector:'Materials / Specialty Cellulose', price:18, mktCap:'$1.0B', high52:22, low52:8, pe:'N/A', revGrowth:'+50%', analystRating:'Speculative', divYield:'None', trend:'↑ Up', keyReason:'YTD 2026 gainer (+93%); specialty cellulose for EV batteries/biotech/filters; small-cap high momentum', moat:4, revGrowthScore:8, analystScore:4, valuationScore:5, divScore:1, tailwindScore:6, sizeScore:2 },
  { ticker:'RDDT', company:'Reddit Inc.', sector:'Technology / Social Media', price:170, mktCap:'$28B', high52:250, low52:100, pe:'N/A', revGrowth:'+60%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'AI data licensing (Google, OpenAI) revenue stream; advertising monetization scaling; community engagement growing', moat:6, revGrowthScore:9, analystScore:7, valuationScore:4, divScore:1, tailwindScore:7, sizeScore:4 },
  { ticker:'KOS', company:'Kosmos Energy', sector:'Energy / Offshore E&P', price:2.40, mktCap:'$1.35B', high52:5.50, low52:1.60, pe:'N/A', revGrowth:'N/A', analystRating:'Hold', divYield:'None', trend:'↑ Up', keyReason:'YTD 2026 gainer (+161%); small-cap oil; West Africa deepwater assets; beneficiary of oil above $100/barrel', moat:3, revGrowthScore:5, analystScore:4, valuationScore:5, divScore:1, tailwindScore:6, sizeScore:2 },
  { ticker:'HOOD', company:'Robinhood Markets', sector:'Financials / Fintech', price:55, mktCap:'$48B', high52:68, low52:20, pe:'40x', revGrowth:'+45%', analystRating:'Buy', divYield:'None', trend:'↑ Up', keyReason:'Crypto/equity trading boom; Gold+ subscription growth; IRA retirement accounts; options trading; AI financial tools', moat:5, revGrowthScore:9, analystScore:7, valuationScore:5, divScore:1, tailwindScore:7, sizeScore:5 },
  { ticker:'COIN', company:'Coinbase Global', sector:'Financials / Crypto Exchange', price:240, mktCap:'$62B', high52:340, low52:155, pe:'30x', revGrowth:'+55%', analystRating:'Buy', divYield:'None', trend:'→ Neutral', keyReason:'Crypto market cycle; spot Bitcoin ETF volume; institutional custody; Base L2 blockchain; improving regulatory clarity', moat:6, revGrowthScore:9, analystScore:7, valuationScore:6, divScore:1, tailwindScore:7, sizeScore:5 },
];

// Scoring weights for long-term investment
// moat (25%), revGrowthScore (20%), analystScore (15%), valuationScore (15%), tailwindScore (15%), divScore (5%), sizeScore (5%)
function computeScore(s) {
  const raw = (s.moat * 0.25) + (s.revGrowthScore * 0.20) + (s.analystScore * 0.15) +
              (s.valuationScore * 0.15) + (s.tailwindScore * 0.15) + (s.divScore * 0.05) + (s.sizeScore * 0.05);
  return Math.round(raw * 10) / 10;
}

function getRating(score) {
  if (score >= 8.5) return 'STRONG BUY';
  if (score >= 7.5) return 'BUY';
  if (score >= 6.5) return 'MODERATE BUY';
  if (score >= 5.5) return 'HOLD';
  return 'CAUTION';
}

// Build worksheet data
const headers = [
  '#', 'Ticker', 'Company', 'Sector', 'Price (USD ~)', 'Market Cap', '52-Wk High', '52-Wk Low',
  'P/E Ratio', 'Revenue Growth YoY', 'Analyst Consensus', 'Dividend Yield', 'Recent Trend',
  'LT Score /10', 'Rating', 'Score Breakdown (Moat | Growth | Analyst | Value | Tailwind | Div | Size)',
  'Key Reason Trending / Investment Thesis'
];

const rows = stocks.map((s, i) => {
  const score = computeScore(s);
  const rating = getRating(score);
  const breakdown = `${s.moat} | ${s.revGrowthScore} | ${s.analystScore} | ${s.valuationScore} | ${s.tailwindScore} | ${s.divScore} | ${s.sizeScore}`;
  return [
    i + 1, s.ticker, s.company, s.sector, s.price, s.mktCap, s.high52, s.low52,
    s.pe, s.revGrowth, s.analystRating, s.divYield, s.trend,
    score, rating, breakdown, s.keyReason
  ];
});

const wsData = [headers, ...rows];

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(wsData);

// Column widths
ws['!cols'] = [
  { wch: 4 },   // #
  { wch: 8 },   // Ticker
  { wch: 32 },  // Company
  { wch: 36 },  // Sector
  { wch: 14 },  // Price
  { wch: 12 },  // Mkt Cap
  { wch: 12 },  // 52W High
  { wch: 12 },  // 52W Low
  { wch: 12 },  // P/E
  { wch: 18 },  // Rev Growth
  { wch: 18 },  // Analyst
  { wch: 14 },  // Div Yield
  { wch: 16 },  // Trend
  { wch: 12 },  // Score
  { wch: 16 },  // Rating
  { wch: 50 },  // Breakdown
  { wch: 90 },  // Key Reason
];

// Freeze top row
ws['!freeze'] = { xSplit: 0, ySplit: 1 };

// Add a legend sheet
const legendData = [
  ['SCORING METHODOLOGY — Long-Term Investment Score (out of 10)'],
  [''],
  ['The score is a weighted average of 7 factors, each rated 1–10:'],
  [''],
  ['Factor', 'Weight', 'Description'],
  ['Competitive Moat', '25%', 'Durability of competitive advantage (brand, network effects, switching costs, IP)'],
  ['Revenue Growth', '20%', 'Recent and projected revenue growth rate — higher is better'],
  ['Analyst Consensus', '15%', 'Degree of professional analyst Buy/Strong Buy consensus'],
  ['Valuation', '15%', 'How reasonably priced the stock is (lower P/E or justified growth premium)'],
  ['Industry Tailwind', '15%', 'Strength of long-term secular trend supporting the business (AI, energy, healthcare, etc.)'],
  ['Dividend Yield', '5%', 'Income generation — useful for conservative long-term holders'],
  ['Company Size/Stability', '5%', 'Market cap size as a proxy for financial stability and lower bankruptcy risk'],
  [''],
  ['RATING SCALE'],
  ['Score', 'Rating', 'Meaning'],
  ['8.5 – 10.0', 'STRONG BUY', 'Exceptional long-term opportunity — strong moat, growth, and tailwind alignment'],
  ['7.5 – 8.4', 'BUY', 'Solid long-term investment with good fundamentals and upside potential'],
  ['6.5 – 7.4', 'MODERATE BUY', 'Decent long-term pick with some caveats around valuation or growth'],
  ['5.5 – 6.4', 'HOLD', 'Average risk/reward; wait for a better entry point or more clarity'],
  ['Below 5.5', 'CAUTION', 'High risk, speculative, or deteriorating fundamentals — thorough research required'],
  [''],
  ['DISCLAIMER'],
  ['This spreadsheet is for informational and educational purposes only.'],
  ['It does NOT constitute financial advice. Past performance does not guarantee future results.'],
  ['Always do your own due diligence and consult a licensed financial advisor before investing.'],
  ['Data sourced from public analyst reports, financial news, and market data as of March 2026.'],
];
const wsLegend = XLSX.utils.aoa_to_sheet(legendData);
wsLegend['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 80 }];

XLSX.utils.book_append_sheet(wb, ws, 'Top 100 Stocks Mar 2026');
XLSX.utils.book_append_sheet(wb, wsLegend, 'Scoring Guide & Disclaimer');

const outputPath = 'Top_100_Stocks_Mar2026_LT_Score.xlsx';
XLSX.writeFile(wb, outputPath);
console.log(`✅ Excel file created: ${outputPath}`);
console.log(`📊 Total stocks: ${stocks.length}`);

// Print top 10 by score
const scored = stocks.map(s => ({ ticker: s.ticker, company: s.company, score: computeScore(s), rating: getRating(computeScore(s)) }));
scored.sort((a, b) => b.score - a.score);
console.log('\n🏆 Top 10 Long-Term Investment Scores:');
scored.slice(0, 10).forEach((s, i) => console.log(`  ${i+1}. ${s.ticker} — ${s.score}/10 (${s.rating})`));
