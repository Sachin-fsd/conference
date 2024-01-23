window.onload = home();

async function home() {
  fetch("https://azure-tadpole-coat.cyclic.app/note", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${sessionStorage.getItem("token")}`,
    },
    method: "GET",
  })
    .then((res) => res.json())
    .then((res) => {
      document.getElementById("post-wrapper").innerHTML = `
          ${res
            .map((item) => {
              return `<div class="post">
              <div class="info">
                  <div class="user">
                      <div class="profile-pic"> <img src="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg" alt=""></div>
                      <p class="username">${
                        item.UserDetails
                          ? item.UserDetails.UserName
                          : "sachin_channel"
                      }</p>
                  </div>
                  <div class="dropdown">
                    <img src="./images/option.png" class="options" alt="" />
                    <div class="dropdown-content">
                        <p>Repost</p>
                        <p onclick=Delete("${item._id}")>Delete</p>
                        <p>Report</p>
                    </div>
                  </div>
              </div>
              <!-- <img src="https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg" class="post-image" alt=""> -->
              <div class="post-text-div">
                  <p class="text-div">
                      ${item.task}
                  </p>

              </div>
              <div class="post-content">
                  <div class="reaction-wrapper">
                      <img src="./images/Liike.png" class="icon" alt="">
                      <img src="./images/comment.png" class="icon" alt="">
                      <img src="./images/send.png" class="icon" alt="">
                      <img src="./images/save.png" class="save icon" alt="">
                  </div>
                  <p class="likes">1,012 likes</p>
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

// Get all the textarea elements in the document
const textareas = document.querySelectorAll(".post-textarea");

// Define a function to adjust the height of a textarea
function adjustHeight(textarea) {
  // Set the height to auto to reset it
  textarea.style.height = "auto";
  // Set the height to the scroll height plus some padding
  textarea.style.height = textarea.scrollHeight + 10 + "px";
}

// Loop through each textarea element
for (let textarea of textareas) {
  // Call the function initially to set the height
  adjustHeight(textarea);
  // Add an event listener to the input event
  textarea.addEventListener("input", function () {
    // Call the function again when the content changes
    adjustHeight(this);
  });
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
  const obj = { task: text };
  const fetched = await fetch("https://azure-tadpole-coat.cyclic.app/note/post", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${sessionStorage.getItem("token")}`,
    },
    method: "POST",
    body: JSON.stringify(obj),
  });

  if (fetched.ok) {
    alert("Note posted Successfully!");
  }
}

async function Delete(ID) {
  fetch(`https://azure-tadpole-coat.cyclic.app/note/delete/${ID}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${sessionStorage.getItem("token")}`,
    },
    method: "DELETE",
  }).then((res) => {
    if (res.ok) {
      alert("Note Deleted Successfully");
      home();
    }
  });
}
// cyclic = https://azure-tadpole-coat.cyclic.app