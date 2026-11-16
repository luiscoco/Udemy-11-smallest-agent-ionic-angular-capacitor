import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const python=resolve(root,process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python');
if(!existsSync(python)){console.error('Run npm run setup from the application root first.');process.exit(1);}
const test=process.argv.includes('--test');
const child=spawn(python,test?['-m','pytest','-q','tests','-p','no:cacheprovider']:['run.py'],{cwd:resolve(root,'backend'),stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??0));
