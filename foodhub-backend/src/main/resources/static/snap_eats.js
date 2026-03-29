const API_BASE_URL = "/api";
const CART_STORAGE_KEY = "snap_eats_cart";
const AUTH_STORAGE_KEY = "snap_eats_current_user";
const AUTH_TOKEN_STORAGE_KEY = "snap_eats_auth_token";
const LOCATION_STORAGE_KEY = "snap_eats_selected_location";
const RECENT_LOCATIONS_STORAGE_KEY = "snap_eats_recent_locations";
const ADDRESS_SEARCH_BIAS_KEY = "snap_eats_address_search_bias";
const OWNER_NAME = "Ragib Ali Khan";
const OWNER_EMAIL = "ragibpathan173@gmail.com";
const PINCODE_LOOKUP_BASE_URL = "https://api.postalpincode.in/pincode/";
const REVERSE_GEOCODE_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
const FORWARD_GEOCODE_BASE_URL = "https://nominatim.openstreetmap.org/search";
const PHOTON_GEOCODE_BASE_URL = "https://photon.komoot.io/api/";
const RESTAURANT_PAGE_SIZE = 12;
const RETRY_DELAY_MS = 350;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const PLATFORM_COUPONS = [
    {
        code: "WELCOME50",
        title: "Flat Rs 50 off",
        description: "New users only - valid on orders above Rs 199.",
        discountType: "FLAT",
        discountValue: 50,
        minOrder: 199,
        maxDiscount: 50
    },
    {
        code: "SNAP20",
        title: "20% off up to Rs 120",
        description: "Applies on orders above Rs 299.",
        discountType: "PERCENT",
        discountValue: 20,
        minOrder: 299,
        maxDiscount: 120
    },
    {
        code: "MEAL30",
        title: "Flat Rs 30 off",
        description: "Quick savings on orders above Rs 149.",
        discountType: "FLAT",
        discountValue: 30,
        minOrder: 149,
        maxDiscount: 30
    }
];
const PAYMENT_OFFERS = [
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 4% Cashback",
        description: "Pay using Axis Bank ACE Credit Card & get an additional 4% cashback."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 4% Cashback",
        description: "Pay using Flipkart Axis Bank Credit Card & get an additional 4% cashback."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 10% Cashback",
        description: "Pay using HSBC Live+ Credit Card & get an additional 10% cashback (₹1000 monthly limit)."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 10% Cashback",
        description: "Pay using Swiggy HDFC Bank Credit Card or Swiggy Black HDFC Bank Credit Card & get an additional 10% cashback on all orders (₹1500 monthly limit)."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 10% Cashback",
        description: "Pay using Airtel Axis Bank Credit Card & get an additional 10% cashback."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 5% Cashback",
        description: "Pay using Swiggy Orange HDFC Bank Credit Card & get an additional 5% cashback on all orders (₹1500 monthly limit)."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Extra 5% Cashback",
        description: "Pay using HDFC Bank Millennia Credit Card & get an additional 5% cashback (₹1000 monthly limit)."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Earn 5X Reward Points",
        description: "Earn 5X reward points on eligible spends via PhonePe HDFC Bank Ultimo Credit Cards."
    },
    {
        type: "CARD",
        category: "BANK",
        title: "Earn 10X Reward Points",
        description: "Earn 10X reward points on eligible spends via SBI SimplyCLICK Credit Cards."
    },
    {
        type: "UPI",
        category: "BANK",
        title: "UPI Cashpoints",
        description: "Earn bonus cashpoints on eligible UPI payments via SnapEats."
    }
];
const NETBANKING_POPULAR_BANKS = [
    "HDFC Bank",
    "ICICI Bank",
    "State Bank of India",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Yes Bank"
];
const NETBANKING_ALL_BANKS = [
    "Allahabad Bank",
    "Andhra Bank",
    "AU Small Finance Bank",
    "Axis Bank",
    "Bandhan Bank",
    "Bank of Baroda",
    "Bank of India",
    "Bank of Maharashtra",
    "Canara Bank",
    "Central Bank of India",
    "City Union Bank",
    "Corporation Bank",
    "DCB Bank",
    "Dhanlaxmi Bank",
    "Development Credit Bank",
    "Federal Bank",
    "HDFC Bank",
    "ICICI Bank",
    "IDBI Bank",
    "IDFC First Bank",
    "Indian Bank",
    "Indian Overseas Bank",
    "IndusInd Bank",
    "Jammu & Kashmir Bank",
    "Karnataka Bank",
    "Karur Vysya Bank",
    "Kotak Mahindra Bank",
    "Punjab & Sind Bank",
    "Punjab National Bank",
    "RBL Bank",
    "South Indian Bank",
    "State Bank of India",
    "Tamilnad Mercantile Bank",
    "Union Bank of India",
    "UCO Bank",
    "Yes Bank"
];

let categories = [];
let restaurants = [];
let visibleRestaurantCount = RESTAURANT_PAGE_SIZE;
let restaurantsLoading = false;
let activeCategory = "all";
let activeRestaurant = null;
let activeMenuItems = [];
let savedAddresses = [];
let adminRestaurants = [];
let adminSelectedRestaurantId = null;
let adminMenuItems = [];
let adminMenuLoading = false;
let adminMenuError = "";
let adminEditingMenuItemId = null;
let favoriteRestaurants = [];
let favoriteMenuItems = [];
let savedPaymentMethods = [];
let subscriptionPlans = [];
let currentSubscription = null;
let subscriptionLoading = false;
let subscriptionFeedback = { type: "", message: "" };
let editingAddressId = null;
let orderHistory = [];
let activeAccountSection = "orders";
let paymentFormType = "CARD";
let checkoutPaymentChoice = "CASH";
let checkoutView = "cart";
let couponListOpen = false;
let paymentOffersOpen = false;
let paymentChoiceTouched = false;
let noContactDelivery = false;
let netbankingBankChoice = "";
let appliedCouponCode = "";
let couponFeedback = { type: "", message: "" };
let latestOrderSuccess = null;
let currentUser = loadCurrentUser();
let authToken = loadAuthToken();
let otpAuthDraftIdentifier = "";
let otpAuthDraftName = "";
let otpAuthDraftEmail = "";
let otpAuthDraftReferralCode = "";
let otpAuthFlowMode = "login";
let otpAuthStep = "form";
let otpAuthLastSentIdentifier = "";
let otpAuthCooldownUntil = 0;
let otpAuthCooldownTimer = null;
let corporateStoryTab = "mission";
let corporatePeopleTab = "management";
let selectedLocation = loadSelectedLocation();
let recentLocations = loadRecentLocations();
let cart = loadCart();
let locationGpsStatus = { type: "idle", message: "" };
let discoveryFilters = {
    minRating: 0,
    maxEta: 0,
    maxPriceForTwo: 0,
    vegOnly: false
};
const pincodeLookupCache = new Map();
let addressMap = null;
let addressMapMarker = null;
let addressMapLoadingPromise = null;
let addressMapSearchResultsCache = [];
let addressMapSearchLayer = null;
let addressMapSearchDebounceTimer = null;
let addressLocationConfirmed = false;
let addressLocationAreaLabel = "";
let addressPendingSearchSelection = null;

function isAuthenticatedSession() {
    return Boolean(currentUser?.id && authToken);
}

function normalizeCurrentUserIdentity(user) {
    if (!user || typeof user !== "object") {
        return user;
    }

    const normalizedUser = { ...user };
    const normalizedName = String(normalizedUser.name || "").trim().toLowerCase();
    const normalizedEmail = String(normalizedUser.email || "").trim().toLowerCase();
    const ownerEmailAliases = new Set(["ragibyx@gmail.com", OWNER_EMAIL.toLowerCase()]);

    if (ownerEmailAliases.has(normalizedEmail) || normalizedName === "ragib" || normalizedName === "ragib ali khan") {
        normalizedUser.name = OWNER_NAME;
        normalizedUser.email = OWNER_EMAIL;
    }

    return normalizedUser;
}

function normalizeCouponCode(value) {
    return String(value || "").trim().toUpperCase();
}

function resetCouponState() {
    appliedCouponCode = "";
    couponFeedback = { type: "", message: "" };
}

function getPlatformCouponByCode(code) {
    const normalizedCode = normalizeCouponCode(code);
    return PLATFORM_COUPONS.find((coupon) => coupon.code === normalizedCode) || null;
}

function calculateCouponDiscount(coupon, subtotal) {
    if (!coupon || subtotal <= 0) {
        return 0;
    }
    if (subtotal < Number(coupon.minOrder || 0)) {
        return 0;
    }
    if (coupon.discountType === "PERCENT") {
        const raw = subtotal * (Number(coupon.discountValue || 0) / 100);
        return roundAmount(Math.min(raw, Number(coupon.maxDiscount || raw)));
    }
    return roundAmount(Math.min(Number(coupon.discountValue || 0), Number(coupon.maxDiscount || coupon.discountValue || 0)));
}

function getAppliedCoupon() {
    return getPlatformCouponByCode(appliedCouponCode);
}

function getCouponDiscount(subtotal = getCartSubtotal()) {
    const appliedCoupon = getAppliedCoupon();
    return calculateCouponDiscount(appliedCoupon, subtotal);
}

function getCouponValidationMessage(coupon, subtotal) {
    if (!coupon) {
        return "Invalid coupon code.";
    }
    if (coupon.code === "WELCOME50" && orderHistory.length > 0) {
        return "WELCOME50 is only for new users.";
    }
    if (!cart.items.length) {
        return "Add items to your cart before applying a coupon.";
    }
    if (subtotal < Number(coupon.minOrder || 0)) {
        return `Coupon requires a minimum order of ${formatCurrency(coupon.minOrder)}.`;
    }
    return "";
}

function applyCouponCode(code, source = "cart") {
    const normalizedCode = normalizeCouponCode(code);
    const subtotal = getCartSubtotal();
    const coupon = getPlatformCouponByCode(normalizedCode);
    const validationMessage = getCouponValidationMessage(coupon, subtotal);

    if (validationMessage) {
        couponFeedback = { type: "error", message: validationMessage };
        if (source !== "offers") {
            couponListOpen = true;
        }
        if (source !== "offers") {
            renderCart();
        } else {
            renderOffersModal();
        }
        return false;
    }

    appliedCouponCode = normalizedCode;
    const discountAmount = getCouponDiscount(subtotal);
    couponFeedback = { type: "success", message: `Coupon ${normalizedCode} applied. You saved ${formatCurrency(discountAmount)}.` };
    couponListOpen = false;
    renderCart();
    if (document.getElementById("offersModal")?.classList.contains("open")) {
        renderOffersModal();
    }
    return true;
}

function applyCouponFromCart(event) {
    if (event) {
        event.preventDefault();
    }
    const input = document.getElementById("couponCodeInput");
    const code = input?.value || "";
    applyCouponCode(code, "cart");
}

function applyCouponFromList(code) {
    const input = document.getElementById("couponCodeInput");
    if (input) {
        input.value = code;
    }
    applyCouponCode(code, "cart");
}

function applyCouponFromOffers(code) {
    const applied = applyCouponCode(code, "offers");
    if (applied) {
        openCart();
    }
}

function removeAppliedCoupon() {
    if (!appliedCouponCode) {
        return;
    }
    const removedCode = appliedCouponCode;
    appliedCouponCode = "";
    couponFeedback = { type: "success", message: `Coupon ${removedCode} removed.` };
    couponListOpen = false;
    renderCart();
    if (document.getElementById("offersModal")?.classList.contains("open")) {
        renderOffersModal();
    }
}

function getRestaurantOffers() {
    return restaurants
        .filter((restaurant) => restaurant.discount)
        .slice(0, 24);
}

function getOtpAuthCooldownSeconds() {
    const remainingMs = otpAuthCooldownUntil - Date.now();
    if (remainingMs <= 0) {
        return 0;
    }
    return Math.ceil(remainingMs / 1000);
}

function syncOtpAuthButtonState() {
    const button = document.getElementById("authOtpSendButton");
    if (!button) {
        return;
    }
    const remainingSeconds = getOtpAuthCooldownSeconds();
    button.disabled = remainingSeconds > 0;
    button.textContent = remainingSeconds > 0 ? `Resend in ${remainingSeconds}s` : "Send OTP";
}

function startOtpAuthCooldown(seconds = 30) {
    otpAuthCooldownUntil = Date.now() + (seconds * 1000);
    if (otpAuthCooldownTimer) {
        window.clearInterval(otpAuthCooldownTimer);
    }
    syncOtpAuthButtonState();
    otpAuthCooldownTimer = window.setInterval(() => {
        syncOtpAuthButtonState();
        if (getOtpAuthCooldownSeconds() <= 0) {
            window.clearInterval(otpAuthCooldownTimer);
            otpAuthCooldownTimer = null;
        }
    }, 1000);
}

function clearOtpAuthCooldown() {
    otpAuthCooldownUntil = 0;
    if (otpAuthCooldownTimer) {
        window.clearInterval(otpAuthCooldownTimer);
        otpAuthCooldownTimer = null;
    }
}

function updateOtpAuthIdentifier(value) {
    const nextValue = String(value || "").trim();
    if (otpAuthDraftIdentifier !== nextValue) {
        otpAuthDraftIdentifier = nextValue;
        if (otpAuthLastSentIdentifier && otpAuthLastSentIdentifier !== nextValue) {
            clearOtpAuthCooldown();
        }
    } else {
        otpAuthDraftIdentifier = nextValue;
    }
}

function updateOtpAuthName(value) {
    otpAuthDraftName = String(value || "");
}

function updateOtpAuthEmail(value) {
    otpAuthDraftEmail = String(value || "").trim();
}

function updateOtpAuthReferralCode(value) {
    otpAuthDraftReferralCode = String(value || "").trim();
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCorrelationId() {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `snap-${Date.now().toString(36)}-${randomPart}`;
}

function shouldRetryRequest(error, method, attemptIndex, maxRetries) {
    if (attemptIndex >= maxRetries) {
        return false;
    }
    if (method !== "GET") {
        return false;
    }
    if (error?.networkError) {
        return true;
    }
    return RETRYABLE_STATUS_CODES.has(Number(error?.status));
}

async function fetchWithRetry(url, options = {}, maxRetries = 2) {
    const method = String(options.method || "GET").toUpperCase();
    let attempt = 0;
    while (true) {
        try {
            return await fetch(url, options);
        } catch (error) {
            const wrappedError = {
                networkError: true,
                message: error?.message || "Network request failed"
            };
            if (!shouldRetryRequest(wrappedError, method, attempt, maxRetries)) {
                throw error;
            }
            attempt += 1;
            await wait(RETRY_DELAY_MS * attempt);
        }
    }
}

async function fetchJson(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (currentUser?.id) {
        headers.set("X-User-Id", String(currentUser.id));
    }
    if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
    }
    if (!headers.has("X-Correlation-Id")) {
        headers.set("X-Correlation-Id", buildCorrelationId());
    }

    const requestOptions = {
        ...options,
        headers
    };
    const maxRetries = Number.isFinite(options.maxRetries) ? Number(options.maxRetries) : 2;
    const method = String(options.method || "GET").toUpperCase();
    let attempt = 0;

    while (true) {
        const response = await fetchWithRetry(url, requestOptions, maxRetries);
        const responseText = await response.text();
        let data = {};
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch {
                data = { message: responseText };
            }
        }

        if (response.ok) {
            return data;
        }

        const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.correlationId = response.headers.get("X-Correlation-Id") || "";

        if (response.status === 401 && authToken) {
            saveCurrentUser(null);
            saveAuthToken("");
        }

        if (!shouldRetryRequest(error, method, attempt, maxRetries)) {
            throw error;
        }

        attempt += 1;
        await wait(RETRY_DELAY_MS * attempt);
    }
}

function loadCurrentUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsedUser = JSON.parse(raw);
        const normalizedUser = normalizeCurrentUserIdentity(parsedUser);
        if (JSON.stringify(parsedUser) !== JSON.stringify(normalizedUser)) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
        }
        return normalizedUser;
    } catch {
        return null;
    }
}

function loadAuthToken() {
    try {
        return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
    } catch {
        return "";
    }
}

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : createEmptyCart();
    } catch {
        return createEmptyCart();
    }
}

function loadSelectedLocation() {
    try {
        const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : { label: "Other", subtitle: "" };
    } catch {
        return { label: "Other", subtitle: "" };
    }
}

function loadRecentLocations() {
    try {
        const raw = localStorage.getItem(RECENT_LOCATIONS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function loadAddressSearchBias() {
    try {
        const raw = localStorage.getItem(ADDRESS_SEARCH_BIAS_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        const latitude = parseCoordinate(parsed?.latitude);
        const longitude = parseCoordinate(parsed?.longitude);
        if (latitude == null || longitude == null) {
            return null;
        }
        return { latitude, longitude };
    } catch {
        return null;
    }
}

function saveAddressSearchBias(latitude, longitude) {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    if (lat == null || lng == null) {
        return;
    }
    localStorage.setItem(
        ADDRESS_SEARCH_BIAS_KEY,
        JSON.stringify({
            latitude: lat,
            longitude: lng,
            updatedAt: Date.now()
        })
    );
}

function createEmptyCart() {
    return {
        restaurantCode: null,
        restaurantName: "",
        items: []
    };
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function saveCurrentUser(user) {
    currentUser = normalizeCurrentUserIdentity(user || null);
    if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    updateAuthNav();
}

function saveAuthToken(token) {
    authToken = token || "";
    if (authToken) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
    } else {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
}

function saveSelectedLocation(location) {
    selectedLocation = location;
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    updateLocationChip();
}

function saveRecentLocations(locations) {
    recentLocations = locations.slice(0, 5);
    localStorage.setItem(RECENT_LOCATIONS_STORAGE_KEY, JSON.stringify(recentLocations));
}

function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        cartCount.textContent = String(count);
    }
}

function updateAuthNav() {
    const authNavLabel = document.getElementById("authNavLabel");
    if (!authNavLabel) {
        return;
    }
    authNavLabel.textContent = currentUser?.name ? currentUser.name.split(" ")[0] : "Profile";
}

function updateLocationChip() {
    const locationChipLabel = document.getElementById("locationChipLabel");
    if (!locationChipLabel) {
        return;
    }
    locationChipLabel.textContent = selectedLocation?.label || "Other";
}

function syncHeaderOffsetVar() {
    const header = document.querySelector(".header");
    const searchStrip = document.getElementById("headerSearchStrip");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const stripHeight = searchStrip && searchStrip.classList.contains("open")
        ? searchStrip.getBoundingClientRect().height
        : 0;
    const totalOffset = Math.max(80, Math.round(headerHeight + stripHeight));
    document.documentElement.style.setProperty("--app-header-offset", `${totalOffset}px`);
}

function openSearchBar() {
    const searchStrip = document.getElementById("headerSearchStrip");
    const searchInput = document.getElementById("searchInput");
    if (!searchStrip || !searchInput) {
        return;
    }

    searchStrip.classList.add("open");
    syncHeaderOffsetVar();
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
        syncHeaderOffsetVar();
        searchInput.focus();
    }, 160);
}

function closeSearchBar() {
    const searchStrip = document.getElementById("headerSearchStrip");
    if (!searchStrip) {
        return;
    }

    searchStrip.classList.remove("open");
    syncHeaderOffsetVar();
}

function toggleSearchBar(event) {
    if (event) {
        event.preventDefault();
    }

    const searchStrip = document.getElementById("headerSearchStrip");
    const searchInput = document.getElementById("searchInput");
    if (!searchStrip || !searchInput) {
        return;
    }

    if (searchStrip.classList.contains("open")) {
        closeSearchBar();
        return;
    }

    switchHeaderPanel("search");
    openSearchBar();
}

function runSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) {
        return;
    }

    searchRestaurants(searchInput.value);
}

function switchHeaderPanel(target) {
    const closeByKey = {
        menu: closeMenu,
        cart: closeCart,
        address: closeAddressBook,
        orders: closeOrders,
        auth: closeAuthModal,
        location: closeLocationPicker,
        offers: closeOffers,
        corporate: closeCorporatePage
    };

    Object.entries(closeByKey).forEach(([key, closeFn]) => {
        if (key !== target && typeof closeFn === "function") {
            closeFn();
        }
    });

    if (target !== "search") {
        closeSearchBar();
    }
}

function getDefaultAddress() {
    return savedAddresses.find((address) => address.defaultAddress) || null;
}

function getDefaultSavedPaymentMethod() {
    return savedPaymentMethods.find((method) => method.defaultMethod) || savedPaymentMethods[0] || null;
}

function getAddressById(addressId) {
    return savedAddresses.find((address) => address.id === addressId) || null;
}

function getCartItemQuantity(itemId) {
    return cart.items.find((item) => item.itemId === itemId)?.quantity || 0;
}

function ensureCheckoutPaymentChoice() {
    if (!savedPaymentMethods.length) {
        if (!checkoutPaymentChoice) {
            checkoutPaymentChoice = "CASH";
        }
        return;
    }

    if (["CASH", "UPI", "WALLET", "NETBANKING", "PLUXEE"].includes(checkoutPaymentChoice)) {
        return;
    }
    const hasSelectedSavedMethod = savedPaymentMethods.some((method) => `saved:${method.id}` === checkoutPaymentChoice);
    if (checkoutPaymentChoice === "CASH" || hasSelectedSavedMethod) {
        return;
    }

    const defaultMethod = getDefaultSavedPaymentMethod();
    checkoutPaymentChoice = defaultMethod ? `saved:${defaultMethod.id}` : "CASH";
}

function setCheckoutPaymentChoice(choice) {
    checkoutPaymentChoice = choice;
    paymentChoiceTouched = true;
    if (checkoutPaymentChoice === "CASH") {
        noContactDelivery = false;
    }
    renderCart();
}

function getCheckoutPaymentSelection() {
    ensureCheckoutPaymentChoice();

    if (checkoutPaymentChoice === "CASH") {
        return {
            type: "CASH",
            label: "Cash on delivery"
        };
    }
    if (checkoutPaymentChoice === "UPI") {
        return { type: "UPI", label: "UPI" };
    }
    if (checkoutPaymentChoice === "WALLET") {
        return { type: "WALLET", label: "Wallet" };
    }
    if (checkoutPaymentChoice === "NETBANKING") {
        return { type: "NETBANKING", label: netbankingBankChoice ? `Netbanking - ${netbankingBankChoice}` : "Netbanking" };
    }
    if (checkoutPaymentChoice === "PLUXEE") {
        return { type: "PLUXEE", label: "Pluxee" };
    }

    const selectedMethod = savedPaymentMethods.find((method) => `saved:${method.id}` === checkoutPaymentChoice);
    if (!selectedMethod) {
        return {
            type: "CASH",
            label: "Cash on delivery"
        };
    }

    return {
        type: selectedMethod.methodType,
        label: formatPaymentMethodLabel(selectedMethod),
        methodId: selectedMethod.id
    };
}

function setPaymentFormType(type) {
    paymentFormType = type;
    renderAuthModal();
}

function getLocationSuggestions(query = "") {
    const normalizedQuery = query.trim().toLowerCase();
    const savedAddressLocations = savedAddresses.map((address) => ({
        label: address.label,
        subtitle: formatAddressLine(address)
    }));
    const curatedLocations = [
        { label: "Jamia Nagar", subtitle: "Okhla, New Delhi, Delhi, India" },
        { label: "Koramangala", subtitle: "Bengaluru, Karnataka, India" },
        { label: "Bandra West", subtitle: "Mumbai, Maharashtra, India" },
        { label: "Salt Lake", subtitle: "Kolkata, West Bengal, India" }
    ];

    const deduped = [];
    [...recentLocations, ...savedAddressLocations, ...curatedLocations].forEach((location) => {
        const key = `${location.label}|${location.subtitle}`;
        if (!deduped.some((entry) => `${entry.label}|${entry.subtitle}` === key)) {
            deduped.push(location);
        }
    });

    if (!normalizedQuery) {
        return deduped;
    }

    return deduped.filter((location) =>
        location.label.toLowerCase().includes(normalizedQuery)
        || location.subtitle.toLowerCase().includes(normalizedQuery)
    );
}

function pushRecentLocation(location) {
    const nextLocations = [
        location,
        ...recentLocations.filter((entry) => `${entry.label}|${entry.subtitle}` !== `${location.label}|${location.subtitle}`)
    ];
    saveRecentLocations(nextLocations);
}

function applyLocationSelection(location) {
    saveSelectedLocation(location);
    pushRecentLocation(location);
    closeLocationPicker();
    fetchRestaurants(activeCategory, document.getElementById("searchInput")?.value || "").catch(() => {});
}

function handleLocationChipKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLocationPicker();
    }
}

