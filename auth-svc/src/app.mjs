import { Hono } from "hono";
import { logger } from "hono/logger";
import {
  DBUsers,
  connectDB,
  findOneUser,
  createUser,
  sanitizedUser,
  userParams,
} from "./users-prisma.mjs";
import bcrypt from "bcryptjs";
import { jwt } from "hono/jwt";

export const app = new Hono();

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
  let users = await DBUsers.findMany();
  users = users.map((user) => sanitizedUser(user));
  return c.json(users);
});

app.post("/create-user", async (c) => {
  let isAlreadyUser = await DBUsers.findUnique({
    where: { username: c.req.body.username },
  });
  if (isAlreadyUser) {
    return c.text("Already a User has username: " + c.req.body.username, 500);
  }
  let result = await createUser(c.req.body);
  return c.json(result);
});

app.post('/find-or-create', async (c) => {
  let user = await DBUsers.findUnique({
    where: { email: c.req.body.email }
  });
  if (!user) {
    user = await createUser(c.req);
    if (!user) {
      console.error("Error Creating User")
      return c.text("Error creating User", 500)
    }
    return c.json(user)
  }
  return c.json(user)
});

app.get('/find/:userId', async (c) => {
  let user = await findOneUser(c.req.param().userId)
  if (user) {
    return c.json(user)
  } else {
    return c.text('Did not find: ' + c.req.param().userId, 404)
  }

})

app.get('/find/email/:email', async (c) => {
  let user = await DBUsers.findUnique({
    where: {
      email: c.req.param().email
    },
    omit: { password_hash: true }
  })
  
  if (user) {
    return c.json(user)
  } else {
    return c.json({ email: false })
  }
})

app.get('/find/username/:username', async (c) => {
  const user = await DBUsers.findUnique({
    where: { username: c.req.param().username },
    omit: { password_hash: true }
  })
  
  if (user) {
    return c.json(user)
  } else {
    return c.json({ username: false })
  }
})

app.post('/update-user/photo/:id', async (c) => {
  const user = await DBUsers.findUnique({ where: { id: c.req.param().id }})
  if (user) {
    const newUser = await DBUsers.update({
      where: { id: user.id },
      data: { photoURL: c.req.body.photoURL, photoType: c.req.body.photoType },
    })
    return c.json(user)
  }
  return c.text("No such user", 404)
})

app.post('/update-user/:username', async (c) => {
  let isUser = await findOneUser(c.req.param().username)
  if (!isUser) {
    return c.text("No Such User: " + c.req.param().username)
  }
  let update = c.req.body
  await DBUsers.update({
    data: update, where: {
      username: c.req.param().username
    }
  })
  const updated = await findOneUser(c.req.param().username);
  return c.json(updated)
})

app.delete("/destroy/:username", async (c) => {
  let user = await DBUsers.findUnique({ where: { username: c.req.param().username } })
  if (!user) {
    return c.text("No Such User: " + c.req.param().username, 404)
  }
  await DBUsers.delete({ where: { id: user.id } });
  return c.json({success: true})
})

app.post('/password-check', async (c) => {


  const user = await DBUsers.findUnique({
    where: { username: c.req.body.username }
  });
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
  } else if (user.username === c.req.body.username
    && await bcrypt.compare(c.req.body.password, user.password_hash)) {
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
