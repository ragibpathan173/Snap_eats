import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchRestaurants } from "../api/client.js";

const storySections = {
  mission: {
    body: [
      "Our mission is to make neighborhood food ordering simple, dependable, and fast for people who do not want friction in the middle of a busy day.",
      "From restaurant discovery to checkout and support, every detail at SnapEats should reduce effort, increase confidence, and feel worth returning to."
    ],
    heading: "Convenience that quietly improves everyday life.",
    image: "images/about/mission-rider.png",
    label: "Mission"
  },
  vision: {
    body: [
      "We see SnapEats becoming the most trusted hyperlocal food brand for students, professionals, and families who want clarity, speed, and reliable value.",
      "The long-term goal is not just more orders. It is a product experience that feels personal, transparent, and memorable wherever it is used."
    ],
    heading: "A trusted food platform that feels local in every city.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    label: "Vision"
  },
  values: {
    body: [
      "SnapEats values user empathy, clean product thinking, and systems that stay understandable as they grow more capable.",
      "We care about honest pricing, dependable flows, and product decisions that make both customers and restaurant partners feel supported."
    ],
    heading: "Ship with empathy, honesty, and operational clarity.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    label: "Values"
  }
};

const journeySteps = [
  { copy: "We started with streamlined restaurant discovery, menu browsing, and fast ordering fundamentals.", icon: "01", title: "Launch of the first SnapEats ordering flows", year: "2024" },
  { copy: "Menus, categories, and neighborhood-friendly browsing patterns were refined to feel more useful every day.", icon: "02", title: "Local catalog and cuisine depth expanded", year: "2024" },
  { copy: "Email and phone OTP flows helped make onboarding, recovery, and account actions feel safer and cleaner.", icon: "03", title: "OTP-first identity and account trust", year: "2025" },
  { copy: "Coupons, saved methods, wallets, UPI, and order success tracking brought stronger conversion quality.", icon: "04", title: "Checkout and payment journeys matured", year: "2025" },
  { copy: "SnapEatPro, help flows, order management, and delete-account controls made the product more complete.", icon: "05", title: "Membership, support, and account tools scaled up", year: "2026" },
  { copy: "The brand narrative evolved into a more polished web experience with stronger visuals, hierarchy, and clarity.", icon: "06", title: "About SnapEats became a product story", year: "2026" }
];

const peopleGroups = {
  board: [
    { copy: "Guides long-range positioning, user experience maturity, and the systems behind a durable consumer brand.", name: "Neeraj Malhotra", role: "Product and Brand Advisory", tone: "tone-charcoal" },
    { copy: "Supports city-level growth planning, restaurant network strategy, and local go-to-market discipline.", name: "Ritika Sen", role: "Market Expansion Advisor", tone: "tone-berry" },
    { copy: "Helps shape scalable technical decisions as SnapEats grows across identity, checkout, and service quality.", name: "Kunal Desai", role: "Platform Architecture Advisor", tone: "tone-ember" },
    { copy: "Advises on pricing, operational efficiency, and sustainable growth across offers, subscriptions, and delivery costs.", name: "Megha Iyer", role: "Finance and Unit Economics", tone: "tone-navy" }
  ],
  management: [
    { copy: "Owns the end-to-end product direction, platform architecture, and the customer experience details that shape SnapEats.", name: "Ragib Ali Khan", role: "Founder and Product Engineer", tone: "tone-ember" },
    { copy: "Focuses on order lifecycle quality, escalation handling, and operational consistency across delivery moments.", name: "Aarav Mehta", role: "Operations and Reliability", tone: "tone-navy" },
    { copy: "Builds restaurant success programs, local growth experiments, and the discovery loops that improve retention.", name: "Sara Khan", role: "Growth and Partnerships", tone: "tone-sand" },
    { copy: "Improves payment clarity, conversion journeys, and the trust-building moments that happen around checkout.", name: "Vihaan Rao", role: "Checkout and Commerce", tone: "tone-olive" }
  ]
};

const blogPosts = [
  { accent: "accent-apricot", date: "March 14, 2026", coverTitle: "Inside Faster Discovery", tag: "Product Story", title: "How SnapEats is designing cleaner discovery for neighborhood favorites" },
  { accent: "accent-cream", date: "March 05, 2026", coverTitle: "Local Brand Momentum", tag: "Growth Story", title: "What makes restaurant onboarding feel faster, clearer, and more useful" },
  { accent: "accent-sand", date: "February 18, 2026", coverTitle: "Trust In Checkout", tag: "Experience Story", title: "From OTP to payment confirmation: shaping reliable customer confidence" }
];

