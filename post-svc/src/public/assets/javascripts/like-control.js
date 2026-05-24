let SOCKET;
try {
  if (socket) SOCKET = socket
} catch (error) {
  SOCKET = io(IONAMESPACE, {
    transports: ["websocket"]
  })
  console.error(error)
}

class LikesControl {
  constructor() {
    this.likeButtons = document.querySelectorAll(".like-btn")
  }
  async init() {
    if (USERID)
      await this.setLikes()
    this.attachLikeBtnEvents()
  }
  async setLikes() {
    const res = await fetch('/users/likes/keys').then(async res => await res.text())
    if (!res) return
    const likeKeys = JSON.parse(res);
    Array.from(this.likeButtons).forEach(btn => {
      const postkey = btn.getAttribute("data-postkey")
      if (likeKeys.includes(postkey)) {
        btn.className = "like-btn btn btn-ghost btn-sm gap-2 text-primary";
        btn.setAttribute("data-isliked", "true");
        document.getElementById(postkey + "-likeLogo").setAttribute("class", "fill-primary h-4 w-4 ")
      }
    })

  }
  attachSocketEvents() {
    SOCKET.on("likecreated", (postkey, userid) => {
      if (USERID == userid) {
        const btn = document.getElementById(`${postkey}-likebtn`)
        this.toLiked(btn, postkey)
      } else {
        const likeSpan = document.getElementById(postkey + "-newlikes")
        const change = Number(likeSpan.textContent) + 1;
        likeSpan.classList.remove("hidden");
        likeSpan.textContent = (change < 0) ? change : "+" + change;
        if (change == 0) {
          likeSpan.classList.add("hidden");
        }
        updatePageUI()
      }
    })

    SOCKET.on("likedestroyed", (postkey, userid) => {
      if (USERID == userid) {
        const btn = document.getElementById(`${postkey}-likebtn`)
        this.toUnLiked(btn, postkey)
      } else {
        const likeSpan = document.getElementById(postkey + "-newlikes")
        const change = Number(likeSpan.textContent) - 1;
        likeSpan.textContent = (change < 0) ? change : "+" + change;
        likeSpan.classList.remove("hidden");
        if (change == 0) {
          likeSpan.classList.add("hidden");
        }
        updatePageUI()
      }
    })
  }

  attachLikeBtnEvents() {
    if (!USERID) return
    Array.from(this.likeButtons).forEach((btn, i) => {
      btn.addEventListener("click", async (event) => {

        if (btn.getAttribute("data-isliked") === "true") {
          const postkey = btn.getAttribute("data-postkey")
          const userId = document.getElementById("userid").getAttribute("data-userid")
          btn.disabled = true;
          btn.classList.replace("btn-ghost", "btn-active")
          try {
            const res = await this.fetchApi("destroylike", "ondestroylike", {
              postkey: postkey,
              userId: userId
            })
            if (res === "Ok") {

            }
          } catch (err) {
            console.error(err)
          } finally {
            setTimeout(() => {
              btn.disabled = false
            }, 500)
          }
        } else {
          const postkey = btn.getAttribute("data-postkey");
          const userId = document.getElementById("userid").getAttribute("data-userid")
          btn.classList.replace("btn-ghost", "btn-active")
          btn.disabled = true;
          try {
            const res = await this.fetchApi("createlike", "oncreatelike", {
              postkey: postkey,
              userId: userId
            })
            if (res === "Ok") {

            }
          } catch (err) {
            console.error(err)
          } finally {
            setTimeout(() => {
              btn.disabled = false
            }, 500)
          }
        }
      })
    })
  }
  async fetchApi(toEmit, waiton, data) {
    SOCKET.emit(toEmit, data)
    const res = await new Promise((resolve, reject) => {
      SOCKET.on(waiton, (message) => {
        resolve(message)
      })
    })
    return res
  }
  toLiked(btn, postkey) {
    btn.setAttribute("data-isliked", "true")
    btn.className = "like-btn btn btn-ghost btn-sm gap-2 text-primary";
    let totalLikes = document.getElementById(postkey + "-likes").textContent
    document.getElementById(postkey + "-likes").textContent = Number(totalLikes) + 1;
    document.getElementById(postkey + "-likeLogo").setAttribute("class", "h-4 w-4 fill-primary")
  }
  toUnLiked(btn, postkey) {
    btn.setAttribute("data-isliked", "false")
    btn.className = "like-btn btn btn-ghost btn-sm gap-2 text-primary";
    document.getElementById(postkey + "-likes").textContent -= 1;
    document.getElementById(postkey + "-likeLogo").setAttribute("class", "h-4 w-4")

  }

}
window.addEventListener("load", () => {
  const likeControl = new LikesControl();
  likeControl.init();
  likeControl.attachSocketEvents();
})