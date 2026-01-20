import mongoose from "mongoose";

type ConnectionObject= {
    isConnected? : number
}
// const DBNAME = "fod" - Removed unused variable
const connection:ConnectionObject = {}
export const dbConnect = async function():Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to the database");
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState
        console.log("DB connected successfully!!!!");
        
    } catch (error) {
        console.log("Database connection failed :<",error);
        process.exit(1)
    }
}