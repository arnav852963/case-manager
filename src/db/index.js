import {PrismaClient} from "@prisma/client"

const prisma =new PrismaClient()
const db = async ()=>{
    try{
        await prisma.$connect()
        console.log("connected to prisma --->" , )

    }
    catch (e){
        console.log("error in prisma connection")
        process.exit(1)
    }
}
export default db