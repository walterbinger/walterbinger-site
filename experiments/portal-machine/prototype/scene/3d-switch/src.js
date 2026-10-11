import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// THIS FILE OWNS GEOMETRY. AI image systems can make textures but cannot change hinges or endpoints.
const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
renderer.setClearColor('#dec9a5');
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.48;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#dec9a5');
const camera=new THREE.PerspectiveCamera(37,canvas.clientWidth/canvas.clientHeight,.05,100);
camera.position.set(5.25,4.1,-6.5);
const controls=new OrbitControls(camera,canvas);
controls.target.set(0,.7,0);controls.enableDamping=true;controls.dampingFactor=.08;
controls.minDistance=4.5;controls.maxDistance=13;controls.maxPolarAngle=Math.PI*.495;
controls.update();
const hemi=new THREE.HemisphereLight('#fff5da','#514a42',2.4);scene.add(hemi);
const key=new THREE.DirectionalLight('#ffe8c7',5.0);key.position.set(-4,9,-5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=3;scene.add(key);
const rim=new THREE.DirectionalLight('#c8d6bf',2.2);rim.position.set(3,4,5);scene.add(rim);
const fill=new THREE.PointLight('#ffb873',32,10);fill.position.set(-3.2,2,-1.8);scene.add(fill);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
let seed=77411;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function procedural(kind){
 const e=document.createElement('canvas');e.width=512;e.height=512;const c=e.getContext('2d');
 const base=kind==='copper'?'#a4653e':kind==='iron'?'#373a33':kind==='porcelain'?'#e2d6ba':kind==='oak'?'#3b2721':kind==='bakelite'?'#141b1b':'#c2aa84';
 c.fillStyle=base;c.fillRect(0,0,512,512);
 const pix=c.getImageData(0,0,512,512);
 for(let k=0;k<pix.data.length;k+=4){
  let amount=(rand()-.5)*(kind==='iron'?57:kind==='copper'?48:kind==='porcelain'?14:kind==='oak'?35:16);
  if(kind==='copper' && rand()<.015){pix.data[k]=Math.max(0,pix.data[k]-35);pix.data[k+1]=Math.min(255,pix.data[k+1]+26);pix.data[k+2]=Math.min(255,pix.data[k+2]+18);}
  else{pix.data[k]=Math.min(255,Math.max(0,pix.data[k]+amount));pix.data[k+1]=Math.min(255,Math.max(0,pix.data[k+1]+amount));pix.data[k+2]=Math.min(255,Math.max(0,pix.data[k+2]+amount*.8))}
 }
 c.putImageData(pix,0,0);
 if(kind==='copper'){
  for(let n=0;n<160;n++){const x=rand()*512,y=rand()*512;c.beginPath();c.strokeStyle=n%5===0?'#8e947050':'#2d160d40';c.lineWidth=rand()*.85+.3;c.moveTo(x,y);c.lineTo(x+rand()*58-29,y+rand()*8-4);c.stroke()}
  for(let n=0;n<52;n++){c.strokeStyle='#2c171233';c.lineWidth=rand()*2+.3;const x=rand()*512,y=rand()*512;c.beginPath();c.moveTo(x,y);c.lineTo(x+rand()*100-50,y+rand()*28-14);c.stroke()}
 }else if(kind==='iron'){
  for(let n=0;n<240;n++){c.strokeStyle=n%4===0?'#e0c49228':'#111c1a36';c.lineWidth=rand()*.6+.2;let x=rand()*512,y=rand()*512;c.beginPath();c.moveTo(x,y);c.lineTo(x+20+rand()*77,y+rand()*4-2);c.stroke()}
 }else if(kind==='porcelain'){
  for(let n=0;n<25;n++){c.strokeStyle='#967a5650';c.lineWidth=.5;const x=rand()*512,y=rand()*512;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+17,y+5,x+9,y+40);c.stroke()}
 }else if(kind==='oak'){
  for(let n=0;n<180;n++){c.strokeStyle=n%3===0?'#bc895227':'#1a100b4a';c.lineWidth=rand()*1.2+.2;let y=rand()*512;c.beginPath();c.moveTo(-20,y);for(let x=0;x<=540;x+=28)c.lineTo(x,y+Math.sin(x*.03+n)*rand()*3);c.stroke()}
 }
 const tex=new THREE.CanvasTexture(e);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tex;
}
const copperTex=procedural('copper'),ironTex=procedural('iron'),porcelainTex=procedural('porcelain'),oakTex=procedural('oak'),bakeliteTex=procedural('bakelite');
const mat={
 copper:new THREE.MeshStandardMaterial({map:copperTex,metalness:.82,roughness:.42,side:THREE.DoubleSide}),
 edge:new THREE.MeshStandardMaterial({color:'#d7a16c',metalness:.92,roughness:.27}),
 oxid:new THREE.MeshStandardMaterial({color:'#395b50',metalness:.64,roughness:.75}),
 iron:new THREE.MeshStandardMaterial({map:ironTex,metalness:.54,roughness:.68}),
 darkiron:new THREE.MeshStandardMaterial({color:'#202723',metalness:.61,roughness:.63}),
 oak:new THREE.MeshStandardMaterial({map:oakTex,roughness:.79}),
 brass:new THREE.MeshStandardMaterial({color:'#c69c5e',metalness:.88,roughness:.34}),
 porcelain:new THREE.MeshStandardMaterial({map:porcelainTex,metalness:0,roughness:.21}),
 bakelite:new THREE.MeshPhysicalMaterial({map:bakeliteTex,roughness:.22,clearcoat:.76,clearcoatRoughness:.24}),
 rubber:new THREE.MeshStandardMaterial({color:'#242927',roughness:.93}),
 cloth:new THREE.MeshStandardMaterial({color:'#575a50',roughness:1}),
 bright:new THREE.MeshStandardMaterial({color:'#ede4c3',metalness:.3,roughness:.4}),
 inset:new THREE.MeshStandardMaterial({color:'#181712',metalness:.1,roughness:.88}),
 patina:new THREE.MeshStandardMaterial({color:'#3a5b4e',metalness:.48,roughness:.83,transparent:true,opacity:.65})
};
function mesh(parent,geometry,material,name,xyz=[0,0,0],rotation=[0,0,0]){
 const obj=new THREE.Mesh(geometry,material);obj.name=name;obj.position.set(...xyz);obj.rotation.set(...rotation);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;
}
function rounded(parent,name,size,material,position,r=.05,steps=4){
 return mesh(parent,new RoundedBoxGeometry(size[0],size[1],size[2],steps,r),material,name,position)
}
function rod(parent,name,start,end,r,material,segments=16){
 const a=V(...start),b=V(...end),center=a.clone().add(b).multiplyScalar(.5),direction=b.clone().sub(a);
 const object=mesh(parent,new THREE.CylinderGeometry(r,r,direction.length(),segments),material,name,center.toArray());
 object.quaternion.setFromUnitVectors(V(0,1,0),direction.normalize());return object;
}
function torusY(parent,name,pos,r,tube,material){
 return mesh(parent,new THREE.TorusGeometry(r,tube,8,24),material,name,pos,[Math.PI/2,0,0])
}
function bolt(parent,name,x,y,z,scale=1){
 mesh(parent,new THREE.CylinderGeometry(.091*scale,.1*scale,.095*scale,6),mat.brass,name+'_hex',[x,y,z]);
 mesh(parent,new THREE.CylinderGeometry(.061*scale,.061*scale,.02*scale,18),mat.darkiron,name+'_washer',[x,y+.063*scale,z]);
 const slot=rounded(parent,name+'_slotted_screw',[.084*scale,.009*scale,.018*scale],mat.inset,[x,y+.078*scale,z],.004*scale);slot.rotation.y=.6;
}
function foot(parent,name,x,z){
 // porcelain stack with irregular historical shedding ribs
 rounded(parent,name+'_iron_saddle',[.65,.08,.61],mat.darkiron,[x,.26,z],.035);
 mesh(parent,new THREE.CylinderGeometry(.25,.25,.09,30),mat.brass,name+'_washer_bottom',[x,.34,z]);
 mesh(parent,new THREE.CylinderGeometry(.19,.215,.22,30),mat.porcelain,name+'_porcelain_column',[x,.49,z]);
 mesh(parent,new THREE.CylinderGeometry(.28,.25,.065,32),mat.porcelain,name+'_porcelain_skirt_lower',[x,.41,z]);
 mesh(parent,new THREE.CylinderGeometry(.255,.28,.065,32),mat.porcelain,name+'_porcelain_skirt_upper',[x,.56,z]);
 mesh(parent,new THREE.CylinderGeometry(.195,.195,.058,32),mat.brass,name+'_ceramic_cap',[x,.63,z]);
 for(let i=0;i<2;i++){const ring=torusY(parent,name+'_gold_trim_'+i,[x,.40+i*.16,z],.23,.012,mat.brass);}
}
function tube(parent,name,points,r,material,radSeg=9){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)),false,'catmullrom',.18);
 const geom=new THREE.TubeGeometry(curve,72,r,radSeg,false);
 const m=mesh(parent,geom,material,name);return {mesh:m,curve};
}
const root=new THREE.Group();root.name='Main_Current_Contactor_Assembly';scene.add(root);
const base=new THREE.Group();base.name='Chassis';root.add(base);
const mount=new THREE.Group();mount.name='Fixed_Electrical_Hardware';root.add(mount);
const cabling=new THREE.Group();cabling.name='Two_Heavy_Insulated_Cables';root.add(cabling);
const pivot=new THREE.Group();pivot.name='Blade_Assembly';root.add(pivot);
// floor but not exported because not part of physical switch
const floor=mesh(scene,new THREE.PlaneGeometry(250,250),new THREE.MeshStandardMaterial({color:'#d4c19f',roughness:.97}),'Neutral_Parchment_Floor',[0,-.31,0],[-Math.PI/2,0,0]);floor.castShadow=false;floor.receiveShadow=true;
const ringOuter=mesh(scene,new THREE.RingGeometry(4.5,4.508,72),new THREE.MeshBasicMaterial({color:'#886a47',transparent:true,opacity:.23,side:THREE.DoubleSide}),'Measured_Construction_Ring',[0,-.304,0],[-Math.PI/2,0,0]);ringOuter.castShadow=false;

