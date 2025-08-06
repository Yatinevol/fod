import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import GoalModel from "@/model/Goal.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(request:NextRequest) {
    await dbConnect()
    try {
        // it is imp to check authentication api routes so check session exists or not.

        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status:401})
        }

        const user:User = session.user 
        
        const {title, category} = await request.json()
        if (!title || !category) {
            return Response.json({
              success: false,
              message: "Title and category are required",
            }, { status: 400 });
          }
      

        const goalExist = await GoalModel.findOne({title})
        if(goalExist){
            return Response.json({
                success: false,
                message:"Activity already exists"
            },{status: 400})
        }

        const goalCreated = await GoalModel.create({
            title,
            category,
            userId: user._id
        })

       return Response.json({
            success: true,
            message: "Your activity added successfully!",
            data: goalCreated
       },{status: 201})


    } catch (error) {
     console.error("unexpected error occured",error)
     return Response.json({
        success: false,
        message: "unexpected error occured creating your activity",
     },{status:500})   
    }
}

export async function GET(request:NextRequest) {
    
}