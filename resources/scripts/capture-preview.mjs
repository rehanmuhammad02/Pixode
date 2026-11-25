import { writeFile, mkdir } from "node:fs/promises";
const [url = "http://127.0.0.1:3000", width = "1440", name = "website"] = process.argv.slice(2);
const tabs = await (await fetch("http://127.0.0.1:9222/json")).json();
const tab = tabs.find(t => t.type === "page");
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, {once:true}));
let id = 0;
const jobs = new Map();
const errors = [];
socket.addEventListener("message", event => {
 const message = JSON.parse(event.data);
 if (message.id) { const job = jobs.get(message.id); jobs.delete(message.id); message.error ? job.reject(message.error) : job.resolve(message.result); }
 if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
});
const call = (method, params = {}) => new Promise((resolve,reject) => { const serial=++id; jobs.set(serial,{resolve,reject});socket.send(JSON.stringify({id:serial,method,params})); });
try {
 await call("Page.enable"); await call("Runtime.enable");
 await call("Emulation.setDeviceMetricsOverride", { width:Number(width),height:1000,deviceScaleFactor:1,mobile:Number(width)<600 });
 await call("Page.navigate", {url});
 await new Promise(resolve=>setTimeout(resolve,5000));
 if (/\/(login|signup)/.test(url)) {
   let ready = false;
   for (let attempt = 0; attempt < 40; attempt++) {
     const state = await call("Runtime.evaluate", {expression:"!!document.querySelector('.auth-form-wrap')", returnByValue:true});
     if(state.result.value) {ready=true;break;}
     await new Promise(resolve=>setTimeout(resolve,300));
   }
   if(!ready) throw new Error("Authentication form did not render.");
 }
 await call("Runtime.evaluate", {expression:"document.fonts.ready",awaitPromise:true});
 const summary=await call("Runtime.evaluate",{expression:"JSON.stringify({title:document.title,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,headings:[...document.querySelectorAll('h1,h2')].map(e=>e.textContent),body:document.body.innerText.slice(0,600)})",returnByValue:true});
 const shot=await call("Page.captureScreenshot", {format:"png",captureBeyondViewport:false});
 await mkdir("storage/app/private/previews",{recursive:true});
 await writeFile(`storage/app/private/previews/${name}.png`,Buffer.from(shot.data,"base64"));
 console.log(summary.result.value); console.log(JSON.stringify({errors,screenshot:`storage/app/private/previews/${name}.png`}));
} finally {socket.close();}