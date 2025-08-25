import React,{useEffect,useState} from 'react';
const KEY='bm-textures';
export default function TextureToggle(){
  const [on,setOn]=useState(()=>localStorage.getItem(KEY)!=='off');
  useEffect(()=>{
    document.body.classList.toggle('no-texture',!on);
    localStorage.setItem(KEY,on?'on':'off');
  },[on]);
  return (
    <button className="btn btn-outline-secondary btn-sm" onClick={()=>setOn(v=>!v)} aria-pressed={on}>
      {on?'Texturas: ON':'Texturas: OFF'}
    </button>
  );
}
