window.onload = function () {
  var textarea = document.querySelector("#create-post");
  textarea.addEventListener("input", autoResize, false);

  function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
  
};
window.onbeforeunload = function() {
document.getElementById("PreLoaderBar").classList.remove("hide");
document.getElementById("PreLoaderBar").classList.add("show");
}

function getCookie(name) {
  let cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");

    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }

  // Return null if not found
  return null;
}

document.getElementById("post_form").addEventListener("submit", (e) => {
  e.preventDefault();
});

const post = document.getElementById("create-post");

const post_submit_btn = document.getElementById("post-submit-btn");
const postID = post_submit_btn.dataset.postid
const authorID = post_submit_btn.dataset.authorid
// console.log(authorID,post_submit_btn)

const feeds = document.querySelector("#feeds");

post_submit_btn.setAttribute("style", "opacity:0.8");

post.oninput = () => {
  if (post.value) {
    post_submit_btn.setAttribute("style", "opacity:1");
  } else {
    post_submit_btn.setAttribute("style", "opacity:0.8");
  }
};

const socket = io();

socket.emit("join room", postID);

window.addEventListener("beforeunload", () => {
  socket.emit("leave room", postID);
});

let UserDetailsString = getCookie("UserDetails").substring(2);
let UserDetails = JSON.parse(UserDetailsString);
// console.log(UserDetails);

post_submit_btn.onclick = async () => {
  let text = post.value.trim();
  if (text.length) {
    let date = new Date();
    let formattedDate = date.toString().substring(0, 24);
    socket.emit("new comment", {
      text,
      postID,
      UserDetails,
      CreatedAt: formattedDate,
    });
    postText(text);
  }
  post.value = null;
};

function append(comment) {
  let div = document.createElement("div");
  div.classList.add("feed");
  div.innerHTML = `
    <div class="head">
    <div class="user">
      <div class="profile-photo">
        <img
          src="${UserDetails.UserDp}"
          onerror="this.src='https://cdn.pixabay.com/photo/2016/11/07/09/07/river-1805188_640.jpg'"
        />
      </div>
      <div class="info">
        <h3>${comment.UserDetails.UserName}</h3>
        <small>${comment.CreatedAt}</small>
      </div>
    </div>
    <span class="edit">
      <i class="uil uil-ellipsis-h"></i>
    </span>
  </div>
  <div class="photo">
    <p class="post-text">${comment.text}</p>
  </div>`;

  feeds.insertBefore(div, feeds.firstChild);
}

socket.on("new comment", (comment) => {
  // console.log(comment);
  append(comment);
});

async function postText(text) {
  const obj = { text,authorID };
  const fetched = await fetch(`/comment/${postID}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") ||sessionStorage.getItem("token") ||""}`,
    },
    method: "POST",
    body: JSON.stringify(obj),
  });
}