// black iron foundation with aged wood foot and inset machine plate
rounded(base,'Walnut_Salvage_Plank',[4.7,.25,3.55],mat.oak,[0,-.165,0],.12,5);
rounded(base,'Cast_Iron_Bottom_Lip',[4.44,.23,3.27],mat.darkiron,[0,.045,0],.13,5);
rounded(base,'Forged_Iron_Main_Plinth',[4.25,.28,3.1],mat.iron,[0,.21,0],.095,5);
rounded(base,'Bronze_Engraved_Outer_Beading',[4.06,.022,2.90],mat.brass,[0,.360,0],.024,3);
rounded(base,'Recessed_Center_Iron',[3.96,.03,2.80],mat.iron,[0,.373,0],.017,3);
for(const x of [-1.89,1.89])for(const z of [-1.29,1.29])bolt(base,'Mounting_Bolt_'+x+'_'+z,x,.397,z,.77);
for(const x of [-1.80,1.80])for(const z of [-.94,.94])torusY(base,'Cast_Sink_Washer_'+x+'_'+z,[x,.391,z],.08,.008,mat.edge);
// etched engraved label on front, actual plate in object geometry
rounded(base,'Letterpress_Label_Plaque',[1.12,.026,.29],mat.brass,[0,.402,-1.18],.018);
const textTex=(()=>{
 const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.clearRect(0,0,512,128);
 g.fillStyle='#211a13';g.font='bold 40px Georgia';g.textAlign='center';g.fillText('MAIN CURRENT',256,57);
 g.font='20px Georgia';g.fillText('I  ·  O',256,93);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
})();
const label=mesh(base,new THREE.PlaneGeometry(1,.24),new THREE.MeshBasicMaterial({map:textTex,transparent:true,side:THREE.DoubleSide}),'Engraving_on_nameplate',[0,.417,-1.18],[-Math.PI/2,0,0]);label.castShadow=false;

