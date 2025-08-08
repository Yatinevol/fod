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

export async function GET(request:NextRequest,{params}:{params: {category:string}}) {
    const category = params.category
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

        const allgoals = await GoalModel.aggregate([
            {$match: {category: category, isActive:true, userId: user._id}},
            {$sort: {createdAt: -1}},
            {
                $group:{
                    _id: "$category",
                    goals:{
                        $push:{
                            _id: "$_id",
                            title: "$title",

                        }
                    }
                }
            },{
                $project:{
                    _id: 0,
                    category : "$_id",
                    goals: 1
                }
            }


        ])

        if(!allgoals){
            return Response.json({
                success: false,
                message: "category not found"
            },{status: 500})
        }

        return Response.json({
            success: true,
            message: "Retrieved all goals successfully!",
            goals: allgoals[0] || {category , goals:[]}
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