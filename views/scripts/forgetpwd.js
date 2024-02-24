document
  .getElementById("pwd_forget_form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
  });

let otp_div = document.getElementById("otp_div");
otp_div.setAttribute("style", "display:none");

let username = document.getElementById("username");
let otp = document.getElementById("otp");

let submit = document.getElementById("submit");


submit.addEventListener("click", () => {
  if (username.value !== "" || username.value !== null) {
    if (submit.value == "Get OTP") {
      submit.value = "Loading...";
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
            otp_div.setAttribute("style", "display:block");
            submit.removeAttribute("disabled")
            submit.value = "Submit OTP";
          } else {
            alert("Something is Wrong");
          }
        })
        .catch((err) => console.log(err));
      return;
    } else if (submit.value == "Submit OTP") {
      submit.value = "Loading...";
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
            otp_div.innerHTML = `
            <input
            id="otp"
            class="form-input"
            placeholder="Enter New Password"
            title="Enter New Password"
            type="password"
          />
          <label class="floating-label" for="otp" id="otp_placeholder">Enter New Password</label>
          `;
            submit.value = "Login";
            submit.removeAttribute("disabled");
          } else {
            submit.value = "Submit OTP";
            alert("Something is Wrong");
          }
        })
        .catch((err) => console.log(err));
      return;
    } else if (submit.value == "Login") {
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
