var express = require("express");
var router = express.Router();
const VALIDATE_MOIBILE = require("../helpers/ValidateMobile");

router.get("/sendOtp/:mobile", (req, res) => {
  
  if (req.params.mobile) {
    VALIDATE_MOIBILE.sendOtp(req.params.mobile).then((data) => {
      res.json(data);
    });
  }
});


router.get("/veriyOtp/:mobile/:otp", async (req, res, next) => {
  var mobile = req.params.mobile;
  var otp = req.params.otp;
  await VALIDATE_MOIBILE.veriyOtp(mobile, otp).then((data) => {
    res.json(data);
  });
});

module.exports = router;
