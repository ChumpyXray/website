(()=>{'use strict';
const media=matchMedia('(prefers-reduced-motion: reduce)'),running=new Map(),life=new AbortController();
// Theme.kt: default spatial damping .8 / stiffness 380; fast spatial .6 / 800.
function samples(damping=.8,stiffness=380,duration=.65){const w=Math.sqrt(stiffness),wd=w*Math.sqrt(1-damping*damping);return Array.from({length:41},(_,i)=>{const t=i/40*duration;return i===40?1:1-Math.exp(-damping*w*t)*(Math.cos(wd*t)+damping*w/wd*Math.sin(wd*t))})}
const spatial=samples(),fast=samples(.6,800,.45);let languageChanging=false,languageSequence=0,languageTransition=null;
function visible(node){const b=node?.getBoundingClientRect?.();return b&&b.width>0&&b.bottom>0&&b.top<innerHeight}
function play(node,frames,duration=450,delay=0,fill='none'){if(languageChanging||!node?.animate||media.matches||document.hidden||!visible(node))return;running.get(node)?.cancel();const animation=node.animate(frames,{duration,delay,easing:'linear',fill});running.set(node,animation);const clear=()=>{if(running.get(node)===animation)running.delete(node)};animation.finished.then(clear,clear);return animation}
function enter(node,index=0){play(node,spatial.map((v,i)=>({offset:i/40,opacity:Math.min(1,i/10),transform:'translateY('+((1-v)*12)+'px)'})),650,Math.min(index,3)*35)}
function commitLanguage(update){
 const candidates=[...document.querySelectorAll('main>section,.footer,dialog[open]')];const anchor=candidates.find(node=>{const b=node.getBoundingClientRect?.();return b&&b.top<=112&&b.bottom>112});const before=anchor?.getBoundingClientRect?.().top;
 document.querySelectorAll('.motion-heading').forEach(node=>{const host=node.firstElementChild?.tagName==='A'?node.firstElementChild:node;host.textContent=host.textContent;node.removeAttribute('aria-label');node.classList.remove('motion-heading')});
 update();
 if(anchor&&typeof before==='number'&&typeof window.scrollBy==='function'){const delta=anchor.getBoundingClientRect().top-before;if(Math.abs(delta)>.5){const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollBy(0,delta);root.style.scrollBehavior=previous}}
}
const revealTargets='.hero-copy,.screens,.section-heading,.feature-grid article,.download-box,.history,.footer';
const revealed=new WeakSet(),pendingLanguage=new WeakSet();
function revealLanguageText(scope){
 if(media.matches||document.hidden)return;
 const matches=[...scope.querySelectorAll('h1,h2,h3,[data-t],.nav-links a,.brand,.tools button,.hero-actions>a,.build-title,.build-description,.download-top,.release time,.release li,.release>a,.all-releases,.screen figcaption')];
 const nodes=matches.filter(node=>!matches.some(parent=>parent!==node&&parent.contains(node))).filter(visible).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
 nodes.forEach((node,index)=>{const heading=/^H[123]$/.test(node.tagName),distance=heading?18:10;play(node,spatial.map((v,i)=>({offset:i/40,opacity:Math.min(1,i/10),transform:'translateY('+((1-v)*distance)+'px)'})),heading?650:500,Math.min(index,6)*30,'backwards')});
}
function switchLanguage(update){
 ++languageSequence;languageTransition?.skipTransition?.();stop();languageChanging=true;
 // Commit all text once, before the next paint; animations never change text geometry.
 try{commitLanguage(update)}finally{languageChanging=false}
 document.querySelectorAll(revealTargets).forEach(node=>revealed.add(node));
 for(const scope of document.querySelectorAll('.header,main>section,.footer,dialog[open]')){if(visible(scope)){revealLanguageText(scope)}else{pendingLanguage.add(scope);observer?.observe(scope)}}
}

function stop(){running.forEach(a=>a.cancel());running.clear()}
window.ChumpyMotion={switchLanguage,platformChanged(){syncPlatform(true)},textUpdated(node){play(node,[{opacity:.4},{opacity:1}],180)},contentUpdated(container,reason='update'){const nodes=[...container.children],previous=Number(container.dataset.motionCount||0);container.dataset.motionCount=String(nodes.length);if(reason==='search'){play(container,[{opacity:.65},{opacity:1}],140);return}const targets=reason==='more'?nodes.slice(previous):nodes;targets.slice(0,6).forEach((n,i)=>enter(n,i))}};
const sections=[...document.querySelectorAll('main>section[id]')],links=[...document.querySelectorAll('.nav-links a')];
function active(id){for(const link of links){const selected=link.getAttribute('href')==='#'+id;link.classList.toggle('current',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}}
let observer;
if(typeof IntersectionObserver==='function'){
 observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;if(pendingLanguage.has(e.target)){pendingLanguage.delete(e.target);revealLanguageText(e.target)}if(sections.includes(e.target)){active(e.target.id);continue}if(!revealed.has(e.target)){revealed.add(e.target);enter(e.target)}if(e.target.id)active(e.target.id)}},{threshold:.12,rootMargin:'0px 0px -12% 0px'});
 document.querySelectorAll(revealTargets).forEach(n=>observer.observe(n));sections.forEach(n=>observer.observe(n));
}
const platformGroup=document.querySelector('.platforms'),platformIndicator=platformGroup?.querySelector('.platform-indicator');
function syncPlatform(animated=false){
 const selected=platformGroup?.querySelector('[data-platform].selected');if(!selected||!platformIndicator||!(selected.offsetWidth>0))return;
 const old=platformIndicator.getBoundingClientRect(),group=platformGroup.getBoundingClientRect(),left=selected.offsetLeft,width=selected.offsetWidth;
 running.get(platformIndicator)?.cancel();platformIndicator.style.width=width+'px';platformIndicator.style.transform='translateX('+left+'px)';platformIndicator.style.opacity='1';
 if(animated&&old.width>0)play(platformIndicator,fast.map((v,i)=>({offset:i/40,transform:'translateX('+(left+(old.left-group.left-left)*(1-v))+'px) scaleX('+(1+(old.width/width-1)*(1-v))+')'})),450);
}
let platformResize;if(platformGroup&&typeof ResizeObserver==='function'){platformResize=new ResizeObserver(()=>syncPlatform());platformResize.observe(platformGroup);platformGroup.querySelectorAll('[data-platform]').forEach(button=>platformResize.observe(button))}
document.addEventListener('chumpy:dialog-open',()=>syncPlatform(),{signal:life.signal});window.addEventListener('resize',()=>syncPlatform(),{signal:life.signal});document.fonts?.ready.then(()=>syncPlatform());syncPlatform();
const selector='a[href],button';
document.addEventListener('pointerdown',event=>{if(event.button!==0)return;const node=event.target.closest(selector);if(node&&!node.matches('.skip,[data-platform]'))play(node,[{transform:'scale(1)'},{transform:'scale(.97)'}],100)},{signal:life.signal});
function release(event){const node=event.target.closest(selector);if(node&&!node.matches('[data-platform]'))play(node,fast.map((v,i)=>({offset:i/40,transform:'scale('+(1-.03*(1-v))+')'})),450)}
document.addEventListener('pointerup',release,{signal:life.signal});document.addEventListener('pointercancel',release,{signal:life.signal});
document.addEventListener('click',event=>{
 const target=event.target.closest(selector);if(!target)return;
 if(target.matches('.nav-links a'))active(target.getAttribute('href').slice(1));
 if(target.id==='theme')play(target.querySelector('svg'),spatial.map((v,i)=>({offset:i/40,transform:'rotate('+(180*v)+'deg)'})),650);
},{capture:true,signal:life.signal});
media.addEventListener('change',()=>{stop();languageTransition?.skipTransition?.()},{signal:life.signal});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();languageTransition?.skipTransition?.()}},{signal:life.signal});window.addEventListener('pagehide',event=>{stop();if(!event.persisted){observer?.disconnect();platformResize?.disconnect();life.abort()}},{signal:life.signal});
})();
