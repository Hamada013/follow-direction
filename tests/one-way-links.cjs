'use strict';
// Follow Direction stands alone: the main website and tools site link here, never the other way round.
const fs=require('node:fs'),path=require('node:path');
const site=path.resolve(__dirname,'../output/pages'),banned=/speech-website|hamada013\.github\.io\/tools|assets\/site\/|tools\.html|(?:^|["'`/])(?:forms|resources)\.html|href="\.\.\//;
if(!fs.existsSync(path.join(site,'index.html')))throw Error('Run scripts/stage-site.cjs first.');
const bad=[];let checked=0;
for(const entry of fs.readdirSync(site,{recursive:true,withFileTypes:true})){
 if(!entry.isFile()||!/\.(html|js|css|json|webmanifest)$/.test(entry.name))continue;
 const file=path.join(entry.parentPath,entry.name);checked++;
 if(banned.test(fs.readFileSync(file,'utf8')))bad.push(path.relative(site,file));
}
if(bad.length)throw Error('Links back to another site:\n'+bad.join('\n'));
console.log(`PASS: ${checked} published files have no link back to another site.`);
