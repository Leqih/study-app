import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../vendor/three/RoundedBoxGeometry.js';
import { atmosphere } from './atmosphere.js?v=detail-v3';
import { buildFurniture } from './furniture.js?v=detail-v3';
import { OrbitControls } from '../../vendor/three/OrbitControls.js';
const host=document.querySelector('#viewport');
let renderNeeded=true;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){const el=document.querySelector('#error');el.hidden=false;el.textContent='This room needs WebGL. Please open it in a browser with hardware acceleration enabled.';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,100),controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.minZoom=.65;controls.maxZoom=2.8;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.25;controls.enablePan=false;controls.target.set(0,.7,0);
function view(){camera.position.set(9,8,11);camera.zoom=1;camera.updateProjectionMatrix();controls.target.set(0,.7,0);controls.update()}view();
const ambient=new THREE.HemisphereLight(0xd9f9ff,0xa5a7cf,1.65);scene.add(ambient);const sun=new THREE.DirectionalLight(0xfff0d8,2.0);sun.position.set(2,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun);
const rim=new THREE.DirectionalLight(0x78e7ff,1.35);rim.position.set(-4,5,-3);scene.add(rim);renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const ramp=new THREE.DataTexture(new Uint8Array([155,210,250]),3,1,THREE.RedFormat);ramp.minFilter=THREE.NearestFilter;ramp.magFilter=THREE.NearestFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;
const mat=(c)=>new THREE.MeshToonMaterial({color:c,gradientMap:ramp});const materials={wall:mat('#ffedce'),wood:mat('#c78e62'),floor:mat('#d9ac7c'),sofa:mat('#b6c476'),cushion:mat('#faf4d9'),rug:mat('#f2c69c'),white:mat('#fff9e9'),green:mat('#76916b'),dark:mat('#5c7259'),metal:mat('#ae956c'),glass:mat('#a6cad0')};
const silhouetteMaterial=new THREE.MeshBasicMaterial({color:0x9d8c83,side:THREE.BackSide});
function silhouette(mesh){const edge=new THREE.Mesh(mesh.geometry,silhouetteMaterial);edge.scale.setScalar(1.012);mesh.add(edge);}
const ink=new THREE.LineBasicMaterial({color:0x906548,transparent:true,opacity:.19});
function box(g,w,h,d,x,y,z,m){const radius=Math.min(w,h,d,.18)*.22;const geom=new RoundedBoxGeometry(w,h,d,2,radius);const o=new THREE.Mesh(geom,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w-.02,h-.02,d-.02)),ink);o.add(edges);return o}
function ball(g,r,x,y,z,m,scale=[1,1,1]){const o=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),m);o.position.set(x,y,z);o.scale.set(...scale);silhouette(o);o.castShadow=true;g.add(o);return o}
function cyl(g,rt,rb,h,x,y,z,m){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,40),m);o.position.set(x,y,z);silhouette(o);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
const shell=new THREE.Group();scene.add(shell);box(shell,6,.2,5,0,-.13,0,materials.floor);box(shell,6,3,.14,0,1.4,-2.5,materials.wall);box(shell,.14,3,5,-3,1.4,0,materials.wall);
// Individual boards, baseboards and a recessed window create an actual 3D diorama.
for(let row=0;row<10;row++){const z=-2.25+row*.5;for(let col=0;col<4;col++){const x=-2.25+col*1.5;const tile=box(shell,1.48,.035,.48,x,-.01,z,mat(row%2?'#e4bb8c':'#eac59b'));}}
box(shell,6,.14,.08,0,.05,-2.39,materials.white);box(shell,.08,.14,5,-2.89,.05,0,materials.white);
box(shell,1.8,1.5,.09,.65,1.95,-2.38,materials.glass);
for(const x of [-.3,.65,1.6])box(shell,.07,1.65,.14,x,1.95,-2.29,materials.white);
for(const y of [1.15,1.95,2.75])box(shell,2,.07,.14,.65,y,-2.29,materials.white);
box(shell,2.15,.1,.3,.65,1.12,-2.25,materials.wood);
const rug=cyl(shell,1.45,1.45,.025,.25,.005,.5,materials.rug);rug.scale.z=.72;
box(shell,.09,.8,.65,-2.89,1.9,-.5,materials.wood);box(shell,.11,.65,.5,-2.83,1.9,-.5,materials.white);ball(shell,.19,-2.75,1.94,-.5,materials.sofa,[.08,1,1]);
const pieces=[];function piece(id,name,x,z,make){const g=new THREE.Group();g.position.set(x,0,z);g.userData.id=id;scene.add(g);make(g);pieces.push({id,name,g,home:[x,z]});}
const coral=mat('#e9a18c'),pink=mat('#f3c7b2'),gold=mat('#d5b571');
// Framed walls and soft curtains keep the miniature readable from the isometric view.
box(shell,6.14,.13,.22,0,2.94,-2.5,materials.wood);box(shell,.22,.13,5.1,-3,2.94,0,materials.wood);
box(shell,.16,3.05,.16,3,1.44,-2.5,materials.wood);box(shell,.16,3.05,.16,-3,1.44,2.5,materials.wood);
box(shell,2.55,.09,.09,.65,2.83,-2.08,materials.wood);
for(const x of [-.57,1.87]){
 const geom=new THREE.PlaneGeometry(.35,1.76,24,20),positions=geom.attributes.position;
 for(let i=0;i<positions.count;i++){const u=positions.getX(i),y=positions.getY(i);positions.setZ(i,Math.cos(u*75)*.032+.03*Math.sin(y*3));positions.setX(i,u*(.78+.22*Math.abs(y)/.88));}geom.computeVertexNormals();coral.side=THREE.DoubleSide;
 const curtain=new THREE.Mesh(geom,coral);curtain.position.set(x+.08,1.93,-2.05);curtain.castShadow=true;shell.add(curtain);
 ball(shell,.07,x,2.83,-2.08,materials.wood);box(shell,.3,.05,.08,x+.08,1.62,-1.995,gold);
 for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.035,.008,6,12),gold);ring.rotation.y=Math.PI/2;ring.position.set(x-.055+i*.065,2.8,-2.08);shell.add(ring);}
}
// Decorative shelves, books, mirror and a little wall clock.
box(shell,.62,.1,1.25,-2.66,2.18,-1.65,materials.wood);
for(let i=0;i<3;i++)box(shell,.27,.42,.12,-2.62,2.43,-2+i*.16,[coral,materials.sofa,materials.white][i]);
const clock=cyl(shell,.23,.23,.08,-2.85,2.62,-1.56,materials.white);clock.rotation.z=Math.PI/2;
box(shell,.1,.15,.018,-2.78,2.67,-1.56,materials.wood);box(shell,.1,.018,.1,-2.78,2.6,-1.52,materials.wood);
box(shell,.08,1.3,.7,-2.88,1.55,.4,materials.wood);box(shell,.1,1.15,.56,-2.82,1.55,.4,materials.glass);
for(let i=0;i<7;i++)ball(shell,.11,-2.43,2.15-i*.13,-1.3+Math.sin(i)*.08,materials.green,[.6,1,.9]);
buildFurniture({piece,box,ball,cyl,mat,materials,shell,gold,coral,pink});
let selected=pieces[0],theme='matcha';const key='pocket-room-cozy-v2';
function persist(){try{localStorage.setItem(key,JSON.stringify({theme,pieces:pieces.map(p=>({id:p.id,x:p.g.position.x,z:p.g.position.z,r:p.g.rotation.y,visible:p.g.visible}))}));document.querySelector('#status').textContent='Room saved on this device.'}catch{document.querySelector('#status').textContent='Storage unavailable; changes last this session.'}}
const themes={matcha:['#b6c476','#f2c69c','#ffedce'],sky:['#8ca7f4','#d6dfc0','#e7e9e0'],rose:['#d9a5b7','#d7dcb8','#eee3df']};function palette(t){renderNeeded=true;theme=t;[materials.sofa,materials.rug,materials.wall].forEach((m,i)=>m.color.set(themes[t][i]));document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===t))}
try{const data=JSON.parse(localStorage.getItem(key));if(data){if(themes[data.theme])palette(data.theme);for(const saved of data.pieces||[]){const p=pieces.find(p=>p.id===saved.id);if(p&&[saved.x,saved.z,saved.r].every(Number.isFinite)){p.g.position.x=THREE.MathUtils.clamp(saved.x,-2.3,2.3);p.g.position.z=THREE.MathUtils.clamp(saved.z,-1.9,1.9);p.g.rotation.y=saved.r;p.g.visible=saved.visible!==false}}}}catch{}
const detailDescriptions={bed:'Draped quilt · stitched pillows · woven throw · turned oak legs',table:'Glazed cup with handle · coffee swirl · bound book · pastry plate',plant:'Split leaves and veins · curved stems · ribbed ceramic planter',nightstand:'Pleated linen shade · brass pull handles · turned lamp base',dresser:'Inset drawer panels · brass ring pulls · books and flower vase',stool:'Piped edges · button tufts · hand-tied tassels'};
const atmosphereGroup=atmosphere(scene);
const thumbnails=[
'<path d="M6 27V9h29v18M6 12h29M9 24h24v-9H9z" fill="#d6ac72"/><path d="M10 16h22v8H10z" fill="#b6c476"/><rect x="11" y="13" width="9" height="5" rx="2" fill="#fff7df"/><rect x="22" y="13" width="9" height="5" rx="2" fill="#fff7df"/>',
'<path d="M10 20v9m22-9v9"/><ellipse cx="21" cy="18" rx="17" ry="7" fill="#c58b60"/><rect x="19" y="13" width="9" height="5" rx="1" fill="#f5dda7"/>',
'<path d="M15 22l2 8h10l2-8" fill="#8bb7a1"/><path d="M22 24V9"/><ellipse cx="16" cy="13" rx="5" ry="8" fill="#afbd77" transform="rotate(-30 16 13)"/><ellipse cx="27" cy="11" rx="5" ry="8" fill="#baca7e" transform="rotate(30 27 11)"/>',
'<rect x="8" y="18" width="27" height="12" rx="2" fill="#fff2ce"/><path d="M8 24h27m-15-4v2m0 4v2M21 18V9"/><path d="M15 10l3-8h7l3 8z" fill="#fff4dd"/>',
'<rect x="6" y="9" width="30" height="21" rx="3" fill="#fff2ce"/><path d="M6 16h30M6 23h30M20 9v21"/><path d="M11 12h3m12 0h3m-18 7h3m12 0h3m-18 7h3m12 0h3"/><rect x="4" y="5" width="34" height="5" rx="2" fill="#d8a572"/>',
'<rect x="9" y="13" width="26" height="15" rx="5" fill="#ebc887"/><rect x="9" y="10" width="26" height="12" rx="5" fill="#f6dda6"/><path d="M20 14l4 4m-4 0l4-4"/>'
];
const outline=new THREE.BoxHelper(selected.g,0xb18c61);outline.material.depthTest=false;outline.material.transparent=true;outline.material.opacity=.25;outline.renderOrder=2;scene.add(outline);
function ui(){renderNeeded=true;renderer.shadowMap.needsUpdate=true;document.querySelector('#selection').textContent=selected.name;document.querySelector('#piece-details').textContent=detailDescriptions[selected.id];document.querySelector('#toggle').textContent=selected.g.visible?'Put away':'Place in room';document.querySelector('#collection').innerHTML=pieces.map((p,i)=>`<button data-piece="${p.id}" class="${p===selected?'active':''} ${p.g.visible?'':'stored'}" aria-pressed="${p===selected}"><svg width="42" height="32" viewBox="0 0 42 32" aria-hidden="true"><g stroke="#a57a55" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${thumbnails[i]}</g></svg>${p.name}</button>`).join('');outline.visible=selected.g.visible;outline.setFromObject(selected.g)}ui();outline.visible=false;
document.querySelector('#collection').onclick=e=>{const b=e.target.closest('[data-piece]');if(b){selected=pieces.find(p=>p.id===b.dataset.piece);ui()}};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{palette(b.dataset.theme);persist()});
document.querySelector('#rotate').onclick=()=>{selected.g.rotation.y+=Math.PI/2;ui();persist()};document.querySelector('#toggle').onclick=()=>{selected.g.visible=!selected.g.visible;ui();persist()};
document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [x,z]=b.dataset.move.split(',').map(Number);selected.g.position.x=THREE.MathUtils.clamp(selected.g.position.x+x,-2.3,2.3);selected.g.position.z=THREE.MathUtils.clamp(selected.g.position.z+z,-1.9,1.9);ui();persist()});
document.querySelector('#camera').onclick=view;
document.querySelector('#inspect').onclick=()=>{const bounds=new THREE.Box3().setFromObject(selected.g),target=bounds.getCenter(new THREE.Vector3());const direction=camera.position.clone().sub(controls.target).normalize().multiplyScalar(13);controls.target.copy(target);camera.position.copy(target).add(direction);camera.zoom=2.5;camera.updateProjectionMatrix();controls.update();};
let dream=true;
document.querySelector('#lighting').onclick=()=>{dream=!dream;document.body.dataset.lighting=dream?'dream':'day';ambient.color.set(dream?0xd9f9ff:0xfff3dc);rim.intensity=dream?1.35:.4;atmosphereGroup.visible=dream;document.querySelector('#lighting').textContent=dream?'☀ Daylight':'✧ Dream light';renderer.shadowMap.needsUpdate=true;};document.querySelector('#reset').onclick=()=>{if(!confirm('Reset your room layout and palette?'))return;pieces.forEach(p=>{p.g.position.set(p.home[0],0,p.home[1]);p.g.rotation.y=0;p.g.visible=true});palette('matcha');view();ui();persist()};
const ray=new THREE.Raycaster();let down;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(pieces.filter(p=>p.g.visible).map(p=>p.g),true)[0];if(hit){let g=hit.object;while(g&&!g.userData.id)g=g.parent;selected=pieces.find(p=>p.id===g?.userData.id)||selected;ui()}});
new ResizeObserver(()=>{renderNeeded=true;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}).observe(host);
controls.addEventListener('change',()=>{renderNeeded=true});
renderer.setAnimationLoop(()=>{if(document.hidden)return;controls.update();if(!renderNeeded&&!renderer.shadowMap.needsUpdate)return;renderNeeded=false;renderer.render(scene,camera)});
// Savings remains the main loop; room editing is an earned, permanent reward.
const accountKey='pocket-room-v1';
const seed={jars:[{name:'Summer Trip',icon:'✈',balance:340,goal:600},{name:'Emergency Fund',icon:'♡',balance:180,goal:1000},{name:'New Laptop',icon:'▣',balance:260,goal:1200}],week:45,earned:780,items:['plant','lamp','cat'],placed:['plant','lamp','cat'],theme:'',history:[]};
let account;try{account=JSON.parse(localStorage.getItem(accountKey))}catch{}if(!account?.jars?.length)account=structuredClone(seed);
let earnedMilestones;try{earnedMilestones=JSON.parse(localStorage.getItem('pocket-room-travel-rewards'))}catch{}earnedMilestones=earnedMilestones||[true,true,false];
const cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const safe=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function savingsUI(){const trip=account.jars[0];document.querySelector('#balance').textContent=cash(account.jars.reduce((a,j)=>a+j.balance,0));document.querySelector('#weekly').textContent=`↗ ${cash(account.week)} saved this week`;document.querySelector('#weekly-number').textContent=`${cash(account.week)} / $50`;document.querySelector('#goal-fill').style.width=Math.min(100,account.week*2)+'%';document.querySelector('#goal-copy').textContent=account.week>=50?'Your weekly goal is complete. Lovely work!':`Just ${cash(50-account.week)} to a little celebration.`;document.querySelector('#trip-value').textContent=`${cash(trip.balance)} / ${cash(trip.goal)}`;document.querySelectorAll('.milestones>span').forEach((el,i)=>{el.classList.toggle('done',earnedMilestones[i]);el.firstChild.textContent=earnedMilestones[i]?'✓':'♧'})}
const dialog=document.querySelector('#savings-dialog');function modal(content){dialog.innerHTML=`<div class="row"><h2>Pocket Room ✿</h2><button id="close-dialog" aria-label="Close">×</button></div>${content}`;dialog.querySelector('#close-dialog').onclick=()=>dialog.close();dialog.showModal()}
function transaction(withdraw=false){modal(`<h3>${withdraw?'Withdraw money':'A little saved, a little closer'}</h3><p>Concept UI · This is a fictional transaction. ${withdraw?'Your collected furniture stays yours.':''}</p><form id="money-form"><label>Saving jar<select name="jar">${account.jars.map((j,i)=>`<option value="${i}">${safe(j.name)} · ${cash(j.balance)}</option>`).join('')}</select></label><label>Amount ($)<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="5.00"></label><p id="txn-error" role="alert"></p><button>${withdraw?'Confirm withdrawal':'Save & grow'}</button></form>`);dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),a=Math.round(Number(d.get('amount'))*100)/100,j=account.jars[Number(d.get('jar'))];if(!Number.isFinite(a)||a<=0||a>1000000||(withdraw&&a>j.balance)){document.querySelector('#txn-error').textContent='Enter a valid amount within your available balance.';return}j.balance=Math.round((j.balance+(withdraw?-a:a))*100)/100;if(!withdraw){account.week=Math.round((account.week+a)*100)/100;account.earned+=a;const ratio=account.jars[0].balance/account.jars[0].goal;earnedMilestones=earnedMilestones.map((v,i)=>v||ratio>=[.25,.5,1][i])}account.history.unshift(`${withdraw?'Withdrew':'Saved'} ${cash(a)} · ${j.name}`);try{localStorage.setItem(accountKey,JSON.stringify(account));localStorage.setItem('pocket-room-travel-rewards',JSON.stringify(earnedMilestones))}catch{document.querySelector('#status').textContent='Storage unavailable; this transaction lasts this session.'}savingsUI();dialog.close()}}
document.querySelector('#add-money').onclick=()=>transaction();document.querySelector('#jars').onclick=()=>{modal(`<h3>My saving jars</h3>${account.jars.map(j=>`<div class="row"><p>${safe(j.name)}</p><b>${cash(j.balance)}</b></div>`).join('')}<p>Money stays yours. Withdrawals never remove earned rewards.</p><div class="savings-actions"><button id="deposit">＋ Add money</button><button id="withdraw">Withdraw</button></div>`);document.querySelector('#deposit').onclick=()=>{dialog.close();transaction()};document.querySelector('#withdraw').onclick=()=>{dialog.close();transaction(true)}};
document.querySelector('#friends').onclick=()=>modal('<h3>Your cozy circle</h3><p>Mia · A sunny reading corner</p><p>Oliver · Slow Sunday room</p><p>Luna · A botanical escape</p><p>Demo circle. Room visits are coming next. Only chosen decorations and achievements will be shared; balances stay private.</p>');savingsUI();
