document.getElementById("message").addEventListener("click", () => {
  console.log("message clicked");
  const profileID = window.location.pathname.split("/").pop();
  fetch(`/chat/${profileID}`).then((res) => {
    if (res.ok) {
      window.location.href = res.url;
    } else {
      console.log(res);
    }
  });
});

function likePost(event, postID, authorID) {
  if (event.target.className == "bx bx-like") {
    event.target.className = "bx bxs-like";
    event.target.setAttribute("style", "color: #f54a6c");
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

function profileEdit(ID) {
  window.location.href = `/profileEdit/${ID}`;
}

function deletePost(id) {
  fetch("/delete/" + id, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => window.location.reload())
    .catch((error) => {
      console.error("Error:", error);
    });
}

function myFunction(id) {
  document.getElementById("myDropdown-" + id).classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

async function follow(ID) {
  let follow = document.getElementById("follow");
  follow.setAttribute("disabled", true);
  let followerCount = Number(document.getElementById("followers").innerText);
  const fetched = await fetch(`/follow/${ID}`);
  if (fetched.ok) {
    if (follow.innerText == "Following") {
      document.getElementById("follow").innerText = "Follow";
      document.getElementById("followers").innerText = Number(
        followerCount - 1
      );
    } else {
      document.getElementById("follow").innerText = "Following";
      document.getElementById("followers").innerText = Number(
        followerCount + 1
      );
    }
  }
  follow.removeAttribute("disabled");
}

function getFollowers(ID) {
  let feeds = document.getElementById("feeds");
  fetch(`/followers/${ID}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("data",data);
      feeds.innerHTML = data
        .map((user) => {
          return `<div class="feed">
      <div class="head"><a href="/${user.ID}">
          <div class="user">
            <div class="profile-photo">
              <img
                src="https://cdn.pixabay.com/photo/2024/01/18/00/36/boat-8515980_640.jpg"
              />
            </div>
            <div class="info">
              <h3>${user.name}</h3>
            </div>
          </div>
        </a>
        <span class="edit">
          <i class="uil uil-ellipsis-h"></i>
        </span>
      </div>

      <div class="caption">
        <p><b>SOET</b>
          | B.tech CSE FSD | Section 1 | Group 1 |
          <b>Roll No.</b>
          2301350008
        </p>
      </div>
    </div>`;
        })
        .join("");
    });
}
function getFollowing(ID) {
  let feeds = document.getElementById("feeds");
  fetch(`/following/${ID}`)
    .then((res) => res.json())
    .then((data) => {
      feeds.innerHTML = data
        .map((user) => {
          return `<div class="feed">
      <div class="head"><a href="/${user.ID}">
          <div class="user">
            <div class="profile-photo">
              <img
                src="https://cdn.pixabay.com/photo/2024/01/18/00/36/boat-8515980_640.jpg"
              />
            </div>
            <div class="info">
              <h3>${user.name}</h3>
            </div>
          </div>
        </a>
        <span class="edit">
          <i class="uil uil-ellipsis-h"></i>
        </span>
      </div>

      <div class="caption">
        <p><b>SOET</b>
          | B.tech CSE FSD | Section 1 | Group 1 |
          <b>Roll No.</b>
          2301350008
        </p>
      </div>
    </div>`;
        })
        .join("");
    });
}

