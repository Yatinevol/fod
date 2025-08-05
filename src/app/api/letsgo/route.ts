import { dbConnect } from "@/lib/dbConnect";


export async function GET(request:Request) {
    try {
        await dbConnect()
        return Response.json({
            success: true,
            message: "Db connected successfully"
        })
        
    } catch (error) {
        console.log("db was not connected!!!", error);

    }

}   