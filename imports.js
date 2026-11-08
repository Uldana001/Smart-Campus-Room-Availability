import fs from 'fs'; import path from 'path';
const get = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?get(path.join(d,e.name)):[path.join(d,e.name)]);
for (const f of get('src').filter(f=>/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f))) {
  const imps = fs.readFileSync(f,'utf8').split('\n').filter(l=>/^import .* from '(\.|@\/)/.test(l)).map(l=>l.match(/from '(.+)'/)[1]);
  console.log(f+': '+(imps.join(', ')||'-'));
}