function formatAddressLine(address) {
    if (!address) {
        return "";
    }

    return [
        address.addressLine,
        address.landmark,
        address.city,
        address.state,
        address.pincode
    ].filter(Boolean).join(", ");
}

function parseCoordinate(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const normalized = String(value).trim();
    if (!normalized) {
        return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function getAddressCoordinates(address) {
    const latitude = parseCoordinate(address?.latitude);
    const longitude = parseCoordinate(address?.longitude);
    if (latitude == null || longitude == null) {
        return null;
    }
    return { latitude, longitude };
}

function formatCoordinate(value) {
    const numeric = parseCoordinate(value);
    return numeric == null ? "" : numeric.toFixed(6);
}

function getAddressMapUrl(address) {
    const coordinates = getAddressCoordinates(address);
    if (!coordinates) {
        return "";
    }
    return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(coordinates.latitude)}&mlon=${encodeURIComponent(coordinates.longitude)}#map=18/${encodeURIComponent(coordinates.latitude)}/${encodeURIComponent(coordinates.longitude)}`;
}

function normalizeTextForMatching(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function estimateRestaurantPriceForTwo(restaurant) {
    const category = normalizeTextForMatching(restaurant?.category || "");
    const cuisine = normalizeTextForMatching(restaurant?.cuisine || "");
    const baseByCategory = {
        italian: 700,
        healthy: 500,
        north: 550,
        chinese: 450,
        biryani: 600,
        dessert: 350,
        burger: 400,
        pizza: 550
    };

    if (restaurant?.priceForTwo && Number(restaurant.priceForTwo) > 0) {
        return Number(restaurant.priceForTwo);
    }
    if (baseByCategory[category]) {
        return baseByCategory[category];
    }
    if (cuisine.includes("healthy") || cuisine.includes("salad")) {
        return 450;
    }
    if (cuisine.includes("pizza") || cuisine.includes("italian")) {
        return 600;
    }
    if (cuisine.includes("biryani")) {
        return 650;
    }
    return 500;
}

function parseDeliveryEtaMinutes(timeLabel) {
    const matches = String(timeLabel || "").match(/\d+/g);
    if (!matches || !matches.length) {
        return Number.POSITIVE_INFINITY;
    }
    return Math.max(...matches.map((value) => Number(value)));
}

function isVegFriendlyRestaurant(restaurant) {
    if (restaurant?.vegFriendly === true || restaurant?.vegetarianOnly === true) {
        return true;
    }
    const searchable = normalizeTextForMatching(`${restaurant?.name || ""} ${restaurant?.cuisine || ""} ${restaurant?.category || ""}`);
    return ["veg", "vegetarian", "vegan", "salad", "healthy", "jain"].some((token) => searchable.includes(token));
}

function countActiveDiscoveryFilters() {
    return [
        discoveryFilters.minRating > 0,
        discoveryFilters.maxEta > 0,
        discoveryFilters.maxPriceForTwo > 0,
        discoveryFilters.vegOnly
    ].filter(Boolean).length;
}

function renderDiscoveryFilters() {
    const host = document.getElementById("discoveryFilters");
    if (!host) {
        return;
    }

    const activeCount = countActiveDiscoveryFilters();
    host.innerHTML = `
        <div class="discovery-filter-row">
            <label class="discovery-filter-control">
                <span>Rating</span>
                <select id="filterMinRating" onchange="updateDiscoveryFilters()">
                    <option value="0" ${discoveryFilters.minRating === 0 ? "selected" : ""}>Any</option>
                    <option value="4" ${discoveryFilters.minRating === 4 ? "selected" : ""}>4.0+</option>
                    <option value="4.2" ${discoveryFilters.minRating === 4.2 ? "selected" : ""}>4.2+</option>
                    <option value="4.5" ${discoveryFilters.minRating === 4.5 ? "selected" : ""}>4.5+</option>
                </select>
            </label>
            <label class="discovery-filter-control">
                <span>ETA</span>
                <select id="filterMaxEta" onchange="updateDiscoveryFilters()">
                    <option value="0" ${discoveryFilters.maxEta === 0 ? "selected" : ""}>Any</option>
                    <option value="20" ${discoveryFilters.maxEta === 20 ? "selected" : ""}>Under 20 min</option>
                    <option value="30" ${discoveryFilters.maxEta === 30 ? "selected" : ""}>Under 30 min</option>
                    <option value="40" ${discoveryFilters.maxEta === 40 ? "selected" : ""}>Under 40 min</option>
                </select>
            </label>
            <label class="discovery-filter-control">
                <span>Price for two</span>
                <select id="filterMaxPriceForTwo" onchange="updateDiscoveryFilters()">
                    <option value="0" ${discoveryFilters.maxPriceForTwo === 0 ? "selected" : ""}>Any</option>
                    <option value="400" ${discoveryFilters.maxPriceForTwo === 400 ? "selected" : ""}>Under Rs 400</option>
                    <option value="600" ${discoveryFilters.maxPriceForTwo === 600 ? "selected" : ""}>Under Rs 600</option>
                    <option value="800" ${discoveryFilters.maxPriceForTwo === 800 ? "selected" : ""}>Under Rs 800</option>
                </select>
            </label>
            <label class="discovery-toggle">
                <input id="filterVegOnly" type="checkbox" ${discoveryFilters.vegOnly ? "checked" : ""} onchange="updateDiscoveryFilters()">
                <span>Veg-friendly only</span>
            </label>
            <button class="secondary-button discovery-reset-btn" type="button" onclick="clearDiscoveryFilters()" ${activeCount ? "" : "disabled"}>
                Clear${activeCount ? ` (${activeCount})` : ""}
            </button>
        </div>
    `;
}

function updateDiscoveryFilters() {
    const minRating = Number(document.getElementById("filterMinRating")?.value || 0);
    const maxEta = Number(document.getElementById("filterMaxEta")?.value || 0);
    const maxPriceForTwo = Number(document.getElementById("filterMaxPriceForTwo")?.value || 0);
    const vegOnly = Boolean(document.getElementById("filterVegOnly")?.checked);

    discoveryFilters = { minRating, maxEta, maxPriceForTwo, vegOnly };
    visibleRestaurantCount = RESTAURANT_PAGE_SIZE;
    renderRestaurants();
}

function clearDiscoveryFilters() {
    discoveryFilters = {
        minRating: 0,
        maxEta: 0,
        maxPriceForTwo: 0,
        vegOnly: false
    };
    visibleRestaurantCount = RESTAURANT_PAGE_SIZE;
    renderRestaurants();
}

function getSelectedLocationFilters() {
    const label = String(selectedLocation?.label || "").trim();
    const subtitle = String(selectedLocation?.subtitle || "").trim();
    if (!label || label.toLowerCase() === "other") {
        return {};
    }

    const normalizedSource = normalizeTextForMatching(`${label} ${subtitle}`);
    const cityAliases = [
        { canonical: "New Delhi", patterns: ["new delhi", "delhi"] },
        { canonical: "Mumbai", patterns: ["mumbai", "bombay"] },
        { canonical: "Pune", patterns: ["pune"] },
        { canonical: "Bengaluru", patterns: ["bengaluru", "bangalore"] },
        { canonical: "Hyderabad", patterns: ["hyderabad"] },
        { canonical: "Kolkata", patterns: ["kolkata", "calcutta"] },
        { canonical: "Chennai", patterns: ["chennai"] },
        { canonical: "Ahmedabad", patterns: ["ahmedabad"] }
    ];

    let detectedCity = "";
    for (const entry of cityAliases) {
        if (entry.patterns.some((pattern) => normalizedSource.includes(pattern))) {
            detectedCity = entry.canonical;
            break;
        }
    }

    const genericLabels = new Set(["other", "current location"]);
    const locality = genericLabels.has(label.toLowerCase()) ? "" : label;
    return {
        city: detectedCity,
        locality
    };
}

async function lookupPincodeDetails(pincode) {
    const normalizedPincode = String(pincode || "").trim();
    if (pincodeLookupCache.has(normalizedPincode)) {
        return pincodeLookupCache.get(normalizedPincode);
    }

    const response = await fetch(`${PINCODE_LOOKUP_BASE_URL}${encodeURIComponent(normalizedPincode)}`);
    const result = await response.json();
    const payload = Array.isArray(result) ? result[0] : null;

    if (!response.ok || !payload || payload.Status !== "Success" || !Array.isArray(payload.PostOffice) || !payload.PostOffice.length) {
        throw new Error("We couldn't find address details for that pincode.");
    }

    const details = {
        city: payload.PostOffice[0].District || "",
        state: payload.PostOffice[0].State || "",
        areas: payload.PostOffice
            .map((office) => office.Name)
            .filter(Boolean)
            .filter((value, index, all) => all.indexOf(value) === index)
    };

    pincodeLookupCache.set(normalizedPincode, details);
    return details;
}

function renderAreaOptions(areas, selectedArea = "") {
    if (!Array.isArray(areas) || !areas.length) {
        return selectedArea ? `<option value="${escapeAttribute(selectedArea)}"></option>` : "";
    }

    const normalizedSelected = String(selectedArea || "").trim();
    const values = normalizedSelected && !areas.includes(normalizedSelected)
        ? [normalizedSelected, ...areas]
        : areas;

    return values.map((area) => `<option value="${escapeAttribute(area)}"></option>`).join("");
}

function setAddressLookupFeedback(message, type = "") {
    const feedback = document.getElementById("addressLookupFeedback");
    if (!feedback) {
        return;
    }

    feedback.textContent = message || "";
    feedback.className = `address-lookup-feedback ${type}`.trim();
}

async function handlePincodeInput() {
    const pincodeInput = document.getElementById("addressPincode");
    const cityInput = document.getElementById("addressCity");
    const stateInput = document.getElementById("addressState");
    const areaInput = document.getElementById("addressLandmark");
    const areaOptions = document.getElementById("addressAreaOptions");

    if (!pincodeInput || !cityInput || !stateInput || !areaInput || !areaOptions) {
        return;
    }

    const normalizedPincode = pincodeInput.value.replace(/\D/g, "").slice(0, 6);
    pincodeInput.value = normalizedPincode;

    if (normalizedPincode.length < 6) {
        setAddressLookupFeedback("Enter a 6-digit pincode to auto-fill city, state, and area.");
        return;
    }

    setAddressLookupFeedback("Fetching city, state, and area...", "loading");

    try {
        const details = await lookupPincodeDetails(normalizedPincode);
        cityInput.value = details.city;
        stateInput.value = details.state;
        if (!areaInput.value.trim() && details.areas.length) {
            areaInput.value = details.areas[0];
        }
        areaOptions.innerHTML = renderAreaOptions(details.areas, areaInput.value.trim());
        setAddressLookupFeedback("City and state auto-filled. You can choose an area/locality suggestion too.", "success");
    } catch (error) {
        areaOptions.innerHTML = "";
        setAddressLookupFeedback(error.message || "Unable to fetch pincode details right now.", "error");
    }
}

function setAddressMapStatus(message, type = "") {
    const status = document.getElementById("addressMapStatus");
    if (!status) {
        return;
    }
    status.textContent = message || "";
    status.className = `address-map-status ${type}`.trim();
}

function hasAddressPinSelection() {
    const latitude = parseCoordinate(document.getElementById("addressLatitude")?.value);
    const longitude = parseCoordinate(document.getElementById("addressLongitude")?.value);
    return latitude != null && longitude != null;
}

function setAddressLocationAreaLabel(label = "") {
    addressLocationAreaLabel = String(label || "").trim();
    const areaLabel = document.getElementById("addressSelectedAreaLabel");
    if (!areaLabel) {
        return;
    }
    areaLabel.textContent = addressLocationAreaLabel || "No delivery area selected yet";
    syncAddressFormLockState();
}

function syncAddressFormLockState() {
    const ids = [
        "addressLabel",
        "addressRecipientName",
        "addressPhoneNumber",
        "addressLine",
        "addressLandmark",
        "addressCity",
        "addressState",
        "addressPincode",
        "addressDefault"
    ];

    ids.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }
        element.disabled = !addressLocationConfirmed;
    });

    const lockHint = document.getElementById("addressDetailsLockHint");
    if (lockHint) {
        lockHint.textContent = addressLocationConfirmed
            ? "Location confirmed. Fill complete address details below."
            : "Step 3: Confirm map pin first, then complete full address details.";
        lockHint.className = `address-details-lock-hint ${addressLocationConfirmed ? "ready" : "locked"}`;
    }

    const summary = document.getElementById("addressSelectedAreaRow");
    if (summary) {
        summary.classList.toggle("visible", Boolean(addressLocationAreaLabel));
    }

    const confirmButton = document.getElementById("addressConfirmPinButton");
    if (confirmButton) {
        confirmButton.disabled = !hasAddressPinSelection();
    }

    const detailsSection = document.getElementById("addressDetailsSection");
    if (detailsSection) {
        detailsSection.classList.toggle("visible", addressLocationConfirmed);
        detailsSection.classList.toggle("hidden", !addressLocationConfirmed);
    }

    const mapCanvas = document.getElementById("addressMapCanvas");
    if (mapCanvas) {
        const shouldHideMap = !hasAddressPinSelection() && !addressLocationConfirmed;
        const wasHidden = mapCanvas.classList.contains("address-map-canvas-hidden");
        mapCanvas.classList.toggle("address-map-canvas-hidden", shouldHideMap);
        if (wasHidden && !shouldHideMap && addressMap) {
            window.setTimeout(() => {
                if (addressMap) {
                    addressMap.invalidateSize();
                }
            }, 90);
        }
    }
}

function updateAddressCoordinateInputs(latitude, longitude) {
    const latitudeInput = document.getElementById("addressLatitude");
    const longitudeInput = document.getElementById("addressLongitude");
    if (latitudeInput) {
        latitudeInput.value = formatCoordinate(latitude);
    }
    if (longitudeInput) {
        longitudeInput.value = formatCoordinate(longitude);
    }
    syncAddressFormLockState();
}

function destroyAddressMap() {
    if (addressMapSearchDebounceTimer) {
        clearTimeout(addressMapSearchDebounceTimer);
        addressMapSearchDebounceTimer = null;
    }
    addressPendingSearchSelection = null;
    if (addressMap) {
        addressMap.remove();
    }
    addressMap = null;
    addressMapMarker = null;
    addressMapSearchResultsCache = [];
    addressMapSearchLayer = null;
}

function getAddressMapInitialCoordinates(editingAddress) {
    const existing = getAddressCoordinates(editingAddress);
    if (existing) {
        return existing;
    }

    const selectedLatitude = parseCoordinate(selectedLocation?.latitude ?? selectedLocation?.lat);
    const selectedLongitude = parseCoordinate(selectedLocation?.longitude ?? selectedLocation?.lng ?? selectedLocation?.lon);
    if (selectedLatitude != null && selectedLongitude != null) {
        return { latitude: selectedLatitude, longitude: selectedLongitude };
    }

    return { latitude: 28.6139, longitude: 77.2090 };
}

function ensureLeafletAssets() {
    if (window.L && typeof window.L.map === "function") {
        return Promise.resolve(window.L);
    }
    if (addressMapLoadingPromise) {
        return addressMapLoadingPromise;
    }

    addressMapLoadingPromise = new Promise((resolve, reject) => {
        const existingCss = document.getElementById("leafletStylesheet");
        if (!existingCss) {
            const leafletCss = document.createElement("link");
            leafletCss.id = "leafletStylesheet";
            leafletCss.rel = "stylesheet";
            leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
            leafletCss.crossOrigin = "";
            document.head.appendChild(leafletCss);
        }

        const onReady = () => {
            if (window.L && typeof window.L.map === "function") {
                resolve(window.L);
            } else {
                reject(new Error("Map library unavailable"));
            }
        };

        const existingScript = document.getElementById("leafletScript");
        if (existingScript) {
            existingScript.addEventListener("load", onReady, { once: true });
            existingScript.addEventListener("error", () => reject(new Error("Map script failed to load")), { once: true });
            if (window.L && typeof window.L.map === "function") {
                onReady();
            }
            return;
        }

        const leafletScript = document.createElement("script");
        leafletScript.id = "leafletScript";
        leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletScript.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        leafletScript.crossOrigin = "";
        leafletScript.async = true;
        leafletScript.addEventListener("load", onReady, { once: true });
        leafletScript.addEventListener("error", () => reject(new Error("Map script failed to load")), { once: true });
        document.body.appendChild(leafletScript);
    }).catch((error) => {
        addressMapLoadingPromise = null;
        throw error;
    });

    return addressMapLoadingPromise;
}

