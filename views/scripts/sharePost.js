window.onclick = function (event) {
  // console.log(event.target)
  if (!event.target.matches(".dropbtn")) {
    const dropdowns = document.getElementsByClassName("dropdown-content-share");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function shareFunction(id) {
  document.getElementById("shareDropdown-" + id).classList.toggle("show");
}

function sharePost(id, site) {
  var postId = id;
  var baseUrl = window.location.href;
  var url;

  if (site == "linkedin") {
    url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      baseUrl + "/" + postId
    )}`;
  } else if (site == "pinterest") {
    url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
      baseUrl + "/" + postId
    )}`;
  } else if (site == "twitter") {
    url = `https://twitter.com/share?url=${encodeURIComponent(
      baseUrl + "/" + postId
    )}`;
  } else if (site == "facebook") {
    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      baseUrl + "/" + postId
    )}`;
  } else if (site == "instagram") {
    url = `https://www.instagram.com/share?url=${encodeURIComponent(
      baseUrl + "/" + postId
    )}`;
  } else if (site == "whatsapp") {
    url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      baseUrl + "/" + postId
    )}`;
  }

  // Open the URL in a new window or tab
  window.open(url, "_blank");
}
