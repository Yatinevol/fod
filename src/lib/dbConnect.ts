import mongoose from "mongoose";

type ConnectionObject= {
    isConnected? : number
}
// const DBNAME = "fod" - Removed unused variable
const connection:ConnectionObject = {}
export const dbConnect = async function():Promise<void>{
    if(connection.isConnected){
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState
        
    } catch {
        process.exit(1)
    }
}