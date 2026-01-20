"use client"
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { signInSchema } from '@/schemas/signInSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
const SignIn = () => {
  const router = useRouter()
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues:{
      identifier: "",
      password: ""
    }
  })

  const onSubmit = async(data:z.infer<typeof signInSchema>)=>{
      const result = await signIn('credentials',{
        identifier: data.identifier,
        password: data.password,
        redirect: false
      })

      if(result?.error){
        if(result.error === "CredentialsSignin"){
          toast("Login Failed",{description:"incorrect username or password"})
        }else{
          toast("error",{description:result.error})
        }
     }
     if(result?.url){
      router.replace("/goal")
     }
  }
  return (
    <div className='min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4'>
      <div className='w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Sign in to your Fod account
          </h1>
        </div>
        <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="identifier"
            control={form.control}
            render={({field})=>(
              <FormItem>
                <FormLabel className="text-sm font-medium text-white/90">Email/Username</FormLabel>
                <input className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200" placeholder='Username or email address'  {...field}/>
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({field})=>(
              <FormItem>
                <FormLabel className="text-sm font-medium text-white/90">Password</FormLabel>
                <input type='password' className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200" placeholder='Password' {...field}/>
              </FormItem>
            )}
          />
          <Button
                
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Sign in
              </Button>
        </form>
        </Form>
      </div>
    </div>
  )
}

export default SignIn