type CacheEntry<T>={value:T;expires:number};const memory=new Map<string,CacheEntry<unknown>>();const MAX=500;
export function cacheGet<T>(key:string):T|null{const hit=memory.get(key);if(!hit)return null;if(hit.expires<Date.now()){memory.delete(key);return null;}return hit.value as T;}
export function cacheSet<T>(key:string,value:T,ttlSeconds:number){if(memory.size>=MAX){const oldest=memory.keys().next().value;if(oldest)memory.delete(oldest);}memory.set(key,{value,expires:Date.now()+ttlSeconds*1000});}
export function knowledgeCacheKey(institution:string|null,intent:string,session:string|null){return [institution||"general",intent,session||"current"].join(":");}
