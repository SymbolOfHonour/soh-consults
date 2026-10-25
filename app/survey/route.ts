import {surveyHtml} from '../../lib/survey-html';
export const dynamic='force-dynamic';
export function GET(request:Request){const nonce=request.headers.get('x-nonce')||'';const html=/^[A-Za-z0-9+/=]+$/.test(nonce)?surveyHtml.replace('<script>',`<script nonce="${nonce}">`):surveyHtml;return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
