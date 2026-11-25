import { useState } from "react";
import Button from "./Button";
import Icon from "./Icon";
import { api } from "../lib/api";
export default function Contact({ settings, service, onService, services }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setError("");
    try {
      await api("/api/contact", {
        method: "POST",
        body: Object.fromEntries(new FormData(form)),
      });
      setState("success");
      form.reset();
      onService("");
    } catch (error) {
      setError(error.message);
      setState("idle");
    }
  };
  return (
    <section className="section container contact-section" id="contact">
      <div className="contact-copy">
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h2>{settings.contactHeading}</h2>
        <p>{settings.contactDescription}</p>
        <div className="contact-note">
          <Icon name="message" />
          <div>
            <strong>It starts with a conversation.</strong>
            <span>
              Share your idea. We’ll help define the scope, approach and next
              steps.
            </span>
          </div>
        </div>
        {settings.contactEmail && (
          <a className="contact-email" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
            <Icon name="arrow-up-right" />
          </a>
        )}
      </div>
      <div className="contact-portal">
        {state === "success" ? (
          <div className="contact-success" role="status">
            <span className="success-icon">
              <Icon name="success" size={40} />
            </span>
            <span className="eyebrow">IDEA RECEIVED</span>
            <h3>A good beginning.</h3>
            <p>
              Your inquiry has been saved. The Pixode team will review your
              project details.
            </p>
            <Button
              onClick={() => setState("idle")}
              variant="secondary"
              icon="plus"
            >
              Share another idea
            </Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="portal-heading">
              <span className="small-label">LET’S MAKE SOMETHING MATTER</span>
              <Icon name="arrow-up-right" size={24} />
            </div>
            <div className="contact-fields">
              <label className="floating-field">
                <input
                  name="name"
                  placeholder=" "
                  autoComplete="name"
                  required
                  maxLength="100"
                />
                <span>Your name</span>
              </label>
              <label className="floating-field">
                <input
                  name="email"
                  type="email"
                  placeholder=" "
                  autoComplete="email"
                  required
                  maxLength="254"
                />
                <span>Email address</span>
              </label>
              <label className="floating-field full">
                <input
                  name="company"
                  placeholder=" "
                  autoComplete="organization"
                  maxLength="150"
                />
                <span>Company / brand (optional)</span>
              </label>
              <label className="select-field full">
                <span>What are you looking for?</span>
                <select
                  name="service"
                  required
                  value={service}
                  onChange={(e) => onService(e.target.value)}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {services.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="floating-field full">
                <textarea
                  name="message"
                  placeholder=" "
                  required
                  minLength="10"
                  maxLength="5000"
                  rows="4"
                />
                <span>Tell us a little about your project</span>
              </label>
            </div>
            <label className="honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex="-1" autoComplete="off" />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={state === "sending"}
              icon={state === "sending" ? "loader" : "arrow-up-right"}
            >
              {state === "sending"
                ? "Sending your idea…"
                : "Start a conversation"}
            </Button>
            <p className="form-trust">
              <Icon name="shield" size={13} />
              Your details stay private. Your ideas stay yours.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
