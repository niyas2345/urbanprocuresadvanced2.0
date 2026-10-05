// Defense in depth alongside explicit Admin identity review; originals stay private in D1/R2.
export function maskedText(value:string|null,identity:Record<string,unknown>|null) {
 if(value==null)return value;
 let result=value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[contact masked]').replace(/(?:https?:\/\/|www\.)[^\s]+/gi,'[contact masked]').replace(/(?:\+?\d[\s().-]*){9,}/g,'[contact masked]');
 for(const raw of Object.values(identity??{})){if(typeof raw==='string'&&raw.trim().length>=3){const escaped=raw.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');result=result.replace(new RegExp(escaped,'gi'),'[identity masked]');}}
 return result;
}
