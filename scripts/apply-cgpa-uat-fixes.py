from pathlib import Path

p=Path('app/cgpa-calculator/planner/page.tsx')
s=p.read_text()

def rep(old,new,name):
    global s
    if old not in s:
        raise SystemExit(f'missing patch target: {name}')
    s=s.replace(old,new,1)

# Hide stale target calculations whenever the student's current record is incomplete/invalid.
rep('  const targetGradeSuggestion = useMemo(() => {', '  const targetRecordValid = currentCgpa.trim() !== "" && Number.isFinite(Number(currentCgpa)) && Number(currentCgpa) >= 0 && Number(currentCgpa) <= maxPoint && Number(ctnup) > 0;\n\n  const targetGradeSuggestion = useMemo(() => {', 'validity flag')
rep('    if (!courses.length || targetSemesterPlan.requiredGpa > maxPoint || targetSemesterPlan.requiredGpa <= 0) return { rows: [], points: 0, gpa: 0 };', '    if (!targetRecordValid || !courses.length || targetSemesterPlan.requiredGpa > maxPoint || targetSemesterPlan.requiredGpa <= 0) return { rows: [], points: 0, gpa: 0 };', 'stale suggestion guard')
rep('  }, [targetCoursesFirst, targetCoursesSecond, targetFutureCourses, targetFuturePeriods, targetPeriod, targetSemesterPlan, activeGrades, maxPoint]);', '  }, [targetCoursesFirst, targetCoursesSecond, targetFutureCourses, targetFuturePeriods, targetPeriod, targetSemesterPlan, targetRecordValid, activeGrades, maxPoint]);', 'suggestion deps')

# Prefer protecting higher-unit courses when several passing combinations can reach the same target.
rep('      let bestIndex=-1, bestNext=-1, bestGain=Infinity;\n      rows.forEach((row,index)=>{ const gi=passingGrades.findIndex((g)=>g.letter===row.grade); const next=passingGrades[gi+1]; if(!next)return; const gain=(next.point-row.point)*row.units; if(gain>0&&gain<bestGain){bestGain=gain;bestIndex=index;bestNext=gi+1;} });', '      let bestIndex=-1, bestNext=-1, bestUnits=-1, bestPoint=Infinity;\n      rows.forEach((row,index)=>{ const gi=passingGrades.findIndex((g)=>g.letter===row.grade); const next=passingGrades[gi+1]; if(!next)return; if(row.units>bestUnits || (row.units===bestUnits && row.point<bestPoint)){bestUnits=row.units;bestPoint=row.point;bestIndex=index;bestNext=gi+1;} });', 'balanced grade allocation')

# Give long reports enough room for guidance and footer, and make decorative footer geometry elastic.
rep('    const reportHeight = Math.max(1754, 1754 + Math.max(0, reportRowCount - 9) * 42);', '    const reportHeight = Math.max(1900, 1900 + Math.max(0, reportRowCount - 9) * 42);', 'report height')
rep('    ctx.beginPath(); ctx.moveTo(0,1575); ctx.lineTo(0,1754); ctx.lineTo(180,1754); ctx.closePath(); ctx.fillStyle="#062f28"; ctx.fill();\n    ctx.beginPath(); ctx.moveTo(0,1630); ctx.lineTo(0,1754); ctx.lineTo(130,1754); ctx.closePath(); ctx.fillStyle=BRIGHT_GREEN; ctx.fill();\n    ctx.beginPath(); ctx.moveTo(48,1685); ctx.lineTo(90,1754); ctx.lineTo(190,1754); ctx.closePath(); ctx.fillStyle=RED; ctx.fill();', '    ctx.beginPath(); ctx.moveTo(0,reportHeight-179); ctx.lineTo(0,reportHeight); ctx.lineTo(180,reportHeight); ctx.closePath(); ctx.fillStyle="#062f28"; ctx.fill();\n    ctx.beginPath(); ctx.moveTo(0,reportHeight-124); ctx.lineTo(0,reportHeight); ctx.lineTo(130,reportHeight); ctx.closePath(); ctx.fillStyle=BRIGHT_GREEN; ctx.fill();\n    ctx.beginPath(); ctx.moveTo(48,reportHeight-69); ctx.lineTo(90,reportHeight); ctx.lineTo(190,reportHeight); ctx.closePath(); ctx.fillStyle=RED; ctx.fill();', 'elastic footer art')

# Correct wording for multi-semester targets.
rep('ctx.fillText(plannerMode === "target" ? "SEMESTER GPA REQUIRED" : "PROJECTED RESULT",100,478);', 'ctx.fillText(plannerMode === "target" ? (targetPeriod === "semester" ? "SEMESTER GPA REQUIRED" : "REQUIRED AVERAGE GPA ACROSS TARGET PERIOD") : "PROJECTED RESULT",100,478);', 'target period heading')