// geometry coordinates: two blades and one hinge, no four-bar mechanisms
const X=[-.60,.60],backZ=.89,frontZ=-1.00,span=backZ-frontZ;
const pivotY=.98,jawY=.98;
for(const x of X){
 foot(mount,'Rear_Ceramic_Insulator_'+x,x,backZ);
 foot(mount,'Front_Ceramic_Insulator_'+x,x,frontZ);
}
rounded(mount,'Rear_One_Source_Copper_Busbar',[1.88,.105,.16],mat.copper,[0,.732,backZ],.025);
rounded(mount,'Front_One_Load_Copper_Busbar',[1.88,.105,.16],mat.copper,[0,.732,frontZ],.025);
for(const z of [backZ,frontZ])for(const x of [-.74,-.34,.34,.74])bolt(mount,'Busbar_Fastener_'+z+'_'+x,x,.82,z,.43);
// Bearing saddles and one physically common shaft joining the blade pivots
for(const x of X){
 rounded(mount,'Fixed_Rear_Bearing_Saddle_'+x,[.33,.38,.38],mat.brass,[x,.805,backZ],.035);
 for(const dx of [-.19,.19])bolt(mount,'Saddle_Screw_'+x+'_'+dx,x+dx,.80,backZ+.19,.42);
}
rod(mount,'ONE_Common_Hinge_Shaft',[-.98,pivotY,backZ],[.98,pivotY,backZ],.105,mat.edge,32);
for(const x of [-.96,-.78,-.40,.40,.78,.96])
 rod(mount,'Hinge_Shaft_Collar_'+x,[x-.025,pivotY,backZ],[x+.025,pivotY,backZ],.13,mat.brass,28);