async function initializeAddressMap(editingAddress = null) {
    const canvas = document.getElementById("addressMapCanvas");
    if (!canvas) {
        return;
    }

    destroyAddressMap();
    setAddressMapStatus("Loading map...", "loading");

    try {
        const L = await ensureLeafletAssets();
        const existingCoordinates = getAddressCoordinates(editingAddress);
        const initialCoordinates = existingCoordinates || getAddressMapInitialCoordinates(editingAddress);
        addressMap = L.map(canvas, { zoomControl: true }).setView(
            [initialCoordinates.latitude, initialCoordinates.longitude],
            16
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(addressMap);

        addressMapMarker = L.marker([initialCoordinates.latitude, initialCoordinates.longitude], {
            draggable: true
        }).addTo(addressMap);

        if (existingCoordinates) {
            updateAddressCoordinateInputs(initialCoordinates.latitude, initialCoordinates.longitude);
        } else {
            updateAddressCoordinateInputs(null, null);
        }

        addressMap.on("click", (mapEvent) => {
            if (!addressMapMarker) {
                return;
            }
            clearAddressMapSearchLayer();
            const { lat, lng } = mapEvent.latlng;
            addressMapMarker.setLatLng([lat, lng]);
            updateAddressCoordinateInputs(lat, lng);
            setAddressMapStatus("Pin moved. Click 'Confirm and proceed'.", "success");
        });

        addressMapMarker.on("dragend", () => {
            clearAddressMapSearchLayer();
            const markerPosition = addressMapMarker.getLatLng();
            updateAddressCoordinateInputs(markerPosition.lat, markerPosition.lng);
            setAddressMapStatus("Pin moved. Click 'Confirm and proceed'.", "success");
        });

        setAddressMapStatus(
            existingCoordinates
                ? "Existing pin loaded. Adjust it if needed."
                : "Tap on map to set your exact delivery pin.",
            "success"
        );

        if (addressPendingSearchSelection) {
            const pending = addressPendingSearchSelection;
            addressPendingSearchSelection = null;
            selectAddressMapSearchResult(pending.latitude, pending.longitude, pending.label, pending.bounds, false);
        }

        window.setTimeout(() => {
            if (addressMap) {
                addressMap.invalidateSize();
            }
        }, 120);
    } catch {
        canvas.classList.add("address-map-unavailable");
        setAddressMapStatus("Map could not load right now. You can still save address manually.", "error");
    }
}

async function centerAddressMapOnCurrentLocation() {
    if (!navigator.geolocation) {
        setAddressMapStatus("Geolocation is not supported in this browser.", "error");
        return;
    }
    if (!addressMap || !addressMapMarker) {
        setAddressMapStatus("Map is not ready yet. Please wait a moment.", "error");
        return;
    }

    setAddressMapStatus("Detecting your current location...", "loading");

    try {
        const position = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        addressMap.setView([latitude, longitude], Math.max(16, addressMap.getZoom()));
        addressMapMarker.setLatLng([latitude, longitude]);
        updateAddressCoordinateInputs(latitude, longitude);
        renderAddressMapSearchResults([]);
        setAddressLocationAreaLabel("Live location");
        setAddressMapStatus("Live location shown. Adjust pin exactly, then click 'Confirm and proceed'.", "success");
    } catch {
        setAddressMapStatus("Unable to detect your location. Please allow GPS access and retry.", "error");
    }
}

function parseSearchBoundingBox(boundingbox) {
    if (!Array.isArray(boundingbox) || boundingbox.length < 4) {
        return null;
    }
    const south = parseCoordinate(boundingbox[0]);
    const north = parseCoordinate(boundingbox[1]);
    const west = parseCoordinate(boundingbox[2]);
    const east = parseCoordinate(boundingbox[3]);
    if (south == null || north == null || west == null || east == null) {
        return null;
    }
    return { south, north, west, east };
}

function normalizeSearchQuery(query) {
    return String(query || "")
        .trim()
        .replace(/[^\p{L}\p{N}\s,.-]/gu, "")
        .replace(/\s+/g, " ");
}

function getAddressSearchBiasCoordinates() {
    if (addressMapMarker && typeof addressMapMarker.getLatLng === "function") {
        const markerPosition = addressMapMarker.getLatLng();
        if (markerPosition?.lat != null && markerPosition?.lng != null) {
            return { latitude: markerPosition.lat, longitude: markerPosition.lng };
        }
    }
    return loadAddressSearchBias();
}

function buildSearchViewbox(bias, query) {
    if (!bias) {
        return null;
    }
    const tokens = normalizeSearchQuery(query).toLowerCase().split(/\s+/).filter(Boolean);
    const isShortQuery = tokens.length <= 2 && tokens.join("").length <= 10;
    const radius = isShortQuery ? 0.28 : 0.5;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const south = clamp(bias.latitude - radius, -90, 90);
    const north = clamp(bias.latitude + radius, -90, 90);
    const west = clamp(bias.longitude - radius, -180, 180);
    const east = clamp(bias.longitude + radius, -180, 180);
    return {
        viewbox: `${west},${south},${east},${north}`,
        bounded: isShortQuery ? "1" : "0"
    };
}

function computeApproxDistanceKm(origin, target) {
    if (!origin || !target) {
        return null;
    }
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(target.latitude - origin.latitude);
    const dLng = toRad(target.longitude - origin.longitude);
    const lat1 = toRad(origin.latitude);
    const lat2 = toRad(target.latitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
}

function getSearchResultCoordinates(item) {
    const latitude = parseCoordinate(item?.lat ?? item?.latitude);
    const longitude = parseCoordinate(item?.lon ?? item?.longitude);
    if (latitude == null || longitude == null) {
        return null;
    }
    return { latitude, longitude };
}

function getSearchResultScore(item, queryTokens, queryText, bias) {
    const label = String(item?.display_name || "").toLowerCase();
    const importance = Number(item?.importance) || 0;
    const type = String(item?.type || "").toLowerCase();
    const placeClass = String(item?.class || "").toLowerCase();
    const address = item?.address || {};
    let score = importance * 10;

    if (label.startsWith(queryText)) {
        score += 2;
    }
    const tokenMatches = queryTokens.reduce((count, token) => count + (label.includes(token) ? 1 : 0), 0);
    score += tokenMatches * 0.4;

    if (["neighbourhood", "suburb", "city_district", "quarter"].includes(type)) {
        score += 1.5;
    }
    if (["city", "town", "village", "hamlet"].includes(type)) {
        score += 1;
    }
    if (placeClass === "boundary" && type === "administrative") {
        score -= 0.8;
    }
    if (String(address.country_code || "").toLowerCase() === "in") {
        score += 0.8;
    }
    if (address.city || address.town || address.village || address.county || address.state) {
        score += 0.4;
    }

    const coordinates = getSearchResultCoordinates(item);
    const distanceKm = coordinates ? computeApproxDistanceKm(bias, coordinates) : null;
    if (distanceKm != null) {
        score += Math.max(0, 3 - distanceKm / 12);
    }
    return score;
}

function rankSearchResults(results, query, bias) {
    const cleanedQuery = normalizeSearchQuery(query);
    const queryText = cleanedQuery.toLowerCase();
    const tokens = queryText.split(/\s+/).filter(Boolean);
    return results
        .slice()
        .sort((a, b) => getSearchResultScore(b, tokens, queryText, bias) - getSearchResultScore(a, tokens, queryText, bias));
}

function dedupeSearchResults(results) {
    const seen = new Set();
    return results.filter((item) => {
        const coordinates = getSearchResultCoordinates(item);
        const lat = coordinates ? coordinates.latitude.toFixed(4) : "";
        const lng = coordinates ? coordinates.longitude.toFixed(4) : "";
        const label = String(item?.display_name || "").toLowerCase();
        const key = `${lat}|${lng}|${label}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function clearAddressMapSearchLayer() {
    if (addressMap && addressMapSearchLayer && typeof addressMap.removeLayer === "function") {
        addressMap.removeLayer(addressMapSearchLayer);
    }
    addressMapSearchLayer = null;
}

function computeBoundsDistance(bounds) {
    if (!bounds) {
        return 0;
    }
    const latDelta = Math.abs(bounds.north - bounds.south);
    const lngDelta = Math.abs(bounds.east - bounds.west);
    return Math.max(latDelta, lngDelta);
}

function normalizeSearchResult(item) {
    const latitude = parseCoordinate(item?.lat);
    const longitude = parseCoordinate(item?.lon);
    if (latitude == null || longitude == null) {
        return null;
    }
    const label = String(item.display_name || "Selected location");
    const labelParts = label.split(",").map((part) => part.trim()).filter(Boolean);
    return {
        latitude,
        longitude,
        label,
        title: labelParts[0] || label,
        subtitle: labelParts.slice(1).join(", "),
        bounds: parseSearchBoundingBox(item.boundingbox)
    };
}

function renderAddressMapSearchResults(results = []) {
    const host = document.getElementById("addressMapSearchResults");
    if (!host) {
        return;
    }

    if (!Array.isArray(results) || !results.length) {
        addressMapSearchResultsCache = [];
        host.innerHTML = "";
        return;
    }

    addressMapSearchResultsCache = results
        .map(normalizeSearchResult)
        .filter(Boolean);

    host.innerHTML = addressMapSearchResultsCache.map((item, index) => `
        <button
            class="address-map-result"
            type="button"
            onclick="selectAddressMapSearchResultByIndex(${index})"
        >
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.subtitle || item.label)}</p>
        </button>
    `).join("");
}

async function selectAddressMapSearchResult(latitude, longitude, label = "Selected location", bounds = null, autoFill = false) {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    if (lat == null || lng == null || !addressMap || !addressMapMarker) {
        setAddressMapStatus("Unable to pin this location on map.", "error");
        return;
    }

    const preferredZoom = 16;
    const shouldFitBounds = bounds && typeof addressMap.fitBounds === "function" && computeBoundsDistance(bounds) > 0.005;
    if (shouldFitBounds) {
        addressMap.fitBounds(
            [
                [bounds.south, bounds.west],
                [bounds.north, bounds.east]
            ],
            { padding: [30, 30], maxZoom: preferredZoom }
        );
    } else {
        addressMap.flyTo([lat, lng], preferredZoom, { duration: 0.7 });
    }
    addressMapMarker.setLatLng([lat, lng]);
    updateAddressCoordinateInputs(lat, lng);
    saveAddressSearchBias(lat, lng);
    setAddressLocationAreaLabel(label);
    addressLocationConfirmed = false;
    syncAddressFormLockState();

    clearAddressMapSearchLayer();
    if (window.L && typeof window.L.circle === "function") {
        addressMapSearchLayer = window.L.circle([lat, lng], {
            radius: 260,
            color: "#cb202d",
            weight: 2,
            fillColor: "#cb202d",
            fillOpacity: 0.12
        }).addTo(addressMap);
    }

    if (autoFill) {
        setAddressMapStatus(`Pinned: ${label}. Auto-filling address...`, "loading");
        await autofillAddressFromMapPin();
    } else {
        setAddressMapStatus(`Area loaded for ${label}. Set exact pin and click 'Confirm and proceed'.`, "success");
    }
}

function selectAddressMapSearchResultByIndex(index) {
    const selected = addressMapSearchResultsCache[index];
    if (!selected) {
        return;
    }
    renderAddressMapSearchResults([]);
    if (!addressMap || !addressMapMarker) {
        addressPendingSearchSelection = selected;
        setAddressMapStatus("Loading map for selected area...", "loading");
        return;
    }
    selectAddressMapSearchResult(selected.latitude, selected.longitude, selected.label, selected.bounds, false);
}

async function fetchAddressSearchResults(query) {
    const cleanedQuery = normalizeSearchQuery(query);
    const bias = getAddressSearchBiasCoordinates();
    const viewbox = buildSearchViewbox(bias, cleanedQuery);
    const buildSearchUrl = (forceIndia) => {
        const params = new URLSearchParams({
            format: "jsonv2",
            q: forceIndia ? `${cleanedQuery}, India` : cleanedQuery,
            limit: "8",
            addressdetails: "1"
        });
        if (forceIndia) {
            params.set("countrycodes", "in");
        }
        if (viewbox?.viewbox) {
            params.set("viewbox", viewbox.viewbox);
        }
        if (viewbox?.bounded === "1") {
            params.set("bounded", "1");
        }
        return `${FORWARD_GEOCODE_BASE_URL}?${params.toString()}`;
    };

    let response = await fetch(buildSearchUrl(true), {
        headers: { Accept: "application/json", "Accept-Language": "en" }
    });
    let results = response.ok ? await response.json() : [];

    if (!Array.isArray(results) || !results.length) {
        response = await fetch(buildSearchUrl(false), {
            headers: { Accept: "application/json", "Accept-Language": "en" }
        });
        results = response.ok ? await response.json() : [];
    }
    if (Array.isArray(results) && results.length) {
        return rankSearchResults(dedupeSearchResults(results), cleanedQuery, bias);
    }

    const photonParams = new URLSearchParams({
        q: `${cleanedQuery}, India`,
        limit: "8"
    });
    response = await fetch(`${PHOTON_GEOCODE_BASE_URL}?${photonParams.toString()}`, {
        headers: { Accept: "application/json", "Accept-Language": "en" }
    });
    if (!response.ok) {
        return [];
    }
    const photonPayload = await response.json();
    const features = Array.isArray(photonPayload?.features) ? photonPayload.features : [];

    const photonResults = features
        .map((feature) => {
            const coordinates = feature?.geometry?.coordinates;
            const properties = feature?.properties || {};
            if (!Array.isArray(coordinates) || coordinates.length < 2) {
                return null;
            }
            const longitude = parseCoordinate(coordinates[0]);
            const latitude = parseCoordinate(coordinates[1]);
            if (latitude == null || longitude == null) {
                return null;
            }
            const labelParts = [
                properties.name,
                properties.street,
                properties.city || properties.county || properties.state
            ].filter(Boolean);
            return {
                lat: latitude,
                lon: longitude,
                display_name: labelParts.join(", ") || cleanedQuery
            };
        })
        .filter(Boolean);

    return rankSearchResults(dedupeSearchResults(photonResults), cleanedQuery, bias);
}

function handleAddressMapSearchKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchAddressOnMap(event);
    }
}

function handleAddressMapSearchInput() {
    if (addressMapSearchDebounceTimer) {
        clearTimeout(addressMapSearchDebounceTimer);
        addressMapSearchDebounceTimer = null;
    }

    const query = String(document.getElementById("addressMapSearchInput")?.value || "").trim();
    if (query.length < 2) {
        renderAddressMapSearchResults([]);
        return;
    }

    addressMapSearchDebounceTimer = window.setTimeout(() => {
        searchAddressOnMap(null);
    }, 260);
}

async function searchAddressOnMap(event) {
    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }

    const searchInput = document.getElementById("addressMapSearchInput");
    const query = String(searchInput?.value || "").trim();
    if (!query) {
        setAddressMapStatus("Enter an area, building, or street name to search on map.", "error");
        renderAddressMapSearchResults([]);
        return;
    }

    setAddressMapStatus("Searching location on map...", "loading");

    try {
        const results = await fetchAddressSearchResults(query);

        if (!Array.isArray(results) || !results.length) {
            renderAddressMapSearchResults([]);
            setAddressMapStatus("No matching location found. Try adding city/state in search.", "error");
            return;
        }

        const topResults = results.slice(0, 7);
        renderAddressMapSearchResults(topResults);
        setAddressMapStatus("Select one location from results to open it on map.", "success");
    } catch {
        renderAddressMapSearchResults([]);
        setAddressMapStatus("Unable to search map location right now.", "error");
    }
}

function getAddressLineFromMapAddress(address) {
    return [
        [address.house_number, address.road].filter(Boolean).join(" ").trim(),
        [address.building, address.road].filter(Boolean).join(", "),
        [address.road, address.neighbourhood].filter(Boolean).join(", "),
        [address.suburb, address.neighbourhood].filter(Boolean).join(", ")
    ].find((value) => Boolean(value && value.trim())) || "";
}

async function autofillAddressFromMapPin() {
    const latitudeInput = document.getElementById("addressLatitude");
    const longitudeInput = document.getElementById("addressLongitude");
    const addressLineInput = document.getElementById("addressLine");
    const areaInput = document.getElementById("addressLandmark");
    const areaOptions = document.getElementById("addressAreaOptions");
    const cityInput = document.getElementById("addressCity");
    const stateInput = document.getElementById("addressState");
    const pincodeInput = document.getElementById("addressPincode");

    const latitude = parseCoordinate(latitudeInput?.value);
    const longitude = parseCoordinate(longitudeInput?.value);

    if (latitude == null || longitude == null) {
        setAddressMapStatus("Set a pin on map before auto-filling address.", "error");
        return false;
    }

    setAddressMapStatus("Fetching address details from map pin...", "loading");

    const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        zoom: "18",
        addressdetails: "1"
    });

    try {
        const response = await fetch(`${REVERSE_GEOCODE_BASE_URL}?${params.toString()}`, {
            headers: { Accept: "application/json" }
        });
        if (!response.ok) {
            throw new Error("Reverse geocode request failed");
        }

        const payload = await response.json();
        const address = payload?.address;
        if (!address) {
            throw new Error("No address details found");
        }

        const locality = [
            address.neighbourhood,
            address.suburb,
            address.city_district,
            address.quarter,
            address.hamlet
        ].find(Boolean) || "";

        const mapAddressLine = getAddressLineFromMapAddress(address);
        const mappedCity = address.city || address.town || address.village || address.county || "";
        const mappedState = address.state || "";
        const mappedPincode = String(address.postcode || "").replace(/\D/g, "").slice(0, 6);

        if (addressLineInput && mapAddressLine) {
            addressLineInput.value = mapAddressLine;
        }
        if (areaInput && locality) {
            areaInput.value = locality;
        }
        if (areaOptions) {
            areaOptions.innerHTML = renderAreaOptions(locality ? [locality] : [], areaInput?.value.trim() || "");
        }
        if (cityInput && mappedCity) {
            cityInput.value = mappedCity;
        }
        if (stateInput && mappedState) {
            stateInput.value = mappedState;
        }
        if (pincodeInput && mappedPincode) {
            pincodeInput.value = mappedPincode;
        }

        const displayArea = [
            locality,
            mappedCity,
            mappedState
        ].filter(Boolean).join(", ");
        if (displayArea) {
            setAddressLocationAreaLabel(displayArea);
        }

        setAddressLookupFeedback("Address fields auto-filled from map pin. Please verify house/flat details.", "success");
        setAddressMapStatus("Location confirmed. Now fill complete address details below.", "success");
        return true;
    } catch {
        setAddressMapStatus("Could not auto-fill address from map pin right now.", "error");
        return false;
    }
}

async function confirmAddressPinAndProceed() {
    if (!hasAddressPinSelection()) {
        setAddressMapStatus("Set exact pin on map first.", "error");
        return;
    }

    const success = await autofillAddressFromMapPin();
    if (!success) {
        return;
    }

    addressLocationConfirmed = true;
    if (addressMapMarker && typeof addressMapMarker.getLatLng === "function") {
        const markerPosition = addressMapMarker.getLatLng();
        saveAddressSearchBias(markerPosition?.lat, markerPosition?.lng);
    }
    syncAddressFormLockState();
}

function changeAddressLocationSelection() {
    addressLocationConfirmed = false;
    syncAddressFormLockState();
    setAddressMapStatus("Update map pin and click 'Confirm and proceed' again.", "loading");
}

async function fetchCategories() {
    categories = await fetchJson(`${API_BASE_URL}/categories/active`);
    renderCategories();
}

async function fetchRestaurants(category = activeCategory, searchQuery = "") {
    restaurantsLoading = true;
    renderRestaurants();
    const params = new URLSearchParams();
    const location = getSelectedLocationFilters();
    if (location.city) {
        params.set("city", location.city);
    }
    if (location.locality) {
        params.set("locality", location.locality);
    }
    if (category && category !== "all") {
        params.set("category", category);
    }
    if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
    }
    const endpoint = `${API_BASE_URL}/restaurants/active${params.toString() ? `?${params.toString()}` : ""}`;
    try {
        restaurants = await fetchJson(endpoint);
        visibleRestaurantCount = RESTAURANT_PAGE_SIZE;
        clearErrorMessage();
    } catch (error) {
        restaurants = [];
        showErrorMessage(error.message || "Unable to load restaurants right now.");
    } finally {
        restaurantsLoading = false;
        renderRestaurants();
        if (document.getElementById("offersModal")?.classList.contains("open")) {
            renderOffersModal();
        }
    }
}

async function fetchAddresses() {
    try {
        const addresses = await fetchJson(`${API_BASE_URL}/addresses`);
        savedAddresses = Array.isArray(addresses) ? addresses : [];
    } catch {
        savedAddresses = [];
    }
    renderCart();
    renderAddressBook();
}

async function fetchFavoriteRestaurants() {
    try {
        const favorites = await fetchJson(`${API_BASE_URL}/favorites/restaurants`);
        favoriteRestaurants = Array.isArray(favorites) ? favorites : [];
    } catch {
        favoriteRestaurants = [];
    }
    renderRestaurants();
    if (currentUser) {
        renderAuthModal();
    }
}

async function fetchFavoriteMenuItems() {
    try {
        const favorites = await fetchJson(`${API_BASE_URL}/favorites/menu-items`);
        favoriteMenuItems = Array.isArray(favorites) ? favorites : [];
    } catch {
        favoriteMenuItems = [];
    }
    if (activeRestaurant) {
        renderMenuModal();
    }
    if (currentUser) {
        renderAuthModal();
    }
}

async function fetchPaymentMethods() {
    try {
        const methods = await fetchJson(`${API_BASE_URL}/payments/methods`);
        savedPaymentMethods = Array.isArray(methods) ? methods : [];
    } catch {
        savedPaymentMethods = [];
    }
    ensureCheckoutPaymentChoice();
    renderCart();
    if (currentUser) {
        renderAuthModal();
    }
}

async function fetchSubscriptionData() {
    if (!currentUser?.id) {
        subscriptionPlans = [];
        currentSubscription = null;
        subscriptionLoading = false;
        return;
    }

    subscriptionLoading = true;
    if (activeAccountSection === "subscription") {
        renderAuthModal();
    }

    try {
        const [plans, subscription] = await Promise.all([
            fetchJson(`${API_BASE_URL}/subscriptions/plans`),
            fetchJson(`${API_BASE_URL}/subscriptions/me`)
        ]);
        subscriptionPlans = Array.isArray(plans) ? plans : [];
        currentSubscription = subscription && typeof subscription === "object" ? subscription : null;
    } catch {
        subscriptionPlans = [];
        currentSubscription = null;
    } finally {
        subscriptionLoading = false;
        renderCart();
        if (currentUser && activeAccountSection === "subscription") {
            renderAuthModal();
        }
    }
}

async function fetchOrders() {
    try {
        const orders = await fetchJson(`${API_BASE_URL}/orders/mine`);
        orderHistory = Array.isArray(orders) ? orders : [];
    } catch {
        orderHistory = [];
    }
    renderOrders();
}

async function refreshCurrentUser() {
    try {
        const user = await fetchJson(`${API_BASE_URL}/users/me`);
        saveCurrentUser(user);
    } catch {
        saveCurrentUser(null);
        saveAuthToken("");
    }
}

function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    if (!container) {
        return;
    }

    container.innerHTML = categories.map((category) => `
        <button
            class="category-card ${activeCategory === (category.filter || "all") ? "active" : ""}"
            type="button"
            onclick="filterByCategory('${escapeAttribute(category.filter || "all")}')"
        >
            <img src="${category.image}" alt="${escapeHtml(category.name)}" class="category-image">
            <div class="category-overlay">
                <div class="category-name">${escapeHtml(category.name)}</div>
            </div>
        </button>
    `).join("");
}

function renderRestaurants() {
    const grid = document.getElementById("restaurantsGrid");
    const footer = document.getElementById("restaurantsFooter");
    if (!grid) {
        return;
    }
    renderDiscoveryFilters();

    if (restaurantsLoading) {
        grid.innerHTML = `<p class="empty-state">Loading restaurants...</p>`;
        if (footer) {
            footer.innerHTML = "";
        }
        return;
    }

    if (!restaurants.length) {
        const hasLocation = Boolean(selectedLocation?.label && selectedLocation.label.toLowerCase() !== "other");
        grid.innerHTML = `<p class="empty-state">${hasLocation ? "Not serviceable in this area." : "No restaurants found for this selection."}</p>`;
        if (footer) {
            footer.innerHTML = "";
        }
        return;
    }

    const filteredRestaurants = restaurants.filter((restaurant) => {
        if (discoveryFilters.minRating > 0 && Number(restaurant.rating || 0) < discoveryFilters.minRating) {
            return false;
        }
        if (discoveryFilters.maxEta > 0 && parseDeliveryEtaMinutes(restaurant.time) > discoveryFilters.maxEta) {
            return false;
        }
        if (discoveryFilters.maxPriceForTwo > 0 && estimateRestaurantPriceForTwo(restaurant) > discoveryFilters.maxPriceForTwo) {
            return false;
        }
        if (discoveryFilters.vegOnly && !isVegFriendlyRestaurant(restaurant)) {
            return false;
        }
        return true;
    });

    if (!filteredRestaurants.length) {
        grid.innerHTML = `<p class="empty-state">No restaurants match your selected filters.</p>`;
        if (footer) {
            footer.innerHTML = "";
        }
        return;
    }

    const visibleRestaurants = filteredRestaurants.slice(0, visibleRestaurantCount);
    grid.innerHTML = `
        ${visibleRestaurants.map((restaurant) => `
        <article
            class="restaurant-card"
            role="button"
            tabindex="0"
            onclick="openRestaurantMenu('${escapeAttribute(restaurant.restaurantId)}')"
            onkeydown="handleRestaurantKeydown(event, '${escapeAttribute(restaurant.restaurantId)}')"
        >
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${escapeHtml(restaurant.name)}">
                ${restaurant.discount ? `<div class="discount-badge">${escapeHtml(restaurant.discount)}</div>` : ""}
                <button
                    class="favorite-toggle ${isRestaurantFavorite(restaurant.restaurantId) ? "active" : ""}"
                    type="button"
                    onclick="toggleRestaurantFavorite(event, '${escapeAttribute(restaurant.restaurantId)}')"
                    aria-label="${isRestaurantFavorite(restaurant.restaurantId) ? "Remove from favorites" : "Add to favorites"}"
                >
                    ${isRestaurantFavorite(restaurant.restaurantId) ? "&#9829;" : "&#9825;"}
                </button>
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">
                    ${escapeHtml(restaurant.name)}
                    ${restaurant.verified ? ' <span class="verified-mark">Verified</span>' : ""}
                </div>
                <div class="restaurant-cuisine">${escapeHtml(restaurant.cuisine || "")}</div>
                ${(restaurant.locality || restaurant.city) ? `
                    <div class="restaurant-serving">
                        Serves ${escapeHtml([restaurant.locality, restaurant.city].filter(Boolean).join(", "))}
                    </div>
                ` : ""}
                <div class="restaurant-meta">
                    <div class="rating">&#9733; ${formatNumber(restaurant.rating)}</div>
                    <div class="delivery-time">${escapeHtml(restaurant.time || "")}</div>
                </div>
            </div>
        </article>
    `).join("")}
    `;

    if (footer) {
        const hasMore = visibleRestaurantCount < filteredRestaurants.length;
        footer.innerHTML = `
            <p class="restaurants-count">Showing ${Math.min(visibleRestaurantCount, filteredRestaurants.length)} of ${filteredRestaurants.length} restaurants</p>
            ${hasMore ? `<button class="secondary-button restaurants-load-more" type="button" onclick="loadMoreRestaurants()">Load more</button>` : ""}
        `;
    }
}

function loadMoreRestaurants() {
    visibleRestaurantCount += RESTAURANT_PAGE_SIZE;
    renderRestaurants();
}

function isRestaurantFavorite(restaurantId) {
    return favoriteRestaurants.some((favorite) => favorite.restaurantId === restaurantId);
}

async function toggleRestaurantFavorite(event, restaurantId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    try {
        if (isRestaurantFavorite(restaurantId)) {
            await fetchJson(`${API_BASE_URL}/favorites/restaurants/${encodeURIComponent(restaurantId)}`, {
                method: "DELETE"
            });
        } else {
            await fetchJson(`${API_BASE_URL}/favorites/restaurants/${encodeURIComponent(restaurantId)}`, {
                method: "POST"
            });
        }
        await fetchFavoriteRestaurants();
    } catch (error) {
        alert(error.message || "Failed to update favorites.");
    }
}

async function filterByCategory(category) {
    activeCategory = category;
    const title = document.getElementById("restaurantSectionTitle");
    if (title) {
        title.textContent = category === "all"
            ? "Top restaurant chains in your city"
            : `${capitalize(category)} restaurants`;
    }
    renderCategories();
    await fetchRestaurants(category, document.getElementById("searchInput")?.value || "");
}

async function searchRestaurants(query) {
    await fetchRestaurants(activeCategory, query);
}

async function openRestaurantMenu(restaurantCode) {
    const modal = document.getElementById("menuModal");
    const content = document.getElementById("menuModalContent");
    if (!modal || !content) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    content.innerHTML = `<div class="modal-loading">Loading restaurant menu...</div>`;

    try {
        const [restaurant, menuResponse] = await Promise.all([
            fetchJson(`${API_BASE_URL}/restaurants/restaurantId/${encodeURIComponent(restaurantCode)}`),
            fetchJson(`${API_BASE_URL}/menu-items/restaurant-code/${encodeURIComponent(restaurantCode)}?activeOnly=true&availableOnly=true&size=100&sortBy=popular`)
        ]);

        activeRestaurant = restaurant;
        activeMenuItems = menuResponse.items || [];
        renderMenuModal();
        window.location.hash = restaurantCode;
    } catch (error) {
        content.innerHTML = `
            <div class="modal-error">
                <h3>Unable to load restaurant details</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
    }
}

function renderMenuModal(filter = "all") {
    const content = document.getElementById("menuModalContent");
    if (!content || !activeRestaurant) {
        return;
    }

    const menuCategories = [...new Set(activeMenuItems.map((item) => item.category).filter(Boolean))];
    const items = filter === "all"
        ? activeMenuItems
        : activeMenuItems.filter((item) => item.category === filter);

    const currentCartRestaurant = cart.restaurantCode && cart.restaurantCode !== activeRestaurant.restaurantId
        ? `<p class="cart-restaurant-warning">Your cart currently has items from ${escapeHtml(cart.restaurantName)}. Adding from this restaurant will replace them.</p>`
        : "";

    content.innerHTML = `
        <section class="menu-hero">
            <img class="menu-hero-image" src="${activeRestaurant.image}" alt="${escapeHtml(activeRestaurant.name)}">
            <div class="menu-hero-copy">
                <p class="menu-eyebrow">${capitalize(activeRestaurant.category || "featured")} kitchen</p>
                <h2>${escapeHtml(activeRestaurant.name)}</h2>
                <p class="menu-cuisine">${escapeHtml(activeRestaurant.cuisine || "")}</p>
                <div class="menu-stats">
                    <span>&#9733; ${formatNumber(activeRestaurant.rating)}</span>
                    <span>${escapeHtml(activeRestaurant.time || "Fast delivery")}</span>
                    <span>${activeRestaurant.discount ? escapeHtml(activeRestaurant.discount) : "Fresh daily offers"}</span>
                </div>
                ${currentCartRestaurant}
            </div>
        </section>

        <section class="menu-toolbar">
            <div class="menu-filter-row">
                <button class="menu-chip ${filter === "all" ? "active" : ""}" type="button" onclick="renderMenuModal('all')">All</button>
                ${menuCategories.map((category) => `
                    <button class="menu-chip ${filter === category ? "active" : ""}" type="button" onclick="renderMenuModal('${escapeAttribute(category)}')">
                        ${escapeHtml(category)}
                    </button>
                `).join("")}
            </div>
            <div class="menu-toolbar-meta">
                <p class="menu-summary">${items.length} dishes available right now</p>
                <button class="secondary-button" type="button" onclick="openCart()">Open cart</button>
            </div>
        </section>

        <section class="menu-grid">
            ${items.map((item) => `
                <article class="menu-item-card">
                    <div class="menu-item-copy">
                        <div class="menu-item-topline">
                            <span class="menu-item-category">${escapeHtml(item.category || "Special")}</span>
                            ${item.bestSeller ? '<span class="menu-badge">Popular</span>' : ""}
                            <button
                                class="menu-favorite-toggle ${isMenuItemFavorite(item.itemId) ? "active" : ""}"
                                type="button"
                                onclick="toggleMenuItemFavorite(event, '${escapeAttribute(item.itemId)}')"
                                aria-label="${isMenuItemFavorite(item.itemId) ? "Remove from favorites" : "Add to favorites"}"
                            >
                                ${isMenuItemFavorite(item.itemId) ? "&#9829;" : "&#9825;"}
                            </button>
                        </div>
                        <h3>${escapeHtml(item.name)}</h3>
                        <p>${escapeHtml(item.description || "Freshly prepared and ready to order.")}</p>
                        <div class="menu-item-meta">
                            <span class="menu-price">${formatCurrency(item.discountedPrice || item.price)}</span>
                            ${item.discount && item.discount > 0 ? `<span class="menu-discount">${item.discount}% off</span>` : ""}
                            ${item.vegetarian ? '<span class="diet-pill">Veg</span>' : ""}
                            ${item.vegan ? '<span class="diet-pill">Vegan</span>' : ""}
                        </div>
                    </div>
                    <div class="menu-item-aside">
                        <img class="menu-item-image" src="${item.image || activeRestaurant.image}" alt="${escapeHtml(item.name)}">
                        ${renderMenuItemCartAction(item)}
                    </div>
                </article>
            `).join("")}
        </section>
    `;
}

function isMenuItemFavorite(itemId) {
    return favoriteMenuItems.some((item) => item.itemId === itemId);
}

async function toggleMenuItemFavorite(event, itemId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    try {
        if (isMenuItemFavorite(itemId)) {
            await fetchJson(`${API_BASE_URL}/favorites/menu-items/${encodeURIComponent(itemId)}`, {
                method: "DELETE"
            });
        } else {
            await fetchJson(`${API_BASE_URL}/favorites/menu-items/${encodeURIComponent(itemId)}`, {
                method: "POST"
            });
        }
        await fetchFavoriteMenuItems();
    } catch (error) {
        alert(error.message || "Failed to update favorite dish.");
    }
}

function renderMenuItemCartAction(item) {
    const quantity = getCartItemQuantity(item.itemId);
    if (!quantity) {
        return `<button class="primary-button add-button" type="button" onclick="addToCart('${escapeAttribute(item.itemId)}')">Add to cart</button>`;
    }

    return `
        <div class="menu-cart-stepper" aria-label="Cart quantity controls">
            <button class="menu-cart-stepper-btn" type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', -1)">-</button>
            <span class="menu-cart-stepper-count">${quantity}</span>
            <button class="menu-cart-stepper-btn" type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', 1)">+</button>
        </div>
        <p class="menu-cart-note">Customisable</p>
    `;
}

function addToCart(itemId) {
    const item = activeMenuItems.find((menuItem) => menuItem.itemId === itemId);
    if (!item || !activeRestaurant) {
        return;
    }

    if (cart.restaurantCode && cart.restaurantCode !== activeRestaurant.restaurantId) {
        const shouldReplace = window.confirm(`Your cart has items from ${cart.restaurantName}. Replace them with items from ${activeRestaurant.name}?`);
        if (!shouldReplace) {
            return;
        }
        cart = createEmptyCart();
        resetCouponState();
    }

    cart.restaurantCode = activeRestaurant.restaurantId;
    cart.restaurantName = activeRestaurant.name;

    const existing = cart.items.find((cartItem) => cartItem.itemId === item.itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.items.push({
            itemId: item.itemId,
            name: item.name,
            price: item.discountedPrice || item.price,
            basePrice: item.price,
            quantity: 1,
            image: item.image || activeRestaurant.image,
            notes: ""
        });
    }

    saveCart();
    renderMenuModal();
}

function changeCartQuantity(itemId, delta) {
    const cartItem = cart.items.find((item) => item.itemId === itemId);
    if (!cartItem) {
        return;
    }

    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
        cart.items = cart.items.filter((item) => item.itemId !== itemId);
    }

    if (!cart.items.length) {
        cart = createEmptyCart();
        resetCouponState();
    }

    saveCart();
    if (activeRestaurant) {
        renderMenuModal();
    }
}

