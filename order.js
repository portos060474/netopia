"use strict";

module.exports = {
  getRequest: getRequest,
  decodeResponse: decodeResponse,
};

const crypto = require("crypto");

var request = require('request');

const rc4 = require("./encrypt.js");
const fs = require("fs");
const privateKey = fs
  .readFileSync("./sandbox.2OAP-N9WN-RC1I-AUVV-ADUK.private.key")
  .toString();
const publicKey = fs
  .readFileSync("./sandbox.2OAP-N9WN-RC1I-AUVV-ADUK.public.cer")
  .toString();
const xml2js = require("xml2js");
var builder = new xml2js.Builder({
  cdata: true,
});
var parser = new xml2js.Parser({
  explicitArray: false,
});

var paymentUrl = "http://sandboxsecure.mobilpay.ro";

function getPayment(orderId, amount, currency) {
  let date = new Date();
  return {
    order: {
      $: {
        id: orderId,
        timestamp: date.getTime(),
        type: "card",
      },
      signature: "2OAP-N9WN-RC1I-AUVV-ADUK",
      url: {
        return: "<your_return_URL>",
        confirm: "<your_confirm_URL>",
      },
      invoice: {
        $: {
          currency: currency,
          amount: amount,
        },
        details: "test plata",
        contact_info: {
          billing: {
            $: {
              type: "person",
            },
            first_name: "Alex",
            last_name: "TheBoss",
            address: "strada fara nume",
            email: "cristi@r3.ro",
            mobile_phone: "mobilePhone",
          },
          shipping: {
            $: {
              type: "person",
            },
            first_name: "Alexandru",
            last_name: "TheBoss",
            address: "strada fara nume",
            email: "cristi@r3.ro",
            mobile_phone: "mobilePhone",
          },
        },
      },
    },
  };
}

function getRequest(orderId) {
  let xml = builder.buildObject(getPayment(orderId, 1, "RON"));
  return rc4.encrypt(publicKey, xml);
}

function decodeResponse(data) {
  return new Promise(function (resolve, reject) {
    parser.parseString(
      rc4.decrypt(privateKey, data.env_key, data.data),
      function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

function createOrder() {
  const jsonObj = {
      $: {
        type: "card",
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      },
      signature: "2OAP-N9WN-RC1I-AUVV-ADUK",
      url: {
        confirm: "http://www.site_propriu.com/confirm",
        return: "http://www.site_propriu.com/return",
      },
    invoice: {
      $: {
        currency: "RON",
        amount: "10.80",
      },
      details: "details",
      contact_info: {
        billing: {
          $: {
            type: "person",
          },
          first_name: "Prenume",
          last_name: "Nume",
          country: "",
          city: "",
          zip_code: "",
          address: "",
          email: "",
          mobile_phone: "",
          bank: "",
          iban: "",
        },
        shipping: {
          $: {
            type: "person",
            sameasbilling: "1",
          },
          first_name: "Prenume",
          last_name: "Nume",
          country: "",
          city: "",
          zip_code: "",
          address: "",
          email: "",
          mobile_phone: "",
          bank: "",
          iban: "",
        },
      },
    },
    params: {
      name: "param1Name",
      value: "param1Value",
    },
  };

  var builder = new xml2js.Builder({explicitRoot : false , rootName :'order'});
  var xml = builder.buildObject(jsonObj);
  return xml;
}

var data = createOrder();
console.log(data);
var ecrypted_data = rc4.encrypt(publicKey, data);
console.log(ecrypted_data);

var decripted_data = rc4.decrypt(privateKey, ecrypted_data.envKey, ecrypted_data.envData);
console.log(decripted_data);

// request.post(
//     paymentUrl,
//     { json: { "env_key": ecrypted_data.envKey, "data": ecrypted_data.envData } },
//     function (error, response, body) {
//         console.log(body);
//     }
// );