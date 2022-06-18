var express = require("express");
var router = express.Router();
const NAME_COLLECTION = require("../config/nameCollections");
const VALIDATE_MOIBILE = require("../helpers/ValidateMobile");
const USER_HELPERS = require("../helpers/users-helpers");
const { response } = require("express");
const PRODUCT_HELPERS = require("../helpers/product-helpers");
const session = require("express-session");
let moment = require("moment");
const Handlebars = require("handlebars");

/* GET users listing. */
const verifyUser = (req, res, next) => {
  if (req.session.uesrLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};


router.get("/", async (req, res, next) => {
  let categories = await PRODUCT_HELPERS.getProductCategories();
  let allProduct = await USER_HELPERS.getAllProduct();
  let cartCount = 0;
  
  if (req.session.uesrLoggedIn) {
    cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  }
  // res.render("users/user-home",
  res.render("users/text-home", {
    user: true,
    userSession: req.session.user,
    categories,
    allProduct,
    cartCount,
  });
});

// offer price handlebars

Handlebars.registerHelper("offerPercentage", function (price, offer, discound) {
  if (offer) {
    return new Handlebars.SafeString(
      `<span class="btn btn-secondary position-absolute offerSpan">${discound}% Off</span>`
    );
  }
});
router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("users/user-login", {
      userLogginError: req.session.userLogginError,
      userErrorClass: req.session.usererrorClass,
    });
    req.session.userLogginError = null;
    req.session.usererrorClass = null;
  }
});

router.post("/login", (req, res) => {
  USER_HELPERS.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.uesrLoggedIn = true;
      res.redirect("/");
    } else if (response.block) {
      req.session.userLogginError = "Your Account were blocked by admin";
      res.redirect("/login");
    } else {
      req.session.userLogginError = "Invalid username or password";
      req.session.usererrorClass = "adminError";
      res.redirect("/login");
    }
  });
});

router.get("/signup", (req, res) => {
  res.render("users/user-signup", {
    signupError: req.session.userSignupError,
    userErrorClass: req.session.userErrorClass,
  });
  req.session.userSignupError = null;
  req.session.userErrorClass = null;
});

router.post("/signup", (req, res) => {
  
  let status = {};
  USER_HELPERS.doSignup(req.body).then((response) => {
    if (!response.userExist) {
      res.redirect("/login");
    } else {
      req.session.userSignupError = "Email already exist";
      req.session.userErrorClass = "adminError";
      res.redirect("/signup");
    }
  });
});

// user signout
router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.uesrLoggedIn = false;
  res.redirect("/login");
});

// product detaisl page
router.get("/productDetails/:id", async (req, res) => {
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  let product = await PRODUCT_HELPERS.getOneProductDetails(req.params.id);
  
  res.render("users/productDetails", {
    user: true,
    product,
    cartCount,
    userSession: req.session.user,
  });
});

// cart
router.get("/cart", verifyUser, async (req, res) => {
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  let products = await USER_HELPERS.getCartProducts(req.session.user._id);
  let TotalAmount = await USER_HELPERS.getTotalAmount(req.session.user._id);
  let categories = await PRODUCT_HELPERS.getProductCategories();

  res.render("users/user-cart", {
    user: true,
    products,
    userSession: req.session.user,
    TotalAmount,
    categories,
    cartCount,
  });
});

