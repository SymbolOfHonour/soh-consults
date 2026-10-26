/** Import time must not make an explicitly dated historical notice appear current. */
export function newsPublicationTime(story:{source_published_at?:string|null;created_at:string}):number {
 const published=Date.parse(story.source_published_at||"");
 if(Number.isFinite(published))return published;
 const created=Date.parse(story.created_at);
 return Number.isFinite(created)?created:0;
}
