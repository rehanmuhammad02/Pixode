import { Children, useEffect, useId, useState } from "react";
import Icon from "./Icon";
export default function CardGrid({children,label,className="",id,resetKey=""}) {
  const cards=Children.toArray(children);
  const [expanded,setExpanded]=useState(false);
  const unique=useId();
  const gridId="cards-"+unique.replace(/:/g,"");
  useEffect(()=>setExpanded(false),[resetKey]);
  if(!cards.length) return null;
  return <div className="card-collection" id={id}>
    <div className={className+" premium-card-grid"} id={gridId}>{expanded?cards:cards.slice(0,3)}</div>
    {cards.length>3 && <div className="collection-action"><button type="button" className="collection-toggle" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} aria-controls={gridId}>{expanded?"Show less":"View all "+label.toLowerCase()}<Icon name={expanded?"arrow-up":"arrow-right"} size={17}/></button></div>}
  </div>;
}