// FRONT receiving jaws, stationary: two isolated front contact slots, not linkage pivots
for(const x of X){
 rounded(mount,'Front_Fixed_Contact_Foot_'+x,[.40,.12,.40],mat.copper,[x,.825,frontZ],.03);
 for(const side of [-1,1]){
  const cx=x+side*.151;
  rounded(mount,'Fixed_Fork_Jaw_'+x+'_'+side,[.07,.38,.35],mat.copper,[cx,1.015,frontZ],.028);
  const edge=rounded(mount,'Contact_Wear_Strip_'+x+'_'+side,[.012,.24,.31],mat.edge,[cx-side*.041,1.025,frontZ],.004);
 }
 for(const z of [frontZ-.16,frontZ+.16])bolt(mount,'Receiver_Base_Bolt_'+x+'_'+z,x,.92,z,.53);
}
const handleZ=-span-.20;
pivot.position.set(0,pivotY,backZ);
for(const x of X){
 rounded(pivot,'One_Free_Hinged_Copper_Blade_'+x,[.205,.085,span+.07],mat.copper,[x,0,-span/2],.014,5);
 rounded(pivot,'Burnished_Edge_of_Blade_'+x,[.019,.013,span-.1],mat.edge,[x-.091,.052,-span/2],.004);
 for(const t of [.17,.32,.48,.64,.8]){
  const mark=rounded(pivot,'Oxidation_Detail_'+x+'_'+t,[.035,.003,.055],t===.48?mat.oxid:mat.brass,[x+.082,.048,-span*t],.002);
  mark.visible=t!==.17;
 }
 mesh(pivot,new THREE.CylinderGeometry(.14,.14,.13,32),mat.brass,'Blade_Hinge_Washer_'+x,[x,0,0],[0,0,Math.PI/2]);
 mesh(pivot,new THREE.CylinderGeometry(.082,.082,.145,6),mat.darkiron,'Blade_Hinge_Pin_'+x,[x,0,0],[0,0,Math.PI/2]);
 for(const z of [-span+.11,-span+.34]){
  bolt(pivot,'Blade_Tip_Clamps_'+x+'_'+z,x,.10,z,.37);
 }
 // short copper tang reaches grip but grip itself is an insulating crossbar
 rounded(pivot,'Handle_Insulated_Socket_'+x,[.31,.24,.28],mat.bakelite,[x,.03,-span-.19],.08);
}
// black grip is a real piece attached at FREE ends, spans X; no other linkage.
rod(pivot,'Bakelite_Grip_Free_Ends',[-1.07,.06,handleZ],[1.07,.06,handleZ],.17,mat.bakelite,36);
for(const x of [-.94,-.78,-.62,.62,.78,.94]){
 rod(pivot,'Ribbed_Grip_Ring_'+x,[x-.013,.06,handleZ],[x+.013,.06,handleZ],.174,mat.bakelite,32);
}
for(const x of [-1.07,1.07]){
 rod(pivot,'Grip_Copper_End_Ring_'+x,[x-.034,.06,handleZ],[x+.034,.06,handleZ],.176,mat.brass,32);
}
for(const x of [-1.10,1.10]){
 rod(pivot,'Grip_Dark_Endcap_'+x,[x-.019,.06,handleZ],[x+.019,.06,handleZ],.145,mat.darkiron,24);
}

