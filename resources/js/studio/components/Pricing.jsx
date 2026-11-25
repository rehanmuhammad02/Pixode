import { useState } from "react";
import SectionHeading from "./SectionHeading";
import Icon from "./Icon";
import Button from "./Button";
import { formatMoney } from "../lib/api";
const categories = {
  brand: "Brand & design",
  web: "Websites",
  commerce: "E-commerce",
  motion: "Motion",
  marketing: "Marketing",
};
export default function Pricing({ packages, note, onService }) {
  const [category, setCategory] = useState("brand");
  return (
    <section id="pricing" className="section pricing-section">
      <div className="container">
        <SectionHeading
          eyebrow="FIND YOUR STARTING POINT"
          title={
            <>
              Big ambition.
              <br />
              <span>A clear way forward.</span>
            </>
          }
          description={note}
        />
        <div
          className="filter-tabs pricing-tabs"
          aria-label="Package categories"
        >
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              aria-pressed={category === key}
              className={category === key ? "active" : ""}
              onClick={() => setCategory(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="pricing-grid">
          {packages
            .filter((p) => p.category === category)
            .map((plan, index) => (
              <article
                className={`price-card ${plan.featured ? "featured" : ""}`}
                key={plan.id}
              >
                <div className="price-top">
                  <span className="small-label">
                    {categories[category]}
                  </span>
                  {plan.featured && (
                    <span className="featured-pill">THE SWEET SPOT</span>
                  )}
                </div>
                <h3>{plan.title}</h3>
                <p>{plan.description}</p>
                <div className="price-amount">
                  {formatMoney(plan.price)}
                  <span>starting from</span>
                </div>
                <Button
                  href="#contact"
                  variant={plan.featured ? "primary" : "secondary"}
                  onClick={() => onService(plan.service)}
                >
                  Let’s build it
                </Button>
                <div className="price-divider" />
                <span className="small-label">WHAT’S INCLUDED</span>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
        <div className="pricing-footnote">
          <Icon name="message" size={18} />
          <span>
            Have something different in mind? Let’s shape a proposal around your
            project.
          </span>
          <a href="#contact">
            Discuss your idea <Icon name="arrow-up-right" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
