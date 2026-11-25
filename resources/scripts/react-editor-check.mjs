import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const tabs = await (await fetch("http://127.0.0.1:9222/json")).json();
const socket = new WebSocket(
  tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve) =>
  socket.addEventListener("open", resolve, { once: true }),
);
let serial = 0;
const jobs = new Map();
const errors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const job = jobs.get(message.id);
    message.error ? job.reject(message.error) : job.resolve(message.result);
    jobs.delete(message.id);
  }
  if (message.method === "Runtime.exceptionThrown")
    errors.push(message.params.exceptionDetails);
});
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++serial;
    jobs.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(JSON.stringify(result.exceptionDetails));
  await new Promise((resolve) => setTimeout(resolve, 60));
  return result.result.value;
};
const pause = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
async function wait(expression) {
  for (let i = 0; i < 60; i++) {
    if (await evaluate(`Boolean(${expression})`)) return;
    await pause(100);
  }
  throw new Error("Browser condition timed out: " + expression);
}
async function screenshot(name) {
  const result = await call("Page.captureScreenshot", { format: "png" });
  await writeFile(name, Buffer.from(result.data, "base64"));
}
const base = process.env.PIXODE_EDITOR_BASE || "http://localhost:3108";
async function fill(selector, values) {
  await evaluate(
    `{const form=document.querySelector(${JSON.stringify(selector)});for(const [key,value] of Object.entries(${JSON.stringify(values)})){const input=form.elements[key];const prototype=input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:input.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(input,String(value));input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input',{bubbles:true}));}}`,
  );
}
async function tab(name) {
  await evaluate(
    `document.querySelector('.workspace-sidebar a[href="/admin/${name}"]').click()`,
  );
  await wait(
    `location.pathname==='/admin/${name}' && document.querySelector('.workspace-toolbar .button')`,
  );
}
async function save() {
  await evaluate("document.querySelector('#editor-form').requestSubmit()");
  await wait("!document.querySelector('.editor-dialog')");
}
try {
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Network.deleteCookies", { name: "pixode_session", url: base });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Page.navigate", { url: base + "/login" });
  errors.length = 0;
  await wait("document.querySelector('#auth-form')");
  await fill("#auth-form", {
    email: "pixode",
    password: "browser-owner-password-123",
  });
  await evaluate("document.querySelector('#auth-form').requestSubmit()");
  await wait("document.querySelector('.welcome-banner')");
  await tab("testimonials");
  await evaluate(
    "document.querySelector('.workspace-toolbar .button').click()",
  );
  await wait("document.querySelector('#editor-form')");
  await fill("#editor-form", {
    name: "Browser test client",
    role: "Authorized test only",
    quote: "The editor saves feedback to the real SQLite database.",
    rating: "4",
  });
  await save();
  assert.ok(
    await evaluate(
      "[...document.querySelectorAll('.record-card h3')].some(node=>node.textContent==='Browser test client')",
    ),
  );
  const publicContent = await (await fetch(base + "/api/content")).json();
  assert.equal(
    publicContent.testimonials.find(
      (item) => item.name === "Browser test client",
    ).rating,
    4,
  );
  await tab("projects");
  await evaluate(
    "document.querySelector('.workspace-toolbar .button').click()",
  );
  await wait("document.querySelector('#editor-form')");
  await fill("#editor-form", {
    title: "Browser draft project",
    description: "A private draft for an isolated editing test.",
    category: "digital",
    tags: "React · API",
    year: "2026",
  });
  await evaluate(
    "document.querySelector('#editor-form').elements.published.click()",
  );
  await save();
  assert.equal(
    (await (await fetch(base + "/api/content")).json()).projects.some(
      (item) => item.title === "Browser draft project",
    ),
    false,
  );
  await tab("packages");
  await evaluate("document.querySelector('.record-actions button').click()");
  await wait("document.querySelector('#editor-form')");
  await fill("#editor-form", {
    price: 777,
    features: "First deliverable\nSecond deliverable",
  });
  await save();
  assert.equal(
    (await (await fetch(base + "/api/content")).json()).packages[0].price,
    777,
  );
  await tab("settings");
  await evaluate(
    "document.querySelector('.workspace-toolbar .button').click()",
  );
  await wait("document.querySelector('#editor-form')");
  await fill("#editor-form", {
    heroLine1: "Edited from the dashboard.",
    defaultTheme: "light",
  });
  await save();
  assert.equal(
    (await (await fetch(base + "/api/content")).json()).settings.heroLine1,
    "Edited from the dashboard.",
  );
  await tab("users");
  await evaluate(
    "document.querySelector('.workspace-toolbar .button').click()",
  );
  await wait("document.querySelector('#editor-form')");
  await fill("#editor-form", {
    name: "Pending Editor",
    email: "pending@example.com",
    role: "editor",
    password: "unique-test-password-123",
  });
  await save();
  assert.ok(
    await evaluate(
      "document.querySelector('.user-table').textContent.includes('Pending Editor') && document.querySelector('.user-table').textContent.includes('Awaiting verification')",
    ),
  );
  await call("Page.navigate", { url: base + "/" });
  await wait("document.querySelector('#contact form')");
  await fill("#contact form", {
    name: "Browser visitor",
    email: "visitor@example.com",
    service: "Web development",
    message: "Please build a business website with a custom dashboard.",
  });
  await evaluate("document.querySelector('#contact form').requestSubmit()");
  await wait("document.querySelector('.contact-success')");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(
    "PASS: React feedback, draft project, pricing features/amount, page settings, pending editor account and contact form save to isolated MSSQL through the C# API.",
  );
} finally {
  socket.close();
}
