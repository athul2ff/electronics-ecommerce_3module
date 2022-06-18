function deleteCategory(id) {
  var result = confirm(`Do you want to delete this category ?`);
  if (result) {
    fetch(`/admin/deleteCategoryImage/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.categoryRemove) {
          location.reload();
        }
      });
  }
}

// view Image
function viewImage(event) {
  document.getElementById("imgView").src = URL.createObjectURL(
    event.target.files[0]
  );
}

// block user
function banUser(id, value, user) {
  var result = confirm(`Do you want to ${value} ${user}`);
  if (result) {
    fetch(`/admin/block-user/${id}/${value}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.block) {
          location.reload();
        } else {
          alert("An Error Occured");
        }
      });
  }
}

// blcok vendor
let banVendor = (id, value, user) => {
  var result = confirm(`Do you want to ${value} ${user}`);
  if (result) {
    fetch(`/admin/block-vendor/${id}/${value}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.vendorStatusChange) {
          location.reload();
        } else {
          alert("An Error Occured");
        }
      });
  }
};

// couopen mangaement
// show product data while choose product name
// let getCategoryData = () => {
//   var categoryID = document.getElementById("categoryID").value;
//   document.getElementById(
//     "categoryImageCoupen"
//   ).src = `/images/categoryImages/${categoryID}.png`;
//   if (categoryID) {
//     $("#categoryImageCoupen").fadeIn("slow");
//   } else {
//     $("#categoryImageCoupen").fadeOut("slow");
//     productBrand.value = null;
//     price.value = null;
//     vendorID.value = null;
//   }
// };

// apply discound
var discoundInp = document.getElementById("discound");
var coupenInput = document.getElementById("coupenCode");
discoundInp.addEventListener("change", (e) => {
  coupenInput.value = null;
});
let applyDiscound = () => {
  var discound = document.getElementById("discound").value;

  if (discound) {
    fetch("/admin/coupen-generator", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ discound: discound }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data[0]);
        coupenInput.value = data[0];
      });
  } else {
    alert("Please Enter You Discound Rate in Percentage");
  }
};

// add offer form submit
$("#addCoupen").submit((event) => {
  event.preventDefault();

  $("#addCoupen").validate({
    rules: {
      discound: {
        required: true,
      },
      coupenCode: {
        required: true,
      },
    },
  });
  if ($("#addCoupen").valid()) {
    $.ajax({
      url: "/admin/add-coupen",
      data: $("#addCoupen").serialize(),
      method: "POST",
      success: (response) => {
        if (response.coupenAddedd) {
          location.href = `/admin/coupen-management`;
        }
      },
    });
  }
});

// edit coupen
$("#EditCoupen").submit((event) => {
  event.preventDefault();
  $.ajax({
    url: `/admin/edit-coupen`,
    method: "POST",
    data: $("#EditCoupen").serialize(),
    success: (response) => {
      if (response.CoupenUpdated) {
        alert("Copen Updated");
        location.href = `/admin/coupen-management`;
      }
    },
  });
});
// delete offer

function deleteOffer(id) {
  let result = confirm("Are You want to delete this coupen");
  if (result) {
    fetch(`/admin/delete-coupen/${id}`, {
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

// data table date filtering

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
    fetch(`/admin/sales-report-within-date-range/${userID}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ mindate: min.value, maxdate: max.value }),
    })
      .then((response) => response.json())
      .then((data) => {
        location.href = "/admin/";
      });
  }
}
