import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('public',{recursive:true});
await copyFile('node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs','public/pdf.worker.min.mjs');
