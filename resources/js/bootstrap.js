import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;
window.axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
window.axios.defaults.xsrfCookieName = "XSRF-TOKEN";

const resolveCsrfToken = () => {
    const meta = document.head?.querySelector("meta[name=\"csrf-token\"]");
    if (meta?.content) {
        return meta.content;
    }

    const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN=([^;]+)/);
    if (match) {
        return decodeURIComponent(match[2]);
    }

    return null;
};

const resolveRelativeUrl = (candidate) => {
    if (!candidate) {
        return null;
    }

    try {
        const url = new URL(candidate, window.location.origin);
        return `${url.pathname}${url.search}${url.hash}`;
    } catch (error) {
        return candidate;
    }
};

const patchInertiaUrl = (response, page) => {
    if (!page || typeof page !== "object" || page.url) {
        return false;
    }

    const fallback =
        resolveRelativeUrl(response.headers?.["x-inertia-location"]) ??
        resolveRelativeUrl(response.request?.responseURL) ??
        resolveRelativeUrl(response.config?.url) ??
        window.location.pathname + window.location.search + window.location.hash;

    if (!fallback) {
        return false;
    }

    page.url = fallback;
    return true;
};

let csrfWarningLogged = false;
let inertiaUrlWarningLogged = false;

window.axios.interceptors.request.use(
    (config) => {
        const token = resolveCsrfToken();

        if (token) {
            config.headers = config.headers || {};
            config.headers["X-CSRF-TOKEN"] = token;
        } else if (!csrfWarningLogged) {
            csrfWarningLogged = true;
            console.error(
                "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
            );
        }

        return config;
    },
    (error) => Promise.reject(error)
);

window.axios.interceptors.response.use(
    (response) => {
        const isInertiaResponse =
            !!response?.headers?.["x-inertia"] &&
            response?.data !== undefined;

        if (!isInertiaResponse) {
            return response;
        }

        console.debug("Inertia axios response", response);

        let patched = false;

        if (typeof response.data === "string") {
            try {
                const parsed = JSON.parse(response.data);
                patched = patchInertiaUrl(response, parsed);
                if (patched) {
                    response.data = JSON.stringify(parsed);
                }
            } catch (error) {
                console.warn("Failed parsing Inertia response for URL patch", error);
            }
        } else if (typeof response.data === "object" && response.data !== null) {
            patched = patchInertiaUrl(response, response.data);
        }

        if (patched && !inertiaUrlWarningLogged) {
            inertiaUrlWarningLogged = true;
            console.warn(
                "Recovered missing Inertia url from fallback source.",
                response
            );
        }

        return response;
    },
    (error) => {
        // Handle CSRF token mismatch (419 error)
        if (error.response?.status === 419) {
            console.warn('CSRF token mismatch detected. Reloading page to get fresh token...');

            // Store current form data in sessionStorage if available
            if (error.config?.data) {
                try {
                    const formData = JSON.parse(error.config.data);
                    sessionStorage.setItem('csrf_retry_data', JSON.stringify({
                        url: error.config.url,
                        data: formData,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    // Ignore parsing errors
                }
            }

            // Reload the page to get a fresh CSRF token
            window.location.reload();

            // Return a pending promise to prevent further error handling
            return new Promise(() => {});
        }

        return Promise.reject(error);
    }
);
