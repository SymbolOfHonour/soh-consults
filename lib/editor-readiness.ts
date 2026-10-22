import {hasArticleNarrative,type ArticleBlock} from './article-blocks';
export function editorReadiness(article:{title:string;institution?:string;image_url?:string|null;official_source_url?:string|null;summary?:string},blocks:ArticleBlock[]){
 return [
  {label:'Headline',ready:Boolean(article.title.trim()),required:true},
  {label:'Readable article content',ready:hasArticleNarrative(blocks),required:true},
  {label:'School / institution',ready:Boolean(article.institution?.trim()&&article.institution!=='To be confirmed'),required:false},
  {label:'Featured picture',ready:Boolean(article.image_url),required:false},
  {label:'Official source link',ready:Boolean(article.official_source_url),required:false},
 ];
}
