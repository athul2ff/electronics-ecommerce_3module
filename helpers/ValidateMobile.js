const { resolve, reject } = require("promise");

const NAME_COLLECTION = require("../config/nameCollections");
const client = require("twilio")(
  NAME_COLLECTION.accountsID,
  NAME_COLLECTION.authToken
);

module.exports = {
  sendOtp: (mobile) => {
    return new Promise(async (resolve, reject) => {
      client.verify
        .services(NAME_COLLECTION.serviceID)
        .verifications.create({
          to: `+91${mobile}`,
          channel: "sms",
        })
        .then((data) => {
         
          resolve({ otpSend: true });
        })
        .catch(() => {
          resolve();
        });
    });
  },

  veriyOtp: (mobile, otp) => {
    return new Promise((resolve, reject) => {
      client.verify
        .services(NAME_COLLECTION.serviceID)
        .verificationChecks.create({
          to: `+91${mobile}`,
          code: otp,
        })
        .then((data) => {
         
         
          if (data.status === "approved") {
            resolve({ otpVerified: true });
          } else {
            resolve();
          }
        });
    });
  },
};
