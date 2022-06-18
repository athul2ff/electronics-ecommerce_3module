$("#addProduct").validate({
  rules: {
    ProductName: {
      required: true,
      minlength: 5,
    },
    productBrand: {
      required: true,
    },
    price: {
      required: true,
    },
    stock: {
      required: true,
    },
    description: {
      required: true,
      minlength: 20,
    },
    img1: {
      required: true,
    },
    img2: {
      required: true,
    },
    img3: {
      required: true,
    },
    img4: {
      required: true,
    },
  },
  messages: {
    ProductName: {
      required: "Product Name Mandatory",
      minlength: "Minimum 5 Character length required",
    },
    productBrand: {
      required: "Please Enter Product Brand Name",
    },
    price: {
      required: "Please Enter Product Price",
    },
    stock: {
      required: "Please Enter Product Stock",
    },
    description: {
      required: "Please Enter Product Description",
      minlength: "Enter atleast 20 charactor",
    },
    img1: {
      required: "",
    },
    img2: {
      required: "",
    },
    img3: {
      required: "",
    },
    img4: {
      required: "",
    },
  },
});

function deleteProductfromVendor(proID, vendorID) {
  var result = confirm(`Do you want to delete this product`);
  if (result) {
    fetch(`/vendor/delete-product/${proID}/${vendorID}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.removeProduct) {
          location.reload();
        } else {
          alert("Product Deletion Feild");
        }
      });
    // $.ajax({
    //   url: `/vendor/delete-product/${proID}/${vendorID}`,
    //   success: function (data) {
    //     if (data.removeProduct) {
    //       location.reload();
    //     } else {
    //       alert("Product Deletion Feild");
    //     }
    //   },
    // });
  } else {
    location.reload();
  }
}

function changeProductStatus(id) {
  let value = document.getElementById("productStatus").value;
  fetch(`/vendor/changeProductStatus/${id}/${value}`).then((response) => {
    location.reload();
  });
}

// image view while change event
function viewImage1(event) {
  document.getElementById("imgView1").src = URL.createObjectURL(
    event.target.files[0]
  );
}
function viewImage2(event) {
  document.getElementById("imgView2").src = URL.createObjectURL(
    event.target.files[0]
  );
}
function viewImage3(event) {
  document.getElementById("imgView3").src = URL.createObjectURL(
    event.target.files[0]
  );
}
function viewImage4(event) {
  document.getElementById("imgView4").src = URL.createObjectURL(
    event.target.files[0]
  );
}

let showOrderDetails = (orderID, productID) => {
  $("#orderInfo").modal({
    show: true,
  });
  fetch("/vendor/getOrderInfo", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify({
      order: orderID,
      product: productID,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      document.getElementById(
        "TotalAmount"
      ).innerText = `Total: ${data[0].order.subTotal}`;
      let htmlContent = "";
      for (i = 0; i < data.length; i++) {
        let currentData = data[i];
        htmlContent += `<tr>
        <td scope="row">${currentData.order.product.ProductName}</td>
        <td>${currentData.order.products.quantity}</td>
        <td>₹${currentData.order.product.price}</td>
        <td>${currentData.order.subTotal}</td>
    </tr>`;
        document.getElementById("resultArea").innerHTML = htmlContent;
      }
    });
};
// let EditOrderStatus = (orderID, productID) => {
//   $("#orderUpdate").modal({
//     show: true,
//   });
//   fetch("/vendor/update-order-status", {
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     method: "post",
//     body: JSON.stringify({
//       order: orderID,
//       product: productID,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       document.getElementById(
//         "orderUpdateHead"
//       ).innerHTML = `Order ID : ${data[0]._id}`;

//       console.log(data);

//       let htmlContent = "";
//       let option = "";
//       for (i = 0; i < data.length; i++) {
//         let currentData = data[i];
//         option = selectGenerator(currentData.order.products.deliveryStatus);

//         htmlContent += ` <tr>
//           <td class="align-middle">${currentData.order.product.ProductName}</td>
//           <td scope="row" class="align-middle">${currentData.order.products.quantity}</td>
//           <td class="text-center align-middle">₹${currentData.order.product.price}</td>
//           <td class="align-middle">${option}</td>
//           <td>
//           <button type="submit" class="btn btn-success" onclick="changeStatus('${currentData._id}','${currentData.order.product._id}')">Update</button>
//           </td>
//           </tr>`;

//         document.getElementById("orderUpdateResultArea").innerHTML =
//           htmlContent;
//       }
//     });
// };
// var selectGenerator = (deliveryStatus) => {
//   if (deliveryStatus == "Order Confirmed") {
//     return `<select name="deliveryStatus"  id="deliveryStatus" class="custom-select">
//     <option value="${deliveryStatus}">Order Confirmed</option>
//     <option value="Packed">Packed</option>
//     <option value="Shipped">Shipped</option>
//     <option value="Delivered">Delivered</option>
//     <option value="Canceled">Cancel</option>
//     </select>`;
//   } else if (deliveryStatus == "Packed") {
//     return `<select name="deliveryStatus"  id="deliveryStatus" class="custom-select">
//     <option value="${deliveryStatus}">Packed</option>
//     <option value="Order Confirmed">Order Confirmed</option>
//     <option value="Shipped">Shipped</option>
//     <option value="Delivered">Delivered</option>
//     <option value="Cancel">Cancel</option>
//     </select>`;
//   } else if (deliveryStatus == "Shipped") {
//     return `<select name="deliveryStatus"  id="deliveryStatus" class="custom-select">
//     <option value="${deliveryStatus}">Shipped</option>
//     <option value="Order Confirmed">Order Confirmed</option>
//     <option value="Packed">Packed</option>
//     <option value="Delivered">Delivered</option>
//     <option value="Cancel">Cancel</option>
//     </select>`;
//   } else if (deliveryStatus == "Delivered") {
//     return `<select name="deliveryStatus"  id="deliveryStatus" class="custom-select">
//     <option value="${deliveryStatus}">Delivered</option>
//     <option value="Order Confirmed">Order Confirmed</option>
//     <option value="Packed">Packed</option>
//     <option value="Shipped">Shipped</option>
//     <option value="Cancel">Cancel</option>
//     </select>`;
//   } else if (deliveryStatus == "Cancel") {
//     return `<select name="deliveryStatus"  id="deliveryStatus" class="custom-select">
//     <option value="${deliveryStatus}">Cancel</option>
//     <option value="Order Confirmed">Order Confirmed</option>
//     <option value="Packed">Packed</option>
//     <option value="Shipped">Shipped</option>
//     <option value="Delivered">Delivered</option>
//     </select>`;
//   } else if (deliveryStatus == "Not Confirmed") {
//     return `<select name="deliveryStatus"  id="deliveryStatus" class="custom-select">
//     <option value="${deliveryStatus}">Not Confirmed</option>
//     <option value="Order Confirmed">Order Confirmed</option>
//     </select>`;
//   }
// };

let changeStatus = (orderID, productID, deliveryStatus) => {
  let status = document.getElementById(deliveryStatus).value;
  fetch("/vendor/change-status", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify({
      order: orderID,
      product: productID,
      status: status,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      location.reload();
    });
};

// add offer form submit
$("#addDiscound").submit((event) => {
  event.preventDefault();
  var productID = document.getElementById("productID").value;
  if (productID) {
    $("#addDiscound").validate({
      rules: {
        discound: {
          required: true,
        },
        priceAfterDsicound: {
          required: true,
        },
        productBrand: {
          required: true,
        },
      },
    });
    if ($("#addDiscound").valid()) {
      $.ajax({
        url: "/vendor/add-offer",
        data: $("#addDiscound").serialize(),
        method: "POST",
        success: (response) => {
          if (response.addDiscound) {
            alert("Offer Added");
            location.href = `/vendor/offer-management`;
          } else if (response.updateDiscound) {
            alert("Update Discound");
            location.href = `/vendor/offer-management`;
          }
        },
      });
    }
  }
});

// show product data while choose product name
let getProductData = () => {
  var productBrand = document.getElementById("productBrand");
  var price = document.getElementById("price");
  var productID = document.getElementById("productID").value;
  var vendorID = document.getElementById("vendorID");
  document.getElementById(
    "offerProductImage"
  ).src = `/images/productImage/${productID}1.png`;
  if (productID) {
    $("#offerProductImage").fadeIn("slow");
    fetch(`/vendor/get-product-data/${productID}`)
      .then((response) => response.json())
      .then((data) => {
        productBrand.value = data.productBrand;
        price.value = data.price;
        vendorID.value = data.vendorID;
      });
  } else {
    $("#offerProductImage").fadeOut("slow");
    productBrand.value = null;
    price.value = null;
    vendorID.value = null;
  }
};

// apply discound
let applyDiscound = () => {
  var priceAfterDsicound = document.getElementById("priceAfterDsicound");
  var price = parseInt(document.getElementById("price").value);
  var discound = parseInt(document.getElementById("discound").value);
  priceAfterDsicound.value = price - (price * discound) / 100;
};

// edit offer
$("#editOffer").submit((event) => {
  event.preventDefault();
  $.ajax({
    url: `/vendor/edit-offer`,
    method: "POST",
    data: $("#editOffer").serialize(),
    success: (response) => {
      location.href = `/vendor/offer-management`;
    },
  });
});

// end offer
let endOffer = (productID, value) => {
  fetch("/vendor/offer-status", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ product: productID, val: value }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.statusUpdate) {
        location.reload();
      }
    });
};

// delete offer
let deleteOffer = (offerID, productID, proName) => {
  let result = confirm(`Are you want to delete ${proName}`);
  if (result) {
    fetch(`/vendor/delete-offer/${offerID}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.offerDeleted) {
          location.reload();
        }
      });
  }
};

// add coupoen form submit

$("#addCoupen").submit((event) => {
  event.preventDefault();
  var productID = document.getElementById("productID").value;
  if (productID) {
    $("#addCoupen").validate({
      rules: {
        discound: {
          required: true,
        },
        priceAfterDsicound: {
          required: true,
        },
        productBrand: {
          required: true,
        },
        price: {
          required: true,
        },
        coupenCode: {
          required: true,
        },
      },
    });
    if ($("#addCoupen").valid()) {
      $.ajax({
        url: "/vendor/add-coupen",
        data: $("#addCoupen").serialize(),
        method: "POST",
        success: (response) => {
          if (response.addCoupen) {
            location.href = `/vendor/coupen-management`;
          } else if (response.updateDiscound) {
            alert("Update Discound");
            location.href = `/vendor/coupen-management`;
          }
        },
      });
    }
  }
});
var discoundInp = document.getElementById("discound");
var coupenInput = document.getElementById("coupenCode");
discoundInp.addEventListener("change", (e) => {
  coupenInput.value = null;
});
let generateCoupen = () => {
  var priceAfterDsicound = document.getElementById("priceAfterDsicound");
  var price = parseInt(document.getElementById("price").value);
  var discound = parseInt(document.getElementById("discound").value);
  priceAfterDsicound.value = price - (price * discound) / 100;

  if (discound) {
    fetch("/vendor/coupen-generator", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ discound: discound }),
    })
      .then((response) => response.json())
      .then((data) => {
        coupenInput.value = data;
      });
  } else {
    alert("Please Enter You Discound Rate in Percentage");
  }
};

// edit coupen

$("#editCoupen").submit((event) => {
  event.preventDefault();
  var coupenID = document.getElementById("coupenID").value;
  if (coupenID) {
    $("#editCoupen").validate({
      rules: {
        discound: {
          required: true,
        },
        priceAfterDsicound: {
          required: true,
        },
        productBrand: {
          required: true,
        },
        price: {
          required: true,
        },
        coupenCode: {
          required: true,
        },
      },
    });
    if ($("#editCoupen").valid()) {
      $.ajax({
        url: "/vendor/update-coupen",
        data: $("#editCoupen").serialize(),
        method: "PATCH",
        success: (response) => {
          if (response.editCoupen) {
            location.href = `/vendor/coupen-management`;
          } else {
          }
        },
      });
    }
  }
});

function deleteCoupen(id) {
  fetch(`/vendor/delete-coupon/${id}`, {
    method: "delete",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data);
    });
}
function deleteCoupen(id) {
  let result = confirm("Are You want to delete this coupen");
  if (result) {
    fetch(`/vendor/delete-coupon/${id}`, {
      method: "delete",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.coupenDeleted) {
          location.reload();
        }
      });
  }
}

// data table max date
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();

if (dd < 0) {
  dd = `0${dd}`;
}
if (mm < 0) {
  mm = `0${mm}`;
}

today = year + "-" + month + "-" + day;

document.getElementById("datemax").setAttribute("max", today);
document.getElementById("datemax").setAttribute("value", today);

function dateFilter(userID) {
  var min = document.getElementById("datemin");
  var max = document.getElementById("datemax");
  if (min.value > max.value) {
    alert("From Date must be lesserthan max date");
    min.classList.add("dateError");
    max.classList.add("dateError");
  } else if (min.value <= max.value) {
    fetch(`/vendor/sales-report-within-date-range/${userID}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ mindate: min.value, maxdate: max.value }),
    })
      .then((response) => response.json())
      .then((data) => {
        location.href = "/vendor/";
      });
  }
}

// chart

