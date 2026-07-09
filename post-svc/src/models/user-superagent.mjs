import { default as request } from "superagent";
import { default as bcrypt } from 'bcryptjs';
import { sign, verify, decode } from "jsonwebtoken";
import * as url from "node:url";
import debug from "debug";

const URL = url.URL;
const log = debug("notes:users-superagent");
const error = debug('notes:error-superagent');
const saltRound = 10;
async function genHash(password) {
  return await bcrypt.hash(password, saltRound)
}


const AUTHTOKEN = process.env.USER_AUTHTOKEN


function reqURL(path) {
  const requrl = new URL(process.env.USER_SERVICE_URL);
  requrl.pathname = path
  return requrl.toString()
}

export async function create(username, password,
  provider, pid, displayName, fullName, firstName, lastName,
  email, photoURL, photoType) {
  let password_hash = await genHash(password)
  const res = await request.post(reqURL('/create-user'))
    .send({
      username, password_hash,
      provider, pid, displayName, fullName, firstName, lastName,
      email, photoURL,  photoType
    })
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body
}

export async function update(username, password,
  provider, pid, displayName, fullName, firstName, lastName,
  email, photoURL, photoType) {
    let password_hash = await genHash(password)
  const res = await request.post(reqURL(`/update-user/${username}`))
    .send({
      username, password_hash,
      provider, pid, displayName, fullName, firstName, lastName,
      email, photoURL, photoType
    })
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body
}

export async function findOrCreate(profile) {
  var res = await request
    .post(reqURL('/find-or-create'))
    .send({
      username: profile.username, password_hash: await genHash(profile.password),
      provider: profile.provider,pid: profile.pid,
      displayName: profile.displayName,
      fullName: profile.fullName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email, photoURL: profile.photoURL,
      photoType: profile.photoType
    }).set('Content-Type', 'application/json')
    .set('Acccept', 'application/json')
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}
export async function passwordCheck(username, password) {
  const res = await request.post(reqURL(`/password-check`))
    .send({ username, password })
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}
export async function destroy(username) {
  const res = await request.delete(reqURL(`/destroy/${username}`))
    .set('content-type', "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}
export async function findUserName(username) {
  const res = await request.get(reqURL(`/find/username/${username}`))
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}
export async function find(userId) {
  const res = await request.get(reqURL(`/find/${userId}`))
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}

export async function findEmail(email) {
  const res = await request.get(reqURL(`/find/email/${email}`))
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}
export async function updatePhoto(id, photoURL, photoType) {
  const res= await request.post(reqURL(`/update-user/photo/${id}`))
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"})
    .send({photoURL, photoType});
  return res.body;
}
export async function list() {
  const res = await request.get(reqURL(`/list`))
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .auth(AUTHTOKEN, {type: "bearer"});
  return res.body;
}


async function test() {
  try {
    const user =await find('hello')
  } catch (error) {
    if (error.status === 404) {

    }
    console.error(error)
  }
}
