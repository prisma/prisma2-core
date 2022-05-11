export default ({ provider, id, foreignKeyId }) => {
  return /* Prisma */ `
    generator client {
      provider = "prisma-client-js"
    }
    
    datasource db {
      provider = "${provider}"
      url      = env("DATABASE_URI_${provider}")
    }
    
    model User {
      id ${id}
      email String  @unique
      age   Int
      name  String?
      posts Post[]
    }

    model Post {
      id ${id}
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      published Boolean
      title     String
      content   String?
      authorId  ${foreignKeyId}
      author    User?    @relation(fields: [authorId], references: [id])
    }

    `
}
