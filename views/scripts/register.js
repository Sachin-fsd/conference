let myPopup = document.getElementById('myPopup');
document.getElementById("yesButton").addEventListener("click", function () {
  myPopup.classList.remove("show");
  window.location.href = "/welcome"
});

const role = document.getElementById("role");

role.onchange = () => {
  if (role.value == "faculty") {
    document.getElementById("school").style.display = "none"
    document.getElementById("course").style.display = "none"
    document.getElementById("section").style.display = "none"
    document.getElementById("rollno").style.display = "none"
  }else{
    document.getElementById("school").style.display = "block"
    document.getElementById("course").style.display = "block"
    document.getElementById("section").style.display = "block"
    document.getElementById("rollno").style.display = "block"
  }
}


document.getElementById("register_form").addEventListener("submit", (event) => {
  event.preventDefault()
  const submitBtn = document.getElementById("submit-btn")
  submitBtn.innerText = "Wait..."
  submitBtn.setAttribute("disabled", true);

  const name = document.getElementById("name").value
  const school = document.getElementById("school").value
  const course = document.getElementById("course").value
  const section = document.getElementById("section").value
  const rollno = document.getElementById("rollno").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const idcard = document.getElementById("idcard").files[0]

  // Validation
  if (role.value == "student") {
    if (!name || !school || !course || !section || !rollno || !email || !password || !idcard) {
      alert("All fields are required!");
      submitBtn.innerText = "Submit"
      submitBtn.removeAttribute("disabled")
      return;
    }
  }
  if (role.value == "faculty") {
    if (!name || !email || !password || !idcard) {
      alert("All fields are required!");
      submitBtn.innerText = "Submit"
      submitBtn.removeAttribute("disabled")
      return;
    }
  }

  if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    alert("Please enter a valid email address!");
    submitBtn.innerText = "Submit"
    submitBtn.removeAttribute("disabled")
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long!");
    submitBtn.innerText = "Submit"
    submitBtn.removeAttribute("disabled")
    return;
  }

  const formData = new FormData();


  if (role.value == "student") {
    formData.append("name", name);
    formData.append("school", school);
    formData.append("course", course);
    formData.append("section", section);
    formData.append("rollno", rollno);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("idcard", idcard);
    formData.append("role", role.value);
  }
  else if (role.value == "faculty") {
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("idcard", idcard);
    formData.append("role", role.value.trim());
  }

  for (var pair of formData.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
  }

  // showDeletePopup()
  fetch('/register', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.ok === true) {
        myPopup.innerHTML = `
        <div class="popup-content">
          <label for="" class="text-bold">Details sent for Verification</label>
            <p>You will be notified in few days</p>
            <button id="yesButton" class="formal-button">
              OK
            </button>
        </div>
        `
        document.getElementById("yesButton").addEventListener("click", function () {
          myPopup.classList.remove("show");
          window.location.href = "/welcome"
        });
        showPopup();
        
      } else {
        myPopup.innerHTML = `
        <div class="popup-content">
            <label for="" class="text-bold">Something Went Wrong</label>
            <p>${data.msg}</p>
            <button id="yesButton" class="formal-button">
                OK
            </button>
        </div>
        `
        document.getElementById("yesButton").addEventListener("click", function () {
          myPopup.classList.remove("show");
          // window.location.href = "/welcome"
        });
        showPopup();
        submitBtn.innerText = "Submit"
        submitBtn.removeAttribute("disabled")
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      let errorBox = document.getElementById('errorBox');
      errorBox.innerText = "Something bad Happened";
      errorBox.style.display = 'block'
      submitBtn.innerText = "Submit"
      submitBtn.removeAttribute("disabled")
    });
});
function showPopup() {
  myPopup.classList.add("show");
}
