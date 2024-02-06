document.getElementById("register_form").addEventListener("submit", (event) => {
  event.preventDefault();
  const submit_btn = document.getElementById("submit-btn");
  submit_btn.innerText = "Wait...";
  submit_btn.setAttribute("disabled", true);
  const name = document.getElementById("name").value;
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const obj = { name, email, password };

  fetch("/register", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
    method: "POST",
  })
    .then((res) => {
      if (res.ok) {
        window.location.href = res.url;
      } else {
        alert("Something is wrong");
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
