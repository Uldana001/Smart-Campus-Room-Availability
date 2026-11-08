import fs from 'fs'; import path from 'path';
const root = process.argv[2] || '.';
const get = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?get(path.join(d,e.name)):[path.join(d,e.name)]);
const files = get(path.join(root,'src')).filter(f=>/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f));
const groups = [
 ['inline interval check (start/end bounds)', /start\s*<\s*end|start\s*>=\s*0|end\s*<=\s*DAY_END_MINUTES/],
 ['isValidInterval( calls', /isValidInterval\(/],
 ['blocked indicator in UI', /\.blocked\b/],
 ['bar markup (relative h-5 rounded bg-slate-100)', /relative h-5 rounded bg-slate-100/],
];
for (const [label,re] of groups){ console.log('---',label,'---'); let n=0;
 for (const f of files) fs.readFileSync(f,'utf8').split('\n').forEach((l,i)=>{ if(re.test(l)){n++;console.log(path.relative(root,f)+':'+(i+1)+': '+l.trim().slice(0,90));} });
 console.log('count',n); }