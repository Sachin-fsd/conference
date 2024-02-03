document.getElementById("register_form").addEventListener("submit", (event) => {
  event.preventDefault();
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
        return res.json();
      }
    })
    .then((res) => {
        if(res?.msg){
            alert(res.msg);
        }
    })
    .catch((err) => {
      console.log(err);
      alert("Something went wrong");
    });
});
