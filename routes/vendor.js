
const { response, json } = require("express");
var express = require("express");
var router = express.Router();
const VENDOR_HELPERS = require("../helpers/vendor-helpers");
const NAME_COLLECTION = require("../config/nameCollections");
const PRODUCT_HELPERS = require("../helpers/product-helpers");
const fs = require("fs");
const { resolve, reject } = require("promise");
const VALIDATE_MOIBILE = require("../helpers/ValidateMobile");
const { Db } = require("mongodb");
const session = require("express-session");
const Handlebars = require("handlebars");
let moment = require("moment");
const { format } = require("path");
const { verify } = require("crypto");

const verifyVendor = (req, res, next) => {
  if (req.session.vendorLoggedIn) {
    next();
  } else {
    res.redirect("/vendor/login");
  }
};

var vendorError = null;

// var from //
var salesReport;
var from = new Date("2021-07-01");
var to = new Date();
/* GET home page. */
router.get("/", verifyVendor, async function (req, res, next) {
  // let totalOrders = await VENDOR_HELPERS.totalOrders(req.session.vendor._id);
  let NotConfirmed = await VENDOR_HELPERS.NotConfirmed(req.session.vendor._id);
  let Confirmed = await VENDOR_HELPERS.Confirmed(req.session.vendor._id);
  let packed = await VENDOR_HELPERS.Packed(req.session.vendor._id);
  let Shipped = await VENDOR_HELPERS.Shipped(req.session.vendor._id);
  let Delivered = await VENDOR_HELPERS.Delivered(req.session.vendor._id);
  let Cancel = await VENDOR_HELPERS.Cancel(req.session.vendor._id);
  let PieChart = await VENDOR_HELPERS.getTopsellingProduct(
    req.session.vendor._id
  );
  

  var orderedProductName = PieChart.productName;

  var orderStatus = [
    NotConfirmed,
    Confirmed,
    packed,
    Shipped,
    Delivered,
    Cancel,
  ];
  salesReport = await VENDOR_HELPERS.salesReportWithinRange(
    req.session.vendor._id,
    from,
    to
  );

  res.render("vendor/vendor-home copy", {
    vendor: true,
    session: req.session.vendor,
    salesReport,
    orderStatus,
    PieChart,
  });
  from = new Date("2021-07-01");
  to = new Date();
});

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

// top selling Product
Handlebars.registerHelper("Order_product_name", function (product) {
 
  var abdcd =[]
  for (var i = 0; i < 2; i++) {
    
    
    abdcd[i]=`${product[i]}`
  }
  return abdcd;
});

// sales report with in range
router.post(
  `/sales-report-within-date-range/:id`,
  verifyVendor,
  async (req, res) => {
    from = new Date(req.body.mindate);
    req.body.maxdate = req.body.maxdate + "T23:59:59.000Z";
    to = new Date(req.body.maxdate);
    res.json("a");
  }
);

router.get("/login", (req, res) => {
  if (req.session.vendor) {
    res.redirect("/vendor");
  } else {
    res.render("vendor/vendor-login", {
      vendorLoginError: req.session.vendorLoginError,
      vendorerrorClass: req.session.vendorerrorClass,
    });
    req.session.vendorLoginError = null;
    req.session.vendorerrorClass = null;
  }
});

router.post("/login", (req, res) => {
 
  VENDOR_HELPERS.vendorLogin(req.body).then((response) => {
    if (response.status) {
      req.session.vendor = response.vendor;
      req.session.vendorLoggedIn = true;
      res.redirect("/vendor");
    } else if (response.block) {
      req.session.vendorLoginError = "You were blocked by Admin";
      res.redirect("/vendor/login");
    } else {
      req.session.vendorLoginError = "Invalid Username or Password";
      req.session.vendorerrorClass = "adminError";

      res.redirect("/vendor/login");
    }
  });
});

router.get("/open-seller-account", (req, res) => {
  res.render("vendor/vendor-open-seller-account", { vendorError });
  vendorError = null;
});

