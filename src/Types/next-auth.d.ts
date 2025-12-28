
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth"{
    interface User{
        _id?: string;
        username?: string;
        createdAt?: Date

    }

    interface Session{
        user:{
            _id?: string;
            username?: string;
            createdAt?: Date
        }& DefaultSession["user"]
    }
}

declare module "next-auth/jwt"{
    interface JWT{
        _id?: string;
        username?: string;
    }
}