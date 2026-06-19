import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const helpTopics = [
  {
    id: "orders",
    label: "Help & Support",
    meta: "Tracking, cancellations, refunds",
    description: "Resolve order issues quickly with live status, refund tracking, and item support.",
    actions: [
      { label: "Open cart", type: "cart" },
      { href: "mailto:support@snapeats.in?subject=Order%20help", label: "Email support" }
    ],
    faqs: [
      ["Where is my order?", "Open Orders to see live status, ETA, and rider details once assigned."],
      ["I received a wrong or missing item", "Report the issue within 30 minutes of delivery to get a quick resolution."],
      ["Can I cancel my order?", "Cancellation is available until the restaurant confirms preparation."],
      ["When will I get a refund?", "Refunds are typically processed within 3-5 business days."]
    ],
    tips: [
      "Keep your phone reachable for the delivery OTP.",
      "Use no-contact delivery for a safer handoff.",
      "Add delivery notes to help the partner find you faster."
    ]
  },
  {
    id: "one",
    label: "SnapEats One",
    meta: "Membership, benefits, savings",
    description: "Learn how the SnapEats One membership improves everyday ordering with delivery savings and priority support.",
    actions: [
      { label: "View membership", to: "/account" },
      { label: "Terms & policies", topic: "legal" }
    ],
    faqs: [
      ["What are the benefits?", "Members get free delivery on eligible orders, partner discounts, and faster support access."],
      ["How do I renew?", "Your plan can auto-renew unless you cancel it before the renewal date."],
      ["Is there a trial?", "Limited trials can appear during seasonal campaigns and onboarding offers."],
      ["Can I cancel anytime?", "Yes, you can manage the plan from the Account section."]
    ],
    tips: [
      "Check plan cards for minimum order value and delivery benefit limits.",
      "Use member offers during peak dining hours for better savings.",
      "Keep your account active so perks continue without interruption."
    ]
  },
  {
    id: "genie",
    label: "SnapEats Genie",
    meta: "Quick pickups and local errands",
    description: "SnapEats Genie is a hyperlocal convenience service for time-sensitive pickups, drop-offs, and everyday errands.",
    actions: [
      { href: "mailto:hello@snap-eats.com?subject=SnapEats%20Genie%20Interest", label: "Notify me" },
      { href: "mailto:partners@snap-eats.com?subject=SnapEats%20Genie%20Partnership", label: "Partner with Genie" }
    ],
    faqs: [
      ["What is SnapEats Genie?", "It is a convenience-first service concept for sending or receiving essentials across nearby neighborhoods."],
      ["What can I send?", "Common use cases include documents, lunch boxes, small packages, store pickups, and essentials."],
      ["How is pricing handled?", "Pricing is usually distance-led, with a base fee and clear surcharges when applicable."],
      ["Is Genie live in every city?", "Availability depends on operational readiness and partner coverage in that location."]
    ],
    tips: [
      "Package items securely and mention landmark details clearly.",
      "Use Genie for lightweight, non-restricted items only.",
      "Keep pickup and drop contacts reachable during the trip."
    ]
  },
  {
    id: "general",
    label: "General issues",
    meta: "Login, payments, coupons",
    description: "Troubleshoot account access, payment failures, OTP issues, or coupon problems.",
    actions: [
      { label: "Account settings", to: "/account" },
      { label: "Payment methods", to: "/account" }
    ],
    faqs: [
      ["OTP not received", "Wait 30 seconds and tap Resend OTP. Check spam for email OTPs."],
      ["Payment failed but money deducted", "Refunds are initiated automatically within 24 hours in most cases."],
      ["Coupon not working", "Verify the minimum order value, validity window, and payment restrictions."],
      ["App feels slow", "Refresh the page or clear the browser cache to restart the session cleanly."]
    ],
    tips: [
      "Use UPI for faster payment confirmations.",
      "Keep your profile details updated for smoother support handling.",
      "Apply coupons only after checking restaurant and cart eligibility."
    ]
  },
  {
    id: "partner",
    label: "Partner with us",
    meta: "Restaurant partnerships",
    description: "Restaurants can onboard with SnapEats for delivery visibility, better menu presentation, and city-level growth support.",
    actions: [
      { href: "mailto:partners@snap-eats.com?subject=Partner%20with%20SnapEats", label: "Start partnership" },
      { label: "Business inquiries", topic: "business" }
    ],
    faqs: [
      ["What documents are required?", "FSSAI license, bank details, GST details where applicable, and menu pricing are usually required."],
      ["How long does onboarding take?", "A typical onboarding cycle can complete in 3-5 business days once documents are verified."],
      ["How do payouts work?", "Payouts are settled on a regular cycle with a statement for order and commission reconciliation."],
      ["Who manages menu updates?", "Menus can be updated through the partner workflow as items, prices, or availability change."]
    ],
    tips: [
      "Upload strong food images and keep descriptions crisp.",
      "Use realistic prep times to improve ETA trust.",
      "Bundle high-conversion combos for better order value."
    ]
  },
  {
    id: "ride",
    label: "Ride with us",
    meta: "Delivery partner onboarding",
    description: "Explore how delivery partners can ride with SnapEats, manage shifts, and earn with reliable last-mile operations.",
    actions: [
      { href: "mailto:riders@snap-eats.com?subject=Ride%20with%20SnapEats", label: "Apply to ride" },
      { label: "Safety support", topic: "safety" }
    ],
    faqs: [
      ["Who can apply?", "Eligible riders usually need valid identity documents, a working phone, and a compliant delivery vehicle where required."],
      ["How are earnings calculated?", "Earnings are typically based on completed trips, distance, incentives, and peak-hour programs."],
      ["Can I choose my schedule?", "Flexible availability is supported in most partner-led delivery models, depending on city operations."],
      ["What support is available during a trip?", "Support channels help with order issues, address confusion, rider safety, and escalation handling."]
    ],
    tips: [
      "Keep phone battery, maps, and payment readiness checked before going online.",
      "Use clear delivery notes and call only when needed.",
      "Report unsafe locations or unusual order situations immediately."
    ]
  },
  {
    id: "business",
    label: "Business inquiries",
    meta: "Corporate, media, brand conversations",
    description: "Use this route for enterprise partnerships, brand campaigns, campus rollouts, catering, or broader business conversations with SnapEats.",
    actions: [
      { href: "mailto:business@snap-eats.com?subject=SnapEats%20Business%20Inquiry", label: "Email business desk" },
      { href: "press.html", label: "Open press room" }
    ],
    faqs: [
      ["What type of inquiries fit here?", "Corporate catering, B2B dining programs, strategic partnerships, activations, and media collaborations fit here."],
      ["How should I write the request?", "Include your company name, city, estimated requirement, timeline, and the outcome you are looking for."],
      ["Do you support campus or office launches?", "Yes, location-specific launches and curated food access programs can be discussed through the business desk."],
      ["Who should contact for media?", "Media and brand communication requests can begin here or through the press room contact."]
    ],
    resources: [
      ["Corporate dining", "Office meal programs, recurring catering, and employee food experiences across selected delivery zones."],
      ["Brand collaborations", "Campaign activations, co-branded partnerships, and promotional launch concepts with restaurant partners."],
      ["Campus and community", "Launch support for student communities, hostels, and neighborhood food access programs."]
    ],
    tips: [
      "Share city, order volume, and timeline in the first email.",
      "Mention if the need is recurring or event-based.",
      "Attach decks or requirements only after the first message if needed."
    ]
  },
  {
    id: "issue",
    label: "Report an issue",
    meta: "Bugs, complaints, missing details",
    description: "Use this section to report app bugs, broken flows, menu mismatches, billing concerns, or unresolved order problems.",
    actions: [
      { href: "mailto:support@snapeats.in?subject=SnapEats%20Issue%20Report", label: "Email issue desk" },
      { label: "Open cart", type: "cart" }
    ],
    faqs: [
      ["What should I include in an issue report?", "Share the order ID if available, screenshots, time of issue, city, and a short note on what happened."],
      ["Where do product bugs go?", "UI bugs, payment glitches, OTP problems, and page errors can all be reported through this route."],
      ["Can I report restaurant content issues?", "Yes, you can report wrong pricing, outdated menus, unavailable items, or misleading photos."],
      ["How quickly are issues reviewed?", "Urgent live-order issues are prioritized first, followed by technical or catalog issues."]
    ],
    tips: [
      "Attach screenshots whenever possible.",
      "Report order issues while the order is still active or soon after delivery.",
      "Use the exact phone number or email tied to the affected account."
    ]
  },
  {
    id: "legal",
    label: "Legal & policies",
    meta: "Terms, privacy, refunds",
    description: "Review the main policy topics that shape ordering, refunds, cookies, privacy, and promotional eligibility on SnapEats.",
    actions: [
      { label: "Order support", topic: "orders" },
      { href: "mailto:support@snapeats.in?subject=SnapEats%20Policy%20Question", label: "Email policy support" }
    ],
    faqs: [
      ["When can I cancel an order?", "You can cancel before restaurant confirmation. After preparation begins, cancellation may be restricted."],
      ["How do refunds work?", "Eligible refunds are initiated automatically and usually reflect within 3-5 business days depending on payment mode."],
      ["What data does SnapEats store?", "We store the account, address, and order details needed to complete orders, support your account, and improve the service."],
      ["How are offers validated?", "Offers apply only on eligible restaurants, order values, payment methods, and campaign windows shown at checkout."]
    ],
    resources: [
      ["Terms & Conditions", "Covers account responsibilities, order placement rules, platform usage expectations, and service limitations."],
      ["Cookie Policy", "Explains how browser storage and cookies support sessions, preferences, sign-in continuity, and experience analytics."],
      ["Privacy Policy", "Outlines what user data SnapEats collects, why it is used, and how it supports authentication, ordering, and support."],
      ["Refund Policy", "Describes refund eligibility, cancellation timing, failed payment handling, and the usual settlement timelines."]
    ],
    tips: [
      "Read offer conditions before placing the order.",
      "Keep payment confirmations until the order is completed.",
      "Reach out to support quickly when a refund or policy issue needs review."
    ]
  },
  {
    id: "safety",
    label: "Safety support",
    meta: "Urgent help and guidelines",
    description: "If you feel unsafe, contact us immediately and we will prioritize your request.",
    actions: [
      { href: "tel:+919000012345", label: "Emergency contact" },
      { href: "mailto:safety@snap-eats.com?subject=Safety%20concern", label: "Email safety" }
    ],
    faqs: [
      ["How do I report an incident?", "Use the emergency contact number or email safety@snap-eats.com with the order details and location."],
      ["Will my report stay confidential?", "Yes, safety reports are treated confidentially and escalated with priority."],
      ["Can I block a delivery partner?", "Report the issue immediately and we will review the situation and take appropriate action."],
      ["What happens next?", "A dedicated agent or support lead will review the case and follow up as quickly as possible."]
    ],
    tips: [
      "Share clear details like time, order ID, and location.",
      "Contact emergency services when needed.",
      "Keep screenshots or call logs if available."
    ]
  },
  {
    id: "market",
    label: "SnapEats Market onboarding",
    meta: "Grocery & essentials",
    description: "Learn about grocery partner onboarding, delivery SLAs, and inventory updates for essentials commerce.",
    actions: [
      { href: "mailto:market@snap-eats.com?subject=Market%20onboarding", label: "Start onboarding" },
      { label: "Business desk", topic: "business" }
    ],
    faqs: [
      ["Which categories are supported?", "Fresh produce, daily essentials, packaged goods, beverages, and convenience-led inventory are common categories."],
      ["How are stock updates handled?", "Inventory can be synced daily or updated manually so customers see the right availability."],
      ["What are delivery windows?", "Standard delivery windows are planned around city operations, partner readiness, and inventory confidence."],
      ["How do substitutions work?", "Customers can approve substitutions through the order flow or notes depending on the fulfillment model."]
    ],
    tips: [
      "Keep stock accurate to avoid cancellations.",
      "Bundle fast-moving items for better visibility.",
      "Use cold packaging for dairy and frozen items."
    ]
  }
];

