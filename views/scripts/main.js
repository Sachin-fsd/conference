window.onload = function () {
  // home();
  const textarea = document.querySelector("#create-post");
  textarea.addEventListener("input", autoResize, false);

  function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
  
};

window.onbeforeunload = function() {
  // To show the progress bar
document.getElementById("PreLoaderBar").classList.remove("hide");
document.getElementById("PreLoaderBar").classList.add("show");

// To hide the progress bar
// document.getElementById("PreLoaderBar").classList.remove("show");
// document.getElementById("PreLoaderBar").classList.add("hide");

}


function myFunction(id) {
  document.getElementById("myDropdown-" + id).classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

document.getElementById("post_form").addEventListener("submit", (e) => {
  e.preventDefault();
});

const post = document.getElementById("create-post");

const post_submit_btn = document.getElementById("post-submit-btn");

post_submit_btn.setAttribute("style", "opacity:0.8");

post.oninput = () => {
  if (post.value.trim().length) {
    post_submit_btn.setAttribute("style", "opacity:1");
  } else {
    post_submit_btn.setAttribute("style", "opacity:0.8");
  }
};

post_submit_btn.onclick = async () => {
  post.value.trim().length && (await postText(post.value.trim()));
  post.value = null;
};
let UserDetails = getCookie("UserDetails").substring(2);
UserDetails = JSON.parse(UserDetails)

document.getElementById("fileinput").addEventListener("change", function (e) {
  const file = e.target.files[0];

  const fileSize = file.size / 1024 / 1024; // in MB
  if (fileSize > 10) {
    alert("File size exceeds 10MB. Please select a smaller file.");
    return;
  }

  const reader = new FileReader();

  if (file.type.startsWith("image/")) {
    reader.onload = function (e) {
      document.getElementById("preview").style.display = "flex";
      document.getElementById("preview-photo").style.display = "block";
      document.getElementById("preview-photo").src = e.target.result;
      document.getElementById("file-name").style.display = "none";
    };
    reader.readAsDataURL(file);
  } else if (file.type.startsWith("video/")) {
    reader.onload = function (e) {
      var video = document.getElementById("preview-video");
      video.style.display = "block";
      video.src = e.target.result;
      video.controls = true;
      // video.style.maxHeight = "300px";
      // video.style.objectFit = "contain"; // Maintain aspect ratio
      document.getElementById("preview").style.display = "flex";
      document.getElementById("preview-photo").style.display = "none";
      document.getElementById("file-name").style.display = "none";
    };
    reader.readAsDataURL(file);
  } else {
    // For non-image and non-video files, just display the file name
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("preview").style.display = "flex";

    document.getElementById("file-name").style.display = "block";
    document.getElementById("preview-photo").style.display = "none";
  }
});

async function postText(text) {
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
  post_submit_btn.value = "Wait..";
  post_submit_btn.setAttribute("disabled", true);
  post_submit_btn.setAttribute("style", "opacity:0.8");

  // Create a new FormData instance
  const formData = new FormData();
  // Append the text and UserDetails data to the form
  formData.append("text", text);
  formData.append("authorID", UserDetails.UserID);
  // formData.append("UserDetails", UserDetails);
  // Check if an image file is being uploaded
  const file = document.querySelector("#fileinput").files[0];
  if (file) {
    // If a file is being uploaded, append it to the form data
    formData.append("file", file);
  }

  const fetched = await fetch("/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    method: "POST",
    body: formData, // Send the form data
  });
  if (fetched.ok === true) {
    document.getElementById("PreLoaderBar").classList.remove("show");
    document.getElementById("PreLoaderBar").classList.add("hide");
    window.location.reload();
  }else{
    alert("Something went wrong")
  }
}

function likePost(event, postID, authorID) {
  console.log(event, postID, authorID);

  if (event.target.className == "bx bx-like") {
    event.target.className = "bx bxs-like";
    event.target.setAttribute("style","color: #f54a6c")
  } else {
    event.target.className = "bx bx-like";
  }

  fetch(`/like/${postID}/${authorID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

function savePost(event, postID, authorID) {
  console.log(event, postID, authorID);

  if (event.target.className == "bx bx-bookmark") {
    event.target.className = "bx bxs-bookmark";
    event.target.setAttribute("style","color: #6a3bec")
  } else {
    event.target.className = "bx bx-bookmark";
  }

  fetch(`/save/${postID}/${authorID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}


function showDeletePopup(id) {
  // store the id of the post to be deleted
  document.getElementById('yesButton').dataset.postId = id;
  // show the delete confirmation popup
  myPopup.classList.add("show");
}

document.getElementById("yesButton").addEventListener(
  "click",
  function () {
      // get the id of the post to be deleted
      let id = this.dataset.postId;
      deletePost(id);
      myPopup.classList.remove("show");
  }
);

document.getElementById("noButton").addEventListener(
  "click",
  function () {
      myPopup.classList.remove("show");
  }
);

window.addEventListener(
  "click",
  function (event) {
      if (event.target == myPopup) {
          myPopup.classList.remove("show");
      }
  }
);

function deletePost(id) {
  fetch("/delete/" + id, {
      method: "DELETE",
  })
  .then((response) => response.json())
  .then(() => window.location.reload())
  .catch((error) => {
      console.error("Error:", error);
  });
}


function getCookie(name) {
  const cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");

    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }

  return null;
}

// document.onreadystatechange = function () {
//   if (document.readyState === "complete") {
//       console.log(document.readyState);
//       document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");;
//   }
// }