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
try {
  await call("Runtime.enable");
  await call("Page.enable");
  await call("Emulation.setEmulatedMedia", { features: [] });
  await call("Network.deleteCookies", {
    name: "pixode_session",
    url: "http://localhost:3000/",
  });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Page.navigate", { url: "http://localhost:3000/" });
  errors.length = 0;
  await wait("document.querySelectorAll('.project-card').length === 10");
  assert.equal(
    (await (await fetch("http://localhost:3000/api/health")).json()).storage,
    "MSSQL",
  );
  await pause(600);
  assert.equal(
    await evaluate("document.documentElement.scrollWidth > innerWidth"),
    false,
  );
  assert.equal(
    await evaluate("document.querySelectorAll('.service-card').length"),
    12,
  );
  assert.equal(
    await evaluate(
      "document.body.textContent.includes('Sample review layouts')",
    ),
    false,
  );
  assert.equal(
    await evaluate(
      "document.querySelector('.brand-symbol img').complete && document.querySelector('.brand-symbol img').naturalWidth > 0",
    ),
    true,
  );
  assert.equal(await evaluate("document.querySelector('video').paused"), false);
  await screenshot("preview-react-desktop.png");
  await evaluate(
    "[...document.querySelectorAll('[aria-label=\"Filter projects\"] button')].find(e => e.textContent === 'Logos').click()",
  );
  assert.equal(
    await evaluate("document.querySelectorAll('.project-card').length"),
    2,
  );
  await evaluate("document.querySelector('.project-card').click()");
  assert.equal(
    await evaluate("document.querySelector('.project-dialog').open"),
    true,
  );
  await evaluate(
    "document.querySelector('.project-dialog .dialog-close').click();document.querySelector('[aria-label=\"Filter projects\"] button').click();[...document.querySelectorAll('.pricing-tabs button')].find(e=>e.textContent==='Websites').click()",
  );
  assert.equal(
    await evaluate("document.querySelectorAll('.price-card').length"),
    3,
  );
  await evaluate(
    "document.querySelector('.navbar button[aria-label*=theme]').click()",
  );
  assert.equal(
    await evaluate("document.documentElement.dataset.theme"),
    "light",
  );
  await evaluate(
    "window.scrollTo({top:document.querySelector('#services').offsetTop-150,behavior:'instant'})",
  );
  await pause(300);
  await screenshot("preview-react-light.png");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate(
    "window.scrollTo({top:0,behavior:'instant'});document.querySelector('.navbar button[aria-label*=theme]').click()",
  );
  await pause(300);
  assert.equal(
    await evaluate("document.documentElement.scrollWidth>innerWidth"),
    false,
  );
  await screenshot("preview-react-mobile.png");
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.footer-grid .footer-brand')).alignItems",
    ),
    "center",
  );
  assert.equal(
    await evaluate("document.querySelector('.footer-word').textContent"),
    "PIXODE®",
  );
  await evaluate("document.querySelector('.menu-button').click()");
  assert.equal(
    await evaluate(
      "document.querySelector('.menu-button').getAttribute('aria-expanded')",
    ),
    "true",
  );
  await evaluate("document.querySelector('#public-navigation a').click()");
  assert.equal(
    await evaluate(
      "document.querySelector('.menu-button').getAttribute('aria-expanded')",
    ),
    "false",
  );
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.marquee-track')).animationName",
    ),
    "none",
  );
  await call("Emulation.setEmulatedMedia", { features: [] });
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evaluate(
    "document.querySelector('.footer').scrollIntoView({block:'start',behavior:'instant'})",
  );
  await pause(300);
  await screenshot("preview-mssql-footer.png");
  await call("Page.navigate", { url: "http://localhost:3000/login" });
  await wait("document.querySelector('#auth-form')");
  await screenshot("preview-react-login.png");
  const password = process.env.PIXODE_CHECK_PASSWORD;
  if (!password)
    throw new Error(
      "Set PIXODE_CHECK_PASSWORD for the preserved owner login check.",
    );
  await evaluate(
    `{const form=document.querySelector('#auth-form');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(form.elements.email,'pixode');form.elements.email.dispatchEvent(new Event('input',{bubbles:true}));setter.call(form.elements.password,${JSON.stringify(password)});form.elements.password.dispatchEvent(new Event('input',{bubbles:true}));form.requestSubmit();}`,
  );
  await wait("document.querySelector('.workspace-profile strong')");
  assert.equal(
    await evaluate(
      "document.querySelector('.workspace-profile div > span').textContent",
    ),
    "owner",
  );
  assert.equal(
    await evaluate("document.documentElement.scrollWidth > innerWidth"),
    false,
  );
  await pause(500);
  await screenshot("preview-react-dashboard.png");
  await evaluate(
    "document.querySelector('.workspace-sidebar a[href=\"/admin/users\"]').click()",
  );
  await wait("document.querySelector('.user-table tbody tr')");
  assert.equal(
    await evaluate(
      "document.querySelector('.user-table .status-pill').textContent",
    ),
    "Owner access",
  );
  await screenshot("preview-react-users.png");
  await evaluate(
    "document.querySelector('.workspace-sidebar a[href=\"/admin/projects\"]').click()",
  );
  await wait("document.querySelectorAll('.record-card').length === 10");
  await evaluate(
    "document.querySelector('.workspace-toolbar .button').click()",
  );
  assert.equal(
    await evaluate("document.querySelector('.editor-dialog').open"),
    true,
  );
  await evaluate(
    "document.querySelector('.editor-head .icon-button').click();document.querySelector('.workspace-sidebar a[href=\"/admin/settings\"]').click()",
  );
  await wait(
    "document.querySelector('.settings-preview') && document.querySelector('.workspace-toolbar .button')",
  );
  await pause(150);
  await evaluate(
    "document.querySelector('.workspace-toolbar .button').click()",
  );
  assert.equal(
    await evaluate(
      "document.querySelector('#editor-form').elements.heroLine1.value",
    ),
    "Your vision.",
  );
  await evaluate("document.querySelector('.editor-head .icon-button').click()");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await pause(300);
  assert.equal(
    await evaluate("document.documentElement.scrollWidth>innerWidth"),
    false,
  );
  await evaluate(
    "document.querySelector('.workspace-header > button').click()",
  );
  await pause(350);
  assert.ok(
    await evaluate(
      "Math.abs(document.querySelector('.workspace-sidebar').getBoundingClientRect().left)<1",
    ),
  );
  await screenshot("preview-react-drawer.png");
  assert.equal(
    await evaluate("document.querySelector('.workspace-brand button')"),
    null,
  );
  await call("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
  });
  await pause(300);
  assert.equal(
    await evaluate(
      "document.querySelector('.workspace').classList.contains('drawer-open')",
    ),
    false,
  );
  await evaluate(
    "document.querySelector('.workspace-header > button').click()",
  );
  await pause(300);
  await evaluate("document.querySelector('.sidebar-backdrop').click()");
  await pause(300);
  assert.equal(
    await evaluate(
      "document.querySelector('.workspace').classList.contains('drawer-open')",
    ),
    false,
  );
  await evaluate(
    "document.querySelector('.workspace-header > button').click()",
  );
  await pause(300);
  await evaluate(
    "document.querySelector('.workspace-sidebar a[href=\"/admin/overview\"]').click()",
  );
  await wait("document.querySelector('.welcome-banner')");
  assert.equal(
    await evaluate(
      "document.querySelector('.workspace').classList.contains('drawer-open')",
    ),
    false,
  );
  assert.equal(
    await evaluate("document.documentElement.scrollWidth>innerWidth"),
    false,
  );
  await screenshot("preview-react-dashboard-mobile.png");
  await evaluate(
    "document.querySelector('.workspace-header > button').click()",
  );
  await pause(300);
  await evaluate("document.querySelector('.workspace-profile button').click()");
  await wait("document.querySelector('#auth-form')");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(
    "PASS: React rendering, preserved content and owner credentials, video, filters/modal, pricing tabs, themes, mobile navigation, reduced motion, dashboard/users/search/editor/settings, mobile drawer, overflow, logout and no JavaScript exceptions.",
  );
} finally {
  socket.close();
}
