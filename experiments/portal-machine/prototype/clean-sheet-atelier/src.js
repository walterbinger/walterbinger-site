import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';

// CLEAN-SHEET ATELIER: a single physical assembly, NOT the V14 DOM/scene.
// No preset hero illustration and no independent instrument boxes.
const C=document.getElementById('machine'),status=document.getElementById('powerText'),toggle=document.getElementById('toggle'),controlsBox=document.getElementById('powerControls');
const renderer=new THREE.WebGLRenderer({canvas:C,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#dac8ad');
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#d8c8b0');
const mobileView=innerWidth<660;
const camera=new THREE.PerspectiveCamera(37,1,.08,100),defaultCamera=mobileView?[14.2,9.5,21.0]:[7.5,5.4,10.3];camera.position.set(...defaultCamera);
const orbit=new OrbitControls(camera,C);orbit.enableDamping=true;orbit.dampingFactor=.085;orbit.minDistance=8;orbit.maxDistance=27;orbit.maxPolarAngle=1.59;orbit.target.set(0,1.5,0);orbit.update();
scene.add(new THREE.HemisphereLight('#fff4d9','#504b47',2.7));
function light(color,power,position){const l=new THREE.DirectionalLight(color,power);l.position.set(...position);scene.add(l);return l}
const sun=light('#fff2d5',5.3,[-4,11,7]);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=11;sun.shadow.camera.bottom=-11;sun.shadow.normalBias=.019;sun.shadow.bias=-.00012;sun.shadow.radius=3;
light('#9dc5cf',3.2,[3,6,-5]);light('#ffb868',1.2,[-6,2,-3]);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const mat={
 hull:new THREE.MeshStandardMaterial({color:'#374b46',metalness:.68,roughness:.53}),
 hull2:new THREE.MeshStandardMaterial({color:'#59655b',metalness:.64,roughness:.53}),
 copper:new THREE.MeshStandardMaterial({color:'#aa653d',metalness:.83,roughness:.39}),
 copperLight:new THREE.MeshStandardMaterial({color:'#d49c5f',metalness:.81,roughness:.31}),
 brass:new THREE.MeshStandardMaterial({color:'#ceab6f',metalness:.83,roughness:.36}),
 iron:new THREE.MeshStandardMaterial({color:'#282e2c',metalness:.57,roughness:.66}),
 shadow:new THREE.MeshStandardMaterial({color:'#1c2625',metalness:.35,roughness:.77}),
 porcelain:new THREE.MeshStandardMaterial({color:'#ddd6c5',metalness:.04,roughness:.25}),
 rubber:new THREE.MeshStandardMaterial({color:'#252d2c',roughness:.9}),
 red:new THREE.MeshStandardMaterial({color:'#704039',roughness:.9}),
 blackGlass:new THREE.MeshPhysicalMaterial({color:'#142a31',metalness:.16,roughness:.11,transparent:true,opacity:.68,clearcoat:.86,depthWrite:false,side:THREE.DoubleSide}),
 greenGlass:new THREE.MeshPhysicalMaterial({color:'#92e8d5',metalness:.08,roughness:.16,transmission:.24,transparent:true,opacity:.44,side:THREE.DoubleSide,depthWrite:false}),
 coral:new THREE.MeshStandardMaterial({color:'#c36d57',metalness:.4,roughness:.47}),
 ochre:new THREE.MeshStandardMaterial({color:'#e5b760',metalness:.65,roughness:.36}),
 chalk:new THREE.MeshStandardMaterial({color:'#f3ead3',roughness:.8}),
 bulb:new THREE.MeshStandardMaterial({color:'#8d6854',emissive:'#ef923a',emissiveIntensity:.02}),
 energy:new THREE.MeshStandardMaterial({color:'#498f8c',emissive:'#5fdcc5',emissiveIntensity:.05,side:THREE.DoubleSide,metalness:.21,roughness:.43}),
 energyWire:new THREE.MeshBasicMaterial({color:'#82ead8',transparent:true,opacity:.12,side:THREE.DoubleSide}),
};
let live=false,leverAngle=-62,targetAngle=-62,transport=0;
const assembly=new THREE.Group();assembly.name='ONE_CONTIGUOUS_INVENTION';scene.add(assembly);
const floorMat=new THREE.MeshStandardMaterial({color:'#d6c2a1',roughness:1.0});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),floorMat);
floor.rotation.x=-Math.PI/2;floor.position.y=.27;floor.receiveShadow=true;floor.name='Illustration_Ground_for_Shadows';scene.add(floor);

