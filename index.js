/*jslint node: true, bitwise: true */

'use strict';

var Q = require('q'),
    crypto = require('crypto');

/**
 * Allow function to be used as a promise or callback.
 *
 * @param {Function} [cb] Optional callback if developer decided to use.
 * @param {Promise} p Promise to convert to callback style
 * @return {Promise} Return promise for chaining
 */
function handleCb(cb, p) {
    if (cb) {
        p.then(function (data) {
            cb(false, data);
        }, cb);
    }
    return p;
}

/**
 * Compare function used to prevent timing attacks as suggested by issue #1.
 * The security of this function has yet to be, there has been an attempt to
 * reproduce a timing attack in issue #1, but with no success.
 *
 * @param {String} a
 * @param {String} b
 * @return {Boolean} Whether the two strings are equal
 */
function compare(a, b) {
    var i, cmp = Number(a.length === b.length);
    for (i = 0; i < a.length; i += 1) {
        /**
         * Use bitwise operator, otherwise short-circuiting will give away
         * timing.
         */
        cmp &= Number(a[i] === b[i]);
    }
    return Boolean(cmp);
}

function getSalt(size, cb) {
    return handleCb(cb, Q.ninvoke(crypto, 'randomBytes', size).then(function (bytes) {
        return bytes.toString('base64');
    }));
}

function sign(data, secret, hidden, no_salt, cb) {
    if (typeof hidden === 'function') {
        cb = hidden;
        hidden = undefined;
    }
    if (typeof no_salt === 'function') {
        cb = no_salt;
        no_salt = undefined;
    }
    return handleCb(cb, (!no_salt
        ? getSalt(16) // 128 bits
        : Q.defer().resolve(null)
    ).then(function (salt) {
        var pub = no_salt ? [data] : [data, salt],
            hash = crypto
                .createHmac('sha1', secret)
                .update(JSON.stringify(pub.concat([hidden])))
                .digest('base64');
        return pub.concat([hash]);
    }));
}

function valid(signed, secret, hidden, cb) {
    return handleCb(cb, Q.fcall(function () {
        var d,
            no_hash = signed.length === 2,
            data = signed[0],
            salt = signed[1],
            hash = signed[2],
            pub = no_hash ? [data] : [data, salt],
            verify_hash = crypto
                .createHmac('sha1', secret)
                .update(JSON.stringify(pub.concat([hidden])))
                .digest('base64');
        if (compare(hash, verify_hash)) {
            return data;
        }
        d = Q.defer();
        d.reject(new Error('Hashes do not match'));
        return d.promise;
    }));
}

sign.valid = valid;
sign.salt = getSalt;
sign.compare = compare;

module.exports = sign;
