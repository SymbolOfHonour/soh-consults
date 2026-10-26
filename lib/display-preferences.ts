export const displayKey='soh-display-v1';
export type DisplayPreferences={theme:'light'|'dark'|'system';text:'normal'|'large';density:'compact'|'comfortable'};
export const defaultDisplay:DisplayPreferences={theme:'system',text:'normal',density:'compact'};
export const defaultDisplayJson=JSON.stringify(defaultDisplay);
export function parseDisplay(raw:string|null):DisplayPreferences{try{const v=JSON.parse(raw||'{}');return {theme:['light','dark','system'].includes(v?.theme)?v.theme:'system',text:v?.text==='large'?'large':'normal',density:v?.density==='comfortable'?'comfortable':'compact'}}catch{return {...defaultDisplay}}}
export const displayBootstrap=`(()=>{try{const r=document.documentElement;if(r.dataset.sohPrivate==='true')return;const p=JSON.parse(localStorage.getItem('soh-display-v1')||'{}');const t=['light','dark','system'].includes(p.theme)?p.theme:'system';r.dataset.sohTheme=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;r.dataset.sohText=p.text==='large'?'large':'normal';r.dataset.sohDensity=p.density==='comfortable'?'comfortable':'compact'}catch{}})();`;
