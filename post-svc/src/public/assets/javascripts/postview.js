
const commentForm = document.getElementById('commentForm');
const commentText = document.getElementById("commentText");
const liveComments = document.getElementById("liveComments");
const postBody = document.getElementById("postBody");
/** 
 * Import the core Socket type from the library
 * @typedef {import("socket.io-client").Socket<ServerToClientEvents, ClientToServerEvents>} TypedSocket
 */

/** @type {TypedSocket} */

console.log(IONAMESPACE)
const socket = io(IONAMESPACE, {
  transports: ["websocket"]
})

socket.emit("join-room", POSTKEY)
socket.on("room-joined", (message) => console.log(message));

socket.on("postdestroyed", key => {
  const page = document.getElementById("pagediv");
  page.innerHTML = `
  <div class="alert alert-info shadow-lg max-w-md mx-auto mt-10">
    <span data-feather="alert-circle"></span>
    <div>
      <h3 class="font-bold">Post Deleted by Auther!</h3>
      <div class="text-xs">The Auther of this Post deleted this Post with all comments.</div>
    </div>
    <a href="/" class="btn btn-sm">Go Home</a>
  </div>
  `
})

socket.on("postupdated", post => {
  document.getElementById("postTitle").textContent = post.title;
  postBody.innerHTML = post.body;
  document.getElementById("updateSpan").textContent = "Updated Now"
})

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (USERID) {
    socket.emit("createcomment", {
      postkey: POSTKEY,
      autherId: USERID,
      body: commentText.value
    })
  }
});

socket.on("commentcreated", (postkey, comment) => {

  // Remove empty state message if it's there
  const emptyMsg = document.getElementById("noCommentsMsg");
  if (emptyMsg) emptyMsg.remove();

  const commentdiv = document.createElement("div");
  commentdiv.id = "comment_" + comment.id;
  commentdiv.className = "group p-4 rounded-4xl bg-base-200/40 border border-transparent hover:border-base-300 transition-all w-full";
  let deleteBtn = `
              <li>
                <button onclick="fetch('/posts/comment/destroy/${comment.id}')"
                  class="text-error items-center gap-2 font-bold text-[11px] uppercase tracking-widest">
                  <span data-feather="trash-2" class="w-4 h-4 mb-0.5"></span>
                  Delete
                </button>
              </li>
  `
  
  if (USERNAME != comment.auther.username) deleteBtn = "";
  
  commentdiv.innerHTML = `
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <img class="rounded-xl bg-neutral w-8 h-8 shadow-sm" src="${comment.auther.photoURL}">
            <div>
              <p class="font-black text-sm tracking-tight leading-none">${comment.auther.username}</p>
              <span class="updatedAt text-[10px] md:text-xs  font-bold opacity-60 uppercase tracking-wide mt-1 inline-block">Just now</span>
            </div>
          </div>
          <div class="dropdown dropdown-end  transition-opacity">
            <div tabindex="0" role="button" class="btn btn-circle btn-ghost btn-xs  sm:btn-sm py-0.5 px-1  rounded-full">
              <span data-feather="more-vertical" class="w-5 h-5"></span>
            </div>
            <ul tabindex="0"
              class="dropdown-content z-1 menu p-2 shadow-xl bg-base-100 border border-base-200 rounded-xl w-32">
              ${deleteBtn}
            </ul>
          </div>
        </div>
        <p class="text-base-content/80 font-medium leading-relaxed pl-11">${comment.body}</p>
      `;

  liveComments.appendChild(commentdiv);

  // Update comment count UI
  const cSpan = document.getElementById(postkey + "-newcomments")
  const change = Number(cSpan.textContent) + 1;
  cSpan.classList.remove("hidden");
  cSpan.textContent = (change < 0)? change: "+" + change;
  if ( change == 0) {
    cSpan.classList.add("hidden");
  }
  // Re-run Feather icons for the new comment
  if (typeof feather !== 'undefined') feather.replace();
  updatePageUI()

})
socket.on("commentdestroyed", (postkey, commentid) => {
  const targetComment = document.getElementById("comment_" + commentid);
  if (targetComment) targetComment.remove();

  const cSpan = document.getElementById( postkey+ "-newcomments")
  const change =  Number(cSpan.textContent) - 1;
  cSpan.textContent = (change < 0)? change: "+" + change;
  cSpan.classList.remove("hidden");
   if ( change == 0) {
    cSpan.classList.add("hidden");
  }
  updatePageUI()
})


const Events = new EventTarget()
const updateDiv = document.getElementById("updateDiv");
const updateSpan = document.getElementById("updateSpan");
const createSpan = document.getElementById("createSpan");
Events.addEventListener("timeset", () => {
  if (updateSpan.textContent == createSpan.textContent) {
    updateDiv.classList.add("hidden")
  }
})

const bodyLinks = postBody.querySelectorAll("a");
bodyLinks.forEach(e => {
  e.setAttribute("target", "_blank")

})
