import { Hono } from "hono";
import { logger } from "hono/logger";
import { UsersDataBase, sanitizedUser } from "./users-db.mjs";
import bcrypt from "bcryptjs";
import { jwt } from "hono/jwt";

export const app = new Hono();
const usersDb = new UsersDataBase()
app.use(logger())

app.use(
  jwt({
    secret: process.env.BEARER_TOKEN_PRIVATEKEY,
    alg: "HS256",
  }),
);

app.use(async (c, next) => {
  const auth = c.get("jwtPayload");
  if (auth === `${process.env.APIKEY_USER}:${process.env.APIKEY_PASSWORD}`) {
    return await next();
  }
  return c.text("Not Authurized", 404);
});

app.use(async (c, next) => {
  try {
    c.req.body = await c.req.json();
    await next();
  } catch (error) {
    await next();
  }
});

app.get("/list", async (c) => {
  let users = await usersDb.findMany();
  users = users.map((user) => sanitizedUser(user));
  return c.json(users);
});

app.post("/create-user", async (c) => {
  let isAlreadyUser =  await usersDb.findUserName(c.req.body.username);
  if (isAlreadyUser) {
    return c.text("Already a User has username: " + c.req.body.username, 500);
  }
  const user = await usersDb.createUser(c.req.body);
  return c.json(user);
});

app.post('/find-or-create', async (c) => {
  const user = await usersDb.findEmail(c.req.body.email)
  if (user) return c.json(user);

  const newUser = await usersDb.createUser(c.req.body);
  return c.json(newUser);
});

app.get('/find/:userId', async (c) => {
  let user = await usersDb.find(c.req.param().userId)
  if (user) {
    return c.json(user)
  } else {
    return c.text('Did not find: ' + c.req.param().userId, 404)
  }

})

app.get('/find/email/:email', async (c) => {
  const user = await usersDb.findEmail(c.req.param().email)
  if (user) {
    return c.json(user)
  } else {
    return c.json({ email: false })
  }
})

app.get('/find/username/:username', async (c) => {
  const user = await usersDb.findUserName(c.req.param().username)
  if (user) {
    return c.json(user)
  } else {
    return c.json({ username: false })
  }
})

app.post('/update-user/photo/:id', async (c) => {
  const user = await usersDb.find(c.req.param().id)
  if (user) {
    const updated = await usersDb.updatePhoto(c.req.param().id, c.req.body.photoURL, c.req.body.photoType)
    return c.json(updated)
  }
  return c.text("No such user", 404)
})

app.post('/update-user/:username', async (c) => {
  const user = await usersDb.findUserName(c.req.param().username)
  if (!user) {
    return c.text("No Such User: " + c.req.param().username)
  }
  const updated = await usersDb.update(c.req.param().username, c.req.body)
    return c.json(updated)
})

app.delete("/destroy/:username", async (c) => {
  const user = await usersDb.findUserName(c.req.param().username)
  if (!user) {
    return c.text("No Such User: " + c.req.param().username, 404)
  }
  const deletedId = await usersDb.destroy(user.id);
  return c.json({success: true})
})

app.post('/password-check', async (c) => {


  const user = await usersDb.getFull(c.req.body.username );
  let checked;
  if (!user) {
    checked = {
      check: false, username: c.req.body.username,
      message: "Could not find user"
    };
  } else if (user.provider != "Local") {
    checked = {
      check: false, username: c.req.body.username,
      message: "Could not find user"
    };
  } else if (bcrypt.compareSync(c.req.body.password, user.password_hash)) {
    checked = { check: true, username: user.username, id: user.id };
  } else {
    checked = {
      check: false, username: c.req.body.username,
      message: "Incorrect password"
    };
  }

  return c.json(checked)
});


export default {
  port: process.env.PORT,
  fetch: app.fetch,
};

process.on("uncaughtException", function (err) {
  console.error("UNCAUGHT EXCEPTION - " + (err.stack || err));
  process.exit(1);
});

process.on("unhandledRejection", (reason, p) => {
  console.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(p)}
reason: ${reason}`);
  process.exit(1);
});
