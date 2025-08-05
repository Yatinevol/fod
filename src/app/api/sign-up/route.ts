import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";


export async function POST(request:Request) {
    await dbConnect()

    try {
        const {username, email, password} = await request.json()
        const existingUser = await UserModel.findOne({
            $or:[{email},{username}]
        })

        if(existingUser){
            return Response.json({
                success: false,
                message: "User already exists, try logging in"
            },{status: 400})
        }
        
        const hashedPassword = await bcrypt.hash(password,10)

        await UserModel.create({
            username,
            email,
            password: hashedPassword
        })
        return Response.json({
            success: true,
            message: "user registered successfully!"
        },{status: 200})
    } catch (error) {
        console.log('Error registering user',error);
        return Response.json({
            success: false,
            message: "Error registering user"
        },{status: 500})
    }
}