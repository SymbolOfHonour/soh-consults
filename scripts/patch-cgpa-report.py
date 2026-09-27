from pathlib import Path

p = Path("app/cgpa-calculator/planner/page.tsx")
s = p.read_text()

replacements = [
    (
        'canvas.width = 1240; canvas.height = 1754;',
        'const reportRowCount = plannerMode === "target" ? targetGradeSuggestion.rows.length : 0;\n    const reportHeight = Math.max(1754, 1754 + Math.max(0, reportRowCount - 9) * 42);\n    canvas.width = 1240; canvas.height = reportHeight;'
    ),
    (
        'ctx.fillStyle=WHITE; ctx.fillRect(0,0,1240,1754);',
        'ctx.fillStyle=WHITE; ctx.fillRect(0,0,1240,reportHeight);'
    ),
    (
        'targetGradeSuggestion.rows.slice(0,9).forEach((row,index)=>',
        'targetGradeSuggestion.rows.forEach((row,index)=>'
    ),
    (
        'ctx.fillStyle="#64748b"; ctx.font="400 13px Arial"; ctx.fillText("Projection only. Confirm your institution\'s official grading and retake rules.",70,1720);',
        'const footerY = Math.max(1720, y + 70); ctx.fillStyle="#64748b"; ctx.font="400 13px Arial"; ctx.fillText("Projection only. Confirm your institution\'s official grading and retake rules.",70,footerY);'
    ),
]

for old, new in replacements:
    if old not in s:
        raise SystemExit(f"Missing patch anchor: {old[:80]}")
    s = s.replace(old, new, 1)

old_pdf = '''const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true});
    pdf.addImage(canvas.toDataURL("image/jpeg",0.97),"JPEG",0,0,210,297,undefined,"FAST"); pdf.save(`${reportName()}pdf`);'''
new_pdf = '''const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true});
    const pageWidth=210, pageHeight=297, pagePixelHeight=Math.floor(canvas.width*(pageHeight/pageWidth));
    let offsetY=0, pageIndex=0;
    while(offsetY<canvas.height){
      const sliceHeight=Math.min(pagePixelHeight,canvas.height-offsetY);
      const pageCanvas=document.createElement("canvas"); pageCanvas.width=canvas.width; pageCanvas.height=sliceHeight;
      const pageCtx=pageCanvas.getContext("2d"); if(!pageCtx) throw new Error("Unable to create PDF page.");
      pageCtx.drawImage(canvas,0,offsetY,canvas.width,sliceHeight,0,0,canvas.width,sliceHeight);
      if(pageIndex>0) pdf.addPage();
      const renderedHeight=pageWidth*(sliceHeight/canvas.width);
      pdf.addImage(pageCanvas.toDataURL("image/jpeg",0.97),"JPEG",0,0,pageWidth,renderedHeight,undefined,"FAST");
      offsetY+=sliceHeight; pageIndex++;
    }
    pdf.save(`${reportName()}pdf`);'''
if old_pdf not in s:
    raise SystemExit("Missing PDF export anchor")
s = s.replace(old_pdf, new_pdf, 1)
p.write_text(s)
