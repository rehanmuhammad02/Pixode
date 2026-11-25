import Icon from "./Icon";
export default function WorkspacePreview({logo}){
 const original=logo||"/assets/pixode-logo.png";
 const source=original==="/assets/pixode-logo.png"?"/assets/pixode-logo-transparent.png":original;
 return <div className="auth-workspace-preview" aria-hidden="true">
  <div className="auth-preview-toolbar"><span className="auth-preview-mark"><img src={source} alt="Pixode logo" width="1254" height="1254"/></span><strong>Your creative workspace</strong><span className="auth-preview-tag">PIXODE</span></div>
  <div className="auth-preview-body"><div className="auth-preview-sidebar"><span className="active"><Icon name="grid" size={15}/>Overview</span><span><Icon name="briefcase" size={15}/>Projects</span><span><Icon name="message" size={15}/>Messages</span></div>
   <div className="auth-preview-content"><span className="eyebrow">MADE FOR YOUR NEXT CHAPTER</span><h3>A clearer way to create.</h3>
    <div className="auth-preview-metrics"><div><Icon name="layers" size={18}/><span>Your projects</span><strong>One place.</strong></div><div><Icon name="check" size={18}/><span>Your progress</span><strong>Always clear.</strong></div></div>
    <div className="auth-preview-project"><div className="auth-project-art"><img src={source} alt="Pixode project logo" width="1254" height="1254"/></div><div><strong>Your next big idea</strong><span>Design. Build. Grow.</span></div><Icon name="arrow-up-right" size={18}/></div>
   </div>
  </div>
 </div>;
}