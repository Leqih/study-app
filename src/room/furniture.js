import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../vendor/three/RoundedBoxGeometry.js';

// All details are geometry: they remain readable when the room is orbited or enlarged.
export function buildFurniture({ piece, box, ball, cyl, mat, materials: m, shell, gold, coral, pink }) {
  const cream = mat('#fff5df'), seam = mat('#ded4bb'), brass = mat('#d6a35e');
  const cocoa = mat('#674439'), leafGreen = mat('#8bb487'), paper = mat('#fff8e6');
  const stitchMaterial = new THREE.LineBasicMaterial({color:'#e8e9c7',transparent:true,opacity:.8});

  function mesh(parent, geometry, material, x=0, y=0, z=0, cast=false) {
    const o = new THREE.Mesh(geometry, material);
    o.position.set(x,y,z); o.castShadow=cast; o.receiveShadow=true; parent.add(o); return o;
  }
  function soft(g,w,h,d,x,y,z,material,radius=.08) {
    return mesh(g,new RoundedBoxGeometry(w,h,d,4,Math.min(radius,Math.min(w,h,d)*.47)),material,x,y,z,true);
  }
  function thread(g,points,radius,material,closed=false) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed);
    return mesh(g,new THREE.TubeGeometry(curve,Math.max(12,points.length*3),radius,5,closed),material);
  }
  function ring(g,r,t,x,y,z,material) {
    const o=mesh(g,new THREE.TorusGeometry(r,t,6,40),material,x,y,z);o.rotation.x=Math.PI/2;return o;
  }
  function piping(g,w,d,y,x=0,z=0,material=seam) {
    const a=w/2,b=d/2,c=.06;
    thread(g,[[x-a+c,y,z-b],[x+a-c,y,z-b],[x+a,y,z-b+c],[x+a,y,z+b-c],[x+a-c,y,z+b],[x-a+c,y,z+b],[x-a,y,z+b-c],[x-a,y,z-b+c]],.009,material,true);
  }
  function book(g,x,y,z,w=.3,d=.4,cover=coral) {
    soft(g,w,.018,d,x,y,z,cover,.008);
    soft(g,w-.018,.065,d-.025,x,y+.04,z,paper,.008);
    soft(g,w,.018,d,x,y+.083,z,cover,.008);
    soft(g,.022,.09,d,x-w/2,y+.04,z,cover,.008);
    for(let i=0;i<3;i++) box(g,w-.035,.003,.003,x,y+.02+i*.016,z+d/2-.01,seam);
    box(g,.045,.005,d*.4,x,y+.095,z,brass);
  }
  function turnedLeg(g,x,z,h) {
    const points=[[.07,0],[.08,.03],[.06,.09],[.045,h*.65],[.08,h*.85],[.08,h]].map(v=>new THREE.Vector2(...v));
    mesh(g,new THREE.LatheGeometry(points,16),m.wood,x,0,z,true);
  }
  function mug(g,x,y,z) {
    cyl(g,.19,.16,.025,x,y,z,cream);ring(g,.145,.008,x,y+.017,z,seam);
    const profile=[[0,0],[.08,0],[.105,.03],[.115,.18],[.098,.18],[.087,.04],[0,.04]].map(p=>new THREE.Vector2(...p));
    mesh(g,new THREE.LatheGeometry(profile,32),cream,x,y+.02,z,true);
    cyl(g,.095,.095,.005,x,y+.175,z,cocoa);
    const handle=mesh(g,new THREE.TorusGeometry(.065,.018,8,20),cream,x+.13,y+.12,z);handle.scale.y=1.2;
    ring(g,.107,.006,x,y+.2,z,brass);
    thread(g,[[x-.03,y+.18,z],[x,y+.181,z-.025],[x+.03,y+.181,z],[x,y+.181,z+.018]],.004,paper);
  }
  function vase(g,x,y,z) {
    const profile=[[0,0],[.1,0],[.13,.05],[.14,.13],[.09,.22],[.055,.29],[.05,.32],[.04,.32],[.04,.28]].map(p=>new THREE.Vector2(...p));
    mesh(g,new THREE.LatheGeometry(profile,24),cream,x,y,z,true);
    for(let i=0;i<5;i++) {
      const a=i*2.4,fx=x+Math.cos(a)*.11,fz=z+Math.sin(a)*.1,fy=y+.49+(i%2)*.08;
      thread(g,[[x,y+.2,z],[x,y+.37,z],[fx,fy,fz]],.008,leafGreen);
      for(let p=0;p<5;p++) {const a=p*Math.PI*2/5;ball(g,.05,fx+Math.cos(a)*.045,fy+Math.sin(a)*.045,fz,pink,[1,1,.5]);}
      ball(g,.027,fx,fy,fz+.03,brass);
    }
  }

  piece('bed','Sunday bed',.65,-.8,g=>{
    for(const x of [-.77,.77])for(const z of [-1.02,1.02])turnedLeg(g,x,z,.34);
    soft(g,1.91,.22,2.47,0,.36,0,m.wood);
    box(g,1.84,.035,2.4,0,.46,0,brass);
    soft(g,1.99,.9,.17,0,.84,-1.16,m.wood);
    soft(g,1.68,.54,.07,0,.97,-1.055,cream);
    for(let i=0;i<9;i++)box(g,.017,.45,.015,-.72+i*.18,.97,-1.012,seam);
    for(const x of [-.98,.98]) {turnedLeg(g,x,-1.16,1.29);ball(g,.09,x,1.34,-1.16,brass);}
    soft(g,1.82,.26,2.3,0,.6,0,cream,.12);piping(g,1.78,2.25,.58);
    // A draped quilt with ripples and a curved fold, rather than a rigid slab.
    const width=1.84,rows=32,cols=28,positions=[],uv=[],indices=[];
    const quilt=(u,v)=>{
      const x=(u-.5)*width,fold=Math.max(0,(v-.78)/.22)*Math.PI/2;
      const z=v<=.78?-.25+v/.78*1.41:1.16+Math.sin(fold)*.065;
      const drop=v<=.78?0:1-Math.cos(fold);
      const edgeDrop=Math.pow(Math.abs(u-.5)*2,10)*.08;
      return [x,.81+.012*Math.sin(x*17+z*4)+.008*Math.sin(z*20)-drop*.43-edgeDrop,z];
    };
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){positions.push(...quilt(i/cols,j/rows));uv.push(i/cols,j/rows);}
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
    const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.setIndex(indices);geom.computeVertexNormals();m.sofa.side=THREE.DoubleSide;mesh(g,geom,m.sofa,0,0,0,true);
    soft(g,1.83,.1,.2,0,.805,-.21,m.cushion,.045);piping(g,1.77,.18,.83,0,-.21);
    const stitch=[];
    for(let row=1;row<6;row++)for(let i=0;i<28;i++){const p=quilt(i/28,row/7),q=quilt((i+.45)/28,row/7);p[1]+=.007;q[1]+=.007;stitch.push(...p,...q);}
    for(let col=1;col<7;col++)for(let j=0;j<27;j++){const p=quilt(col/7,j/28),q=quilt(col/7,(j+.45)/28);p[1]+=.007;q[1]+=.007;stitch.push(...p,...q);}
    const seams=new THREE.BufferGeometry();seams.setAttribute('position',new THREE.Float32BufferAttribute(stitch,3));g.add(new THREE.LineSegments(seams,stitchMaterial));
    for(const x of [-.43,.43]){
      const pillow=new THREE.Group();pillow.position.set(x,.84,-.78);pillow.rotation.y=x*.13;g.add(pillow);
      const cushion=soft(pillow,.73,.19,.44,0,0,0,cream,.09);
      const pos=cushion.geometry.attributes.position;
      for(let i=0;i<pos.count;i++){const px=pos.getX(i),pz=pos.getZ(i);if(pos.getY(i)>0)pos.setY(i,pos.getY(i)+.014*Math.sin(px*24)*Math.exp(-Math.pow(pz/.18,2)));}pos.needsUpdate=true;cushion.geometry.computeVertexNormals();
      piping(pillow,.7,.42,.005);thread(pillow,[[-.32,.02,-.13],[-.25,.07,-.12],[-.18,.09,-.13]],.004,seam);
    }
    // Folded throw with a woven edge and individually tied tassels.
    soft(g,.55,.06,.4,.48,.85,.68,mat('#a2c6c7'),.025);
    for(let i=0;i<7;i++)thread(g,[[.23+i*.08,.88,.5],[.23+i*.08,.886,.7],[.23+i*.08,.87,.86]],.004,cream);
    for(let i=0;i<8;i++)thread(g,[[.23+i*.07,.86,.86],[.23+i*.07,.84,.91],[.24+i*.07,.81,.94]],.006,cream);
  });

  piece('table','Tea & a good book',.2,1.5,g=>{
    for(const [x,z] of [[-.36,-.25],[.36,-.25],[0,.35]])turnedLeg(g,x,z,.48);
    cyl(g,.6,.57,.13,0,.5,0,m.wood);cyl(g,.565,.565,.025,0,.575,0,mat('#d8ab81'));
    ring(g,.55,.007,0,.59,0,brass);
    for(let i=0;i<3;i++)thread(g,[[-.4,.59,-.25+i*.2],[-.1,.593,-.23+i*.2],[.23,.59,-.26+i*.2]],.0025,seam);
    const reading=new THREE.Group();reading.position.set(-.19,.6,.04);reading.rotation.y=-.2;g.add(reading);book(reading,0,0,0,.32,.42,mat('#96b7b5'));
    mug(g,.23,.6,-.1);
    cyl(g,.13,.13,.012,.19,.6,.28,cream);
    for(let i=0;i<4;i++)ball(g,.055,.12+i*.04,.65,.28+Math.sin(i)*.025,mat('#dfb575'),[.7,.65,1]);
  });

  piece('plant','Split-leaf monstera',2.12,-.05,g=>{
    cyl(g,.31,.27,.055,0,.04,0,cream);
    const ceramic=mat('#83bab9');cyl(g,.275,.22,.42,0,.25,0,ceramic);ring(g,.275,.018,0,.46,0,ceramic);
    cyl(g,.252,.252,.015,0,.44,0,cocoa);
    for(let i=0;i<14;i++){const a=i*Math.PI*2/14;thread(g,[[Math.cos(a)*.23,.08,Math.sin(a)*.23],[Math.cos(a)*.26,.28,Math.sin(a)*.26],[Math.cos(a)*.277,.43,Math.sin(a)*.277]],.004,cream);}
    const shape=new THREE.Shape();shape.moveTo(0,0);
    shape.bezierCurveTo(-.2,.03,-.3,.1,-.29,.2);shape.lineTo(-.1,.2);shape.lineTo(-.3,.26);shape.bezierCurveTo(-.33,.32,-.27,.4,-.22,.42);shape.lineTo(-.07,.29);shape.lineTo(-.16,.48);shape.bezierCurveTo(-.1,.53,-.03,.53,0,.49);shape.bezierCurveTo(.08,.57,.18,.5,.22,.44);shape.lineTo(.08,.3);shape.lineTo(.28,.37);shape.bezierCurveTo(.34,.3,.33,.25,.3,.22);shape.lineTo(.1,.19);shape.lineTo(.28,.16);shape.bezierCurveTo(.23,.06,.1,.02,0,0);
    for(const x of [-.055,.055]){const h=new THREE.Path();h.absellipse(x,.32,.014,.035,0,Math.PI*2,false);shape.holes.push(h);}
    const geom=new THREE.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelThickness:.004,bevelSize:.003,bevelSegments:1,steps:1,curveSegments:8});
    for(let i=0;i<7;i++){
      const a=i*2.4,x=Math.cos(a)*.3,z=Math.sin(a)*.3,y=.7+(i%3)*.14;
      thread(g,[[0,.43,0],[x*.5,y-.12,z*.5],[x,y,z]],.012,leafGreen);
      const leaf=new THREE.Group();leaf.position.set(x,y,z);leaf.rotation.set(-.15,a,.3*Math.cos(a));g.add(leaf);mesh(leaf,geom,i%2?leafGreen:m.green,0,0,0,true);
      thread(leaf,[[0,.01,.02],[0,.2,.02],[0,.45,.02]],.005,mat('#b8cd8d'));
      for(const side of [-1,1])for(const y of [.12,.23,.34])thread(leaf,[[0,y,.02],[side*.08,y+.035,.02],[side*.18,y+.07,.02]],.0025,m.sofa);
    }
  });

  piece('nightstand','Pleated bedside lamp',-.95,-1.65,g=>{
    for(const x of [-.35,.35])for(const z of [-.29,.29])turnedLeg(g,x,z,.17);
    soft(g,.89,.61,.78,0,.45,0,m.wood,.035);soft(g,.99,.1,.89,0,.81,0,m.wood,.035);
    for(const y of [.32,.58]){
      soft(g,.78,.215,.06,0,y,.407,cream,.025);soft(g,.69,.145,.012,0,y,.445,m.white,.015);
      for(const x of [-.095,.095])ball(g,.022,x,y,.47,brass);
      thread(g,[[-.095,y,.48],[-.08,y-.04,.51],[.08,y-.04,.51],[.095,y,.48]],.013,brass);
    }
    cyl(g,.17,.2,.05,.1,.89,-.06,brass);cyl(g,.105,.13,.07,.1,.94,-.06,cream);cyl(g,.023,.023,.34,.1,1.13,-.06,brass);
    const shade=new THREE.CylinderGeometry(.14,.27,.32,64,1,true),pos=shade.attributes.position;
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),a=Math.atan2(z,x),scale=1+.025*Math.cos(a*32);pos.setX(i,x*scale);pos.setZ(i,z*scale);}shade.computeVertexNormals();
    const linen=mat('#fff6d8');linen.side=THREE.DoubleSide;linen.emissive.set('#ffcf83');linen.emissiveIntensity=.16;mesh(g,shade,linen,.1,1.41,-.06,true);
    ring(g,.143,.01,.1,1.57,-.06,cream);ring(g,.273,.01,.1,1.25,-.06,cream);
    for(let i=0;i<24;i++){const a=i*Math.PI*2/24;thread(g,[[.1+Math.cos(a)*.144,1.56,-.06+Math.sin(a)*.144],[.1+Math.cos(a)*.27,1.26,-.06+Math.sin(a)*.27]],.003,seam);}
    ball(g,.045,.1,1.23,-.06,cream);thread(g,[[.24,.9,.16],[.42,.87,.15],[.45,.45,.1],[.42,.1,.15]],.008,cocoa);
    book(g,-.22,.87,.15,.23,.28,m.sofa);
  });

  piece('dresser','Heirloom dresser',-2.3,.65,g=>{
    for(const x of [-.31,.31])for(const z of [-.62,.62])turnedLeg(g,x,z,.16);
    soft(g,.84,.73,1.5,0,.5,0,m.wood,.035);
    box(g,.85,.06,1.53,0,.16,0,brass);soft(g,.98,.1,1.68,0,.91,0,m.wood,.04);
    for(const y of [.32,.55,.78])for(const z of [-.365,.365]){
      soft(g,.075,.203,.67,.448,y,z,cream,.02);soft(g,.018,.135,.57,.492,y,z,m.white,.015);
      const plate=cyl(g,.042,.042,.014,.51,y,z,brass);plate.rotation.z=Math.PI/2;
      const handle=mesh(g,new THREE.TorusGeometry(.045,.011,6,20),brass,.54,y-.025,z);handle.rotation.y=Math.PI/2;
    }
    // Framed side panel, real drawer reveals and a tiny keyhole.
    soft(g,.65,.52,.012,0,.52,.757,cream,.006);soft(g,.53,.4,.014,0,.52,.768,m.white,.006);
    box(g,.006,.035,.01,.516,.73,-.365,cocoa);
    vase(g,0,.97,-.43);book(g,.03,.98,.29,.4,.38,coral);book(g,.02,1.07,.3,.37,.33,m.cushion);
    const frame=new THREE.Group();frame.position.set(.04,.98,-.02);frame.rotation.y=Math.PI/2;g.add(frame);
    soft(frame,.2,.27,.035,0,.135,0,brass,.01);box(frame,.16,.21,.01,0,.135,.023,cream);ball(frame,.04,0,.15,.035,pink,[1,1,.1]);
  });

  piece('stool','Hand-stitched pouf',-1.05,1.5,g=>{
    soft(g,.64,.31,.61,0,.2,0,m.cushion,.13);piping(g,.6,.57,.2,0,0,brass);
    for(const x of [-.16,.16])for(const z of [-.15,.15]){
      ball(g,.022,x,.36,z,brass,[1,.28,1]);
      for(const side of [-1,1])thread(g,[[x,.36,z],[x+side*.05,.365,z+side*.04],[x+side*.1,.35,z+side*.07]],.003,seam);
    }
    for(let i=0;i<6;i++)thread(g,[[-.24+i*.095,.19,.29],[-.24+i*.095,.14,.33],[-.23+i*.095,.08,.34]],.006,brass);
  });

  // Small architectural details are fixed to the room, not to the movable furniture.
  const floorGrain=new THREE.LineBasicMaterial({color:'#b98f76',transparent:true,opacity:.3});
  for(let row=0;row<10;row++)for(let col=0;col<4;col++){
    const x=-2.25+col*1.5,z=-2.25+row*.5,points=[];
    for(let i=0;i<10;i++)points.push(new THREE.Vector3(x-.55+i*.11,.014,z+.09+Math.sin(i*.7+row)*.012));
    shell.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),floorGrain));
  }
  // Clock indices and a readable multi-layer spine on each shelf book.
  for(let i=0;i<12;i++) {const a=i*Math.PI/6;ball(shell,.009,-2.798,2.62+Math.cos(a)*.183,-1.56+Math.sin(a)*.183,brass);}
  for(let i=0;i<3;i++) {
    const z=-2+i*.16;
    for(const y of [2.3,2.56])box(shell,.008,.012,.085,-2.478,y,z,brass);
    box(shell,.008,.1,.065,-2.477,2.43,z,cream);
  }
  // Embroidered rug border and short woven fringes.
  for(let j=0;j<2;j++){
    const points=[];for(let i=0;i<80;i++){const a=i*Math.PI*2/80;points.push([.25+Math.cos(a)*(1.35-j*.06),.031,.5+Math.sin(a)*(.96-j*.04)]);}
    thread(shell,points,.006,cream,true);
  }
  for(let i=0;i<18;i++){const a=(i/17)*Math.PI;thread(shell,[[.25+Math.cos(a)*1.43,.018,.5+Math.sin(a)*1.03],[.25+Math.cos(a)*1.51,.018,.5+Math.sin(a)*1.1]],.007,cream);}
}
