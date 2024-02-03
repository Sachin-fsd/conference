window.onload = home()

async function home() {
    fetch(`http://localhost:8080/posts/${sessionStorage.getItem("profileID")}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token")}`,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {

        document.getElementsByClassName("profile-user-name")[0].innerText = `${res.UserDetails.name}`
        
        document.getElementById("post-wrapper").innerHTML = `
            ${res.posts
              .map((item) => {
                const ID = item._id;
                const formattedTask = item.text.replace(/\n/g, "<br><br>");
                return `<div class="post">
                <div class="info">
                    <div class="user">
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
                  <div class="reaction" onclick = likePost(event) data-id=${item._id} data-author=${item.UserDetails.UserID}>
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
          Authorization: `${localStorage.getItem("token")}`,
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
  