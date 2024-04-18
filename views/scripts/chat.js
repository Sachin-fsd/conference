window.onbeforeunload = () => {
  document.getElementById("PreLoaderBar").classList.remove("hide");
 document.getElementById("PreLoaderBar").classList.add("show");
}

window.onloadstart = () => {
  document.getElementById("PreLoaderBar").classList.remove("hide");
 document.getElementById("PreLoaderBar").classList.add("show");
}


window.onload = function () {
  var textarea = document.querySelector("#create-post");
  textarea.addEventListener("input", autoResize, false);

  function autoResize() {
    console.log("hello")
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
    this.setAttribute("style", "max-height:300px");
  }

  document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");
};

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

function toggleTime(id) {
  var timeElement = document.getElementById(id);
  if (timeElement.style.display === "none") {
      timeElement.style.display = "block";
  } else {
      timeElement.style.display = "none";
  }
}

document.getElementById("chat_form").addEventListener("submit", (e) => {
  e.preventDefault();
});

const receiverID = window.location.pathname.split("/").pop();

const feeds = document.querySelector("#feeds");
feeds.scrollTop = feeds.scrollHeight;
const post_submit_btn = document.getElementById("post-submit-btn");
post_submit_btn.setAttribute("style", "opacity:0.8");
const post = document.getElementById("create-post");

post.oninput = () => {
  if (post.value) {
    post_submit_btn.setAttribute("style", "opacity:1");
  } else {
    post_submit_btn.setAttribute("style", "opacity:0.8");
  }
};

const socket = io();

const parentRoomDiv = document.getElementById("room");
const room = parentRoomDiv.dataset.room;

const chat_receiver = document.getElementById("chat-receiver");
// console.log(parentRoomDiv,room);

socket.emit("join room", room);
// socket.emit("join message room", receiverID);
socket.emit("done reading", { postID: room }, ()=>{
  doneReading(room)
});

window.addEventListener("beforeunload", () => {
  socket.emit("leave room", room);
});

let UserDetailsString = getCookie("UserDetails").substring(2);
let UserDetails = JSON.parse(UserDetailsString);

async function sendChat(){
  let text = post.value.trim();
  if (text.length) {
    let date = new Date();
    let formattedDate = date.toString().substring(0, 24);
    let comment = {
      text,
      postID: room,
      UserDetails,
      receiverID,
      CreatedAt: formattedDate,
    };
    socket.emit("new chat", comment);
    append(comment);
    feeds.scrollTo({
      top: feeds.scrollHeight,
      behavior: "smooth",
    });
    chat_receiver.classList.add("unread");
    postText(text);
    postMessage(room, receiverID);
  }
  post.value = null;
  post.innerText = null;
} 

post_submit_btn.addEventListener("click",sendChat)

// post_submit_btn.onclick = async () => {
//   let text = post.value.trim();
//   if (text.length) {
//     let date = new Date();
//     let formattedDate = date.toString().substring(0, 24);
//     let comment = {
//       text,
//       postID: room,
//       UserDetails,
//       receiverID,
//       CreatedAt: formattedDate,
//     };
//     socket.emit("new chat", comment);
//     append(comment);
//     feeds.scrollTo({
//       top: feeds.scrollHeight,
//       behavior: "smooth",
//     });
//     chat_receiver.classList.add("unread");
//     postText(text);
//     postMessage(room, receiverID);
//   }
//   post.value = null;
// };

socket.on("done reading", () => {
  chat_receiver.classList.remove("unread");
  doneReading(room);
});

socket.on("new chat", (comment) => {
  append(comment);
  feeds.scrollTo({
    top: feeds.scrollHeight,
    behavior: "smooth",
  });
  socket.emit("done reading", comment, () => {
    doneReading(room);
  });
});

function append(comment) {
  let div = document.createElement("div");
  div.classList.add("chat-message");
  if (comment.UserDetails.UserID == UserDetails.UserID) {
    div.classList.add("chat-right");
  } else {
    div.classList.add("chat-left");
  }
  div.innerText = comment.text;
  feeds.append(div);
}

async function postText(text) {
  const obj = { text, room };
  const fetched = await fetch(`/chat`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        localStorage.getItem("token") || sessionStorage.getItem("token") || ""
      }`,
    },
    method: "POST",
    body: JSON.stringify(obj),
  });

  console.log("fetched", fetched);
}

async function postMessage(room, receiverID) {
  const obj = { room, receiverID };
  const fetched = await fetch(`/message`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        localStorage.getItem("token") || sessionStorage.getItem("token") || ""
      }`,
    },
    method: "POST",
    body: JSON.stringify(obj),
  })
    .then((res) => {
      console.log(res);
    })
    .catch((value) => {
      console.log("error", value);
    });
}



async function doneReading(room) {
  const obj = { room };
  const fetched = await fetch(`/message`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        localStorage.getItem("token") || sessionStorage.getItem("token") || ""
      }`,
    },
    method: "PATCH",
    body: JSON.stringify(obj),
  })
    .then((res) => {
      console.log(res);
    })
    .catch((value) => {
      console.log("error", value);
    });
}


document.onreadystatechange = function () {
  if (document.readyState === "complete") {
      console.log(document.readyState);
      document.getElementById("PreLoaderBar").classList.remove("show");
  document.getElementById("PreLoaderBar").classList.add("hide");;
  }
}