function HelpAction({ action, onClose, onOpenCart, onTopicSelect, primary }) {
  const className = `help-action-button ${primary ? "primary-button" : "secondary-button"}`;

  if (action.href) {
    return <a className={className} href={action.href} target="_blank" rel="noopener noreferrer">{action.label}</a>;
  }

  if (action.to) {
    return <Link className={className} onClick={onClose} to={action.to}>{action.label}</Link>;
  }

  if (action.topic) {
    return <button className={className} onClick={() => onTopicSelect(action.topic)} type="button">{action.label}</button>;
  }

  return <button className={className} onClick={onOpenCart} type="button">{action.label}</button>;
}

function HelpModal({ onClose, onOpenCart, open }) {
  const [activeTopicId, setActiveTopicId] = useState("orders");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setActiveTopicId("orders");
    document.body.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const activeTopic = helpTopics.find((topic) => topic.id === activeTopicId) || helpTopics[0];

  return (
    <div className="modal open react-help-modal" id="helpModal" role="dialog" aria-modal="true" aria-label="Help and support">
      <div className="modal-content help-modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close help">
          &times;
        </button>

        <div className="help-shell">
          <header className="help-hero">
            <h1>Help &amp; Support</h1>
            <p className="help-hero-sub">Let's take a step ahead and help you better.</p>
          </header>

          <section className="help-panel-shell">
            <aside className="help-nav">
              <h2>Browse topics</h2>
              {helpTopics.map((topic) => (
                <button
                  className={`help-nav-item ${topic.id === activeTopic.id ? "active" : ""}`}
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  type="button"
                >
                  <span>{topic.label}</span>
                  <small>{topic.meta}</small>
                </button>
              ))}
            </aside>

            <div className="help-panel">
              <div className="help-panel-head">
                <div>
                  <p className="help-topic-meta">{activeTopic.meta}</p>
                  <h3>{activeTopic.label}</h3>
                  <p className="help-topic-copy">{activeTopic.description}</p>
                </div>
                <div className="help-panel-actions">
                  {activeTopic.actions.map((action, index) => (
                    <HelpAction
                      action={action}
                      key={action.label}
                      onClose={onClose}
                      onOpenCart={onOpenCart}
                      onTopicSelect={setActiveTopicId}
                      primary={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="help-panel-grid">
                <div>
                  <h4>Popular questions</h4>
                  <div className="help-faq-grid">
                    {activeTopic.faqs.map(([question, answer]) => (
                      <article className="help-faq-card" key={question}>
                        <h3>{question}</h3>
                        <p>{answer}</p>
                      </article>
                    ))}
                  </div>

                  {activeTopic.resources?.length ? (
                    <div className="help-resource-shell">
                      <h4>More details</h4>
                      <div className="help-resource-grid">
                        {activeTopic.resources.map(([title, body]) => (
                          <article className="help-resource-card" key={title}>
                            <h3>{title}</h3>
                            <p>{body}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h4>Quick tips</h4>
                  <ul className="help-tip-list">
                    {activeTopic.tips.map((tip) => <li key={tip}>{tip}</li>)}
                  </ul>
                  <div className="help-contact-card">
                    <span className="help-contact-icon">&#9993;</span>
                    <div>
                      <strong>Need more help?</strong>
                      <p>Email us at <strong>support@snapeats.in</strong> or call <strong>+91 90000 12345</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