function openCart(event) {
    if (event) {
        event.preventDefault();
    }

    checkoutView = "cart";
    switchHeaderPanel("cart");

    const modal = document.getElementById("cartModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderCart();
}

function openPaymentPage(event) {
    if (event) {
        event.preventDefault();
    }
    checkoutView = "payment";
    paymentOffersOpen = false;
    renderCart();
}

function backToCart(event) {
    if (event) {
        event.preventDefault();
    }
    checkoutView = "cart";
    renderCart();
}

function togglePaymentOffers(event) {
    if (event) {
        event.preventDefault();
    }
    paymentOffersOpen = !paymentOffersOpen;
    renderCart();
}

function toggleNoContactDelivery(event) {
    if (event && event.target) {
        noContactDelivery = Boolean(event.target.checked);
    } else {
        noContactDelivery = !noContactDelivery;
    }
    renderCart();
}

function selectNetbankingBank(bankName) {
    netbankingBankChoice = bankName;
    checkoutPaymentChoice = "NETBANKING";
    paymentChoiceTouched = true;
    renderCart();
}

function dismissOrderSuccess() {
    latestOrderSuccess = null;
    renderCart();
}

function parseOrderDate(value) {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function plusMinutes(date, minutes) {
    if (!date) {
        return null;
    }
    return new Date(date.getTime() + (minutes * 60000));
}

function getTrackedOrderStage(order) {
    const status = String(order?.status || "").toUpperCase();

    if (status === "CANCELLED" || status === "DELIVERED") {
        return status;
    }

    const createdAt = parseOrderDate(order?.createdAt) || new Date();
    const estimatedDelivery = parseOrderDate(order?.estimatedDeliveryTime) || plusMinutes(createdAt, 35);
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));

    if (status === "OUT_FOR_DELIVERY") {
        if (estimatedDelivery && Date.now() >= estimatedDelivery.getTime() + (5 * 60000)) {
            return "DELIVERED";
        }
        return "OUT_FOR_DELIVERY";
    }

    if (elapsedMinutes < 5) {
        return "CONFIRMED";
    }
    if (elapsedMinutes < 16) {
        return "PREPARING";
    }
    if (estimatedDelivery && Date.now() >= estimatedDelivery.getTime() + (5 * 60000)) {
        return "DELIVERED";
    }
    return "OUT_FOR_DELIVERY";
}

function getEtaLabel(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "Cancelled";
    }
    if (stage === "DELIVERED") {
        const deliveredAt = parseOrderDate(order?.actualDeliveryTime);
        return deliveredAt ? `Delivered at ${formatTime(deliveredAt)}` : "Delivered";
    }

    const createdAt = parseOrderDate(order?.createdAt) || new Date();
    const estimatedDelivery = parseOrderDate(order?.estimatedDeliveryTime) || plusMinutes(createdAt, 35);
    if (!estimatedDelivery) {
        return "ETA TBD";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return `Arriving by ${formatTime(estimatedDelivery)}`;
    }
    return `ETA ${formatTime(estimatedDelivery)}`;
}

function getTrackingHeadline(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "This order was cancelled";
    }
    if (stage === "DELIVERED") {
        return "Delivered to your doorstep";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return "Rider is heading your way";
    }
    if (stage === "PREPARING") {
        return "Your food is being prepared";
    }
    return "Order confirmed by restaurant";
}

function getTrackingCopy(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "You can place a fresh order anytime from your favorites.";
    }
    if (stage === "DELIVERED") {
        return "Enjoy your meal. You can reorder this basket anytime.";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return "Packing is complete and your rider is on the route.";
    }
    if (stage === "PREPARING") {
        return "The kitchen has started cooking your items right now.";
    }
    return "We are locking your order details and assigning the kitchen.";
}

function getTrackingSubcopy(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "Refund status will reflect in your payment history.";
    }
    if (stage === "DELIVERED") {
        return "Thanks for ordering with SnapEats.";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return "Keep your phone handy for rider updates.";
    }
    if (stage === "PREPARING") {
        return "We will update you when it leaves the restaurant.";
    }
    return "Next update: preparing starts shortly.";
}

function buildSuccessTimeline(order) {
    const stage = getTrackedOrderStage(order);
    const stages = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    const activeIndex = stages.indexOf(stage);
    const effectiveIndex = activeIndex === -1 ? 0 : activeIndex;
    const copyByStep = {
        CONFIRMED: "Restaurant accepted your order.",
        PREPARING: "Kitchen is preparing your food.",
        OUT_FOR_DELIVERY: "Packed and out for delivery.",
        DELIVERED: "Delivered to your selected address."
    };

    return stages.map((entry, index) => ({
        title: formatStatus(entry),
        copy: copyByStep[entry],
        active: stage === "CANCELLED" ? false : index <= effectiveIndex
    }));
}

function buildOrderMilestones(order) {
    const stage = getTrackedOrderStage(order);
    const createdAt = parseOrderDate(order?.createdAt) || new Date();
    const confirmedAt = createdAt;
    const preparingAt = plusMinutes(createdAt, 8);
    const outForDeliveryAt = plusMinutes(createdAt, 18);
    const deliveredAt = parseOrderDate(order?.actualDeliveryTime)
        || parseOrderDate(order?.estimatedDeliveryTime)
        || plusMinutes(createdAt, 35);

    const steps = [
        { key: "CONFIRMED", label: "Confirmed", time: formatTime(confirmedAt) },
        { key: "PREPARING", label: "Preparing", time: formatTime(preparingAt) },
        { key: "OUT_FOR_DELIVERY", label: "Out for delivery", time: formatTime(outForDeliveryAt) },
        { key: "DELIVERED", label: "Delivered", time: stage === "DELIVERED" ? formatTime(deliveredAt) : "Pending" }
    ];

    if (stage === "CANCELLED") {
        return steps.map((step, index) => ({ ...step, active: index === 0 }));
    }

    const activeIndex = Math.max(0, steps.findIndex((step) => step.key === stage));
    return steps.map((step, index) => ({ ...step, active: index <= activeIndex }));
}

