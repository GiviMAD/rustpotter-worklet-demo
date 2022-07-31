(()=>{var e,t,r={11:function(e){var t;"undefined"!=typeof self&&self,t=()=>(()=>{"use strict";var e={d:(t,r)=>{for(var o in r)e.o(r,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:r[o]})}};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),e.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var t={};e.r(t),e.d(t,{NoiseDetectionMode:()=>o,RustpotterService:()=>n}),new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}).decode(),new Uint8Array;const r=new Array(32).fill(void 0);r.push(void 0,null,!0,!1),r.length,new Int32Array,new Uint32Array,new Uint16Array,new Float32Array;const o=Object.freeze({easiest:0,0:"easiest",easy:1,1:"easy",normal:2,2:"normal",hard:3,3:"hard",hardest:4,4:"hardest"});Object.freeze({int:0,0:"int",float:1,1:"float"});var s=function(e,t,r,o){return new(r||(r=Promise))((function(s,n){function i(e){try{c(o.next(e))}catch(e){n(e)}}function a(e){try{c(o.throw(e))}catch(e){n(e)}}function c(e){var t;e.done?s(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(i,a)}c((o=o.apply(e,t||[])).next())}))};class n{constructor(e={},t){if(this.customSourceNode=t,this.defaultCallback=({data:e})=>{if("detection"===e.type){const{name:t,score:r}=e;return this.onspot(t,r)}},this.onpause=()=>{},this.onresume=()=>{},this.onstart=()=>{},this.onstop=()=>{},this.onspot=(e,t)=>{},!n.isRecordingSupported())throw new Error("Recording is not supported in this browser");this.state="inactive",this.config=Object.assign({workletPath:"/rustpotterWorker.js",wasmPath:"/rustpotter_wasm_bg.wasm",monitorGain:0,recordingGain:1,threshold:.5,averagedThreshold:.25,comparatorRef:.22,comparatorBandSize:6,eagerMode:!0,noiseMode:void 0,noiseSensitivity:.5},e),this.initAudioContext(),this.initialize=this.initWorklet().then((()=>this.initEncoder()))}static isRecordingSupported(){const t=e.g.navigator&&e.g.navigator.mediaDevices&&e.g.navigator.mediaDevices.getUserMedia;return AudioContext&&t&&e.g.WebAssembly}clearStream(){this.stream&&(this.stream.getTracks?this.stream.getTracks().forEach((e=>e.stop())):this.stream.stop())}close(){return this.sourceNode&&this.sourceNode.disconnect(),this.clearStream(),this.processor&&(this.processorNode.disconnect(),this.processor.postMessage({command:"close"})),this.customSourceNode?Promise.resolve():this.audioContext.close()}postBuffers(e){if("recording"===this.state){const t=[];for(let r=0;r<e.numberOfChannels;r++)t[r]=e.getChannelData(r);this.processor.postMessage({command:"process",buffers:t})}}initAudioContext(){var t;const r=e.g.AudioContext||e.g.webkitAudioContext;this.audioContext=(null===(t=this.customSourceNode)||void 0===t?void 0:t.context)?this.customSourceNode.context:new r}initEncoder(){this.audioContext.audioWorklet?(this.processorNode=new AudioWorkletNode(this.audioContext,"rustpotter-worklet",{numberOfOutputs:0}),this.processor=this.processorNode.port):(console.log("audioWorklet support not detected. Falling back to scriptProcessor"),this.processorNode=this.audioContext.createScriptProcessor(4096,1,1),this.processorNode.onaudioprocess=({inputBuffer:e})=>this.postBuffers(e),this.processorNode.connect(this.audioContext.destination),this.processor=new e.g.Worker(this.config.workletPath))}initSourceNode(){return this.customSourceNode?(this.sourceNode=this.customSourceNode,Promise.resolve()):e.g.navigator.mediaDevices.getUserMedia({audio:!0,video:!1}).then((e=>{this.stream=e,this.sourceNode=this.audioContext.createMediaStreamSource(e)}))}setupListener(){this.processor.removeEventListener("message",this.defaultCallback),this.processor.addEventListener("message",this.defaultCallback)}initWorker(){return new Promise(((e,t)=>{const r=({data:o})=>{switch(o.type){case"rustpotter-ready":return this.processor.removeEventListener("message",r),this.setupListener(),e();case"rustpotter-error":return this.processor.removeEventListener("message",r),t(new Error("Unable to start rustpotter worklet"))}};try{this.processor.addEventListener("message",r),this.processor.start&&this.processor.start(),this.fetchResource(this.config.wasmPath).then((e=>this.processor.postMessage({command:"init",sampleRate:this.audioContext.sampleRate,threshold:this.config.threshold,averagedThreshold:this.config.averagedThreshold,comparatorRef:this.config.comparatorRef,comparatorBandSize:this.config.comparatorBandSize,eagerMode:this.config.eagerMode,noiseMode:this.config.noiseMode,noiseSensitivity:this.config.noiseSensitivity,wasmBytes:e})))}catch(e){t(e)}}))}initWorklet(){return this.audioContext.audioWorklet?this.audioContext.audioWorklet.addModule(this.config.workletPath):Promise.resolve()}pause(){return"recording"===this.state&&(this.state="paused",this.sourceNode.disconnect(),this.onpause()),Promise.resolve()}resume(){"paused"===this.state&&(this.state="recording",this.sourceNode.connect(this.processorNode),this.onresume())}start(){return"inactive"===this.state?(this.state="loading",this.audioContext.resume().then((()=>this.initialize)).then((()=>Promise.all([this.initSourceNode(),this.initWorker()]))).then((()=>{this.state="recording",this.sourceNode.connect(this.processorNode),this.onstart()})).catch((e=>{throw this.state="inactive",e}))):Promise.resolve()}stop(){return"paused"===this.state||"recording"===this.state?(this.state="inactive",this.sourceNode.connect(this.processorNode),this.clearStream(),new Promise((e=>{const t=({data:r})=>{"done"===r.type&&(this.processor.removeEventListener("message",t),e())};this.processor.addEventListener("message",t),this.processor.start&&this.processor.start(),this.processor.postMessage({command:"done"})})).then((()=>this.finish()))):Promise.resolve()}getState(){return this.state}addWakewordByPath(e){return s(this,void 0,void 0,(function*(){return this.fetchResource(e).then((e=>this.addWakeword(e)))}))}addWakeword(e){return s(this,void 0,void 0,(function*(){return new Promise(((t,r)=>{const o=({data:e})=>{switch(e.type){case"wakeword-loaded":return this.processor.removeEventListener("message",o),t();case"wakeword-error":return this.processor.removeEventListener("message",o),r(new Error("Unable to load wakeword"))}};this.processor.addEventListener("message",o),this.processor.postMessage({command:"wakeword",wakewordBytes:e})}))}))}fetchResource(e){return window.fetch(e).then((e=>e.arrayBuffer()))}finish(){this.onstop()}}return t})(),e.exports=t()},482:(e,t,r)=>{"use strict";e.exports=r.p+"1840eb7fd56d62dbb76e.js"},125:(e,t,r)=>{"use strict";e.exports=r.p+"45feb03d955f15fcf564.wasm"}},o={};function s(e){var t=o[e];if(void 0!==t)return t.exports;var n=o[e]={exports:{}};return r[e].call(n.exports,n,n.exports,s),n.exports}s.m=r,t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,s.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var n=Object.create(null);s.r(n);var i={};e=e||[null,t({}),t([]),t(t)];for(var a=2&o&&r;"object"==typeof a&&!~e.indexOf(a);a=t(a))Object.getOwnPropertyNames(a).forEach((e=>i[e]=()=>r[e]));return i.default=()=>r,s.d(n,i),n},s.d=(e,t)=>{for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;s.g.importScripts&&(e=s.g.location+"");var t=s.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),s.p=e})(),s.b=document.baseURI||self.location.href,(()=>{const{NoiseDetectionMode:e}=s(11);(async()=>{const t="rustpotter@Demo";let r={selectedWakeword:null,selectedWakewordBytes:null,selectedThreshold:.5,selectedAvgThreshold:.2,selectedNoiseDetection:null,eagerMode:!0,rustpotterService:null};window.addEventListener("load",(function(){c("loading available wakewords..."),a(!1),i(!1);var e=document.querySelector("#rustpotter_version");e.innerHTML="rustpotter-v1.0.0",e.href="https://github.com/GiviMAD/rustpotter-cli/releases/tag/v1.0.0",fetch("wakewords.json").then((e=>e.json())).then((e=>{const t=document.querySelector("#wakeword_selector"),o=Object.entries(e);o.forEach((e=>{t.innerHTML+='<option value="'+e[1]+'">'+e[0]+"</option>"})),t.innerHTML+='<option value="manual">from file...</option>',r.selectedWakeword=o[0][1],t.disabled=!1,i(!0),n("record"),c("wakewords list loaded")})).catch((e=>{d(e.message??e),a(!1)}))}));try{await async function(){const{RustpotterService:e}=await Promise.resolve().then(s.t.bind(s,11,23));if(!e.isRecordingSupported()){const e="Unable to record in this browser :(";throw alert(e),new Error(e)}}(),document.querySelector("#wakeword_selector").addEventListener("change",(function(e){const t=e.target.value;if(r.selectedWakewordBytes=null,"manual"==t)a(!1),document.querySelector("#wakeword_input_container").innerHTML+='<input id="wakeword_input" type="file" accept=".rpw">',document.querySelector("#wakeword_input").addEventListener("change",o);else{let e=document.querySelector("#wakeword_input");e&&e.remove(),n("record")}r.selectedWakeword=t})),document.querySelector("#wakeword_threshold").addEventListener("input",(function(e){r.selectedThreshold=e.target.value})),document.querySelector("#wakeword_avg_threshold").addEventListener("input",(function(e){r.selectedAvgThreshold=e.target.value})),document.querySelector("#noise_detection_selector").addEventListener("change",(function(t){const o=t.target.value;if("none"==o)r.selectedNoiseDetection=null;else{let t=null;switch(o){case"Easiest":t=e.easiest;break;case"Easy":t=e.easy;break;case"Normal":t=e.normal;break;case"Hard":t=e.hard;break;case"Hardest":t=e.hardest}r.selectedNoiseDetection=t}})),document.querySelector("#eager_mode").addEventListener("input",(function(e){r.eagerMode=e.target.checked})),document.querySelector("#record").addEventListener("click",(async function(){try{const{RustpotterService:e}=await Promise.resolve().then(s.t.bind(s,11,23));if(n("record",!1),i(!1),null!=r.rustpotterService)return r.rustpotterService.resume(),n("pause"),void n("stop");const t=new URL(s(125),s.b),o=new URL(s(482),s.b);r.rustpotterService=new e({workletPath:o.href,wasmPath:t.href,averagedThreshold:r.selectedAvgThreshold,threshold:r.selectedThreshold,eagerMode:r.eagerMode,noiseMode:r.selectedNoiseDetection,noiseSensitivity:.5}),r.rustpotterService.onspot=(e,t)=>{c(`detection: '${e}'[${t}]`)},r.rustpotterService.onstart=function(){c("rustpotterService is started")},r.rustpotterService.onstop=function(){c("rustpotterService is stopped")},r.rustpotterService.onpause=function(){c("rustpotterService is paused")},r.rustpotterService.onresume=function(){c("rustpotterService is resumed")},await r.rustpotterService.start(),"manual"==r.selectedWakeword?await r.rustpotterService.addWakeword(r.selectedWakewordBytes):await r.rustpotterService.addWakewordByPath(r.selectedWakeword),n("pause"),n("stop")}catch(e){d(e.message??err)}})),document.querySelector("#pause").addEventListener("click",(function(){a(!1),r.rustpotterService.pause().then((()=>{n("record")})).catch((e=>{d(e.message??e)}))})),document.querySelector("#stop").addEventListener("click",(async()=>{a(!1),r.rustpotterService.stop().then(r.rustpotterService.close()).then((()=>{r.rustpotterService=null,n("record"),i(!0)})).catch((e=>{d(e.message??e)}))}))}catch(e){d(e.message??e)}function o(e){const t=new FileReader;t.onload=function(){r.selectedWakewordBytes=this.result,n("record")},t.onerror=function(){d("Unable to read wakeword file."),a(!1)},t.readAsArrayBuffer(this.files[0])}function n(e,t=!0){document.querySelector("#"+e).disabled=!t}function i(e){document.querySelector("#wakeword_panel").querySelectorAll("input,select").forEach((t=>t.disabled=!e))}function a(e){document.querySelector("#btn_panel").querySelectorAll("button").forEach((t=>t.disabled=!e))}function c(e){console.log(e);var r=document.querySelector("#terminal");r.innerHTML+='<span style="color: grey">'+t+'</span> % <span class="ok">'+e+"</span><br>",r.parentElement.scrollTop=r.parentElement.scrollHeight}function d(e){console.error(e);var r=document.querySelector("#terminal");r.innerHTML+='<span style="color: grey">'+t+'</span> % <span class="error">'+e+"</span><br>",r.parentElement.scrollTop=r.parentElement.scrollHeight}})()})()})();