(function () {
    const params = new URLSearchParams(window.location.search);
    const queryOverride = params.get("apiBaseUrl");
    let storedOverride = null;

    try {
        storedOverride = window.localStorage.getItem("snap_eats_api_base_url");
    } catch (error) {
        storedOverride = null;
    }

    const explicitOverride = window.__SNAP_EATS_API_BASE_URL__ || queryOverride || storedOverride;
    if (explicitOverride) {
        window.__SNAP_EATS_API_BASE_URL__ = explicitOverride.replace(/\/$/, "");
        return;
    }

    const hostname = window.location.hostname;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    const useBackendDirectly = window.location.protocol === "file:" || (isLocalHost && window.location.port !== "8080");

    window.__SNAP_EATS_API_BASE_URL__ = useBackendDirectly
        ? "http://localhost:8081/api"
        : "/api";
})();
