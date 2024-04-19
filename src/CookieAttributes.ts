export type CookieAttributes = BaseCookie & MaybeSecureCookie & MaybeSameSiteCookie & MaybePartitionedCookie;

interface BaseCookie {
    /**
     * Indicates the maximum lifetime of the cookie. A number will be interpreted as days from time of creation.
     * If unspecified, the cookie becomes a session cookie. A session finishes when the client shuts down,
     * after which the session cookie is removed. 
     */
    expires?: Date | number;

    /**
     * The host to which the cookie will be sent. Only the current domain can be set as the value,
     * or a domain of a higher order, unless it is a public suffix. Setting the domain will make the
     * cookie available to it, as well as to all its subdomains.
     * If omitted, this attribute defaults to the host of the current document URL, not including subdomains.
     */
    domain?: string;

    /**
     * The cookie will only be included in an HTTP request if the request
     * path matches (or is a subdirectory of) the cookie's path attribute.
     */
    path?: string;
}

type MaybeSecureCookie = InsecureCookie | SecureCookie;

interface InsecureCookie {
    /**
     * If enabled, the cookie will only be sent to the server when a request is made with the https:
     * scheme (except on localhost), and therefore, is more resistant to man-in-the-middle attacks.
     */
    secure?: false;
}

interface SecureCookie {
    /**
     * Indicates that the cookie is sent to the server only when a request is made with the https:
     * scheme (except on localhost), and therefore, is more resistant to man-in-the-middle attacks.
     */
    secure: true;
}

type MaybeSameSiteCookie = LaxOrStrictSameSiteCookie | NoneSameSiteCookie;

interface LaxOrStrictSameSiteCookie {
    /**
     * Controls whether or not a cookie is sent with cross-site requests,
     * providing some protection against cross-site request forgery attacks (CSRF). 
     *
     * `strict`: the browser only sends the cookie with requests originating
     * from the same site (and same scheme) that set the cookie.
     * 
     * `lax`: the cookie is not sent on cross-site requests, (e.g. to load images or frames), but
     * is sent when navigating to the origin site from an external site (e.g. when following a link).
     * This is the default behavior if the SameSite attribute is not specified.
     *
     * `none`: the browser sends the cookie with both cross-site and same-site requests.
     * The `secure` attribute must also be set when using this value.
     */
    sameSite?: 'strict' | 'lax';
}

/** Cookies with `SameSite=None` must also specify 'Secure' */
interface NoneSameSiteCookie extends SecureCookie {
    /**
     * Controls whether or not a cookie is sent with cross-site requests,
     * providing some protection against cross-site request forgery attacks (CSRF). 
     *
     * `strict`: the browser only sends the cookie with requests originating
     * from the same site (and same scheme) that set the cookie.
     * 
     * `lax`: the cookie is not sent on cross-site requests, (e.g. to load images or frames), but
     * is sent when navigating to the origin site from an external site (e.g. when following a link).
     * This is the default behavior if the SameSite attribute is not specified.
     *
     * `none`: the browser sends the cookie with both cross-site and same-site requests.
     * The `secure` attribute must also be set when using this value.
     */
    sameSite: 'none';
}

type MaybePartitionedCookie = UnpartitionedCookieAttributes | PartitionedCookieAttributes;

interface UnpartitionedCookieAttributes {
    /**
     * If enabled, indicates that the cookie should be stored using partitioned storage.
     */
    partitioned?: false;
}

/** Cookies with `Partitioned` must also specify 'Secure' */
interface PartitionedCookieAttributes extends SecureCookie {
    /**
     * Indicates that the cookie should be stored using partitioned storage.
     */
    partitioned: true;
}
