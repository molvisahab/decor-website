/* Decor website — behaviour. No libraries. Content comes from window.DECOR (built from src/data.js). */
(function () {
  "use strict";
  var D = window.DECOR || {};
  var C = D.contact || {};
  var PREVIEW = D.mode === "preview";
  var ROOT = D.root || "";
  var bySlug = {};
  (D.products || []).forEach(function (p) { bySlug[p.slug] = p; });

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function wa(text) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(text); }
  function productHref(slug) { return PREVIEW ? "#p-" + slug : ROOT + "products/" + slug + ".html"; }
  function img(f) { return (PREVIEW ? "" : ROOT) + "img/" + f; }
  var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>';

  /* ---------- mobile nav ---------- */
  var toggle = $("#navToggle"), nav = $("#siteNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } });
  }
  function markNav(key) {
    $$("[data-nav]").forEach(function (a) { if (a.dataset.nav === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }
  var pageKey = ($("main") || {}).dataset ? $("main").dataset.page : "";
  if (!PREVIEW) markNav(pageKey);

  /* ---------- copy buttons ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.copy, done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600); };
      var sel = function () { var s = b.previousElementSibling && b.previousElementSibling.querySelector(".copyable"); if (s) { var r = document.createRange(); r.selectNodeContents(s); var w = getSelection(); w.removeAllRanges(); w.addRange(r); } };
      try { navigator.clipboard.writeText(t).then(done, sel); } catch (e) { sel(); }
    });
  });

  /* ---------- basement-to-roof finder ---------- */
  $$(".finder").forEach(function (f) {
    function show(id, focusTab) {
      $$(".zone", f).forEach(function (z) { z.classList.toggle("on", z.dataset.area === id); });
      $$(".pin", f).forEach(function (p) { p.setAttribute("aria-pressed", p.dataset.area === id); });
      $$(".area-btn", f).forEach(function (b) { var on = b.dataset.area === id; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on && focusTab) b.focus(); });
      $$(".area-view", f).forEach(function (v) { v.hidden = v.dataset.areaView !== id; });
    }
    $$(".zone, .pin, .area-btn", f).forEach(function (el) {
      el.addEventListener("click", function () { show(el.dataset.area); if (el.classList.contains("pin") || el.classList.contains("zone")) { if (window.innerWidth < 900) $(".area-panel", f).scrollIntoView({ behavior: "smooth", block: "nearest" }); } });
    });
    var tabs = $$(".area-btn", f);
    tabs.forEach(function (t, i) {
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (n) { e.preventDefault(); show(tabs[(i + n + tabs.length) % tabs.length].dataset.area, true); }
      });
    });
    if (tabs[0]) show(tabs[0].dataset.area);
  });

  /* ---------- product filters ---------- */
  var grid = $("#productGrid");
  if (grid) {
    var chips = $$(".filters .chip");
    function filter(cat) {
      var n = 0;
      $$(".p-card", grid).forEach(function (c) { var on = cat === "all" || c.dataset.cat === cat; c.hidden = !on; if (on) n++; });
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.filter === cat); });
      $("#gridEmpty").hidden = n > 0;
    }
    $$("[data-filter]").forEach(function (b) { b.addEventListener("click", function () { filter(b.dataset.filter); }); });
  }

  /* ---------- product page: pack, quantity, WhatsApp order, calculators ---------- */
  $$(".product-view").forEach(function (v) {
    var name = v.dataset.name, link = $(".order-link", v), qty = $(".qty input", v);
    function update() {
      var pack = ($("input[type=radio]:checked", v) || {}).value || "";
      var q = Math.max(1, Math.min(9999, parseInt(qty.value, 10) || 1));
      link.href = wa("Assalam o Alaikum, I want to order " + name + " – " + pack + " × " + q + ".");
    }
    $$("input[type=radio]", v).forEach(function (r) { r.addEventListener("change", update); });
    qty.addEventListener("input", update);
    qty.addEventListener("blur", function () { qty.value = Math.max(1, Math.min(9999, parseInt(qty.value, 10) || 1)); update(); });
    $$(".qty button", v).forEach(function (b) {
      b.addEventListener("click", function () { qty.value = Math.max(1, Math.min(9999, (parseInt(qty.value, 10) || 1) + Number(b.dataset.step))); update(); });
    });
    update();

    var calc = $(".calc", v);
    if (calc) {
      var input = $("input", calc), out = $("output", calc), type = calc.dataset.calc;
      var fmt = function (n) { return n.toLocaleString("en-PK"); };
      function run() {
        var x = parseFloat(input.value);
        if (!(x > 0)) { out.textContent = "Enter a number above 0"; return; }
        if (type === "cement") {
          var kg = Math.ceil(x);
          out.textContent = "You need " + fmt(kg) + " kg of Proof 700 (" + fmt(kg) + " × 1 kg packs)";
        } else {
          var ml = x / 1050 * 1000, water = ml / 2; // 1 L : 500 L water : 1,050 sq ft
          var need = Math.ceil(ml / 250) * 250, L = Math.floor(need / 1000), rest = need - L * 1000;
          var packs = [];
          if (L) packs.push(L + " × 1 litre");
          if (rest === 750) { packs.push("1 × 500 ml", "1 × 250 ml"); }
          else if (rest === 500) packs.push("1 × 500 ml");
          else if (rest === 250) packs.push("1 × 250 ml");
          out.textContent = "About " + fmt(Math.round(ml)) + " ml Termi Fix in " + fmt(Math.round(water)) + " L water. Buy: " + packs.join(" + ");
        }
      }
      input.addEventListener("input", run); run();
    }
  });

  /* ---------- preview mode: hash routing between page views ---------- */
  if (PREVIEW) {
    var views = $$(".view");
    function route() {
      var h = (location.hash || "#home").slice(1) || "home";
      var target = views.filter(function (v) { return v.dataset.view === h; })[0];
      var anchor = null;
      if (!target) { anchor = document.getElementById(h); target = anchor ? anchor.closest(".view") : views[0]; }
      views.forEach(function (v) { v.hidden = v !== target; });
      var key = target.dataset.view.indexOf("p-") === 0 ? "products" : target.dataset.view;
      if (h === "finder" || h === "contact") key = h;
      markNav(key);
      document.title = (target.dataset.title ? target.dataset.title + " | " : "") + "Decor Construction Chemicals";
      if (anchor && anchor !== target) anchor.scrollIntoView(); else window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", route);
    route();
  }

  /* ---------- chatbot (rule-based, English + Roman Urdu) ---------- */
  var chat = $("#chat");
  if (!chat) return;
  var panel = $("#chatPanel"), log = $("#chatLog"), quick = $("#chatQuick"), form = $("#chatForm"), input = $("#chatInput");
  var started = false, lastTopic = "";

  function openChat() {
    panel.hidden = false; chat.classList.add("open"); $("#chatOpen").setAttribute("aria-expanded", "true");
    if (!started) { started = true; greet(); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function closeChat() { panel.hidden = true; chat.classList.remove("open"); $("#chatOpen").setAttribute("aria-expanded", "false"); $("#chatOpen").focus(); }
  $("#chatOpen").addEventListener("click", function () { panel.hidden ? openChat() : closeChat(); });
  $("#chatClose").addEventListener("click", closeChat);
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") closeChat(); });
  $$("[data-open-chat]").forEach(function (b) { b.addEventListener("click", openChat); });

  function add(html, who) {
    var d = document.createElement("div");
    d.className = "msg " + who;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    d.addEventListener("click", function (e) { if (e.target.closest(".mini a") && window.innerWidth < 600) closeChat(); });
  }
  function cards(slugs) {
    return '<div class="mini">' + slugs.map(function (s) {
      var p = bySlug[s]; if (!p) return "";
      return '<a href="' + productHref(s) + '"><img src="' + img(p.image) + '" alt=""><span>' + esc(p.name) + "<small>" + esc(p.type) + "</small></span></a>";
    }).join("") + "</div>";
  }
  function waBtn(text, label) { return '<a class="wa-go" href="' + wa(text) + '" target="_blank" rel="noopener">' + WA_ICON + (label || "Continue on WhatsApp") + "</a>"; }
  function setQuick(list) {
    quick.innerHTML = "";
    list.forEach(function (q) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = q;
      b.addEventListener("click", function () { ask(q); });
      quick.appendChild(b);
    });
  }
  var DEFAULT_QUICK = ["Roof is leaking", "Bathroom seepage", "Termites", "Water tank leak", "All products", "Price & order", "Where to buy"];

  function greet() {
    add("<p>Assalam o Alaikum! I'm the Decor assistant.</p><p>Tell me where the problem is (roof, bathroom, tank, walls, termites) or ask about a product. You can write in English or Roman Urdu.</p>", "bot");
    setQuick(DEFAULT_QUICK);
  }

  var has = function (t, words) { return words.some(function (w) { return new RegExp("(^|[^a-z0-9])" + w + "([^a-z0-9]|$)").test(t); }); };
  var PROBLEMS = [
    { id: "roof", words: ["roof", "chat", "chhat", "chath", "terrace", "balcony", "slab", "chhaat"], slugs: ["seal-777", "wp-781", "pu-sealant"],
      say: "For roofs and slabs, use <b>Seal 777</b> (two-part coating that takes high water pressure) or <b>WP 781</b> (flexible, transparent coating that moves with the slab). Seal the roof joints with <b>PU Sealant</b>. The white Seal 777 15 kg kit also helps with heat proofing." },
    { id: "bathroom", words: ["bathroom", "washroom", "bath", "toilet", "ghusal ?khana", "shower", "kitchen"], slugs: ["seal-777", "wp-781", "sbr-latex-775"],
      say: "For bathrooms, coat the floor and lower walls with <b>Seal 777</b> or <b>WP 781</b> before tiling. Use <b>SBR Latex 775</b> in the tile mortar and grout for a stronger, water-resistant finish." },
    { id: "tank", words: ["tank", "tanki", "tankee", "reservoir", "pool", "swimming"], slugs: ["seal-777", "wp-781", "proof-700", "sbr-latex-775"],
      say: "For an existing water tank, coat the inside with <b>Seal 777</b> or <b>WP 781</b>. For a new tank, mix <b>Proof 700</b> into the concrete (1 kg per 50 kg bag of cement). <b>SBR Latex 775</b> is also listed for water tanks; ask our team for application guidance." },
    { id: "basement", words: ["basement", "foundation", "bunyad", "buniyad", "underground", "dpc", "tehkhana"], slugs: ["proof-700", "seal-777", "wp-781", "sbr-latex-775", "termi-fix"],
      say: "For basements and foundations, the listed products include <b>Proof 700</b>, <b>Seal 777</b>, <b>WP 781</b>, <b>SBR Latex 775</b> and <b>Termi Fix</b>. Ask our team which product and application method suit your project." },
    { id: "joints", words: ["crack", "cracks", "joint", "joints", "daraar", "darar", "gap", "expansion", "window", "sheet"], slugs: ["pu-sealant", "wp-781"],
      say: "For cracks and joints, fill them with <b>PU Sealant</b> (600 ml). It stays flexible when the building moves. For wide areas that move, coat with <b>WP 781</b>." },
    { id: "tiles", words: ["floor", "floors", "tile", "tiles", "grout", "grouting", "marble", "bonding", "bond", "repair", "purana"], slugs: ["seal-777"],
      say: "For floor waterproofing, <b>Decor Seal 777</b> is listed under Floors. See its product page for the stated kit coverage." },
    { id: "walls", words: ["wall", "walls", "deewar", "diwar", "plaster", "palaster", "damp", "dampness", "seelan", "seelun", "silan", "nami", "seepage", "leak", "leaking", "leakage", "paani"], slugs: ["seal-777", "wp-781"],
      say: "For external walls, the listed products are <b>Seal 777</b> and <b>WP 781</b>. Tell me where the water comes in (roof, bathroom, tank, basement) and I can be more exact." },
    { id: "termite", words: ["termite", "termites", "deemak", "dimak", "demak", "keeray", "keeda", "wood", "lakri", "furniture"], slugs: ["termi-fix"],
      say: "Use <b>Termi Fix</b>. 1 litre mixes with 500 litres of water and treats about 1,050 sq ft of soil. It works before and after construction. For wooden frames and doors, use it with kerosene oil." },
  ];

  function reply(raw) {
    var t = " " + raw.toLowerCase().replace(/[^a-z0-9؀-ۿ ]+/g, " ") + " ";
    var named = (D.products || []).filter(function (p) { return has(t, p.keywords.map(function (k) { return k.replace(/ /g, " +"); })); }).map(function (p) { return p.slug; });
    var wantsPrice = has(t, ["price", "prices", "rate", "rates", "cost", "qeemat", "keemat", "kimat", "kitne", "kitnay", "kitna ka", "kitne ka", "discount", "wholesale"]);
    var wantsOrder = has(t, ["order", "buy", "purchase", "khareed", "khareedna", "kharidna", "mangwana", "mangwa", "delivery", "deliver", "chahiye", "lena"]);
    var wantsPlace = has(t, ["where", "location", "shop", "store", "address", "kahan", "kidhar", "dukan", "dealer", "city", "available"]);
    var wantsQty = has(t, ["how much", "quantity", "ratio", "mix", "mixing", "dosage", "coverage", "kitna dalna", "kitna", "use", "apply", "how to"]);
    var wantsContact = has(t, ["contact", "phone", "number", "call", "email", "mail", "instagram", "facebook", "insta"]);
    var wantsList = has(t, ["products", "product", "range", "list", "items", "catalog", "catalogue", "sell", "make"]);
    var thanks = has(t, ["thanks", "thank", "thx", "shukria", "shukriya", "jazakallah", "jazak"]);
    var hello = has(t, ["hi", "hello", "hey", "salam", "salaam", "aoa", "assalam", "asalam", "slam"]);

    var topic = named.length ? (bySlug[named[0]] || {}).name : lastTopic;

    if (wantsPrice) {
      lastTopic = topic || lastTopic;
      return { html: "<p>Rates depend on pack size and quantity, and bulk orders get better rates. Our team will send you today's rate on WhatsApp.</p>" + (named.length ? cards(named) : "") + waBtn("Assalam o Alaikum, please share the rate for " + (topic || "Decor products") + ".", "Ask for today's rate") };
    }
    if (wantsPlace) {
      return { html: "<p>You can order directly from us on WhatsApp. Send us your city and our team will tell you the quickest way to get the products to you.</p>" + waBtn("Assalam o Alaikum, I am in (your city). Where can I get Decor products?", "Ask on WhatsApp") };
    }
    if (wantsOrder) {
      return { html: "<p>Orders are taken on WhatsApp. Send the product, pack size and quantity, and our team will confirm the rate and delivery.</p>" + (named.length ? cards(named) : "") + waBtn("Assalam o Alaikum, I want to order " + (topic || "Decor products") + ".", "Order on WhatsApp") };
    }
    if (wantsContact) {
      return { html: "<p>WhatsApp / phone: <b>" + esc(C.phoneDisplay) + "</b><br>Email: <b>" + esc(C.email) + "</b><br>Instagram: " + esc(C.instagramHandle) + "<br>Facebook: " + esc(C.facebookHandle) + "</p>" + waBtn("Assalam o Alaikum, I have a question.", "Message us on WhatsApp") };
    }

    var probs = PROBLEMS.filter(function (p) { return has(t, p.words); });
    // "leak"/"seepage" alone sits in walls; prefer a more specific place if one is named
    if (probs.length > 1) probs = probs.filter(function (p) { return p.id !== "walls"; }).concat(probs.filter(function (p) { return p.id === "walls"; })).slice(0, 1);
    if (named.length && wantsQty) {
      var p0 = bySlug[named[0]];
      return { html: "<p><b>" + esc(p0.name) + "</b>: " + esc(p0.usage || "Follow the instructions on the pack. Our team can guide you on WhatsApp.") + "</p>" + cards([p0.slug]) + (p0.usage ? "<p>The product page has the full usage details.</p>" : "") };
    }
    if (probs.length) {
      var pr = probs[0]; lastTopic = pr.id;
      return { html: "<p>" + pr.say + "</p>" + cards(pr.slugs) + waBtn("Assalam o Alaikum, I need help with a " + pr.id + " problem.", "Get advice on WhatsApp"), quick: ["Price & order", "How much do I need?", "Another problem"] };
    }
    if (named.length) {
      var list = named.slice(0, 3).map(function (s) { var p = bySlug[s]; return "<p><b>" + esc(p.name) + "</b> (" + esc(p.type.toLowerCase()) + "): " + esc(p.summary) + "</p><p>Packs: " + esc(p.packaging.join(", ")) + "</p>"; }).join("");
      lastTopic = bySlug[named[0]].name;
      return { html: list + cards(named.slice(0, 3)), quick: ["Price & order", "How much do I need?", "All products"] };
    }
    if (wantsQty) {
      return { html: "<p><b>Proof 700</b>: 1 kg for every 50 kg bag of cement.</p><p><b>Termi Fix</b>: 1 litre in 500 litres of water treats about 1,050 sq ft.</p><p>Both product pages have a quantity calculator. For other products, our team will advise on WhatsApp.</p>" + cards(["proof-700", "termi-fix"]) };
    }
    if (wantsList) {
      return { html: "<p>We make six products:</p>" + cards((D.products || []).map(function (p) { return p.slug; })) };
    }
    if (thanks) return { html: "<p>You're welcome! Anything else I can help with?</p>" };
    if (hello) return { html: "<p>Wa Alaikum Assalam! Where is the problem: roof, bathroom, water tank, walls, basement or termites?</p>" };
    return { html: "<p>Sorry, I didn't get that. Try words like <i>roof leak</i>, <i>bathroom</i>, <i>termite</i> or a product name. Or ask our team directly:</p>" + waBtn("Assalam o Alaikum, I have a question: " + raw, "Ask on WhatsApp") };
  }

  function ask(q) {
    if (q === "Another problem") { add("<p>" + esc(q) + "</p>", "me"); add("<p>Sure. Where is it: roof, bathroom, water tank, walls, basement, cracks or termites?</p>", "bot"); setQuick(DEFAULT_QUICK); return; }
    if (q === "All products") q = "show all products";
    add("<p>" + esc(q) + "</p>", "me");
    var r = reply(q);
    setTimeout(function () { add(r.html, "bot"); setQuick(r.quick || DEFAULT_QUICK); }, 280);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim(); if (!q) return;
    input.value = ""; ask(q);
  });
})();
