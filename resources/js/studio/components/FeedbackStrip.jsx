import {useState} from "react";
import Icon from "./Icon";
export default function FeedbackStrip({children}) {
  const [paused,setPaused]=useState(false);
  return <div className={"feedback-motion "+(paused?"is-paused":"")}>
    <div className="container feedback-motion-toolbar"><span className="small-label">A FEW DIFFERENT PERSPECTIVES</span><button type="button" className="feedback-motion-toggle" onClick={()=>setPaused(!paused)} aria-label={paused?"Play feedback animation":"Pause feedback animation"} aria-pressed={paused}><Icon name={paused?"play":"pause"} size={15}/>{paused?"Play":"Pause"}</button></div>
    <div className="feedback-motion-window"><div className="feedback-motion-track"><div className="feedback-motion-group">{children}</div><div className="feedback-motion-group" aria-hidden="true" inert>{children}</div></div></div>
  </div>;
}