$(document).ready(function () {
  $("#searchCategory").on("change", function () {
    var value = $(this).val().toLowerCase();
    $(".products").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

var addToCart = (id, userID) => {
  if (userID) {
    var count = document.getElementById("cart-count");
    fetch(`/add-to-cart/${id}`, {
      method: "get",
    }).then((response) => {
      if (response.status) {
        newCount = parseInt(count.innerText) + 1;
        count.innerText = newCount;
      } else {
        location.href = "/login";
      }
    });
  } else {
    alert(`Please Login First`);
    location.href = "/login";
  }
};

let changeQuantity = (cartID, proID, userID, count) => {
  let quantity = document.getElementById(proID).innerText;
  fetch(`/change-product-quantity`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      user: userID,
      cart: cartID,
      product: proID,
      count: count,
      quantity: quantity,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.removeProduct) {
        alert("Product Removed from cart");
        location.reload();
      } else if (data.cartisEmpty) {
        alert("cart is Empty");
        location.href("/");
      } else {
        document.getElementById(proID).innerText = parseInt(quantity) + count;
        document.getElementById("totalAmount").innerText = `₹ ${data.total}`;
        document.getElementById(
          `subTotal${proID}`
        ).innerText = `₹ ${data.subTotal}`;
      }
    });
};

let deleteProductFromCart = (cartID, proID, proName) => {
  let result = confirm(`Are you want to delete ${proName}`);
  if (result) {
    fetch(`/delete-product-from-cart/${cartID}/${proID}`).then((response) =>
      response.json().then((data) => {
        if (data.removerCart) {
          location.reload();
        }
      })
    );
  }
};

$(document).ready(function () {
  $("#searchData").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(".products").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

// add new address checkout page
$(function () {
  $(".storedAddress").click(function () {
    $(".shiping-details").fadeOut();
  });
  $("#addNewAddress").click(function () {
    if ($("#addNewAddress").is(":checked")) {
      $(".shiping-details").fadeIn();
    }
  });
});

// add product form validation
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

// add new address

$("#placeOrder").submit(function (e) {
  e.preventDefault();
  $("#placeOrder").validate();
  if ($("#placeOrder").valid()) {
    $.ajax({
      url: `/place-order/`,
      method: "POST",
      data: $("#placeOrder").serialize(),
      success: function (response) {
        var orderID = response.orderID;
        if (response.codSuccess) {
          location.href = "/thanks-for-shpping";
        } else if (response.razorpay) {
          console.log(response.order);
          razorpayPayment(response.order);
        } else if (response.paypal) {
          $("#paypal-button").show();
          var order = parseInt(response.TotalAmount) / 74;
          paypal_sdk
            .Buttons({
              createOrder: function (data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: `${order}`,
                      },
                    },
                  ],
                });
              },

              onApprove: function (data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function (details) {
                  fetch(`/orderStatusUpdate/${orderID}`)
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.orderStatusUpdate) {
                        location.href = "/thanks-for-shpping";
                      }
                    });
                  // This function shows a transaction success message to your buyer.
                });
              },

              onCancel: function (data) {
                // Show a cancel page, or return to cart
                console.log(data);
                alert("payment canelled");
                alert("Please Repayment");
                location.href = "/my-orders";
              },
              onError: function (err) {
                alert("Payment Please Try Again");
                // For example, redirect to a specific error page
                alert("Error");
                location.href = "/my-orders";
              },
            })
            .render("#paypal-button");
        }
      },
    });
  }
});

