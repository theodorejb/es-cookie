import {CookieAttributes} from './CookieAttributes';

function stringifyAttribute(name: string, value: string | boolean | undefined): string {
    if (!value) {
        return '';
    }

    let stringified = '; ' + name;

    if (value === true) {
        return stringified; // boolean attributes shouldn't have a value
    }

    return stringified + '=' + value;
}

function stringifyAttributes(attributes: CookieAttributes): string {
    if (typeof attributes.expires === 'number') {
        let expires = new Date();
        expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
        attributes.expires = expires;
    }

    return stringifyAttribute('Expires', attributes.expires ? attributes.expires.toUTCString() : '')
        + stringifyAttribute('Domain', attributes.domain)
        + stringifyAttribute('Path', attributes.path)
        + stringifyAttribute('Secure', attributes.secure);
}

export function createCookieString(key: string, value: string, attributes?: CookieAttributes): string {
    return encodeURIComponent(key)
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent) // allowed special characters
            .replace(/\(/g, '%28').replace(/\)/g, '%29') // replace opening and closing parens
        + '=' + encodeURIComponent(value)
            .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent) // allowed special characters
        + stringifyAttributes(Object.assign({path: '/'}, attributes));
}

export function getAll(): {[key: string]: string} {
    let result: {[key: string]: string} = {};
    let cookies = document.cookie ? document.cookie.split('; ') : [];
    let rdecode = /(%[0-9A-Z]{2})+/g;

    for (let i = 0; i < cookies.length; i++) {
        let parts = cookies[i].split('=');
        let cookie = parts.slice(1).join('=');

        if (cookie.charAt(0) === '"') {
            cookie = cookie.slice(1, -1);
        }

        try {
            let name = parts[0].replace(rdecode, decodeURIComponent);
            result[name] = cookie.replace(rdecode, decodeURIComponent);
        } catch (e) {
            // ignore cookies with invalid name/value encoding
        }
    }

    return result;
}

export function get(key: string): string | undefined {
    return getAll()[key];
}

export function set(key: string, value: string, attributes?: CookieAttributes): void {
    document.cookie = createCookieString(key, value, attributes);
}

export function remove(key: string, attributes?: CookieAttributes): void {
    set(key, '', Object.assign({}, attributes, {expires: -1}));
}
