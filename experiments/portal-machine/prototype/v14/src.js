import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// THIS FILE OWNS GEOMETRY. AI image systems can make textures but cannot change hinges or endpoints.
const canvas = document.querySelector('#v14-machine-3d');
if(!canvas) throw Error('3D machine canvas not found');
const stage=document.querySelector('.labv14');
const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
renderer.setClearColor('#e4cfac');
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.48;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#dbc39c');
const camera=new THREE.PerspectiveCamera(39,Math.max(1,canvas.clientWidth)/Math.max(1,canvas.clientHeight),.05,100);
camera.position.set(5.2,3.95,-6.25);
const controls=new OrbitControls(camera,canvas);
controls.target.set(.12,1.02,-.2);controls.enableDamping=true;controls.dampingFactor=.08;
controls.minDistance=4;controls.maxDistance=14;controls.maxPolarAngle=Math.PI*.495;
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
const floor=mesh(scene,new THREE.PlaneGeometry(250,250),new THREE.MeshStandardMaterial({color:'#a38a69',roughness:.97}),'Neutral_Parchment_Floor',[0,-.31,0],[-Math.PI/2,0,0]);floor.castShadow=false;floor.receiveShadow=true;
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
// The two front cable terminals are ISOLATED. Their ONLY conductive bridge is the moving U-shaped copper knife frame.
 // The rear bridge floats on porcelain insulators and is electrically tied to both moving blades via the common conductive shaft.
 rounded(mount,'Rear_Floating_Copper_Bridge',[1.88,.105,.16],mat.copper,[0,.732,backZ],.025);
 for(const x of [-.74,-.34,.34,.74])bolt(mount,'Rear_Bridge_Fastener_'+x,x,.82,backZ,.43);
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
 // Each FREE copper tip joins an INSULATED fork socket, not an electrical crossbar near the fixed jaws.
 rounded(pivot,'Y_Insulated_Blade_Socket_'+x,[.28,.22,.30],mat.bakelite,[x,.065,-span-.17],.065);
 rod(pivot,'Y_Fork_Arm_'+x,[x,.08,-span-.16],[0,.55,-span-.26],.075,mat.brass,18);
}
// A true UPRIGHT Y-HANDLE: two short fork branches converge on one central vertical Bakelite lever.
// The fork's lower ends attach to each individual blade socket; there is NO horizontal grab bar "[ ".
rod(pivot,'Y_Stem_Forged_Brass',[0,.52,-span-.26],[0,.96,-span-.31],.103,mat.brass,28);
rod(pivot,'Y_Upright_Bakelite_Grip',[0,.89,-span-.31],[0,1.51,-span-.34],.164,mat.bakelite,40);
rod(pivot,'Y_Brass_Grip_Heel',[0,.88,-span-.31],[0,.96,-span-.315],.175,mat.brass,36);
rod(pivot,'Y_Brass_Grip_Endcap',[0,1.48,-span-.34],[0,1.53,-span-.345],.175,mat.edge,36);
for(const yy of [1.02,1.17,1.32,1.46]){
 torusY(pivot,'Y_Lever_Grip_Rib_'+yy,[0,yy,-span-.318-.03*(yy-.88)/.65],.17,.009,mat.brass);
}
// The Y-shaped lever, copper blades and shaft form ONE articulated moving group.
// LEFT fixed jaw -> LEFT moving blade -> rear conductive hinge -> RIGHT moving blade -> RIGHT fixed jaw.
// Exactly TWO external cables, BOTH from the same FRONT/BOTTOM face of the chassis.
// One independently crimped terminal per receiving fork; NO bar between those front terminals.
const redInsulation=new THREE.MeshStandardMaterial({color:'#653228',roughness:.94});
const terminations=[
 {id:'IN_SUPPLY',x:X[0],route:[[X[0],.79,frontZ-.05],[-.63,.73,-1.33],[-.72,.59,-1.85],[-.78,.44,-2.5],[-1.05,.40,-6.25]]},
 {id:'OUT_LOAD',x:X[1],route:[[X[1],.79,frontZ-.05],[.63,.73,-1.33],[.72,.59,-1.85],[.78,.44,-2.5],[1.05,.40,-6.25]]}
];
for(const t of terminations){
 const cable=tube(cabling,'HEAVY_Braided_Cable_Front_Bottom_'+t.id,t.route,.158,t.id==='IN_SUPPLY'?redInsulation:mat.rubber,16);
 const frames=cable.curve.computeFrenetFrames(150,false);
 for(const side of [0,1]){
  const pts=[];for(let i=0;i<=150;i++){const u=i/150,point=cable.curve.getPointAt(u),a=u*76*Math.PI*2+side*Math.PI;pts.push(point.addScaledVector(frames.normals[i],Math.cos(a)*.162).addScaledVector(frames.binormals[i],Math.sin(a)*.162));}
  const thread=mesh(cabling,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length,.007,4,false),side===0?mat.cloth:mat.darkiron,'Cable_Outer_Braid_'+t.id+'_'+side);thread.castShadow=false;
 }
 const e=t.route[0],second=t.route[1];const q=V(...second).sub(V(...e)).normalize(),cap=V(...e).addScaledVector(q,.14);
 rod(cabling,'Crimp_One_Cable_'+t.id,e,cap.toArray(),.195,mat.copper,24);
 const collar=mesh(cabling,new THREE.CylinderGeometry(.22,.22,.085,28),mat.brass,'Cable_Strain_Relief_'+t.id,cap.toArray());collar.quaternion.setFromUnitVectors(V(0,1,0),q);
 // A separate lug terminates at its own fixed contact foot. Never spans left/right sockets.
 rounded(mount,'Isolated_Front_Copper_Lug_'+t.id,[.25,.13,.34],mat.copper,[t.x,.735,frontZ-.18],.035);
 bolt(mount,'Independent_Terminal_Bolt_'+t.id,t.x,.845,frontZ-.16,.68);
}

