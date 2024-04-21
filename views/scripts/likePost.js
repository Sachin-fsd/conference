function likePost(event, postID, authorID) {
  // console.log(event, postID, authorID);
  // console.log(event.target.className)

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
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}
