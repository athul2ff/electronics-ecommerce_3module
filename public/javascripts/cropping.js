const crop_btn = document.getElementById("crop");
const imageBox = document.getElementById("image-box");

var input1 = document.getElementById("img1");
var input2 = document.getElementById("img2");
var input3 = document.getElementById("img3");
var input4 = document.getElementById("img4");
var input5 = document.getElementById("profileImage");

input1.addEventListener("change", (e) => {
  if (!e.target.files[0].name.match(/.(png)$/i)) {
    alert("Please Upload .png Image");
    input1.value = null;
  } else {
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
        let fileInputElement = document.getElementById("img1");
        let file = new File([blob], img_data.name, {
          type: "image/*",
          lastModified: new Date().getTime(),
        });
        let container = new DataTransfer();
        container.items.add(file);
        fileInputElement.files = container.files;
        let img = URL.createObjectURL(fileInputElement.files[0]);
        document.getElementById("imgView1").style.display = "block";
        document.getElementById("imgView1").src = img;
      });
      $("#modal").modal("hide");
      // cropper.destroy();
    });
  }
});

input2.addEventListener("change", (e) => {
  if (!e.target.files[0].name.match(/.(png)$/i)) {
    alert("Please Upload .png Image");
    input2.value = null;
  } else {
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
        let fileInputElement = document.getElementById("img2");
        let file = new File([blob], img_data.name, {
          type: "image/*",
          lastModified: new Date().getTime(),
        });
        let container = new DataTransfer();
        container.items.add(file);
        fileInputElement.files = container.files;
        let img = URL.createObjectURL(fileInputElement.files[0]);
        document.getElementById("imgView2").style.display = "block";
        document.getElementById("imgView2").src = img;
      });
      $("#modal").modal("hide");
      // cropper.destroy();
    });
  }
});
input3.addEventListener("change", (e) => {
  if (!e.target.files[0].name.match(/.(png)$/i)) {
    alert("Please Upload .png Image");
    input3.value = null;
  } else {
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
        let fileInputElement = document.getElementById("img3");
        let file = new File([blob], img_data.name, {
          type: "image/*",
          lastModified: new Date().getTime(),
        });
        let container = new DataTransfer();
        container.items.add(file);
        fileInputElement.files = container.files;
        let img = URL.createObjectURL(fileInputElement.files[0]);
        document.getElementById("imgView3").style.display = "block";
        document.getElementById("imgView3").src = img;
      });
      $("#modal").modal("hide");
      // cropper.destroy();
    });
  }
});
input4.addEventListener("change", (e) => {
  if (!e.target.files[0].name.match(/.(png)$/i)) {
    alert("Please Upload .png Image");
    input4.value = null;
  } else {
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
        let fileInputElement = document.getElementById("img4");
        let file = new File([blob], img_data.name, {
          type: "image/*",
          lastModified: new Date().getTime(),
        });
        let container = new DataTransfer();
        container.items.add(file);
        fileInputElement.files = container.files;
        let img = URL.createObjectURL(fileInputElement.files[0]);
        document.getElementById("imgView4").style.display = "block";
        document.getElementById("imgView4").src = img;
      });
      $("#modal").modal("hide");
      // cropper.destroy();
    });
  }
});
input5.addEventListener("change", (e) => {
  if (!e.target.files[0].name.match(/.(png)$/i)) {
    alert("Please Upload .png Image");
    input5.value = null;
  } else {
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
  }
});
