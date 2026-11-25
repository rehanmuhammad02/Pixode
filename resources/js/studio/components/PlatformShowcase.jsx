const brands={
  WordPress:{logo:"wordpress.png",url:"https://wordpress.org/",detail:"Content & publishing",mark:true},
  WooCommerce:{logo:"woocommerce.png",url:"https://woocommerce.com/",detail:"Flexible online stores"},
  Shopify:{logo:"shopify.svg",url:"https://www.shopify.com/",detail:"Commerce experiences"},
  Webflow:{logo:"webflow.svg",url:"https://webflow.com/",detail:"Design-led websites"},
  Wix:{logo:"wix.jpg",url:"https://www.wix.com/",detail:"Business websites"},
  Squarespace:{logo:"squarespace.jpg",url:"https://www.squarespace.com/",detail:"Beautiful, easy-to-manage sites"},
};
export default function PlatformShowcase({platformList}) {
 return <section className="platform-showcase" aria-labelledby="platform-heading">
   <div className="platform-showcase-heading"><div><span className="eyebrow">YOUR BUSINESS. THE RIGHT PLATFORM.</span><h3 id="platform-heading">Great ideas deserve<br/><span>the right foundation.</span></h3></div><p>From a beautifully built website to a store ready for its next chapter. We choose the platform around your goals and how you want to work.</p></div>
   <div className="platform-logo-grid">{platformList.split("\n").filter(Boolean).map(name=>{
     const brand=brands[name];
     if(!brand) return <div className="platform-logo-card custom-platform" key={name}><div className="platform-logo-plate platform-preview-image"><img src={/mobile/i.test(name)?"/assets/work-orbit.svg":"/assets/work-atlas.svg"} alt={/mobile/i.test(name)?"Mobile application interface preview":"Custom web application dashboard preview"} width="1000" height="750" loading="lazy"/></div><strong>{name}</strong><span>Purpose-built around you</span></div>;
     return <a className="platform-logo-card" href={brand.url} target="_blank" rel="noopener noreferrer" key={name}><div className={"platform-logo-plate "+(brand.mark?"platform-mark":"")}><img src={"/assets/platforms/"+brand.logo} alt={name+" official logo"} width={160} height={64} loading="lazy"/></div><strong>{name}</strong><span>{brand.detail}</span></a>;
   })}</div>
 </section>;
}