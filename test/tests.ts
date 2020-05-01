import * as Cookies from '../src/es-cookie';
import * as assert from 'assert';

let cleanup = function () {
    // Remove the cookies created using es-cookie default attributes
    Object.keys(Cookies.getAll()).forEach(c => Cookies.remove(c));

    // Remove the cookies created using browser default attributes
    Object.keys(Cookies.getAll()).forEach(function (cookie) {
        Cookies.remove(cookie, { path: '' });
    });
};

describe('parse', function () {
    it('should be able to parse a cookie string', function () {
        let actual = Cookies.parse('c=v; name=value');
        assert.deepEqual(actual, {c: 'v', name: 'value'});
    });
});

describe('read', function () {
    afterEach(cleanup);

    it('should work with simple values', function () {
        Cookies.set('c', 'v');
        assert.strictEqual(Cookies.get('c'), 'v');
    });

    it('should support empty values', function () {
        Cookies.set('c', '');
        assert.strictEqual(Cookies.get('c'), '');
    });

    // doesn't work in Internet Explorer and old versions of Edge
    it('should work with multi-byte characters', function () {
        Cookies.set('c', 'Ж');
        assert.strictEqual(Cookies.get('c'), 'Ж');
    });

    it('should return undefined for nonexistent cookies', function () {
        assert.strictEqual(Cookies.get('whatever'), undefined);
    });

    it('should support equals sign in cookie name', function () {
        Cookies.set('c=', 'foo');
        assert.strictEqual(Cookies.get('c='), 'foo');
    });

    it('should support equals sign in cookie value', function () {
        Cookies.set('c', 'foo=bar');
        assert.strictEqual(Cookies.get('c'), 'foo=bar');
    });

    it('should support percent character in cookie value', function () {
        Cookies.set('foo', 'baz%');
        Cookies.set('bar', '%A1');
        assert.strictEqual(Cookies.get('foo'), 'baz%');
        assert.strictEqual(Cookies.get('bar'), '%A1');
    });

    it('should support percent character in cookie name', function () {
        Cookies.set('%ok', 'foo');
        assert.strictEqual(Cookies.get('%ok'), 'foo');
    });

    it('should read all when cookies exist', function () {
        Cookies.set('c', 'v');
        Cookies.set('foo', 'bar');
        assert.deepEqual(Cookies.getAll(), { c: 'v', foo: 'bar' });
    });

    it('should return an empty object when there are no cookies', function () {
        assert.deepEqual(Cookies.getAll(), {});
    });
});

