document.getElementById("message").addEventListener("click", () => {
  let msgBtn = document.getElementById("message");
  msgBtn.setAttribute("disabled", true);
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");

  console.log("message clicked");
  const profileID = window.location.pathname.split("/").pop();
  fetch(`/chat/${profileID}`).then((res) => {
    if (res.ok) {
      window.location.href = res.url;
      msgBtn.removeAttribute("disabled");
    } else {
      console.log(res);
    }
  });
});

function profileEdit(ID) {
  window.location.href = `/profileEdit/${ID}`;
}

async function follow(ID) {
  let follow = document.getElementById("follow");
  follow.setAttribute("disabled", true);
  let followerCount = Number(document.getElementById("followers").innerText);
  const fetched = await fetch(`/follow/${ID}`, {
    method: "POST",
  });
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
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
  let feeds = document.getElementById("feeds");
  fetch(`/followers/${ID}`)
    .then((res) => res.json())
    .then((data) => {
      // console.log("data", data);
      feeds.innerHTML = data
        .map((user) => {
          return `<div class="feed">
      <div class="head"><a href="/${user.ID}">
          <div class="user">
            <div class="profile-photo">
              <img
                src="${user.dp}"
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
        
      </div>
    </div>`;
        })
        .join("");
    });
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
}
function getFollowing(ID) {
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
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
                src="${user.dp}"
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
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
}

window.onload = () => {
  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
};

window.onbeforeunload = () => {
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
};
