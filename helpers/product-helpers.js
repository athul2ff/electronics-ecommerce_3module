const NAME_COLLECTION = require("../config/nameCollections");
const PROMISE = require("promise");
const { resolve, reject } = require("promise");
const db = require("../config/dataBaseConnection");
const ObjectId = require("mongodb").ObjectID;
const { response } = require("express");
var d = new Date();
var day = d.getDay();
var dat = d.getDate();
var year = d.getFullYear();

var fullDate = `${day}-${dat}-${year}`;

module.exports = {
  addProduct: (productData) => {
    return new Promise(async (resolve, reject) => {
      let categoryID = await db
        .get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .findOne({ category: productData.category });
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .insertOne({
          vendorID: ObjectId(productData.vendorID),
          categoryID: ObjectId(categoryID._id),
          category: productData.category,
          ProductName: productData.ProductName,
          productBrand: productData.productBrand,
          price: productData.price,
          stock: productData.stock,
          status: productData.status,
          description: productData.description,
          Date: fullDate,
          actualPrice: productData.price,
          discound: 0,
          offer: false,
        })
        .then((data) => {
          resolve(data.ops[0]._id);
        });
    });
  },
 
  getProduct: (vendor) => {
    return new Promise(async (resolve, reject) => {
      let offer = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .find({ vendorID: ObjectId(vendor) })
        .toArray();
     
      resolve(offer);
    });
  },
  getOneProductDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      resolve(product);
    });
  },
  removeOneProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then(() => {
          resolve({ removeProduct: true });
        });
    });
  },
  changeProductStatus: (id, value) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: { status: value },
          }
        );
    });
  },
  updateProductDetails: (proID, productData) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proID) },
          {
            $set: {
              ProductName: productData.ProductName,
              productBrand: productData.productBrand,
              price: productData.price,
              stock: productData.stock,
              status: productData.status,
              description: productData.description,
            },
          }
        )
        .then((data) => {
          resolve();
        });
    });
  },

  /// user///
  getProductCategories: () => {
    return new Promise(async (resolve, reject) => {
      let categories = await db
        .get()
        .collection(NAME_COLLECTION.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(categories);
    });
  },
  // get product from category
  getProductFromCategory: (value) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .find({ category: value })
        .toArray();
      resolve(product);
    });
  },
  // get product from category
  getProductWithinCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .find({ category: data })
        .toArray();
      resolve(product);
    });
  },

  // add offer
  addOffer: (data) => {
   
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(data.productID),
            vendorID: ObjectId(data.vendorID),
          },
          {
            $set: {
              price: data.priceAfterDsicound,
              discound: data.discound,
              offer: true,
            },
          }
        )
        .then(() => resolve({ addDiscound: true }));
    });
  },

  // get offers
  getAllOffers: (vendorID) => {
    return new Promise(async (resolve, reject) => {
      let offers = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .find({ vendorID: ObjectId(vendorID), offer: true })
        .toArray();
      
      resolve(offers);
    });
  },
  getSingleOffer: (productID) => {
   
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(productID), offer: true })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateOffer: (data) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(data.product),
          },
          {
            $set: {
              price: data.priceAfterDsicound,
              discound: data.discound,
              offer: true,
            },
          }
        );
      resolve({ offerUpdate: true });
    });
  },

  updateOfferStatus: (data) => {
    return new Promise(async (resolve, reject) => {
      let offer = await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(data.product) });
     
      await db
        .get()
        .collection(NAME_COLLECTION.PRODUCT_COLLECTION)
        .updateOne(
          {
            _id: ObjectId(data.product),
          },
          {
            $set: {
              offer: data.val,
              price: offer.actualPrice,
              discound: 0,
            },
          }
        )
        .then((response) => {
         
          resolve({ statusUpdate: true });
        });
    });
  },
  endedOffer: (vendorID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.OFFER_COLLETION)
        .aggregate([
          {
            $match: {
              $and: [{ vendorID: ObjectId(vendorID) }, { status: "Expired" }],
            },
          },
          {
            $lookup: {
              from: NAME_COLLECTION.PRODUCT_COLLECTION,
              localField: "offer.product",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              _id: 1,
              vendorID: 1,
              offer: 1,
              status: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray()
        .then((offers) => {
          resolve(offers);
        });
    });
  },
  deleteOffer: (offerID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(NAME_COLLECTION.OFFER_COLLETION)
        .deleteOne({ _id: ObjectId(offerID) })
        .then(() => resolve({ offerDeleted: true }));
    });
  },
};
