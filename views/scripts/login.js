const submit_btn = document.getElementById("submit-btn");

document.getElementById("login_form").addEventListener("submit", (event) => {
  const submit_btn = document.getElementById("submit-btn");
  submit_btn.innerText = "Wait...";
  submit_btn.setAttribute("disabled", true);
  event.preventDefault();
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const obj = { email, password };
  //   console.log(obj);
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
        alert("Wrong Credentials.");
        submit_btn.innerText = "Log In";
        submit_btn.removeAttribute("disabled");
      }
    })
    .catch((err) => {
      console.log(err);
      alert("Something went wrong");
      submit_btn.innerText = "Log In";
      submit_btn.removeAttribute("disabled");
    });
});
