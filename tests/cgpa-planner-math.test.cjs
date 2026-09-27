const test = require('node:test');
const assert = require('node:assert/strict');

function targetPlan({ currentCgpa, completedUnits, targetCgpa, futureUnits, maxPoint }) {
  const oldCgpa = Math.min(maxPoint, Math.max(0, currentCgpa || 0));
  const oldUnits = Math.max(0, completedUnits || 0);
  const units = Math.max(0, futureUnits || 0);
  const target = Math.min(maxPoint, Math.max(0, targetCgpa || 0));
  const currentPoints = oldCgpa * oldUnits;
  const requiredPoints = target * (oldUnits + units) - currentPoints;
  const requiredGpa = units ? requiredPoints / units : 0;
  const maximumCgpa = oldUnits + units ? (currentPoints + maxPoint * units) / (oldUnits + units) : oldCgpa;
  const achievable = units > 0 && requiredGpa <= maxPoint;
  return { requiredPoints, requiredGpa, maximumCgpa, achievable };
}

function suggestGrades({ courses, requiredPoints, grades }) {
  const passingGrades = [...grades].filter(g => g.point > 0 && g.letter !== 'F').sort((a,b) => a.point-b.point);
  const needed = Math.max(0, Math.ceil(requiredPoints - 1e-9));
  const minimumPass = passingGrades[0];
  let rows = courses.map(c => ({...c, grade: minimumPass.letter, point: minimumPass.point, credit: minimumPass.point*c.units}));
  let points = rows.reduce((s,r)=>s+r.credit,0);
  while(points < needed) {
    let bestIndex=-1, bestNext=-1, bestGain=Infinity;
    rows.forEach((row,index)=>{ const gi=passingGrades.findIndex(g=>g.letter===row.grade); const next=passingGrades[gi+1]; if(!next)return; const gain=(next.point-row.point)*row.units; if(gain>0&&gain<bestGain){bestGain=gain;bestIndex=index;bestNext=gi+1;} });
    if(bestIndex<0) break;
    const current=rows[bestIndex], next=passingGrades[bestNext];
    points+=(next.point-current.point)*current.units;
    rows=rows.map((row,index)=>index===bestIndex?{...row,grade:next.letter,point:next.point,credit:next.point*row.units}:row);
  }
  return { rows, points };
}

const grades5=[{letter:'A',point:5},{letter:'B',point:4},{letter:'C',point:3},{letter:'D',point:2},{letter:'E',point:1},{letter:'F',point:0}];
const grades4=[{letter:'A',point:4},{letter:'B',point:3},{letter:'C',point:2},{letter:'D',point:1},{letter:'F',point:0}];

test('LASU 5.0 target maths: 3.77/62 to 4.00 over 18 units requires 4.7922 GPA', () => {
  const r=targetPlan({currentCgpa:3.77,completedUnits:62,targetCgpa:4,futureUnits:18,maxPoint:5});
  assert.ok(Math.abs(r.requiredGpa-4.7922222222)<1e-9);
  assert.equal(r.achievable,true);
});

test('4.0 scale impossible target is identified', () => {
  const r=targetPlan({currentCgpa:3.2,completedUnits:60,targetCgpa:3.5,futureUnits:18,maxPoint:4});
  assert.equal(r.requiredGpa,4.5);
  assert.equal(r.achievable,false);
  assert.ok(r.maximumCgpa<3.5);
});

test('5.0 impossible target never becomes a valid >5 GPA', () => {
  const r=targetPlan({currentCgpa:3.77,completedUnits:62,targetCgpa:4.5,futureUnits:18,maxPoint:5});
  assert.ok(r.requiredGpa>5);
  assert.equal(r.achievable,false);
  assert.ok(r.maximumCgpa<=5);
});

test('target equal to current CGPA requires same future average', () => {
  const r=targetPlan({currentCgpa:3.77,completedUnits:62,targetCgpa:3.77,futureUnits:18,maxPoint:5});
  assert.ok(Math.abs(r.requiredGpa-3.77)<1e-9);
});

test('zero future units is handled without NaN/Infinity', () => {
  const r=targetPlan({currentCgpa:3.77,completedUnits:62,targetCgpa:4,futureUnits:0,maxPoint:5});
  assert.equal(r.requiredGpa,0);
  assert.equal(Number.isFinite(r.requiredGpa),true);
  assert.equal(r.achievable,false);
});

test('suggested grades never include F on 5.0 scale', () => {
  const courses=[{code:'A',units:3},{code:'B',units:3},{code:'C',units:2},{code:'D',units:2},{code:'E',units:3},{code:'F',units:2},{code:'G',units:3}];
  const plan=targetPlan({currentCgpa:3.77,completedUnits:62,targetCgpa:4,futureUnits:18,maxPoint:5});
  const s=suggestGrades({courses,requiredPoints:plan.requiredPoints,grades:grades5});
  assert.equal(s.rows.some(r=>r.grade==='F'),false);
  assert.ok(s.points>=Math.ceil(plan.requiredPoints-1e-9));
});

test('suggested grades never include F on 4.0 scale', () => {
  const courses=Array.from({length:6},(_,i)=>({code:`C${i+1}`,units:3}));
  const plan=targetPlan({currentCgpa:2.5,completedUnits:60,targetCgpa:2.7,futureUnits:18,maxPoint:4});
  const s=suggestGrades({courses,requiredPoints:plan.requiredPoints,grades:grades4});
  assert.equal(s.rows.some(r=>r.grade==='F'),false);
  assert.ok(s.points>=Math.ceil(plan.requiredPoints-1e-9));
});

test('course-unit weighting uses credit points, not course count', () => {
  const courses=[{code:'ONE',units:1},{code:'THREE',units:3}];
  const s=suggestGrades({courses,requiredPoints:10,grades:grades5});
  assert.equal(s.rows.reduce((sum,r)=>sum+r.credit,0),s.points);
  assert.ok(s.points>=10);
});

test('long Beyond This Session suggestion retains all 30 courses', () => {
  const courses=Array.from({length:30},(_,i)=>({code:`COURSE${i+1}`,units:i%3+1}));
  const totalUnits=courses.reduce((s,c)=>s+c.units,0);
  const plan=targetPlan({currentCgpa:3.5,completedUnits:60,targetCgpa:3.8,futureUnits:totalUnits,maxPoint:5});
  const s=suggestGrades({courses,requiredPoints:plan.requiredPoints,grades:grades5});
  assert.equal(s.rows.length,30);
  assert.equal(s.rows.some(r=>r.grade==='F'),false);
});
