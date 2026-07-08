

import { sign } from "hono/jwt";
import { describe, test, expect } from "bun:test";
import { app } from "../src/app.mjs";

const token = await sign(`${process.env.APIKEY_USER}:${process.env.APIKEY_PASSWORD}`, process.env.BEARER_TOKEN_PRIVATEKEY, "HS256");
console.log(token)
test("/list", async () => {
  const res = await app.request("/list", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
      }
  })
  console.log(await res.text())
  expect(res.status).toBe(200)
})
