"use client"
import styles from  '@/app/styles/signup.module.css'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signUpSchema } from '@/schemas/signUpSchema'
import { ApiResponse } from '@/Types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import {Loader2} from "lucide-react"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const SignUp = () => {
    const [isSubmitting, setIsSubmitting]  = useState(false)
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues:{
            username:"",
            email:'',
            password:''
        }
    })

    const onSubmit = async(data: z.infer<typeof signUpSchema>)=>{
        setIsSubmitting(true)
        try {
            const response = await axios.post("/api/sign-up",data)
            if(!response.data.success){
                let errorMessage = response?.data.message
                return toast(errorMessage)
            }

            toast("Success",{description: response.data.message})
            router.replace('/sign-in');
            setIsSubmitting(false)
        } catch (error) {
            console.log("Error in signup of user",error);
            const axiosError = error as AxiosError<ApiResponse>

            let errorMessage = axiosError.response?.data.message
            toast("Signup failed",{
                description: errorMessage,})
                setIsSubmitting(false)
        }
    }

    const navSignIn = async()=>{
        router.replace('/sign-in')
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-indigo-200">Join us and start your journey today</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">Username</FormLabel>

                    
                    <input
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your username"
                      {...field}
                    />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">Email Address</FormLabel>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-white/90">Password</FormLabel>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Already have an account?{" "}
              <button className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors duration-200 cursor-pointer"  onClick={navSignIn}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp