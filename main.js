const PRODUCTS = [
  {
    slug: "steriseal-pouch-rolls",
    name: "SteriSeal Pouch Rolls",
    sku: "PP-STR-240",
    category: "sterilization",
    label: "Sterilization",
    price: "Quote from $38",
    pack: "200 meter roll",
    turnaround: "Same-day quote",
    imageClass: "product-thumb--steriseal",
    detailClass: "detail-visual--steriseal",
    short: "Transparent blue sterilization rolls with medical-grade seals for fast, clean instrument packing.",
    description: "Built for busy operatories that need reliable pouching without slowing the room reset. SteriSeal rolls are easy to cut, easy to inspect, and suitable for standard dental instrument cycles.",
    specs: ["Medical-grade paper and film", "Steam and EO indicators", "Wide roll sizes available", "Clear instrument visibility"],
    bestFor: "Surgical kits, hygiene cassettes, mirror packs, and routine operatory trays"
  },
  {
    slug: "mirrorlite-exam-kit",
    name: "MirrorLite Examination Kit",
    sku: "PP-EXM-112",
    category: "disposable",
    label: "Disposable",
    price: "Quote from $24",
    pack: "50 sterile packs",
    turnaround: "Ships in 24 hours",
    imageClass: "product-thumb--mirrorlite",
    detailClass: "detail-visual--mirrorlite",
    short: "Pre-packed mirrors, explorers, and cotton accessories that help teams reset rooms faster.",
    description: "MirrorLite kits simplify chairside prep for screenings, hygiene checks, and new-patient exams. Each kit is packed for clean presentation and predictable inventory counts.",
    specs: ["Individually packed sets", "Fog-resistant mirror head", "Smooth explorer tip", "Optional cotton roll bundle"],
    bestFor: "Hygiene exams, mobile dental events, assisted living visits, and front-office emergency kits"
  },
  {
    slug: "flowcore-composite-syringes",
    name: "FlowCore Composite Syringes",
    sku: "PP-FLW-310",
    category: "restorative",
    label: "Restorative",
    price: "Quote from $62",
    pack: "4 syringe starter set",
    turnaround: "Same-day quote",
    imageClass: "product-thumb--flowcore",
    detailClass: "detail-visual--flowcore",
    short: "Smooth-flow restorative composite in high-demand shades for precise placement and polish.",
    description: "FlowCore helps restorative teams handle quick repairs, Class V work, and esthetic refinements with consistent extrusion and shade confidence.",
    specs: ["Popular A-shade options", "Low-slump handling", "Fine polish finish", "Tips included on request"],
    bestFor: "Anterior refinements, cervical restorations, small occlusal repairs, and routine restorative stock"
  },
  {
    slug: "hydrawhiten-take-home-kit",
    name: "HydraWhiten Take-home Kit",
    sku: "PP-WHT-090",
    category: "whitening",
    label: "Whitening",
    price: "Quote from $49",
    pack: "Patient-ready kit",
    turnaround: "Ships in 24 hours",
    imageClass: "product-thumb--hydrawhiten",
    detailClass: "detail-visual--hydrawhiten",
    short: "Cleanly packaged whitening trays and gel accessories for professional take-home protocols.",
    description: "HydraWhiten kits give clinics a polished handoff for whitening cases, with tray storage and patient-friendly accessory packaging.",
    specs: ["Tray case included", "Gel accessory options", "Clinic-ready packaging", "Bulk case pricing"],
    bestFor: "Cosmetic consults, post-cleaning upgrades, maintenance programs, and treatment plan add-ons"
  },
  {
    slug: "precision-impression-set",
    name: "Precision Impression Set",
    sku: "PP-IMP-775",
    category: "impression",
    label: "Impression",
    price: "Quote from $57",
    pack: "Tray and mix tip bundle",
    turnaround: "Same-day quote",
    imageClass: "product-thumb--precision",
    detailClass: "detail-visual--precision",
    short: "Impression trays, material accessories, and mixing tips bundled for predictable case starts.",
    description: "Precision Impression Set keeps everyday impression cases organized with tray sizing options, disposable accessories, and refill-friendly component counts.",
    specs: ["Upper and lower tray options", "Mix tips available", "Purple and teal tray styles", "Bulk refill support"],
    bestFor: "Crowns, bridges, orthodontic records, night guards, and case-start stocking"
  },
  {
    slug: "comfortcare-disposable-pack",
    name: "ComfortCare Disposable Pack",
    sku: "PP-CMF-520",
    category: "disposable",
    label: "Daily Essentials",
    price: "Quote from $31",
    pack: "Operatory reset bundle",
    turnaround: "Ships in 24 hours",
    imageClass: "product-thumb--comfort",
    detailClass: "detail-visual--comfort",
    short: "Gloves, masks, cotton rolls, barrier sheets, and suction accessories packed for daily use.",
    description: "ComfortCare bundles the products dental teams reach for all day, making reorder planning easier across hygiene, restorative, and emergency rooms.",
    specs: ["Custom case quantities", "Latex-free glove options", "Barrier and cotton add-ons", "Monthly reorder reminders"],
    bestFor: "General dentistry, hygiene rooms, specialty operatories, and startup inventory"
  }
];