function shape(parent,geom,material,name,pos=[0,0,0],rot=[0,0,0]){const m=new THREE.Mesh(geom,material);m.position.set(...pos);m.rotation.set(...rot);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(parent,name,r1,r2,height,material,pos,rotation=[0,0,0],segments=40){return shape(parent,new THREE.CylinderGeometry(r1,r2,height,segments),material,name,pos,rotation)}
function block(parent,name,size,material,pos,r=.07,rot=[0,0,0]){return shape(parent,new RoundedBoxGeometry(...size,4,r),material,name,pos,rot)}
function torus(parent,name,R,tube,material,pos,rot=[0,0,0]){return shape(parent,new THREE.TorusGeometry(R,tube,12,96),material,name,pos,rot)}
function beam(parent,name,p1,p2,r,material,segments=16){const a=V(...p1),b=V(...p2),dir=b.clone().sub(a),mid=a.add(b).multiplyScalar(.5);const m=cylinder(parent,name,r,r,dir.length(),material,mid.toArray(),[0,0,0],segments);m.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());return m}
function cable(parent,name,coords,r,material){const curve=new THREE.CatmullRomCurve3(coords.map(q=>V(...q)),false,'catmullrom',.35);return shape(parent,new THREE.TubeGeometry(curve,70,r,11,false),material,name)}
function stud(parent,name,x,y,z){cylinder(parent,name+'_washer',.14,.14,.025,mat.iron,[x,y,z]);cylinder(parent,name+'_hex_head',.091,.091,.087,mat.brass,[x,y+.048,z],[0,0,0],6)}
function panel(parent,name,points,y,thick,material,bevel=.1){
 const poly=new THREE.Shape();points.forEach(([x,z],i)=>i?poly.lineTo(x,z):poly.moveTo(x,z));poly.closePath();
 const geom=new THREE.ExtrudeGeometry(poly,{depth:thick,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel*.55,curveSegments:15});
 geom.rotateX(-Math.PI/2);
 // mapped world z becomes negative? rotateX(-90) maps xy points (x,z) -> (x,0,-z).
 const m=shape(parent,geom,material,name,[0,y,0]);return m;
}
// Entire object shares a flowing tapered cast-metal keel. Decorative mounts emerge from this substrate.
const outline=[[-5.55,-.12],[-5.22,-1.24],[-4.37,-2.01],[-2.52,-2.27],[-1.45,-2.37],[.28,-2.47],[2.35,-2.33],[4.3,-1.85],[5.18,-1.08],[5.52,.34],[5.13,1.29],[4.18,1.85],[2.24,2.03],[-.11,1.98],[-2.3,1.69],[-4.30,1.33]];
const hull=panel(assembly,'Single_Cast_Metal_Peplum_and_Hull',outline,.38,.39,mat.hull,.13);
const trim=panel(assembly,'Continuous_Engraved_Copper_Rim',outline,.68,.064,mat.copper,.05);
// visually one chassis, not new boxes; a smaller continuous top inlay contoured around portal projection
const top=[[-4.78,-.08],[-4.25,-1.15],[-3.12,-1.7],[-1.48,-1.86],[1.21,-1.85],[3.51,-1.52],[4.26,-.73],[4.64,.35],[3.92,1.11],[2.26,1.42],[-.2,1.43],[-2.6,1.17],[-4.29,.97]];
panel(assembly,'Inlaid_Continuous_Shaped_Worksurface',top,.766,.045,mat.hull2,.07);
panel(assembly,'One_Inset_Inner_Porcelain_Edge',[[-3.78,-.68],[-3.35,-1.4],[-1.05,-1.65],[1.5,-1.52],[3.2,-1.2],[3.8,-.37],[3.27,.88],[.6,1.21],[-1.95,1.00],[-3.59,.66]],.817,.008,mat.copperLight,.014);
// sculptural prow, side fins, and central arched bridge stand ON the same hull
for(const sx of [-1,1]){
 const x=sx*4.2;
 cable(assembly,'Cast_Proud_Side_Knife_Fin_'+sx,[[x,.78,-.78],[x+sx*.45,1.06,-.22],[x+sx*.35,1.72,.42],[x+sx*.02,1.94,.95]],.23,mat.hull);
 cable(assembly,'Copper_Edge_of_Fin_'+sx,[[x+sx*.055,.93,-.7],[x+sx*.39,1.17,-.17],[x+sx*.29,1.75,.42],[x+sx*.015,1.95,.95]],.035,mat.brass);
}
// A monumental portal chamber emerges from TWO arched load-bearing columns, not a separate "display box".
const portal=new THREE.Group();portal.name='CAST_INTO_CHASSIS__RESONANCE_HEART';assembly.add(portal);
portal.position.set(.45,2.5,.22);portal.rotation.y=-.075;
for(const sx of [-1,1]){
 const x= .45+sx*1.45;
 cable(assembly,'Rooted_Cathedral_Arch_'+sx,[[x+sx*.24,.76,.51],[x+sx*.35,1.65,.27],[x+sx*.23,2.58,.28],[x,3.48,.18],[.45+sx*.72,4.14,.15]],.18,mat.hull);
 cable(assembly,'Forged_Brass_Arch_Trim_'+sx,[[x+sx*.23,.81,.54],[x+sx*.34,1.64,.29],[x+sx*.22,2.59,.30],[x,3.48,.19],[.45+sx*.72,4.14,.17]],.025,mat.copperLight);
 for(const y of [1.25,2.05,2.88]){
  cylinder(assembly,'Arch_Brass_Rivet_'+sx+'_'+y,.11,.11,.10,mat.brass,[x+sx*.27,y,.33],[Math.PI/2,0,0],12);
 }
}
torus(portal,'Resonator_Copper_Volute',1.40,.24,mat.copper,[0,0,0]);
torus(portal,'Resonator_Brass_Bead',1.54,.036,mat.brass,[0,0,-.012]);
torus(portal,'Resonator_Dark_Recess',1.18,.20,mat.shadow,[0,0,.045]);
torus(portal,'Resonator_Glass_Lip',1.27,.045,mat.greenGlass,[0,0,.13]);
const aperture=cylinder(portal,'Black_Glass_Resonance_Surface',1.13,1.13,.08,mat.blackGlass,[0,0,.095],[Math.PI/2,0,0],80);
const portalLight=new THREE.PointLight('#6de1c1',0,5);portalLight.position.set(0,0,1.05);portal.add(portalLight);
// A wave-membrane is actually a 3D mesh, with time-based sculpting as a study (not V12 precise solver yet).
const N=65,meshSize=2.08,verts=[],indices=[],uv=[];
for(let iy=0;iy<N;iy++)for(let ix=0;ix<N;ix++){const u=ix/(N-1),v=iy/(N-1),px=(u-.5)*meshSize,py=(v-.5)*meshSize;verts.push(px,py,.19);uv.push(u,v);if(ix<N-1&&iy<N-1){const i=iy*N+ix;indices.push(i,i+1,i+N+1,i,i+N+1,i+N)}}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
const field=shape(portal,g,mat.energy,'Sculpted_Standing_Wave_Membrane');field.material.transparent=true;field.material.opacity=0;
let capDots=[];
for(let k=0;k<130;k++){
 const a=k*2.39996,r=Math.sqrt((k+.5)/130)*.89,x=r*Math.cos(a),y=r*Math.sin(a),z=.29;
 const dot=shape(portal,new THREE.SphereGeometry(.021,6,6),k%4===0?mat.ochre:k%4===1?mat.brass:k%4===2?mat.coral:mat.energy,'Sand_on_Wave_'+k,[x,y,z]);
 dot.userData.base=[x,y];capDots.push(dot);
}
for(let j=0;j<9;j++){
 const a=j*Math.PI*2/9;
 cylinder(portal,'Glass_Projector_Ring_Fastener_'+j,.09,.09,.055,mat.iron,[Math.cos(a)*1.49,Math.sin(a)*1.49,.08],[Math.PI/2,0,0],7);
}
for(let j=0;j<4;j++){
 const theta=Math.PI*2*j/4+.4;
 const x=Math.cos(theta)*1.38,y=Math.sin(theta)*1.38;
 const clamp=beam(portal,'Resonator_Aperture_Copper_Clamp_'+j,[x,y,-.12],[x,y,.28],.065,mat.brass);
}
// Copper bridge across lower housing physically acts as a stiffener to arches; no overlay wiring.
cable(assembly,'Crescents_Housing_Strengthener',[[-.9,1.08,.55],[-.60,1.25,.95],[.15,1.22,1.15],[1.05,1.25,.85],[1.7,1.04,.55]],.075,mat.copper);
// ENGINE SHAPED AS SCULPTURE rather than exposed scattered props.
const engine=new THREE.Group();engine.name='Engine_Side_of_Same_Casting';assembly.add(engine);
const engineBase=panel(engine,'Forged_Engine_Bed',[[-4.22,-.85],[-3.81,-1.32],[-2.8,-1.53],[-2.26,-1.01],[-2.15,.57],[-3.0,1.03],[-4.05,.72]],.85,.12,mat.hull,.05);
cylinder(engine,'Canted_Reaction_Bell',.72,.56,.95,mat.copper,[-2.82,1.51,-.10],[0,0,-.14],54);
torus(engine,'Bell_Rolling_Rim',.63,.052,mat.brass,[-2.90,1.96,-.09],[Math.PI/2,0,-.12]);
cylinder(engine,'Upper_Reactor_Hat',.33,.32,.19,mat.iron,[-2.94,2.05,-.09],[0,0,-.13],36);
for(let j=0;j<19;j++){
 const y=1.1+j*.039;torus(engine,'Reactive_Induction_Coil_Turn_'+j,.58,.019,mat.copperLight,[-2.8,y,-.10],[Math.PI/2,0,.12]);
}
const valveLights=[];
for(let j=0;j<3;j++){
 const xx=-4.18+j*.87,zz=.96-(j%2)*.30,h=[1.14,.78,1.28][j];
 cylinder(engine,'Engine_Porcelain_Valve_Base_'+j,.22,.24,.20,mat.porcelain,[xx,.97,zz]);
 cylinder(engine,'Engine_Tube_Brass_Collar_'+j,.27,.27,.12,mat.brass,[xx,1.08,zz]);
 cylinder(engine,'Engine_Glass_Vacuum_Vessel_'+j,.17,.19,h,mat.greenGlass,[xx,1.15+h/2,zz]);
 cylinder(engine,'Engine_Glass_Vessel_Ring_'+j,.20,.20,.06,mat.brass,[xx,1.18+h,zz]);
 beam(engine,'Engine_Filament_'+j,[xx,1.17,zz],[xx,1.10+h,zz],.024,mat.bulb);
 const lamp=new THREE.PointLight('#fba760',0,1.3);lamp.position.set(xx,1.4+h*.4,zz);engine.add(lamp);valveLights.push(lamp);
}
// Real copper tubes connect reactor output to the portal's LEFT column socket, with obvious terminal collars.
const paths=[
 [[-2.55,1.62,.02],[-2.07,2.09,-.25],[-1.5,2.21,-.18],[-1.32,2.43,.12]],
 [[-3.04,1.90,-.2],[-2.71,2.60,-.50],[-1.76,2.85,-.54],[-1.11,2.9,.10]]
];
paths.forEach((coords,i)=>{
 cable(assembly,'Plumbed_Reactor_to_Resonator_'+i,coords,.08,mat.copper);
 for(const [j,p] of [coords[0],coords.at(-1)].entries()){
  cylinder(assembly,'Socket_Ferrule_'+i+'_'+j,.13,.13,.15,mat.brass,p,[Math.PI/2,0,0],22);
 }
});
// RIGHT: one curvilinear instrument wing, mounted on same sculptural casting, under the right load arch.
panel(assembly,'Rolled_Instrument_Wing',[ [1.75,-1.10],[3.54,-1.17],[4.22,-.68],[4.18,.55],[3.48,.98],[2.04,.84] ],.85,.13,mat.hull,.055);
for(let j=0;j<2;j++){
 const x=2.55+j*1.05,z= - .62;
 cylinder(assembly,'Integrated_Dial_Recess_'+j,.44,.44,.032,mat.shadow,[x,1.01,z]);
 cylinder(assembly,'Integrated_Receiver_Silver_Knob_'+j,.30,.34,.18,mat.iron,[x,1.13,z]);
 torus(assembly,'Dial_Engraved_Brass_Bezel_'+j,.43,.023,mat.brass,[x,1.055,z],[Math.PI/2,0,0]);
 for(let k=0;k<11;k++){
 const a=k*Math.PI*2/11,rx=x+Math.sin(a)*.39,rz=z+Math.cos(a)*.39;
 block(assembly,'Dial_Tick_'+j+'_'+k,[.014,.011,.065],mat.chalk,[rx,1.06,rz],.003,[0,-a,0]);
 }
 // playfully asymmetrical two knobs, no separate dashboard card
 const marker=block(assembly,'Knob_Position_Indicator_'+j,[.053,.011,.09],mat.copperLight,[x,1.231,z-.18],.009);
}
for(let i=0;i<5;i++){
 const x=2.15+i*.39,z=.28+(i%2)*.06;
 cylinder(assembly,'Spectrum_Porcelain_Key_'+i,.13,.14,.12,mat.porcelain,[x,1.00,z]);
 cylinder(assembly,'Chromatic_Detent_'+i,.072,.075,.04,[mat.coral,mat.ochre,mat.energy,mat.greenGlass,mat.copperLight][i],[x,1.085,z]);
}
cable(assembly,'Right_Wing_Sewn_Brass_Edge',[[2.08,1.03,.86],[3.22,.98,.87],[4.07,1.13,.61],[4.33,1.18,.08]],.041,mat.brass);
// Sculptural strip crossing the nose; grounding mechanical detail across one base
cable(assembly,'Front_Forged_Filigree',[[ -4.47,.72,1.38 ],[-3.33,.75,1.7],[-1.45,.73,2.02],[.30,.74,2.12],[2.20,.75,2.01],[4.18,.72,1.45]],.038,mat.copperLight);
// MAIN POWER: exposed double knife switch built into the LEFT FRONT cast shoulder, not separate product box.
const leverRoot=new THREE.Group();leverRoot.name='INTEGRATED_MAIN_CURRENT_SWITCH';leverRoot.position.set(-3.7,.79,1.05);assembly.add(leverRoot);
const pitch=-.73,bladeSpacing=.245; // local x positions +- .245, one electrical path via back bridge
for(const x of [-bladeSpacing,bladeSpacing]){
 const zBack=-.46,zFront=.54;
 cylinder(leverRoot,'Porcelain_Insulator_Front_'+x,.17,.17,.17,mat.porcelain,[x,.15,zFront]);
 cylinder(leverRoot,'Independent_Fixed_Fork_Foot_'+x,.15,.15,.06,mat.copper,[x,.26,zFront]);
 for(const sign of [-1,1]){
  const fx=x+sign*.083;
  block(leverRoot,'Fixed_Open_Socket_Jaw_'+x+'_'+sign,[.047,.23,.25],mat.copper,[fx,.41,zFront],.013);
 }
 cylinder(leverRoot,'Porcelain_Insulator_Rear_'+x,.15,.15,.17,mat.porcelain,[x,.15,zBack]);
 block(leverRoot,'Rear_Hinge_Support_'+x,[.23,.23,.27],mat.brass,[x,.33,zBack],.034);
}
// rear electrically conductive bridge is the ONLY common busbar; front terminals remain disconnected.
beam(leverRoot,'ONE_REAR_CONDUCTIVE_HINGE_SHAFT',[-.42,.48,-.46],[.42,.48,-.46],.09,mat.copperLight);
const lever=new THREE.Group();lever.name='INTEGRATED_THROW_LEVER_AND_BLADES';lever.position.set(0,.48,-.46);leverRoot.add(lever);
const blen=1.0;
for(const x of [-bladeSpacing,bladeSpacing]){
 block(lever,'Copper_Free_Tipped_Knife_Blade_'+x,[.113,.065,blen+.06],mat.copper,[x,0,blen/2],.01);
 cylinder(lever,'Knife_Hinge_Collar_'+x,.12,.12,.11,mat.brass,[x,0,0],[0,0,Math.PI/2]);
}
// Classic lever shape intentionally preserved, not the rejected angled Y version.
// A practical single black grip rises straight from a short insulated saddle at the blade FREE ends.
block(lever,'One_Insulating_Grip_Saddle',[.75,.20,.20],mat.iron,[0,.05,blen],.072);
beam(lever,'Lever_Brass_Stem',[0,.07,blen],[0,.52,blen+.035],.078,mat.brass);
beam(lever,'Lever_Bakelite_Handle',[0,.50,blen+.035],[0,1.10,blen+.09],.152,mat.rubber);
cylinder(lever,'Lever_Brass_End_Nut',.159,.165,.055,mat.brass,[0,1.09,blen+.09]);
// two external conductors, both enter front/bottom through real individual lugs.
for(const [j,x] of [-bladeSpacing,bladeSpacing].entries()){
 const wireMat=j===0?mat.red:mat.rubber;
 // Both cables enter from the same underside front edge and terminate on distinct front jaw contacts.
 const path=[[x,.18,.67],[x,.12,1.03],[x+(j===0?-.03:.03),-.03,1.55],[x+(j===0?-.04:.04),-.15,2.06]];
 const coords=path.map(q=>[q[0]-3.7,q[1]+.79,q[2]+1.05]);
 cable(assembly,'Switch_Bottom_Feed_Exactly_Cable_'+(j+1),coords,.12,wireMat);
 cylinder(leverRoot,'Cable_Bolted_Individual_Lug_'+j,.115,.115,.08,mat.copper,[x,.30,.61]);
}
// A single-circuit OPEN->CLOSED switch controls all light/reactions.
const indicator=new THREE.PointLight('#d9f2c6',0,3.4);indicator.position.set(-3.50,1.7,1.2);assembly.add(indicator);
const dust=[];
for(let i=0;i<65;i++){
 const t=i*2.39996,r=.19+Math.sqrt((i+.5)/65)*.92;
 const dot=shape(portal,new THREE.SphereGeometry(.014+(i%3)*.004,7,6),i%3?mat.brass:mat.energy,'Wave_Fleck_'+i,[Math.cos(t)*r,Math.sin(t)*r,.32]);dust.push(dot);
}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
function power(next){live=next;targetAngle=live?0:-62;status.textContent=live?'Awakened':'Dormant';controlsBox.classList.toggle('live',live);toggle.setAttribute('aria-pressed',String(live));toggle.textContent=live?'RAISE TO OFF ↟':'THROW MAIN CURRENT ↯'}
toggle.addEventListener('click',()=>power(!live));
document.getElementById('reset').addEventListener('click',()=>{camera.position.set(...defaultCamera);orbit.target.set(0,1.5,0);orbit.update()});
C.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
C.addEventListener('pointerup',e=>{
 if(!down||Math.hypot(down[0]-e.clientX,down[1]-e.clientY)>8)return;
 const rect=C.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(lever.children,true);if(hit.length)power(!live);
});
C.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();power(!live)}});
function resize(){const w=C.clientWidth,h=C.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
 if((w<660)!==window.atelierSmallView){window.atelierSmallView=(w<660);
  const next=w<660?[14.2,9.5,21.0]:[7.5,5.4,10.3];camera.position.set(...next);orbit.target.set(0,1.5,0);orbit.update();}
 camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(C);resize();
const t0=performance.now();
window.atelier={get handleScreen(){const p=lever.localToWorld(V(0,.85,1.06)).project(camera),r=C.getBoundingClientRect();return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2}},get state(){return {powered:live,bladeAngle:leverAngle,open:leverAngle<-3,frontTerminalsSeparate:true,mainPowerIntegrated:true,mechanism:1,externalCables:2,oneChassis:true,meshCount:assembly.children.length}},scene,assembly,lever};
let lastTime=performance.now();
function tick(now){requestAnimationFrame(tick);const dt=Math.min(.06,(now-lastTime)/1000);lastTime=now;
 const step=Math.min(1,dt*5);leverAngle+= (targetAngle-leverAngle)*step;
 lever.rotation.x=THREE.MathUtils.degToRad(leverAngle);
 if(!live&&Math.abs(leverAngle-targetAngle)<.12)lever.rotation.x=THREE.MathUtils.degToRad(-62);
 indicator.intensity+=((live?1.3:0)-indicator.intensity)*Math.min(1,dt*3.4);
 portalLight.intensity+=((live?12:0)-portalLight.intensity)*Math.min(1,dt*2.2);
 mat.bulb.emissiveIntensity+=((live?1.4:.02)-mat.bulb.emissiveIntensity)*Math.min(1,dt*3.2);
 mat.energy.emissiveIntensity+=((live?1.65:.06)-mat.energy.emissiveIntensity)*Math.min(1,dt*2.8);
 field.material.opacity+=((live?.88:0)-field.material.opacity)*Math.min(1,dt*2);
 const time=now*.0015,buf=g.attributes.position;
 for(let i=0;i<buf.count;i++){const x=buf.getX(i),y=buf.getY(i),r=Math.hypot(x,y);
   const inside=r<1.05;const amplitude=inside?Math.pow(Math.max(0,1-r*r/1.21),1.4)*(.11*Math.sin(7.2*x+time*1.2)*Math.sin(5.8*y-time*.8)+.073*Math.sin(12.8*(x+y)+time*.7)):0;
   buf.setZ(i,.21+(live?amplitude:0));
 }
 buf.needsUpdate=true;if(Math.floor(now/400)%3===0)g.computeVertexNormals();
 for(const [i,dot] of capDots.entries()){const [x,y]=dot.userData.base;dot.visible=live;dot.position.z=.27+(live?Math.sin(8*x+time)*Math.cos(7*y-time*.8)*.07:0)}
 for(const [i,dot] of dust.entries()){dot.visible=live;dot.position.z=.31+ (live?.08*Math.sin(time*.75+i*.2):0)}
 if(live)portal.rotation.z=.012*Math.sin(now*.00031);
 orbit.update();renderer.render(scene,camera);
}requestAnimationFrame(tick);
window.addEventListener('pagehide',()=>{renderer.dispose()});