// EXACTLY TWO EXTERNAL CABLES. Each connects a visible crimp lug and copper busbar.
const terminations=[
 {id:'IN_SUPPLY',end:[-1.11,.745,backZ],route:[[-1.11,.745,backZ],[-1.49,.72,1.14],[-2.08,.68,1.32],[-4.05,.60,1.44],[-6.4,.56,1.55]]},
 {id:'OUT_LOAD',end:[1.11,.745,frontZ],route:[[1.11,.745,frontZ],[1.50,.73,-1.08],[2.04,.67,-1.10],[4.08,.60,-1.2],[6.2,.57,-1.28]]}
];
for(const t of terminations){
 const cable=tube(cabling,'HEAVY_Black_Braided_Cable_'+t.id,t.route,.138,mat.rubber,14);
 // Twined material detail follows the actual tube curve; not extra external conductors.
 const frames=cable.curve.computeFrenetFrames(280,false);
 for(const side of [0,1]){
  const pts=[];
  for(let i=0;i<=280;i++){
   let frac=i/280;
   const cp=cable.curve.getPointAt(frac),a=frac*125*Math.PI*2+side*Math.PI;
   pts.push(cp.addScaledVector(frames.normals[i],Math.cos(a)*.143).addScaledVector(frames.binormals[i],Math.sin(a)*.143));
  }
  const curve=new THREE.CatmullRomCurve3(pts);
  const coil=mesh(cabling,new THREE.TubeGeometry(curve,pts.length,.0055,4,false),side===0?mat.cloth:mat.darkiron,'Woven_Sleeve_Helix_'+t.id+'_'+side);
  coil.castShadow=false;
 }
 const e=t.end,begin=V(...t.route[0]),second=V(...t.route[1]),direction=second.clone().sub(begin).normalize();
 const v2=begin.clone().addScaledVector(direction,.23);
 rod(cabling,'CRIMPED_Copper_Lug_'+t.id,begin.toArray(),v2.toArray(),.173,mat.copper,24);
 const washer=mesh(cabling,new THREE.CylinderGeometry(.235,.235,.042,24),mat.brass,'Crimp_Clamp_'+t.id,begin.clone().addScaledVector(direction,.20).toArray());
 washer.quaternion.setFromUnitVectors(V(0,1,0),direction);
 const inner=begin.clone().addScaledVector(direction,.08);
 // connected copper terminal strap in full 3D from inlet lug to associated busbar end
 rod(cabling,'Positive_Contact_to_Busbar_'+t.id,e,[e[0]>0?.89:-.89,.752,e[2]],.069,mat.copper,18);
 bolt(cabling,'Single_Cable_Lug_Terminal_'+t.id,e[0],e[1]+.11,e[2],.89);
}

