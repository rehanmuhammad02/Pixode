import {Link} from "react-router-dom";
import Brand from "./Brand";
import Icon from "./Icon";
import Button from "./Button";
export default function Footer({settings,onLegal}) {
 return <footer className="footer studio-footer">
  <div className="container">
   <div className="footer-invitation"><div><span className="eyebrow">THE NEXT CHAPTER IS YOURS</span><h2>Good ideas deserve<br/><span>an exceptional beginning.</span></h2><p>Tell us what you have in mind. Let's make it something worth sharing.</p></div><Button href="#contact">Start a conversation</Button></div>
   <div className="footer-grid">
    <div className="footer-brand"><Brand logo={settings.logo}/><h3>Your creative partner.<br/>From first idea to what's next.</h3><p>{settings.footerDescription}</p><span className="footer-availability"><span className="status-dot"/>Open for creative collaborations</span></div>
    <div><span className="small-label">EXPLORE PIXODE</span><a href="#work">Selected work</a><a href="#services">Our capabilities</a><a href="#pricing">Project packages</a><a href="#process">How we work</a><a href="#feedback">Project perspectives</a><a href="#studio">Meet the studio</a></div>
    <div><span className="small-label">WHAT WE CREATE</span><a href="#services">Brands & visual identities</a><a href="#services">Websites & digital experiences</a><a href="#services">Online stores & commerce</a><a href="#services">Mobile & custom applications</a><a href="#services">Motion & campaign creative</a><a href="#contact">Redesigns & ongoing support</a></div>
    <div className="footer-connect"><span className="small-label">LET'S MAKE IT HAPPEN</span><a className="footer-contact-link" href="#contact">Discuss your next project<Icon name="arrow-up-right" size={17}/></a>{settings.contactEmail&&<a href={"mailto:"+settings.contactEmail}>{settings.contactEmail}</a>}{settings.contactPhone&&<a href={"tel:"+settings.contactPhone}>{settings.contactPhone}</a>}<Link to="/login">Sign in to your workspace</Link><Link to="/signup">Create your account</Link><span className="footer-connect-note">Design with intention.<br/>Build with care. Keep moving forward.</span></div>
   </div>
   <div className="footer-brand-finish"><div className="footer-word" aria-hidden="true">PIXODE</div><h3>Your vision. Our craft. Something exceptional.</h3><p>Branding, websites, apps and experiences made around your business.</p></div>
   <div className="footer-bottom"><span>&copy; {new Date().getFullYear()} Pixode. All rights reserved.</span><div><button onClick={()=>onLegal("privacy")}>Privacy</button><button onClick={()=>onLegal("terms")}>Project terms</button></div></div>
  </div>
 </footer>;
}