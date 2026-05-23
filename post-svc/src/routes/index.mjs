import * as express from "express";

import { catgsStore } from "./posts.mjs";
import PrismaPostsStore from "../models/posts-prisma.mjs";
import { postsUsersStore } from "./users.mjs";
import { io } from "../app.mjs";

import { commentStore } from "./posts.mjs";
export const router = express.Router();
export const postsStore = new PrismaPostsStore();
import { PrimsaLikesStore } from "../models/likes-prisma.mjs";
import { likeStore } from "./posts.mjs";

export function initSocket() {
  io.of("/index").on("connection", async socket => {
    socket.emit("connected", "Socket connected")
    socket.on("join-room", async rooms => {
      await socket.join(rooms)
      socket.emit("room-joined", Array.from(socket.rooms.values()))
    })
    socket.on("createcomment", async data => {
      if (socket.request.user) {
        try {
          const comment = await commentStore.create(data.postkey, socket.request.user.id, data.body)
        } catch (error) {
          console.error(error)
        }
      }
    })
    socket.on("createlike", async data => {
      if (socket.request.user) {
        try {
          const like = await likeStore.create(data.postkey, socket.request.user.id) 
          if (like)  socket.emit("oncreatelike", "Ok")
        } catch (error) {
          console.error(error)
        }
      }
    })
    socket.on("destroylike", async data => {
      if (socket.request.user) {
        try {
          const like = await likeStore.destroy(data.postkey, socket.request.user.id)
          socket.emit("ondestroylike", "Ok")  
        } catch (error) {
          console.error(error)
        }
      }
    })
  })

  PrismaPostsStore.Events.on("postcreated", (post) => {

    const postCatgs = post.catgs.map(catg => {
      return catg.catgName
    });
    postCatgs.forEach(catg => {
      io.of("/index").to(catg).emit("postcreated", post)
    });
    io.of("/index").to("All Posts").emit("postcreated", post)
    io.of("/index").to("landing").emit("postcreated", post)
  })
  PrismaPostsStore.Events.on("postdestroyed", key => {
    io.of("/index").to(key).emit("postdestroyed", key)
  })
  PrismaPostsStore.Events.on("postupdated", post => {
    io.of("/index").to(post.key).emit("postupdated", post)
  })
  commentStore.events.on("commentcreated", (postkey, comment) => {
    io.of("/index").to(postkey).emit("commentcreated", postkey, comment)
  })
  commentStore.events.on("commentdestroyed", (postkey, commentId) => {
    io.of("/index").to(postkey).emit("commentdestroyed", postkey, commentId)
  })

  PrimsaLikesStore.events.on("likecreated", (postkey, userid) => {
    io.of("/index").to(postkey).emit("likecreated", postkey, userid)
  })
  PrimsaLikesStore.events.on("likedestroyed", (postkey, userid) => {
    io.of("/index").to(postkey).emit("likedestroyed", postkey, userid)
  })
}
router.get("/explore/:catgName", async (req, res, next) => {
  /**@type {[]} */
  const keylist = await catgsStore.getPostKeysByCatg(req.params.catgName);
  const catgNameList = (await catgsStore.getCategoriesNames()).map((v) => {
    return { catgName: v };
  });

  const pageNo = req.query.page ? Number(req.query.page) : 1;
  const sort = req.query.sort === "oldest" ? "oldest" : "latest";
  if (sort === "oldest") keylist.reverse()
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  let limitList = [{ limits: 3 }, { limits: 5 }, { limits: 7 }, { limits: 10 }]

  limitList = limitList.map(v => {
    if (v.limits === limit) return { limits: v.limits, checked: true }
    else return { limits: v.limits, checked: false }
  })
  const start = (pageNo - 1) * limit;
  const pageKeys = keylist.slice(start, start + limit);
  const postlist = await Promise.all(
    pageKeys.map((key) => postsStore.read(key)),
  );

  let baseUrl = req.url.substring(0, req.url.lastIndexOf("?"));

  res.render("index", {
    title: "Exploring " + req.params.catgName,
    postlist: postlist,
    explorePage: true,
    catgName: req.params.catgName,
    total: keylist.length,
    limit: limit,
    limitList,
    sort: sort,
    latest: sort == "latest" ? true : false,
    current: pageNo,
    baseUrl: baseUrl,
    totalPages: Math.ceil(keylist.length / limit) || 1,
    catgNameList: catgNameList,
    user: req.user ? req.user : undefined,
    level: req.query.level,
    ioNameSpace: "/index"
  });
});
/* GET home page. */
router.get("/your-feed", async (req, res, next) => {
  if (!req.user) {
    res.redirect("/explore/All%20Posts");
    return;
  }
  const user = await postsUsersStore.read(req.user.id);
  /** @type {String[]} */
  const feedCatgsList = JSON.parse(user.feedCatgs);

  const catgNameList = (await catgsStore.getCategoriesNames()).map((v) => {
    if (feedCatgsList?.includes(v)) {
      return { catgName: v, checked: true };
    } else return { catgName: v, checked: false };
  });
  if (!user.feedCatgs) {
    res.render("index", {
      title: "Your Feed",
      postlist: false,
      feedPage: true,
      catgNameList,
      user: req.user ? req.user : undefined,
      level: req.query.level,
    });
    return;
  }

  const keylist = await catgsStore.getFeed(user.feedCatgs);

  const pageNo = req.query.page ? Number(req.query.page) : 1;
  const sort = req.query.sort === "oldest" ? "oldest" : "latest";
  if (sort === "oldest") keylist.reverse()
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  let limitList = [{ limits: 3 }, { limits: 5 }, { limits: 7 }, { limits: 10 }]

  limitList = limitList.map(v => {
    if (v.limits === limit) return { limits: v.limits, checked: true }
    else return { limits: v.limits, checked: false }
  })
  const start = (pageNo - 1) * limit;

  const pageKeys = keylist.slice(start, start + limit);
  const postlist = await Promise.all(
    pageKeys.map((key) => postsStore.read(key)),
  );

  const baseUrl = req.url.substring(0, req.url.lastIndexOf("?"));
  res.render("index", {
    title: "Your Personal Feed",
    postlist: postlist,
    feedPage: true,
    total: keylist.length,
    limit: limit,
    limitList,
    catgName: feedCatgsList,
    sort: sort,
    latest: sort == "latest" ? true : false,
    current: pageNo,
    baseUrl: baseUrl,
    totalPages: Math.ceil(keylist.length / limit) || 1,
    catgNameList,
    user: req.user ? req.user : undefined,
    level: req.query.level,
    ioNameSpace: "/index"
  });
});
router.get("/", async (req, res, next) => {
  try {
    const keylist = (await postsStore.keylist()).filter((v, i) => i <= 2);
    const keyPromises = keylist.map((key) => {
      return postsStore.read(key);
    });

    let postlist = await Promise.all(keyPromises);
    if (postlist.length === 0) {
      postlist = false;
    }

    res.render("index", {
      title: "userPost",
      postlist: postlist,
      homepage: true,
      user: req.user ? req.user : undefined,
      level: req.query.level,
      massage: req.query.massage,
      updates: true,
      ioNameSpace: "/index",
      catgName: "landing",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/privacy-policy", (req, res, next) => {
  res.render("privacy", {
    title: "Privacy Policy",
    user: req.user ? req.user : undefined,
  });
});

router.get("/terms-of-services", (req, res, next) => {
  res.render("terms", {
    title: "Terms of Services",
    user: req.user ? req.user : undefined,
  });
});

router.get("/about-userPost", (req, res, next) => {
  res.render("about-userPost", {
    title: "About userPost",
    user: req.user ? req.user : undefined,
  });
});
