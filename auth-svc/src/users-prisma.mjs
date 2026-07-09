import { prisma } from './lib/prisma.js';

export async function connectDB() {
  try {
    await prisma.$connect()
  } catch (error) {
    console.error(error)
  }
}
export async function disconnetDB() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error(error)
  }
}
export function userParams(reqBody) {
  const params = {
    username: reqBody.username,
    password_hash: reqBody.password_hash,
    provider: reqBody.provider,
    pid: reqBody.pid,
    displayName: reqBody.displayName,
    fullName: reqBody.fullName,
    firstName: reqBody.firstName,
    lastName: reqBody.lastName,
    email: reqBody.email,
    photoURL: reqBody.photoURL,
    photoType: reqBody.photoType
  }
  return params;
}

export function sanitizedUser(user) {
  const sanitized = {
    id: user.id,
    username: user.username,
    provider: user.provider,
    pid: user.pid,
    fullName: user.fullName,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photoURL: user.photoURL,
    photoType: user.photoType
  }
  return sanitized;
}
export const DBUsers = prisma.users;

export async function findOneUser(userId) {
  try {
    const user = await DBUsers.findUnique({
      where: {
        id: userId
      }
    });
    if (user) {
      const sanitized = sanitizedUser(user);
      return sanitized;
    }
    return user;

  } catch (error) {
    console.error(error)
  }
}

export async function createUser(body) {
  try {
    const user = await DBUsers.create({
      data: userParams(body)
    })
    const sanitized = sanitizedUser(user);
    return sanitized;
  } catch (error) {
    console.error(error)
  }
}

