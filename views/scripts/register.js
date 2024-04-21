// GLOBAL VARIABLE DECLERATIONS
const username = document.querySelector("#username")
const password = document.querySelector("#password")
const loginButton = document.querySelector("#submit-btn")
const showButton = document.querySelector("#show-btn")
const hideButton = document.querySelector("#hide-btn")

// LOGIN BUTTON ENABLE + DISABLE FUNCTION
loginButton.disabled = true
username.addEventListener("change", stateHandle)
password.addEventListener("change", stateHandle)

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function stateHandle () {
  var nameInput = document.getElementById('name');
  nameInput.value = toTitleCase(nameInput.value);
  if (username.value.length > 0 && password.value.length > 4) {
    loginButton.disabled = false
  } else {
    loginButton.disabled = true
  }
}

function stateHandleUp () {
  if (password.value.length > 5) {
    loginButton.dsabled = false
  } else {
    loginButton.disabled = true
  }
}

// PASSWORD SHOW/HIDE BUTTON SWTICH
function showPassword () {
  if (password.type === "password") {
    password.type = "text"
    showButton.style.display = "none"
    hideButton.style.visibility = "visible"
  } else {
    password.type = "password"
    hideButton.style.visibility = "hidden"
    showButton.style.display = "inline-block"
  }
}

hideButton.style.visibility = "hidden"

document.getElementById("register_form").addEventListener("submit", (event) => {
  event.preventDefault()
  const submitBtn = document.getElementById("submit-btn")
  submitBtn.innerText = "Wait..."
  submitBtn.setAttribute("disabled", true)
  const name = document.getElementById("name").value
  const email = document.getElementById("username").value
  const password = document.getElementById("password").value

  const obj = { name, email, password }

//   fetch("/register", {
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(obj),
//     method: "POST"
//   })
//     .then((res) => {
//       if (res.ok) {
//         window.location.href = res.url
//       } else {
        
//         alert("Something is wrong")
//         submitBtn.innerText = "Log In"
//         submitBtn.removeAttribute("disabled")
//       }
//     })
//     .catch((err) => {
//       console.log(err)
//       alert("Something went wrong")
//       submitBtn.innerText = "Log In"
//       submitBtn.removeAttribute("disabled")
//     })
// })


fetch("/register", {
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(obj),
  method: "POST"
})
  .then((res) => {
    if (res.ok) {
      window.location.href = res.url
    } else {
      // Return the response text for more detailed error information
      return res.text().then((text) => {
        // console.log(text)
        throw new Error(text);
      });
    }
  })
  .catch((err) => {
    console.log(err.msg)
    alert(err.message) // Alert the error message
    submitBtn.innerText = "Log In"
    submitBtn.removeAttribute("disabled")
})

})

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

/*
<a href="#" onclick="signOut();">Sign out</a>
<script>
  function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }
</script>
*/