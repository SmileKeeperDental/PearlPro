const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const OFFICE_EMAIL = process.env.OFFICE_EMAIL || "orders@pearlprodental.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "PearlPro Dental Supply <orders@pearlprodental.com>";
const REQUIRE_EMAIL_DELIVERY = process.env.REQUIRE_EMAIL_DELIVERY === "true";

const PRODUCTS = [
  { slug: "steriseal-pouch-rolls", name: "SteriSeal Pouch Rolls", sku: "PP-STR-240", pack: "200 meter roll" },
  { slug: "mirrorlite-exam-kit", name: "MirrorLite Examination Kit", sku: "PP-EXM-112", pack: "50 sterile packs" },
  { slug: "flowcore-composite-syringes", name: "FlowCore Composite Syringes", sku: "PP-FLW-310", pack: "4 syringe starter set" },
  { slug: "hydrawhiten-take-home-kit", name: "HydraWhiten Take-home Kit", sku: "PP-WHT-090", pack: "Patient-ready kit" },
  { slug: "precision-impression-set", name: "Precision Impression Set", sku: "PP-IMP-775", pack: "Tray and mix tip bundle" },
  { slug: "comfortcare-disposable-pack", name: "ComfortCare Disposable Pack", sku: "PP-CMF-520", pack: "Operatory reset bundle" }
];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/orders") {
      await handleOrder(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(url.pathname, request, response);
      return;
    }

    sendJson(response, 405, { ok: false, message: "Method not allowed." });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { ok: false, message: "Server error. Please try again." });
  }
});

server.listen(PORT, () => {
  console.log(`PearlPro website running at http://localhost:${PORT}`);
  if (!process.env.RESEND_API_KEY) {
    console.log("Email provider is not configured. Orders will be stored locally in development mode.");
    console.log("Set RESEND_API_KEY, OFFICE_EMAIL, and FROM_EMAIL to send real office emails.");
  }
});

async function handleOrder(request, response) {
  const payload = await readJson(request);
  const product = PRODUCTS.find((item) => item.slug === payload.productSlug);
  const errors = validateOrder(payload, product);

  if (errors.length) {
    sendJson(response, 400, { ok: false, message: errors.join(" ") });
    return;
  }

  const order = {
    id: createOrderId(),
    createdAt: new Date().toISOString(),
    product,
    customer: {
      fullName: clean(payload.fullName),
      clinicName: clean(payload.clinicName),
      email: clean(payload.email),
      phone: clean(payload.phone),
      address: clean(payload.address),
      contactPreference: clean(payload.contactPreference)
    },
    request: {
      quantity: Number(payload.quantity),
      delivery: clean(payload.delivery),
      urgency: clean(payload.urgency),
      notes: clean(payload.notes || "")
    }
  };

  await saveOrder(order);
  const delivery = await sendOfficeEmail(order);

  sendJson(response, 200, {
    ok: true,
    message: "Your product is ordered. We will contact you for further updates shortly.",
    orderId: order.id,
    emailDelivery: delivery.mode
  });
}

async function serveStatic(pathname, request, response) {
  const requestedPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const target = path.normalize(path.join(ROOT, requestedPath));
  const rootWithSep = `${ROOT}${path.sep}`.toLowerCase();

  if (target.toLowerCase() !== ROOT.toLowerCase() && !target.toLowerCase().startsWith(rootWithSep)) {
    sendJson(response, 403, { ok: false, message: "Forbidden." });
    return;
  }

  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    sendJson(response, 404, { ok: false, message: "Not found." });
    return;
  }

  const contentType = MIME_TYPES[path.extname(target).toLowerCase()] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(target).pipe(response);
}

function validateOrder(payload, product) {
  const errors = [];
  const required = [
    "productSlug",
    "quantity",
    "delivery",
    "fullName",
    "clinicName",
    "email",
    "phone",
    "address",
    "contactPreference",
    "urgency"
  ];

  for (const field of required) {
    if (!clean(payload[field])) errors.push(`${field} is required.`);
  }

  if (!product) errors.push("Please choose a valid product.");
  if (!Number.isFinite(Number(payload.quantity)) || Number(payload.quantity) < 1) {
    errors.push("Quantity must be at least 1.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(payload.email))) {
    errors.push("Please enter a valid email address.");
  }

  return errors;
}

async function sendOfficeEmail(order) {
  const subject = `New dental product order: ${order.product.name} (${order.id})`;
  const text = buildEmailText(order);
  const html = buildEmailHtml(order);

  if (!process.env.RESEND_API_KEY) {
    if (REQUIRE_EMAIL_DELIVERY) {
      throw new Error("Email service is not configured.");
    }

    console.log("\n--- Development order email capture ---");
    console.log(`To: ${OFFICE_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("--- End order email capture ---\n");
    return { mode: "development-capture" };
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [OFFICE_EMAIL],
      reply_to: order.customer.email,
      subject,
      text,
      html
    })
  });

  if (!emailResponse.ok) {
    const detail = await emailResponse.text();
    throw new Error(`Email provider rejected the order email: ${detail}`);
  }

  return { mode: "resend" };
}

function buildEmailText(order) {
  return [
    "New dental product order request",
    "",
    `Order ID: ${order.id}`,
    `Created: ${order.createdAt}`,
    "",
    "Product",
    `Name: ${order.product.name}`,
    `SKU: ${order.product.sku}`,
    `Pack: ${order.product.pack}`,
    `Quantity: ${order.request.quantity}`,
    `Requested delivery: ${order.request.delivery}`,
    "",
    "Customer",
    `Name: ${order.customer.fullName}`,
    `Clinic: ${order.customer.clinicName}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}`,
    `Preferred contact: ${order.customer.contactPreference}`,
    `Urgency: ${order.request.urgency}`,
    "",
    "Notes",
    order.request.notes || "No notes provided.",
    "",
    "No payment was collected online. Please contact the customer for quote, stock, and delivery confirmation."
  ].join("\n");
}

function buildEmailHtml(order) {
  const rows = [
    ["Order ID", order.id],
    ["Product", order.product.name],
    ["SKU", order.product.sku],
    ["Pack", order.product.pack],
    ["Quantity", order.request.quantity],
    ["Requested delivery", order.request.delivery],
    ["Customer", order.customer.fullName],
    ["Clinic", order.customer.clinicName],
    ["Email", order.customer.email],
    ["Phone", order.customer.phone],
    ["Address", order.customer.address],
    ["Preferred contact", order.customer.contactPreference],
    ["Urgency", order.request.urgency],
    ["Notes", order.request.notes || "No notes provided."]
  ];

  const tableRows = rows.map(([label, value]) => (
    `<tr><th style="text-align:left;padding:10px;border-bottom:1px solid #d8eeee;">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #d8eeee;">${escapeHtml(String(value))}</td></tr>`
  )).join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#10242a;line-height:1.5;">
      <h1 style="margin:0 0 12px;">New dental product order request</h1>
      <p style="margin:0 0 18px;">No payment was collected online. Please contact the customer for quote, stock, and delivery confirmation.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;background:#f7fbfb;border:1px solid #d8eeee;">
        ${tableRows}
      </table>
    </div>
  `;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

async function saveOrder(order) {
  const dataDir = path.join(ROOT, "data");
  await fs.promises.mkdir(dataDir, { recursive: true });
  await fs.promises.appendFile(path.join(dataDir, "orders.jsonl"), `${JSON.stringify(order)}\n`);
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function createOrderId() {
  return `PP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
