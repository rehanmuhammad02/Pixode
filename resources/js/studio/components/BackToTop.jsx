import {useEffect,useState} from "react";
import Icon from "./Icon";
export default function BackToTop(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  let frame;
  const update=()=>{const hero=document.querySelector(".product-hero");setVisible(!!hero&&hero.getBoundingClientRect().bottom<=0);};
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  update();
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule);
  const hero=document.querySelector(".product-hero");
  const observer=new ResizeObserver(schedule);
  if(hero)observer.observe(hero);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
 },[]);
 if(!visible)return null;
 return <button className="floating-back-to-top" type="button" aria-label="Back to top" title="Back to top" onClick={()=>window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})}><Icon name="arrow-up" size={21}/></button>;
}