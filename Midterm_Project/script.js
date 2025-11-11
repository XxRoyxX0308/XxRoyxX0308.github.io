// Set active nav link based on body id
(function(){
  const id = document.body.id;
  if(!id) return;
  const links = document.querySelectorAll('.nav-item');
  links.forEach(a=>{
    if(a.getAttribute('href').includes(id)) a.classList.add('active');
  });
})();

/* ---------------- Table Styler ---------------- */
const demoTable = document.getElementById('demoTable');
const tds = demoTable.querySelectorAll('td');
const original = {
  width: demoTable ? demoTable.style.width || '400px' : '400px',
  borderSpacing: demoTable ? window.getComputedStyle(demoTable).getPropertyValue('border-spacing') : '5px',
  bg: demoTable ? window.getComputedStyle(demoTable).backgroundColor : ''
};
function setTableWidth(px){ if(!demoTable) return; demoTable.style.width = px + 'px'; }
function setBorderSpacing(px){ if(!demoTable) return; demoTable.style.borderSpacing = px + 'px'; demoTable.style.borderWidth = px/5 + 'px'; demoTable.querySelectorAll('td,th').forEach(c=>{c.style.borderWidth = (px/5)+'px';}); }
function setTableBg(color){
  if(!demoTable) return;
  tds.forEach(td => {
    td.style.backgroundColor = color;
  });
}
function resetTable(){
  if(!demoTable) return;
  demoTable.style.width = original.width;
  demoTable.style.borderSpacing = original.borderSpacing;
  tds.forEach(td => {
    td.style.backgroundColor = original.bg;
  });
  demoTable.querySelectorAll('td,th').forEach(c=>{c.style.borderWidth='1px';}); }

/* Attach to global so inline onclick works */
window.setTableWidth = setTableWidth;
window.setBorderSpacing = setBorderSpacing;
window.setTableBg = setTableBg;
window.resetTable = resetTable;

/* ---------------- Polaroid Switcher ---------------- */
const polaroidImgs = ['imgs/poly1.jpg','imgs/poly2.jpg','imgs/poly3.jpg','imgs/poly4.jpg','imgs/poly5.jpg'];
let currentIndex = 0;
const polaroidImgEl = document.getElementById('polaroidImg');
const polaroidCounter = document.getElementById('polaroidCounter');
function showPolaroid(i){
  if(!polaroidImgEl || !polaroidCounter) return;
  currentIndex = ((i % polaroidImgs.length) + polaroidImgs.length) % polaroidImgs.length;
  polaroidImgEl.src = polaroidImgs[currentIndex];
  polaroidCounter.textContent = `Image ${currentIndex+1} of ${polaroidImgs.length}`;
}
function nextImg(){ showPolaroid(currentIndex+1); }
function prevImg(){ showPolaroid(currentIndex-1); }
window.nextImg = nextImg; window.prevImg = prevImg;
// init
showPolaroid(0);

/* ---------------- Canvas Drawing ---------------- */
function drawDreamCanvas(){
  const c = document.getElementById('dreamCanvas');
  if(!c) return;
  const ctx = c.getContext('2d');

  // gradient background (space-like)
  const g = ctx.createLinearGradient(0,0,c.width, c.height);
  g.addColorStop(0,'#021028');
  g.addColorStop(0.5,'#091834');
  g.addColorStop(1,'#08223a');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,c.width,c.height);

  // shapes: moon, city silhouette, arc planet
  // moon (circle)
  ctx.beginPath();
  ctx.arc(120,80,48,0,Math.PI*2);
  ctx.fillStyle = '#f6f7ea';
  ctx.fill();

  // small city rectangles
  ctx.fillStyle = 'rgba(2,8,18,0.9)';
  for(let i=0;i<12;i++){
    const x = 220 + i*40;
    const h = 40 + (i%3)*30;
    ctx.fillRect(x, c.height-70-h, 30, h);
  }

  // decorative stars
  for(let s=0;s<60;s++){
    const x = Math.random()*c.width;
    const y = Math.random()*c.height*0.6;
    ctx.fillStyle = Math.random()>0.85 ? '#fff' : '#cfe9ff';
    ctx.fillRect(x,y, Math.random()*2+0.5, Math.random()*2+0.5);
  }

  // arc planet
  ctx.beginPath();
  ctx.arc(c.width-140, 50, 60, Math.PI*0.2, Math.PI*0.9);
  ctx.strokeStyle = 'rgba(244,154,194,0.5)';
  ctx.lineWidth = 8;
  ctx.stroke();

  // title text
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('Dream Space — Moonlight City', 20, c.height-20);
}
window.addEventListener('load', drawDreamCanvas);
