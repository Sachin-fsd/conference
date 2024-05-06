let myPopup = document.getElementById('myPopup');
document.getElementById("yesButton").addEventListener("click", function () {
  myPopup.classList.remove("show");
  window.location.href = "/welcome"
});
document.getElementById("register_form").addEventListener("submit", (event) => {
  event.preventDefault()
  const submitBtn = document.getElementById("submit-btn")
  submitBtn.innerText = "Wait..."
  submitBtn.setAttribute("disabled", true)

  console.log("he;llllo")

  const name = document.getElementById("name").value
  const school = document.getElementById("school").value
  const course = document.getElementById("course").value
  const section = document.getElementById("section").value
  const rollno = document.getElementById("rollno").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const idcard = document.getElementById("idcard").files[0]

  // Validation
  if (!name || !school || !course || !section || !rollno || !email || !password || !idcard) {
    alert("All fields are required!");
    submitBtn.innerText = "Submit"
    submitBtn.removeAttribute("disabled")
    return;
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
  formData.append("name", name);
  formData.append("school", school);
  formData.append("course", course);
  formData.append("section", section);
  formData.append("rollno", rollno);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("idcard", idcard);

  for (var pair of formData.entries()) {
    console.log(pair[0] + ', ' + pair[1]);
  }


  // showDeletePopup()
  fetch('/register', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      console.log(response)
      if (response.ok === false) {
        myPopup.innerHTML = `
        <div class="popup-content">
            <label for="" class="text-bold">Wrong Credentials</label>
            <p>User Already Exists</p>
            <button id="yesButton" class="formal-button">
                OK
            </button>
        </div>
        `
        document.getElementById("yesButton").addEventListener("click", function () {
          myPopup.classList.remove("show");
          // window.location.href = "/welcome"
        });
        showPopup()
        return
      }
      return response.json()

    })
    .then(data => {
      console.log(data);
      showPopup()
      submitBtn.innerText = "Submit"
      submitBtn.removeAttribute("disabled")
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