const pressItems = [
  { accent: "accent-apricot", copy: "A quick overview of the product direction, city-ready discovery improvements, and the reliability work shaping everyday ordering.", date: "April 02, 2026", coverTitle: "Platform Growth", tag: "Press Update", title: "SnapEats expands its product story around local restaurant discovery and smoother repeat ordering" },
  { accent: "accent-cream", copy: "This update outlines how partner onboarding, menu readiness, and support loops are being framed for long-term quality.", date: "March 22, 2026", coverTitle: "Partner Focus", tag: "Partnership Note", title: "Restaurant onboarding at SnapEats is being designed for faster setup, clearer expectations, and stronger menu presentation" },
  { accent: "accent-sand", copy: "The emphasis remains on clarity, dependable ordering flows, and everyday convenience that feels premium without being complicated.", date: "March 08, 2026", coverTitle: "Built Local", tag: "Brand Note", title: "SnapEats continues to position itself as a local-first food commerce experience with clean, trusted UX" }
];

function getInitials(name) {
  return name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2);
}

function SnapEatsLogo() {
  return (
    <div className="about-qr-art" aria-hidden="true">
      <div className="about-qr-logo">
        <span className="about-qr-logo-mark">
          <svg viewBox="0 0 64 64">
            <path d="M30.9 11.7c0-1.1.9-2 2-2s2 .9 2 2v2.1h-4z" fill="currentColor" />
            <path d="M13.4 33.4a18.6 18.6 0 0 1 37.2 0z" fill="currentColor" />
            <path d="M20.6 27.5c1.8-4.2 4.3-7.1 7.4-8.3 2-.8 3.8 1.3 2.6 3-1.7 2.3-2.8 5-3.4 7.9h-6.6z" fill="#ffffff" />
            <rect x="8.8" y="33.1" width="46.4" height="3.7" rx="1.85" fill="currentColor" />
            <path d="M16.4 39.8h31.2a2.5 2.5 0 0 1 0 5H16.4a2.5 2.5 0 0 1 0-5z" fill="currentColor" />
          </svg>
        </span>
        <strong className="about-qr-logo-word">SnapEats</strong>
      </div>
    </div>
  );
}

