const { response } = require("express");
var express = require("express");
var router = express.Router();
const ADMIN_HELPERS = require("../helpers/admin-helpers");
const fs = require("fs");
const path = require("path");
let Handlebars = require("handlebars");
let moment = require("moment");

const verifyAdmin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

var from = new Date("2022-07-01");
var to = new Date();

/* GET home page. *//
router.get("/", verifyAdmin, async function (req, res, next) {
  
  let usersCount = await ADMIN_HELPERS.getUsersCount();
  let vendorsCount = await ADMIN_HELPERS.getVendorsCount();
  let productsCount = await ADMIN_HELPERS.getProductsCount();
  let salesReport = await ADMIN_HELPERS.salesReportWithinRange(from, to);
  res.render("admin/admin-home", {
    admin: true,
    session: req.session.admin,
    usersCount,
    vendorsCount,
    productsCount,
    salesReport,
  });
  from = new Date("2021-07-01");
  to = new Date();
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

router.post(
  `/sales-report-within-date-range/:id`,
  verifyAdmin,
  async (req, res) => {
   
    from = new Date(req.body.mindate);
    req.body.maxdate = req.body.maxdate + "T23:59:59.000Z";
    to = new Date(req.body.maxdate);
    res.json("a");
  }
);

router.get("/login", (req, res, next) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", {
      adminLoginError: req.session.adminLoginError,
      adminerrorClass: req.session.adminerrorClass,
    });
    req.session.adminLoginError = null;
    req.session.adminerrorClass = null;
  }
});

router.post("/login", (req, res, next) => {
 
  ADMIN_HELPERS.adminLogin(req.body).then((response) => {
   
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.adminLoginError = "Invalid Username or Password";
      req.session.adminerrorClass = "adminError";
      res.redirect("/admin/login");
    }
  });
});

// admin logut
router.get("/logout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
});

// admin product categories management
router.get("/product-categories-management", verifyAdmin, async (req, res) => {
  let productCategories = await ADMIN_HELPERS.getAllProductCategory();
 
  res.render("admin/admin-product-categories", {
    admin: true,
    productCategories,
    session: req.session.admin,
  });
});

router.post("/add-New-Product-Category", verifyAdmin, (req, res) => {
  let targetFile = req.files.categoryImage;
  let extName = path.extname(targetFile.name);
  let baseName = path.basename(targetFile.name, extName);
  let imgList = [".png"];
  
  // Checking the file type
  if (!imgList.includes(extName)) {
    fs.unlinkSync(targetFile.tempFilePath);
    return res.status(422).send("Invalid Image");
  } else {
    ADMIN_HELPERS.addProductCategory(req.body).then((response) => {
      targetFile.mv(`./public/images/categoryImages/${response}.png`, (err) => {
        if (err) {
          console.log(`Cant Upload Product Image : ${err}`);
        } else {
          console.log(`Product Added Succefuly`);

          res.redirect("/admin/product-categories-management");
        }
      });
    });
  }
});
router.get("/deleteCategoryImage/:id", (req, res) => {
  ADMIN_HELPERS.deleteCategory(req.params.id).then((response) => {
    fs.unlink(
      `./public/images/categoryImages/${req.params.id}.png`,
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
         
          res.json(response);
        }
      }
    );
  });
});

router.get("/edit-category/:id", verifyAdmin, async (req, res) => {
  let cate = await ADMIN_HELPERS.getOneCategory(req.params.id);
  res.render("admin/editcategory", {
    admin: true,
    cate,
    session: req.session.admin,
  });
});

router.post("/edit-category/:id", verifyAdmin, (req, res) => {
 
  ADMIN_HELPERS.editProductCategory(req.params.id, req.body).then(() => {
    if (req.files) {
      let image = req.files.categoryImage;
      image.mv(`./public/images/categoryImages/${req.params.id}.png`);
    }
    res.redirect("/admin/product-categories-management");
  });
});

router.get("/user-management", verifyAdmin, async (req, res) => {
  let allUsers = await ADMIN_HELPERS.getAllUsers();
  res.render("admin/user-management", {
    admin: true,
    allUsers,
    session: req.session.admin,
  });
});

router.get("/blocked-users", verifyAdmin, async (req, res) => {
  let allUsers = await ADMIN_HELPERS.getBlockedUsers();
  res.render("admin/bloced-users", {
    admin: true,
    allUsers,
    session: req.session.admin,
  });
});

router.get("/block-user/:id/:value", verifyAdmin, (req, res) => {
  let value = req.params.value;
 
  ADMIN_HELPERS.banUser(req.params.id, value).then((response) => {
    res.json(response);
  });
});

// vendor management
router.get(`/vendor-management`, verifyAdmin, async (req, res) => {
  let allVendor = await ADMIN_HELPERS.getAllVendor();
 
  res.render("admin/vendor/vendor-management", {
    admin: true,
    allVendor,
    session: req.session.admin,
  });
});
router.get(`/blocked-vendor`, verifyAdmin, async (req, res) => {
  let blockedVendor = await ADMIN_HELPERS.getBlockedVendor();
  res.render("admin/vendor/blocked-vendor", {
    admin: true,
    blockedVendor,
    session: req.session.admin,
  });
});

// vendor status change
router.get(`/block-vendor/:id/:value`, verifyAdmin, async (req, res) => {
  await ADMIN_HELPERS.VendorStatusChange(req.params.id, req.params.value).then(
    (response) => {
      res.json(response);
    }
  );
});

// handlebar vendor logo
Handlebars.registerHelper("VendorLogo", function (id, profile) {
  if (profile) {
    return new Handlebars.SafeString(
      `<img src="/images/vendor/${id}" style="width:80px;">`
    );
  } else {
    return new Handlebars.SafeString(
      `<img src="/images/vendor/vendorLogo.png" style="width:80px;">`
    );
  }
});

// coupen management
router.get(`/coupen-management`, verifyAdmin, async (req, res) => {
  let coupon = await ADMIN_HELPERS.getAdminCoupen(req.session.admin._id);

  res.render(`admin/coupen/coupen-management`, {
    admin: true,
    session: req.session.admin,
    coupon,
  });
});

// add coupen
router.get(`/add-coupen`, verifyAdmin, async (req, res) => {
  
  res.render(`admin/coupen/add-coupen`, {
    admin: true,
    session: req.session.admin,
  });
});

// add coupoen form post
router.post(`/add-coupen`, (req, res) => {
 
  ADMIN_HELPERS.addCoupon(req.body).then((response) => {
    res.json(response);
  });
});

// generate coupen
router.post(`/coupen-generator`, (req, res) => {
  ADMIN_HELPERS.generateCoupen(req.body).then((couepen) => {
    res.json(couepen);
  });
});

// edit coupoen
router.get(`/edit-coupen/:coupenID`, verifyAdmin, async (req, res) => {
  let cuopen = await ADMIN_HELPERS.getSingleCoupen(req.params.coupenID);
  res.render(`admin/coupen/edit-coupen`, {
    admin: true,
    session: req.session.admin,
    cuopen,
  });
});

router.post(`/edit-coupen`, verifyAdmin, (req, res) => {
  ADMIN_HELPERS.updateCoupen(req.body).then((response) => {
    res.json(response);
  });
});

router.delete(`/delete-coupen/:id`, (req, res) => {
  
  ADMIN_HELPERS.deleteCoupen(req.params.id).then((response) =>
    res.json(response)
  );
});

module.exports = router;
