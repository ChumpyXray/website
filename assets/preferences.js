(()=>{'use strict';
const supportedLanguage=value=>['ru','en'].includes(value),supportedTheme=value=>['light','dark'].includes(value);
function read(key){try{return localStorage.getItem(key)}catch{return null}}
function write(key,value){try{localStorage.setItem(key,value)}catch{}}
const deviceTheme=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):null;
let manualLanguage=read('chumpy.lang'),manualTheme=read('chumpy.site.theme');
function requestedLanguage(){const value=new URLSearchParams(location.search).get('lang');return supportedLanguage(value)?value:null}
function language(){const requested=requestedLanguage();if(requested)return requested;if(supportedLanguage(manualLanguage))return manualLanguage;const preferences=typeof navigator==='object'?(navigator.languages?.length?navigator.languages:[navigator.language||'']):[];for(const value of preferences){const base=value.toLowerCase().split(/[-_]/)[0];if(supportedLanguage(base))return base}return 'en'}
function theme(){return supportedTheme(manualTheme)?manualTheme:deviceTheme?.matches?'dark':'light'}
function applyTheme(){const selected=theme();document.documentElement.dataset.theme=selected;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',selected==='dark'?'#121518':'#f7fbff')}
function notify(){applyTheme();window.dispatchEvent(new CustomEvent('chumpy:preferenceschange',{detail:{language:language(),theme:theme()}}))}
window.ChumpyPreferences={language,theme,setLanguage(value){if(!supportedLanguage(value))return;manualLanguage=value;write('chumpy.lang',value)},setTheme(value){if(!supportedTheme(value))return;manualTheme=value;write('chumpy.site.theme',value);applyTheme()}};
document.documentElement.lang=language();applyTheme();
deviceTheme?.addEventListener('change',()=>{if(!supportedTheme(manualTheme))notify()});window.addEventListener('languagechange',()=>{if(!requestedLanguage()&&!supportedLanguage(manualLanguage))notify()});
window.addEventListener('storage',event=>{if(event.key==='chumpy.lang'||event.key===null)manualLanguage=read('chumpy.lang');if(event.key==='chumpy.site.theme'||event.key===null)manualTheme=read('chumpy.site.theme');if(event.key==='chumpy.lang'||event.key==='chumpy.site.theme'||event.key===null)notify()});
})();
