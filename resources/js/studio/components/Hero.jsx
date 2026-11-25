import { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import CardGrid from "./CardGrid";
export default function Hero({ settings, services = [], onService }) {
  const [query, setQuery] = useState("");
  const matches = services.filter(item => `${item.title} ${item.service} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const cards = matches;
  return (
    <section className="hero product-hero" id="home">
      <div className="container">
        <div className="hero-centered">
          <div className="hero-intro"><span className="status-dot" /> {settings.heroEyebrow}</div>
          <h1>{settings.heroLine1} <span>{settings.heroLine2}</span></h1>
          <p>{settings.heroDescription}</p>
          <form className="hero-search" role="search" onSubmit={event => { event.preventDefault(); document.getElementById('hero-capabilities')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'center'}); }}>
            <label className="hero-search-field"><Icon name="search" size={20} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="What would you like to build?" aria-label="Find a Pixode service" /></label>
            <Button type="submit" icon="arrow-right">Find your solution</Button>
          </form>
          <div className="hero-quick-links">Explore <button onClick={() => setQuery('Web')}>Websites</button><button onClick={() => setQuery('Mobile')}>Mobile apps</button><button onClick={() => setQuery('brand')}>Branding</button><button onClick={() => setQuery('')}>All services</button></div>
        </div>
        <CardGrid className="hero-catalog" id="hero-capabilities" label="Capabilities" resetKey={query}>
          {cards.map((item,index) => <a key={item.id} href="#contact" className={`capability-card tint-${index % 3}`} onClick={() => onService?.(item.service)}>
            <div className="capability-card-head"><span className="capability-icon"><Icon name={item.icon} size={23} /></span><div><h2>{item.service}</h2><span>Design &amp; development</span></div><span className="capability-open" aria-hidden="true"><Icon name="arrow-up-right" size={17}/></span></div>
            <p>{item.description}</p>
            <div className="capability-card-foot"><span><span className="status-dot" /> Built around your business</span></div>
          </a>)}
          {!cards.length && <div className="hero-empty"><h2>Something more specific?</h2><p>Tell us about your idea. We can help you choose the right approach.</p><Button href="#contact">Discuss your project</Button></div>}
        </CardGrid>
        <div className="hero-catalog-link"><a href="#contact">{settings.heroButton} <Icon name="arrow-right" size={17} /></a><span>From the first idea to the next release.</span></div>
      </div>
    </section>
  );
}