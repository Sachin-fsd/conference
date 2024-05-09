document
  .getElementById("pwd_forget_form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
  });

let otp = document.getElementById("otp");
otp.setAttribute("style", "display:none");

let username = document.getElementById("username");

let submit = document.getElementById("submit");
console.log(submit.innerText)

submit.addEventListener("click", () => {
  if (username.value !== "" || username.value !== null) {
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
        .then((res) => {
          if (res.ok==true) {
            otp.setAttribute("style", "display:block");
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
        .then((res) => {
          console.log(res);
          if (res.ok) {
            alert("OTP verified");
            otp.value = null
            otp.placeholder = `Enter New Password`;
            submit.innerText = "Login";
            submit.removeAttribute("disabled");
          } else {
            submit.innerText = "Submit OTP";
            alert("Something is Wrong");
          }
        })
        .catch((err) => console.log(err));
      return;
    } else if (submit.innerText == "Login") {
      let pass = document.getElementById("otp");
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
                res.json();
                console.log(res);
            }
        })
    } else {
      alert("Something went wrong!");
    }
  }
});
