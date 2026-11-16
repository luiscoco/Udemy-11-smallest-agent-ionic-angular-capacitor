import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const files={state:'frontend/src/app/lab-state.ts',client:'frontend/src/app/api.ts',route:'backend/app/main.py',service:'backend/app/agent_service.py',schema:'backend/app/schemas.py',render:'frontend/src/app/code.component.ts'};
const svg=read('scripts/workflow-template.svg'),puml=read('scripts/workflow-template.puml');
if(/<style\b|\bclass=/.test(svg))throw Error('SVG must use explicit presentation attributes, including fill="none" on frames.');
const labels=[...svg.matchAll(/<text[^>]*>(\d+)\. ([^<]+)<\/text>/g)].map(m=>[Number(m[1]),m[2].replaceAll('&amp;','&').replaceAll('&gt;','>')]);
if(labels.length!==16||labels.some(([n],i)=>n!==i+1))throw Error('SVG must contain sixteen consecutive interactions.');
const umlLabels=puml.split('\n').filter(line=>/\s(?:->|-->)\s/.test(line)).map(line=>line.split(':').slice(1).join(':').trim());
if(umlLabels.length!==16||umlLabels.some((title,i)=>title!==labels[i][1]))throw Error('PlantUML and SVG labels must match.');
const definitions=[
 ['state','const trimmed=this.prompt().trim()',12,'Trim the Angular form input and lock immediately.','An injectable singleton owns signals across all five routed Ionic pages. The synchronous lock applies before any await; the server repeats validation.'],
 ['client',"const response = await fetch(base + '/api/agent/stream'",12,'POST JSON from the Ionic WebView or browser.','The public API URL comes from config.json. Browser fetch streams remain enabled; CapacitorHttp interception is disabled to avoid buffering SSE.'],
 ['schema','class PromptRequest',5,'Validate the prompt before inference.','Strict Pydantic strings are trimmed, bounded to 1–4000 characters and reject extra fields. ASGI middleware also bounds actual bytes, media type and Origin.'],
 ['route','async def stream(body',13,'Delegate a real FastAPI route to the Python service.','FastAPI returns native ServerSentEvent objects. A missing key exits before the query iterator is created. Invalid input fails before SSE headers.'],
 ['service','source = self.query_fn(prompt=prompt',8,'Invoke the actual Python Claude Agent SDK.','The SDK owns the CLI runtime and Claude transport. This excerpt is the application boundary initiating that exchange, rather than a fabricated HTTP implementation.'],
 ['service','async for message in source:',7,'Observe the SDK async iterator.','The model exchange returns through SDK messages. ResultMessage supplies the final answer; contextlib.aclosing closes the iterator on success, failure and cancellation.'],
 ['service',"yield {'type': kind",3,'Project only safe SDK fields.','Text, subtype and normalized result fields are allowlisted. Thinking, environment, paths, tool inputs and session IDs do not enter public messages; exact key occurrences are redacted.'],
 ['route',"yield ServerSentEvent(event='message'",7,'Encode real UTF-8 SSE events.','FastAPI supplies event framing and heartbeat comments. Disconnect cancellation closes the stream; the three-minute timeout emits a safe error without done.'],
 ['state','if(this.messages().length<500)',9,'Append timestamped Angular signal state.','Timeline rows stop at 500 while final result processing remains independent. Expand a row to inspect syntax-colored JSON.'],
 ['service','def result_data(',10,'Normalize final answer and metrics.','The result contains text, turns, duration, estimated cost and is_error. A non-success subtype remains an error even when the SDK error flag is false.'],
 ['client',"if (event === 'message')",12,'Validate and dispatch a final ResultMessage.','Public contracts are runtime-checked before updating Angular. ResultMessage is a safe projection label shared by progress and final SSE events.'],
 ['render','this.html=DOMPurify.sanitize',15,'Render safe Markdown and colored source code.','Highlight.js escapes code. Answer rendering additionally runs DOMPurify, suppresses model images and restricts links to HTTP(S); Angular sanitizes innerHTML again.'],
 ['client',"if (event === 'done')",12,'Require both final result and done.','The incremental SSE parser handles split UTF-8 and CRLF, comments, multiline data and multiple frames. A done event cannot override an SDK error result.'],
 ['route',"yield ServerSentEvent(event='error', data={'detail': FAILURE})",3,'Emit a safe failure without a done event.','Simple-mode failures return HTTP 502. Detailed provider exceptions and submitted values are excluded from public errors.'],
 ['state','}catch(error)',12,'Show an error and accessible Ionic notice.','The same state drives inline errors and the app-wide toast. Finally clears timers and unlocks controls; cancel aborts the active fetch.'],
 ['route',"if not settings.api_key_configured:",5,'Reject missing credentials before SDK work.','Simple mode returns HTTP 503; streaming emits error without done. Invalid JSON, media, body size, Origin and prompt constraints fail independently before inference.'],
];
const steps=definitions.map(([key,marker,count,text,explanation],i)=>{
 const source=files[key],content=read(source),lines=content.split(/\r?\n/);const positions=[];let normalized='';
 for(let n=0;n<content.length;n++)if(!/[\s"'()]/.test(content[n])){normalized+=content[n];positions.push(n);}
 const found=normalized.indexOf(marker.replace(/[\s"'()]/g,''));if(found<0)throw Error(`Missing source marker ${source}: ${marker}`);
 const start=content.slice(0,positions[found]).split(/\r?\n/).length-1,selected=lines.slice(start,start+count);
 const indent=Math.min(...selected.filter(line=>line.trim()).map(line=>line.search(/\S/)));
 return {number:i+1,title:labels[i][1],source,language:source.endsWith('.py')?'python':'typescript',text,explanation,code:selected.map(line=>line.slice(indent)).join('\n')};
});
mkdirSync(resolve(root,'frontend/src/app'),{recursive:true});mkdirSync(resolve(root,'frontend/public/assets'),{recursive:true});
writeFileSync(resolve(root,'frontend/src/app/lesson.json'),JSON.stringify(steps,null,2)+'\n');
writeFileSync(resolve(root,'frontend/public/assets/workflow.svg'),svg);writeFileSync(resolve(root,'frontend/public/assets/workflow.puml'),puml);
console.log('Generated 16 Ionic/FastAPI source cards and matching portable SVG/PlantUML.');
