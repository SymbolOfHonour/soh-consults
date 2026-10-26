export const analyticsEvents=["article_view","calculator_use","whatsapp_click","service_view","traffic_source"] as const;
export type AnalyticsEvent=typeof analyticsEvents[number];
export const trafficSources=["direct-or-unknown","google","other-search","social","referral"] as const;
/** Store only a coarse source group; never a referrer URL, query or visitor ID. */
export function trafficSource(referrer:string):typeof trafficSources[number]{if(!referrer)return "direct-or-unknown";try{const host=new URL(referrer).hostname.toLowerCase();if(/(^|\.)google\.(?:com|cat|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/.test(host))return "google";if(/(^|\.)(bing\.com|search\.yahoo\.com|duckduckgo\.com)$/.test(host))return "other-search";if(/(^|\.)(facebook\.com|instagram\.com|t\.co|twitter\.com|x\.com|tiktok\.com|whatsapp\.com|wa\.me|t\.me)$/.test(host))return "social";return "referral"}catch{return "direct-or-unknown"}}
export function analyticsLabel(event:AnalyticsEvent,label:string){if(event==="traffic_source")return trafficSources.includes(label as typeof trafficSources[number])?label:"direct-or-unknown";return /^\/[a-zA-Z0-9/_-]{0,159}$/.test(label)?label:""}
