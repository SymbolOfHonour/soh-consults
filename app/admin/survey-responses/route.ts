import {isAdmin} from '../../../lib/admin-auth';
import {dashboardHtml} from '../../../lib/survey-dashboard-html';
import {surveyHeaders} from '../../../lib/survey-storage';
export async function GET(request:Request){if(!await isAdmin())return Response.redirect(new URL('/admin/updates',request.url),307);return new Response(dashboardHtml,{headers:{...surveyHeaders,'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, nofollow'}})}
