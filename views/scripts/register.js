// GLOBAL VARIABLE DECLERATIONS
let username = document.querySelector("#username");
let password = document.querySelector("#password")
let loginButton = document.querySelector("#submit-btn");
let showButton = document.querySelector("#show-btn");
let hideButton = document.querySelector("#hide-btn");

// LOGIN BUTTON ENABLE + DISABLE FUNCTION
loginButton.disabled = true;
username.addEventListener("change", stateHandle);
password.addEventListener("change", stateHandle);

function stateHandle() {
  if (username.value.length > 0 && password.value.length > 4 ) {
    loginButton.disabled = false; 
  } else {
    loginButton.disabled = true;
  }
}

function stateHandleUp() {
  if (password.value.length > 5 ) {
    loginButton.dsabled = false;
  } else {
    loginButton.disabled = true;
  }
}

// PASSWORD SHOW/HIDE BUTTON SWTICH
function showPassword() {
  if (password.type === "password") {
    password.type = "text";
    showButton.style.display = "none";
    hideButton.style.visibility = "visible";
  } else {
    password.type = "password";
    hideButton.style.visibility = "hidden";
    showButton.style.display = "inline-block";
  }
}

hideButton.style.visibility = "hidden";


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
