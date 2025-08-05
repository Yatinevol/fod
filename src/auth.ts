import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { dbConnect } from "./lib/dbConnect"
import UserModel from "./model/User.model";
import bcrypt from "bcryptjs";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({
    id: "credentials",
    name: "Credentials",
    credentials:{
        email: {
            type: "email",
            label: "Email",
            // placeholder: "johndoe@gmail.com",
          },
          password: {
            type: "password",
            label: "Password",
            placeholder: "*****",
          },
    },
    
    authorize: async (credentials:any, req): Promise<any> =>{
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or:[{email: credentials.identifier}, 
              {username: credentials.identifier}]
          })

          if(!user){
            throw new Error("no user found with this email")
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

          if(!isPasswordCorrect){
            throw new Error("incorrect password")
          }
          else{
            return user
          }
        } catch (err:any) {
          throw new Error(err)
        }
    }
    
})],

  callbacks: {

  },

  pages: {
    signIn: '/sign-in'
  },

  session:{
    strategy: 'jwt'
  },

  secret: process.env.AUTH_SECRET
})