var verifyUserfetch = (req, res, next) => {
  if (req.session.uesrLoggedIn) {
    next();
  } else {
    res.json({ status: false });
  }
};
// add to cart
router.get(`/add-to-cart/:id`, verifyUser, (req, res) => {
  USER_HELPERS.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post(`/change-product-quantity`, verifyUser, (req, res, next) => {
 
  USER_HELPERS.changeProductQty(req.body).then(async (response) => {
    if (response.removeProduct) {
      
      res.json(response);
    } else {
      response.total = await USER_HELPERS.getTotalAmount(req.body.user);
      response.subTotal = await USER_HELPERS.getSubTotalofSignleProduct(
        req.body
      );
      console.log("response");
      
      console.log("response");
      res.json(response);
    }
  });
});

// delete product from cart
router.get(
  `/delete-product-from-cart/:cartID/:proID`,
  verifyUser,
  (req, res, next) => {
    USER_HELPERS.deleteProductFromCart(req.params).then((response) => {
      res.json(response);
    });
  }
);

// shop
router.get("/shop", async (req, res) => {
  var categories = await PRODUCT_HELPERS.getProductCategories();
 
  let allProduct = await USER_HELPERS.getAllProduct();

  if (req.session.uesrLoggedIn) {
    var cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  }

  res.render("users/shop", {
    user: true,
    userSession: req.session.user,
    categories,
    allProduct,
   
    cartCount,
  });
});

// search
router.get(`/shop/:category`, async (req, res) => {
  let allProduct = await PRODUCT_HELPERS.getProductWithinCategory(
    req.params.category
  );
 
  res.render("/shop");
});

router.get("/profile", verifyUser, async (req, res) => {
  let userDetails = await USER_HELPERS.getUserDetails(req.session.user._id);
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  let categories = await PRODUCT_HELPERS.getProductCategories();
  let allAddress = await USER_HELPERS.getAllAddress(req.session.user._id);
  let coupon = await USER_HELPERS.getAvailableCoupon(req.session.user._id);
  res.render("users/profile2", {
    user: true,
    userDetails,
    userSession: req.session.user,
    cartCount,
    categories,
    allAddress,
    coupon,
  });
});
Handlebars.registerHelper("CouponProduct", function (products) {
  if (products) {
   
    return products[0].ProductName;
  }
});


router.post(`/update-profile`, verifyUser, (req, res) => {
 
  USER_HELPERS.updateUserProfile(req.body).then((response) => {
    if (req.files && req.files["profile-image"]) {
      var image1 = req.files["profile-image"];
      image1.mv(`./public/images/users/${req.body.userID}.png`, (err) => {
        if (err) {
          console.log(err);
        } else {
          if (response.updateProfile) {
            res.redirect("/profile");
          }
        }
      });
    }
  });
});

// eidt address
router.get(`/edit-address/:id/:user`, verifyUser, async (req, res) => {
  USER_HELPERS.getOneAddress(req.params.id, req.params.user).then((address) =>
    res.json(address)
  );
});

router.post(`/edit-address`, (req, res) => {
  USER_HELPERS.updateAddress(req.body).then((response) => {
    res.redirect("/profile");
  });
});

router.delete(`/delete-address/:id/:username`, (req, res) => {
  USER_HELPERS.deleteUserAddress(req.params).then((response) =>
    res.json(response)
  );
});

// update profile pic
router.get(`/edit-profile-pic`, verifyUser, async (req, res) => {
  res.render("users/demo-profile");
});

router.get("/checkout", verifyUser, async (req, res) => {
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  let products = await USER_HELPERS.getCartProducts(req.session.user._id);
  let TotalAmount = await USER_HELPERS.getTotalAmount(req.session.user._id);
  var categories = await PRODUCT_HELPERS.getProductCategories();
  var getAddress = await USER_HELPERS.getAllAddress(req.session.user._id);
 
  res.render("users/checkout", {
    user: true,
    products,
    TotalAmount,
    userSession: req.session.user,
    cartCount,
    categories,
    getAddress,
  });
});

// add Address
router.post(`/place-order`, verifyUser, async (req, res) => {
 
  let products = await USER_HELPERS.getCartProductList(req.body.userID);
  let TotalAmount = await req.body.totalAmount;
  USER_HELPERS.placeOrder(req.body, products, TotalAmount).then((orderID) => {
    if (req.body.payment === "cod") {
     
      res.json({ codSuccess: true });
    } else if (req.body.payment == "razorpay") {
      
      USER_HELPERS.generateRazorpay(orderID, TotalAmount)
        .then((order) => {
          res.json({ order, razorpay: true });
        })
        .catch(() => {
          console.log("generate instance faild");
        });
    } else if (req.body.payment == "paypal") {
      console.log(`order id in paypal ${orderID}`);
      res.json({ TotalAmount, paypal: true, orderID });
    }
  });
});
// handle bar date split
Handlebars.registerHelper("formatDate", function (datetime, format) {
  if (moment) {
    format = moment[format] || format;
    return moment(datetime).format(format);
  } else {
    return datetime;
  }
});
// thanks for shopping
router.get("/thanks-for-shpping", async (req, res) => {
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  var categories = await PRODUCT_HELPERS.getProductCategories();
  res.render("users/thanks-shopping", {
    user: true,
    categories,
    userSession: req.session.user,
    cartCount,
  });
});

// orders
router.get("/my-orders", verifyUser, async (req, res) => {
  let orders = await USER_HELPERS.getOrderCollection(req.session.user._id);
  var categories = await PRODUCT_HELPERS.getProductCategories();
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
  // console.log(orders);
  res.render("users/orders-history card", {
    user: true,
    orders,
    userSession: req.session.user,
    categories,
    cartCount,
  });
});

Handlebars.registerHelper("orderConfirmation", function (order, payment) {
  if (payment == "Pending") {
    var result = `<div> 
    <p> Payment Failed </p>
    <button class='btn btn-danger' 
    onclick="rePayment('${this._id}')">
    Repayment</button>
    </div>`;
    return new Handlebars.SafeString(result);
  } else {
    return order;
  }
});

// discound
Handlebars.registerHelper("Discound", function (discound) {
  if (discound) {
    return discound;
  } else {
    return 0;
  }
});

Handlebars.registerHelper("padiAmount", function (total, discound) {
  if (discound) {
    let amount = total - discound;

    return parseFloat(amount).toFixed(2);
  } else {
    return total;
  }
});

router.get("/order-details/:id", verifyUser, async (req, res) => {
 
  let orders = await USER_HELPERS.getUserOrders(req.params.id);
  var categories = await PRODUCT_HELPERS.getProductCategories();
  let user = await USER_HELPERS.getUserDetails(req.session.user._id);
  let cartCount = await USER_HELPERS.cartCount(req.session.user._id);
 
 
  let OrderDetails = orders[0];
  res.render("users/orders", {
    user: true,
    orders,
    user,
    OrderDetails,
    categories,
    userSession: req.session.user,
    cartCount,
  });
});

// verify Payment
router.post("/verify-payment", verifyUser, (req, res) => {
 
  USER_HELPERS.verifyPayment(req.body)
    .then((response) => {
      USER_HELPERS.changePaymentStatus(req.body["order[receipt]"]).then(() => {
       
        res.json({ paymentStatus: true });
      });
    })
    .catch((err) => {
      console.log(err);
     
      res.json({ paymentStatus: false });
    });
});

router.get(`/orderStatusUpdate/:orderID`, (req, res) => {
 
  USER_HELPERS.updatePyamentStatus(req.params.orderID).then((data) => {
   
    res.json(data);
  });
});

// rapyment get order detials
router.get("/get-order-details/:orderID", (req, res) => {
 
  USER_HELPERS.getOrderDetails(req.params.orderID).then((data) => {
    USER_HELPERS.generateRazorpay(data._id, data.totalAmount)
      .then((order) => {
        res.json({ order, razorpay: true });
      })
      .catch(() => {
        console.log("generate instance faild");
      });
  });
});

// repayment paypal
router.get(`/repayment-payapal/:orderID`, (req, res) => {
  USER_HELPERS.getOrderDetails(req.params.orderID).then((data) =>
    res.json(data)
  );
});

// apply coupen
router.get(`/apply-coupen/:coupen/:userID`, verifyUser, async (req, res) => {
  USER_HELPERS.fidCoupen(req.params.coupen, req.params.userID).then(
    (response) => {
      res.json(response);
    }
  );
});

// forget password
router.get(`/forget-password`, (req, res) => {
  res.render("users/forgot-password");
});


module.exports = router;