describe('encode', function () {
    it('should work with expires as days from now', function () {
        let twentyOneDaysFromNow = new Date();
        twentyOneDaysFromNow.setDate(twentyOneDaysFromNow.getDate() + 21);
        let actual = Cookies.encode('c', 'v', { expires: 21 });
        assert.strictEqual(actual, 'c=v; Expires=' + twentyOneDaysFromNow.toUTCString());
    });

    it('should work with expires as fraction of a day', function () {
        let getAttributeValue = function (createdCookie: string, attributeName: string) {
            let pairs = createdCookie.split('; ');

            for (let i = 0; i < pairs.length; i++) {
                let split = pairs[i].split('=');

                if (split[0] === attributeName) {
                    return split[1];
                }
            }

            return '';
        };

        let expires = new Date(getAttributeValue(Cookies.encode('c', 'v', { expires: 0.5 }), 'Expires'));
        let now = new Date();
        let message = '"' + expires.getTime() + '" should be greater than "' + now.getTime() + '"';
        assert.strictEqual(expires.getTime() > now.getTime() + 1000, true, message);
    });

    it('should support expires option as Date instance', function () {
        let twoHoursFromNow = new Date();
        twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
        let actual = Cookies.encode('c', 'v', { expires: twoHoursFromNow });
        assert.strictEqual(actual, 'c=v; Expires=' + twoHoursFromNow.toUTCString());
    });

    it('should support domain option', function () {
        Cookies.set('c', 'v', { domain: 'example.com' });
        assert.strictEqual(Cookies.get('c'), undefined);

        let actual = Cookies.encode('c', 'v', { domain: 'localhost' });
        assert.strictEqual(actual, 'c=v; Domain=localhost');
    });

    it('should support true secure option', function () {
        let actual = Cookies.encode('c', 'v', {secure: true});
        assert.strictEqual(actual, 'c=v; Secure');
    });

    it('should support false secure option', function () {
        let actual = Cookies.encode('c', 'v', {path: '/', secure: false});
        assert.strictEqual(actual, 'c=v; Path=/');
    });

    it('should support sameSite option', function() {
        let strict = Cookies.encode('c', 'v', { sameSite: 'strict' });
        assert.strictEqual(strict, 'c=v; SameSite=strict');

        let lax = Cookies.encode('c', 'v', { sameSite: 'lax' });
        assert.strictEqual(lax, 'c=v; SameSite=lax');

        let none = Cookies.encode('c', 'v', { sameSite: 'none', secure: true });
        assert.strictEqual(none, 'c=v; Secure; SameSite=none');
    });

    it('should not set undefined attribute values', function () {
        assert.strictEqual(Cookies.encode('c', 'v', {
            expires: undefined
        }), 'c=v', 'should not write undefined expires attribute');

        assert.strictEqual(Cookies.encode('c', 'v', {
            path: undefined
        }), 'c=v', 'should not write undefined path attribute');

        assert.strictEqual(Cookies.encode('c', 'v', {
            domain: undefined
        }), 'c=v', 'should not write undefined domain attribute');

        assert.strictEqual(Cookies.encode('c', 'v', {
            secure: undefined
        }), 'c=v', 'should not write undefined secure attribute');

        assert.strictEqual(Cookies.encode('c', 'v', {
            sameSite: undefined
        }), 'c=v', 'should not write undefined SameSite attribute');
    });
});

describe('write', function () {
    afterEach(cleanup);

    it('should write string primitive', function () {
        Cookies.set('c', 'v');
        assert.strictEqual(Cookies.get('c'), 'v');
    });

    it('should write value "[object Object]"', function () {
        Cookies.set('c', '[object Object]');
        assert.strictEqual(Cookies.get('c'), '[object Object]');
    });
});

describe('remove', function () {
    afterEach(cleanup);

    it('should delete a cookie', function () {
        Cookies.set('c', 'v');
        Cookies.remove('c');
        assert.strictEqual(document.cookie, '');
    });

    it('should delete a cookie with matching attributes', function () {
        let withoutPath = {path: ''};
        let withPath = {path: '/'};

        Cookies.set('c', 'v', withoutPath);
        Cookies.remove('c', withPath);
        assert.strictEqual(document.cookie, 'c=v'); // not removed
        Cookies.remove('c', withoutPath);
        assert.strictEqual(document.cookie, ''); // removed

        Cookies.set('c', 'v', withPath);
        Cookies.remove('c', withoutPath);
        assert.strictEqual(document.cookie, 'c=v'); // not removed
        Cookies.remove('c', withPath);
        assert.strictEqual(document.cookie, ''); // removed
    });

    it('should not alter attributes object', function () {
        let attributes = {path: '/'};
        Cookies.set('c', 'v', attributes);
        Cookies.remove('c', attributes);
        assert.deepEqual(attributes, {path: '/'});
    });

    it('should remove a secure cookie without extra attributes', function () {
        Cookies.set('c', 'v', {secure: true});
        Cookies.remove('c');
        assert.strictEqual(document.cookie, '');
    });
});

