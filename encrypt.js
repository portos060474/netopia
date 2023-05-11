'use strict';
const crypto = require( 'crypto' );
const rc4 = require( 'arc4' );

const constants = require( "constants" );
module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
};

function encrypt( publicKey, data ) {
    let key = Buffer.from(crypto.randomBytes(32), 'binary');
    // var cipher = rc4( 'arc4', key);
    var cipher = crypto.createCipheriv('rc4', key,null );
    let encrypted = cipher.update( data, 'binary', 'base64' );
    cipher.final();
    // var ciphertext = cipher.update( plaintext, 'utf8', 'hex');

    let envKey = crypto.publicEncrypt( {
        key: publicKey,
        padding: constants.RSA_PKCS1_PADDING
    }, key );
    return {
        envKey: envKey.toString( 'base64' ),
        envData: encrypted
    };

}

function decrypt( privateKey, envKey, data ) {
    let buffer =  Buffer.from( envKey,'base64' );
    var decrypted = crypto.privateDecrypt( {
        key: privateKey,
        padding: constants.RSA_PKCS1_PADDING
    }, buffer );
    var cipher = rc4( 'arc4', decrypted);
    let dec = cipher.decode( Buffer.from(data,'base64'), 'utf8' );
    return dec;
}
