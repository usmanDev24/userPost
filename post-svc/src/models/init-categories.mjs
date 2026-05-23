
import { prisma } from './prisma.js';

const catgList = [
  "Science",
  "Earth",
  "World",
  "Space",
  "Politics",
  "War",
  "Nature",
  "Health",
  "Travel",
  "Blog",
  "SciFi",
  "Tech",
  "Software",
  "Hardware",
  "Ai",
  "PostBase",
  "Cyber Security",
  "Haking",
  "Gaming Addiction",
  "Addiction",
  "Linux",
  "Windows",
  "Android",
  "Ai Bubble",
  "WWIII",
  "Coding",
  "JavaScript",
  "Python",
  "C++",
  "Rust",
]

class InitCategories {

  toPrismaData(list) {
    return list.map(catg => {
      return { name: catg }
    })
  }

  async addAll(catgList) {
    try {
      const data = this.toPrismaData(catgList)
      const isAlready = await this.readAll();

      if (isAlready.length === data.length) {
        console.log(isAlready);
        return
      }
      await prisma.categories.createMany({
        data: this.toPrismaData(catgList),
        skipDuplicates: true
      })
      console.log("Categories Init...")
    } catch (error) {
      console.log(error)
    }
  }
  async readAll() {
    return prisma.categories.findMany();
  }
}
async function main() {
  const initCatgs = new InitCategories()
  await initCatgs.addAll(catgList)
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    // This block ALWAYS runs, guaranteeing no leaked connections
    await prisma.$disconnect()
    process.exit()
  })
