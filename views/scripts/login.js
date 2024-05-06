
document.getElementById("login_form").addEventListener("submit", (event) => {
  event.preventDefault();
  const submit_btn = document.getElementById("submit-btn");
  submit_btn.innerText = "Wait...";
  submit_btn.setAttribute("disabled", true);
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const obj = { email, password };
  console.log(obj)
  fetch("/login", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
    method: "POST",
  })
    .then((res) => {
      // console.log(res);
      if (res.ok === true) {
        window.location.href = res.url;
      } else {
        showPopup()
        showPopup()
        submit_btn.innerText = "Log In";
        submit_btn.removeAttribute("disabled");
      }
    }).then(res=>console.log(res))
    .catch((err) => {
      console.log(err);
      showPopup()
      submit_btn.innerText = "Log In";
      submit_btn.removeAttribute("disabled");
    });
});
function showPopup() {
  myPopup.classList.add("show");
}
document.getElementById("yesButton").addEventListener("click", function () {
  myPopup.classList.remove("show");
});