(async()=>{
 window.addEventListener("hashchange",()=>{if(location.hash)location.reload();});
 const status=document.getElementById('status'), detail=document.getElementById('detail'), form=document.getElementById('invite'), input=document.getElementById('link');
 const save='invite-v1:'+location.pathname;
 let key=location.hash.slice(1);
 try{if(!key)key=localStorage.getItem(save)||'';}catch{}
 if(location.hash)history.replaceState(null,'',location.pathname+location.search);
 form.onsubmit=e=>{e.preventDefault();let value=input.value.trim();try{value=new URL(value).hash.slice(1);}catch{}if(value){location.hash=value;location.reload();}};
 if(!key){status.textContent='需要专属邀请链接';detail.textContent='请从完整的邀请链接打开，或把邀请链接粘贴到下方。';form.hidden=false;return;}
 try{
  if(!crypto.subtle||!window.DecompressionStream)throw Error('browser');
  if(!/^[A-Za-z0-9_-]{43}$/.test(key))throw Error('invite');
  status.textContent='正在加载试玩';detail.textContent='首次加载稍久，请保持此页面打开…';
  const response=await fetch('game-2da6c26fc83af84c.bin',{cache:'force-cache'});if(!response.ok)throw Error('network');
  const total=Number(response.headers.get('content-length')),reader=response.body?.getReader();let packed;
  if(reader){let chunks=[],length=0;for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);length+=value.length;detail.textContent=`已下载 ${(length/1048576).toFixed(1)} MB${total?' / '+(total/1048576).toFixed(1)+' MB':''}，请稍候…`;}
   packed=new Uint8Array(length);let offset=0;for(const c of chunks){packed.set(c,offset);offset+=c.length;}chunks=null;
  }else packed=new Uint8Array(await response.arrayBuffer());
  status.textContent='正在打开游戏';
  const raw=Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')+'='),c=>c.charCodeAt(0));
  const aes=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
  const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:packed.slice(0,12)},aes,packed.slice(12));packed=null;
  const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
  const html=await new Response(stream).text();
  try{localStorage.setItem(save,key);}catch{}
  document.open();document.write(html);document.close();
 }catch(e){status.textContent=e.message==='browser'?'请更新 Safari 后重试':'暂时无法打开试玩';detail.textContent=e.message==='browser'?'此试玩需要支持网页解密和解压的较新浏览器。':e.name==='OperationError'||e.message==='invite'?'邀请链接不完整或已失效，请重新打开完整链接。':'下载失败，请检查网络后刷新。';form.hidden=false;}
})();
