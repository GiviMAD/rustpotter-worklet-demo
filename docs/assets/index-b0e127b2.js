(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const c of n)if(c.type==="childList")for(const y of c.addedNodes)y.tagName==="LINK"&&y.rel==="modulepreload"&&s(y)}).observe(document,{childList:!0,subtree:!0});function a(n){const c={};return n.integrity&&(c.integrity=n.integrity),n.referrerPolicy&&(c.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?c.credentials="include":n.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(n){if(n.ep)return;n.ep=!0;const c=a(n);fetch(n.href,c)}})();const te=typeof TextDecoder<"u"?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};typeof TextDecoder<"u"&&te.decode();const O=new Array(128).fill(void 0);O.push(void 0,null,!0,!1);O.length;const P=typeof TextEncoder<"u"?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}};P.encodeInto;const l=Object.freeze({max:0,0:"max",avg:1,1:"avg",median:2,2:"median",p25:3,3:"p25",p50:4,4:"p50",p75:5,5:"p75",p80:6,6:"p80",p90:7,7:"p90",p95:8,8:"p95"});var p;(function(i){i.STARTED="started",i.STOPPED="stopped",i.DETECTION="detection",i.PORT_STARTED="port_started",i.PORT_STOPPED="port_stopped",i.WAKEWORD_ADDED="wakeword_added",i.WAKEWORD_REMOVED="wakeword_removed",i.WAKEWORDS_REMOVED="wakewords_removed",i.CONFIG_UPDATED="config_updated"})(p||(p={}));var h;(function(i){i.START="start",i.STOP="stop",i.ADD_WAKEWORD="add_wakeword",i.REMOVE_WAKEWORD="remove_wakeword",i.REMOVE_WAKEWORDS="remove_wakewords",i.START_PORT="start_port",i.STOP_PORT="stop_port",i.UPDATE_CONFIG="update_config"})(h||(h={}));class R{static async new(e,a,s={}){const n=new R(e,a,s);return await n.initWorker(),n}constructor(e,a,s){this.sampleRate=e,this.resources=a,this.spotListener=n=>{},this.workerCallback=({data:n})=>{switch(n[0]){case p.DETECTION:return this.spotListener(n[1])}},this.config=Object.assign(re,s)}onDetection(e){this.spotListener=e}close(){var e;return this.workerPort&&((e=this.audioProcessorNode)===null||e===void 0||e.disconnect(),this.workerPort([h.STOP,void 0])),Promise.resolve()}async getProcessorNode(e){if(this.audioProcessorNode)throw new Error("Can not create multiple processor nodes");return await this.initWorklet(e),this.audioProcessorNode}async disposeProcessorNode(){if(!this.audioProcessorNode)throw new Error("Processor node already disposed");await new Promise((e,a)=>{try{this.audioProcessorNode.disconnect()}catch{}this.audioProcessorNode=null,this.resolveOnWorkerMsg(p.PORT_STOPPED,e,()=>a(new Error("Unable to stop worklet"))),this.workerPort([h.STOP_PORT,void 0])})}async addWakewordByPath(e,a,s){return this.fetchResource(a,s).then(n=>this.addWakeword(e,n))}async addWakeword(e,a){return new Promise(s=>{this.resolveOnWorkerMsg(p.WAKEWORD_ADDED,s,()=>s(!1)),this.workerPort([h.ADD_WAKEWORD,[e,a]],[a])})}async removeWakeword(e){return new Promise(a=>{this.resolveOnWorkerMsg(p.WAKEWORD_REMOVED,a,()=>a(!1)),this.workerPort([h.REMOVE_WAKEWORD,e])})}async removeWakewords(){return new Promise(e=>{this.resolveOnWorkerMsg(p.WAKEWORDS_REMOVED,e,()=>e(!1)),this.workerPort([h.REMOVE_WAKEWORDS,void 0])})}async updateConfig(e){this.config=Object.assign(this.config,e),await new Promise((a,s)=>{this.resolveOnWorkerMsg(p.CONFIG_UPDATED,a,()=>s(new Error("Unable to update config"))),this.workerPort([h.UPDATE_CONFIG,this.config])})}async initWorker(){const e=this.worker=new window.Worker(this.resources.workerPath);return this.workerPort=(a,s)=>e.postMessage(a,s),new Promise(async(a,s)=>{const n=({data:c})=>{switch(c[0]){case p.STARTED:return c[1]?(e.addEventListener("message",this.workerCallback),a()):s(new Error("Unable to start rustpotter worker"))}};try{e.addEventListener("message",n,{once:!0}),this.fetchResource(this.resources.wasmPath).then(c=>this.workerPort([h.START,{wasmBytes:c,sampleRate:this.sampleRate,config:this.config}]))}catch(c){s(c)}})}async initWorklet(e){if(e.sampleRate!=this.sampleRate)throw new Error("Audio context sample rate is not correct");await new Promise(async(a,s)=>{try{await e.audioWorklet.addModule(this.resources.workletPath),this.audioProcessorNode=new AudioWorkletNode(e,"rustpotter-worklet",{numberOfOutputs:0});const n=this.audioProcessorNode.port;this.resolveOnWorkerMsg(p.PORT_STARTED,a,()=>s(new Error("Unable to setup rustpotter worklet"))),this.workerPort([h.START_PORT,n],[n])}catch(n){s(n)}})}fetchResource(e,a){return window.fetch(e,{headers:a}).then(s=>{if(s.ok)return s.arrayBuffer();throw new Error(`Failed with http status ${s.status}: ${s.statusText}`)})}resolveOnWorkerMsg(e,a,s){this.worker.addEventListener("message",({data:n})=>{if(n[0]==e)return n[1]?a(n[1]):s()},{once:!0})}}const re={minScores:5,threshold:.5,averagedThreshold:.25,scoreRef:.22,bandSize:6,vadMode:null,scoreMode:l.max,gainNormalizerEnabled:!1,minGain:.1,maxGain:1,gainRef:void 0,bandPassEnabled:!1,bandPassLowCutoff:85,bandPassHighCutoff:400};(async()=>{const i="rustpotter@Demo",e={audioContext:null,mediaStream:null,selectedWakeword:null,selectedWakewordBytes:null,selectedThreshold:.5,selectedAvgThreshold:.2,gainNormalizer:!1,minGain:.5,maxGain:1,gainRef:null,bandPass:!1,bandPassLowCutoff:80,bandPassHighCutoff:400,scoreMode:l.max,minScores:10,eager:!0,rustpotterService:null};window.addEventListener("load",q,{once:!0});function a(t){e.selectedThreshold=Number(t.target.value)}function s(t){e.selectedAvgThreshold=Number(t.target.value)}function n(t){var d;const r=t.target.value,o=Number((d=t.target.value)==null?void 0:d.trim());e.minScores=r!=null&&r.length&&!isNaN(o)?o:0,b()}function c(t){var r,o;e.gainNormalizer=t.target.checked,e.gainNormalizer?(r=document.querySelector("#gain_normalizer_options"))==null||r.classList.remove("hidden"):(o=document.querySelector("#gain_normalizer_options"))==null||o.classList.add("hidden"),b()}function y(t){e.minGain=Number(t.target.value)}function X(t){e.maxGain=Number(t.target.value)}function A(t){var d;const r=t.target.value,o=Number((d=t.target.value)==null?void 0:d.trim());e.gainRef=r!=null&&r.length&&!isNaN(o)?o:null,b()}function F(t){var r,o;e.bandPass=t.target.checked,e.bandPass?(r=document.querySelector("#band_pass_options"))==null||r.classList.remove("hidden"):(o=document.querySelector("#band_pass_options"))==null||o.classList.add("hidden"),b()}function B(t){var d;const r=t.target.value,o=Number((d=t.target.value)==null?void 0:d.trim());e.bandPassLowCutoff=r!=null&&r.length&&!isNaN(o)?o:null,b()}function U(t){var d;const r=t.target.value,o=Number((d=t.target.value)==null?void 0:d.trim());e.bandPassHighCutoff=r!=null&&r.length&&!isNaN(o)?o:null,b()}function K(){return async()=>{v(!1),Q().then(()=>{w("record"),E(!0)}).catch(t=>{S(t.message??t)})}}async function C(){try{if(w("record",!1),E(!1),e.rustpotterService==null)throw new Error("Rustpotter not running");u("updating rustpotter config..."),await e.rustpotterService.updateConfig({averagedThreshold:e.selectedAvgThreshold,threshold:e.selectedThreshold,scoreMode:e.scoreMode,minScores:e.minScores,eager:e.eager,gainNormalizerEnabled:e.gainNormalizer,minGain:e.minGain,maxGain:e.maxGain,gainRef:e.gainRef??void 0,bandPassEnabled:e.bandPass,bandPassLowCutoff:e.bandPassLowCutoff??80,bandPassHighCutoff:e.bandPassHighCutoff??400}),u("updating rustpotter wakeword..."),await e.rustpotterService.removeWakewords(),e.selectedWakeword=="manual"?e.selectedWakewordBytes&&await e.rustpotterService.addWakeword("_",e.selectedWakewordBytes):e.selectedWakeword&&await e.rustpotterService.addWakewordByPath("_",e.selectedWakeword),await j(),w("stop")}catch(t){W(t)}}function H(t){switch(t.target.value){case"Avg":e.scoreMode=l.avg;break;case"Median":e.scoreMode=l.median;break;case"Max":e.scoreMode=l.max;break;case"P25":e.scoreMode=l.p25;break;case"P50":e.scoreMode=l.p50;break;case"P75":e.scoreMode=l.p75;break;case"P80":e.scoreMode=l.p80;break;case"P90":e.scoreMode=l.p90;break;case"P95":e.scoreMode=l.p95;break}}function I(t){var o,d;const r=t.target.value;if(e.selectedWakewordBytes=null,r=="manual"){v(!1);const m=document.querySelector("#wakeword_input_container");m&&(m.innerHTML+='<input id="wakeword_input" type="file" accept=".rpw">'),(o=document.querySelector("#wakeword_input"))==null||o.addEventListener("change",Y)}else(d=document.querySelector("#wakeword_input"))==null||d.remove(),w("record");e.selectedWakeword=r}function Y(t){const r=new FileReader;r.onload=function(){e.selectedWakewordBytes=this.result,w("record")},r.onerror=function(){S("Unable to read wakeword file."),v(!1)},this.files&&r.readAsArrayBuffer(this.files[0])}function b(){const t=["min_scores"];e.gainNormalizer&&t.push("gain_ref"),e.bandPass&&(t.push("low_cutoff"),t.push("high_cutoff")),w("record",t.every(r=>{var o;return(o=document.querySelector(`#${r}`))==null?void 0:o.validity.valid}))}async function q(){var r,o,d,m,g,N,T,G,M,_,L,z,D,V;u("this is a demo web site for testing the library spot capabilities");try{await $(),e.audioContext=new AudioContext,await J(e.audioContext.sampleRate),(r=document.querySelector("#wakeword_selector"))==null||r.addEventListener("change",I),(o=document.querySelector("#wakeword_threshold"))==null||o.addEventListener("input",a),(d=document.querySelector("#wakeword_avg_threshold"))==null||d.addEventListener("input",s),(m=document.querySelector("#score_mode_selector"))==null||m.addEventListener("change",H),(g=document.querySelector("#min_scores"))==null||g.addEventListener("input",n),(N=document.querySelector("#gain_normalizer_check"))==null||N.addEventListener("input",c),(T=document.querySelector("#min_gain"))==null||T.addEventListener("input",y),(G=document.querySelector("#max_gain"))==null||G.addEventListener("input",X),(M=document.querySelector("#gain_ref"))==null||M.addEventListener("input",A),(_=document.querySelector("#band_pass_check"))==null||_.addEventListener("input",F),(L=document.querySelector("#low_cutoff"))==null||L.addEventListener("input",B),(z=document.querySelector("#high_cutoff"))==null||z.addEventListener("input",U),(D=document.querySelector("#record"))==null||D.addEventListener("click",C),(V=document.querySelector("#stop"))==null||V.addEventListener("click",K())}catch(f){W(f);return}v(!1),E(!1);const t=document.querySelector("#rustpotter_version");t&&(t.innerHTML="rustpotter-v3.0.0",t.href="https://github.com/GiviMAD/rustpotter-cli/releases/tag/v3.0.0"),u("loading available wakewords..."),fetch("wakewords.json").then(f=>f.json()).then(f=>{const k=document.querySelector("#wakeword_selector"),Z=Object.entries(f);k&&(Z.forEach(x=>{k.innerHTML+='<option value="'+x[1]+'">'+x[0]+"</option>"}),k.innerHTML+='<option value="manual">from file...</option>',e.selectedWakeword=Z[0][1],k.disabled=!1),E(!0),w("record"),u("wakewords list loaded")}).catch(f=>{S(f.message??f),v(!1)})}async function J(t){const r=new URL("/rustpotter-worklet-demo/assets/rustpotter_wasm_bg-773597bd.wasm",self.location).toString(),o=new URL("data:application/javascript;base64,dmFyIHMsZTshZnVuY3Rpb24ocyl7cy5TVEFSVEVEPSJzdGFydGVkIixzLlNUT1BQRUQ9InN0b3AiLHMuQVVESU89ImF1ZGlvIn0oc3x8KHM9e30pKSxmdW5jdGlvbihzKXtzLlNUQVJUPSJzdGFydCIscy5TVE9QPSJzdG9wIixzLlBST0NFU1M9InByb2Nlc3MifShlfHwoZT17fSkpO2NsYXNzIHR7Y29uc3RydWN0b3IocyxlKXt0aGlzLnNhbXBsZXNQZXJGcmFtZT1zLHRoaXMuc2VuZE1zZz1lLHRoaXMuc2FtcGxlc09mZnNldD0wLHRoaXMuc2FtcGxlcz1uZXcgRmxvYXQzMkFycmF5KHRoaXMuc2FtcGxlc1BlckZyYW1lKX1wcm9jZXNzKGUpe2NvbnN0IHQ9ZVswXSxhPXRoaXMuc2FtcGxlc1BlckZyYW1lLXRoaXMuc2FtcGxlc09mZnNldDtpZih0Lmxlbmd0aD49YSl7dGhpcy5zYW1wbGVzLnNldCh0LnN1YmFycmF5KDAsYSksdGhpcy5zYW1wbGVzT2Zmc2V0KSx0aGlzLnNlbmRNc2cocy5BVURJTyx0aGlzLnNhbXBsZXMpO2NvbnN0IGU9dC5zdWJhcnJheShhKTtlLmxlbmd0aD49dGhpcy5zYW1wbGVzUGVyRnJhbWU/KHRoaXMuc2FtcGxlc09mZnNldD0wLHRoaXMucHJvY2VzcyhbZV0pKTplLmxlbmd0aD4wPyh0aGlzLnNhbXBsZXNPZmZzZXQ9ZS5sZW5ndGgsdGhpcy5zYW1wbGVzLnNldChlLDApKTp0aGlzLnNhbXBsZXNPZmZzZXQ9MH1lbHNlIHRoaXMuc2FtcGxlcy5zZXQodCx0aGlzLnNhbXBsZXNPZmZzZXQpLHRoaXMuc2FtcGxlc09mZnNldCs9dC5sZW5ndGh9fWlmKCJmdW5jdGlvbiI9PXR5cGVvZiByZWdpc3RlclByb2Nlc3Nvcil7Y2xhc3MgYSBleHRlbmRzIEF1ZGlvV29ya2xldFByb2Nlc3Nvcntjb25zdHJ1Y3Rvcigpe3N1cGVyKCksdGhpcy5jb250aW51ZVByb2Nlc3M9ITAsdGhpcy5wb3J0Lm9ubWVzc2FnZT0oe2RhdGE6YX0pPT57c3dpdGNoKGFbMF0pe2Nhc2UgZS5TVEFSVDp0aGlzLmltcGxlbWVudGF0aW9uPW5ldyB0KGFbMV0sKCguLi5zKT0+dGhpcy5wb3J0LnBvc3RNZXNzYWdlKHMpKSksdGhpcy5wb3J0LnBvc3RNZXNzYWdlKFtzLlNUQVJURUQsITBdKTticmVhaztjYXNlIGUuU1RPUDp0aGlzLmNvbnRpbnVlUHJvY2Vzcz0hMSx0aGlzLnBvcnQucG9zdE1lc3NhZ2UoW3MuU1RPUFBFRCx2b2lkIDBdKTticmVhaztkZWZhdWx0OmNvbnNvbGUud2FybihgVW5rbm93biBjb21tYW5kICR7YVswXX1gKX19fXByb2Nlc3Mocyl7cmV0dXJuIHRoaXMuaW1wbGVtZW50YXRpb24mJnNbMF0mJnNbMF0ubGVuZ3RoJiZzWzBdWzBdJiZzWzBdWzBdLmxlbmd0aCYmdGhpcy5pbXBsZW1lbnRhdGlvbi5wcm9jZXNzKHNbMF0pLHRoaXMuY29udGludWVQcm9jZXNzfX1yZWdpc3RlclByb2Nlc3NvcigicnVzdHBvdHRlci13b3JrbGV0IixhKX1lbHNle2xldCBhO29ubWVzc2FnZT0oe2RhdGE6b30pPT57c3dpdGNoKG9bMF0pe2Nhc2UgZS5QUk9DRVNTOmEmJmEucHJvY2VzcyhvWzFdKTticmVhaztjYXNlIGUuU1RPUDphPW51bGwscG9zdE1lc3NhZ2UoW3MuU1RPUFBFRCx2b2lkIDBdKSxjbG9zZSgpO2JyZWFrO2Nhc2UgZS5TVEFSVDphPW5ldyB0KG9bMV0sKCguLi5zKT0+cG9zdE1lc3NhZ2UocykpKSxwb3N0TWVzc2FnZShbcy5TVEFSVEVELCEwXSk7YnJlYWs7ZGVmYXVsdDpjb25zb2xlLndhcm4oYFVua25vd24gY29tbWFuZCAke29bMF19YCl9fX0K",self.location).toString(),d=new URL("/rustpotter-worklet-demo/assets/rustpotter-worker.min-fb1b668c.js",self.location).toString();e.rustpotterService=await R.new(t,{wasmPath:r,workerPath:d,workletPath:o}),e.rustpotterService.onDetection(m=>{const g=new Date;let N=`${g.getHours().toString().padStart(2,"0")}:${g.getMinutes().toString().padStart(2,"0")}:${g.getSeconds().toString().padStart(2,"0")}`;u(`[T${N}] ${JSON.stringify(m)}`)}),u("rustpotter initialized")}async function j(){if(!e.rustpotterService||!e.audioContext)throw new Error("Bad state");u("initiating microphone source node");const t=e.mediaStream=await navigator.mediaDevices.getUserMedia({audio:{autoGainControl:!0,echoCancellation:!0,noiseSuppression:!0},video:!1});u("initializing rustpotter audio node");const r=await e.rustpotterService.getProcessorNode(e.audioContext);e.audioContext.createMediaStreamSource(t).connect(r)}async function Q(){if(u("stopping microphone source and rustpotter processor"),!e.mediaStream||!e.rustpotterService)throw new Error("Bad state");await e.rustpotterService.disposeProcessorNode(),e.mediaStream.getTracks().forEach(t=>t.stop()),e.mediaStream=null}async function $(){if(!ee())throw new Error("Unable to record in this browser :(");if(!window.WebAssembly)throw new Error("WebAssembly feature is not available :(");if(!window.Worklet)throw new Error("AudioWorklet feature is not available :(");if(!window.Worker)throw new Error("Web Worker feature is not available :(")}function ee(){const t=!!(window.navigator&&window.navigator.mediaDevices&&window.navigator.mediaDevices.getUserMedia);return window.AudioContext&&t}function w(t,r=!0){const o=document.querySelector("#"+t);o&&(o.disabled=!r)}function E(t){var r;(r=document.querySelector("#wakeword_panel"))==null||r.querySelectorAll("input,select").forEach(o=>o.disabled=!t)}function v(t){var r;(r=document.querySelector("#btn_panel"))==null||r.querySelectorAll("button").forEach(o=>o.disabled=!t)}function u(t){console.log(t);const r=document.querySelector("#terminal");r&&(r.innerHTML+='<span style="color: grey">'+i+'</span> % <span class="ok">'+t+"</span><br>",r.parentElement&&(r.parentElement.scrollTop=r.parentElement.scrollHeight))}function S(t,r=!0){r&&console.error(t);const o=document.querySelector("#terminal");o&&(o.innerHTML+='<span style="color: grey">'+i+'</span> % <span class="error">'+t+"</span><br>",o.parentElement&&(o.parentElement.scrollTop=o.parentElement.scrollHeight))}function W(t){console.error(t),S(t instanceof Error?"unexpected error:"+t.message:t+"",!1)}})();
