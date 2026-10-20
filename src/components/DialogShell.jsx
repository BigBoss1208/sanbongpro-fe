import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
export default function DialogShell({ label, onClose, children }) {
 const panel=useRef(null), close=useRef(onClose); close.current=onClose;
 useEffect(() => {
  const previous=document.activeElement;
  const focusable=()=>[...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')].filter((item)=>item.offsetParent!==null);
  focusable()[0]?.focus();
  const key=(event)=>{
   if(event.key==='Escape') close.current();
   if(event.key==='Tab') { const items=focusable(), first=items[0], last=items[items.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',key);
  return ()=>{document.removeEventListener('keydown',key);previous?.focus();};
 },[]);
 return <div ref={panel} role="dialog" aria-modal="true" aria-label={label} className="club-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(event)=>{if(event.target===event.currentTarget) onClose();}}>{children}</div>;
}
DialogShell.propTypes={label:PropTypes.string.isRequired,onClose:PropTypes.func.isRequired,children:PropTypes.node};
