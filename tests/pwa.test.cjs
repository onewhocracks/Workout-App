const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('the PWA pre-caches every versioned app asset at both root and GitHub Pages paths',async()=>{
  for(const prefix of ['/','/Workout-App/']){
    const origin='https://example.test',scope=origin+prefix,handlers={},cached=new Map();let pending;
    class AssetRequest{constructor(url,options={}){this.url=new URL(url,scope).href;this.cache=options.cache;this.method='GET';this.mode='cors'}}
    const response={ok:true,marker:'cached app'};
    const ctx={URL,Request:AssetRequest,Response:{error:()=>({error:true})},self:{location:{origin},registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:()=>{},clients:{claim:()=>{}}},caches:{open:async()=>({addAll:async requests=>{for(const req of requests){assert.equal(req.cache,'reload');const pathname=new URL(req.url).pathname.slice(prefix.length);assert.ok(fs.existsSync(path.join(__dirname,'..',pathname||'index.html')),req.url);cached.set(req.url,response)}}}),keys:async()=>[],match:async request=>cached.get(typeof request==='string'?new URL(request,scope).href:request.url)},fetch:async()=>{throw Error('offline')}};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),ctx);handlers.install({waitUntil:p=>pending=p});await pending;
    const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');for(const [,asset] of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css|json|png)(?:\?[^\"]*)?)"/g))assert.ok(cached.has(new URL(asset,scope).href),'Missing offline asset '+asset);
    for(const url of [scope,scope+'app.js?v=4.7',scope+'core.js?v=4.7',scope+'styles.css?v=4.7']){let promise;handlers.fetch({request:{url,method:'GET',mode:url===scope?'navigate':'cors'},respondWith:p=>promise=p});assert.equal((await promise).marker,'cached app')}
  }
});
