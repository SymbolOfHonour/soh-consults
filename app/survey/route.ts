import {surveyHtml} from '../../lib/survey-html';
export function GET(){return new Response(surveyHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
