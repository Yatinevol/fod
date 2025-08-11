"use client"
import axios from 'axios';
import { useState } from 'react';

const GOAL = () => {
    const [loading, setLoading] = useState(".....");
    const createGoal = async()=>{
        try {
            const response = await axios.post('/api/goal',{
                title : "vocals",
                category : "hobbies"
            },{
                headers : {
                    Authorization : `Bearer ${process.env.AUTH_SECRET}`
                }
            })
            console.log("response:",response);
            prompt(response.data.message)
            setLoading(response.data.message)

        } catch (error) {
            console.log("error",error);
        }
    }
  return (
    <div><button onClick={createGoal} className='bg-indigo-600 text-white px-3 py-2 hover:font-bold hover:text-2xl hover:cursor-pointer'>
            Press me....
        </button>
        <div>{loading}</div>
        </div>
    
  )
}

export default GOAL