// ===== V14 INTEGRATED GENERATOR ASSEMBLY (distinct from switch contacts) =====
// The generator appears on the SAME machine frame, not in an independent image layer.
const generator=new THREE.Group();generator.name='Brass_Generator_and_Glass_Valves';root.add(generator);
const glowMat=new THREE.MeshStandardMaterial({color:'#d6a05b',metalness:.3,roughness:.2,emissive:'#ef7e24',emissiveIntensity:.02});
const glassMat=new THREE.MeshPhysicalMaterial({color:'#f7deb0',transparent:true,opacity:.25,roughness:.1,metalness:.06,clearcoat:1,clearcoatRoughness:.1,side:THREE.DoubleSide,depthWrite:false});
const energyLights=[];
for(const [index,xx,zz,h] of [[0,-1.57,1.42,1.35],[1,1.52,1.46,1.85],[2,.06,1.51,1.27]]){
 rounded(generator,'Engine_Porcelain_Mount_'+index,[.43,.15,.44],mat.brass,[xx,.50,zz],.05);
 mesh(generator,new THREE.CylinderGeometry(.17,.23,.2,24),mat.porcelain,'Generator_Socket_Ceramic_'+index,[xx,.68,zz]);
 mesh(generator,new THREE.CylinderGeometry(.215,.215,.075,28),mat.brass,'Generator_Valve_Foot_'+index,[xx,.83,zz]);
 mesh(generator,new THREE.CylinderGeometry(.155,.165,h*.70,24),glassMat,'Glass_Vacuum_Valve_'+index,[xx,1.01+h*.34,zz]);
 mesh(generator,new THREE.CylinderGeometry(.16,.16,.08,28),mat.brass,'Valve_Top_Collar_'+index,[xx,1.03+h*.7,zz]);
 rod(generator,'Internal_Filament_'+index,[xx,.96,zz],[xx,.93+h*.63,zz],.035,glowMat,10);
 const warm=new THREE.PointLight('#ffad5e',0,2.8);warm.position.set(xx,1.12+h*.34,zz);generator.add(warm);energyLights.push(warm);
 for(let v=0;v<4;v++){
 const z=zz + Math.sin(v*1.4)*.007,y=.95+h*(.2+v*.13);
 torusY(generator,'Valve_Contact_Ring_'+index+'_'+v,[xx,y,z],.16,.011,mat.brass);
 }
}
const coilObj=mesh(generator,new THREE.CylinderGeometry(.47,.47,.68,42),mat.darkiron,'Resonator_Induction_Drum',[1.54,1.33,1.32],[Math.PI/2,0,Math.PI/2]);
const warmCopper=new THREE.MeshStandardMaterial({color:'#b87c46',metalness:.82,roughness:.33});
for(let i=0;i<21;i++){
 const y=1.05+i*.029;
 torusY(generator,'Coil_Turn_'+i,[1.54,y,1.32],.465,.018,warmCopper);
}
rounded(generator,'Rear_Power_Generator_Support',[1.23,.32,.44],mat.darkiron,[1.36,.52,1.39],.065);
for(let i=0;i<2;i++)rounded(generator,'Iron_Coil_Bracket_'+i,[.07,.68,.52],mat.brass,[.9+i*.8,.86,1.39],.025);
// Each copper conduit terminates in obvious flange-mounted fittings.
for(const [j,coords] of [
 [0,[[-1.45,.82,1.45],[-1.18,1.19,1.68],[-.78,1.18,1.61],[-.48,.89,1.48]]],
 [1,[[1.61,1.66,1.45],[1.91,1.94,1.50],[2.18,1.84,1.47],[2.24,1.34,1.23]]]
]){
 const tubePart=tube(generator,'FIXED_COPPER_GENERATOR_CONDUIT_'+j,coords,.058,mat.copper,18);
 for(const endpoint of [coords[0],coords.at(-1)]){
  const cap=mesh(generator,new THREE.SphereGeometry(.10,18,12),mat.brass,'BOLTED_CONDUIT_FITTING_'+j,endpoint);
 }
}
const generatorBadge=new THREE.Group();generatorBadge.name='Unpowered_Instrument_Placard';root.add(generatorBadge);
rounded(generatorBadge,'Engraved_Backplate',[.85,.025,.25],mat.brass,[-1.50,.405,1.05],.017);
// The same circuit output data powers light level, not decorative on-screen sprites.
let generatorEnabled=false;
function syncGenerator(){
 const live=stage.classList.contains('powered');generatorEnabled=live;
 glowMat.emissiveIntensity=live?1.3:.02;
 for(const lamp of energyLights)lamp.intensity=live?1.5:0;
}
// Retained THE EXACT same angle kinematics for any material pass
const maxAngle=68,clock=new THREE.Clock();
let isPowered=false;
let angle=68,from=68,to=68,elapsed=0,isMoving=false;
function apply(a){
 angle=a;pivot.rotation.x=THREE.MathUtils.degToRad(a);
 stage.dataset.leverAngle=Math.round(a);
 stage.dataset.circuitClosed=String(a<.6);
 const closed=a<.6;
 const stateLabel=document.querySelector('#v14-contact-state');if(stateLabel)stateLabel.textContent=closed?'CONTACTS CLOSED · CURRENT ON':'CONTACTS OPEN · CURRENT OFF';
 window.switch3D={angle:a,contactClosed:closed,bladeCount:2,hingeCount:1,cables:2,jaws:2,bridgeFront:false,frontContactsElectricallySeparated:true,uprightYLever:true,cableMount:'front-bottom',coordinateDriven:true};
}
function setAngle(v){
 const next=THREE.MathUtils.clamp(+v,0,maxAngle);to=next;from=angle;elapsed=0;isMoving=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!isMoving)apply(to);
}
const physicalButton=document.getElementById('lab-breaker');
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
let pointerDown=null;
canvas.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',e=>{
 if(!pointerDown || Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>9)return;
 const rect=canvas.getBoundingClientRect();
 pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(pivot.children,true).find(x=>x.object.name.startsWith('Y_')||x.object.name.includes('Blade'));
 if(hit&&physicalButton&&stage.classList.contains('uncovered'))physicalButton.click();
});
// Engineering QA hook: the lever click tests use an actual projected 3D grip position.
window.switch3DLeverCoordinates=()=>{
 pivot.updateWorldMatrix(true,true);camera.updateMatrixWorld();
 const v=pivot.localToWorld(V(0,1.20,-span-.33));v.project(camera);
 const r=canvas.getBoundingClientRect();return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
};
const poweredChange=new MutationObserver(()=>{
 const live=stage.classList.contains('powered');if(live!==isPowered){isPowered=live;setAngle(live?0:68);syncGenerator()}
});poweredChange.observe(stage,{attributes:true,attributeFilter:['class']});
const powerLabel=document.querySelector('#v14-power-toggle');
if(powerLabel)powerLabel.addEventListener('click',()=>physicalButton?.click());
const exportBtn=document.getElementById('v14-export-model');
if(exportBtn)exportBtn.addEventListener('click',()=>{
 exportBtn.disabled=true;exportBtn.textContent='PREPARING MODEL…';
 const exporter=new GLTFExporter();const openQ=[Math.sin(THREE.MathUtils.degToRad(68)/2),0,0,Math.cos(THREE.MathUtils.degToRad(68)/2)];
 const clip=new THREE.AnimationClip('OFF_UP_TO_ON_DOWN',.85,[new THREE.QuaternionKeyframeTrack('Blade_Assembly.quaternion',[0,.85],[...openQ,0,0,0,1])]);
 exporter.parse(root,binary=>{
  const blob=new Blob([binary],{type:'model/gltf-binary'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='portal-machine-y-lever-two-cable-switch.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),6000);exportBtn.disabled=false;exportBtn.textContent='EXPORT 3D SWITCH ↓';
 },err=>{console.error(err);exportBtn.disabled=false;exportBtn.textContent='RETRY EXPORT';},{binary:true,animations:[clip],onlyVisible:true,trs:true});
});
window.addEventListener('pagehide',()=>renderer.dispose());
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
const observer=new ResizeObserver(resize);observer.observe(canvas);
apply(angle);syncGenerator();
function tick(){
 requestAnimationFrame(tick);
 const delta=Math.min(clock.getDelta(),.055);
 if(isMoving){elapsed+=delta;const t=Math.min(1,elapsed/.75),ease=1-Math.pow(1-t,4);apply(from+(to-from)*ease);if(t>=1){apply(to);isMoving=false}}
 controls.update();renderer.render(scene,camera)
}
tick();