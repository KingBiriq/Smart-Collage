import {createHash} from 'node:crypto';
import {ApiError,body,configured,fail,json,member,sameOrigin,supabase} from '@/lib/backend';
import type {Content} from '@/components/school-content';
export async function POST(req:Request){try{
 sameOrigin(req);
 if(!configured())throw new ApiError(503,'Adeegga casharrada weli lama hawlgelin.');
 const {token,user}=await member();
 const {lessonId}=await body(req,1000);
 const rows=await supabase('/rest/v1/sc_content?id=eq.school&select=payload',{},token);
 const content=rows[0]?.payload as Content|undefined;
 const lesson=content?.lessons.find(l=>l.id===lessonId);
 if(!lesson?.videoId)throw new ApiError(404,'Casharkan wali video laguma darin.');
 const [admins,access]=await Promise.all([supabase(`/rest/v1/sc_admins?user_id=eq.${user.id}&select=user_id`,{},token),supabase(`/rest/v1/sc_enrollments?user_id=eq.${user.id}&class_id=eq.${encodeURIComponent(lesson.classId)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=class_id`,{},token)]);
 if(!admins.length&&!access.length)throw new ApiError(403,'Fasalkan kuma jiro fasallada akoonkaaga ama muddadiisu way dhammaatay. La xiriir maamulka.');
 const video=content?.videos.find(v=>v.id===lesson.videoId);
 if(!video||! /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(video.reference))throw new ApiError(404,'Video-ga casharka lama helin.');
 const library=process.env.BUNNY_STREAM_LIBRARY_ID,key=process.env.BUNNY_STREAM_TOKEN_AUTH_KEY;
 if(!library||!key)throw new ApiError(503,'Bunny playback weli lama xirin.');
 const expires=Math.floor(Date.now()/1000)+900;
 const signature=createHash('sha256').update(`${key}${video.reference}${expires}`).digest('hex');
 const query=new URLSearchParams({token:signature,expires:String(expires),autoplay:'false',rememberPosition:'true'});
 return json({src:`https://player.mediadelivery.net/embed/${library}/${video.reference}?${query}`,expires,watermark:`SC · ${user.id.slice(0,8)}`});
 }catch(e){return fail(e);}}
