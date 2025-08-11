import { signUpSchema } from '@/schemas/signUpSchema'
import { ApiResponse } from '@/Types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { Router } from 'next/router'
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
            router.replace('/goal');
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
  return (
    <div></div>
  )
}

export default SignUp