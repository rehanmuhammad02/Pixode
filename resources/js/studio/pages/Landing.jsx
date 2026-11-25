import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStudio } from "../context/StudioContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Portfolio from "../components/Portfolio";
import Pricing from "../components/Pricing";
import Contact from "../components/Contact";
import CardGrid from "../components/CardGrid";
import FeedbackStrip from "../components/FeedbackStrip";
import PlatformShowcase from "../components/PlatformShowcase";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import ProjectUpgradeVisual from "../components/ProjectUpgradeVisual";
import SectionHeading from "../components/SectionHeading";
import Brand from "../components/Brand";
import Button from "../components/Button";
import Icon from "../components/Icon";

export default function Landing() {
  const { content, offline, refreshContent } = useStudio();
  const {
    settings,
    projects,
    services,
    testimonials,
    packages,
    faqs,
    benefits,
  } = content;
  const [service, setService] = useState("");
  const legal = useRef(null);
  const [legalType, setLegalType] = useState("privacy");
  const location = useLocation();
  useEffect(() => {
    document.title = "Pixode Thoughtfully designed. Carefully built.";
    if (location.hash)
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      );
  }, [location.hash]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero settings={settings} services={services} onService={setService} />
        {offline && (
          <div className="connection-note container" role="status">
            Showing the studio preview while the connection is unavailable.{" "}
            <button onClick={refreshContent}>Try again</button>
          </div>
        )}
        <Portfolio projects={projects} workNote={settings.workNote} />
        <section className="section services-section" id="services">
          <div className="container">
            <SectionHeading
              eyebrow="ALL THE RIGHT CAPABILITIES"
              title={
                <>
                  One creative partner.
                  <br />
                  <span>Every part of the journey.</span>
                </>
              }
              description="From your first idea to your next release. Design, development and the details in between."
            />
            <CardGrid className="services-grid" label="Services">
              {services.map((item, index) => (
                <a
                  href="#contact"
                  key={item.id}
                  className="service-card"
                  onClick={() => setService(item.service)}
                >
                  <div className="service-top">
                    <span className="service-icon">
                      <Icon name={item.icon} size={26} />
                    </span>
                    <span>
                      
                      <Icon name="arrow-up-right" size={18} />
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="service-tags">{item.tags}</div>
                  <span className="service-link">
                    Explore the possibilities
                    <Icon name="arrow-right" size={17} />
                  </span>
                </a>
              ))}
            </CardGrid>
            <PlatformShowcase platformList={settings.platformList} />
          </div>
        </section>
        <Pricing
          packages={packages}
          note={settings.pricingNote}
          onService={setService}
        />
        <section className="section container process-section" id="process">
          <SectionHeading
            eyebrow="HOW WE GET THERE"
            title={
              <>
                A considered process.
                <br />
                <span>A better outcome.</span>
              </>
            }
            description="A clear plan, working previews and your feedback at every meaningful step."
          />
          <div className="process-grid">
            {[
              [
                "Discover",
                "We understand your business, your customers and the outcome you want to achieve.",
                "message",
              ],
              [
                "Shape",
                "We agree the scope and timeline, then explore design directions together.",
                "pen",
              ],
              [
                "Build",
                "We turn the direction into a working product, share progress and refine the details.",
                "code",
              ],
              [
                "Launch & evolve",
                "We test user journeys and devices, help you launch and hand over everything clearly.",
                "rocket",
              ],
            ].map(([title, copy, icon], index) => (
              <article key={title}>
                <div className="process-number">
                  
                  <Icon name={icon} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section feedback-section" id="feedback">
          <div className="container">
            <SectionHeading
              eyebrow={testimonials.some(r=>/illustrative/i.test(r.role||""))?"FEEDBACK EXAMPLES":"CLIENT FEEDBACK"}
              title={settings.feedbackHeading}
              description={testimonials.some(r=>/illustrative/i.test(r.role||""))?"Perspectives on brand, website and campaign projects.":settings.feedbackNote}
            />
          </div>
          <FeedbackStrip>
            {testimonials.map((review) => (
              <figure className="review-card" key={review.id}>
                <div
                  className="review-stars"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: review.rating }, (_, i) => (
                    <Icon name="star" key={i} size={17} />
                  ))}
                </div>
                <blockquote>“{review.quote}”</blockquote>
                <figcaption>
                  <span className="review-avatar">
                    {review.avatar ? (
                      <img src={review.avatar} alt="" loading="lazy" />
                    ) : (
                      review.name.slice(0, 1)
                    )}
                  </span>
                  <div>
                    <strong>{review.name}</strong>
                    {! /illustrative|not a client endorsement/i.test(review.role||"") && <span>{review.role}</span>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </FeedbackStrip>
        </section>
        <section className="section container studio-section" id="studio">
          <div className="studio-art studio-image-only"><img src={settings.logo || "/assets/pixode-logo.png"} alt="Pixode studio" width="1254" height="1254" loading="lazy"/></div>
          <div className="studio-copy">
            <span className="eyebrow">A LITTLE ABOUT US</span>
            <h2>{settings.studioHeading}</h2>
            <p>{settings.studioParagraph1}</p>
            <p>{settings.studioParagraph2}</p>
            <Button href="#contact" variant="secondary">
              Meet your creative partner
            </Button>
          </div>
        </section>
        <section className="section container benefits-section">
          <SectionHeading
            eyebrow="WORKING WITH PIXODE"
            title={
              <>
                Good collaboration.
                <br />
                <span>Built into every project.</span>
              </>
            }
          />
          <CardGrid className="benefits-grid" label="Partnership benefits">
            {benefits.map((item) => (
              <article key={item.id}>
                <span className="benefit-icon">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </CardGrid>
          <div className="support-panel support-reimagined">
            <ProjectUpgradeVisual />
            <div className="support-content"><span className="eyebrow">YOUR NEXT IMPROVEMENT STARTS HERE</span><h3>{settings.supportHeading}</h3><p>{settings.supportDescription}</p><div className="support-tags"><span>Redesign & usability</span><span>Performance & fixes</span><span>Features & integrations</span></div><Button href="#contact" onClick={()=>setService("Maintenance & support")}>Let&apos;s improve your project</Button></div>
          </div>
        </section>
        <section className="section container faq-section" id="faq">
          <div>
            <span className="eyebrow">A FEW THINGS YOU MAY BE WONDERING</span>
            <h2>
              Good questions.
              <br />
              <span>Clear answers.</span>
            </h2>
            <a className="text-button" href="#contact">
              Something else on your mind?
              <Icon name="arrow-up-right" size={18} />
            </a>
          </div>
          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.id}>
                <summary>
                  {item.question}
                  <Icon name="plus" size={20} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <Contact
          settings={settings}
          service={service}
          onService={setService}
          services={[
            ...new Set([
              ...services.map((s) => s.service),
              "The full experience",
            ]),
          ]}
        />
      </main>
      <Footer settings={settings} onLegal={type=>{setLegalType(type);legal.current.showModal();}} />
      <BackToTop />
      <dialog ref={legal} className="legal-dialog">
        <button
          className="dialog-close icon-button"
          aria-label="Close information"
          onClick={() => legal.current.close()}
        >
          <Icon name="close" />
        </button>
        <span className="eyebrow">PIXODE STUDIO</span>
        <h2>
          {legalType === "privacy"
            ? "Your details, handled carefully."
            : "A clear way to work together."}
        </h2>
        <p>
          {legalType === "privacy"
            ? "We store the details you submit so we can manage your account and respond to your project inquiry. Passwords are stored as hashes. Signing in uses a session cookie. Email verification is delivered through our email provider when configured; choosing Google sign-in shares your name and verified email with Pixode. Contact us through the project form for account or data requests."
            : "The scope, price, schedule, revision rounds, deliverables and ownership terms are agreed in your individual project proposal before work begins. Portfolio concepts and example packages are starting points. Contact Pixode to discuss the details of your project."}
        </p>
      </dialog>
    </>
  );
}

