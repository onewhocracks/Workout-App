(function(root){
  'use strict';
  const ORDER=['Upper A','Lower A','Upper B','Lower B'];
  const LEVELS=['easy','medium','hard'];
  const MOODS=['rough','okay','great'];
  // Keep the identity and units of historical dumbbell entries after the program change.
  const OLD_LATERAL={name:'Dumbbell Lateral Raise',reps:'12–15',rest:75,last:'Keep strict/light',start:'5–10',unit:'lb each',cue:'Soft elbows, raise out and slightly forward, no shrugging.',sets:3};
  function exerciseSpec(routine,index,name,workouts){return routine==='Upper B'&&index===3&&name===OLD_LATERAL.name?OLD_LATERAL:workouts[routine].exercises[index]}
  function upgradeDraft(draft,workouts){
    if(!draft||draft.routine!=='Upper B'||draft.finishedAt||draft.legacyRoutine)return false;
    const old=draft.exercises[3];
    if(old.name!==OLD_LATERAL.name||old.feel||old.sets.some(s=>s.done||s.reps||!['','5','5–10','5-10'].includes(s.weight)))return false;
    const machine=workouts['Upper B'].exercises[3];
    if(machine.name==='Dumbbell Lateral Raise')return false;
    draft.exercises[3]={name:machine.name,feel:'',sets:Array.from({length:3},()=>({weight:machine.start,reps:'',done:false}))};
    return true;
  }
  function dayKey(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
  function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00');return !isNaN(d)&&dayKey(d)===value}
  function id(){return root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}
  function emptyState(){return {version:4,sessions:[],draft:null,settings:{autoRest:true},legacyDrafts:{}}}
  function completed(session){return session.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0)}
  function uniqueDays(sessions){return new Set(sessions.map(s=>s.date)).size}
  function latestFor(name,sessions,before=dayKey(),exclude=null){return sessions.filter(s=>s.date<=before&&s.id!==exclude).sort((a,b)=>b.date.localeCompare(a.date)||b.finishedAt.localeCompare(a.finishedAt)).flatMap(s=>s.exercises).find(e=>e.name===name&&e.sets.some(s=>s.done))}
  function startSession(routine,workouts,sessions,date=dayKey()){
    return {id:id(),routine,date,startedAt:new Date().toISOString(),finishedAt:'',moodIn:'',moodOut:'',difficulty:'',notes:'',exercises:workouts[routine].exercises.map(e=>{
      const prev=latestFor(e.name,sessions,date);const weight=/^\d+[–-]\d+$/.test(e.start)?e.start.split(/[–-]/)[0]:e.start;
      return {name:e.name,feel:'',sets:Array.from({length:3},(_,i)=>({weight:(prev?.sets[i]?.done?prev.sets[i].weight:prev?.sets.find(s=>s.done)?.weight)??weight,reps:'',done:false}))};
    })};
  }
  function validateSession(s,workouts,finished=true){
    if(!s||typeof s!=='object'||typeof s.id!=='string'||s.id.length>160||!ORDER.includes(s.routine)||!validDate(s.date)||s.date>dayKey())throw Error('A workout has an invalid routine or date.');
    for(const f of ['startedAt','finishedAt'])if(typeof s[f]!=='string'||(s[f]&&isNaN(Date.parse(s[f]))))throw Error('A workout has an invalid timestamp.');
    if(!s.startedAt||(finished&&!s.finishedAt))throw Error('A workout is missing its timestamp.');
    if(!['',...MOODS].includes(s.moodIn)||!['',...MOODS].includes(s.moodOut)||!['',...LEVELS].includes(s.difficulty))throw Error('A workout has invalid ratings.');
    if(typeof s.notes!=='string'||s.notes.length>10000)throw Error('Workout notes are invalid or too long.');
    if(!Array.isArray(s.exercises)||s.exercises.length!==workouts[s.routine].exercises.length)throw Error('Workout exercises do not match the program.');
    s.exercises.forEach((e,i)=>{
      if(e.name!==exerciseSpec(s.routine,i,e.name,workouts).name||!['',...LEVELS].includes(e.feel)||!Array.isArray(e.sets)||e.sets.length!==3)throw Error('Workout exercise data is invalid.');
      e.sets.forEach(set=>{if(typeof set.weight!=='string'||set.weight.length>40||typeof set.reps!=='string'||set.reps.length>8||typeof set.done!=='boolean')throw Error('Set data is invalid.');if(set.done&&(!set.weight.trim()||!/^\d+(\.\d+)?$/.test(set.reps)||Number(set.reps)<=0||Number(set.reps)>9999))throw Error('A completed set needs a weight and positive reps or seconds.');});
    });
    if(finished&&!completed(s))throw Error('A saved workout must have at least one completed set.');
    return s;
  }
  function validateBackup(data,workouts){
    if(!data||data.version!==4||!Array.isArray(data.sessions)||data.sessions.length>20000)throw Error('Choose a Gym Companion backup (version 4).');
    const ids=new Set();data.sessions.forEach(s=>{validateSession(s,workouts);if(ids.has(s.id))throw Error('Backup contains duplicate workout IDs.');ids.add(s.id)});
    if(data.draft)validateSession(data.draft,workouts,false);
    if(data.legacyDrafts){if(typeof data.legacyDrafts!=='object'||Array.isArray(data.legacyDrafts))throw Error('Older entries are invalid.');for(const [routine,draft] of Object.entries(data.legacyDrafts)){if(!ORDER.includes(routine)||draft.routine!==routine)throw Error('Older entries are invalid.');validateSession(draft,workouts,false)}}
    return data;
  }
  function mergeSessions(existing,incoming){const found=new Set(existing.map(s=>s.id));return [...existing,...incoming.filter(s=>!found.has(s.id))]}
  function migrateLegacy(legacy,workouts){
    const state=emptyState(),mood={'😫':'rough','😐':'okay','😄':'great'};
    ORDER.forEach(k=>{if(!legacy?.[k]?.exercises)return;const d=startSession(k,workouts,[]);d.moodIn=mood[legacy[k].moodIn]||'';d.moodOut=mood[legacy[k].moodOut]||'';let hasData=!!(d.moodIn||d.moodOut);
      d.exercises.forEach((e,i)=>{const old=legacy[k].exercises[i];if(!old)return;if(k==='Upper B'&&i===3){e.name=OLD_LATERAL.name;e.sets.forEach(s=>s.weight='5')}e.feel=LEVELS.includes(old.feel)?old.feel:'';e.sets=e.sets.map((s,j)=>{const os=old.sets?.[j];if(!os)return s;const weight=String(os.w??s.weight).slice(0,40),reps=String(os.r??'').slice(0,8);if(reps||os.d||e.feel)hasData=true;return {weight,reps,done:!!os.d&&!!weight.trim()&&/^\d+(\.\d+)?$/.test(reps)&&Number(reps)>0}})});
      if(hasData)state.legacyDrafts[k]=d;
    });return state;
  }
  root.GymCore={ORDER,LEVELS,MOODS,dayKey,validDate,id,emptyState,completed,uniqueDays,latestFor,startSession,exerciseSpec,upgradeDraft,validateSession,validateBackup,mergeSessions,migrateLegacy};
  if(typeof module!=='undefined')module.exports=root.GymCore;
})(typeof window!=='undefined'?window:globalThis);
