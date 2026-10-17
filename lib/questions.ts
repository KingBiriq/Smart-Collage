export type Question={q:string;options:string[];answer:number;explanation:string};
export type Quiz={id:string;name:string;classId:string;subject:string;questions:Question[]};
export function validateQuestions(value:unknown):Question[]{
 if(!Array.isArray(value)||!value.length||value.length>200)throw new Error('Geli 1 ilaa 200 su’aalood.');
 return value.map((v,i)=>{if(!v||typeof v.q!=='string'||!v.q.trim()||v.q.length>3000||!Array.isArray(v.options)||v.options.length!==4||v.options.some((x:unknown)=>typeof x!=='string'||!x.trim()||x.length>1500)||!Number.isInteger(v.answer)||v.answer<0||v.answer>3)throw new Error(`Su’aasha ${i+1}: geli qoraalka, afar doorasho iyo jawaabta saxda ah.`);return {q:v.q.trim(),options:v.options.map((x:string)=>x.trim()),answer:v.answer,explanation:String(v.explanation||'').slice(0,3000)};});
}
export function parseQuestions(text:string):Question[]{
 if(text.trim().startsWith('['))return validateQuestions(JSON.parse(text));
 const blocks=text.trim().split(/\n\s*(?=\d+[.)]\s)/).filter(Boolean);
 return validateQuestions(blocks.map(block=>{const lines=block.trim().split('\n').map(x=>x.trim()).filter(Boolean);const q=lines.shift()?.replace(/^\d+[.)]\s*/, '')||'';const options=['A','B','C','D'].map(letter=>lines.find(l=>new RegExp(`^${letter}[.)]\\s*`,'i').test(l))?.replace(/^[A-D][.)]\s*/i,'')||'');const answerLine=lines.find(l=>/^(answer|jawaab|jawaabta)\s*:/i.test(l))||'';const letter=answerLine.split(':')[1]?.trim().toUpperCase();return {q,options,answer:['A','B','C','D'].indexOf(letter||''),explanation:lines.find(l=>/^(explanation|sharaxaad):/i.test(l))?.split(':').slice(1).join(':').trim()||''};}));
}
export const questionTemplate='1. Waa imisa 2 + 2?\nA. 2\nB. 3\nC. 4\nD. 5\nAnswer: C\nSharaxaad: Laba iyo laba waa afar.\n\n2. Waa imisa 3 × 3?\nA. 6\nB. 9\nC. 12\nD. 15\nAnswer: B';
