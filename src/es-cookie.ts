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
        let expires = new Date();
        expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
        attributes.expires = expires;
    }

    return stringifyAttribute('Expires', attributes.expires ? attributes.expires.toUTCString() : '')
        + stringifyAttribute('Domain', attributes.domain)
        + stringifyAttribute('Path', attributes.path)
        + stringifyAttribute('Secure', attributes.secure)
        + stringifyAttribute('SameSite', attributes.sameSite);
}

function readValue(value: string): string {
    return value.replace(/%3B/g, ';');
}

function writeValue(value: string): string {
    return value.replace(/;/g, '%3B');
}

export function encode(name: string, value: string, attributes: CookieAttributes): string {
    return writeValue(name).replace(/=/g, '%3D')
        + '=' + writeValue(value)
        + stringifyAttributes(attributes);
}

export function parse(cookieString: string): {[name: string]: string} {
    let result: {[name: string]: string} = {};
    let cookies = cookieString ? cookieString.split('; ') : [];

    for (let cookie of cookies) {
        let parts = cookie.split('=');
        let value = parts.slice(1).join('=');
        let name = readValue(parts[0]).replace(/%3D/g, '=');
        result[name] = readValue(value);
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
