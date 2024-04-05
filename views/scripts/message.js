let profiles = document.querySelectorAll(".users-profile");
let userIDs = []
profiles.forEach((value, index, array) => {
    userIDs.push(value.htref)
  console.log(value.href);
});
console.log("profiles", userIDs);

const middle = document.getElementById("middle");
const socket = io();

let UserDetailsString = getCookie("UserDetails").substring(2);
let UserDetails = JSON.parse(UserDetailsString);
const room = UserDetails.UserID;

socket.emit("join message room", room);

window.addEventListener("beforeunload", () => {
  socket.emit("leave room", room);
});

socket.on("new chat", (details) => {
  append(details);
});

function append(details){

    let userID = details.UserDetails.UserID;
    let existingProfile = document.querySelector(`a[href='/chat/${userID}']`);

    if (existingProfile) {
        existingProfile.remove();
    }


    let a = document.createElement("a");
    a.href = `/chat/${userID}`;
    a.classList.add("profile");
    a.classList.add("unread");
    a.classList.add("users-profile");
    a.innerHTML = `<div class="profile-photo">
    <img
      src="https://cdn.pixabay.com/photo/2021/08/25/20/42/field-6574455_1280.jpg"
    />
  </div>
  <div class="handle">
    <h4>${details.UserDetails.UserName}</h4>
    <p class="text-muted">@${details.UserDetails.UserName}</p>
  </div>`
  middle.insertBefore(a,middle.firstChild);
}


function getCookie(name) {
  let cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");

    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }

  return null;
}
