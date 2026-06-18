function AppDownloadSection() {
  return (
    <section className="app-section">
      <div className="container">
        <div className="app-content">
          <div className="app-text">
            <h2>For better experience, download the SnapEats app</h2>
            <div className="app-badges">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
            </div>
          </div>
          <div className="app-image">
            <div className="app-visual" aria-label="Mobile app icon" role="img">
              <svg viewBox="0 0 96 96" aria-hidden="true">
                <rect x="18" y="8" width="60" height="80" rx="14" fill="#ffffff" stroke="#dfe3ea" strokeWidth="3" />
                <rect x="24" y="16" width="48" height="58" rx="10" fill="#fff4ef" />
                <rect x="30" y="26" width="36" height="36" rx="11" fill="#d12b38" />
                <circle cx="48" cy="36.5" r="1.8" fill="#ffffff" />
                <path d="M38.5 45.8a9.5 9.5 0 0 1 19 0h-2.9a6.6 6.6 0 0 0-13.2 0h-2.9Z" fill="#ffffff" />
                <rect x="36" y="45.5" width="24" height="3.8" rx="1.9" fill="#ffffff" />
                <rect x="40.8" y="52" width="14.4" height="2.7" rx="1.35" fill="#ffffff" />
                <circle cx="48" cy="80.5" r="3.5" fill="#c3c9d4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppDownloadSection;
