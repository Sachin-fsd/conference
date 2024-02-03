window.onload = function () {
  home();
  var textarea = document.querySelector(".comment-box");
  textarea.addEventListener("input", autoResize, false);

  function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }
};

let dp = [
  "https://cdn.pixabay.com/photo/2023/12/12/16/15/winter-8445565_640.jpg",
  "https://cdn.pixabay.com/photo/2024/01/15/19/40/animal-8510775_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/01/18/17/37/stalk-8517287_640.jpg",
  "https://cdn.pixabay.com/photo/2023/07/04/08/31/cats-8105667_640.jpg",
];

async function home() {
  fetch("http://localhost:8080/posts/", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("token")}`,
    },
    method: "GET",
  })
    .then((res) => res.json())
    .then((res) => {
      document.getElementsByClassName("status-wrapper")[0].innerHTML = `
      
        ${res.Users.map((user) => {
          return `
          
          <div class="status-card" onclick=profile("${user._id}")>
          <div class="profile-pic">
            <img
              src="${dp[Math.floor(Math.random()*dp.length)]}"
              alt=""
            />
          </div>
          <p class="username">${user.name}</p>
        </div>
          `;
        }).join("")}
      
      `;

      document.getElementById("post-wrapper").innerHTML = `
          ${res.posts
            .map((item) => {
              const ID = item._id;
              const formattedTask = item.text.replace(/\n/g, "<br>");
              return `<div class="post">
              <div class="info">
                  <div class="user" onclick=profile("${
                    item.UserDetails.UserID
                  }")>
                      <div class="profile-pic"> <img src="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg" alt=""></div>
                      <p class="username">${
                        item.UserDetails?.UserName || "sachin_singh_channel"
                      }</p>
                  </div>
                  <div class="dropdown" onclick=toogleDropdown(event,"${ID}")>
                    <img src="./images/option.png" class="options" alt="" />
                    <div class="dropdown-content" >
                        <p>Delete</p>

                    </div>
                  </div>
              </div>
              <!-- <img src="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg" class="post-image" alt=""> -->
              <div class="post-text-div">
                  <p class="text-div">
                      ${formattedTask}
                  </p>

              </div>
              <div class="post-content">
              <div class="reaction-wrapper">
                <div class="reaction" onclick = likePost(event) data-id=${
                  item._id
                } data-author=${item.UserDetails.UserID}>
                ${
                  item.liked
                    ? `<span class="like">❤️</span>`
                    : `<span class="unlike">🤍</span>`
                }
                </div>
                
              </div>
                  <p class="likes">${item.likeCount} likes</p>
                  <p class="description"><span>username</span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui, enim.</p>
                  <p class="post-time">${item.CreatedAt}</p>
              </div>
              <div class="comment-wrapper">
                  <img src="./images/smile.png" class="icon" alt="">
                  <input type="text" class="comment-box" placeholder="Add a comment">
                  <button class="comment-btn">post</button>
              </div>
          </div>`;
            })
            .join("")}
      
          `;
    })
    .catch((err) => console.log(err));
}

const post = document.getElementById("create-post");

const post_submit_btn = document.getElementById("post-submit-btn");

post.oninput = () => {
  if (post.value) {
    post_submit_btn.classList.add("enabled");
  } else {
    post_submit_btn.classList.remove("enabled");
  }
};

post_submit_btn.onclick = async () => {
  post.value && (await postText(post.value));
  post.value = null;
  post_submit_btn.classList.remove("enabled");

  await home();
};

async function postText(text) {
  const obj = { text };
  const fetched = await fetch("http://localhost:8080/posts/post", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("token")}`,
    },
    method: "POST",
    body: JSON.stringify(obj),
  });

  if (fetched.ok == false) {
    alert("Some error occured!");
  }
}

// like js here

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
      Authorization: `${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

// cyclic = https://azure-tadpole-coat.cyclic.app

// dropdown is here
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
        Authorization: `${localStorage.getItem("token")}`,
      },
      method: "DELETE",
    }).then((res) => {
      if (res.ok == false) {
        alert("Text Deletign Failed");
      }
      home();
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

// profile is here

function profile(ID) {
  sessionStorage.setItem("profileID", ID);
  window.location.href = "profile.html";
}
