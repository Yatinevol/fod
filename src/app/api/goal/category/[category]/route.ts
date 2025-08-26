import { auth } from "@/auth"
import { dbConnect } from "@/lib/dbConnect"
import GoalModel from "@/model/Goal.model"
import { User } from "next-auth"
import { NextRequest } from "next/server"

export async function GET(request:NextRequest,context:{params: Promise<{category:string}>}) {
    const {category} = await context.params
    // console.log("category: ",category);
    await dbConnect()
    try {
        const session = await auth()
        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status:401})
        }

        const user:User = session.user 

        const goals = await GoalModel.find({
            category,
            isActive: true,
            userId: user._id
          })
          .sort({ createdAt: -1 })
          .select("_id title");

        if(!goals){
            return Response.json({
                success: false,
                message: "category not found"
            },{status: 500})
        }
        
        return Response.json({
            success: true,
            message: "Retrieved all goals successfully!",
            goals: goals || {category , goals:[]}
        },{status: 200})
    } catch (error) {
        console.error("cannot find the goals:",error)
        return Response.json({
            success: false,
            message: "category not found"
        },{status: 500})
    }
}   

// mongodb: different ways: 
// 1
// const goals = await Goal.find({
//     category: category,
//     status: "active"
//   });

//   res.status(200).json({
//     category: category,
//     goals: goals.map(goal => ({
//       title: goal.title,
//       description: goal.description,
//       _id: goal._id,
//     }))

// 2
// const goals = await Goal.find({
//     category,
//     isActive: true
//   }).select("title isActive");

//   res.status(200).json({
//     category,
//     goals
//   });