import { PrismaPictureStore } from "./picture-prisma.mjs";
import { prisma } from "./prisma.js";

const picStore = new PrismaPictureStore()

  async function mvPic(params) {
    const users = await prisma.postUser.findMany({
      select: {
        id: true,
        username: true,
        photo: true,
        photoType: true
      },
    })
    users.forEach(async user => {
      const pic = await picStore.add(user.photo, "/assets/users/pictures/", user.photoType);
      const updateUser = await prisma.postUser.update({
        where: {
          id: user.id
        },
        data: {
          photoURL: pic.url,
          photo: null,
          
        },
        select: {
          username: true,
          photoURL: true,
          photo: true
        }
      })
      console.log(updateUser)
    })

  }
  
  await mvPic()