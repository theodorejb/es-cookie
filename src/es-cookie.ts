import {CookieAttributes} from './CookieAttributes';

export {CookieAttributes};

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
        const milliseconds = Math.min(Date.now() + attributes.expires * 864e+5, 864e+13);
        attributes.expires = new Date(milliseconds);
    }

    return stringifyAttribute('Expires', attributes.expires ? attributes.expires.toUTCString() : '')
        + stringifyAttribute('Domain', attributes.domain)
        + stringifyAttribute('Path', attributes.path)
        + stringifyAttribute('Secure', attributes.secure)
        + stringifyAttribute('SameSite', attributes.sameSite);
}

export function encode(name: string, value: string, attributes: CookieAttributes): string {
    return encodeURIComponent(name)
            .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent) // allowed special characters
            .replace(/\(/g, '%28').replace(/\)/g, '%29') // replace opening and closing parens
        + '=' + encodeURIComponent(value)
            // allowed special characters
            .replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
        + stringifyAttributes(attributes);
}

export function parse(cookieString: string): {[name: string]: string} {
    let result: {[name: string]: string} = {};
    const cookies = cookieString ? cookieString.split('; ') : [];

    for (let cookie of cookies) {
        const parts = cookie.split('=');
        let value = parts.slice(1).join('=');

        if (value[0] === '"') {
            value = value.slice(1, -1);
        }

        try {
            const name = decodeURIComponent(parts[0]);
            result[name] = value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
        } catch (e) {
            // ignore cookies with invalid name/value encoding
        }
    }

    return result;
}

export function getAll(): {[name: string]: string} {
    return parse(document.cookie);
}

export function get(name: string): string | undefined {
    return getAll()[name];
}

export function set(name: string, value: string, attributes?: CookieAttributes): void {
    document.cookie = encode(name, value, {path: '/', ...attributes});
}

export function remove(name: string, attributes?: CookieAttributes): void {
    set(name, '', {...attributes, expires: -1});
}
