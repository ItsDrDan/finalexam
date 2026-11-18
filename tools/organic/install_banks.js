#!/usr/bin/env node
/* Put tools/organic/build/28A.json and 28B.json into index.html.
   While a bank is still empty (never published) the whole block is written. Once a bank has questions,
   only questions added at the END are accepted (or, with --edit, in-place corrections that keep each question's
   position and topic; every edited id is listed) (ids are course + position): every existing question must
   be unchanged and in place, unless --replace is given (only before the bank has ever been published). */
const fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'..','..','index.html');const bankio=require('../bankio');let h=bankio.loadVirtual();const replace=process.argv.includes('--replace'),edit=process.argv.includes('--edit');
for(const c of ['28A','28B']){const f=path.join(__dirname,'build',c+'.json');if(!fs.existsSync(f)){console.log(c+': no build file, skipped');continue}
 const nw=JSON.parse(fs.readFileSync(f,'utf8'));const re=new RegExp('(<script type="application/json" id="bank-'+c+'">)([\\s\\S]*?)(</script>)');const m=h.match(re);if(!m)throw new Error('bank-'+c+' missing');
 const old=JSON.parse(m[2]);if(old.length&&!replace){if(nw.length<old.length)throw new Error(c+': the new build has fewer questions than the live bank');const ch=[];old.forEach((q,i)=>{if(JSON.stringify(q)!==JSON.stringify(nw[i])){if(!edit||q.t!==nw[i].t||JSON.stringify(q.c)!==JSON.stringify(nw[i].c)&&q.c.length!==nw[i].c.length)throw new Error(c+'-'+i+' changed or moved: append new questions at the end, or rerun with --edit for an in-place correction (same position and topic)');ch.push(c+'-'+i)}});if(ch.length)console.log(c+': edited in place ('+ch.length+'): '+ch.join(' '))}
 const body=JSON.stringify(nw).replace(/<\/(script)/gi,'<\\/$1');h=h.replace(re,(a,x,y,z)=>x+body+z);console.log(c+': '+old.length+' → '+nw.length)}
bankio.saveVirtual(h);
