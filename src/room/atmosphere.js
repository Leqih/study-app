import * as THREE from 'three';

// Lightweight additive sprites provide a soft illustrative glow without a full-screen bloom pass.
export function atmosphere(scene) {
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(235,255,255,.7)');gradient.addColorStop(.18,'rgba(161,245,255,.35)');gradient.addColorStop(1,'rgba(120,220,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const map=new THREE.CanvasTexture(canvas),group=new THREE.Group();scene.add(group);
  const glow=(x,y,z,size,opacity)=>{const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,color:0xc0ffff,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));sprite.position.set(x,y,z);sprite.scale.set(size,size,1);sprite.raycast=()=>{};group.add(sprite);return sprite};
  glow(-3.2,3.5,-.7,2,.6);glow(3.3,1.5,-1.7,1.5,.4);
  const spark=new THREE.Shape();spark.moveTo(0,.12);spark.quadraticCurveTo(.018,.018,.09,0);spark.quadraticCurveTo(.018,-.018,0,-.12);spark.quadraticCurveTo(-.018,-.018,-.09,0);spark.quadraticCurveTo(-.018,.018,0,.12);
  const geometry=new THREE.ShapeGeometry(spark),material=new THREE.MeshBasicMaterial({color:0xe5ffff,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false});
  for(const [x,y,z,scale] of [[-3.3,2.7,1.5,.6],[2.7,3.3,-1.6,.7],[3.4,.8,1.1,.8],[-2.5,3.5,-1.4,.45],[-1.8,3.6,-2.1,.35]]){
    const star=new THREE.Mesh(geometry,material);star.position.set(x,y,z);star.scale.setScalar(scale);star.raycast=()=>{};group.add(star);glow(x,y,z,.45,.5);
  }
  return group;
}