// Retained THE EXACT same angle kinematics for any material pass
const maxAngle=68,clock=new THREE.Clock();
let angle=68,from=68,to=68,elapsed=0,isMoving=false;
function apply(a){
 angle=a;pivot.rotation.x=THREE.MathUtils.degToRad(a);
 const closed=a<.6;document.querySelector('#status').classList.toggle('live',closed);
 document.querySelector('#state').textContent=closed?'ON / RECEIVING JAWS CLOSED':'OFF / CONTACTS OPEN';
 document.querySelector('#degrees').textContent=Math.round(a)+'°';
 document.querySelector('#travel').value=Math.round(a);
 for(const [id,active] of [['on',closed],['off',a>3]]){document.querySelector('#'+id).classList.toggle('sel',active);document.querySelector('#'+id).setAttribute('aria-pressed',String(active))}
 window.switch3D={angle:a,contactClosed:closed,bladeCount:2,hingeCount:1,cables:2,jaws:2,bladeFreeTips:2,exportAvailable:true,coordinateDriven:true};
}
let audioCtx;
function impact(){
 if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
 const c=audioCtx;if(c.state==='suspended')c.resume();
 const now=c.currentTime;
 for(let i=0;i<3;i++){
  const osc=c.createOscillator(),g=c.createGain(),low=c.createBiquadFilter();low.type='lowpass';low.frequency.value=220;
  osc.type='triangle';osc.frequency.setValueAtTime(100+i*58,now+i*.048);osc.frequency.exponentialRampToValueAtTime(42,now+i*.048+.09);
  g.gain.setValueAtTime(.0001,now+i*.048);g.gain.exponentialRampToValueAtTime(.028/(i+1),now+i*.048+.009);g.gain.exponentialRampToValueAtTime(.0001,now+i*.048+.15);
  osc.connect(low).connect(g).connect(c.destination);osc.start(now+i*.048);osc.stop(now+i*.048+.17);
 }
}
function setAngle(v,withSound=false){
 to=THREE.MathUtils.clamp(+v,0,maxAngle);from=angle;elapsed=0;isMoving=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!isMoving)apply(to);
 if(withSound)impact();
}
document.querySelector('#off').addEventListener('click',()=>setAngle(68,true));
document.querySelector('#on').addEventListener('click',()=>setAngle(0,true));
document.querySelector('#travel').addEventListener('input',e=>{isMoving=false;apply(+e.target.value)});
document.querySelector('#view').addEventListener('click',()=>{camera.position.set(5.25,4.1,-6.5);controls.target.set(0,.7,0);controls.update()});
document.querySelector('#save').addEventListener('click',()=>{
 const btn=document.querySelector('#save');btn.disabled=true;btn.textContent='PACKING 3D ASSEMBLY…';
 const exporter=new GLTFExporter();
 const startQuaternion=[0,0,0,1],endQuaternion=[Math.sin(THREE.MathUtils.degToRad(68)/2),0,0,Math.cos(THREE.MathUtils.degToRad(68)/2)];
 const clip=new THREE.AnimationClip('OPEN_to_CLOSED',.9,[new THREE.QuaternionKeyframeTrack('Blade_Assembly.quaternion',[0,.9],[...endQuaternion,...startQuaternion])]);
 try{exporter.parse(root,blob=>{
  const url=URL.createObjectURL(new Blob([blob],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download='switch-lab-twin-blade-animated.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);btn.disabled=false;btn.textContent='↓ EXPORT ANIMATED 3D GLB';
 },err=>{btn.disabled=false;btn.textContent='EXPORT FAILED — RETRY';console.error(err)},{binary:true,animations:[clip],onlyVisible:true,trs:true})}
 catch(e){console.error(e);btn.disabled=false;btn.textContent='EXPORT FAILED — RETRY'}
});
window.addEventListener('pagehide',()=>{audioCtx?.close();renderer.dispose()});
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
const observer=new ResizeObserver(resize);observer.observe(canvas);
apply(angle);
function tick(){
 requestAnimationFrame(tick);
 const delta=Math.min(clock.getDelta(),.055);
 if(isMoving){elapsed+=delta;const t=Math.min(1,elapsed/.75),ease=1-Math.pow(1-t,4);apply(from+(to-from)*ease);if(t>=1){apply(to);isMoving=false}}
 controls.update();renderer.render(scene,camera)
}
tick();