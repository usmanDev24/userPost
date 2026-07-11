import { db } from "./db/drizzle";
import { usersTable } from "./db/schema";
import { eq, getColumns } from "drizzle-orm";

const { password_hash, photo, ...publicColumns } = getColumns(usersTable);

export class UsersDataBase {
  async findMany() {
    return db.query.usersTable.findMany();
  }

  async createUser(reqBody) {
    const user = await db
      .insert(usersTable)
      .values({ ...reqBody })
      .returning();
    return sanitizedUser(user[0]);
  }

  async findUserName(username) {
    const user = await db
      .select(publicColumns)
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);
    return user[0];
  }
  async getFull(username) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);
    return user[0];
  }
  async findEmail(email) {
    const user = await db
      .select(publicColumns)
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return user[0];
  }
  async find(id) {
    const user = await db
      .select(publicColumns)
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return user[0];
  }

  async updatePhoto(id, photoURL, photoType) {
    const user = await db
      .update(usersTable)
      .set({ photoURL, photoType })
      .where(eq(usersTable.id, id))
      .returning();
    return sanitizedUser(user[0]);
  }
  async update(username, data) {
    const user = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.username, username))
      .returning();
    return sanitizedUser(user[0]);
  }

  async destroy(id) {
    const deletedId = await db.delete(usersTable).where(eq(usersTable.id, id)).returning({deletedId: usersTable.id});
    return deletedId[0]
  }
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
    photoType: user.photoType,
  };
  return sanitized;
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
    photoType: reqBody.photoType,
  };
  return params;
}
