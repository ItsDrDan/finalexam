#!/usr/bin/env node
/* Put tools/organic/build/28A.json and 28B.json into index.html.
   While a bank is still empty (never published) the whole block is written. Once a bank has questions,
   only questions added at the END are accepted (ids are course + position): every existing question must
   be unchanged and in place, unless --replace is given (only before the bank has ever been published). */
const fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'..','..','index.html');let h=fs.readFileSync(FILE,'utf8');const replace=process.argv.includes('--replace');
for(const c of ['28A','28B']){const f=path.join(__dirname,'build',c+'.json');if(!fs.existsSync(f)){console.log(c+': no build file, skipped');continue}
 const nw=JSON.parse(fs.readFileSync(f,'utf8'));const re=new RegExp('(<script type="application/json" id="bank-'+c+'">)([\\s\\S]*?)(</script>)');const m=h.match(re);if(!m)throw new Error('bank-'+c+' missing');
 const old=JSON.parse(m[2]);if(old.length&&!replace){old.forEach((q,i)=>{if(JSON.stringify(q)!==JSON.stringify(nw[i]))throw new Error(c+'-'+i+' changed or moved: append new questions at the end, or fix it with tools/apply_fixes.js')})}
 const body=JSON.stringify(nw).replace(/<\/(script)/gi,'<\\/$1');h=h.replace(re,(a,x,y,z)=>x+body+z);console.log(c+': '+old.length+' → '+nw.length)}
fs.writeFileSync(FILE,h);
