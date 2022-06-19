const NAME_COLLECTION = require("../config/nameCollections");
const db = require("../config/dataBaseConnection");
var bcrypt = require("bcrypt");
const { resolve, reject } = require("promise");
const { ObjectId } = require("bson");
var voucher_codes = require("voucher-code-generator");
const { report } = require("../routes/vendor");
module.exports = {
  openSellerAccount: (vendorData) => {
    return new Promise(async (resolve, reject) => {
      let existVendor = await db
        .get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .findOne({
          email: vendorData.email,
        });
      if (existVendor != null) {
        if (vendorData.email == existVendor.email) {
         
          resolve({ vedndorExist: true });
        }
      } else {
       
        var saltRounds = 10;
        var salt = await bcrypt.genSaltSync(saltRounds);
        vendorData.password = await bcrypt.hash(vendorData.password, 10);
        // vendorData.password = await bcrypt.hash(vendorData.password, 10);//
        await db
          .get()
          .collection(NAME_COLLECTION.VENDOR_COLLECTION)
          .insertOne(vendorData)
          .then((data) => {
            db.get()
              .collection(NAME_COLLECTION.VENDOR_COLLECTION)
              .updateOne(
                { _id: ObjectId(data.ops[0]._id) },
                {
                  $set: { status: "unblock" },
                }
              );
            resolve(data.ops[0]);
          });
      }
    });
  },
  
  // using bcrypt
  vendorLogin: (vendorData) => {
  
    return new Promise(async (resolve, reject) => {
      let response = {};
      let vendor = await db
        .get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .findOne({ email: vendorData.email });
     
      if (vendor && vendor.status == "unblock") {
        await bcrypt
          .compare(vendorData.password, vendor.password)
          .then((status) => {
            if (status) {
             
              response.vendor = vendor;
              response.status = true;
              resolve(response);
            } else {
            
              resolve({ status: false });
            }
          });
      } else if (vendor && vendor.status == "block") {
        resolve({ block: true });
      } else {
       
        resolve({ status: false });
      }
    });
  },
  
  // get orders list
  getOrders: (vendorID) => {
    
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": vendorID },
                { orderStatus: "Order Placed" },
              ],
            },
          },
        ])
        .toArray();
      
      resolve(order);
    });
  },
  // confirmedOrder orders
  getOrderStatus: (vendorID, status) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": vendorID },
                { "order.products.deliveryStatus": status },
              ],
            },
          },
        ])
        .toArray();
      
      resolve(order);
    });
  },

  // get order info for modal
  getOrdersInfo: (orderID, productID) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            // $match: { "order.product.vendorID": ObjectId(orderID) },
            $match: {
              $and: [
                { _id: ObjectId(orderID) },
                { "order.product._id": ObjectId(productID) },
              ],
            },
          },
        ])
        .toArray()
        .then((data) => {
          
          resolve(data);
        });
    });
  },
  updateStatus: ({ order, product, status }) => {
    
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(order),
            "order.product._id": ObjectId(product),
          },
          {
            $set: {
              "order.$.products.deliveryStatus": status,
            },
          }
        )
        .then((data) => {
         
          resolve({ statusChange: true });
        });
    });
  },
  // generate coupen
  generateCoupen: (amount) => {
    return new Promise(async (resolve, reject) => {
      let coupen = await voucher_codes.generate({
        length: 5,
        prefix: "SP_D",
        postfix: `_${amount.discound}`,
      });
      
      resolve(coupen);
    });
  },

  // save coupen code to database
  addCoupen: (data) => {
    return new Promise(async (resolve, reject) => {
      let coupenObj = {
        productID: ObjectId(data.productID),
        vendorID: ObjectId(data.vendorID),
        price: data.price,
        discound: data.discound,
        priceAfterDsicound: data.priceAfterDsicound,
        coupenCode: data.coupenCode,
        createdBy: "vendor",
        type: "product",
        users: [],
      };
      await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .insertOne(coupenObj)
        .then((response) => {
         
          resolve({ addCoupen: true });
        });
    });
  },
  // get coupen vendor id wise
  getVendorCoupen: (id) => {
    return new Promise(async (resolve, reject) => {
      let coupen = await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .aggregate([
          {
            $match: { vendorID: ObjectId(id) },
          },
          {
            $lookup: {
              from: NAME_COLLECTION.PRODUCT_COLLECTION,
              localField: "productID",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              _id: 1,
              productID: 1,
              vendorID: 1,
              discound: 1,
              priceAfterDsicound: 1,
              coupenCode: 1,
              createdBy: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(coupen);
    });
  },
  // get single coupen
  getOneCoupenDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      let coupen = await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(id) },
          },
          {
            $lookup: {
              from: NAME_COLLECTION.PRODUCT_COLLECTION,
              localField: "productID",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              _id: 1,
              productID: 1,
              vendorID: 1,
              discound: 1,
              priceAfterDsicound: 1,
              coupenCode: 1,
              createdBy: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      
      resolve(coupen[0]);
    });
  },
  // update coupen dettails
  updateCoupen: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .updateOne(
          { _id: ObjectId(data.coupenID) },
          {
            $set: {
              discound: data.discound,
              priceAfterDsicound: data.priceAfterDsicound,
              coupenCode: data.coupenCode,
            },
          }
        )
        .then((response) => {
         
          resolve({ editCoupen: true });
        });
    });
  },
  deleteCoupon: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          resolve({ coupenDeleted: true });
        });
    });
  },

  // sales report
  getSalesReport: (vendorID) => {
    return new Promise(async (resolve, reject) => {
      let report = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { orderStatus: "Order Placed" },
                { "order.product.vendorID": ObjectId(vendorID) },
              ],
            },
          },
        ])
        .toArray();
     
      resolve(report);
    });
  },
  // sales report within range
  salesReportWithinRange: (id, min, max) => {
    return new Promise(async (resolve, reject) => {
      let report = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { orderStatus: "Order Placed" },
                { "order.product.vendorID": ObjectId(id) },
                {
                  date: { $gte: min, $lte: max },
                },
              ],
            },
          },
        ])
        .toArray();
      resolve(report);
    });
  },
  // vendor details
  getVendorDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  // update vendor data
  updateVendorDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.VENDOR_COLLECTION)
        .updateOne(
          { _id: ObjectId(data.userID) },
          {
            $set: {
              username: data.username,
              email: data.email,
              mobile: data.mobile,
            },
          }
        )
        .then((response) => {
        
          resolve({ profileUpdate: true });
        });
    });
  },
  // not confirmed
  NotConfirmed: (id) => {
    return new Promise(async (resolve, reject) => {
      let NotConfirmed = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": ObjectId(id) },
                { "order.products.deliveryStatus": "Not Confirmed" },
              ],
            },
          },
        ])
        .toArray();
      
      resolve(NotConfirmed.length);
    });
  },
  Confirmed: (id) => {
    return new Promise(async (resolve, reject) => {
      let Confirmed = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": ObjectId(id) },
                { "order.products.deliveryStatus": "Order Confirmed" },
              ],
            },
          },
        ])
        .toArray();
     
      resolve(Confirmed.length);
    });
  },
  Packed: (id) => {
    return new Promise(async (resolve, reject) => {
      let NotConfirmed = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": ObjectId(id) },
                { "order.products.deliveryStatus": "Packed" },
              ],
            },
          },
        ])
        .toArray();
     
      resolve(NotConfirmed.length);
    });
  },
  Shipped: (id) => {
    return new Promise(async (resolve, reject) => {
      let NotConfirmed = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": ObjectId(id) },
                { "order.products.deliveryStatus": "Shipped" },
              ],
            },
          },
        ])
        .toArray();
      
      resolve(NotConfirmed.length);
    });
  },
  Delivered: (id) => {
    return new Promise(async (resolve, reject) => {
      let NotConfirmed = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": ObjectId(id) },
                { "order.products.deliveryStatus": "Delivered" },
              ],
            },
          },
        ])
        .toArray();
    
      resolve(NotConfirmed.length);
    });
  },
  Cancel: (id) => {
    return new Promise(async (resolve, reject) => {
      let NotConfirmed = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$order" },
          {
            $match: {
              $and: [
                { "order.product.vendorID": ObjectId(id) },
                { "order.products.deliveryStatus": "Cancel" },
              ],
            },
          },
        ])
        .toArray();
    
      resolve(NotConfirmed.length);
    });
  },
  // top selling product
  getTopsellingProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      var product = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .find({ vendorID: ObjectId(id) })
        .toArray();
      
      var p1 = null,
        p2 = null,
        p3 = null,
        p4 = null,
        p5 = null;
      var productCount = [],
        i;
      var Looplength = product.length >= 5 ? 5 : product.length;
      for (var i = 0; i <= Looplength - 1; i++) {
        if (i == 0) {
          p1 = product[i].ProductName;
        } else if (i == 1) {
          p2 = product[i].ProductName;
        } else if (i == 2) {
          p3 = product[i].ProductName;
        } else if (i == 3) {
          p4 = product[i].ProductName;
        } else if (i == 4) {
          p5 = product[i].ProductName;
        }
      }
      for (i = 0; i < Looplength; i++) {
        var Orders = await db
          .get()
          .collection(NAME_COLLECTION.ORDER_COLLECTION)
          .aggregate([
            { $unwind: "$order" },
            {
              $match: {
                "order.product._id": ObjectId(product[i]._id),
              },
            },
          ])
          .toArray();
        productCount[i] = Orders.length;
      }

      resolve({ p1, p2, p3, p4, p5, productCount });
    });
  },
};
