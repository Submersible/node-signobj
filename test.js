/*jslint node: true */

'use strict';

var Q = require('q'),
    test = require('tap').test,
    signobj = require('./');

test('salt', function (t) {
    t.plan(1);
    signobj.salt(16).then(function (salt) {
        t.type(salt, 'string', 'definitely got something!');
    }).done();
});

test('everything else', function (t) {
    t.plan(6);
    var DATA = {hello: 'world'},
        SECRET = 'KEYBOARD CAT',
        HIDDEN = 'my pass';
    signobj(DATA, SECRET, HIDDEN).then(function (signed) {
        t.deepEqual(signed[0], DATA);
        t.type(signed[1], 'string', 'salty');
        t.type(signed[2], 'string', 'hashy');
        return Q.all([signed, signed[0]]);
    }).spread(function (signed, data) {
        signobj.valid([signed[0], signed[1], signed[2] + '!'], SECRET, HIDDEN).fail(function (err) {
            t.equal(err.message, 'Hashes do not match');
        }).done();
        signobj.valid([signed[0], 'sea salt', signed[2]], SECRET, HIDDEN).fail(function (err) {
            t.equal(err.message, 'Hashes do not match', 'I guess it\'s not the same');
        }).done();
        return signobj.valid(signed, SECRET, HIDDEN);
    }).then(function (data) {
        t.deepEqual(data, DATA);
    })
        .then(function () {
            t.end();
        }).done();
});