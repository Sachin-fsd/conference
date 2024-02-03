document.getElementById("login_form").addEventListener("submit", (event) => {
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
      //   console.log(res);
      if (res.ok) {
        window.location.href = res.url;
      } else {
        res.json();
      }
    })
    .then((res) => {
      if (res) {
        console.log(res);
      }
      if (res?.msg) {
        alert(res?.msg);
      }
    })
    .catch((err) => {
      console.log(err);
      alert("Something went wrong");
    });
});
