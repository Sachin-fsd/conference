async function seachUser(event) {
  const searchInput = document.getElementById("searchInput").value;
  try {
    const response = await fetch(`/search?name=${encodeURIComponent(searchInput)}`);
    const users =await response.json();
    console.log("users",users);
    let resultDiv = document.getElementById("results");
    resultDiv.innerHTML = null;

    users.users.forEach((user) => {
      let div = document.createElement("div");
      div.classList.add("feed");
      div.innerHTML = `
      <div class="feed">
        <div class="head">
          <a href="/${user._id}"><div class="user">
              <div class="profile-photo">
                <img
                  src="https://cdn.pixabay.com/photo/2016/11/07/09/07/river-1805188_640.jpg"
                />
              </div>
              <div class="info">
                <h3>${user.name}</h3>
              </div>
            </div></a>

          <span class="edit">
            <i class="uil uil-ellipsis-h"></i>
          </span>
        </div>

        <div class="caption">
          <p>
            <b>B.tech CSE FSD</b>
            | Section 1 | Group 1 |
            <b>Roll No.</b>
            2301350008

          </p>
          <p><span class="harsh-tag">#lifestyle</span></p>
        </div>
      </div>
      `;

      resultDiv.append(div);
    })

  } catch (error) {
    console.log(error);
  }
}
