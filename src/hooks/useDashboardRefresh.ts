import {useEffect,useRef} from 'react';
// Open dashboards refresh without interrupting forms. Stop timers when unmounted.
export function useDashboardRefresh(refresh:()=>Promise<unknown>,enabled:boolean) {
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{if(!enabled)return;let running=false,disposed=false;
 const run=async()=>{if(running||disposed||document.visibilityState==='hidden')return;running=true;try{await latest.current();}catch{/* Existing page reports request errors. */}finally{running=false;}};
 const timer=window.setInterval(run,5000);window.addEventListener('focus',run);document.addEventListener('visibilitychange',run);window.addEventListener('urbanprocures:updated',run);
 return()=>{disposed=true;clearInterval(timer);window.removeEventListener('focus',run);document.removeEventListener('visibilitychange',run);window.removeEventListener('urbanprocures:updated',run);};
 },[enabled]);
}