function CorporateModal({ onClose, open }) {
  const [storyId, setStoryId] = useState("mission");
  const [peopleGroupId, setPeopleGroupId] = useState("management");
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [metrics, setMetrics] = useState({ categories: 0, restaurants: 0 });
  const peopleTrackRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    if (!open) {
      return undefined;
    }

    setStoryId("mission");
    setPeopleGroupId("management");
    setJourneyIndex(0);
    document.body.classList.add("modal-open");

    Promise.all([fetchCategories(), fetchRestaurants()])
      .then(([categories, restaurants]) => {
        if (!ignore) {
          setMetrics({ categories: categories.length, restaurants: restaurants.length });
        }
      })
      .catch(() => {
        if (!ignore) {
          setMetrics({ categories: 0, restaurants: 0 });
        }
      });

    return () => {
      ignore = true;
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const activeStory = storySections[storyId];
  const activeJourney = journeySteps[journeyIndex];
  const journeyCards = [-1, 0, 1].map((offset) => {
    const index = (journeyIndex + offset + journeySteps.length) % journeySteps.length;

    return { step: journeySteps[index], state: offset === 0 ? "active" : "side" };
  });
  const activePeople = peopleGroups[peopleGroupId];
  const metricCards = [
    [`${metrics.restaurants}+`, "restaurant partners"],
    [`${metrics.categories}+`, "live categories"],
    ["0+", "delivered orders"],
    ["0+", "saved payment methods"]
  ];

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function shiftJourney(offset) {
    setJourneyIndex((currentIndex) => (currentIndex + offset + journeySteps.length) % journeySteps.length);
  }

  function scrollPeople(direction) {
    const track = peopleTrackRef.current;

    if (track) {
      track.scrollBy({ behavior: "smooth", left: track.clientWidth * 0.82 * direction });
    }
  }

  return (
    <div className="modal open react-corporate-modal" id="corporateModal" role="dialog" aria-modal="true" aria-label="About SnapEats">
      <div className="modal-content corporate-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close About SnapEats">
          &times;
        </button>

        <div className="about-shell">
          <section className="about-hero">
            <div className="about-container about-hero-grid">
              <div className="about-hero-copy">
                <p className="about-kicker">About SnapEats</p>
                <h1>We build food delivery experiences that feel fast, local, and trusted.</h1>
                <p>SnapEats combines product thinking, operational clarity, and neighborhood discovery into one platform built for everyday convenience. This page tells that story with a more intentional web experience inspired by premium consumer brands, but written for SnapEats.</p>
                <div className="about-button-row">
                  <button className="about-primary-button" onClick={() => scrollToSection("aboutKnowUsSection")} type="button">Explore our story</button>
                  <button className="about-secondary-button" onClick={() => scrollToSection("aboutContactSection")} type="button">Get in touch</button>
                </div>
              </div>
              <div className="about-hero-stage">
                <article className="about-hero-feature">
                  <span className="about-hero-feature-kicker">Now showing</span>
                  <h3>About SnapEats</h3>
                  <p>Original brand storytelling with stronger visual rhythm, better spacing, and a cleaner landing-page feel.</p>
                </article>
                <div className="about-hero-metric-grid">
                  {metricCards.map(([value, label]) => <article className="about-hero-metric-card" key={label}><strong>{value}</strong><span>{label}</span></article>)}
                </div>
              </div>
            </div>
          </section>

          <section className="about-section" id="aboutKnowUsSection">
            <div className="about-container">
              <div className="about-title-row"><span></span><h2>Get To Know Us</h2><span></span></div>
              <div className="about-know-grid">
                <div className="about-story-tabs">
                  {Object.entries(storySections).map(([id, story]) => (
                    <button className={`about-story-tab ${storyId === id ? "active" : ""}`} key={id} onClick={() => setStoryId(id)} type="button">
                      <span>{story.label}</span><small>{storyId === id ? "->" : ""}</small>
                    </button>
                  ))}
                </div>
                <div className="about-story-copy"><h3>{activeStory.heading}</h3>{activeStory.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                <div className="about-story-visual"><img src={activeStory.image} alt={`${activeStory.label} story for SnapEats`} /></div>
              </div>
            </div>
          </section>

          <section className="about-section about-section-plain">
            <div className="about-container">
              <div className="about-title-row"><span></span><h2>Industry Pioneer</h2><span></span></div>
              <div className="about-pioneer-grid">
                <div className="about-pioneer-copy"><p>SnapEats is being shaped as a modern food commerce brand with a product-first mindset. We care about discovery, checkout confidence, post-order clarity, and account trust as one connected experience rather than separate screens.</p><p>The goal is to make convenience feel premium without becoming complicated. That means faster choices, cleaner journeys, and systems that stay useful as the platform grows.</p></div>
                <div className="about-pioneer-visual"><img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80" alt="SnapEats industry pioneer visual" /></div>
              </div>
              <div className="about-pioneer-metric-grid">
                {[[`${metrics.restaurants}+`, "Restaurant partners"], [`${metrics.categories}+`, "Curated categories"], ["0+", "Orders delivered"], ["24/7", "Product iteration mindset"]].map(([value, label]) => <article className="about-pioneer-metric" key={label}><strong>{value}</strong><span>{label}</span></article>)}
              </div>
            </div>
          </section>

          <section className="about-section about-section-dark">
            <div className="about-container">
              <div className="about-title-row about-title-row-dark"><span></span><h2>The SnapEats Journey</h2><span></span></div>
              <div className="about-journey-shell">
                <div className="about-journey-head"><button className="about-icon-button" onClick={() => shiftJourney(-1)} type="button" aria-label="Previous journey milestone">&larr;</button><div className="about-journey-year">{activeJourney.year}</div><button className="about-icon-button" onClick={() => shiftJourney(1)} type="button" aria-label="Next journey milestone">&rarr;</button></div>
                <div className="about-journey-stage">
                  {journeyCards.map(({ state, step }) => <article className={`about-journey-card ${state}`} key={`${state}-${step.icon}`}><span className="about-journey-card-icon">{step.icon}</span><div className="about-journey-card-copy"><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}
                </div>
                <div className="about-journey-dots">{journeySteps.map((step, index) => <button className={`about-journey-dot ${journeyIndex === index ? "active" : ""}`} key={step.icon} onClick={() => setJourneyIndex(index)} type="button" aria-label={`Show ${step.year} milestone`}></button>)}</div>
              </div>
            </div>
          </section>

          <section className="about-section about-section-plain" id="aboutLeadershipSection">
            <div className="about-container">
              <div className="about-business-head">
                <div><p className="about-section-label">Leadership &amp; Team</p><h2>People Building SnapEats</h2></div>
                <div className="about-business-controls"><div className="about-people-tabs"><button className={`about-people-tab ${peopleGroupId === "management" ? "active" : ""}`} onClick={() => setPeopleGroupId("management")} type="button">Core team</button><button className={`about-people-tab ${peopleGroupId === "board" ? "active" : ""}`} onClick={() => setPeopleGroupId("board")} type="button">Board advisors</button></div><div className="about-arrow-group"><button className="about-icon-button about-arrow-button active" onClick={() => scrollPeople(-1)} type="button" aria-label="Scroll leadership cards left">&larr;</button><button className="about-icon-button about-arrow-button active" onClick={() => scrollPeople(1)} type="button" aria-label="Scroll leadership cards right">&rarr;</button></div></div>
              </div>
              <div className="about-people-track" ref={peopleTrackRef}>{activePeople.map((person) => <article className="about-person-card" key={person.name}><div className={`about-person-portrait ${person.tone}`}><span>{getInitials(person.name)}</span></div><div className="about-person-copy"><h3>{person.name}</h3><p className="about-person-role">{person.role}</p><p>{person.copy}</p></div></article>)}</div>
            </div>
          </section>

          <section className="about-section" id="aboutCareersSection">
            <div className="about-container">
              <div className="about-title-row"><span></span><h2>Careers At SnapEats</h2><span></span></div>
              <div className="about-careers-grid"><div className="about-careers-copy"><p>Working at SnapEats means building with ownership. Product, operations, growth, and reliability all move closely together, so good ideas turn into product improvements quickly.</p><p>Whether you care about engineering details, customer journeys, restaurant success, or brand systems, there is room to create visible impact here.</p><div className="about-button-row"><Link className="about-primary-button" onClick={onClose} to="/account">Know more</Link></div></div><div className="about-careers-visual"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80" alt="SnapEats careers visual" /></div></div>
            </div>
          </section>

          <section className="about-section about-section-plain" id="aboutBlogSection">
            <div className="about-container"><div className="about-title-row"><span></span><h2>SnapEats Blog</h2><span></span></div><div className="about-blog-grid">{blogPosts.map((post) => <article className="about-blog-card" key={post.title}><div className={`about-blog-cover ${post.accent}`}><span className="about-blog-tag">{post.tag}</span><strong>{post.coverTitle}</strong></div><div className="about-blog-body"><p className="about-blog-date">{post.date}</p><h3>{post.title}</h3><a className="about-inline-button" href="mailto:stories@snap-eats.com?subject=SnapEats%20Story" target="_blank" rel="noopener noreferrer">Read more</a></div></article>)}</div><div className="about-center-action"><a className="about-primary-button" href="mailto:stories@snap-eats.com?subject=SnapEats%20Blog" target="_blank" rel="noopener noreferrer">Explore</a></div></div>
          </section>

          <section className="about-section" id="aboutPressSection">
            <div className="about-container"><div className="about-title-row"><span></span><h2>Press Room</h2><span></span></div><div className="about-blog-grid">{pressItems.map((item) => <article className="about-blog-card" key={item.title}><div className={`about-blog-cover ${item.accent}`}><span className="about-blog-tag">{item.tag}</span><strong>{item.coverTitle}</strong></div><div className="about-blog-body"><p className="about-blog-date">{item.date}</p><h3>{item.title}</h3><p className="about-blog-snippet">{item.copy}</p><a className="about-inline-button" href="mailto:press@snap-eats.com?subject=SnapEats%20Press%20Enquiry" target="_blank" rel="noopener noreferrer">Contact press</a></div></article>)}</div><div className="about-center-action"><a className="about-primary-button" href="mailto:press@snap-eats.com?subject=SnapEats%20Press%20Desk" target="_blank" rel="noopener noreferrer">Reach the press desk</a></div></div>
          </section>

          <section className="about-app-band"><div className="about-container about-app-grid"><div className="about-app-copy"><div className="about-app-brand"><span className="about-app-brand-mark">S</span><span>SnapEats</span></div><h2>Get the SnapEats App now!</h2><p>Discover cleaner ordering flows, faster repeat checkout, and offers that feel more personal to the way you eat.</p></div><div className="about-app-visual"><div className="about-phone-frame"><div className="about-phone-notch"></div><div className="about-phone-screen"><SnapEatsLogo /><span>Scan to explore</span></div></div></div></div></section>

          <section className="about-section" id="aboutContactSection"><div className="about-container"><div className="about-title-row"><span></span><h2>Get In Touch With Us</h2><span></span></div><div className="about-contact-grid"><div className="about-contact-copy"><h3>Head Office Address:</h3><p>SnapEats, Jamia Nagar, New Delhi, Delhi 110025</p><p>Built as a modern food commerce experience for product quality, local discovery, and trusted convenience.</p><h3>Project Owner:</h3><p>Ragib Ali Khan</p><p>ragibpathan173@gmail.com</p><h3>For help and support:</h3><p>Email: support@snapeats.in</p></div><div className="about-contact-map"><iframe title="SnapEats contact map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Jamia+Nagar,+New+Delhi&output=embed"></iframe></div></div></div></section>
        </div>
      </div>
    </div>
  );
}

export default CorporateModal;