$("#placeOrder").validate({
  rules: {
    FullName: {
      required: true,
      minlength: 3,
    },
    email: {
      required: true,
      email: true,
    },
    mobile: {
      required: true,
      minlength: 10,
      maxlength: 10,
    },
    place: {
      required: true,
    },
    post: {
      required: true,
    },
    PIN: {
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    district: {
      required: true,
    },
    state: {
      required: true,
    },
  },
  messages: {
    FullName: {
      required: "Please Enter Your Name",
    },
    email: {
      required: "Please Enter Your Email",
    },
    mobile: {
      required: "Enter Your Mobile Number",
    },
    place: {
      required: "Enter Your Place",
    },
    post: {
      required: "Enter Your post office",
    },
    PIN: {
      required: "Enter Your PIN Code",
    },
    district: {
      required: "Enter Your District",
    },
    state: {
      required: "Enter Your State",
    },
  },
});

function razorpayPayment(order) {
  var options = {
    key: "rzp_test_Yo29tSbSVoyDWC", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Acme Corp",
    description: "Test Transaction",
    image: "/images/admin/razorpay.png",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
      // alert(response.razorpay_signature);

      varifyPayment(response, order);
    },
    prefill: {
      name: "Gaurav Kumar",
      email: "gaurav.kumar@example.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed", function (response) {
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
  });
  rzp1.open();
}
function varifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },
    method: "POST",
    success: (response) => {
      if (response.paymentStatus) {
        location.href = "/thanks-for-shpping";
      } else {
        alert("Payment Failed");
        location.href = "/my-orders";
      }
    },
  });
}

// let repayment = (orderID) => {

//   $('#payMentMethod').modal("show")
// };
function rePayment(orderID) {
  $("#rePaymentModala").modal({ show: true });
  $("#rePyamentBtn").click(function () {
    var value = $("input:radio[name=payment]:checked").val();
    if (value == "cod") {
      fetch(`/orderStatusUpdate/${orderID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.orderStatusUpdate) {
            location.href = "/thanks-for-shpping";
          }
        });
    } else if (value == "razorpy") {
      fetch(`/get-order-details/${orderID}`)
        .then((response) => response.json())
        .then((data) => {
          razorpayPayment(data.order);
        });
    } else if (value == "paypal") {
      fetch(`/repayment-payapal/${orderID}`)
        .then((response) => response.json())
        .then((data) => {
          order = parseInt(data.totalAmount) / 70;
          // order = order.toFixed(0);
          paypal_sdk
            .Buttons({
              createOrder: function (data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: `${order}`,
                      },
                    },
                  ],
                });
              },

              onApprove: function (data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function (details) {
                  fetch(`/orderStatusUpdate/${orderID}`)
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.orderStatusUpdate) {
                        location.href = "/thanks-for-shpping";
                      }
                    });
                  // This function shows a transaction success message to your buyer.
                });
              },

              onCancel: function (data) {
                // Show a cancel page, or return to cart
                console.log(data);
                alert("payment canelled");
                window.location.href = "/my-orders";
              },
              onError: function (err) {
                alert("Payment Please Try Again");
                // For example, redirect to a specific error page
                alert("Error");
                window.location.href = "/my-orders";
              },
            })
            .render("#paypal-button");
        });
    }
  });
}

let EditAddress = (id, user) => {
  let result = confirm(`Are you want to Editi ${user} Addres`);
  if (result) {
    fetch(`/edit-address/${id}/${user}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          $("#editAdress").modal("show");
          document.getElementById("ID").value = data[0]._id;
          document.getElementById("previsouName").value = data[0].address.name;
          document.getElementById("FullName").value = data[0].address.name;
          document.getElementById("email").value = data[0].address.email;
          document.getElementById("mobile").value = data[0].address.mobile;
          document.getElementById("place").value = data[0].address.place;
          document.getElementById("post").value = data[0].address.post;
          document.getElementById("PIN").value = data[0].address.PIN;
          document.getElementById("district").value = data[0].address.district;
          document.getElementById("state").value = data[0].address.state;
        }
      });
  }
};

