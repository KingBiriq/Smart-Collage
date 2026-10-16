'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main style={{maxWidth:480,margin:'12vh auto',padding:25}}><h1>Bogga dib u fur.</h1><p>Cilad ayaa dhacday. Isku day mar kale ama ku noqo preview-ga.</p><button className="btn orange" onClick={reset}>Mar kale isku day</button> <a className="btn outline" href="/preview">Fur preview-ga</a></main>;}
