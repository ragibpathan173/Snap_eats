const deliveryCities = [
  { label: "Bangalore", subtitle: "Bengaluru, Karnataka, India" },
  { label: "Gurgaon", subtitle: "Gurgaon, Haryana, India" },
  { label: "Hyderabad", subtitle: "Hyderabad, Telangana, India" },
  { label: "Delhi", subtitle: "New Delhi, Delhi, India" },
  { label: "Mumbai", subtitle: "Mumbai, Maharashtra, India" },
  { label: "Pune", subtitle: "Pune, Maharashtra, India" },
  { label: "Chennai", subtitle: "Chennai, Tamil Nadu, India" },
  { label: "Kolkata", subtitle: "Kolkata, West Bengal, India" }
];

function AppFooter({ onLocationSelect }) {
  function handleLocationClick(event, city) {
    event.preventDefault();
    onLocationSelect?.(city);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-col">
            <h3 className="footer-logo">SnapEats</h3>
            <p className="footer-desc">&copy; 2026 SnapEats Limited</p>
            <p className="footer-desc">Local-first food ordering built for faster discovery, reliable checkout, and better everyday value.</p>
            <p className="footer-desc footer-meta">Support: support@snapeats.in</p>
            <p className="footer-desc footer-meta">Partnerships: partners@snap-eats.com</p>
            <p className="footer-desc footer-meta">Call: +91 90000 12345</p>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="company.html#about-us">About Us</a></li>
              <li><a href="company.html#careers">Careers</a></li>
              <li><a href="company.html#team">Team</a></li>
              <li><a href="snapeats-one.html">SnapEats One</a></li>
              <li><a href="snapeats-genie.html">SnapEats Genie</a></li>
              <li><a href="blog.html">Blog</a></li>
              <li><a href="press.html">Press</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul>
              <li><a href="contact.html#help-support">Help &amp; Support</a></li>
              <li><a href="partner-with-us.html">Partner with us</a></li>
              <li><a href="ride-with-us.html">Ride with us</a></li>
              <li><a href="business-inquiries.html">Business inquiries</a></li>
              <li><a href="report-issue.html">Report an issue</a></li>
            </ul>
            <h4 className="footer-subheading">Legal</h4>
            <ul>
              <li><a href="terms-conditions.html">Terms &amp; Conditions</a></li>
              <li><a href="cookie-policy.html">Cookie Policy</a></li>
              <li><a href="privacy-policy.html">Privacy Policy</a></li>
              <li><a href="refund-policy.html">Refund Policy</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>We Deliver To</h4>
            <ul>
              {deliveryCities.map((city) => (
                <li key={city.label}>
                  <a href="#" onClick={(event) => handleLocationClick(event, city)}>
                    {city.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="https://www.linkedin.com/in/ragib-ali-khan-24b2ab28a" className="social-icon" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.12 8.33A1.9 1.9 0 1 1 6.1 4.5a1.9 1.9 0 0 1 .02 3.83ZM4.6 20.3h3.05V9.8H4.6v10.5Zm5.03 0h3.04v-5.86c0-1.55.3-3.04 2.22-3.04 1.9 0 1.93 1.78 1.93 3.14v5.76h3.05v-6.4c0-3.14-.67-5.55-4.34-5.55-1.76 0-2.95.97-3.43 1.88h-.05V9.8H9.63v10.5Z" /></svg>
              </a>
              <a href="https://www.instagram.com/_ragibpathan_?igsh=cWp3bmxzNzhsN2Mz" className="social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 1.8A3.96 3.96 0 0 0 3.8 7.75v8.5a3.96 3.96 0 0 0 3.95 3.95h8.5a3.96 3.96 0 0 0 3.95-3.95v-8.5a3.96 3.96 0 0 0-3.95-3.95h-8.5Zm8.83 1.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" /></svg>
              </a>
              <a href="https://x.com/ragibpathan00" className="social-icon" aria-label="X" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.91 3H21l-6.86 7.84L22 21h-6.2l-4.85-6.37L5.37 21H3.27l7.34-8.39L2 3h6.36l4.38 5.79L18.91 3Zm-1.09 16.2h1.16L7.73 4.74H6.49L17.82 19.2Z" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <p>By continuing past this page, you agree to SnapEats' Terms of Service, Cookie Policy, Privacy Policy, and refund-related guidelines. Restaurant names, menu content, and brand marks belong to their respective owners. 2026 &copy; SnapEats Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