// delete shipping address
function deleteAddress(id, username) {
  var result = confirm(`Do you Want to delete  ${username}'s address`);
  if (result) {
    fetch(`/delete-address/${id}/${username}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        location.reload();
      });
  }
}

// coupen code on change
discoundInput = document.querySelector("#coupenCode");
discoundInput.addEventListener("change", () => {
  let totalAmount = document.getElementById("totalAmountHidden").value;
  document.getElementById("discoundAmount").innerText = null;
  document.getElementById("totalAmount").innerHTML = totalAmount;
});

// apply coupen
let applyCoupen = (userID) => {
  var coupen = document.getElementById("coupenCode").value;
  fetch(`/apply-coupen/${coupen}/${userID}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      if (data.couponAlreadyUser) {
        alert("Coupon Already Use Please Use new Coupon");
        document.getElementById("coupenCode").classList.add("discoundinValid");
        document.getElementById("coupenCode").value = null;
      } else if (data.type == `product`) {
        let subTotal = document.getElementById(data.productID).innerHTML;
        document.getElementById("couponID").value = data._id;
        if (subTotal) {
          let discoundAmount = document.getElementById("discoundAmount").value;
          let totalAmount = document.getElementById("totalAmountHidden").value;
          console.log(totalAmount);
          let discound =
            (parseFloat(subTotal) * parseFloat(data.discound)) / 100;
          discoundAmount = discound;
          console.log(discound);
          let result = parseFloat(totalAmount) - parseFloat(discound);
          document.getElementById("discoundAmount").value = discound;
          document.getElementById("totalAmount").value = result;
          console.log(result);
          document.getElementById("coupenCode").classList.add("discoundValid");
          $("#discoundDiv").fadeIn();
        } else {
          alert("Enter Valid Coupon Code");
          document.querySelector("#coupenCode").value = null;
        }
        // alert(result);
      } else if (data.type == "global") {
        let discoundAmount = document.getElementById("discoundAmount").value;
        let totalAmount = document.getElementById("totalAmountHidden").value;
        let discound =
          (parseFloat(totalAmount) * parseFloat(data.discound)) / 100;
        discoundAmount = discound;
        let result = parseFloat(totalAmount) - parseFloat(discound);
        document.getElementById("discoundAmount").value = discound;
        document.getElementById("totalAmount").value = result;
        document.getElementById("coupenCode").classList.add("discoundValid");
        $("#discoundDiv").fadeIn();
        document.getElementById("couponID").value = data._id;
      } else {
        alert("Please Enter Valid Coupen");
        document.getElementById("coupenCode").classList.add("discoundinValid");
      }
    });
};

// user profile
const crop_btn = document.getElementById("crop");
const imageBox = document.getElementById("image-box");
var input5 = document.getElementById("profileImage");

input5.addEventListener("change", (e) => {
  const img_data = e.target.files[0];
  //   const img_data = input1.files[0];
  const url = URL.createObjectURL(img_data);
  imageBox.innerHTML = `<img src="${url}" id="image" style="width:100%;">`;

  const image = document.getElementById("image");
  $("#modal").modal("show");
  const cropper = new Cropper(image, {
    aspectRatio: 1,
    viewMode: 1,
    scalable: true,
    zoomable: true,
    movable: true,
    preview: ".preview",
    minCropBoxWidth: 150,
    minCropBoxHeight: 150,
  });
  crop_btn.addEventListener("click", () => {
    cropper.getCroppedCanvas().toBlob((blob) => {
      let fileInputElement = document.getElementById("profileImage");
      let file = new File([blob], img_data.name, {
        type: "image/*",
        lastModified: new Date().getTime(),
      });
      let container = new DataTransfer();
      container.items.add(file);
      fileInputElement.files = container.files;
      let img = URL.createObjectURL(fileInputElement.files[0]);
      document.getElementById("profiel-view").style.display = "block";
      document.getElementById("profiel-view").src = img;
    });
    $("#modal").modal("hide");
    // cropper.destroy();
  });
});

let submitDate = () => {
  alert("sdf");
};
