document
  .getElementById("pwd_forget_form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
  });

let otp_label = document.getElementById("otp_label");
otp_label.setAttribute("style", "display:none");

let username = document.getElementById("username");
let otp = document.getElementById("otp");

let submit = document.getElementById("submit");
submit.addEventListener("click", () => {
  if (username.value !== "") {
    if (submit.innerText == "Get OTP") {
      submit.innerText = "Loading...";
      submit.setAttribute("disabled",true)
      const email = username.value;
      fetch("/forgetpwd/getotp", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        method: "POST",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.ok) {
            otp_label.setAttribute("style", "display:block");
            submit.removeAttribute("disabled")
            submit.innerText = "Submit OTP";
          } else {
            alert("Something is Wrong");
          }
        })
        .catch((err) => console.log(err));
      return;
    } else if (submit.innerText == "Submit OTP") {
      submit.innerText = "Loading...";
      submit.setAttribute("disabled",true)

      fetch("/forgetpwd/verifyotp", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username.value, otp: otp.value }),
        method: "POST",
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          if (res.ok) {
            alert("OTP verified");
            otp_label.innerHTML = `New Password<input type="password" placeholder="Enter New Password" id="password"/>`;
            submit.innerText = "Login";
            submit.removeAttribute("disabled")
          } else {
            submit.innerText = "Submit OTP";
            alert("Something is Wrong");
          }
        })
        .catch((err) => console.log(err));
      return;
    } else if (submit.innerText == "Login") {
      let pass = document.getElementById("password");
      let obj = { email: username.value, password: pass.value };

      fetch("/forgetpwd/forgetlogin", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
        method: "POST",
      })
        .then((res) => {
            if(res.redirected==true){
                window.location.href = res.url
            }else{
                res.json()
            }
           
        })
        .then((res) => {
          if (res.ok) {
            alert("Login Successfull");
            // localStorage.setItem("token", res.token);
            // window.location.href = "./index.html";
          } else {
            alert("Wrong Credentials");
          }
        })
        .catch((err) => console.log(err));
    } else {
      alert("Something went wrong!");
    }
  }
});
