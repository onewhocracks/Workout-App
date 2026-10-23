const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const C=require('../core.js'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../workouts.js'),'utf8'),ctx);const W=JSON.parse(JSON.stringify(ctx.window.WORKOUTS));
const recipe=(counts,base='0',mode='pair')=>({counts,base,mode});
test('all five plate sizes calculate correctly with paired or total counting and a base added once',()=>{
  assert.deepEqual(C.PLATES,[45,25,10,5,2.5]);
  for(let i=0;i<5;i++){const counts=[0,0,0,0,0];counts[i]=1;assert.equal(C.plateTotal(recipe(counts)),C.PLATES[i]*2);assert.equal(C.plateTotal(recipe(counts,'20','total')),C.PLATES[i]+20)}
  assert.equal(C.plateTotal(recipe([1,1,1,1,1],'20')),195);assert.equal(C.plateTotal(recipe([1,0,0,0,0],'20')),110);assert.equal(C.plateTotal(recipe([0,0,0,0,0],'12.35')),12.35);
});
test('invalid bases and counts cannot silently become a weight',()=>{
  for(const base of ['-1','NaN','Infinity','10001','1.111','1e2',''])assert.throws(()=>C.plateTotal(recipe([0,0,0,0,0],base)),base);
  for(const counts of [[-1,0,0,0,0],[101,0,0,0,0],[1.5,0,0,0,0],[0],[0,0,0,0,NaN]])assert.throws(()=>C.plateTotal(recipe(counts)));
  assert.throws(()=>C.plateTotal({...recipe([0,0,0,0,0]),mode:'anything'}));assert.throws(()=>C.plateTotal(null));
});
test('existing numeric loads seed exact recipes without guessing a machine starting weight',()=>{
  assert.deepEqual(C.plateRecipe('+110'),recipe([1,0,1,0,0]));assert.deepEqual(C.plateRecipe('110',{mode:'pair',base:'20'}),recipe([1,0,0,0,0],'20'));
  assert.equal(C.plateTotal(C.plateRecipe('52.5',{mode:'total',base:'0'})),52.5);
  for(const weight of ['BW','Bar only','111','-10'])assert.deepEqual(C.plateRecipe(weight).counts,[0,0,0,0,0]);
});
test('applying fills weights while preserving reps, feelings, completed sets and alternative ownership',()=>{
  const s=C.startSession('Upper A',W,[]),e=s.exercises[0];e.feel='hard';e.sets[0].reps='10';e.sets[1]={weight:'95',reps:'8',done:true};e.sets[2].reps='9';
  const r=recipe([1,0,0,0,0],'20');C.applyPlateLoad(s,0,0,r,true);assert.deepEqual(e.sets.map(s=>s.weight),['110','95','110']);assert.deepEqual(e.sets.map(s=>s.reps),['10','8','9']);assert.equal(e.sets[0].done,false);assert.equal(e.sets[1].done,true);assert.equal(e.feel,'hard');r.counts[0]=5;assert.equal(e.sets[0].plateLoad.counts[0],1);
  C.swapExercise(s,0,'Flat Dumbbell Bench Press',W);assert.throws(()=>C.applyPlateLoad(s,0,1,recipe([1,0,0,0,0])));C.applyPlateLoad(s,0,0,recipe([0,1,0,0,0],'0','total'),true);assert.equal(e.sets[1].weight,'95');assert.equal(s.exercises[0].sets[2].weight,'25');
});
test('plate recipes survive alternatives, history, backup and next-workout autofill',()=>{
  const s=C.startSession('Upper A',W,[]);C.applyPlateLoad(s,0,0,recipe([1,0,0,0,0],'20'));s.exercises[0].sets[0].reps='10';C.toggleSet(s,0,0);s.finishedAt=new Date().toISOString();
  const state=JSON.parse(JSON.stringify({...C.emptyState(),sessions:[s]}));C.validateBackup(state,W);const next=C.startSession('Upper A',W,state.sessions);assert.equal(next.exercises[0].sets[0].weight,'110');assert.deepEqual(next.exercises[0].sets[0].plateLoad,s.exercises[0].sets[0].plateLoad);assert.equal(next.exercises[0].sets[0].done,false);
  C.swapExercise(next,0,'Flat Dumbbell Bench Press',W);C.swapExercise(next,0,'Supine / Chest Press Machine',W);assert.equal(next.exercises[0].sets[0].plateLoad.base,'20');
  const invalid=structuredClone(state);invalid.sessions[0].exercises[0].sets[0].plateLoad.base='40';assert.throws(()=>C.validateBackup(invalid,W));
});
