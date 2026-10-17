import 'server-only';
import {cookies} from 'next/headers';
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export const configured=()=>Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY);
export async function supabase(path:string,init:RequestInit={},token?:string){
 if(!configured())throw new ApiError(503,'Supabase weli lama xirin.');
 const res=await fetch(`${process.env.SUPABASE_URL}${path}`,{...init,cache:'no-store',headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY!,...(token?{Authorization:`Bearer ${token}`} : {}),...init.headers},signal:AbortSignal.timeout(20000)});
 if(!res.ok)throw new ApiError(res.status===401?401:502,'Supabase codsiga ma aqbalin. Hubi xiriirka iyo rukhsadda.');
 return res.status===204?null:res.json();
}
export async function member(){
 const token=(await cookies()).get('sc-access')?.value;
 if(!token)throw new ApiError(401,'Marka hore gal akoonka maamulka.');
 const user=await supabase('/auth/v1/user',{},token);
 return {token,user};
}
export async function admin(){
 const {token,user}=await member();
 const rows=await supabase(`/rest/v1/sc_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`,{},token);
 if(!rows.length)throw new ApiError(403,'Akoonkan ma laha rukhsadda maamulka.');
 return {token,user};
}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');let valid=false;try{valid=Boolean(origin&&new URL(origin).host===req.headers.get('host')&&['https:','http:'].includes(new URL(origin).protocol));}catch{}if(!valid)throw new ApiError(403,'Codsigan lama oggola.');}
export async function body(req:Request,max=1_000_000){const raw=await req.text();if(Buffer.byteLength(raw)>max)throw new ApiError(413,'Xogtu way ka weyn tahay xadka.');try{return JSON.parse(raw);}catch{throw new ApiError(400,'Xogta ma aha JSON sax ah.');}}
export function fail(e:unknown){return Response.json({error:e instanceof ApiError?e.message:'Codsigu ma dhammaan. Fadlan mar kale isku day.'},{status:e instanceof ApiError?e.status:500,headers:{'Cache-Control':'no-store'}});}
export function json(value:unknown){return Response.json(value,{headers:{'Cache-Control':'no-store'}});}
