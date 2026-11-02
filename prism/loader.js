(()=>{
 const status=document.getElementById('status'),detail=document.getElementById('detail'),form=document.getElementById('invite'),input=document.getElementById('link'),button=form.querySelector('button');
 const save='invite-v1:'+location.pathname;let busy=false;
 function parse(value){value=String(value||'').trim();const match=value.match(/#([A-Za-z0-9_-]{43})(?:[^A-Za-z0-9_-]|$)/);if(match)return match[1];return /^[A-Za-z0-9_-]{43}$/.test(value)?value:'';}
 function help(title,message){status.textContent=title;detail.textContent=message;form.hidden=false;button.disabled=false;button.textContent='打开试玩';}
 async function unlock(key){
  if(busy)return;if(!key){help('请粘贴完整邀请链接','链接需要包含 # 后面的通行信息。也可以只粘贴那串通行信息。');return;}busy=true;button.disabled=true;button.textContent='正在打开…';
  // Keep a recoverable invite until decryption succeeds; never reload while submitting.
  try{sessionStorage.setItem(save+':pending',key);}catch{}
  try{
   if(!crypto.subtle||!window.DecompressionStream)throw Error('browser');
   status.textContent='正在加载试玩';detail.textContent='首次下载稍久，请保持页面打开。下载失败可以直接重试。';
   const response=await fetch('game-aa1b766723e8cd2a.bin',{cache:'force-cache'});if(!response.ok)throw Error('network');
   const total=Number(response.headers.get('content-length')),reader=response.body?.getReader();let packed;
   if(reader){let chunks=[],length=0;for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);length+=value.length;detail.textContent=`已下载 ${(length/1048576).toFixed(1)} MB${total?' / '+(total/1048576).toFixed(1)+' MB':''}，请稍候…`;}
    packed=new Uint8Array(length);let offset=0;for(const c of chunks){packed.set(c,offset);offset+=c.length;}chunks=null;
   }else packed=new Uint8Array(await response.arrayBuffer());
   status.textContent='正在打开游戏';const raw=Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')+'='),c=>c.charCodeAt(0));
   const aes=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:packed.slice(0,12)},aes,packed.slice(12));packed=null;
   const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));let html=await new Response(stream).text();const base=document.createElement('base');base.href=new URL('./',location.href).href;html=html.replace('<head>','<head>'+base.outerHTML);
   try{localStorage.setItem(save,key);sessionStorage.removeItem(save+':pending');}catch{}
   history.replaceState(null,'',location.pathname+location.search);
   const frame=document.createElement('iframe');frame.title='游戏试玩';frame.allow='autoplay; fullscreen';frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;height:100dvh;border:0;display:block;background:#edf8f3';document.documentElement.style.cssText='width:100%;height:100%;overflow:hidden';document.body.style.cssText='margin:0;width:100%;height:100%;overflow:hidden';frame.srcdoc=html;document.body.replaceChildren(frame);
  }catch(e){busy=false;help(e.message==='browser'?'请使用较新的 Safari 或 Chrome':'没有打开，请重试',e.message==='browser'?'当前浏览器缺少网页解密或解压功能。':e.name==='OperationError'?'邀请信息不匹配，请重新粘贴这个游戏的完整邀请链接。':'下载暂时失败。邀请信息已保留，点击下方按钮即可重试。');input.value=key;}
 }
 form.addEventListener('submit',e=>{e.preventDefault();input.blur();button.blur();unlock(parse(input.value));});
 window.addEventListener('hashchange',()=>unlock(parse(location.hash)));
 let key=parse(location.hash);try{if(!key)key=localStorage.getItem(save)||sessionStorage.getItem(save+':pending')||'';}catch{}
 if(key)unlock(key);else help('需要专属邀请链接','请把收到的完整邀请链接粘贴到下方，然后点击“打开试玩”。');
})();
