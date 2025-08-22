import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import CategoryModal from "@/model/Category.model";
import { User } from "next-auth";
import { NextRequest } from "next/server";


export async function POST(request:NextRequest) {
    try {
        await dbConnect();

        const session = await auth()

        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status: 401})
        }

        const user:User = session.user

        const {category} = await request.json()
        if(!category || category.trim()===""){
            return Response.json({
                success: false,
                message: "Category Name is required"
            },{status: 400})
        }

        const categoryExist = await CategoryModal.findOne({category, userId:user._id})
        if(categoryExist){
            return Response.json({
                success: false,
                message: "Category already exists"
            },{status: 409})
        }

        await CategoryModal.create({
            category,
            userId: user._id
        })
        return Response.json({
            success: true,
            message: `Added new Category ${category}`
        },{status: 200})
    } catch (error) {
        console.error("POST /api/category error:", error);
        return Response.json(
          { success: false, message: "Something went wrong" },
          { status: 500 }
        );
    }
}

