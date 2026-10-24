import {mkdir,writeFile} from 'node:fs/promises';
import {photos} from '../src/photos.js';
await mkdir('public/food',{recursive:true});
await Promise.all(Object.values(photos).map(async photo=>{
  const response=await fetch(photo.url);
  if(!response.ok) throw new Error(`${photo.file}: ${response.status}`);
  const data=Buffer.from(await response.arrayBuffer());
  if(!response.headers.get('content-type')?.startsWith('image/'))throw new Error('Invalid image response');
  await writeFile(`public${photo.file}`,data);
  console.log(`${photo.file}: ${data.length} bytes`);
}));
