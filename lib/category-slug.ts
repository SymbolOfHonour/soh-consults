/** Keep category links, sitemap entries and route matching consistent. */
export function categorySlug(value:string) {
 return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
