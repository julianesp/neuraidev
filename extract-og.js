const html = require('fs').readFileSync(0, 'utf-8');
const metaRegex = /"property":"(og:[^"]+)","content":"([^"]+)"/g;
let match;
const metas = {};
while ((match = metaRegex.exec(html)) !== null) {
  metas[match[1]] = match[2];
}
console.log('Meta tags Open Graph encontrados:');
console.log(JSON.stringify(metas, null, 2));