router.post("/open-seller-account", (req, res) => {
  
  let status = {};
  VENDOR_HELPERS.openSellerAccount(req.body).then(async (response) => {
    if (!response.vedndorExist) {
      res.redirect("/vendor/login");
    } else {
      vendorError = true;
      res.redirect("/vendor/open-seller-account");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.vendor = null;
  req.session.vendorLoggedIn = false;
  res.redirect("/vendor");
});

router.get("/product-management", verifyVendor, (req, res) => {
  PRODUCT_HELPERS.getProduct(req.session.vendor._id).then(async (products) => {
    res.render("vendor/vendor-product-management", {
      vendor: true,
      products,
      session: req.session.vendor,
    });
  });
});

router.get("/add-product", verifyVendor, (req, res) => {
  PRODUCT_HELPERS.getProductCategories().then((categories) => {
    res.render("vendor/vendor-add-product copy 2", {
      vendor: true,
      categories,
      session: req.session.vendor,
    });
  });
});

router.post("/add-product", verifyVendor, async (req, res) => {
 
  var image1 = req.files.img1;
  var image2 = req.files.img2;
  var image3 = req.files.img3;
  var image4 = req.files.img4;

  await PRODUCT_HELPERS.addProduct(req.body).then(async (data) => {
    await image1.mv(`./public/images/productImage/${data}1.png`, (err) => {
      if (err) {
        console.log(`err : ${err}`);
      } else {
        image2.mv(`./public/images/productImage/${data}2.png`, (err) => {
          if (err) {
            console.log(`err : ${err}`);
          } else {
            image3.mv(`./public/images/productImage/${data}3.png`, (err) => {
              if (err) {
                console.log(`Error 3 :${err}`);
              } else {
                image4.mv(
                  `./public/images/productImage/${data}4.png`,
                  (err) => {
                    if (err) {
                      console.log(`Error 4 : ${err}`);
                    } else {
                      res.redirect("/vendor/product-management");
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  });
});

// edit product
router.get("/edit-product/:id", verifyVendor, async (req, res) => {
  let product = await PRODUCT_HELPERS.getOneProductDetails(req.params.id);
  
  res.render("vendor/vendor-edit-product", {
    vendor: true,
    product,
    session: req.session.vendor,
  });
});

router.post("/edit-product/:id", verifyVendor, (req, res) => {
 
  PRODUCT_HELPERS.updateProductDetails(req.params.id, req.body).then(
    async () => {
      if (req.files) {
        if (req.files.img1 != null) {
          let image1 = await req.files.img1;
          image1.mv(`./public/images/productImage/${req.params.id}1.png`);
        }
        if (req.files.img2 != null) {
          let image2 = await req.files.img2;
          image2.mv(`./public/images/productImage/${req.params.id}2.png`);
        }
        if (req.files.img3 != null) {
          let image3 = await req.files.img3;
          image3.mv(`./public/images/productImage/${req.params.id}3.png`);
        }
        if (req.files.img4 != null) {
          let image4 = await req.files.img4;
          image4.mv(`./public/images/productImage/${req.params.id}4.png`);
        }
      }
      res.redirect("/vendor/product-management");
    }
  );
});

router.get("/delete-product/:proID/:vendorID", verifyVendor, (req, res) => {
  PRODUCT_HELPERS.removeOneProduct(req.params.proID, req.params.vendorID).then(
    (response) => {
      var ID = req.params.id;
      fs.unlink(
        `./public/images/productImage/${req.params.proID}1.png`,
        (err) => {
          if (err) {
            console.log(err);
          } else {
            fs.unlink(
              `./public/images/productImage/${req.params.proID}2.png`,
              (err) => {
                if (err) {
                  console.log(err);
                } else {
                  fs.unlink(
                    `./public/images/productImage/${req.params.proID}3.png`,
                    (err) => {
                      if (err) {
                        console.log(err);
                      } else {
                        fs.unlink(
                          `./public/images/productImage/${req.params.proID}4.png`,
                          (err) => {
                            if (err) {
                              console.log(err);
                            } else {
                              res.json(response);
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  );
});

// change product status
router.get("/changeProductStatus/:id/:value", verifyVendor, (req, res) => {
 
 
  PRODUCT_HELPERS.changeProductStatus(req.params.id, req.params.value).then(
    (response) => {
      res.json(response);
    }
  );
});



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

// order management
router.get("/order-management", verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrders(req.session.vendor._id);
  res.render("vendor/order-management", {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});

Handlebars.registerHelper("Dstatus", function (status) {
  if (status == "Order Confirmed") {
    return new Handlebars.SafeString(`<option value="${status}">Order Confirmed</option>
    <option value="Packed">Packed</option>
    <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancel">Cancel</option>
    `);
  } else if (status == "Packed") {
    return new Handlebars.SafeString(`<option value="${status}">Packed</option>
    <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancel">Cancel</option>
    `);
  } else if (status == "Shipped") {
    return new Handlebars.SafeString(`<option value="${status}">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancel">Cancel</option>
    `);
  } else if (status == "Delivered") {
    return new Handlebars.SafeString(
      `<option value="${status}">Delivered</option>`
    );
  } else if (status == "Cancel") {
    return new Handlebars.SafeString(`<option value="${status}">Cancel</option>
    `);
  } else if (status == "Not Confirmed") {
    return new Handlebars.SafeString(`<option value="${status}">Not Confirmed</option>
    <option value="Order Confirmed">Order Confirmed</option>
    <option value="Cancel">Cancel</option>
    `);
  }
});

Handlebars.registerHelper("SerialNumber", function (index) {
  return index + 1;
});

Handlebars.registerHelper("formatDate", function (datetime, format) {
  if (moment) {
    format = moment[format] || format;
    return moment(datetime).format(format);
  } else {
    return datetime;
  }
});

// pending offer
router.get(`/pending-orders`, verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrderStatus(
    req.session.vendor._id,
    "Not Confirmed"
  );
  res.render(`vendor/pending-orders`, {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});

// canceled order
router.get(`/cancelled-orders`, verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrderStatus(
    req.session.vendor._id,
    "Cancel"
  );
  res.render(`vendor/cancelled-orders`, {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});

// Delivered order
router.get(`/delivered-orders`, verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrderStatus(
    req.session.vendor._id,
    "Delivered"
  );
  res.render(`vendor/cancelled-orders`, {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});

// /confirmed-orders order
router.get(`/confirmed-orders`, verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrderStatus(
    req.session.vendor._id,
    "Order Confirmed"
  );
  res.render(`vendor/confirmed-order`, {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});
// Packed-orders order
router.get(`/packed-orders`, verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrderStatus(
    req.session.vendor._id,
    "Packed"
  );
  res.render(`vendor/packed-orders`, {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});
// Shipped-orders order
router.get(`/shipped-orders`, verifyVendor, async (req, res) => {
  let order = await VENDOR_HELPERS.getOrderStatus(
    req.session.vendor._id,
    "Shipped"
  );
  res.render(`vendor/shipped-order`, {
    vendor: true,
    session: req.session.vendor,
    order,
  });
});

// show order infor in modal
router.post("/getOrderInfo", async (req, res) => {
  
  let orderInfo = await VENDOR_HELPERS.getOrdersInfo(
    req.body.order,
    req.body.product
  );
  res.json(orderInfo);
});

// update order status
router.post("/update-order-status", async (req, res) => {
 
  VENDOR_HELPERS.getOrdersInfo(req.body.order, req.body.product).then(
    (response) => {
      
     
      res.json(response);
    }
  );
});

router.post(`/change-status`, (req, res) => {
 
  
  VENDOR_HELPERS.updateStatus(req.body).then((response) => {
    res.json(response);
  });
});

// offer management
router.get("/offer-management", verifyVendor, async (req, res) => {
  let offers = await PRODUCT_HELPERS.getAllOffers(req.session.vendor._id);
  res.render("vendor/offer/offer-management", {
    vendor: true,
    session: req.session.vendor,
    offers,
  });
});

// add offer
router.get("/add-offer", verifyVendor, async (req, res) => {
  let products = await PRODUCT_HELPERS.getProduct(req.session.vendor._id);
  
  res.render("vendor/offer/add-offer", {
    vendor: true,
    session: req.session.vendor,
    products,
  });
});
router.post("/add-offer", verifyVendor, (req, res) => {
  PRODUCT_HELPERS.addOffer(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/get-product-data/:proID", verifyVendor, (req, res) => {
  PRODUCT_HELPERS.getOneProductDetails(req.params.proID).then((product) =>
    res.json(product)
  );
});

// edit offer
router.get("/edit-offer/:id", verifyVendor, async (req, res) => {
  PRODUCT_HELPERS.getSingleOffer(req.params.id).then((offer) => {
    
    res.render("vendor/offer/edit-offer", {
      vendor: true,
      session: req.session.vendor,
      offer,
    });
  });
});

// submit edit offer
router.post("/edit-offer", verifyVendor, async (req, res) => {
  
  PRODUCT_HELPERS.updateOffer(req.body).then((data) => {
    res.json(data);
  });
});

// change offer status
router.post("/offer-status", verifyVendor, (req, res) => {
 
  PRODUCT_HELPERS.updateOfferStatus(req.body).then((response) => {
   
    res.json(response);
  });
});

// ended offer
router.get(`/ended-offers`, verifyVendor, (req, res) => {
  PRODUCT_HELPERS.endedOffer(req.session.vendor._id).then((offers) => {
    res.render("vendor/offer/ended-offer", {
      vendor: true,
      session: req.session.vendor,
      offers,
    });
  });
});

router.delete(`/delete-offer/:offerID`, verifyVendor, (req, res) => {
  
  PRODUCT_HELPERS.deleteOffer(req.params.offerID).then((response) =>
    res.json(response)
  );
});

// coupeon management
router.get(`/coupen-management`, verifyVendor, async (req, res) => {
  let coupen = await VENDOR_HELPERS.getVendorCoupen(req.session.vendor._id);
  
 
  
  res.render("vendor/coupen/vendor-coupen", {
    vendor: true,
    session: req.session.vendor,
    coupen,
  });
});

// add Coupen
router.get(`/add-coupen`, verifyVendor, async (req, res) => {
  let product = await PRODUCT_HELPERS.getProduct(req.session.vendor._id);
  
  res.render("vendor/coupen/vendor-add-coupen", {
    vendor: true,
    session: req.session.vendor,
    product,
  });
});

router.post(`/add-coupen`, verifyVendor, async (req, res) => {
  await VENDOR_HELPERS.addCoupen(req.body).then((data) => {
    
    res.json(data);
  });
});

// generate coupen
router.post(`/coupen-generator`, verifyVendor, async (req, res) => {
  VENDOR_HELPERS.generateCoupen(req.body).then((response) => {
    res.json(response);
  });
});

// update coupen
router.get("/edit-coupen/:id", verifyVendor, async (req, res) => {
  await VENDOR_HELPERS.getOneCoupenDetails(req.params.id).then((coupen) => {
    res.render("vendor/coupen/vendor-edit-coupen", {
      vendor: true,
      session: req.session.vendor,
      coupen,
    });
  });
});

router.patch(`/update-coupen`, verifyVendor, async (req, res) => {
  
  await VENDOR_HELPERS.updateCoupen(req.body).then((response) =>
    res.json(response)
  );
});

// delete coupen

router.delete(`/delete-coupon/:id`, (req, res) => {
  VENDOR_HELPERS.deleteCoupon(req.params.id).then((response) =>
    res.json(response)
  );
});

// vendor profiel
router.get("/profile", verifyVendor, async (req, res) => {
  let product = await PRODUCT_HELPERS.getProduct(req.session.vendor._id);
  let vendorDetails = await VENDOR_HELPERS.getVendorDetails(
    req.session.vendor._id
  );
  
  res.render("vendor/profile", {
    vendor: true,
    session: req.session.vendor,
    product,
    vendorDetails,
  });
});

// edit vendor profiel
router.post(`/edit-vendor-profile`, verifyVendor, async (req, res) => {
 
  VENDOR_HELPERS.updateVendorDetails(req.body).then((response) =>
    res.redirect("/vendor/profile")
  );
});

// top selling product
router.get(`/top-selling-product/:id`, verifyVendor, async (req, res) => {
 
});

module.exports = router;
