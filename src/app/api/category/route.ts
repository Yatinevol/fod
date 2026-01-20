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

        const categoryExist = await CategoryModal.findOne({name:category, userId:user._id})
        if(categoryExist){
            return Response.json({
                success: false,
                message: "Category already exists"
            },{status: 409})
        }

        await CategoryModal.create({
            name: category,
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

export async function GET(request:NextRequest) {
    try {
        await dbConnect()
        const session = await auth()

        if(!session || !session.user){
            return Response.json({
                success: false,
                message: "Not Authenticated"
            },{status: 401})
        }

        const user:User = session.user
        
        const categories = await CategoryModal.find({
            userId: user._id,
        })
        
        if(categories.length===0){
            return Response.json({
                success: false,
                message: "No category added yet"
            },{status: 404})
        }

         return Response.json({
            success: true,
            message: "Successfully fetched all the categories",
            categories
        },{status: 200})
    } catch (error) {
        console.error("GET /api/category error:", error);
        return Response.json(
          { success: false, message: "Something went wrong" },
          { status: 500 }
        );
    }
}