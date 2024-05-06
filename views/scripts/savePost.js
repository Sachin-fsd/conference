function savePost(event, postID, authorID) {
  console.log(event, postID, authorID);

  if (event.target.className == "bx bx-bookmark") {
    event.target.className = "bx bxs-bookmark";
    event.target.setAttribute("style", "color: #6a3bec");
  } else {
    event.target.className = "bx bx-bookmark";
  }
console.log(event.className,event.target.className)
  fetch(`/save/${postID}/${authorID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${localStorage.getItem("token")}`,
    },
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}
