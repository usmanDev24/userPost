import { sign } from "hono/jwt";
import { describe, test, expect } from "bun:test";
import { app } from "../src/app.mjs";
import bcrypt from "bcryptjs";

const token = await sign(
  `${process.env.APIKEY_USER}:${process.env.APIKEY_PASSWORD}`,
  process.env.BEARER_TOKEN_PRIVATEKEY,
  "HS256",
);

test("should pass to /list", async () => {
  const res = await app.request("/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  ;
  expect(res.status).toBe(200);
});

test("should pass to /create-user", async () => {
  const passhash = await await bcrypt.hash("test", 10)
  const res = await app.request("/create-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    
    body: JSON.stringify({
      username: "testUser",
      password_hash: passhash,
      fullName: "Test User",
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
    }),
  });
  
  expect(res.status).toBe(200);
});
test("should pass to /find-or-create find first user", async () => {
  const passhash = await await bcrypt.hash("test", 10)
  const res = await app.request("/find-or-create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    
    body: JSON.stringify({
      username: "testUser",
      password_hash: passhash,
      fullName: "Test User",
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
    }),
  });
  
  expect(res.status).toBe(200);
});

test("should pass to /create-user 2nd user", async () => {
  const passhash = await await bcrypt.hash("test", 10)
  const res = await app.request("/create-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    
    body: JSON.stringify({
      username: "testuser2",
      password_hash: passhash,
      fullName: "Test User 2",
      firstName: "Test2",
      lastName: "User2",
      email: "test2@test.com",
    }),
  });
  expect(res.status).toBe(200);
});

test("should pass to /destroy", async () => {
  const res = await app.request("/destroy/testUser", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  ;
  expect(res.status).toBe(200);
});

test("should pass to /destroy 2nd user", async () => {
  const res = await app.request("/destroy/testuser2", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  ;
  expect(res.status).toBe(200);
});