# A combined projection is valid, but must not masquerade as one semester.
rep('      ctx.fillText(`${startStage} ${startTerm}`,90,y+42);', '      const targetPeriodLabel = targetPeriod === "future" ? `${targetFuturePeriods.length} semesters combined` : targetPeriod === "session" ? `${startStage} full session` : `${startStage} ${startTerm}`;\n      ctx.fillText(targetPeriodLabel,90,y+42);', 'combined period label')
rep('`Required GPA ${targetSemesterPlan.requiredGpa.toFixed(2)} | Suggested GPA ${targetGradeSuggestion.gpa.toFixed(2)} | Suggested CP ${targetGradeSuggestion.points.toFixed(1)}`', '`Required Average GPA ${targetSemesterPlan.requiredGpa.toFixed(2)} | Suggested GPA ${targetGradeSuggestion.gpa.toFixed(2)} | Suggested CP ${targetGradeSuggestion.points.toFixed(1)}`', 'summary wording')

# Guidance panel height follows wrapped content; footer is placed after it instead of at fixed coordinates.
old='''    y+=35; ctx.fillStyle="#dcfce7"; ctx.fillRect(70,y,1100,150); ctx.fillStyle=DARK_GREEN; ctx.font="700 21px Arial"; ctx.fillText("TARGET GUIDANCE",100,y+38);\n    ctx.font="400 17px Arial"; const words=targetStatus.split(" "); let line=""; let ly=y+72; for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>1020){ctx.fillText(line,100,ly);line=word+" ";ly+=25;}else line=test;}ctx.fillText(line,100,ly);\n    ctx.strokeStyle=BORDER; ctx.beginPath(); ctx.moveTo(70,1640); ctx.lineTo(1170,1640); ctx.stroke();\n    ctx.fillStyle=DARK; ctx.font="700 17px Arial"; ctx.fillText("S.O.H CONSULTS",70,1680); ctx.font="400 15px Arial"; ctx.fillText("WhatsApp: 0818 214 1088",775,1680); ctx.fillText("Oluyepeadetayo@gmail.com",775,1706);\n    const footerY = Math.max(1720, y + 70); ctx.fillStyle="#64748b"; ctx.font="400 13px Arial"; ctx.fillText("Projection only. Confirm your institution's official grading and retake rules.",70,footerY);'''
new='''    y+=35; ctx.font="400 17px Arial"; const words=targetStatus.split(" "); const guidanceLines:string[]=[]; let line=""; for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>1020){guidanceLines.push(line.trim());line=word+" ";}else line=test;} if(line.trim()) guidanceLines.push(line.trim());\n    const guidanceHeight=Math.max(150,92+guidanceLines.length*25); ctx.fillStyle="#dcfce7"; ctx.fillRect(70,y,1100,guidanceHeight); ctx.fillStyle=DARK_GREEN; ctx.font="700 21px Arial"; ctx.fillText("TARGET GUIDANCE",100,y+38);\n    ctx.font="400 17px Arial"; guidanceLines.forEach((text,index)=>ctx.fillText(text,100,y+72+index*25)); y+=guidanceHeight+45;\n    ctx.strokeStyle=BORDER; ctx.beginPath(); ctx.moveTo(70,y); ctx.lineTo(1170,y); ctx.stroke(); y+=40;\n    ctx.fillStyle=DARK; ctx.font="700 17px Arial"; ctx.fillText("S.O.H CONSULTS",70,y); ctx.font="400 15px Arial"; ctx.fillText("WhatsApp: 0818 214 1088",775,y); ctx.fillText("Oluyepeadetayo@gmail.com",775,y+26);\n    const footerY=y+66; ctx.fillStyle="#64748b"; ctx.font="400 13px Arial"; ctx.fillText("Projection only. Confirm your institution's official grading and retake rules.",70,footerY);'''
rep(old,new,'dynamic guidance/footer')

# Add context to continuation PDF pages so page 2 never starts as an anonymous table fragment.
rep('''      if(pageIndex>0) pdf.addPage();\n      const renderedHeight=pageWidth*(sliceHeight/canvas.width);\n      pdf.addImage(pageCanvas.toDataURL("image/jpeg",0.97),"JPEG",0,0,pageWidth,renderedHeight,undefined,"FAST");''', '''      if(pageIndex>0) pdf.addPage();\n      const renderedHeight=pageWidth*(sliceHeight/canvas.width);\n      const topMargin=pageIndex>0?14:0;\n      if(pageIndex>0){ pdf.setFontSize(9); pdf.setTextColor(6,78,59); pdf.text("S.O.H CONSULTS - Target CGPA Report (continued)",10,7); pdf.setTextColor(15,23,42); pdf.text("Course | Units | Grade | GP | Credit Point",10,11); }\n      pdf.addImage(pageCanvas.toDataURL("image/jpeg",0.97),"JPEG",0,topMargin,pageWidth,Math.min(renderedHeight,pageHeight-topMargin),undefined,"FAST");''', 'pdf continuation context')

p.write_text(s)
print('CGPA UAT fixes applied')