const bySlug = (slug) => PRODUCTS.find((product) => product.slug === slug) || PRODUCTS[0];

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupScrollEffects();
  setupProductFilters();
  renderProductDetail();
  setupOrderForm();
  setupContactForm();
  setupCounters();
});

function setupNavigation() {
  const header = qs("[data-header]");
  const toggle = qs("[data-nav-toggle]");
  const nav = qs("[data-nav]");
  const pageName = location.pathname.split("/").pop() || "index.html";

  qsa("[data-page]").forEach((link) => {
    if (link.getAttribute("href") === pageName) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    const progress = qs("[data-progress]");
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${percent}%`;
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupScrollEffects() {
  const revealItems = qsa(".reveal, .stagger");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));

  const parallax = qs("[data-parallax]");
  if (parallax && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const move = () => {
      const offset = Math.min(window.scrollY * 0.055, 30);
      parallax.style.transform = `translateY(${offset}px) scale(1.015)`;
    };
    move();
    window.addEventListener("scroll", move, { passive: true });
  }
}

function setupProductFilters() {
  const grid = qs("[data-product-grid]");
  const search = qs("[data-product-search]");
  const buttons = qsa("[data-filter]");
  if (!grid) return;

  const cards = qsa("[data-product-card]", grid);
  let active = "all";

  const apply = () => {
    const query = (search?.value || "").trim().toLowerCase();
    cards.forEach((card) => {
      const product = bySlug(card.dataset.productCard);
      const text = `${product.name} ${product.category} ${product.short} ${product.sku}`.toLowerCase();
      const categoryMatch = active === "all" || product.category === active;
      const searchMatch = !query || text.includes(query);
      card.hidden = !(categoryMatch && searchMatch);
    });
  };

  search?.addEventListener("input", apply);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      active = button.dataset.filter;
      apply();
    });
  });
}

function renderProductDetail() {
  const detailRoot = qs("[data-product-detail]");
  if (!detailRoot) return;

  const params = new URLSearchParams(location.search);
  const product = bySlug(params.get("product"));

  setTextAll(detailRoot, "[data-detail-title]", product.name);
  setTextAll(detailRoot, "[data-detail-sku]", product.sku);
  setTextAll(detailRoot, "[data-detail-category]", product.label);
  setTextAll(detailRoot, "[data-detail-price]", product.price);
  setTextAll(detailRoot, "[data-detail-pack]", product.pack);
  setTextAll(detailRoot, "[data-detail-turnaround]", product.turnaround);
  setTextAll(detailRoot, "[data-detail-description]", product.description);
  setTextAll(detailRoot, "[data-detail-best]", product.bestFor);
  qsa("[data-detail-order]", detailRoot).forEach((link) => {
    link.href = `order.html?product=${product.slug}`;
  });

  const visual = qs("[data-detail-visual]", detailRoot);
  visual.className = `detail-visual ${product.detailClass} reveal is-visible`;
  visual.setAttribute("aria-label", `${product.name} product image`);

  const specs = qs("[data-detail-specs]", detailRoot);
  specs.innerHTML = product.specs.map((spec) => `<li>${spec}</li>`).join("");

  const related = qs("[data-related-products]");
  if (related) {
    related.innerHTML = PRODUCTS
      .filter((item) => item.slug !== product.slug)
      .slice(0, 3)
      .map(cardTemplate)
      .join("");
  }
}

function setupOrderForm() {
  const form = qs("[data-order-form]");
  const select = qs("[data-product-select]");
  const status = qs("[data-order-status]");
  const copyButton = qs("[data-copy-order]");
  const submitButton = qs("[data-submit-order]", form);
  if (!form || !select) return;

  select.innerHTML = PRODUCTS.map((product) => (
    `<option value="${product.slug}">${product.name} - ${product.sku}</option>`
  )).join("");

  const params = new URLSearchParams(location.search);
  const selected = bySlug(params.get("product"));
  select.value = selected.slug;
  updateOrderSummary(selected);

  select.addEventListener("change", () => updateOrderSummary(bySlug(select.value)));

  let lastSummary = "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const product = bySlug(data.get("product"));
    lastSummary = buildOrderSummary(data, product);

    if (location.protocol === "file:") {
      showOrderStatus(status, "error", "Please run the backend server and open the localhost website so the office email can be sent automatically.");
      return;
    }

    setButtonBusy(submitButton, true, "Ordering...");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderPayload(data, product))
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Order request could not be sent.");
      }

      showOrderStatus(status, "success", "Your product is ordered. We will contact you for further updates shortly.");
      form.reset();
      select.value = product.slug;
      updateOrderSummary(product);
    } catch (error) {
      showOrderStatus(status, "error", "We could not send the order right now. Please try again, or copy the order summary and contact the office.");
    } finally {
      setButtonBusy(submitButton, false, "Order product");
    }
  });

  copyButton?.addEventListener("click", async () => {
    if (!lastSummary) {
      const data = new FormData(form);
      lastSummary = buildOrderSummary(data, bySlug(data.get("product")));
    }
    await copyText(lastSummary);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy order summary";
    }, 1700);
  });
}

function setupContactForm() {
  const form = qs("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const subject = `Website message from ${data.get("contactName")}`;
    const body = [
      "PearlPro Dental Supply website message",
      "",
      `Name: ${data.get("contactName")}`,
      `Clinic: ${data.get("contactClinic") || "Not provided"}`,
      `Email: ${data.get("contactEmail")}`,
      `Phone: ${data.get("contactPhone") || "Not provided"}`,
      "",
      "Message:",
      data.get("contactMessage")
    ].join("\n");

    window.location.href = `mailto:orders@pearlprodental.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

function setupCounters() {
  const counters = qsa("[data-count]");
  if (!counters.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 1100;
  const start = performance.now();

  const tick = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function updateOrderSummary(product) {
  const name = qs("[data-summary-product]");
  const sku = qs("[data-summary-sku]");
  const pack = qs("[data-summary-pack]");
  const quote = qs("[data-summary-quote]");

  if (name) name.textContent = product.name;
  if (sku) sku.textContent = product.sku;
  if (pack) pack.textContent = product.pack;
  if (quote) quote.textContent = product.price;
}

function buildOrderSummary(data, product) {
  return [
    "New dental product order request",
    "",
    `Product: ${product.name}`,
    `SKU: ${product.sku}`,
    `Pack: ${product.pack}`,
    `Quantity: ${data.get("quantity")}`,
    `Requested delivery: ${data.get("delivery")}`,
    "",
    "Customer details",
    `Name: ${data.get("fullName")}`,
    `Clinic: ${data.get("clinicName")}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone")}`,
    `Address: ${data.get("address")}`,
    "",
    `Preferred contact: ${data.get("contactPreference")}`,
    `Urgency: ${data.get("urgency")}`,
    "",
    "Notes",
    data.get("notes") || "No notes provided",
    "",
    "No payment was collected on the website. Please reply with availability, quote, and delivery details."
  ].join("\n");
}

function buildOrderPayload(data, product) {
  return {
    productSlug: product.slug,
    productName: product.name,
    sku: product.sku,
    pack: product.pack,
    quantity: data.get("quantity"),
    delivery: data.get("delivery"),
    fullName: data.get("fullName"),
    clinicName: data.get("clinicName"),
    email: data.get("email"),
    phone: data.get("phone"),
    address: data.get("address"),
    contactPreference: data.get("contactPreference"),
    urgency: data.get("urgency"),
    notes: data.get("notes") || ""
  };
}

function showOrderStatus(status, type, message) {
  if (!status) return;
  status.hidden = false;
  status.classList.remove("is-success", "is-error");
  status.classList.add(type === "success" ? "is-success" : "is-error");
  status.textContent = message;
  status.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setButtonBusy(button, isBusy, text) {
  if (!button) return;
  button.disabled = isBusy;
  button.textContent = text;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      // Fall back below when clipboard access is blocked on file URLs.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setTextAll(root, selector, value) {
  qsa(selector, root).forEach((element) => {
    element.textContent = value;
  });
}

function cardTemplate(product) {
  return `
    <article class="product-card reveal is-visible" data-product-card="${product.slug}">
      <div class="product-thumb ${product.imageClass}" role="img" aria-label="${product.name}"></div>
      <div class="product-body">
        <div class="product-meta">
          <span class="tag">${product.label}</span>
          <span class="tag">${product.sku}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.short}</p>
        <div class="product-actions">
          <a class="button button-secondary" href="product-detail.html?product=${product.slug}">Details</a>
          <a class="button button-primary" href="order.html?product=${product.slug}">Order</a>
        </div>
      </div>
    </article>
  `;
}
