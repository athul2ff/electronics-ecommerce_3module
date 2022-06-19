const { ObjectId } = require("bson");
const { response } = require("express");
const { resolve, reject } = require("promise");
const db = require("../config/dataBaseConnection");
const NAME_COLLECTION = require("../config/nameCollections");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");

let getAllAddress = (userID) => {
  let address = db
    .get()
    .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
    .aggregate([
      { $match: { user: ObjectId(userID) } },
      {
        $unwind: "$address",
      },
      {
        $project: {
          _id: 0,
          address: 1,
        },
      },
    ])
    .toArray();
  return address;
};
var instance = new Razorpay({
  key_id: "rzp_test_Yo29tSbSVoyDWC",
  key_secret: "4NA58rYabbLjeTKJVQX4DOzG",
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let existUser = await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .findOne({ email: userData.email });

      if (existUser != null) {
        if (userData.email == existUser.email) {
         
          resolve({ userExist: true });
        }
      } else {
        
        userData.password = await bcrypt.hash(userData.password, 10);
        
        let data = await db
          .get()
          .collection(NAME_COLLECTION.USER_COLLECTION)
          .insertOne(userData);
        await db
          .get()
          .collection(NAME_COLLECTION.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(data.ops[0]._id) },
            {
              $set: { block: "unblock" },
            }
          );
        resolve(data.ops[0]);
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        if (user.block == "block") {
         
          resolve({ block: true });
        } else if (user.block == "unblock") {
          await bcrypt
            .compare(userData.password, user.password)
            .then((status) => {
              if (status) {
                
                response.user = user;
                response.status = true;
                resolve(response);
              }
            });
        }
      } else {
        
        resolve({ status: false });
      }
    });
  },
  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .find()
        .toArray()
        .then((product) => {
          resolve(product);
        })
        .catch((data) => {
          resolve();
        });
    });
  },
  addToCart: (productId, userId) => {
    return new Promise(async (resolve, reject) => {
      let productExis = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(productId) });

      let prod = {
        item: ObjectId(productId),
        price: productExis.price,
        quantity: 1,
        deliveryStatus: "Not Confirmed",
      };

      // console.log(prod);
      let user = await db
        .get()
        .collection(NAME_COLLECTION.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      // console.log(user);
      if (user) {
        let prodExist = user.products.findIndex(
          (products) => products.item == productId
        );
        if (prodExist != -1) {
          //if product is there//
          db.get()
            .collection(NAME_COLLECTION.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve(response);
            });
        } else {
          //if there is no product
          db.get()
            .collection(NAME_COLLECTION.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: prod },
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
      } else {
        //if there is no cart for user
        let cartObj = {
          user: ObjectId(userId),
          products: [prod],
        };
        // console.log(cartObj);
        db.get()
          .collection(NAME_COLLECTION.CART_COLLECTION)
          .insertOne(cartObj)
          .then(() => {
            resolve();
          });
      }
    });
  },
  // get cart product
  getCartProducts: (userID) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(NAME_COLLECTION.CART_COLLECTION)
        .aggregate([
          { $match: { user: ObjectId(userID) } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: NAME_COLLECTION.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $addFields: {
              subTotal: {
                $multiply: [
                  { $toDouble: "$products.quantity" },
                  { $toDouble: "$products.price" },
                ],
              },
            },
          },
        ])
        .toArray();
     
      resolve(cartItems);
    });
  },
  // change qty
  changeProductQty: (details) => {
    return new Promise(async (resolve, reject) => {
      details.quantity = parseInt(details.quantity);
      details.count = parseInt(details.count);
      if (details.count === -1 && details.quantity <= 1) {
       
        db.get()
          .collection(NAME_COLLECTION.CART_COLLECTION)
          .updateOne(
            { _id: ObjectId(details.cart) },
            { $pull: { products: { item: ObjectId(details.product) } } }
          )
          .then((response) => resolve({ removeProduct: true }));
      } else {
        db.get()
          .collection(NAME_COLLECTION.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              "products.item": ObjectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  // get total amout
  getTotalAmount: (userID) => {
    return new Promise(async (resolve, reject) => {
      let cartExist = await db
        .get()
        .collection(NAME_COLLECTION.CART_COLLECTION)
        .findOne({ user: ObjectId(userID) });
    

      if (cartExist) {
        let TotalAmount = await db
          .get()
          .collection(NAME_COLLECTION.CART_COLLECTION)
          .aggregate([
            {
              $match: { user: ObjectId(userID) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                item: "$products.item",
                quantity: "$products.quantity",
              },
            },
            {
              $lookup: {
                from: NAME_COLLECTION.PRODUCT_COLLECTION,
                localField: "item",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      { $toDouble: "$quantity" },
                      { $toDouble: "$product.price" },
                    ],
                  },
                },
              },
            },
          ])
          .toArray();
       
        if (TotalAmount[0] && TotalAmount[0].total) {
          resolve(TotalAmount[0].total);
        } else {
          resolve("0");
        }
      } else {
        resolve(`0`);
      }
    });
  },
  // cart count
  cartCount: (userID) => {
    return new Promise(async (resolve, reject) => {
      if (userID) {
      
        let cartCount = await db
          .get()
          .collection(NAME_COLLECTION.CART_COLLECTION)
          .find({ user: ObjectId(userID) })
          .toArray();
       
        if (cartCount[0] != null) {
          resolve(cartCount[0].products.length);
        } else {
          resolve("0");
        }
      } else {
        resolve();
      }
    });
  },

  // delete product from cart
  deleteProductFromCart: ({ cartID, proID }) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(cartID) },
          {
            $pull: { products: { item: ObjectId(proID) } },
          }
        )
        .then((response) => {
          resolve({ removerCart: true });
        });
    });
  },
  // get user details
  getUserDetails: (userID) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .findOne({ _id: ObjectId(userID) });
     
      resolve(user);
    });
  },
  // update user details
  updateUserData: (userID, userData) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userID) },
          {
            $set: {
              username: userData.username,
              email: userData.email,
              mobile: userData.mobile,
              place: userData.place,
              post: userData.post,
              PIN: userData.PIN,
              district: userData.district,
              state: userData.state,
            },
          }
        )
        .then((data) => {
          resolve({ profileUpdate: true });
        });
    });
  },
  // add Address
  addAddress: (data) => {
    var address = {
      name: data.FullName,
      email: data.email,
      mobile: data.mobile,
      place: data.place,
      post: data.post,
      PIN: data.PIN,
      district: data.district,
      state: data.state,
    };
    let Address = {};
    return new Promise(async (resolve, reject) => {
      db.get().collection(NAME_COLLECTION);
    });
  },
  // get all address
  getAllAddress: (userID) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
        .aggregate([
          { $match: { user: ObjectId(userID) } },
          {
            $unwind: "$address",
          },
          {
            $project: {
              _id: 1,
              address: 1,
            },
          },
        ])
        .toArray();
    
      resolve(address);
    });
  },
  getOneAddress: (id, user) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
        .aggregate([
          { $unwind: "$address" },
          {
            $match: { $and: [{ _id: ObjectId(id) }, { "address.name": user }] },
          },
        ])
        .toArray();
      
      resolve(address);
    });
  },

  // update Address
  updateAddress: (data) => {
    
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(data.userID),
            "address.name": data.prevName,
          },
          {
            $set: {
              "address.$.name": data.FullName,
              "address.$.email": data.email,
              "address.$.mobile": data.mobile,
              "address.$.place": data.place,
              "address.$.post": data.post,
              "address.$.PIN": data.PIN,
              "address.$.district": data.district,
              "address.$.state": data.state,
            },
          }
        )
        .then((response) => {
         
          resolve();
        });
    });
  },

  // delete Address
  deleteUserAddress: ({ id, username }) => {
    return new Promise(async (resolve, reject) => {
     
    
      db.get()
        .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
        .updateOne(
          { _id: ObjectId(id), "address.name": username },
          {
            $pull: {
              address: { name: username },
            },
          }
        )
        .then((response) => resolve({ addressRemove: true }));
    });
  },

  placeOrder: (order, product, amount) => {
   
    return new Promise(async (resolve, reject) => {
      if (order.save == "on") {
        let newAddress = {
          name: order.FullName,
          email: order.email,
          mobile: order.mobile,
          place: order.place,
          post: order.post,
          PIN: order.PIN,
          district: order.district,
          state: order.state,
        };
        let addressCollection = await db
          .get()
          .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
          .findOne({ user: ObjectId(order.userID) });
       
        if (addressCollection) {
          
          db.get()
            .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
            .updateOne(
              { user: ObjectId(order.userID) },

              {
                $push: { address: newAddress },
              }
            );
        } else {
          db.get()
            .collection(NAME_COLLECTION.ADDRESS_COLLECTION)
            .insertOne({
              user: ObjectId(order.userID),
              address: [newAddress],
            });
        }
      }
     
      let status = order.payment == "cod" ? "Order Placed" : "Pending";
      if (order.address == "on") {
        let orderObj = {
          user: ObjectId(order.userID),
          deliveryAddress: {
            name: order.FullName,
            email: order.email,
            mobile: order.mobile,
            place: order.place,
            post: order.post,
            PIN: order.PIN,
            district: order.district,
            state: order.state,
          },
          paymentMethod: order.payment,
          order: product,
          orderStatus: status,
          totalAmount: amount,
          date: new Date(),
        };
        await db
          .get()
          .collection(NAME_COLLECTION.ORDER_COLLECTION)
          .insertOne(orderObj)
          .then(async (response) => {
            if (order.couponID) {
              var coupon = await db
                .get()
                .collection(NAME_COLLECTION.COUPEN_COLLECTION)
                .findOne({ _id: ObjectId(order.couponID) });
             

              if (coupon.type == "product") {
                await db
                  .get()
                  .collection(NAME_COLLECTION.ORDER_COLLECTION)
                  .updateOne(
                    {
                      _id: ObjectId(response.ops[0]._id),
                      "order.products.item": ObjectId(coupon.productID),
                    },
                    {
                      $set: {
                        "order.$.products.coupenDiscound": order.discoundAmount,
                        "order.$.products.discoundPercentage": coupon.discound,
                      },
                    }
                  );
              } else if (coupon.type == "global") {
               
                await db
                  .get()
                  .collection(NAME_COLLECTION.ORDER_COLLECTION)
                  .updateOne(
                    {
                      _id: ObjectId(response.ops[0]._id),
                    },
                    {
                      $set: {
                        coupenDiscound: order.discoundAmount,
                        discoundPercentage: coupon.discound,
                      },
                    }
                  );
              }
            }

            db.get()
              .collection(NAME_COLLECTION.CART_COLLECTION)
              .removeOne({ user: ObjectId(order.userID) });
            resolve(response.ops[0]._id);
          });
      } else {
        let delivery = await getAllAddress(order.userID);
       
        let orderObj = {
          user: ObjectId(order.userID),
          deliveryAddress: delivery[order.address].address,
          paymentMethod: order.payment,
          order: product,
          orderStatus: status,
          totalAmount: amount,
          date: new Date(),
        };
        await db
          .get()
          .collection(NAME_COLLECTION.COUPEN_COLLECTION)
          .updateOne(
            { coupenCode: order.coupenCode },
            {
              $push: {
                users: ObjectId(order.userID),
              },
            }
          );

        await db
          .get()
          .collection(NAME_COLLECTION.ORDER_COLLECTION)
          .insertOne(orderObj)
          .then(async (response) => {
            if (order.couponID) {
              var coupon = await db
                .get()
                .collection(NAME_COLLECTION.COUPEN_COLLECTION)
                .findOne({ _id: ObjectId(order.couponID) });
              

              if (coupon.type == "product") {
                await db
                  .get()
                  .collection(NAME_COLLECTION.ORDER_COLLECTION)
                  .updateOne(
                    {
                      _id: ObjectId(response.ops[0]._id),
                      "order.products.item": ObjectId(coupon.productID),
                    },
                    {
                      $set: {
                        "order.$.products.coupenDiscound": order.discoundAmount,
                        "order.$.products.discoundPercentage": coupon.discound,
                      },
                    }
                  );
              } else if (coupon.type == "global") {
                
                await db
                  .get()
                  .collection(NAME_COLLECTION.ORDER_COLLECTION)
                  .updateOne(
                    {
                      _id: ObjectId(response.ops[0]._id),
                    },
                    {
                      $set: {
                        coupenDiscound: order.discoundAmount,
                        discoundPercentage: coupon.discound,
                      },
                    }
                  );
              }
            }

            
            db.get()
              .collection(NAME_COLLECTION.CART_COLLECTION)
              .removeOne({ user: ObjectId(order.userID) });
            resolve(response.ops[0]._id);
          });
      }
    });
  },

  getCartProductList: (userID) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(NAME_COLLECTION.CART_COLLECTION)
        .aggregate([
          { $match: { user: ObjectId(userID) } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: NAME_COLLECTION.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              _id: 1,
              user: 1,
              products: 1,
              product: 1,
              Date: 1,
              subTotal: {
                $multiply: [
                  { $toDecimal: "$products.quantity" },
                  { $toDecimal: "$product.price" },
                ],
              },
            },
          },
        ])
        .toArray();
      console.log(cart);
      resolve(cart);
    });
  },
  getSubTotalofSignleProduct: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.CART_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          {
            $match: {
              _id: ObjectId(data.cart),
              "products.item": ObjectId(data.product),
            },
          },
          {
            $addFields: {
              subTotal: {
                $multiply: [
                  { $toDouble: "$products.quantity" },
                  { $toDouble: "$products.price" },
                ],
              },
            },
          },
        ])
        .toArray()
        .then((response) => {
         
          resolve(response[0].subTotal);
        });
    });
  },
  // get orders
  getUserOrders: (userID) => {
    
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(userID) },
          },
          { $unwind: "$products" },
          {
            $project: {
              productID: "$products.item",
              quantity: "$products.quantity",
              user: 1,
              paymentMethod: 1,
              orderStatus: 1,
              totalAmount: 1,
              date: 1,
            },
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
              productID: "$products.item",
              quantity: "$products.quantity",
              user: 1,
              paymentMethod: 1,
              orderStatus: 1,
              totalAmount: 1,
              date: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(orders);
    });
  },
  // get order collection
  getOrderCollection: (userID) => {
   
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .aggregate([
          { $match: { user: ObjectId(userID) } },
          { $unwind: "$order" },
          {
            $sort: {
              date: -1,
            },
          },
        ])
        .toArray();
      
      resolve(order);
    });
  },

  // razorpay order
  generateRazorpay: (orderID, amount) => {
    orderID = ObjectId(orderID).toString();
    return new Promise(async (resolve, reject) => {
      var options = {
        amount: amount, // amount in the smallest currency unit
        currency: "INR",
        receipt: orderID,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
         
          reject();
        } else {
         
          resolve(order);
        }
      });
    });
  },
  // verify payment
  verifyPayment: (details) => {
   
    return new Promise(async (resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", process.env.razorpay);
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
       
        resolve();
      } else {
      
        reject();
      }
    });
  },
  // change payment status while paymetn success
  changePaymentStatus: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              orderStatus: "Order Placed",
            },
          }
        )
        .then(() => {
          resolve();
        })
        .catch((data) => {
         
        });
    });
  },
  updatePyamentStatus: (orderID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderID) },
          {
            $set: {
              orderStatus: "Order Placed",
            },
          }
        )
        .then((response) => {
          resolve({ orderStatusUpdate: true });
        });
    });
  },
  getOrderDetails: (orderID) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.ORDER_COLLECTION)
        .findOne({ _id: ObjectId(orderID) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  // find coupen
  fidCoupen: (data, userID) => {
    return new Promise(async (resolve, reject) => {
      let couponExist = await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        .aggregate([
          { $unwind: "$users" },
          {
            $match: {
              $and: [{ users: ObjectId(userID) }, { coupenCode: data }],
            },
          },
        ])
        .toArray();
    
      if (couponExist && couponExist[0]) {
        resolve({ couponAlreadyUser: true });
      } else {
        let coupen = await db
          .get()
          .collection(NAME_COLLECTION.COUPEN_COLLECTION)
          .findOne({ coupenCode: data });
        if (coupen == null) {
         
          resolve({ notValid: true });
        } else {
         
          resolve(coupen);
        }
      }
    });
  },
  // get available coupon for users
  getAvailableCoupon: (userID) => {
    return new Promise(async (resolve, reject) => {
      let coupon = await db
        .get()
        .collection(NAME_COLLECTION.COUPEN_COLLECTION)
        // .find({ users: { $nin: [ObjectId(userID)] } })
        .aggregate([
          { $match: { users: { $nin: [ObjectId(userID)] } } },
          {
            $lookup: {
              from: NAME_COLLECTION.PRODUCT_COLLECTION,
              localField: "productID",
              foreignField: "_id",
              as: "product",
            },
          },
        ])
        .toArray();
      resolve(coupon);
    });
  },
  // update user profile
  updateUserProfile: (data) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.USER_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(data.userID),
          },
          {
            $set: {
              username: data.FullName,
              email: data.email,
              mobile: data.mobile,
            },
          }
        )
        .then((response) => {
          resolve({ updateProfile: true });
        });
    });
  },
};
