// vendor open seller account form validation

// $("#validation_style").submit((event) => {
// event.preventDefault();
$.validate({ form: "#validation_style", modules: "security" });
$("#Rlength1").restrictLength($("#max-length-element"));

// var data = $("#validation_style").serialize();
// $.ajax({
//   url: "/vendor/open-seller-account",
//   type: "POST",
//   data: $("#validation_style").serialize(),
//   success: (data) => {
//     if (data.vedndorExist) {
//       alert("Entered Email already in Exisit");
//     } else {
//       location.href('/vendor/login')
//     }
//   },
// });

// fetch("/vendor/open-seller-account", {
//   method: "POST",
//   body: JSON.stringify(data),
// })
//   .then((response) => response.json())
//   .then((data) => {
//     if (data.vedndorExist) {
//       alert("Entered Email already in Exisit");
//     } else {
//       alert("success");
//     }
//   });
// });

// user signup
$.validate({ form: "#validation_style_user", modules: "security" });
$("#Rlength1").restrictLength($("#max-length-element"));

// $("#validation_style_user").submit((event) => {
//   var data = $("#validation_style_user").serialize();
//   fetch("/signup", {
//     method: "POST",
//     body: JSON.stringify(data),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.userExist) {
//         alert("Entered Email already in Exisit");
//       } else {
//         alert("success");
//       }
//     });
// });

// user login
$.validate({ form: "#validation_style_user_login", modules: "security" });
$("#Rlength1").restrictLength($("#max-length-element"));

// verify Mobile Number
function sendOTP() {
  let mobile = $("#mobile").val();
  let url = `/otp/sendOtp/${mobile}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.otpSend) {
        alert("OTP Send to your mobile");
      } else {
        alert("Please check your mobile number");
      }
    });
}

// verify OTP
function verifyOTP() {
  let OTP = $("#otp").val();
  let MOBILE = $("#mobile").val();
  let url = `/otp/veriyOtp/${MOBILE}/${OTP}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.otpVerified) {
        document.getElementById("regButton").classList.add("regButtonNew");
        alert("OTP Verified");
      } else {
        alert("Please check your mobile number");
      }
    });
}
