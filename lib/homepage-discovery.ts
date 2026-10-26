import {getStorySlug,type QueuedStory} from './news-queue';
import {teamRequest} from './editor-team';
import {resolveInstitution} from './ask-soh/institution-registry';
export type HomePost={id:string;title:string;href:string;image:string|null;category:string;date:string;views:number};
export type BrowseGroup={name:string;count:number;href:string};
export type HomeDiscovery={posts:HomePost[];measured:boolean;universities:BrowseGroup[];categories:BrowseGroup[]};
export async function recentArticleViews(){const counts:Record<string,number>={};if(process.env.VERCEL_ENV==='preview')return counts;try{const since=new Date(Date.now()-30*86400000).toISOString();for(let offset=0;;offset+=1000){const rows=await teamRequest<{summary:string}[]>(`/rest/v1/news_queue?select=summary&source_name=eq.${encodeURIComponent('S.O.H Module:analytics:MEASURED')}&title=eq.article_view&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc,id.desc&limit=1000&offset=${offset}`);for(const row of rows)if(/^\/updates\/[^/]+$/.test(row.summary))counts[row.summary]=(counts[row.summary]||0)+1;if(rows.length<1000)break}}catch{/* Missing readership history must never block the homepage. */}return counts}
export function buildHomeDiscovery(stories:QueuedStory[],views:Record<string,number>):HomeDiscovery{
 const schools=new Map<string,number>(),categories=new Map<string,number>();
 const unique=[...new Map(stories.map(s=>[getStorySlug(s),s])).values()];
 for(const s of unique){const c=s.category.trim();if(c)categories.set(c,(categories.get(c)||0)+1);const raw=s.institution.trim(),known=resolveInstitution(raw);const school=known&&!['jamb','waec','neco','nysc'].includes(known.key)?known.name:raw;if(school&&!/^(nigeria|national|nationwide|general|other|all|n\/a|multiple institutions|indomie)$/i.test(school)&&!/(government|matriculation board|examinations council|jamb|waec|neco|nbte|nysc)/i.test(school))schools.set(school,(schools.get(school)||0)+1)}
 const byNewest=[...unique].sort((a,b)=>Date.parse(b.source_published_at||b.created_at)-Date.parse(a.source_published_at||a.created_at));
 const measured=byNewest.some(s=>(views['/updates/'+getStorySlug(s)]||0)>0);
 const ranked=measured?byNewest.filter(s=>(views['/updates/'+getStorySlug(s)]||0)>0).sort((a,b)=>(views['/updates/'+getStorySlug(b)]||0)-(views['/updates/'+getStorySlug(a)]||0)):byNewest;
 const groups=(map:Map<string,number>)=>[...map].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([name,count])=>({name,count,href:'/search?q='+encodeURIComponent(name)}));
 return {measured,posts:ranked.slice(0,8).map(s=>({id:s.id,title:s.title,href:'/updates/'+getStorySlug(s),image:s.image_url,category:s.category,date:new Date(s.source_published_at||s.created_at).toLocaleDateString('en-GB',{timeZone:'Africa/Lagos',day:'numeric',month:'short'}),views:views['/updates/'+getStorySlug(s)]||0})),universities:groups(schools).slice(0,24),categories:groups(categories)}
}
