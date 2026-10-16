(function(root){
  'use strict';
  const ORDER=['Upper A','Lower A','Upper B','Lower B'];
  const LEVELS=['easy','medium','hard'];
  const MOODS=['rough','okay','great'];
  // Keep the identity and units of historical dumbbell entries after the program change.
  const OLD_LATERAL={name:'Dumbbell Lateral Raise',reps:'12–15',rest:75,last:'Keep strict/light',start:'5–10',unit:'lb each',cue:'Soft elbows, raise out and slightly forward, no shrugging.',sets:3};
  const ALTERNATIVES={
    'Upper A':{
      0:{name:'Flat Dumbbell Bench Press',unit:'lb each',cue:'Use a flat bench, keep your shoulder blades set, and lower the dumbbells with control.'},
      2:{name:'Plate-Loaded Shoulder Press Machine',unit:'plates lb total',cue:'Adjust the seat to the handles. Keep your back supported and press smoothly without arching.'},
      3:{name:'Machine Lateral Raise',unit:'lb',reps:'12–15',cue:'Rest your arms on the pads, keep your torso still, and raise smoothly without shrugging.'}
    },
    'Upper B':{
      0:{name:'Plate-Loaded Incline Chest Press Machine',unit:'plates lb total',cue:'Adjust the seat to the handles, keep your shoulder blades set, and press with control.'},
      3:{name:'Cable Lateral Raise',unit:'lb',reps:'12–15 / arm',cue:'Lead with your elbow, raise to about shoulder height, and avoid swinging or shrugging.'}
    }
  };
  function exerciseOptions(routine,index,workouts){
    const primary=workouts[routine].exercises[index],alt=ALTERNATIVES[routine]?.[index];
    return alt?[primary,{...primary,...alt,start:'',last:'Alternative exercise — establish a baseline'}]:[primary];
  }
  function exerciseSpec(routine,index,name,workouts){
    if(routine==='Upper B'&&index===3&&name===OLD_LATERAL.name)return OLD_LATERAL;
    return exerciseOptions(routine,index,workouts).find(e=>e.name===name)||workouts[routine].exercises[index];
  }
  // The array stays in prescribed slot order. Only exerciseOrder controls the display.
  const hasSuperset=s=>s.routine==='Upper A'||s.routine==='Upper B';
  function prepareSession(s){
    s.exerciseOrder??=[0,1,2,3,4,5];s.warmupComplete??=false;s.cooldownStatus??='';return s;
  }
  function exerciseBlocks(s){
    const order=s.exerciseOrder||[0,1,2,3,4,5];
    return order.filter(i=>!hasSuperset(s)||i!==5).map(i=>hasSuperset(s)&&i===4?[4,5]:[i]);
  }
  function moveExercise(s,index,delta){
    if(delta!==-1&&delta!==1)return false;
    const blocks=exerciseBlocks(s),at=blocks.findIndex(b=>b.includes(index)),to=at+delta;
    if(at<0||to<0||to>=blocks.length)return false;
    const [block]=blocks.splice(at,1);blocks.splice(to,0,block);s.exerciseOrder=blocks.flat();return true;
  }
  function exerciseRecords(e){
    return [{name:e.name,data:e},...Object.entries(e.variants||{}).filter(([name])=>name!==e.name).map(([name,data])=>({name,data}))];
  }
  function setOwner(e,round){return exerciseRecords(e).find(r=>r.data.sets[round].done)}
  function roundComplete(s,round){return hasSuperset(s)&&!!setOwner(s.exercises[4],round)&&!!setOwner(s.exercises[5],round)}
  function toggleSet(s,index,round){
    const e=s.exercises[index],owner=setOwner(e,round);
    if(owner){owner.data.sets[round].done=false;return false}
    const set=e.sets[round];
    if(!set.weight.trim()||!/^\d+(\.\d+)?$/.test(set.reps)||Number(set.reps)<=0||Number(set.reps)>9999)throw Error('Enter a weight (or BW) and positive reps or seconds first.');
    set.done=true;return true;
  }
  function initialExercise(spec,sessions,date,exclude=null){
    const prev=latestFor(spec.name,sessions,date,exclude),weight=/^\d+[–-]\d+$/.test(spec.start)?spec.start.split(/[–-]/)[0]:spec.start;
    return {name:spec.name,feel:'',sets:Array.from({length:3},(_,i)=>({weight:(prev?.sets[i]?.done?prev.sets[i].weight:prev?.sets.find(s=>s.done)?.weight)??weight,reps:'',done:false}))};
  }
  function swapExercise(s,index,name,workouts,sessions=[]){
    const spec=exerciseOptions(s.routine,index,workouts).find(e=>e.name===name),e=s.exercises[index];
    if(!spec||!ALTERNATIVES[s.routine]?.[index])throw Error('That alternative is not assigned to this exercise.');
    if(e.name===name)return false;
    const variants=e.variants||{};variants[e.name]=structuredClone({feel:e.feel,sets:e.sets});
    const target=variants[name]||initialExercise(spec,sessions,s.date,s.id);delete variants[name];
    s.exercises[index]={name,feel:target.feel,sets:structuredClone(target.sets),variants};return true;
  }
  function upgradeDraft(draft,workouts){
    if(!draft||draft.routine!=='Upper B'||draft.finishedAt||draft.legacyRoutine)return false;
    const old=draft.exercises[3];
    if(old.name!==OLD_LATERAL.name||old.feel||Object.keys(old.variants||{}).length||old.sets.some(s=>s.done||s.reps||!['','5','5–10','5-10'].includes(s.weight)))return false;
    const machine=workouts['Upper B'].exercises[3];
    if(machine.name==='Dumbbell Lateral Raise')return false;
    draft.exercises[3]={name:machine.name,feel:'',sets:Array.from({length:3},()=>({weight:machine.start,reps:'',done:false}))};
    return true;
  }
  function dayKey(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
  function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00');return !isNaN(d)&&dayKey(d)===value}
  function id(){return root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}
  function emptyState(){return {version:4,sessions:[],draft:null,settings:{autoRest:true},legacyDrafts:{}}}
  function completed(session){return session.exercises.reduce((n,e)=>n+exerciseRecords(e).reduce((a,r)=>a+r.data.sets.filter(s=>s.done).length,0),0)}
  function uniqueDays(sessions){return new Set(sessions.map(s=>s.date)).size}
  function latestFor(name,sessions,before=dayKey(),exclude=null){return sessions.filter(s=>s.date<=before&&s.id!==exclude).sort((a,b)=>b.date.localeCompare(a.date)||b.finishedAt.localeCompare(a.finishedAt)).flatMap(s=>s.exercises.flatMap(exerciseRecords)).find(r=>r.name===name&&r.data.sets.some(s=>s.done))?.data}
  function startSession(routine,workouts,sessions,date=dayKey()){
    return prepareSession({id:id(),routine,date,startedAt:new Date().toISOString(),finishedAt:'',moodIn:'',moodOut:'',difficulty:'',notes:'',exercises:workouts[routine].exercises.map(e=>initialExercise(e,sessions,date))});
  }
  function validateSession(s,workouts,finished=true){
    if(!s||typeof s!=='object'||typeof s.id!=='string'||s.id.length>160||!ORDER.includes(s.routine)||!validDate(s.date)||s.date>dayKey())throw Error('A workout has an invalid routine or date.');
    for(const f of ['startedAt','finishedAt'])if(typeof s[f]!=='string'||(s[f]&&isNaN(Date.parse(s[f]))))throw Error('A workout has an invalid timestamp.');
    if(!s.startedAt||(finished&&!s.finishedAt))throw Error('A workout is missing its timestamp.');
    if(!['',...MOODS].includes(s.moodIn)||!['',...MOODS].includes(s.moodOut)||!['',...LEVELS].includes(s.difficulty))throw Error('A workout has invalid ratings.');
    if(typeof s.notes!=='string'||s.notes.length>10000)throw Error('Workout notes are invalid or too long.');
    if(!Array.isArray(s.exercises)||s.exercises.length!==workouts[s.routine].exercises.length)throw Error('Workout exercises do not match the program.');
    if(s.exerciseOrder!==undefined){const order=s.exerciseOrder;if(!Array.isArray(order)||order.length!==6||new Set(order).size!==6||order.some(i=>!Number.isInteger(i)||i<0||i>5)||(hasSuperset(s)&&order.indexOf(5)!==order.indexOf(4)+1))throw Error('Exercise order is invalid or separates the superset.');}
    if(s.warmupComplete!==undefined&&typeof s.warmupComplete!=='boolean')throw Error('Warm-up status is invalid.');
    if(s.cooldownStatus!==undefined&&!['','complete','skipped'].includes(s.cooldownStatus))throw Error('Cool-down status is invalid.');
    s.exercises.forEach((e,i)=>{
      if(!e||typeof e.name!=='string'||e.name!==exerciseSpec(s.routine,i,e.name,workouts).name)throw Error('Workout exercise data is invalid.');
      if(e.variants!==undefined&&(!e.variants||typeof e.variants!=='object'||Array.isArray(e.variants)||Object.keys(e.variants).length>2))throw Error('Saved exercise alternatives are invalid.');
      for(const record of exerciseRecords(e)){
        const {name,data}=record;
        if(name!==exerciseSpec(s.routine,i,name,workouts).name||!data||!['',...LEVELS].includes(data.feel)||!Array.isArray(data.sets)||data.sets.length!==3)throw Error('Workout exercise data is invalid.');
        data.sets.forEach(set=>{if(!set||typeof set.weight!=='string'||set.weight.length>40||typeof set.reps!=='string'||set.reps.length>8||typeof set.done!=='boolean')throw Error('Set data is invalid.');if(set.done&&(!set.weight.trim()||!/^\d+(\.\d+)?$/.test(set.reps)||Number(set.reps)<=0||Number(set.reps)>9999))throw Error('A completed set needs a weight and positive reps or seconds.');});
      }
      if(e.variants&&Object.hasOwn(e.variants,e.name))throw Error('The active exercise is duplicated in its alternatives.');
      for(let j=0;j<3;j++)if(exerciseRecords(e).filter(r=>r.data.sets[j].done).length>1)throw Error('A prescribed set is completed twice across alternatives.');
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
  root.GymCore={ORDER,LEVELS,MOODS,dayKey,validDate,id,emptyState,completed,uniqueDays,latestFor,startSession,exerciseSpec,exerciseOptions,exerciseRecords,setOwner,roundComplete,toggleSet,swapExercise,hasSuperset,prepareSession,exerciseBlocks,moveExercise,upgradeDraft,validateSession,validateBackup,mergeSessions,migrateLegacy};
  if(typeof module!=='undefined')module.exports=root.GymCore;
})(typeof window!=='undefined'?window:globalThis);
