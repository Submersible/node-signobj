/*jslint node: true */

'use strict';

var Q = require('q'),
    crypto = require('crypto');

function handleCb(cb, p) {
    if (cb) {
        p.then(function (data) {
            cb(false, data);
        }, cb);
    }
    return p;
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
        ? getSalt(16)
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
        if (hash === verify_hash) {
            return data;
        }
        d = Q.defer();
        d.reject(new Error('Hashes do not match'));
        return d.promise;
    }));
}

sign.valid = valid;
sign.salt = getSalt;

module.exports = sign;