# signobj&ndash;Trust your JSON [![Build Status](https://secure.travis-ci.org/Submersible/node-signobj.png?branch=master)](http://travis-ci.org/Submersible/node-signobj)

signobj protects your data with SHA-1 HMAC & a 16 bit salt.

### signobj(data, secret, [hidden], [no\_salt], [cb]) -> Promise

Signs `data` with `secret`, you can also pass in some extra `hidden` data that
is used when hashing.  This can be useful if you're creating an access token,
and you want it to become invalid when they change their password, and also don't
want the password with the public data.

This function returns a Q promise, that resolves the signed & salted data.

### signobj.valid(signed_data, secret, [hidden], [cb]) -> Promise

Checks to make sure your data is valid.  The promise, if resolves successfully,
will return your original data.

## License

MIT
