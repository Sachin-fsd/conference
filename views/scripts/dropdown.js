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

function myFunction(id) {
  document.getElementById("myDropdown-" + id).classList.toggle("show");
}

function showDeletePopup(id) {
  // store the id of the post to be deleted
  document.getElementById("yesButton").dataset.postId = id;
  // show the delete confirmation popup
  myPopup.classList.add("show");
}

document.getElementById("yesButton").addEventListener("click", function () {
  // get the id of the post to be deleted
  let id = this.dataset.postId;
  deletePost(id);
  myPopup.classList.remove("show");
});

document.getElementById("noButton").addEventListener("click", function () {
  myPopup.classList.remove("show");
});

window.addEventListener("click", function (event) {
  if (event.target == myPopup) {
    myPopup.classList.remove("show");
  }
});

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
