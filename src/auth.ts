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
          identifier: {
            type: "text",
            label: "Email",
            // placeholder: "johndoe@gmail.com",
          },
          password: {
            type: "password",
            label: "Password",
            placeholder: "*****",
          },
    },
    
    authorize: async (credentials) => {
        await dbConnect();
        try {
          if (!credentials?.identifier || !credentials?.password) {
            return null;
          }
          
          // console.log(credentials.identifier);
          // console.log(credentials.identifier.email);
          // console.log(credentials.password);
          const user = await UserModel.findOne({
            $or:[{email: credentials.identifier as string}, 
              {username: credentials.identifier as string}]
          })

          console.log("user send to token and session:",user);
          if(!user){
            throw new Error("no user found with this email")
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password)
          if(!isPasswordCorrect){
            throw new Error("incorrect password")
          }
          else{
            // Return a plain object that matches the expected User type
            return {
              _id: user._id?.toString(),
              username: user.username,
              email: user.email,
              password: ""
            }
          }
          
        } catch (err: unknown) {
          throw new Error(err instanceof Error ? err.message : 'Authentication failed')
        }
    }
    
})],

  callbacks: {
    async jwt({ token, user}) {
      if(user){
        token._id = user._id?.toString()
        token.username = user.username
      }
      return token
    },

    async session({ session, token}) {
      if(token){
        session.user._id = token._id?.toString()
        session.user.username = token.username as string
      }
      return session
    },
    
  },

  pages: {
    signIn: '/sign-in'
  },

  session:{
    strategy: 'jwt'
  },

  secret: process.env.AUTH_SECRET
})