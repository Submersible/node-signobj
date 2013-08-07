# signobj&ndash;Trust your JSON [![Build Status](https://secure.travis-ci.org/Submersible/node-signobj.png?branch=master)](http://travis-ci.org/Submersible/node-signobj)

signobj protects your data with SHA-1 HMAC & a 16 bit salt.  This library was
inspired by Django's [signing module](https://docs.djangoproject.com/en/dev/topics/signing/)
for creating signed cookies.

### signobj(data, secret, [hidden], [cb]) → Promise(signed_data)

Signs `data` with a `secret`, you can also pass in some extra `hidden` data that
is used when hashing.  This can be useful if you're creating an access token,
and you want it to become invalid when they change their password, and also don't
want the password with the public data.

This function returns a Q promise, that resolves the signed & salted data.

__Parameters__

* `{Object} data` — Data to be signed, any basic value is fine.
* `{String} secret` — Secret used for signing
* `{String} [hidden]` — Optional extra data to use for signing.  This could be used for data 

__Return Callback/Promise__

* `{Object} signed_data` — Signed data

__Example__

```javascript
signobj({
    username: 'ryan',
    expires: new Date().getTime() + 86400000 // Expires in a day
}, config.SECRET, {
    /**
     * Causes token to expire when password changed.  Password hash was created
     * with bcrypt, of course :)
     */
    password_hash: 'a32e3b3b6857d671fefefc7cfb8349d22a7fc695'
}).then(function (access_token) {
    assert.deepEqual(access_token, [
        { username: 'ryan', expires: 1375989063805 }, // original data
        'sCItyXB+VrTNiOuI9+tL7w==', // salt
        'kZCPbH4m7hzQrWeCsibNaDbW1ks=' // signed message
    ]);
});
```

### signobj.valid(signed_data, secret, [hidden], [cb]) → Promise(data)

Checks to make sure your data is valid.  The promise, if resolves successfully,
will return your original data.

__Parameters__

* `{Object} signed_data` — Data that was signed using the signing function
* `{String} secret` — Secret used for signing
* `{String} [hidden]` — Optional extra data that was originally used in the signing.

__Return Callback/Promise__

* `{Object} data` — Unwrapped data, that was placed in the sign function.

__Example__

```javascript
signobj.valid([ // this is the output from the previous sign function
    { username: 'ryan', expires: 1375989063805 }, // original data
    'sCItyXB+VrTNiOuI9+tL7w==', // salt
    'kZCPbH4m7hzQrWeCsibNaDbW1ks=' // signed message
], config.SECRET, {
    /**
    * If the user has changed their password since signing, their token will
    * no longer be valid!
    */
    password_hash: 'a32e3b3b6857d671fefefc7cfb8349d22a7fc695'
}).then(function (data) {
    if (data.expires < new Date().getTime()) {
        throw new Error('Access token has expired');
    }
    console.log(data.username + ' has been authenticated');
});
```


## License

MIT
