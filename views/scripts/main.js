window.onload = function () {
  // home();
  var textarea = document.querySelector("#create-post");
  textarea.addEventListener("input", autoResize, false);

  function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }
};

function myFunction(id) {
  document.getElementById("myDropdown-" + id).classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

document.getElementById("post_form").addEventListener("submit", (e) => {
  e.preventDefault();
});

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

let UserDetails = getCookie("UserDetails").substring(2);

async function postText(text) {
  post_submit_btn.value = "Wait..";
  post_submit_btn.setAttribute("disabled", true);
  post_submit_btn.setAttribute("style", "opacity:0.8");

  // Create a new FormData instance
  const formData = new FormData();

  // Append the text and UserDetails data to the form
  formData.append("text", text);
  formData.append("UserDetails", UserDetails);

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
  console.log(fetched);
  if (fetched.ok === true) {
    window.location.reload();
  }
  const res = await fetched.json();
  console.log(res);
}

// post_submit_btn.onclick = async () => {
//   post.value.trim().length && (await postText(post.value.trim()));
//   post.value = null;
// };

// async function postText(text) {
//   post_submit_btn.value = "Wait..";
//   post_submit_btn.setAttribute("disabled", true);
//   post_submit_btn.setAttribute("style", "opacity:0.8");

//   const obj = { text };
//   const fetched = await fetch("/", {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//     },
//     method: "POST",
//     body: JSON.stringify(obj),
//   });
//   console.log(fetched);
//   if (fetched.ok == false) {
//     alert("Some error occured!");
//     return false;
//   } else {
//     window.location.href = fetched.url
//   }
// }

// // like js here

// function likePost(event) {
//   let postID = event.target.parentElement.dataset.id;
//   let authorID = event.target.parentElement.dataset.author;

//   let likes =
//     event.target.parentElement.parentElement.parentElement.children[1]
//       .childNodes[0];
//   let count = Number(likes.textContent.split(" ")[0]);
//   let liked = event.target.parentElement.dataset.liked;

//   if (event.target.classList[0] == "unlike") {
//     liked = false;
//   } else {
//     liked = true;
//   }

//   if (!liked) {
//     event.target.parentElement.innerHTML = `<span class="like">❤️</span>`;
//     count++;
//     liked = true;
//   } else {
//     event.target.parentElement.innerHTML = `<span class="unlike">🤍</span>`;
//     if (count > 0) {
//       count--;
//     }
//     liked = false;
//   }

//   likes.textContent = `${count} likes`;
//   fetch(`http://localhost:8080/posts/like/${postID}/${authorID}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `${localStorage.getItem("token")}`,
//     },
//   })
//     .then((res) => res.json())
//     .then((res) => console.log(res))
//     .catch((err) => console.log(err));
// }

function deletePost(id) {
  fetch('/delete/' + id, {
    method: 'DELETE',
  })
  .then(response => response.json())
  .then(data => window.location.reload())
  .catch((error) => {
    console.error('Error:', error);
  });
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