function openAddressBook(event) {
    if (event) {
        event.preventDefault();
    }

    switchHeaderPanel("address");

    const modal = document.getElementById("addressModal");
    if (!modal) {
        return;
    }
    if (!isAuthenticatedSession()) {
        showErrorMessage("Please log in again to manage saved addresses.");
        openAuthModal();
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderAddressBook();
}

function openOrders(event) {
    if (event) {
        event.preventDefault();
    }

    switchHeaderPanel("orders");

    const modal = document.getElementById("ordersModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderOrders(true);
    fetchOrders();
}

function openAuthModal(event) {
    if (event) {
        event.preventDefault();
    }

    switchHeaderPanel("auth");

    const modal = document.getElementById("authModal");
    if (!modal) {
        return;
    }
    if (!currentUser && (!otpAuthDraftIdentifier || otpAuthStep === "verify")) {
        resetOtpAuthFlow();
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderAuthModal();
}

function goHome(event) {
    if (event) {
        event.preventDefault();
    }

    closeMenu();
    closeCart();
    closeAddressBook();
    closeOrders();
    closeAuthModal();
    closeLocationPicker();
    closeOffers();
    closeCorporatePage();
    closeSearchBar();

    if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });

    const currentPath = String(window.location.pathname || "").toLowerCase();
    if (currentPath === "/" || currentPath.endsWith("/snap_eats.html")) {
        window.location.reload();
        return;
    }

    window.location.assign("snap_eats.html");
}

function openLocationPicker(event) {
    if (event) {
        event.preventDefault();
    }

    switchHeaderPanel("location");

    const modal = document.getElementById("locationModal");
    if (!modal) {
        return;
    }

    locationGpsStatus = { type: "idle", message: "" };
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderLocationPicker();
}

function openOffers(event) {
    if (event) {
        event.preventDefault();
    }

    switchHeaderPanel("offers");

    const modal = document.getElementById("offersModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderOffersModal();
}

function openCorporatePage(event) {
    if (event) {
        event.preventDefault();
    }

    switchHeaderPanel("corporate");

    const modal = document.getElementById("corporateModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderCorporatePage();
}

function closeCart() {
    const modal = document.getElementById("cartModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeAddressBook() {
    const modal = document.getElementById("addressModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    editingAddressId = null;
    destroyAddressMap();
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeOrders() {
    const modal = document.getElementById("ordersModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeLocationPicker() {
    const modal = document.getElementById("locationModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    locationGpsStatus = { type: "idle", message: "" };
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeOffers() {
    const modal = document.getElementById("offersModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeCorporatePage() {
    const modal = document.getElementById("corporateModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function setLocationGpsStatus(type, message) {
    locationGpsStatus = { type, message };
    const status = document.getElementById("locationGpsStatus");
    if (!status) {
        return;
    }
    status.className = `location-gps-status ${type}`;
    status.textContent = message || "";
}

function renderLocationPicker(query = "") {
    const content = document.getElementById("locationModalContent");
    if (!content) {
        return;
    }

    const suggestions = getLocationSuggestions(query);

    content.innerHTML = `
        <div class="location-picker-shell">
            <button class="close-btn-inline" type="button" onclick="closeLocationPicker()">&times;</button>
            <div class="location-search-box">
                <input
                    class="location-search-input"
                    id="locationSearchInput"
                    type="text"
                    value="${escapeAttribute(query)}"
                    placeholder="Search for area, street name..."
                    oninput="renderLocationPicker(this.value)"
                >
                <p id="locationGpsStatus" class="location-gps-status ${locationGpsStatus.type}">${escapeHtml(locationGpsStatus.message || "")}</p>
            </div>

            <section class="location-panel">
                <div class="location-action-card" onclick="useCurrentLocation()">
                    <span class="location-action-icon">&#9906;</span>
                    <div>
                        <strong>Get current location</strong>
                        <p>Using GPS</p>
                    </div>
                </div>
                <div class="location-action-card" onclick="toggleManualLocationForm()">
                    <span class="location-action-icon">+</span>
                    <div>
                        <strong>Add address manually</strong>
                        <p>Enter an area, landmark, or street</p>
                    </div>
                </div>
                <div id="manualLocationFormHost"></div>
            </section>

            <section class="location-panel">
                <p class="location-panel-title">Recent searches</p>
                ${suggestions.length ? suggestions.map((location) => `
                    <div class="location-history-card" onclick="applyLocationSelection({ label: '${escapeAttribute(location.label)}', subtitle: '${escapeAttribute(location.subtitle)}' })">
                        <span class="location-history-icon">&#9716;</span>
                        <div>
                            <strong>${escapeHtml(location.label)}</strong>
                            <p>${escapeHtml(location.subtitle)}</p>
                            ${selectedLocation?.label === location.label && selectedLocation?.subtitle === location.subtitle ? '<span class="location-selected-badge">Selected</span>' : ''}
                        </div>
                    </div>
                `).join("") : `
                    <div class="location-history-card">
                        <span class="location-history-icon">&#9716;</span>
                        <div>
                            <strong>No matching places</strong>
                            <p class="location-empty-note">Try a different area name or add it manually.</p>
                        </div>
                    </div>
                `}
            </section>
        </div>
    `;

    const locationSearchInput = document.getElementById("locationSearchInput");
    if (locationSearchInput) {
        locationSearchInput.focus();
        locationSearchInput.setSelectionRange(locationSearchInput.value.length, locationSearchInput.value.length);
    }
}

function renderOffersModal() {
    const content = document.getElementById("offersModalContent");
    if (!content) {
        return;
    }

    const platformOffersMarkup = PLATFORM_COUPONS.map((coupon) => {
        const isApplied = normalizeCouponCode(appliedCouponCode) === coupon.code;
        return `
            <article class="offer-card ${isApplied ? "applied" : ""}">
                <div class="offer-card-head">
                    <div>
                        <span class="offer-code">${escapeHtml(coupon.code)}</span>
                        <h3>${escapeHtml(coupon.title)}</h3>
                    </div>
                    ${isApplied ? '<span class="offer-applied-pill">Applied</span>' : ""}
                </div>
                <p>${escapeHtml(coupon.description)}</p>
                <div class="offer-meta-row">
                    <span>Min order ${formatCurrency(coupon.minOrder)}</span>
                    <span>${coupon.discountType === "PERCENT" ? `${formatNumber(coupon.discountValue)}% off` : `${formatCurrency(coupon.discountValue)} off`}</span>
                </div>
                <button class="${isApplied ? "secondary-button" : "primary-button"}" type="button" onclick="applyCouponFromOffers('${escapeAttribute(coupon.code)}')" ${isApplied ? "disabled" : ""}>
                    ${isApplied ? "Already applied" : "Apply coupon"}
                </button>
            </article>
        `;
    }).join("");

    const restaurantOffers = getRestaurantOffers();
    const restaurantOffersMarkup = restaurantOffers.length ? restaurantOffers.map((restaurant) => `
            <article class="restaurant-offer-card">
                <div class="restaurant-offer-top">
                    <strong>${escapeHtml(restaurant.name)}</strong>
                    <span class="restaurant-offer-discount">${escapeHtml(restaurant.discount)}</span>
                </div>
                <p>${escapeHtml(restaurant.cuisine || "Multiple cuisines")} - ${escapeHtml(restaurant.time || "Fast delivery")}</p>
                <small>Auto-applied on menu items. No coupon code needed.</small>
            </article>
        `).join("") : `
            <div class="account-placeholder-card compact">
                <p>No restaurant offers available right now.</p>
            </div>
        `;

    content.innerHTML = `
        <div class="offers-shell">
            <div class="offers-header">
                <div>
                    <p class="menu-eyebrow">Offers</p>
                    <h2>Coupons and restaurant deals</h2>
                </div>
                <button class="secondary-button" type="button" onclick="openCart()">Open cart</button>
            </div>
            ${couponFeedback.message ? `
                <div class="checkout-feedback ${couponFeedback.type === "error" ? "error" : "success"}">${escapeHtml(couponFeedback.message)}</div>
            ` : ""}

            <section class="offers-section">
                <div class="offers-section-head">
                    <h3>Coupon codes</h3>
                    <p>Use these codes in cart for extra savings.</p>
                </div>
                <div class="offers-grid">
                    ${platformOffersMarkup}
                </div>
            </section>

            <section class="offers-section">
                <div class="offers-section-head">
                    <h3>Restaurant offers</h3>
                    <p>Live deals from active restaurants near you.</p>
                </div>
                <div class="restaurant-offers-grid">
                    ${restaurantOffersMarkup}
                </div>
            </section>
        </div>
    `;
}

function setCorporateStoryTab(tab) {
    const allowedTabs = new Set(["mission", "vision", "values"]);
    corporateStoryTab = allowedTabs.has(tab) ? tab : "mission";
    renderCorporatePage();
}

function setCorporatePeopleTab(tab) {
    const allowedTabs = new Set(["management", "board"]);
    corporatePeopleTab = allowedTabs.has(tab) ? tab : "management";
    renderCorporatePage();
}

function renderCorporatePage() {
    const content = document.getElementById("corporateModalContent");
    if (!content) {
        return;
    }

    const creatorName = escapeHtml(currentUser?.name || OWNER_NAME);
    const creatorEmail = currentUser?.email ? escapeHtml(currentUser.email) : OWNER_EMAIL;
    const currentYear = new Date().getFullYear();

    const restaurantCount = restaurants.length || 0;
    const categoryCount = categories.length || 0;
    const fulfilledOrders = orderHistory.filter((order) => String(order.status || "").toUpperCase() === "DELIVERED").length;
    const paymentMethodsCount = savedPaymentMethods.length || 0;

    const storyTabs = {
        mission: {
            title: "Mission",
            kicker: "Mission",
            body: "SnapEats exists to make daily food ordering dependable, affordable, and frictionless. We focus on fast discovery, clear pricing, and a checkout journey that respects user time.",
            visualClass: "mission",
            visualIcon: "&#128640;",
            visualTitle: "Reliable every day delivery"
        },
        vision: {
            title: "Vision",
            kicker: "Vision",
            body: "Our vision is to become the most trusted hyperlocal meal platform for students, professionals, and families by combining strong engineering quality with neighborhood-level convenience.",
            visualClass: "vision",
            visualIcon: "&#127919;",
            visualTitle: "Build the most trusted local food network"
        },
        values: {
            title: "Values",
            kicker: "Values",
            body: "We build with user obsession, reliable systems, and transparent pricing. Every release in SnapEats is measured by one thing: does it make ordering simpler and more trustworthy?",
            visualClass: "values",
            visualIcon: "&#129309;",
            visualTitle: "Customer-first, quality-first culture"
        }
    };
    const activeStory = storyTabs[corporateStoryTab] || storyTabs.mission;

    const timeline = [
        { year: "2024", title: "Core platform foundation", copy: "Set up Spring Boot backend, catalog APIs, and menu flows." },
        { year: "2025", title: "OTP-first identity", copy: "Implemented login and signup OTP workflows for phone and email." },
        { year: "2025", title: "Commerce layer upgrade", copy: "Launched coupons, restaurant offers, and real checkout integration." },
        { year: String(currentYear), title: "SnapEatPro expansion", copy: "Added subscription perks, delivery fee logic, and account controls." }
    ];

    const managementTeam = [
        {
            name: creatorName,
            role: "Founder and Product Engineer",
            copy: "Leads product direction, backend architecture, and frontend experience for SnapEats.",
            visualClass: "lead-founder",
            visualIcon: "&#128187;"
        },
        {
            name: "Platform Operations",
            role: "Delivery and Reliability",
            copy: "Focused on order lifecycle quality, issue handling, and fast support loops.",
            visualClass: "lead-ops",
            visualIcon: "&#128666;"
        },
        {
            name: "Growth and Partnerships",
            role: "Restaurant Success",
            copy: "Drives partner onboarding strategy and campaign-led menu discovery growth.",
            visualClass: "lead-growth",
            visualIcon: "&#128200;"
        }
    ];

    const boardTeam = [
        {
            name: "Technology Advisory",
            role: "Architecture Governance",
            copy: "Supports long-term scalability decisions and API design maturity.",
            visualClass: "lead-tech",
            visualIcon: "&#9881;"
        },
        {
            name: "Market Advisory",
            role: "Business Strategy",
            copy: "Guides expansion priorities for local markets and retention programs.",
            visualClass: "lead-market",
            visualIcon: "&#128640;"
        },
        {
            name: "Finance Advisory",
            role: "Revenue and Unit Economics",
            copy: "Helps model sustainable pricing, discounts, and subscription economics.",
            visualClass: "lead-finance",
            visualIcon: "&#128176;"
        }
    ];

    const activePeople = corporatePeopleTab === "board" ? boardTeam : managementTeam;

    content.innerHTML = `
        <div class="corporate-shell">
            <section class="corporate-section">
                <h2 class="corporate-section-title"><span></span>GET TO KNOW US<span></span></h2>
                <div class="corporate-story-layout">
                    <div class="corporate-story-tabs">
                        ${Object.keys(storyTabs).map((tab) => `
                            <button
                                class="corporate-story-tab ${corporateStoryTab === tab ? "active" : ""}"
                                type="button"
                                onclick="setCorporateStoryTab('${tab}')"
                            >
                                ${escapeHtml(storyTabs[tab].title)} ${corporateStoryTab === tab ? "->" : ""}
                            </button>
                        `).join("")}
                    </div>
                    <div class="corporate-story-copy">
                        <p class="corporate-kicker">${escapeHtml(activeStory.kicker)}</p>
                        <h3>${escapeHtml(activeStory.title)} at SnapEats</h3>
                        <p>${escapeHtml(activeStory.body)}</p>
                    </div>
                    <div class="corporate-story-image-wrap">
                        <div class="corporate-visual-card corporate-story-visual ${escapeAttribute(activeStory.visualClass)}">
                            <span class="corporate-visual-icon">${activeStory.visualIcon}</span>
                            <strong>${escapeHtml(activeStory.visualTitle)}</strong>
                            <p>Always available, no broken media dependency.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="corporate-section">
                <h2 class="corporate-section-title"><span></span>INDUSTRY BUILDER<span></span></h2>
                <div class="corporate-pioneer-layout">
                    <div>
                        <p>
                            SnapEats is engineered as a practical hyperlocal commerce system. From onboarding restaurants
                            to OTP identity and conversion-first checkout, each module is designed for reliability and speed.
                        </p>
                        <p>
                            The platform keeps customer, restaurant, and operations flows connected with one unified data model,
                            helping reduce friction from discovery to delivery.
                        </p>
                    </div>
                    <div class="corporate-pioneer-image-wrap">
                        <div class="corporate-visual-card corporate-pioneer-visual">
                            <span class="corporate-visual-icon">&#9889;</span>
                            <strong>Industry-scale operations engine</strong>
                            <p>Restaurant onboarding, OTP trust, checkout reliability, and delivery control in one system.</p>
                        </div>
                    </div>
                </div>
                <div class="corporate-metric-grid">
                    <article><strong>${restaurantCount}+</strong><span>restaurant partners</span></article>
                    <article><strong>${categoryCount}+</strong><span>active categories</span></article>
                    <article><strong>${fulfilledOrders}+</strong><span>orders delivered</span></article>
                    <article><strong>${paymentMethodsCount}+</strong><span>saved payment methods</span></article>
                </div>
            </section>

            <section class="corporate-journey-section">
                <h2 class="corporate-journey-title"><span></span>THE SNAPEATS JOURNEY<span></span></h2>
                <div class="corporate-journey-track">
                    ${timeline.map((step) => `
                        <article class="corporate-journey-card">
                            <p class="corporate-journey-year">${escapeHtml(step.year)}</p>
                            <h3>${escapeHtml(step.title)}</h3>
                            <p>${escapeHtml(step.copy)}</p>
                        </article>
                    `).join("")}
                </div>
            </section>

            <section class="corporate-section">
                <div class="corporate-people-head">
                    <h2>Details of Leadership</h2>
                    <div class="corporate-people-tabs">
                        <button class="corporate-people-tab ${corporatePeopleTab === "management" ? "active" : ""}" type="button" onclick="setCorporatePeopleTab('management')">Management Team</button>
                        <button class="corporate-people-tab ${corporatePeopleTab === "board" ? "active" : ""}" type="button" onclick="setCorporatePeopleTab('board')">Board and Advisors</button>
                    </div>
                </div>
                <div class="corporate-people-grid">
                    ${activePeople.map((person) => `
                        <article class="corporate-person-card">
                            <div class="corporate-person-visual ${escapeAttribute(person.visualClass)}">
                                <span class="corporate-person-icon">${person.visualIcon}</span>
                                <small>${escapeHtml(person.role)}</small>
                            </div>
                            <div class="corporate-person-copy">
                                <h3>${escapeHtml(person.name)}</h3>
                                <p class="corporate-person-role">${escapeHtml(person.role)}</p>
                                <p>${escapeHtml(person.copy)}</p>
                            </div>
                        </article>
                    `).join("")}
                </div>
            </section>

            <section class="corporate-section">
                <h2 class="corporate-section-title"><span></span>CAREERS AT SNAPEATS<span></span></h2>
                <div class="corporate-careers-layout">
                    <div>
                        <p>
                            We are building a product-first culture where ownership, speed, and quality matter. If you care
                            about solving real customer problems in commerce and logistics, SnapEats is a strong place to grow.
                        </p>
                        <p>
                            Current focus areas include backend engineering, frontend performance, partner operations, and
                            growth analytics.
                        </p>
                        <button class="primary-button" type="button" onclick="closeCorporatePage(); openAuthModal();">Join the journey</button>
                    </div>
                    <div class="corporate-careers-image-wrap">
                        <div class="corporate-visual-card corporate-careers-visual">
                            <span class="corporate-visual-icon">&#127919;</span>
                            <strong>Careers with impact</strong>
                            <p>Work on backend systems, frontend UX, growth, and partner operations with real product ownership.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="corporate-section corporate-contact-section">
                <h2 class="corporate-section-title"><span></span>GET IN TOUCH WITH US<span></span></h2>
                <div class="corporate-contact-layout">
                    <div class="corporate-contact-copy">
                        <h3>Head office</h3>
                        <p>SnapEats Product Lab</p>
                        <p>Jamia Nagar, New Delhi, Delhi 110025</p>
                        <h3>Project owner</h3>
                        <p>${creatorName}</p>
                        <p>${creatorEmail}</p>
                        <h3>Support</h3>
                        <p>support@snapeats.in</p>
                    </div>
                    <div class="corporate-contact-map">
                        <iframe
                            title="SnapEats office map"
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps?q=Jamia+Nagar,+New+Delhi&output=embed"
                        ></iframe>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function toggleManualLocationForm() {
    const host = document.getElementById("manualLocationFormHost");
    if (!host) {
        return;
    }

    if (host.innerHTML.trim()) {
        host.innerHTML = "";
        return;
    }

    host.innerHTML = `
        <form class="location-manual-form" onsubmit="saveManualLocation(event)">
            <input id="manualLocationLabel" type="text" placeholder="Area or place name" required>
            <input id="manualLocationSubtitle" type="text" placeholder="Street, city, state" required>
            <div class="location-manual-actions">
                <button class="primary-button" type="submit">Save location</button>
                <button class="secondary-button" type="button" onclick="toggleManualLocationForm()">Cancel</button>
            </div>
        </form>
    `;
}

function saveManualLocation(event) {
    event.preventDefault();

    const label = document.getElementById("manualLocationLabel")?.value.trim();
    const subtitle = document.getElementById("manualLocationSubtitle")?.value.trim();
    if (!label || !subtitle) {
        return;
    }

    applyLocationSelection({ label, subtitle });
}

function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

function getAddressLineFromReverseGeocode(address) {
    const primaryLabel = [
        address.suburb,
        address.neighbourhood,
        address.quarter,
        address.city_district,
        address.town,
        address.village,
        address.city
    ].find(Boolean) || "Current location";

    const detailParts = [
        address.city || address.town || address.village,
        address.state_district,
        address.state,
        address.postcode
    ].filter(Boolean);

    const subtitle = detailParts.length ? detailParts.join(", ") : "Detected from GPS";
    return {
        label: primaryLabel,
        subtitle
    };
}

async function resolveReadableCurrentLocation(latitude, longitude) {
    const fallbackLocation = {
        label: "Current location",
        subtitle: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
    };

    const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        zoom: "18",
        addressdetails: "1"
    });

    try {
        const response = await fetch(`${REVERSE_GEOCODE_BASE_URL}?${params.toString()}`, {
            headers: {
                Accept: "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("Reverse geocode failed");
        }

        const payload = await response.json();
        const address = payload?.address;
        if (!address) {
            throw new Error("No address found");
        }

        const readableLocation = getAddressLineFromReverseGeocode(address);
        return {
            location: readableLocation,
            usedFallback: false
        };
    } catch {
        return {
            location: fallbackLocation,
            usedFallback: true
        };
    }
}

async function useCurrentLocation() {
    if (!navigator.geolocation) {
        setLocationGpsStatus("error", "Geolocation is not supported in this browser.");
        return;
    }

    setLocationGpsStatus("loading", "Detecting your current location...");

    try {
        const position = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
        });
        const { latitude, longitude } = position.coords;
        const { location, usedFallback } = await resolveReadableCurrentLocation(latitude, longitude);
        if (usedFallback) {
            setLocationGpsStatus("error", "Could not fetch address details. Using GPS coordinates.");
        } else {
            setLocationGpsStatus("success", `Location found: ${location.label}`);
        }
        applyLocationSelection(location);
    } catch {
        setLocationGpsStatus("error", "Unable to fetch your current location. Please allow location access.");
    }
}

function renderCart() {
    const content = document.getElementById("cartModalContent");
    if (!content) {
        return;
    }

    ensureCheckoutPaymentChoice();

    if (latestOrderSuccess && !cart.items.length) {
        const successTimeline = buildSuccessTimeline(latestOrderSuccess.order);
        content.innerHTML = `
            <div class="cart-shell order-success-shell">
                <div class="order-success-card">
                    <div class="order-success-badge">Order placed</div>
                    <h2>${escapeHtml(latestOrderSuccess.order.restaurantName || "Your order is confirmed")}</h2>
                    <p class="order-success-copy">
                        Order <strong>${escapeHtml(latestOrderSuccess.order.orderNumber || "")}</strong> is confirmed and headed to
                        <strong>${escapeHtml(latestOrderSuccess.addressLabel || "your address")}</strong>.
                    </p>
                    <div class="order-success-grid">
                        <div class="account-card">
                            <span>ETA</span>
                            <strong>${escapeHtml(getEtaLabel(latestOrderSuccess.order))}</strong>
                        </div>
                        <div class="account-card">
                            <span>Payment</span>
                            <strong>${escapeHtml(latestOrderSuccess.paymentLabel || "Cash on delivery")}</strong>
                        </div>
                        <div class="account-card">
                            <span>Total paid</span>
                            <strong>${formatCurrency(latestOrderSuccess.order.finalAmount)}</strong>
                        </div>
                        <div class="account-card">
                            <span>Items</span>
                            <strong>${latestOrderSuccess.itemCount} item${latestOrderSuccess.itemCount === 1 ? "" : "s"}</strong>
                        </div>
                    </div>
                    <div class="order-success-timeline">
                        ${successTimeline.map((step) => `
                            <div class="order-success-step ${step.active ? "active" : ""}">
                                <span class="order-success-step-dot"></span>
                                <div>
                                    <strong>${escapeHtml(step.title)}</strong>
                                    <p>${escapeHtml(step.copy)}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <div class="order-success-actions">
                        <button class="primary-button" type="button" onclick="dismissOrderSuccess(); openOrders()">Track this order</button>
                        <button class="secondary-button" type="button" onclick="dismissOrderSuccess()">Continue browsing</button>
                    </div>
                </div>
            </div>`;
        return;
    }

    if (!cart.items.length) {
        content.innerHTML = `
            <div class="cart-shell">
                <div class="cart-empty">
                    <h2>Your cart is empty</h2>
                    <p>Add a few dishes from a restaurant to start your order.</p>
                </div>
            </div>`;
        return;
    }

    const subtotal = getCartSubtotal();
    const deliveryFee = getDeliveryFee(subtotal);
    const subscriptionDiscount = getSubscriptionDiscount(subtotal);
    const previouslyAppliedCoupon = getAppliedCoupon();
    if (previouslyAppliedCoupon && subtotal < Number(previouslyAppliedCoupon.minOrder || 0)) {
        appliedCouponCode = "";
        couponFeedback = { type: "error", message: `Coupon ${previouslyAppliedCoupon.code} removed. Minimum order is ${formatCurrency(previouslyAppliedCoupon.minOrder)}.` };
    }
    const appliedCoupon = getAppliedCoupon();
    const couponDiscount = calculateCouponDiscount(appliedCoupon, subtotal);
    const finalAmount = roundAmount(Math.max(0, subtotal + deliveryFee - subscriptionDiscount - couponDiscount));
    const defaultAddress = getDefaultAddress();
    const canCheckout = Boolean(defaultAddress);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const savingsAmount = roundAmount(subscriptionDiscount + couponDiscount);
    const showNoContact = !(checkoutPaymentChoice === "CASH" && paymentChoiceTouched);

    if (checkoutView === "payment") {
        const summaryLine = `${itemCount} item${itemCount === 1 ? "" : "s"} • Total ${formatCurrency(finalAmount)}${savingsAmount > 0 ? ` • Savings of ${formatCurrency(savingsAmount)}` : ""}`;
        const paymentOffers = PAYMENT_OFFERS.filter((offer) => ["CARD", "UPI"].includes(offer.type) && offer.category === "BANK");
        const cardMethods = savedPaymentMethods.filter((method) => method.methodType === "CARD");
        const otherMethods = savedPaymentMethods.filter((method) => method.methodType !== "CARD");
        const hasUpiSaved = otherMethods.some((method) => method.methodType === "UPI");
        const hasWalletSaved = otherMethods.some((method) => method.methodType === "WALLET");
        content.innerHTML = `
            <div class="cart-shell payment-shell">
                <div class="payment-header">
                    <button class="text-button payment-back" type="button" onclick="backToCart(event)">&#8592;</button>
                    <div>
                        <p class="menu-eyebrow">Payment</p>
                        <h2>Payment options</h2>
                        <p class="payment-summary-line">${summaryLine}</p>
                    </div>
                </div>

                <div class="payment-route-card">
                    <div class="payment-route-item">
                        <span class="payment-route-dot"></span>
                        <div>
                            <strong>${escapeHtml(cart.restaurantName || "Restaurant")}</strong>
                            <p>Delivery in 35 mins</p>
                        </div>
                    </div>
                    <div class="payment-route-item">
                        <span class="payment-route-dot address"></span>
                        <div>
                            <strong>${defaultAddress ? escapeHtml(defaultAddress.label) : "Add delivery address"}</strong>
                            <p>${defaultAddress ? escapeHtml(formatAddressLine(defaultAddress)) : "Select a default delivery address to continue."}</p>
                        </div>
                    </div>
                </div>

                <div class="payment-offer-banner">
                    <span>Save more with payment offers</span>
                    <button class="text-button" type="button" onclick="togglePaymentOffers(event)">${paymentOffersOpen ? "Hide offers" : "View offers"}</button>
                </div>
                <div class="payment-offer-list ${paymentOffersOpen ? "open" : ""}">
                    ${paymentOffers.map((offer) => `
                        <div class="payment-offer-row">
                            <div class="payment-offer-icon">${offer.type === "UPI" ? "UPI" : "CARD"}</div>
                            <div class="payment-offer-copy">
                                <strong>${escapeHtml(offer.title)}</strong>
                                <p>${escapeHtml(offer.description)}</p>
                            </div>
                            <span class="payment-offer-arrow">›</span>
                        </div>
                    `).join("")}
                </div>

                <form class="payment-options-form" onsubmit="submitOrder(event)">
                    <div class="payment-section">
                        <h3>Credit &amp; debit cards</h3>
                        <button class="payment-option-card" type="button" onclick="openAuthModal(); setAccountSection('payments')">
                            <span class="payment-option-icon">+</span>
                            <div>
                                <strong>Add new card</strong>
                                <p>Save and pay using cards.</p>
                            </div>
                        </button>
                        ${cardMethods.length ? `
                            <div class="payment-method-list">
                                ${cardMethods.map((method) => `
                                    <label class="checkout-payment-card ${checkoutPaymentChoice === `saved:${method.id}` ? "selected" : ""}">
                                        <input
                                            type="radio"
                                            name="checkoutPaymentChoice"
                                            value="saved:${method.id}"
                                            ${checkoutPaymentChoice === `saved:${method.id}` ? "checked" : ""}
                                            onchange="setCheckoutPaymentChoice(this.value)"
                                        >
                                        <div>
                                            <strong>${escapeHtml(formatPaymentMethodLabel(method))}</strong>
                                            <p>${escapeHtml(formatPaymentMethodSubtitle(method))}</p>
                                        </div>
                                        <span class="payment-type-pill">${escapeHtml(formatPaymentMethodType(method.methodType))}</span>
                                    </label>
                                `).join("")}
                            </div>
                        ` : `<p class="payment-empty-note">No cards saved yet.</p>`}
                    </div>

                    <div class="payment-section">
                        <h3>More payment options</h3>
                        <div class="payment-method-list">
                            ${otherMethods.map((method) => `
                                <label class="checkout-payment-card ${checkoutPaymentChoice === `saved:${method.id}` ? "selected" : ""}">
                                    <input
                                        type="radio"
                                        name="checkoutPaymentChoice"
                                        value="saved:${method.id}"
                                        ${checkoutPaymentChoice === `saved:${method.id}` ? "checked" : ""}
                                        onchange="setCheckoutPaymentChoice(this.value)"
                                    >
                                    <div>
                                        <strong>${escapeHtml(formatPaymentMethodLabel(method))}</strong>
                                        <p>${escapeHtml(formatPaymentMethodSubtitle(method))}</p>
                                    </div>
                                        <span class="payment-type-pill">${escapeHtml(formatPaymentMethodType(method.methodType))}</span>
                                    </label>
                            `).join("")}
                            <label class="checkout-payment-card ${checkoutPaymentChoice === "PLUXEE" ? "selected" : ""}">
                                <input
                                    type="radio"
                                    name="checkoutPaymentChoice"
                                    value="PLUXEE"
                                    ${checkoutPaymentChoice === "PLUXEE" ? "checked" : ""}
                                    onchange="setCheckoutPaymentChoice(this.value)"
                                >
                                <div>
                                    <strong>Pluxee</strong>
                                    <p>Pluxee card valid only on Food &amp; Instamart.</p>
                                </div>
                                <span class="payment-type-pill">Meal</span>
                            </label>
                            ${hasUpiSaved ? "" : `
                                <label class="checkout-payment-card ${checkoutPaymentChoice === "UPI" ? "selected" : ""}">
                                    <input
                                        type="radio"
                                        name="checkoutPaymentChoice"
                                        value="UPI"
                                        ${checkoutPaymentChoice === "UPI" ? "checked" : ""}
                                        onchange="setCheckoutPaymentChoice(this.value)"
                                    >
                                    <div>
                                        <strong>UPI</strong>
                                        <p>Pay using any UPI app.</p>
                                    </div>
                                    <span class="payment-type-pill">UPI</span>
                                </label>
                            `}
                            ${hasWalletSaved ? "" : `
                                <label class="checkout-payment-card ${checkoutPaymentChoice === "WALLET" ? "selected" : ""}">
                                    <input
                                        type="radio"
                                        name="checkoutPaymentChoice"
                                        value="WALLET"
                                        ${checkoutPaymentChoice === "WALLET" ? "checked" : ""}
                                        onchange="setCheckoutPaymentChoice(this.value)"
                                    >
                                    <div>
                                        <strong>Wallets</strong>
                                        <p>PhonePe, Paytm, Amazon Pay &amp; more.</p>
                                    </div>
                                    <span class="payment-type-pill">Wallet</span>
                                </label>
                            `}
                            <label class="checkout-payment-card ${checkoutPaymentChoice === "NETBANKING" ? "selected" : ""}">
                                <input
                                    type="radio"
                                    name="checkoutPaymentChoice"
                                    value="NETBANKING"
                                    ${checkoutPaymentChoice === "NETBANKING" ? "checked" : ""}
                                    onchange="setCheckoutPaymentChoice(this.value)"
                                >
                                <div>
                                    <strong>Netbanking</strong>
                                    <p>Select from a list of banks.</p>
                                </div>
                                <span class="payment-type-pill">Bank</span>
                            </label>
                        </div>
                        ${checkoutPaymentChoice === "NETBANKING" ? `
                            <div class="netbanking-section">
                                <h4>Popular banks</h4>
                                <div class="netbanking-list">
                                    ${NETBANKING_POPULAR_BANKS.map((bank) => `
                                        <button class="netbanking-row ${netbankingBankChoice === bank ? "selected" : ""}" type="button" onclick="selectNetbankingBank('${escapeAttribute(bank)}')">
                                            <span class="netbanking-icon">${escapeHtml(bank.split(" ")[0].slice(0, 2).toUpperCase())}</span>
                                            <span class="netbanking-name">${escapeHtml(bank)}</span>
                                            <span class="netbanking-arrow">›</span>
                                        </button>
                                    `).join("")}
                                </div>
                                <h4>All banks</h4>
                                <div class="netbanking-list">
                                    ${NETBANKING_ALL_BANKS.map((bank) => `
                                        <button class="netbanking-row ${netbankingBankChoice === bank ? "selected" : ""}" type="button" onclick="selectNetbankingBank('${escapeAttribute(bank)}')">
                                            <span class="netbanking-name">${escapeHtml(bank)}</span>
                                            <span class="netbanking-arrow">›</span>
                                        </button>
                                    `).join("")}
                                </div>
                            </div>
                        ` : ""}
                    </div>

                    <div class="payment-section">
                        <h3>Pay on delivery</h3>
                        <div class="payment-method-list">
                            <label class="checkout-payment-card ${checkoutPaymentChoice === "CASH" ? "selected" : ""}">
                                <input
                                    type="radio"
                                    name="checkoutPaymentChoice"
                                    value="CASH"
                                    ${checkoutPaymentChoice === "CASH" ? "checked" : ""}
                                    onchange="setCheckoutPaymentChoice(this.value)"
                                >
                                <div>
                                    <strong>Cash on delivery</strong>
                                    <p>Pay in cash or UPI when your order arrives.</p>
                                </div>
                                <span class="payment-type-pill">Cash</span>
                            </label>
                        </div>
                    </div>

                    <button class="primary-button checkout-button" type="submit" ${canCheckout ? "" : "disabled"}>
                        ${canCheckout ? `Pay ${formatCurrency(finalAmount)}` : "Add a default address first"}
                    </button>
                </form>
                <div id="checkoutFeedback" class="checkout-feedback"></div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="cart-shell">
            <div class="cart-layout">
                <section class="checkout-main">
                    <section class="address-summary-card">
                        <div class="address-summary-head">
                            <div>
                                <p class="menu-eyebrow">Delivery address</p>
                                <h3>${defaultAddress ? escapeHtml(defaultAddress.label) : "No default address set"}</h3>
                            </div>
                            <button class="secondary-button" type="button" onclick="openAddressBook()">
                                ${defaultAddress ? "Manage addresses" : "Add address"}
                            </button>
                        </div>
                        ${defaultAddress ? `
                            <p class="address-recipient">${escapeHtml(defaultAddress.recipientName)} - ${escapeHtml(defaultAddress.phoneNumber)}</p>
                            <p class="address-line">${escapeHtml(formatAddressLine(defaultAddress))}</p>
                        ` : `
                            <p class="address-empty-note">Save at least one address and mark it as default before placing an order.</p>
                        `}
                    </section>

                    <section class="payment-entry-card">
                        <div class="payment-entry-head">
                            <div>
                                <p class="menu-eyebrow">Payment</p>
                                <h3>Choose payment method</h3>
                            </div>
                            <button class="secondary-button" type="button" onclick="openAuthModal(); setAccountSection('payments')">Manage payments</button>
                        </div>
                        <p class="payment-entry-copy">Select your payment option on the next step.</p>
                        <button class="primary-button checkout-button" type="button" onclick="openPaymentPage(event)" ${canCheckout ? "" : "disabled"}>
                            ${canCheckout ? "Proceed to pay" : "Add a default address first"}
                        </button>
                    </section>
                </section>

                <section class="checkout-panel order-summary-panel">
                    <div class="order-summary-head">
                        <p class="menu-eyebrow">Order from</p>
                        <h3>${escapeHtml(cart.restaurantName)}</h3>
                    </div>
                    <section class="cart-items-list">
                        ${cart.items.map((item) => `
                            <article class="cart-item-card">
                                <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-image">
                                <div class="cart-item-copy">
                                    <h3>${escapeHtml(item.name)}</h3>
                                    <p>${formatCurrency(item.price)} each</p>
                                </div>
                                <div class="cart-item-controls">
                                    <button type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', -1)">-</button>
                                    <span>${item.quantity}</span>
                                    <button type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', 1)">+</button>
                                </div>
                                <div class="cart-item-total">${formatCurrency(item.price * item.quantity)}</div>
                            </article>
                        `).join("")}
                    </section>

                    <div class="checkout-summary">
                        <div><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
                        <div>
                            <span>Delivery fee</span>
                            <strong>${deliveryFee > 0 ? formatCurrency(deliveryFee) : "FREE"}</strong>
                        </div>
                        ${subscriptionDiscount > 0 ? `
                            <div><span>Subscription discount</span><strong>- ${formatCurrency(subscriptionDiscount)}</strong></div>
                        ` : ""}
                        ${couponDiscount > 0 ? `
                            <div><span>Coupon discount</span><strong>- ${formatCurrency(couponDiscount)}</strong></div>
                        ` : ""}
                        <div class="checkout-total"><span>Total</span><strong>${formatCurrency(finalAmount)}</strong></div>
                    </div>

                    ${showNoContact ? `
                        <div class="no-contact-card">
                            <label class="no-contact-toggle">
                                <input type="checkbox" ${noContactDelivery ? "checked" : ""} onchange="toggleNoContactDelivery(event)">
                                <div>
                                    <strong>Opt in for No-contact Delivery</strong>
                                    <p>Unwell, or avoiding contact? Please select no-contact delivery. Partner will safely place the order outside your door (not for COD).</p>
                                </div>
                            </label>
                        </div>
                    ` : ""}

                    <section class="coupon-panel ${appliedCoupon ? "coupon-has-applied" : ""} ${couponListOpen ? "coupon-list-open" : ""}">
                        <div class="coupon-panel-head">
                            <div>
                                <p class="menu-eyebrow">Coupons</p>
                                <h3>Apply coupon code</h3>
                            </div>
                        </div>
                        <div class="coupon-input-row">
                            <input id="couponCodeInput" type="text" placeholder="Enter coupon code" value="${escapeAttribute(appliedCouponCode)}">
                            <button class="primary-button" type="button" onclick="applyCouponFromCart(event)">Apply</button>
                        </div>
                        ${appliedCoupon ? `
                            <div class="coupon-applied-row">
                                <span><strong>${escapeHtml(appliedCoupon.code)}</strong> - ${escapeHtml(appliedCoupon.title)}</span>
                                <button class="text-button danger-button" type="button" onclick="removeAppliedCoupon()">Remove</button>
                            </div>
                        ` : ""}
                        ${couponFeedback.message ? `
                            <div class="checkout-feedback ${couponFeedback.type === "error" ? "error" : "success"}">${escapeHtml(couponFeedback.message)}</div>
                        ` : ""}
                        <div class="coupon-list">
                            ${PLATFORM_COUPONS.map((coupon) => {
                                const isApplied = normalizeCouponCode(appliedCouponCode) === coupon.code;
                                return `
                                <article class="coupon-card ${isApplied ? "applied" : ""}">
                                    <div class="coupon-card-head">
                                        <div>
                                            <span class="coupon-code">${escapeHtml(coupon.code)}</span>
                                            <h4>${escapeHtml(coupon.title)}</h4>
                                        </div>
                                        ${isApplied ? '<span class="offer-applied-pill">Applied</span>' : ""}
                                    </div>
                                    <p>${escapeHtml(coupon.description)}</p>
                                    <div class="coupon-card-meta">
                                        <span>Min order ${formatCurrency(coupon.minOrder)}</span>
                                        <span>${coupon.discountType === "PERCENT" ? `${formatNumber(coupon.discountValue)}% off` : `${formatCurrency(coupon.discountValue)} off`}</span>
                                    </div>
                                    <button class="${isApplied ? "secondary-button" : "primary-button"}" type="button" onclick="applyCouponFromList('${escapeAttribute(coupon.code)}')" ${isApplied ? "disabled" : ""}>
                                        ${isApplied ? "Applied" : "Apply coupon"}
                                    </button>
                                </article>
                                `;
                            }).join("")}
                        </div>
                    </section>
                </section>
            </div>
        </div>`;
}

function renderAddressBook() {
    const content = document.getElementById("addressModalContent");
    if (!content) {
        return;
    }

    const editingAddress = editingAddressId ? getAddressById(editingAddressId) : null;
    const heading = editingAddress ? "Edit saved address" : "Save a new address";
    const editingCoordinates = getAddressCoordinates(editingAddress);
    addressLocationConfirmed = Boolean(editingAddress);
    addressLocationAreaLabel = editingAddress
        ? [
            editingAddress.landmark,
            editingAddress.city,
            editingAddress.state
        ].filter(Boolean).join(", ")
        : "";
    const detailsLocked = !addressLocationConfirmed;

    content.innerHTML = `
        <div class="address-book-shell">
            <div class="address-book-header">
                <div>
                    <p class="menu-eyebrow">Address book</p>
                    <h2>Choose where SnapEats delivers</h2>
                    <p class="address-book-subtitle">Save multiple addresses and mark one as your default for quick checkout.</p>
                </div>
            </div>

            <div class="address-book-layout">
                <section class="address-list-panel">
                    ${savedAddresses.length ? savedAddresses.map((address) => `
                        <article class="address-card ${address.defaultAddress ? "default" : ""}">
                            <div class="address-card-head">
                                <div>
                                    <h3>${escapeHtml(address.label)}</h3>
                                    <p>${escapeHtml(address.recipientName)} - ${escapeHtml(address.phoneNumber)}</p>
                                </div>
                                ${address.defaultAddress ? '<span class="address-default-pill">Default</span>' : ""}
                            </div>
                            <p class="address-line">${escapeHtml(formatAddressLine(address))}</p>
                            ${getAddressMapUrl(address) ? `
                                <p class="address-map-link-row">
                                    <a href="${escapeAttribute(getAddressMapUrl(address))}" target="_blank" rel="noopener noreferrer">View pinned location on map</a>
                                </p>
                            ` : ""}
                            <div class="address-card-actions">
                                ${address.defaultAddress ? "" : `<button class="secondary-button" type="button" onclick="setDefaultAddress(${address.id})">Make default</button>`}
                                <button class="text-button" type="button" onclick="startAddressEdit(${address.id})">Edit</button>
                                ${address.defaultAddress ? '<span class="address-action-note">Default address cannot be deleted.</span>' : `<button class="text-button danger-button" type="button" onclick="deleteAddress(${address.id})">Delete</button>`}
                            </div>
                        </article>
                    `).join("") : `
                        <div class="address-empty-state">
                            <h3>No saved addresses yet</h3>
                            <p>Add your first address here. You can save multiple places and switch the default anytime.</p>
                        </div>
                    `}
                </section>

                <section class="address-form-panel">
                    <div class="address-form-head">
                        <h3>${heading}</h3>
                        ${editingAddress ? '<button class="text-button" type="button" onclick="resetAddressForm()">Cancel editing</button>' : ""}
                    </div>
                    <form class="address-form" onsubmit="saveAddress(event)">
                        <div class="address-map-shell">
                            <div class="address-map-head">
                                <p>Pin exact location on map</p>
                                <button class="secondary-button" type="button" onclick="centerAddressMapOnCurrentLocation()">Use live location</button>
                            </div>
                            <div class="address-map-search">
                                <input
                                    type="text"
                                    id="addressMapSearchInput"
                                    placeholder="Search area, building, or street name"
                                    autocomplete="off"
                                    onkeydown="handleAddressMapSearchKeydown(event)"
                                    oninput="handleAddressMapSearchInput()"
                                >
                                <button class="secondary-button" type="button" onclick="searchAddressOnMap(event)">Search on map</button>
                            </div>
                            <div id="addressMapSearchResults" class="address-map-results"></div>
                            <div id="addressMapCanvas" class="address-map-canvas ${editingCoordinates ? "" : "address-map-canvas-hidden"}" role="application" aria-label="Address map picker"></div>
                            <div id="addressSelectedAreaRow" class="address-selected-area-row ${addressLocationAreaLabel ? "visible" : ""}">
                                <strong>Delivery area</strong>
                                <p id="addressSelectedAreaLabel">${escapeHtml(addressLocationAreaLabel || "No delivery area selected yet")}</p>
                                <button class="text-button" type="button" onclick="changeAddressLocationSelection()">Change</button>
                            </div>
                            <div class="address-map-actions">
                                <button class="primary-button" type="button" id="addressConfirmPinButton" onclick="confirmAddressPinAndProceed()">Confirm and proceed</button>
                            </div>
                            <p id="addressMapStatus" class="address-map-status">Step 1: Search and pick an area. Step 2: Set exact pin. Step 3: Confirm and proceed.</p>
                            <input type="hidden" id="addressLatitude" value="${editingCoordinates ? escapeHtml(formatCoordinate(editingCoordinates.latitude)) : ""}">
                            <input type="hidden" id="addressLongitude" value="${editingCoordinates ? escapeHtml(formatCoordinate(editingCoordinates.longitude)) : ""}">
                        </div>
                        <p id="addressDetailsLockHint" class="address-details-lock-hint ${detailsLocked ? "locked" : "ready"}">
                            ${detailsLocked ? "Step 3: Confirm map pin first, then complete full address details." : "Location confirmed. Fill complete address details below."}
                        </p>
                        <div id="addressDetailsSection" class="address-details-section ${detailsLocked ? "hidden" : "visible"}">
                        <label>
                            Address label
                            <input type="text" id="addressLabel" placeholder="Home, Work, Hostel" value="${editingAddress ? escapeHtml(editingAddress.label) : ""}" ${detailsLocked ? "disabled" : ""} required>
                        </label>
                        <label>
                            Recipient name
                            <input type="text" id="addressRecipientName" placeholder="Name for delivery" value="${editingAddress ? escapeHtml(editingAddress.recipientName) : ""}" ${detailsLocked ? "disabled" : ""} required>
                        </label>
                        <label>
                            Phone number
                            <input type="tel" id="addressPhoneNumber" placeholder="10-digit phone" value="${editingAddress ? escapeHtml(editingAddress.phoneNumber) : ""}" ${detailsLocked ? "disabled" : ""} required>
                        </label>
                        <label>
                            Address line
                            <textarea id="addressLine" rows="3" placeholder="House number, apartment, street" ${detailsLocked ? "disabled" : ""} required>${editingAddress ? escapeHtml(editingAddress.addressLine) : ""}</textarea>
                        </label>
                        <label>
                            Area / Locality
                            <input
                                type="text"
                                id="addressLandmark"
                                list="addressAreaOptions"
                                placeholder="Area or locality"
                                value="${editingAddress ? escapeHtml(editingAddress.landmark || "") : ""}"
                                ${detailsLocked ? "disabled" : ""}
                            >
                            <datalist id="addressAreaOptions">
                                ${renderAreaOptions([], editingAddress?.landmark || "")}
                            </datalist>
                        </label>
                        <div class="address-form-row">
                            <label>
                                City
                                <input type="text" id="addressCity" placeholder="City" value="${editingAddress ? escapeHtml(editingAddress.city) : ""}" ${detailsLocked ? "disabled" : ""} required>
                            </label>
                            <label>
                                State
                                <input type="text" id="addressState" placeholder="State" value="${editingAddress ? escapeHtml(editingAddress.state) : ""}" ${detailsLocked ? "disabled" : ""} required>
                            </label>
                        </div>
                        <div class="address-form-row">
                            <label>
                                Pincode
                                <input
                                    type="text"
                                    id="addressPincode"
                                    inputmode="numeric"
                                    maxlength="6"
                                    placeholder="Pincode"
                                    value="${editingAddress ? escapeHtml(editingAddress.pincode) : ""}"
                                    oninput="handlePincodeInput()"
                                    ${detailsLocked ? "disabled" : ""}
                                    required
                                >
                            </label>
                            <label class="address-default-toggle">
                                <input type="checkbox" id="addressDefault" ${editingAddress?.defaultAddress ? "checked" : ""} ${detailsLocked ? "disabled" : ""}>
                                <span>Make this my default delivery address</span>
                            </label>
                        </div>
                        </div>
                        <div id="addressLookupFeedback" class="address-lookup-feedback">
                            Enter a 6-digit pincode to auto-fill city, state, and area.
                        </div>
                        <button class="primary-button" type="submit">${editingAddress ? "Update address" : "Save address"}</button>
                        <div id="addressFeedback" class="checkout-feedback"></div>
                    </form>
                </section>
            </div>
        </div>`;

    initializeAddressMap(editingAddress);
    setAddressLocationAreaLabel(addressLocationAreaLabel);
    syncAddressFormLockState();
    if (addressLocationConfirmed && editingAddress) {
        setAddressMapStatus("Location loaded. You can change pin if needed.", "success");
    }

    const existingPincode = document.getElementById("addressPincode")?.value.trim();
    if (existingPincode && existingPincode.length === 6) {
        handlePincodeInput();
    }
}

function renderAuthModal(mode = "otp") {
    const content = document.getElementById("authModalContent");
    if (!content) {
        return;
    }

    if (currentUser) {
        if (activeAccountSection === "admin" && !isAdminUser()) {
            activeAccountSection = "orders";
        }
        content.innerHTML = `
            <div class="account-shell">
                <section class="account-hero">
                    <div class="account-hero-copy">
                        <p class="menu-eyebrow">My account</p>
                        <h2>${escapeHtml(currentUser.name || "SnapEats User")}</h2>
                        <p class="account-hero-meta">${escapeHtml(currentUser.phoneNumber || "-")} <span>&bull;</span> ${escapeHtml(currentUser.email || "-")}</p>
                    </div>
                    <button class="account-edit-button" type="button" onclick="setAccountSection('settings')">Edit profile</button>
                </section>

                <section class="account-layout">
                    <aside class="account-sidebar">
                        ${renderAccountSidebar()}
                    </aside>
                    <div class="account-main">
                        ${renderAccountPanel()}
                    </div>
                </section>
            </div>`;
        return;
    }

    if (mode === "login" || mode === "signup") {
        otpAuthFlowMode = mode;
        otpAuthStep = "form";
    }

    const isOtp = true;
    const title = "Login or sign up with OTP";
    const subtitle = "Enter your email or phone, verify OTP, and continue.";

    const otpFlowHeader = otpAuthFlowMode === "signup"
        ? `<h3>Sign up</h3><p>or <button class="text-button" type="button" onclick="setOtpAuthFlowMode('login')">login to your account</button></p>`
        : `<h3>Login</h3><p>or <button class="text-button" type="button" onclick="setOtpAuthFlowMode('signup')">create an account</button></p>`;

    const otpFormMarkup = otpAuthStep === "verify" ? `
            <form class="auth-form" onsubmit="verifyLoginSignupOtp(event)">
                <div class="otp-flow-block">
                    <p>OTP sent to <strong>${escapeHtml(otpAuthDraftIdentifier)}</strong></p>
                    <button class="text-button" type="button" onclick="resetOtpAuthStep()">Change number/email</button>
                </div>
                <label>
                    OTP
                    <input type="text" id="authOtpCode" placeholder="6-digit OTP" maxlength="6" required>
                </label>
                <button class="primary-button" type="submit">${otpAuthFlowMode === "signup" ? "Create account" : "Login"}</button>
                <button class="secondary-button" id="authOtpSendButton" type="button" onclick="requestLoginSignupOtp()">Resend OTP</button>
                <div id="authFeedback" class="checkout-feedback"></div>
            </form>
    ` : `
            <form class="auth-form" onsubmit="requestLoginSignupOtp(event)">
                <label>
                    ${otpAuthFlowMode === "signup" ? "Phone number or email" : "Phone number or email"}
                    <input
                        type="text"
                        id="authOtpIdentifier"
                        placeholder="you@example.com or 9876543210"
                        value="${escapeAttribute(otpAuthDraftIdentifier)}"
                        oninput="updateOtpAuthIdentifier(this.value)"
                        required
                    >
                </label>
                ${otpAuthFlowMode === "signup" ? `
                <label>
                    Name
                    <input
                        type="text"
                        id="authOtpName"
                        placeholder="Your full name"
                        value="${escapeAttribute(otpAuthDraftName)}"
                        oninput="updateOtpAuthName(this.value)"
                        required
                    >
                </label>
                <label>
                    Email (optional if phone used above)
                    <input
                        type="email"
                        id="authOtpEmail"
                        placeholder="you@example.com"
                        value="${escapeAttribute(otpAuthDraftEmail)}"
                        oninput="updateOtpAuthEmail(this.value)"
                    >
                </label>
                <label>
                    Referral code (optional)
                    <input
                        type="text"
                        id="authOtpReferralCode"
                        placeholder="Enter referral code"
                        value="${escapeAttribute(otpAuthDraftReferralCode)}"
                        oninput="updateOtpAuthReferralCode(this.value)"
                    >
                </label>
                ` : ""}
                <button class="primary-button" type="submit">${otpAuthFlowMode === "signup" ? "Continue" : "Login"}</button>
                <div id="authFeedback" class="checkout-feedback"></div>
            </form>
    `;

    const formMarkup = `
        <div class="otp-flow-head">
            ${otpFlowHeader}
        </div>
        ${otpFormMarkup}
    `;

    content.innerHTML = `
        <div class="auth-shell">
            <div class="auth-header">
                <div>
                    <p class="menu-eyebrow">Account</p>
                    <h2>${title}</h2>
                    <p class="auth-subtitle">${subtitle}</p>
                </div>
            </div>

            ${formMarkup}
        </div>`;

    if (isOtp) {
        syncOtpAuthButtonState();
    }
}

function setAccountSection(section) {
    activeAccountSection = section;
    renderAuthModal();
    if (section === "admin" && isAdminUser() && !adminRestaurants.length) {
        loadAdminRestaurants();
    }
    if (section === "subscription" && currentUser?.id && !subscriptionPlans.length && !subscriptionLoading) {
        fetchSubscriptionData();
    }
}

function getAccountNavIcon(sectionId) {
    const icons = {
        orders: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7.5A2.5 2.5 0 0 1 9.5 5h5A2.5 2.5 0 0 1 17 7.5V9h1.5A1.5 1.5 0 0 1 20 10.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-8A1.5 1.5 0 0 1 5.5 9H7V7.5Zm2.5-1A1.5 1.5 0 0 0 8 8v1h8V8a1.5 1.5 0 0 0-1.5-1.5h-5Z"/></svg>`,
        subscription: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 9.2 7.63 3 8.53l4.5 4.39-1.06 6.2L12 16.2l5.56 2.92-1.06-6.2L21 8.53l-6.2-.9L12 2Zm0 3.24 1.66 3.35.19.39.43.06 3.7.54-2.67 2.61-.31.3.07.43.63 3.69-3.31-1.74L12 14.7l-.39.21-3.31 1.74.63-3.69.07-.43-.31-.3-2.67-2.61 3.7-.54.43-.06.19-.39L12 5.24Z"/></svg>`,
        favorites: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.03 6.03 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z"/></svg>`,
        payments: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3V6Zm0 4h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Zm4 5v2h4v-2H7Z"/></svg>`,
        addresses: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.12 11.39 7.38 12.59a1 1 0 0 0 1.24 0C13.88 21.39 20 15.25 20 10c0-4.42-3.58-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.77 7.77 0 0 0 .05-.94c0-.32-.02-.63-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.46 7.46 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.03.31-.05.62-.05.94 0 .32.02.63.05.94L2.83 14.16a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.51.41 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.12-.53 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"/></svg>`,
        admin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5.25 3.4 10.15 8 11.85 4.6-1.7 8-6.6 8-11.85V5l-8-3Zm3.72 8.84-4.12 4.12a1 1 0 0 1-1.41 0l-1.91-1.91 1.41-1.41 1.2 1.2 3.42-3.42 1.41 1.42Z"/></svg>`
    };
    return icons[sectionId] || icons.orders;
}

function renderAccountSidebar() {
    const items = [
        { id: "orders", label: "Orders" },
        { id: "subscription", label: "SnapEatPro" },
        { id: "favorites", label: "Favorites" },
        { id: "payments", label: "Payments" },
        { id: "addresses", label: "Addresses" },
        { id: "settings", label: "Settings" }
    ];
    if (isAdminUser()) {
        items.splice(1, 0, { id: "admin", label: "Admin" });
    }

    return items.map((item) => `
        <button
            class="account-nav-item ${activeAccountSection === item.id ? "active" : ""}"
            type="button"
            onclick="setAccountSection('${item.id}')"
        >
            <span class="account-nav-icon" aria-hidden="true">${getAccountNavIcon(item.id)}</span>
            <span>${item.label}</span>
        </button>
    `).join("");
}

function renderAdminPanel() {
    if (!isAdminUser()) {
        return `
            <div class="account-panel">
                <h3>Admin access required</h3>
                <p class="account-panel-copy">Only admin users can manage menus.</p>
            </div>
        `;
    }

    const selectedRestaurant = adminRestaurants.find((restaurant) => restaurant.id === adminSelectedRestaurantId) || null;
    const editingItem = adminEditingMenuItemId
        ? adminMenuItems.find((item) => item.id === adminEditingMenuItemId) || null
        : null;

    return `
        <div class="account-panel">
            <div class="account-panel-head">
                <div>
                    <p class="menu-eyebrow">Admin</p>
                    <h3>Menu operations</h3>
                    <p class="account-panel-copy">Add, edit, and delete menu items by restaurant.</p>
                </div>
                <button class="secondary-button" type="button" onclick="loadAdminRestaurants()">Refresh</button>
            </div>

            ${adminMenuError ? `<div class="checkout-feedback error">${escapeHtml(adminMenuError)}</div>` : ""}

            <div class="admin-menu-layout">
                <section class="admin-menu-list-panel">
                    <label class="account-form-field account-form-field-full">
                        <span>Restaurant</span>
                        <select id="adminRestaurantSelect" onchange="setAdminRestaurant(this.value)">
                            ${adminRestaurants.map((restaurant) => `
                                <option value="${restaurant.id}" ${restaurant.id === adminSelectedRestaurantId ? "selected" : ""}>
                                    ${escapeHtml(restaurant.name)} (${escapeHtml(restaurant.locality || restaurant.city || "N/A")})
                                </option>
                            `).join("")}
                        </select>
                    </label>

                    ${adminMenuLoading ? `<div class="account-placeholder-card compact"><p>Loading menu items...</p></div>` : `
                        <div class="admin-menu-item-list">
                            ${adminMenuItems.length ? adminMenuItems.map((item) => `
                                <article class="admin-menu-item-card">
                                    <div>
                                        <strong>${escapeHtml(item.name)}</strong>
                                        <p>${escapeHtml(item.category || "General")} - ${formatCurrency(item.price)}</p>
                                    </div>
                                    <div class="admin-menu-actions">
                                        <button class="secondary-button" type="button" onclick="startAdminMenuEdit(${item.id})">Edit</button>
                                        <button class="text-button danger-button" type="button" onclick="deleteAdminMenuItem(${item.id})">Delete</button>
                                    </div>
                                </article>
                            `).join("") : `<div class="account-placeholder-card compact"><p>No menu items found for this restaurant.</p></div>`}
                        </div>
                    `}
                </section>

                <section class="admin-menu-form-panel">
                    <div class="payment-form-header">
                        <strong>${editingItem ? "Edit menu item" : "Add menu item"}</strong>
                        <p>${selectedRestaurant ? `Managing ${escapeHtml(selectedRestaurant.name)}` : "Select a restaurant to start."}</p>
                    </div>
                    <form class="account-settings-form" onsubmit="saveAdminMenuItem(event)">
                        <label class="account-form-field account-form-field-full">
                            <span>Name</span>
                            <input id="adminMenuName" type="text" value="${escapeAttribute(editingItem?.name || "")}" required>
                        </label>
                        <div class="account-stat-grid">
                            <label class="account-form-field">
                                <span>Category</span>
                                <input id="adminMenuCategory" type="text" value="${escapeAttribute(editingItem?.category || "")}" placeholder="main course" required>
                            </label>
                            <label class="account-form-field">
                                <span>Price</span>
                                <input id="adminMenuPrice" type="number" min="1" step="0.01" value="${escapeAttribute(editingItem?.price || "")}" required>
                            </label>
                        </div>
                        <label class="account-form-field account-form-field-full">
                            <span>Description</span>
                            <textarea id="adminMenuDescription" rows="3" placeholder="Menu item description">${escapeHtml(editingItem?.description || "")}</textarea>
                        </label>
                        <label class="account-form-field account-form-field-full">
                            <span>Image URL</span>
                            <input id="adminMenuImage" type="url" value="${escapeAttribute(editingItem?.image || "")}" placeholder="https://...">
                        </label>
                        <div class="account-stat-grid">
                            <label class="address-default-toggle">
                                <input id="adminMenuVeg" type="checkbox" ${editingItem?.vegetarian ? "checked" : ""}>
                                <span>Vegetarian</span>
                            </label>
                            <label class="address-default-toggle">
                                <input id="adminMenuAvailable" type="checkbox" ${editingItem ? (editingItem.available ? "checked" : "") : "checked"}>
                                <span>Available</span>
                            </label>
                        </div>
                        <div class="auth-actions">
                            <button class="primary-button" type="submit">${editingItem ? "Update item" : "Create item"}</button>
                            ${editingItem ? `<button class="secondary-button" type="button" onclick="resetAdminMenuForm()">Cancel edit</button>` : ""}
                        </div>
                        <div id="adminMenuFeedback" class="checkout-feedback"></div>
                    </form>
                </section>
            </div>
        </div>
    `;
}

function renderAccountPanel() {
    if (activeAccountSection === "orders") {
        return renderOrdersAccountPanel();
    }
    if (activeAccountSection === "admin") {
        return renderAdminPanel();
    }
    if (activeAccountSection === "subscription") {
        const hasActiveSubscription = Boolean(currentSubscription?.active);
        const activePlanCode = String(currentSubscription?.planCode || "").toUpperCase();
        return `
            <div class="account-panel">
                <p class="menu-eyebrow">SnapEatPro</p>
                <h3>Membership plans</h3>
                <p class="account-panel-copy">Choose a plan and save more on every order with free delivery and member discounts.</p>
                ${subscriptionFeedback.message ? `<div class="checkout-feedback ${subscriptionFeedback.type === "error" ? "error" : "success"}">${escapeHtml(subscriptionFeedback.message)}</div>` : ""}
                ${subscriptionLoading ? `
                    <div class="account-placeholder-card">
                        <strong>Loading plans...</strong>
                    </div>
                ` : `
                    <div class="account-stat-grid">
                        <div class="account-card">
                            <span>Current status</span>
                            <strong>${hasActiveSubscription ? escapeHtml(currentSubscription.planName || "Active") : "Not subscribed"}</strong>
                        </div>
                        <div class="account-card">
                            <span>Monthly fee</span>
                            <strong>${hasActiveSubscription ? `${formatCurrency(currentSubscription.monthlyPrice || 0)}/month` : "Choose a plan"}</strong>
                        </div>
                    </div>

                    ${hasActiveSubscription ? `
                        <div class="subscription-current-card">
                            <div>
                                <strong>${escapeHtml(currentSubscription.planName || "Membership active")}</strong>
                                <p>${escapeHtml(currentSubscription.description || "Membership perks are active on your account.")}</p>
                                <p class="subscription-current-meta">
                                    Renews ${currentSubscription.nextBillingAt ? escapeHtml(formatDateTime(currentSubscription.nextBillingAt)) : "every 30 days"}
                                </p>
                            </div>
                            <button class="text-button danger-button" type="button" onclick="cancelSubscription()">Cancel plan</button>
                        </div>
                    ` : `
                        <div class="account-placeholder-card compact">
                            <strong>No active plan yet</strong>
                            <p>Select any plan below to unlock member savings on checkout.</p>
                        </div>
                    `}

                    <div class="subscription-plan-grid">
                        ${subscriptionPlans.length ? subscriptionPlans.map((plan) => {
                            const isCurrentPlan = hasActiveSubscription && String(plan.planCode || "").toUpperCase() === activePlanCode;
                            return `
                                <article class="subscription-plan-card ${isCurrentPlan ? "active" : ""}">
                                    <span class="subscription-highlight-pill">${escapeHtml(plan.highlight || "Member plan")}</span>
                                    <h4>${escapeHtml(plan.name)}</h4>
                                    <p>${escapeHtml(plan.description || "")}</p>
                                    <div class="subscription-plan-price">${formatCurrency(plan.monthlyPrice || 0)}<small>/month</small></div>
                                    <div class="subscription-plan-meta">
                                        <span>${formatNumber(plan.discountPercent || 0)}% off</span>
                                        <span>Up to ${formatCurrency(plan.maxDiscountPerOrder || 0)} off/order</span>
                                        <span>Free delivery above ${formatCurrency(plan.minOrderForFreeDelivery || 0)}</span>
                                    </div>
                                    <div class="subscription-plan-actions">
                                        <button
                                            class="${isCurrentPlan ? "secondary-button" : "primary-button"}"
                                            type="button"
                                            onclick="activateSubscription('${escapeAttribute(plan.planCode)}')"
                                            ${(subscriptionLoading || isCurrentPlan) ? "disabled" : ""}
                                        >
                                            ${isCurrentPlan ? "Current plan" : "Activate plan"}
                                        </button>
                                    </div>
                                </article>
                            `;
                        }).join("") : `
                            <div class="account-placeholder-card">
                                <strong>Plan catalog unavailable</strong>
                                <p>Try refreshing this section in a moment.</p>
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    }
    if (activeAccountSection === "favorites") {
        return `
            <div class="account-panel">
                <p class="menu-eyebrow">Favorites</p>
                <h3>Your favorite picks</h3>
                <p class="account-panel-copy">Save restaurants and dishes you love so they stay one tap away.</p>
                ${favoriteRestaurants.length || favoriteMenuItems.length ? `
                    <div class="favorite-restaurant-grid">
                        ${favoriteRestaurants.map((restaurant) => `
                            <article class="favorite-restaurant-card">
                                <img src="${restaurant.image}" alt="${escapeHtml(restaurant.name)}" class="favorite-restaurant-image">
                                <div class="favorite-restaurant-copy">
                                    <h4>${escapeHtml(restaurant.name)}</h4>
                                    <p>${escapeHtml(restaurant.cuisine || "")}</p>
                                    <div class="favorite-restaurant-meta">
                                        <span>&#9733; ${formatNumber(restaurant.rating)}</span>
                                        <span>${escapeHtml(restaurant.time || "")}</span>
                                    </div>
                                </div>
                                <div class="favorite-restaurant-actions">
                                    <button class="secondary-button" type="button" onclick="closeAuthModal(); openRestaurantMenu('${escapeAttribute(restaurant.restaurantId)}')">Open menu</button>
                                    <button class="text-button danger-button" type="button" onclick="removeFavoriteFromAccount('${escapeAttribute(restaurant.restaurantId)}')">Remove</button>
                                </div>
                            </article>
                        `).join("")}
                    </div>
                    ${favoriteMenuItems.length ? `
                        <div class="favorite-section-divider"></div>
                        <div class="favorite-dish-grid">
                            ${favoriteMenuItems.map((item) => `
                                <article class="favorite-dish-card">
                                    <img src="${item.image || item.restaurantImage || ""}" alt="${escapeHtml(item.name)}" class="favorite-dish-image">
                                    <div class="favorite-dish-copy">
                                        <p class="favorite-dish-restaurant">${escapeHtml(item.restaurantName)}</p>
                                        <h4>${escapeHtml(item.name)}</h4>
                                        <p>${escapeHtml(item.description || "Saved favorite dish")}</p>
                                        <div class="favorite-dish-meta">
                                            <span>${formatCurrency(item.price)}</span>
                                            ${item.vegetarian ? '<span class="diet-pill">Veg</span>' : ""}
                                            ${item.vegan ? '<span class="diet-pill">Vegan</span>' : ""}
                                        </div>
                                    </div>
                                    <div class="favorite-dish-actions">
                                        <button class="secondary-button" type="button" onclick="closeAuthModal(); openRestaurantMenu('${escapeAttribute(item.restaurantId)}')">Open restaurant</button>
                                        <button class="text-button danger-button" type="button" onclick="removeFavoriteMenuItemFromAccount('${escapeAttribute(item.itemId)}')">Remove</button>
                                    </div>
                                </article>
                            `).join("")}
                        </div>
                    ` : ""}
                ` : `
                    <div class="account-placeholder-card">
                        <strong>No favorites saved yet</strong>
                        <p>Tap the heart on any restaurant or dish to save it here.</p>
                    </div>
                `}
            </div>
        `;
    }
    if (activeAccountSection === "payments") {
        const defaultMethod = getDefaultSavedPaymentMethod();
        const savedCardsCount = savedPaymentMethods.filter((method) => method.methodType === "CARD").length;
        return `
            <div class="account-panel">
                <div class="account-panel-head">
                    <div>
                        <p class="menu-eyebrow">Payments</p>
                        <h3>Payment methods</h3>
                        <p class="account-panel-copy">Save cards, wallets, and UPI handles so checkout is faster.</p>
                    </div>
                </div>
                <div class="account-stat-grid">
                    <div class="account-card">
                        <span>Default method</span>
                        <strong>${defaultMethod ? escapeHtml(formatPaymentMethodLabel(defaultMethod)) : "Cash on delivery"}</strong>
                    </div>
                    <div class="account-card">
                        <span>Saved methods</span>
                        <strong>${savedPaymentMethods.length} total - ${savedCardsCount} cards</strong>
                    </div>
                </div>
                <div class="payment-management-grid">
                    <section class="payment-method-list">
                        ${savedPaymentMethods.length ? savedPaymentMethods.map((method) => `
                            <article class="payment-method-card ${method.defaultMethod ? "default" : ""}">
                                <div class="payment-method-top">
                                    <div>
                                        <div class="payment-method-label-row">
                                            <h4>${escapeHtml(formatPaymentMethodLabel(method))}</h4>
                                            <span class="payment-type-pill">${escapeHtml(formatPaymentMethodType(method.methodType))}</span>
                                        </div>
                                        <p>${escapeHtml(formatPaymentMethodSubtitle(method))}</p>
                                    </div>
                                    ${method.defaultMethod ? '<span class="address-default-pill">Default</span>' : ""}
                                </div>
                                <div class="payment-method-actions">
                                    ${method.defaultMethod ? "" : `<button class="secondary-button" type="button" onclick="markPaymentMethodDefault(${method.id})">Set default</button>`}
                                    <button class="text-button danger-button" type="button" onclick="deletePaymentMethod(${method.id})">Remove</button>
                                </div>
                            </article>
                        `).join("") : `
                            <div class="account-placeholder-card compact">
                                <strong>No digital methods saved</strong>
                                <p>Add a card, UPI ID, or wallet here and it will show up during checkout too.</p>
                            </div>
                        `}
                    </section>

                    <section class="payment-form-panel">
                        <div class="payment-form-header">
                            <strong>Add a payment method</strong>
                            <p>Only masked card details are stored. Full card numbers are never saved.</p>
                        </div>
                        <form class="account-settings-form payment-settings-form" onsubmit="savePaymentMethod(event)">
                            <label class="account-form-field account-form-field-full">
                                <span>Method type</span>
                                <select id="paymentType" onchange="setPaymentFormType(this.value)">
                                    <option value="CARD" ${paymentFormType === "CARD" ? "selected" : ""}>Card</option>
                                    <option value="UPI" ${paymentFormType === "UPI" ? "selected" : ""}>UPI</option>
                                    <option value="WALLET" ${paymentFormType === "WALLET" ? "selected" : ""}>Wallet</option>
                                </select>
                            </label>
                            ${paymentFormType === "CARD" ? `
                                <label class="account-form-field">
                                    <span>Card holder</span>
                                    <input id="paymentCardHolder" type="text" placeholder="Name on card" required>
                                </label>
                                <label class="account-form-field">
                                    <span>Card number</span>
                                    <input id="paymentCardNumber" type="text" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" required>
                                </label>
                                <label class="account-form-field">
                                    <span>Expiry month</span>
                                    <input id="paymentExpiryMonth" type="text" inputmode="numeric" maxlength="2" placeholder="MM" required>
                                </label>
                                <label class="account-form-field">
                                    <span>Expiry year</span>
                                    <input id="paymentExpiryYear" type="text" inputmode="numeric" maxlength="4" placeholder="YYYY" required>
                                </label>
                            ` : ""}
                            ${paymentFormType === "UPI" ? `
                                <label class="account-form-field account-form-field-full">
                                    <span>UPI ID</span>
                                    <input id="paymentUpiId" type="text" placeholder="name@upi" required>
                                </label>
                            ` : ""}
                            ${paymentFormType === "WALLET" ? `
                                <label class="account-form-field account-form-field-full">
                                    <span>Wallet provider</span>
                                    <input id="paymentWalletProvider" type="text" placeholder="Paytm, PhonePe, Amazon Pay..." required>
                                </label>
                            ` : ""}
                            <label class="address-default-toggle payment-default-toggle account-form-field-full">
                                <input id="paymentDefault" type="checkbox" ${!savedPaymentMethods.length ? "checked" : ""}>
                                <span>Make this my default digital method</span>
                            </label>
                            <button class="primary-button" type="submit">Save payment method</button>
                            <div id="paymentFeedback" class="checkout-feedback"></div>
                        </form>
                    </section>
                </div>
            </div>
        `;
    }
    if (activeAccountSection === "addresses") {
        return `
            <div class="account-panel">
                <div class="account-panel-head">
                    <div>
                        <p class="menu-eyebrow">Addresses</p>
                        <h3>Manage saved addresses</h3>
                        <p class="account-panel-note">Use address book flow: search area -> pin on map -> fill full details.</p>
                    </div>
                    <button class="secondary-button" type="button" onclick="closeAuthModal(); openAddressBook()">Open address book</button>
                </div>
                <div class="account-placeholder-card">
                    <strong>${savedAddresses.length ? `${savedAddresses.length} saved address${savedAddresses.length === 1 ? "" : "es"}` : "No addresses saved yet"}</strong>
                    <p>Open address book to add, edit, delete, and manage default delivery address.</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="account-panel">
            <div class="account-panel-head">
                <div>
                    <p class="menu-eyebrow">Settings</p>
                    <h3>Profile and app settings</h3>
                </div>
            </div>
            <form class="account-settings-form" onsubmit="saveProfileSettings(event)">
                <div class="account-stat-grid">
                    <label class="account-form-field">
                        <span>Name</span>
                        <input id="settingsName" type="text" value="${escapeAttribute(currentUser.name || "")}" required>
                    </label>
                    <label class="account-form-field">
                        <span>Email</span>
                        <input id="settingsEmail" type="email" value="${escapeAttribute(currentUser.email || "")}" required>
                    </label>
                    <label class="account-form-field">
                        <span>Phone</span>
                        <input id="settingsPhone" type="tel" value="${escapeAttribute(currentUser.phoneNumber || "")}">
                    </label>
                    <label class="account-form-field">
                        <span>City</span>
                        <input id="settingsCity" type="text" value="${escapeAttribute(currentUser.city || "")}">
                    </label>
                    <label class="account-form-field">
                        <span>State</span>
                        <input id="settingsState" type="text" value="${escapeAttribute(currentUser.state || "")}">
                    </label>
                    <label class="account-form-field">
                        <span>Pincode</span>
                        <input id="settingsPincode" type="text" value="${escapeAttribute(currentUser.pincode || "")}">
                    </label>
                </div>
                <label class="account-form-field account-form-field-full">
                    <span>Address</span>
                    <textarea id="settingsAddress" rows="3" placeholder="House number, street, landmark">${escapeHtml(currentUser.address || "")}</textarea>
                </label>
                <div class="auth-actions">
                    <button class="primary-button" type="submit">Save profile</button>
                    <button class="secondary-button" type="button" onclick="setAccountSection('addresses')">Manage addresses</button>
                    <button class="text-button danger-button" type="button" onclick="logoutUser()">Log out</button>
                </div>
                <div id="settingsFeedback" class="checkout-feedback"></div>
            </form>
            <div class="auth-actions">
                <button class="secondary-button" type="button" onclick="setAccountSection('orders')">View orders</button>
            </div>
        </div>
    `;
}

function isAdminUser() {
    return currentUser?.role === "ADMIN";
}

async function loadAdminRestaurants() {
    if (!isAdminUser()) {
        return;
    }

    adminMenuLoading = true;
    adminMenuError = "";
    renderAuthModal();
    try {
        const payload = await fetchJson(`${API_BASE_URL}/restaurants/active`);
        adminRestaurants = Array.isArray(payload) ? payload : [];
        if (!adminSelectedRestaurantId && adminRestaurants.length) {
            adminSelectedRestaurantId = adminRestaurants[0].id;
        }
        await loadAdminMenuItems(adminSelectedRestaurantId);
    } catch (error) {
        adminMenuError = error.message || "Failed to load admin restaurant data.";
    } finally {
        adminMenuLoading = false;
        renderAuthModal();
    }
}

async function loadAdminMenuItems(restaurantId = adminSelectedRestaurantId) {
    if (!isAdminUser() || !restaurantId) {
        adminMenuItems = [];
        return;
    }

    adminMenuLoading = true;
    adminMenuError = "";
    renderAuthModal();
    try {
        const response = await fetchJson(`${API_BASE_URL}/menu-items/restaurant/${restaurantId}?activeOnly=false&availableOnly=false&page=0&size=300`);
        adminMenuItems = Array.isArray(response?.items) ? response.items : [];
    } catch (error) {
        adminMenuError = error.message || "Failed to load menu items.";
        adminMenuItems = [];
    } finally {
        adminMenuLoading = false;
        renderAuthModal();
    }
}

function setAdminRestaurant(restaurantId) {
    adminSelectedRestaurantId = Number(restaurantId) || null;
    adminEditingMenuItemId = null;
    loadAdminMenuItems(adminSelectedRestaurantId);
}

function startAdminMenuEdit(menuItemId) {
    adminEditingMenuItemId = menuItemId;
    renderAuthModal();
}

function resetAdminMenuForm() {
    adminEditingMenuItemId = null;
    renderAuthModal();
}

async function saveAdminMenuItem(event) {
    event.preventDefault();
    if (!isAdminUser()) {
        return;
    }

    const feedback = document.getElementById("adminMenuFeedback");
    const restaurantId = Number(document.getElementById("adminRestaurantSelect")?.value || adminSelectedRestaurantId);
    const name = document.getElementById("adminMenuName")?.value.trim();
    const category = document.getElementById("adminMenuCategory")?.value.trim();
    const price = Number(document.getElementById("adminMenuPrice")?.value || 0);
    const description = document.getElementById("adminMenuDescription")?.value.trim();
    const image = document.getElementById("adminMenuImage")?.value.trim();
    const vegetarian = Boolean(document.getElementById("adminMenuVeg")?.checked);
    const available = Boolean(document.getElementById("adminMenuAvailable")?.checked);

    if (!restaurantId || !name || !price) {
        if (feedback) {
            feedback.textContent = "Restaurant, item name, and price are required.";
            feedback.className = "checkout-feedback error";
        }
        return;
    }

    if (feedback) {
        feedback.textContent = adminEditingMenuItemId ? "Updating menu item..." : "Creating menu item...";
        feedback.className = "checkout-feedback";
    }

    const payload = {
        restaurantId,
        name,
        category: category || "main course",
        price,
        description: description || "",
        image: image || "",
        vegetarian,
        available,
        active: true
    };

    try {
        if (adminEditingMenuItemId) {
            await fetchJson(`${API_BASE_URL}/menu-items/${adminEditingMenuItemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            await fetchJson(`${API_BASE_URL}/menu-items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        adminEditingMenuItemId = null;
        if (feedback) {
            feedback.textContent = "Menu item saved successfully.";
            feedback.className = "checkout-feedback success";
        }
        await loadAdminMenuItems(restaurantId);
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to save menu item.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function deleteAdminMenuItem(menuItemId) {
    if (!isAdminUser()) {
        return;
    }
    const shouldDelete = window.confirm("Delete this menu item?");
    if (!shouldDelete) {
        return;
    }

    try {
        await fetchJson(`${API_BASE_URL}/menu-items/${menuItemId}`, { method: "DELETE" });
        adminMenuItems = adminMenuItems.filter((item) => item.id !== menuItemId);
        if (adminEditingMenuItemId === menuItemId) {
            adminEditingMenuItemId = null;
        }
        renderAuthModal();
    } catch (error) {
        alert(error.message || "Failed to delete menu item.");
    }
}

async function saveProfileSettings(event) {
    event.preventDefault();

    const feedback = document.getElementById("settingsFeedback");
    const payload = {
        name: document.getElementById("settingsName")?.value.trim(),
        email: document.getElementById("settingsEmail")?.value.trim(),
        phoneNumber: document.getElementById("settingsPhone")?.value.trim(),
        city: document.getElementById("settingsCity")?.value.trim(),
        state: document.getElementById("settingsState")?.value.trim(),
        pincode: document.getElementById("settingsPincode")?.value.trim(),
        address: document.getElementById("settingsAddress")?.value.trim()
    };

    if (feedback) {
        feedback.textContent = "Saving profile...";
        feedback.className = "checkout-feedback";
    }

    try {
        const user = await fetchJson(`${API_BASE_URL}/users/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        saveCurrentUser(user);
        renderAuthModal();

        const updatedFeedback = document.getElementById("settingsFeedback");
        if (updatedFeedback) {
            updatedFeedback.textContent = "Profile updated successfully.";
            updatedFeedback.className = "checkout-feedback success";
        }
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to update profile.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function renderOrdersAccountPanel() {
    const latestOrders = orderHistory.slice(0, 3);

    return `
        <div class="account-panel">
            <div class="account-panel-head">
                <div>
                    <p class="menu-eyebrow">Orders</p>
                    <h3>Your recent orders</h3>
                    <p class="account-panel-copy">Your SnapEats orders will be listed here.</p>
                </div>
                <button class="secondary-button" type="button" onclick="closeAuthModal(); openOrders()">Open full orders</button>
            </div>
            ${latestOrders.length ? `
                <div class="account-order-list">
                    ${latestOrders.map((order) => `
                        <article class="account-order-card">
                            <div>
                                <strong>${escapeHtml(order.restaurantName)}</strong>
                                <p>${escapeHtml(order.orderNumber)} - ${formatDateTime(order.createdAt)}</p>
                            </div>
                            <div class="account-order-meta">
                                <span class="order-status-badge ${statusClassName(order.status)}">${formatStatus(order.status)}</span>
                                <strong>${formatCurrency(order.finalAmount)}</strong>
                            </div>
                        </article>
                    `).join("")}
                </div>
            ` : `
                <div class="account-empty-state">
                    <p class="account-empty-note">Go ahead and find some awesome restaurants near you.</p>
                    <h3>No Orders</h3>
                    <p>You haven't placed any order yet.</p>
                </div>
            `}
        </div>
    `;
}

async function requestLoginSignupOtp(event) {
    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }
    const feedback = document.getElementById("authFeedback");
    const identifierInput = document.getElementById("authOtpIdentifier");
    const identifier = identifierInput?.value.trim() || otpAuthDraftIdentifier;

    otpAuthDraftIdentifier = identifier;
    otpAuthDraftName = document.getElementById("authOtpName")?.value || otpAuthDraftName;
    otpAuthDraftEmail = document.getElementById("authOtpEmail")?.value.trim() || otpAuthDraftEmail;
    otpAuthDraftReferralCode = document.getElementById("authOtpReferralCode")?.value.trim() || otpAuthDraftReferralCode;

    if (!identifier) {
        if (feedback) {
            feedback.textContent = "Please enter email or phone number first.";
            feedback.className = "checkout-feedback error";
        }
        return;
    }

    if (getOtpAuthCooldownSeconds() > 0 && otpAuthLastSentIdentifier === identifier) {
        if (feedback) {
            feedback.textContent = `Please wait ${getOtpAuthCooldownSeconds()}s before requesting OTP again for this number/email.`;
            feedback.className = "checkout-feedback error";
        }
        return;
    }

    if (feedback) {
        feedback.textContent = "Sending OTP...";
        feedback.className = "checkout-feedback";
    }

    try {
        const response = await fetchJson(`${API_BASE_URL}/users/auth/otp/request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ identifier })
        });

        otpAuthLastSentIdentifier = identifier;
        startOtpAuthCooldown(30);
        otpAuthStep = "verify";
        renderAuthModal("otp");
        const otpInput = document.getElementById("authOtpCode");
        if (otpInput && response?.devOtp) {
            otpInput.value = response.devOtp;
        }
        if (feedback) {
            const devOtpText = response?.devOtp ? ` (Demo OTP: ${response.devOtp})` : "";
            feedback.textContent = `${response?.message || "OTP sent."}${devOtpText}`;
            feedback.className = "checkout-feedback success";
        }
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to send OTP.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function verifyLoginSignupOtp(event) {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const identifier = document.getElementById("authOtpIdentifier")?.value.trim() || otpAuthDraftIdentifier;
    const otp = document.getElementById("authOtpCode")?.value.trim();
    const name = document.getElementById("authOtpName")?.value.trim() || otpAuthDraftName;

    otpAuthDraftIdentifier = identifier || "";
    otpAuthDraftName = name || "";

    if (feedback) {
        feedback.textContent = "Verifying OTP...";
        feedback.className = "checkout-feedback";
    }

    try {
        const authResponse = await fetchJson(`${API_BASE_URL}/users/auth/otp/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                identifier,
                otp,
                name,
                email: otpAuthDraftEmail,
                referralCode: otpAuthDraftReferralCode
            })
        });

        saveAuthToken(authResponse?.token || "");
        saveCurrentUser(authResponse?.user || authResponse);
        otpAuthDraftIdentifier = "";
        otpAuthDraftName = "";
        await Promise.all([fetchAddresses(), fetchOrders(), fetchFavoriteRestaurants(), fetchFavoriteMenuItems(), fetchPaymentMethods(), fetchSubscriptionData()]);
        renderAuthModal();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Invalid OTP.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function setOtpAuthFlowMode(mode) {
    otpAuthFlowMode = mode === "signup" ? "signup" : "login";
    otpAuthStep = "form";
    clearOtpAuthCooldown();
    otpAuthLastSentIdentifier = "";
    renderAuthModal("otp");
}

function resetOtpAuthStep() {
    otpAuthStep = "form";
    clearOtpAuthCooldown();
    otpAuthLastSentIdentifier = "";
    renderAuthModal("otp");
}

function resetOtpAuthFlow() {
    otpAuthStep = "form";
    otpAuthFlowMode = "login";
    otpAuthDraftIdentifier = "";
    otpAuthDraftName = "";
    otpAuthDraftEmail = "";
    otpAuthDraftReferralCode = "";
    otpAuthLastSentIdentifier = "";
    clearOtpAuthCooldown();
}

async function loginUser(event) {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const email = document.getElementById("authEmail")?.value.trim();
    const password = document.getElementById("authPassword")?.value;

    if (feedback) {
        feedback.textContent = "Signing you in...";
        feedback.className = "checkout-feedback";
    }

    try {
        const authResponse = await fetchJson(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        saveAuthToken(authResponse?.token || "");
        saveCurrentUser(authResponse?.user || authResponse);
        await Promise.all([fetchAddresses(), fetchOrders(), fetchFavoriteRestaurants(), fetchFavoriteMenuItems(), fetchPaymentMethods(), fetchSubscriptionData()]);
        renderAuthModal();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Login failed.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function signupUser(event) {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const payload = {
        name: document.getElementById("authName")?.value.trim(),
        phoneNumber: document.getElementById("authPhone")?.value.trim(),
        email: document.getElementById("authEmail")?.value.trim(),
        password: document.getElementById("authPassword")?.value,
        role: "USER",
        active: true
    };

    if (feedback) {
        feedback.textContent = "Creating your account...";
        feedback.className = "checkout-feedback";
    }

    try {
        const authResponse = await fetchJson(`${API_BASE_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        saveAuthToken(authResponse?.token || "");
        saveCurrentUser(authResponse?.user || authResponse);
        savedAddresses = [];
        orderHistory = [];
        favoriteRestaurants = [];
        favoriteMenuItems = [];
        savedPaymentMethods = [];
        subscriptionPlans = [];
        currentSubscription = null;
        subscriptionFeedback = { type: "", message: "" };
        resetCouponState();
        checkoutPaymentChoice = "CASH";
        renderCart();
        renderOrders();
        renderRestaurants();
        renderAuthModal();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Signup failed.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function requestPasswordOtp() {
    const feedback = document.getElementById("authFeedback");
    const email = document.getElementById("authForgotEmail")?.value.trim();

    if (!email) {
        if (feedback) {
            feedback.textContent = "Please enter your email first.";
            feedback.className = "checkout-feedback error";
        }
        return;
    }

    if (feedback) {
        feedback.textContent = "Requesting OTP...";
        feedback.className = "checkout-feedback";
    }

    try {
        const response = await fetchJson(`${API_BASE_URL}/users/forgot-password/request-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        if (feedback) {
            const devOtpText = response?.devOtp ? ` (Demo OTP: ${response.devOtp})` : "";
            feedback.textContent = `${response?.message || "OTP sent."}${devOtpText}`;
            feedback.className = "checkout-feedback success";
        }
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to request OTP.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function resetPasswordWithOtp(event) {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const email = document.getElementById("authForgotEmail")?.value.trim();
    const otp = document.getElementById("authForgotOtp")?.value.trim();
    const newPassword = document.getElementById("authForgotNewPassword")?.value;

    if (feedback) {
        feedback.textContent = "Resetting password...";
        feedback.className = "checkout-feedback";
    }

    try {
        const response = await fetchJson(`${API_BASE_URL}/users/forgot-password/reset`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp, newPassword })
        });

        if (feedback) {
            feedback.textContent = response?.message || "Password reset successful.";
            feedback.className = "checkout-feedback success";
        }
        window.setTimeout(() => renderAuthModal("otp"), 900);
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to reset password.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function logoutUser() {
    saveCurrentUser(null);
    saveAuthToken("");
    resetOtpAuthFlow();
    savedAddresses = [];
    orderHistory = [];
    favoriteRestaurants = [];
    favoriteMenuItems = [];
    savedPaymentMethods = [];
    subscriptionPlans = [];
    currentSubscription = null;
    subscriptionFeedback = { type: "", message: "" };
    resetCouponState();
    checkoutPaymentChoice = "CASH";
    closeAuthModal();
    renderAddressBook();
    renderOrders();
    renderRestaurants();
    renderCart();
}

async function removeFavoriteFromAccount(restaurantId) {
    try {
        await fetchJson(`${API_BASE_URL}/favorites/restaurants/${encodeURIComponent(restaurantId)}`, {
            method: "DELETE"
        });
        await fetchFavoriteRestaurants();
    } catch (error) {
        alert(error.message || "Failed to remove favorite.");
    }
}

async function removeFavoriteMenuItemFromAccount(itemId) {
    try {
        await fetchJson(`${API_BASE_URL}/favorites/menu-items/${encodeURIComponent(itemId)}`, {
            method: "DELETE"
        });
        await fetchFavoriteMenuItems();
    } catch (error) {
        alert(error.message || "Failed to remove favorite dish.");
    }
}

async function savePaymentMethod(event) {
    event.preventDefault();

    const feedback = document.getElementById("paymentFeedback");
    const payload = {
        methodType: paymentFormType,
        defaultMethod: document.getElementById("paymentDefault")?.checked || false
    };

    if (paymentFormType === "CARD") {
        const cardNumber = document.getElementById("paymentCardNumber")?.value.trim() || "";
        payload.cardHolderName = document.getElementById("paymentCardHolder")?.value.trim();
        payload.cardNumber = cardNumber;
        payload.cardBrand = detectCardBrand(cardNumber);
        payload.expiryMonth = document.getElementById("paymentExpiryMonth")?.value.trim();
        payload.expiryYear = document.getElementById("paymentExpiryYear")?.value.trim();
    } else if (paymentFormType === "UPI") {
        payload.upiId = document.getElementById("paymentUpiId")?.value.trim();
    } else {
        payload.walletProvider = document.getElementById("paymentWalletProvider")?.value.trim();
    }

    if (feedback) {
        feedback.textContent = "Saving your payment method...";
        feedback.className = "checkout-feedback";
    }

    try {
        await fetchJson(`${API_BASE_URL}/payments/methods`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        paymentFormType = "CARD";
        await fetchPaymentMethods();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to save payment method.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function markPaymentMethodDefault(paymentMethodId) {
    try {
        await fetchJson(`${API_BASE_URL}/payments/methods/${paymentMethodId}/default`, {
            method: "PATCH"
        });
        await fetchPaymentMethods();
    } catch (error) {
        alert(error.message || "Failed to update default payment method.");
    }
}

async function deletePaymentMethod(paymentMethodId) {
    try {
        await fetchJson(`${API_BASE_URL}/payments/methods/${paymentMethodId}`, {
            method: "DELETE"
        });
        await fetchPaymentMethods();
    } catch (error) {
        alert(error.message || "Failed to remove payment method.");
    }
}

async function activateSubscription(planCode) {
    const normalizedPlanCode = String(planCode || "").trim();
    if (!normalizedPlanCode || subscriptionLoading) {
        return;
    }

    subscriptionFeedback = { type: "", message: "" };
    subscriptionLoading = true;
    renderAuthModal();
    try {
        await fetchJson(`${API_BASE_URL}/subscriptions/me/activate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                planCode: normalizedPlanCode,
                autoRenew: true
            })
        });
        subscriptionFeedback = { type: "success", message: "Membership activated successfully." };
    } catch (error) {
        subscriptionFeedback = { type: "error", message: error.message || "Failed to activate plan." };
    } finally {
        await fetchSubscriptionData();
    }
}

async function cancelSubscription() {
    if (subscriptionLoading || !currentSubscription?.active) {
        return;
    }

    const shouldCancel = window.confirm("Cancel your active membership?");
    if (!shouldCancel) {
        return;
    }

    subscriptionFeedback = { type: "", message: "" };
    subscriptionLoading = true;
    renderAuthModal();
    try {
        await fetchJson(`${API_BASE_URL}/subscriptions/me/cancel`, {
            method: "PATCH"
        });
        subscriptionFeedback = { type: "success", message: "Membership cancelled. You can reactivate anytime." };
    } catch (error) {
        subscriptionFeedback = { type: "error", message: error.message || "Failed to cancel membership." };
    } finally {
        await fetchSubscriptionData();
    }
}

function renderOrders(isLoading = false) {
    const content = document.getElementById("ordersModalContent");
    if (!content) {
        return;
    }

    if (isLoading && !orderHistory.length) {
        content.innerHTML = `<div class="modal-loading">Loading your orders...</div>`;
        return;
    }

    if (!orderHistory.length) {
        content.innerHTML = `
            <div class="orders-shell">
                <div class="orders-empty">
                    <h2>No orders yet</h2>
                    <p>Your recent orders will appear here with tracking and reorder options.</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="orders-shell">
            <div class="orders-header">
                <div>
                    <p class="menu-eyebrow">My orders</p>
                    <h2>Track every order in one place</h2>
                </div>
                <button class="secondary-button" type="button" onclick="fetchOrders()">Refresh</button>
            </div>

            <div class="orders-list">
                ${orderHistory.map((order) => `
                    <article class="order-card">
                        <div class="order-card-top">
                            <div class="order-restaurant">
                                ${order.restaurantImage ? `<img src="${order.restaurantImage}" alt="${escapeHtml(order.restaurantName)}" class="order-restaurant-image">` : ""}
                                <div>
                                    <h3>${escapeHtml(order.restaurantName)}</h3>
                                    <p>${escapeHtml(order.orderNumber)} - ${formatDateTime(order.createdAt)}</p>
                                </div>
                            </div>
                            <span class="order-status-badge ${statusClassName(getTrackedOrderStage(order))}">${formatStatus(getTrackedOrderStage(order))}</span>
                        </div>

                        <div class="order-tracking-hero ${statusClassName(getTrackedOrderStage(order))}">
                            <div>
                                <p class="order-tracking-kicker">Live tracking</p>
                                <h4>${escapeHtml(getTrackingHeadline(order))}</h4>
                                <p>${escapeHtml(getTrackingCopy(order))}</p>
                            </div>
                            <div class="order-tracking-side">
                                <span class="order-tracking-eta">${escapeHtml(getEtaLabel(order))}</span>
                                <small>${escapeHtml(getTrackingSubcopy(order))}</small>
                            </div>
                        </div>

                        <div class="order-progress">
                            ${buildOrderProgress(getTrackedOrderStage(order))}
                        </div>

                        <div class="order-meta-grid">
                            <div><span>Items</span><strong>${order.itemCount || 0}</strong></div>
                            <div><span>Total</span><strong>${formatCurrency(order.finalAmount)}</strong></div>
                            <div><span>Payment</span><strong>${formatStatus(order.paymentMethod)}</strong></div>
                            <div><span>Delivery</span><strong>${order.estimatedDeliveryTime ? formatTime(order.estimatedDeliveryTime) : "TBD"}</strong></div>
                        </div>

                        <div class="order-milestone-row">
                            ${buildOrderMilestones(order).map((milestone) => `
                                <div class="order-milestone ${milestone.active ? "active" : ""}">
                                    <span>${escapeHtml(milestone.label)}</span>
                                    <strong>${escapeHtml(milestone.time)}</strong>
                                </div>
                            `).join("")}
                        </div>

                        <div class="order-items-preview">
                            ${(order.items || []).map((item) => `
                                <div class="order-line-item">
                                    <span>${item.quantity}x ${escapeHtml(item.itemName)}</span>
                                    <strong>${formatCurrency(item.totalPrice)}</strong>
                                </div>
                            `).join("")}
                        </div>

                        <div class="order-address-block">
                            <p class="order-block-label">Delivering to</p>
                            <p>${escapeHtml(order.deliveryAddress || "Address unavailable")}</p>
                            ${order.contactNumber ? `<p>${escapeHtml(order.contactNumber)}</p>` : ""}
                            ${order.specialInstructions ? `<p class="order-note">Note: ${escapeHtml(order.specialInstructions)}</p>` : ""}
                        </div>

                        <div class="order-card-actions">
                            ${order.canReorder ? `<button class="primary-button" type="button" onclick="reorderItems(${order.id})">Reorder</button>` : ""}
                            ${order.canCancel ? `<button class="secondary-button" type="button" onclick="cancelOrder(${order.id})">Cancel order</button>` : ""}
                        </div>
                    </article>
                `).join("")}
            </div>
        </div>`;
}

function buildOrderProgress(status) {
    const steps = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    if (status === "CANCELLED") {
        return `<div class="order-cancelled-line">This order was cancelled.</div>`;
    }

    const activeIndex = steps.indexOf(status === "PENDING" ? "CONFIRMED" : status);
    return steps.map((step, index) => `
        <div class="order-progress-step ${index <= activeIndex ? "active" : ""}">
            <span class="order-progress-dot"></span>
            <span>${formatStatus(step)}</span>
        </div>
    `).join("");
}

async function cancelOrder(orderId) {
    if (!window.confirm("Cancel this order?")) {
        return;
    }

    try {
        await fetchJson(`${API_BASE_URL}/orders/mine/${orderId}/cancel`, {
            method: "PATCH"
        });
        await fetchOrders();
    } catch (error) {
        alert(error.message || "Failed to cancel order.");
    }
}

async function reorderItems(orderId) {
    const order = orderHistory.find((entry) => entry.id === orderId);
    if (!order || !order.restaurantId || !Array.isArray(order.items) || !order.items.length) {
        return;
    }

    if (cart.items.length && cart.restaurantCode && cart.restaurantCode !== order.restaurantId) {
        const shouldReplace = window.confirm(`Your cart has items from ${cart.restaurantName}. Replace them with this previous order?`);
        if (!shouldReplace) {
            return;
        }
    }

    try {
        const menuResponse = await fetchJson(`${API_BASE_URL}/menu-items/restaurant-code/${encodeURIComponent(order.restaurantId)}?activeOnly=true&availableOnly=true&size=100&sortBy=popular`);
        const menuItems = menuResponse.items || [];

        cart = {
            restaurantCode: order.restaurantId,
            restaurantName: order.restaurantName,
            items: order.items.map((item) => {
                const menuItem = menuItems.find((entry) => entry.name === item.itemName);
                return {
                    itemId: menuItem?.itemId || `reorder_${item.id}`,
                    name: item.itemName,
                    price: item.price,
                    basePrice: item.price,
                    quantity: item.quantity,
                    image: menuItem?.image || order.restaurantImage || "",
                    notes: item.customizations || ""
                };
            })
        };

        saveCart();
        closeOrders();
        openCart();
    } catch (error) {
        alert(error.message || "Failed to reorder.");
    }
}

function resetAddressForm() {
    editingAddressId = null;
    renderAddressBook();
}

function startAddressEdit(addressId) {
    editingAddressId = addressId;
    renderAddressBook();
}

async function saveAddress(event) {
    event.preventDefault();

    const feedback = document.getElementById("addressFeedback");
    if (!isAuthenticatedSession()) {
        if (feedback) {
            feedback.textContent = "Please log in again to save your address.";
            feedback.className = "checkout-feedback error";
        }
        openAuthModal();
        return;
    }

    if (!addressLocationConfirmed && !editingAddressId) {
        if (feedback) {
            feedback.textContent = "Please confirm delivery location on map first.";
            feedback.className = "checkout-feedback error";
        }
        setAddressMapStatus("Confirm map pin first, then save address.", "error");
        return;
    }

    const payload = {
        label: document.getElementById("addressLabel")?.value.trim(),
        recipientName: document.getElementById("addressRecipientName")?.value.trim(),
        phoneNumber: document.getElementById("addressPhoneNumber")?.value.trim(),
        addressLine: document.getElementById("addressLine")?.value.trim(),
        landmark: document.getElementById("addressLandmark")?.value.trim(),
        city: document.getElementById("addressCity")?.value.trim(),
        state: document.getElementById("addressState")?.value.trim(),
        pincode: document.getElementById("addressPincode")?.value.trim(),
        latitude: parseCoordinate(document.getElementById("addressLatitude")?.value),
        longitude: parseCoordinate(document.getElementById("addressLongitude")?.value),
        defaultAddress: document.getElementById("addressDefault")?.checked || false
    };

    if (feedback) {
        feedback.textContent = editingAddressId ? "Updating address..." : "Saving address...";
        feedback.className = "checkout-feedback";
    }

    try {
        const endpoint = editingAddressId
            ? `${API_BASE_URL}/addresses/${editingAddressId}`
            : `${API_BASE_URL}/addresses`;
        const method = editingAddressId ? "PUT" : "POST";

        await fetchJson(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        editingAddressId = null;
        await fetchAddresses();
        renderAddressBook();

        const updatedFeedback = document.getElementById("addressFeedback");
        if (updatedFeedback) {
            updatedFeedback.textContent = method === "POST" ? "Address saved successfully." : "Address updated successfully.";
            updatedFeedback.className = "checkout-feedback success";
        }
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to save address.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function setDefaultAddress(addressId) {
    try {
        await fetchJson(`${API_BASE_URL}/addresses/${addressId}/default`, {
            method: "PATCH"
        });
        await fetchAddresses();
        renderAddressBook();
    } catch (error) {
        alert(error.message || "Failed to update default address.");
    }
}

async function deleteAddress(addressId) {
    const address = getAddressById(addressId);
    if (address?.defaultAddress) {
        alert("You cannot delete the default address. Set another address as default first.");
        return;
    }
    if (!window.confirm("Delete this saved address?")) {
        return;
    }

    try {
        await fetchJson(`${API_BASE_URL}/addresses/${addressId}`, {
            method: "DELETE"
        });
        if (editingAddressId === addressId) {
            editingAddressId = null;
        }
        await fetchAddresses();
        renderAddressBook();
    } catch (error) {
        alert(error.message || "Failed to delete address.");
    }
}

function clearCart() {
    cart = createEmptyCart();
    resetCouponState();
    saveCart();
    if (activeRestaurant) {
        renderMenuModal();
    }
}

async function submitOrder(event) {
    event.preventDefault();
    if (!cart.items.length || !cart.restaurantCode) {
        return;
    }

    const feedback = document.getElementById("checkoutFeedback");
    const selectedPayment = getCheckoutPaymentSelection();
    const paymentMethod = selectedPayment.type || "CASH";
    const notes = document.getElementById("checkoutNotes")?.value.trim();
    const defaultAddress = getDefaultAddress();

    if (!defaultAddress) {
        if (feedback) {
            feedback.textContent = "Please add a default delivery address first.";
            feedback.className = "checkout-feedback error";
        }
        return;
    }

    if (feedback) {
        feedback.textContent = "Placing your order...";
        feedback.className = "checkout-feedback";
    }

    try {
        const placedItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = getCartSubtotal();
        const deliveryFee = getDeliveryFee(subtotal);
        const subscriptionDiscount = getSubscriptionDiscount(subtotal);
        const couponDiscount = getCouponDiscount(subtotal);
        const discount = roundAmount(subscriptionDiscount + couponDiscount);
        const response = await fetchJson(`${API_BASE_URL}/orders/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                restaurantCode: cart.restaurantCode,
                addressId: defaultAddress.id,
                customerName: defaultAddress.recipientName,
                specialInstructions: notes,
                paymentMethod,
                couponCode: appliedCouponCode || null,
                deliveryFee,
                discount,
                items: cart.items.map((item) => ({
                    itemId: item.itemId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes
                }))
            })
        });

        if (feedback) {
            feedback.textContent = `Order placed successfully to ${defaultAddress.label} using ${selectedPayment.label}. Order number: ${response.order.orderNumber}`;
            feedback.className = "checkout-feedback success";
        }

        latestOrderSuccess = {
            order: {
                ...(response.order || {}),
                restaurantName: cart.restaurantName || response.order?.restaurantName || "Your order",
                status: response.order?.status || "CONFIRMED"
            },
            addressLabel: defaultAddress.label,
            paymentLabel: selectedPayment.label,
            itemCount: placedItemCount
        };

        cart = createEmptyCart();
        resetCouponState();
        saveCart();
        await fetchOrders();
        if (activeRestaurant) {
            renderMenuModal();
        }
        setTimeout(() => {
            renderCart();
        }, 1200);
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to place order.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function getCartSubtotal() {
    return roundAmount(cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
}

function getDeliveryFee(subtotal = getCartSubtotal()) {
    if (!cart.items.length || subtotal <= 0) {
        return 0;
    }
    if (currentSubscription?.active) {
        const minOrder = Number(currentSubscription.minOrderForFreeDelivery || 0);
        if (subtotal >= minOrder) {
            return 0;
        }
    }
    return 40;
}

function getSubscriptionDiscount(subtotal = getCartSubtotal()) {
    if (!currentSubscription?.active || subtotal <= 0) {
        return 0;
    }
    const discountPercent = Math.max(0, Number(currentSubscription.discountPercent || 0));
    if (!discountPercent) {
        return 0;
    }
    const maxDiscount = Math.max(0, Number(currentSubscription.maxDiscountPerOrder || 0));
    const rawDiscount = subtotal * (discountPercent / 100);
    if (!maxDiscount) {
        return roundAmount(rawDiscount);
    }
    return roundAmount(Math.min(rawDiscount, maxDiscount));
}

function closeMenu() {
    const modal = document.getElementById("menuModal");
    if (!modal) {
        return;
    }
    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
    activeRestaurant = null;
    activeMenuItems = [];
    if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
}

function anyModalOpen() {
    return ["menuModal", "cartModal", "addressModal", "ordersModal", "authModal", "locationModal", "offersModal", "corporateModal"].some((modalId) =>
        document.getElementById(modalId)?.classList.contains("open")
    );
}

function scrollCarousel(containerId, amount) {
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({ left: amount, behavior: "smooth" });
    }
}

function handleRestaurantKeydown(event, restaurantCode) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRestaurantMenu(restaurantCode);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
    return String(value).replace(/'/g, "\\'");
}

function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function formatNumber(value) {
    return Number(value || 0).toFixed(1);
}

function formatPaymentMethodLabel(method) {
    if (!method) {
        return "Cash on delivery";
    }
    if (method.label) {
        return method.label;
    }
    if (method.methodType === "CARD") {
        return `${method.cardBrand || "Card"} ending ${method.cardLast4 || "0000"}`;
    }
    if (method.methodType === "UPI") {
        return `UPI - ${method.upiId || ""}`;
    }
    return `Wallet - ${method.walletProvider || ""}`;
}

function formatPaymentMethodSubtitle(method) {
    if (!method) {
        return "";
    }
    if (method.methodType === "CARD") {
        const expiry = method.expiryMonth && method.expiryYear
            ? `Expires ${method.expiryMonth}/${String(method.expiryYear).slice(-2)}`
            : "Card saved securely";
        return [method.cardHolderName, expiry].filter(Boolean).join(" - ");
    }
    if (method.methodType === "UPI") {
        return "Fast UPI checkout";
    }
    return "Wallet ready for checkout";
}

function formatPaymentMethodType(type) {
    if (type === "UPI") {
        return "UPI";
    }
    if (type === "CARD") {
        return "Card";
    }
    if (type === "WALLET") {
        return "Wallet";
    }
    return "Cash";
}

function detectCardBrand(cardNumber) {
    const digits = String(cardNumber || "").replace(/\D/g, "");
    if (digits.startsWith("4")) {
        return "Visa";
    }
    if (/^5[1-5]/.test(digits)) {
        return "Mastercard";
    }
    if (/^3[47]/.test(digits)) {
        return "Amex";
    }
    if (/^(506|508|60|65|81|82|353|356)/.test(digits)) {
        return "RuPay";
    }
    return "Card";
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function formatDateTime(value) {
    if (!value) {
        return "Just now";
    }
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(value));
}

function formatTime(value) {
    if (!value) {
        return "TBD";
    }
    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(value));
}

function formatStatus(value) {
    return String(value || "")
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function statusClassName(status) {
    return `status-${String(status || "").toLowerCase()}`;
}

function roundAmount(value) {
    return Math.round(value * 100) / 100;
}

function showErrorMessage(message) {
    const notice = document.getElementById("globalApiNotice");
    if (notice) {
        notice.textContent = message || "Something went wrong. Please try again.";
        notice.classList.add("visible");
    }
    console.error(message);
}

function clearErrorMessage() {
    const notice = document.getElementById("globalApiNotice");
    if (notice) {
        notice.textContent = "";
        notice.classList.remove("visible");
    }
}

async function initializeApp() {
    try {
        clearErrorMessage();
        if (currentUser?.id && !authToken) {
            saveCurrentUser(null);
        }
        updateAuthNav();
        updateLocationChip();
        renderDiscoveryFilters();
        if (currentUser?.id) {
            await refreshCurrentUser();
        }
        await Promise.all([
            fetchCategories(),
            fetchRestaurants(),
            fetchAddresses(),
            fetchOrders(),
            fetchFavoriteRestaurants(),
            fetchFavoriteMenuItems(),
            fetchPaymentMethods(),
            fetchSubscriptionData()
        ]);
        updateCartCount();
        renderCart();
        const deepLinkRestaurant = window.location.hash.replace("#", "");
        if (deepLinkRestaurant) {
            openRestaurantMenu(deepLinkRestaurant);
        }
    } catch {
        showErrorMessage("Failed to initialize app.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    syncHeaderOffsetVar();
    initializeApp();

    const searchInput = document.getElementById("searchInput");
    const searchActionButton = document.getElementById("searchActionButton");
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchRestaurants(event.target.value);
            }, 250);
        });

        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
            }
        });
    }

    if (searchActionButton) {
        searchActionButton.addEventListener("click", () => {
            runSearch();
        });
    }

    ["menuModal", "cartModal", "addressModal", "ordersModal", "authModal", "locationModal", "offersModal", "corporateModal"].forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    if (modalId === "menuModal") {
                        closeMenu();
                    } else if (modalId === "cartModal") {
                        closeCart();
                    } else if (modalId === "addressModal") {
                        closeAddressBook();
                    } else if (modalId === "ordersModal") {
                        closeOrders();
                    } else if (modalId === "locationModal") {
                        closeLocationPicker();
                    } else if (modalId === "offersModal") {
                        closeOffers();
                    } else if (modalId === "corporateModal") {
                        closeCorporatePage();
                    } else {
                        closeAuthModal();
                    }
                }
            });
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            closeCart();
            closeAddressBook();
            closeOrders();
            closeAuthModal();
            closeLocationPicker();
            closeOffers();
            closeCorporatePage();
            closeSearchBar();
        }
    });

    window.addEventListener("resize", () => {
        syncHeaderOffsetVar();
    });
});



