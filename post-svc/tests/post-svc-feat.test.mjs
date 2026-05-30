import { describe, expect, it } from 'vitest';
import { app } from '../src/app.mjs'
import request from 'supertest';
describe('Sever working tests', function () {
  it('Should load explore all posts', function () {
    return request(app)
      .get('/explore/All%20Posts')
      .expect(200)
      
  });
  it('Should load Landing Page', function () {
    return request(app)
      .get('/')
      .expect(200)
  });

});
describe("USER SERVICE STATE TESTING", () => {
  const agent = request.agent(app);
   it("should create new user", async () => {
    const res = await agent
      .post("/users/create")
      .send({
        username: "testUser",
        password: "test",
        fullName: "Test User",
        firstName: "Test",
        lastName: "User",
        email: "test@test.com"
      })
      .set("Content-Type", "application/json")
      .expect(302);

    expect(res.headers["location"]).toBe(
      `/users/login?level=success&massage=${encodeURIComponent("User account created. Now you can Login.")}`
    );
  });
  
  it("should login newly created user", async () => {
    const res = await agent
      .post("/users/login")
      .send({
        username: "testUser",
        password: "test",
      })
      .set("Content-Type", "application/json")
      .expect(302);
    expect(res.headers["location"]).toBe("/users/profile/testuser");
  });

  it("should Load new test user profle", async () => {
    const res = await agent
      .get("/users/profile/testuser")
      .expect(200);
    console.log(res.headers["cookies"])

  });
  it("should delete testuser", async () => {
    const res = await agent
      .get("/users/destroy")
      .expect(302);

    expect(res.headers["location"]).toBe(
      "/?level=warning&massage=" + encodeURIComponent("! User Account Deleted")
    );
  });
});


describe("USER CREATION , POST CREATION , AND DELETING", () => {
  const agent = request.agent(app)
  it("should create new user", async () => {
    const res = await agent
      .post("/users/create")
      .send({
        username: "testUser",
        password: "test",
        fullName: "Test User",
        firstName: "Test",
        lastName: "User",
        email: "test@test.com"
      })
      .set("Content-Type", "application/json")
      .expect(302);

    expect(res.headers["location"]).toBe(
      `/users/login?level=success&massage=${encodeURIComponent("User account created. Now you can Login.")}`
    );
  });
  
  it("should login newly created user", async () => {
    const res = await agent
      .post("/users/login")
      .send({
        username: "testUser",
        password: "test",
      })
      .set("Content-Type", "application/json")
      .expect(302);
    expect(res.headers["location"]).toBe("/users/profile/testuser");
  });
  let postURL ;
  it("should create new post", async() => {
    const res = await agent
      .post("/posts/save")
      .send({
        title: "test post 1",
        body: "first post",
        catg1: "Coding",
        catg2: "World",
        catg3: "Coding",
        docreate :"create",
        imageURL: null,
      })
      .set("Content-type", "application/json")
      .expect(302)
    postURL =res.headers["location"]
    expect(res.headers["location"]).toMatch(/^\/posts\/view\?key=.+/)
  })
  it("should get newly created post", async () => {
    const res = await agent
      .get(postURL)
      .expect(200)
  })
  
  it("should delete newly created post", async () => {
    const postkey = postURL.slice(postURL.lastIndexOf("=")+1)
    const res = await agent
      .post("/posts/destroy/confirm")
      .send({
        postkey: postkey
      })
      .set("Content-Type", "application/json")
      .expect(302)

    expect(res.headers["location"]).toBe("/")
  })

  it("should delete testuser", async () => {
    const res = await agent
      .get("/users/destroy")
      .expect(302);

    expect(res.headers["location"]).toBe(
      "/?level=warning&massage=" + encodeURIComponent("! User Account Deleted")
    );
  });
  
})
