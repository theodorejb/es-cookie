# es-cookie

A simple, lightweight module for handling cookies

* Includes TypeScript definitions
* Works with Webpack, Rollup, and Browserify module bundlers
* Fully compliant with [RFC 6265](https://tools.ietf.org/html/rfc6265)
* No dependencies other than an `Object.assign` polyfill if using Internet Explorer ([core-js](https://github.com/zloirock/core-js) is recommended)
* Originally based on js-cookie, but rewritten as a TypeScript module with a lean, type-safe API

## Installation

`npm install es-cookie --save`

## Usage

Import module:

```javascript
import * as Cookies from 'es-cookie';
```

Create a cookie, valid across the entire site:

```javascript
Cookies.set('name', 'value');
```

Create a cookie that expires 7 days from now, valid across the entire site:

```javascript
Cookies.set('name', 'value', { expires: 7 });
```

Create an expiring cookie, valid to the path of the current page:

```javascript
Cookies.set('name', 'value', { expires: 7, path: '' });
```

Read cookie:

```javascript
Cookies.get('name'); // => 'value'
Cookies.get('nothing'); // => undefined
```

Read all visible cookies:

```javascript
Cookies.getAll(); // => { name: 'value' }
```

Delete cookie:

```javascript
Cookies.remove('name');
```

Delete a cookie valid to the path of the current page:

```javascript
Cookies.set('name', 'value', { path: '' });
Cookies.remove('name'); // fail!
Cookies.remove('name', { path: '' }); // removed!
```

*IMPORTANT! when deleting a cookie, you must pass the exact same path and domain attributes that was used to set the cookie, unless you're relying on the [default attributes](#cookie-attributes).*

*Note: Removing a non-existant cookie does not raise an exception or return a value.*

## Encoding

This project is [RFC 6265](http://tools.ietf.org/html/rfc6265#section-4.1.1) compliant. All special characters that are not allowed in the cookie-name or cookie-value are encoded with each one's UTF-8 Hex equivalent using [percent-encoding](http://en.wikipedia.org/wiki/Percent-encoding).

The only character in cookie names or values that is allowed and still encoded is the percent `%` character. It is escaped in order to interpret percent input as literal. Please note that the default encoding/decoding strategy is meant to be interoperable between cookies that are read/written by es-cookie.

## Attributes

### expires

Define when the cookie will be removed. Value can be a [`Number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) which will be interpreted as days from time of creation or a [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) instance. If omitted, the cookie becomes a session cookie.

To create a cookie that expires in less than a day, use a Date object.

**Default:** Cookie is removed when the user closes the browser.

**Examples:**

```javascript
Cookies.set('name', 'value', { expires: 365 });
Cookies.get('name'); // => 'value'
Cookies.remove('name');
```

### path

A [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) indicating the path where the cookie is visible.

**Default:** `/`

**Examples:**

```javascript
Cookies.set('name', 'value', { path: '' });
Cookies.get('name'); // => 'value'
Cookies.remove('name', { path: '' });
```

### domain

A [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) indicating a valid domain where the cookie should be visible. The cookie will also be visible to all subdomains.

**Default:** Cookie is visible only to the domain or subdomain of the page where the cookie was created.

**Examples:**

Assuming a cookie that is being created on `site.com`:

```javascript
Cookies.set('name', 'value', { domain: 'subdomain.site.com' });
Cookies.get('name'); // => undefined (need to read at 'subdomain.site.com')
```

### secure

Either `true` or `false`, indicating if the cookie transmission requires a secure protocol (https).

**Default:** No secure protocol requirement.

**Examples:**

```javascript
Cookies.set('name', 'value', { secure: true });
Cookies.get('name'); // => 'value'
Cookies.remove('name', { secure: true });
```

## Author

Theodore Brown  
<http://theodorejb.me>

## License

MIT
