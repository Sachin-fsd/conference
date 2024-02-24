// window.onload = home();
function likePost(event) {
  let postID = event.target.parentElement.dataset.id;
  let authorID = event.target.parentElement.dataset.author;

  let likes =
    event.target.parentElement.parentElement.parentElement.children[1]
      .childNodes[0];
  let count = Number(likes.textContent.split(" ")[0]);
  let liked = event.target.parentElement.dataset.liked;

  if (event.target.classList[0] == "unlike") {
    liked = false;
  } else {
    liked = true;
  }

  if (!liked) {
    event.target.parentElement.innerHTML = `<span class="like">❤️</span>`;
    count++;
    liked = true;
  } else {
    event.target.parentElement.innerHTML = `<span class="unlike">🤍</span>`;
    if (count > 0) {
      count--;
    }
    liked = false;
  }

  likes.textContent = `${count} likes`;
  fetch(`http://localhost:8080/posts/like/${postID}/${authorID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then()
    .catch((err) => console.log(err));
}

function toogleDropdown(event, ID) {
  if (event.target.innerText == "") {
    let dropdownContent = event.target.parentElement.children[1];
    if (
      dropdownContent.style &&
      (!dropdownContent.style.display ||
        dropdownContent.style.display == "none")
    ) {
      dropdownContent.style.display = "block";
    } else {
      dropdownContent.style.display = "none";
    }
  } else if (event.target.innerText == "Delete") {
    fetch(`http://localhost:8080/posts/delete/${ID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        alert("Text Deleted Successfully");
        home();
      }
    });
  }
}

window.onclick = function (event) {
  // console.log(event.target.className);
  if (event.target.className !== "options") {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (let item of dropdowns) {
      item.style.display = "none";
    }
  }
};
