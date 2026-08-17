const people = Object.fromEntries(FAMILY_DATA.map(p=>[p.id,p]));
const viewport=document.getElementById("treeViewport");
const canvas=document.getElementById("treeCanvas");
const drawer=document.getElementById("drawer");
const overlay=document.getElementById("overlay");
const profile=document.getElementById("profile");
let scale=1, panX=0, panY=0, dragging=false, sx=0, sy=0, startX=0, startY=0;

function initials(name){return name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function childrenOf(id){return FAMILY_DATA.filter(p=>(p.parentIds||[]).includes(id))}
function parentsOf(id){return (people[id]?.parentIds||[]).map(x=>people[x]).filter(Boolean)}
function spousesOf(id){return (people[id]?.spouseIds||[]).map(x=>people[x]).filter(Boolean)}
function generationMap(){
  const gen={}; const roots=FAMILY_DATA.filter(p=>!(p.parentIds||[]).length);
  const q=roots.map(p=>[p.id,0]);
  while(q.length){const [id,g]=q.shift(); if(gen[id]!=null && gen[id]<=g)continue; gen[id]=g; childrenOf(id).forEach(c=>q.push([c.id,g+1]));}
  FAMILY_DATA.forEach(p=>{if(gen[p.id]==null)gen[p.id]=0});
  return gen;
}
function render(){
  canvas.innerHTML="";
  const gen=generationMap(), groups={};
  FAMILY_DATA.forEach(p=>(groups[gen[p.id]]??=[]).push(p));
  const levels=Object.keys(groups).map(Number).sort((a,b)=>a-b);
  const W=220,H=125;
  const positions={};
  let maxW=0;
  levels.forEach(g=>{
    const arr=groups[g], width=arr.length*W;
    maxW=Math.max(maxW,width);
    arr.forEach((p,i)=>positions[p.id]={x:i*W+30,y:g*H+30});
  });
  const canvasW=Math.max(maxW+60,700), canvasH=(levels.length*H)+80;
  canvas.style.width=canvasW+"px"; canvas.style.height=canvasH+"px";
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.classList.add("tree-svg"); svg.setAttribute("width",canvasW); svg.setAttribute("height",canvasH);
  FAMILY_DATA.forEach(p=>{
    (p.parentIds||[]).forEach(pid=>{
      if(!positions[pid]||!positions[p.id])return;
      const a=positions[pid],b=positions[p.id];
      const x1=a.x+95,y1=a.y+86,x2=b.x+95,y2=b.y;
      const mid=(y1+y2)/2;
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d",`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`);
      path.setAttribute("fill","none"); path.setAttribute("stroke","#aab5bf"); path.setAttribute("stroke-width","2");
      svg.appendChild(path);
    });
  });
  canvas.appendChild(svg);
  FAMILY_DATA.forEach(p=>{
    const n=document.createElement("div"); n.className="tree-node"; n.id="node-"+p.id;
    n.style.left=positions[p.id].x+"px"; n.style.top=positions[p.id].y+"px";
    n.innerHTML=`<div class="person"><div class="avatar">${p.photo?`<img class="avatar" src="${p.photo}" alt="">`:initials(p.name)}</div><div><strong>${p.name}</strong><small>${p.birth||""}${p.death?" — "+p.death:""}</small></div></div>`;
    n.onclick=()=>openProfile(p.id); canvas.appendChild(n);
  });
  document.getElementById("memberCount").textContent=FAMILY_DATA.length;
  document.getElementById("generationCount").textContent=levels.length;
  fit();
}
function applyTransform(){canvas.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`}
function fit(){
  const rect=viewport.getBoundingClientRect();
  const cw=canvas.offsetWidth,ch=canvas.offsetHeight;
  scale=Math.min((rect.width-40)/cw,(rect.height-40)/ch,1);
  panX=(rect.width-cw*scale)/2; panY=(rect.height-ch*scale)/2; applyTransform();
}
function openProfile(id){
  const p=people[id]; if(!p)return;
  const parents=parentsOf(id), spouses=spousesOf(id), children=childrenOf(id);
  profile.innerHTML=`
    <div class="profile-head">
      ${p.photo?`<img class="profile-photo" src="${p.photo}" alt="">`:`<div class="profile-photo" style="display:grid;place-items:center;font-size:30px;font-weight:800;color:#2c7040">${initials(p.name)}</div>`}
      <h2>${p.name}</h2><p>${p.gender==="M"?"Laki-laki":"Perempuan"} • ${p.birth||"Tahun lahir tidak tersedia"}${p.death?" • Wafat "+p.death:""}</p>
    </div>
    <div class="profile-section"><h3>Informasi</h3><p>${p.city?`Tempat/kota: <b>${p.city}</b><br>`:""}${p.bio||""}</p></div>
    ${parents.length?relationBlock("Orang tua",parents):""}
    ${spouses.length?relationBlock("Pasangan",spouses):""}
    ${children.length?relationBlock("Anak",children):""}`;
  drawer.classList.add("open"); overlay.classList.add("open"); drawer.setAttribute("aria-hidden","false");
  profile.querySelectorAll("[data-person]").forEach(b=>b.onclick=()=>openProfile(b.dataset.person));
}
function relationBlock(title,arr){return `<div class="profile-section"><h3>${title}</h3><div class="relation-list">${arr.map(x=>`<button class="relation" data-person="${x.id}">${x.name}</button>`).join("")}</div></div>`}
function closeProfile(){drawer.classList.remove("open");overlay.classList.remove("open");drawer.setAttribute("aria-hidden","true")}
document.getElementById("closeDrawer").onclick=closeProfile; overlay.onclick=closeProfile;
document.getElementById("zoomIn").onclick=()=>{scale=Math.min(scale*1.2,2.5);applyTransform()};
document.getElementById("zoomOut").onclick=()=>{scale=Math.max(scale/1.2,.25);applyTransform()};
document.getElementById("fitBtn").onclick=fit; document.getElementById("resetBtn").onclick=fit;
document.getElementById("fullscreenBtn").onclick=()=>viewport.requestFullscreen?.();
document.getElementById("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.theme=document.body.classList.contains("dark")?"dark":"light"};
if(localStorage.theme==="dark")document.body.classList.add("dark");

viewport.addEventListener("pointerdown",e=>{if(e.target.closest(".tree-node"))return;dragging=true;viewport.classList.add("dragging");sx=e.clientX;sy=e.clientY;startX=panX;startY=panY;viewport.setPointerCapture(e.pointerId)});
viewport.addEventListener("pointermove",e=>{if(!dragging)return;panX=startX+e.clientX-sx;panY=startY+e.clientY-sy;applyTransform()});
viewport.addEventListener("pointerup",()=>{dragging=false;viewport.classList.remove("dragging")});
viewport.addEventListener("wheel",e=>{e.preventDefault();scale=Math.max(.25,Math.min(2.5,scale*(e.deltaY<0?1.1:.9)));applyTransform()},{passive:false});

const searchInput=document.getElementById("searchInput"), results=document.getElementById("searchResults");
searchInput.addEventListener("input",()=>{
  const q=searchInput.value.trim().toLowerCase(); results.innerHTML=""; if(!q)return;
  FAMILY_DATA.filter(p=>p.name.toLowerCase().includes(q)).slice(0,8).forEach(p=>{
    const d=document.createElement("div");d.className="result";d.textContent=p.name;d.onclick=()=>{openProfile(p.id);results.innerHTML="";searchInput.value=p.name;document.querySelectorAll(".tree-node").forEach(n=>n.classList.remove("highlight"));document.getElementById("node-"+p.id)?.classList.add("highlight")};results.appendChild(d);
  });
});
document.getElementById("searchBtn").onclick=()=>{searchInput.focus();window.scrollTo({top:0,behavior:"smooth"})};
render(); window.addEventListener("resize",fit);
