import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function run(command,args){const r=spawnSync(command,args,{cwd:root,stdio:'inherit',shell:process.platform==='win32'});if(r.status!==0)process.exit(r.status||1);}
const python=process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python';
if(!existsSync(resolve(root,python)))run('python',['-m','venv','.venv']);
// Relative executable path stays quoted even when the workspace has spaces.
const pip=spawnSync(resolve(root,python),['-m','pip','install','-r','backend/requirements.txt'],{cwd:root,stdio:'inherit'});if(pip.status!==0)process.exit(pip.status||1);
run('npm',['--prefix','frontend','install']);
