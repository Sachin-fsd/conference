window.onload = function () {
  const textarea = document.querySelector("#create-post");
  textarea.addEventListener("input", autoResize, false);

  function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");

};

window.onbeforeunload = function () {
  // To show the progress bar
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");

  // To hide the progress bar
  // document.getElementById("PreLoaderBar").classList.remove("show");
  // document.getElementById("PreLoaderBar").classList.add("hide");

}

document.getElementById("post_form").addEventListener("submit", (e) => {
  e.preventDefault();
});

const loader = document.getElementById("loader")
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

const UserID = document.getElementById("root").dataset.id;

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
  formData.append("authorID", UserID);
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
  } else {
    alert("Something went wrong")
  }
}
document.getElementById("PreLoaderBar").classList.add("hide");
let page = 1;
let isLoading = false;

window.onscroll = async function(ev) {
  console.log("window.innerHeight:",window.innerHeight,"window.scrollY:",window.scrollY,"document.body.offsetHeight:",document.body.offsetHeight)

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      document.body.offsetHeight = window.innerHeight + window.scrollY
        // you're at the bottom of the page
        console.log("window.innerHeight:",window.innerHeight,"window.scrollY:",window.scrollY,"document.body.offsetHeight:",document.body.offsetHeight)
        if (!isLoading) {
            isLoading = true;
            page++;
            console.log("bottom", page);
            await fetchMoreData(page);
        }
    }
};

let feeds = document.getElementById("feeds");

async function fetchMoreData(page) {
  fetch(`/?page=${page}`)
    .then(response => response.json())
    .then(posts => {
      console.log(posts,"1")
      posts = posts.posts
      console.log(posts,"2")

      // for(let post of posts){

      // }
      posts.forEach((post) => {
        let div = document.createElement("div");
        div.classList.add("feed");
        div.innerHTML = ` 
            <div class="head">
              <a href="/${post.UserDetails.UserID}}"><div class="user">
                  <div class="profile-photo">
                    <img src="${post.UserDetails.UserDp}" onerror="this.src='https://source.unsplash.com/random?user={{this.authorID}}'"/>
                  </div>
                  <div class="info">
                    <h3>${post.UserDetails.UserName}</h3>
                    <small>${post.CreatedAt}</small>
                  </div>
                </div></a>

              <span class="dropdown edit">
                <i onclick="myFunction('${post._id}')" class="dropbtn uil uil-ellipsis-h"></i>
                <div id="myDropdown-${post._id}" class="dropdown-content">
                ${post.UserDetails.UserID==UserID && `<a href="#" onclick="showDeletePopup('${post._id}')">Delete</a>`}
                    <a href="/comment/${this._id}">Comment</a>
                    <a href="/${post.authorID}">Profile</a>
                </div>
              </span>

            </div>
            <a href="/comment/${post._id}" >
              <div class="photo">
                <p class="post-text">${post.text}</p>
                ${post.photo===undefined?``:`<img src="${post?.photo}" onerror="this.style.display='none'"
                />`}
                ${post.video===undefined?``:`<video width="" height="" controls src="${post?.video}" onerror="this.style.display='none'" class="preview-video" style="overflow: auto;width: 100%;object-fit: cover;">
                  
                </video>`}
                ${post.pdf===undefined?``:`
                <div
                id="pdf-loader"
                style="width:100%; height:300px; display: flex; align-items: center; justify-content: center;"
              >
                <p>Loading PDF...</p>
              </div>
              <iframe
                id="pdf-preview"
                src="http://docs.google.com/gview?url=${post?.pdf}&embedded=true"
                style="width:100%; height:300px; display: none;"
                frameborder="0"
                onload="document.getElementById('pdf-loader').style.display='none'; this.style.display='block';"
              ></iframe>
              <a href="${post?.pdf}" download>Download PDF</a>
                `}
              </div>
            </a>

            <div class="action-buttons">
              <div class="interaction-buttons">
                <span class="like-post" >
                ${post.liked===1 ? `<i onclick="likePost(event,'${post._id}','${post.UserDetails.UserID}')" ondblclick="likePost(event,'${post._id}','${post.UserDetails.UserID}')" class='bx bxs-like' style="color: #f54a6c;"></i>`
                 : `<i onclick="likePost(event,'${post._id}','${post.UserDetails.UserID}')" ondblclick="likePost(event,'${post._id}','${post.UserDetails.UserID}')" class='bx bx-like' style="color: #f54a6c"></i>`}
                </span>
                <span><a href="/comment/${post._id}}"><i
                      class="uil uil-comment-dots" style="color: rgb(51, 100, 51);"
                    ></i></a></span>
                <span class="dropdown edit">
                  <i onclick="shareFunction('${post._id}')" class="dropbtn uil uil-share-alt" style="color: rgb(104, 49, 192);"></i>
                  <div id="shareDropdown-${post._id}" class="dropdown-content-share">
                    <a onclick="sharePost('${post._id}','linkedin')" target="_blank"><i class='bx bxl-linkedin-square' style="border-radius: 50%;"></i></a>
                    <a onclick="sharePost('${post._id}','twitter')" target="_blank"><i class='bx bxl-twitter' style="border-radius: 50%;"></i></a>
                    <a onclick="sharePost('${post._id}','whatsapp')" target="_blank"><i class='bx bxl-whatsapp-square' style="border-radius: 50%;"></i></a>
                    <a onclick="sharePost('${post._id}','facebook')" target="_blank"><i class='bx bxl-facebook-circle'></i></a>
                    <a onclick="sharePost('${post._id}','instagram')" target="_blank"><i class='bx bxl-instagram-alt' style="border-radius: 50%;"></i></a>
                </div>
                </span>
              </div>
              <div class="bookmark" onclick="savePost(event,'${post._id}','${post.UserDetails.UserID}')">
                <span>
                ${post.saved===1 ? `<i class='bx bxs-bookmark' style="color: #6a3bec;"></i>`:`<i class='bx bx-bookmark' style="color: #6a3bec"></i>`}
                </span>
              </div>
            </div>
            <div class="caption">
              
            </div>
            <a href="/comment/${post._id}"><div
                class="comments text-muted"
              >View all comments</div></a>
          `;
        loader.style.display = "none";
        feeds.append(div);
        isLoading = false;
      });

    })
    .catch(error => {
      console.error('Error:', error);
    });
    loader.style.display = "block"

}