describe('value encoding', function () {
    afterEach(cleanup);

    let specialValues = [
        {val: '"', plain: '"', name: 'double quote'},
        {val: '"v', plain: '"v', name: 'value starting with a double quote'},
        {val: 'v"', plain: 'v"', name: 'value ending with a double quote'},
        {val: ',', plain: ',', name: 'comma'},
        {val: ';', plain: '%3B', name: 'semicolon'},
        {val: ';;', plain: '%3B%3B', name: 'multiple semicolons'},
        {val: '\\', plain: '\\', name: 'backslash'},
        {val: '#', plain: '#', name: 'sharp'},
        {val: '$', plain: '$', name: 'dollar sign'},
        {val: '%', plain: '%', name: 'percent character'},
        {val: '&', plain: '&', name: 'ampersand'},
        {val: '+', plain: '+', name: 'plus sign'},
        {val: ':', plain: ':', name: 'colon character'},
        {val: '<', plain: '<', name: 'less-than character'},
        {val: '>', plain: '>', name: 'greater-than character'},
        {val: '=', plain: '=', name: 'equals sign'},
        {val: '/', plain: '/', name: 'slash'},
        {val: '?', plain: '?', name: 'question mark'},
        {val: '@', plain: '@', name: 'at character'},
        {val: '[', plain: '[', name: 'opening square bracket'},
        {val: ']', plain: ']', name: 'closing square bracket'},
        {val: '^', plain: '^', name: 'caret'},
        {val: '`', plain: '`', name: 'grave accent'},
        {val: '{', plain: '{', name: 'opening curly bracket'},
        {val: '}', plain: '}', name: 'closing curly bracket'},
        {val: '|', plain: '|', name: 'pipe character'},
        {val: '{{', plain: '{{', name: 'multiple curly brackets'},
        {val: 'ã', plain: 'ã', name: 'two-byte character'},
        {val: '₯', plain: '₯', name: 'three-byte character'},
        {val: '𩸽', plain: '𩸽', name: 'four-byte character'},
    ];

    specialValues.forEach(namedVal => {
        it('should support ' + namedVal.name, function () {
            Cookies.set('c', namedVal.val);
            assert.strictEqual(Cookies.get('c'), namedVal.val);
            assert.strictEqual(document.cookie, 'c=' + namedVal.plain);
        });
    });
});

describe('name encoding', function () {
    afterEach(cleanup);

    let specialKeys = [
        {key: '(', plain: '(', name: 'opening parens character'},
        {key: ')', plain: ')', name: 'closing parens character'},
        {key: '(())', plain: '(())', name: 'replacing parens globally'},
        {key: '<', plain: '<', name: 'less-than character'},
        {key: '>', plain: '>', name: 'greater-than character'},
        {key: '@', plain: '@', name: 'at character'},
        {key: ',', plain: ',', name: 'comma'},
        {key: ';', plain: '%3B', name: 'semicolon'},
        {key: ':', plain: ':', name: 'colon character'},
        {key: '\\', plain: '\\', name: 'backslash character'},
        {key: '"', plain: '"', name: 'double quote character'},
        {key: '/', plain: '/', name: 'slash character'},
        {key: '[', plain: '[', name: 'opening square bracket'},
        {key: ']', plain: ']', name: 'closing square bracket'},
        {key: '?', plain: '?', name: 'question mark'},
        {key: '=', plain: '%3D', name: 'equals sign'},
        {key: '{', plain: '{', name: 'opening curly brackets'},
        {key: '}', plain: '}', name: 'closing curly brackets'},
        {key: '.', plain: '.', name: 'period'},
        {key: '#', plain: '#', name: 'sharp character'},
        {key: '$', plain: '$', name: 'dollar sign'},
        {key: '%', plain: '%', name: 'percent character'},
        {key: '&', plain: '&', name: 'ampersand character'},
        {key: '+', plain: '+', name: 'plus sign'},
        {key: '^', plain: '^', name: 'caret character'},
        {key: '`', plain: '`', name: 'grave accent character'},
        {key: '|', plain: '|', name: 'pipe character'},
        {key: '||', plain: '||', name: 'multiple pipes'},
        {key: 'ã', plain: 'ã', name: 'two-byte characters'},
        {key: '₯', plain: '₯', name: 'three-byte characters'},
        {key: '𩸽', plain: '𩸽', name: 'four-byte characters'},
    ];

    specialKeys.forEach(namedVal => {
        it('should support ' + namedVal.name, function () {
            Cookies.set(namedVal.key, 'v');
            assert.strictEqual(Cookies.get(namedVal.key), 'v');
            assert.strictEqual(document.cookie, namedVal.plain + '=v');
        });
    });
});
