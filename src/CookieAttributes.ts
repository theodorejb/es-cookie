export interface CookieAttributes {
    /**
     * A number will be interpreted as days from time of creation
     */
    expires?: Date | number;

    /**
     * Hosts to which the cookie will be sent
     */
    domain?: string;

    /**
     * The cookie will only be included in an HTTP request if the request
     * path matches (or is a subdirectory of) the cookie's path attribute.
     */
    path?: string;

    /**
     * If enabled, the cookie will only be included in an HTTP request
     * if it is transmitted over a secure channel (typically HTTP over TLS).
     */
    secure?: boolean;
}
