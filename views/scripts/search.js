window.onbeforeunload = function () {
  // Display the progress bar when the page is about to unload
  document.getElementById("PreLoaderBar").classList.remove("hide");
  document.getElementById("PreLoaderBar").classList.add("show");
};

async function seachUser(event) {
  const searchInput = document.getElementById("searchInput").value;
  try {
    let resultDiv = document.getElementById("results");
    resultDiv.innerHTML = null;
    document.getElementById("PreLoaderBar").classList.remove("hide");
    document.getElementById("PreLoaderBar").classList.add("show");

    let load = document.createElement("div");
    load.innerHTML = `<p class="text-bold">Searching...</p>`;
    resultDiv.append(load);

    const response = await fetch(
      `/search?query=${encodeURIComponent(searchInput)}`
    );
    const { users, posts } = await response.json();
    console.log("res", posts);

    if (users.length === 0 && posts.length === 0) {
      let div = document.createElement("div");
      div.classList.add("feed");
      div.innerHTML = `
      
      <h2>No results found for ${searchInput}</h2>
      `;
      resultDiv.append(div);
    }

    posts.forEach((post) => {
      let div = document.createElement("div");
      div.classList.add("feed");
      div.innerHTML = `
        <div class="head">
          <a href="/${post.authorID._id}"><div class="user">
              <div class="profile-photo">
                <img src="${post.authorID.dp}" onerror="this.src='https://source.unsplash.com/random?user=${post._id}'"/>
              </div>
              <div class="info">
                <h3>${post.authorID.name}</h3>
                <small> ${post.CreatedAt}</small>
              </div>
            </div></a>

          <span class="dropdown edit">
            <i onclick="myFunction('${post._id}')" class="dropbtn uil uil-ellipsis-h"></i>
            <div id="myDropdown-${post._id}" class="dropdown-content">
                
                <a href="/comment/${post._id}">Comment</a>
                <a href="/${post.authorID._id}">Profile</a>
            </div>
          </span>

        </div>
        <a href="/comment/${post._id}">
          <div class="photo">
            <p class="post-text">${post.text}</p>
          </div>
        </a>

        <div class="action-buttons">
          <div class="interaction-buttons">
            <span><i class="uil uil-thumbs-up"></i></span>
            <!-- <span class="like-post" onclick="likePost(event,'{{this._id}}','{{this.authorID._id}}')">
            {{#if (eq this.liked 1)}}<i class='bx bxs-like' style="color: #f54a6c;"></i>{{else}}<i class='bx bx-like' style="color: #f54a6c"></i>{{/if}}
            </span> -->
            <span><a href="/comment/${post._id}"><i
                  class="uil uil-comment-dots" style="color: rgb(51, 100, 51);"
                ></i></a></span>
            <span><i class="uil uil-share-alt"></i></span>
          </div>
          <div class="bookmark">
            <span><i class="uil uil-bookmark-full"></i></span>
          </div>
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
        <a href="/comment/${post._id}"><div
            class="comments text-muted"
          >View all comments</div></a>

      `;
      resultDiv.append(div);
    });

    users.forEach((user) => {
      let div = document.createElement("div");
      div.classList.add("feed");
      div.innerHTML = `
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
      `;

      resultDiv.append(div);
    });
    load.innerHTML = null;
    document.getElementById("PreLoaderBar").classList.remove("show");
    document.getElementById("PreLoaderBar").classList.add("hide");
  } catch (error) {
    console.log(error);
  }
}

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    console.log(document.readyState);
    document.getElementById("PreLoaderBar").classList.remove("show");
    document.getElementById("PreLoaderBar").classList.add("hide");
  }
};
