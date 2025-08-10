"use client"
import axios from 'axios';

const GOAL = () => {
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
        } catch (error) {
            console.log("error",error);
        }
    }
  return (
    <div><button onClick={createGoal} className='bg-indigo-600 text-white px-3 py-2 hover:font-bold hover:text-2xl hover:cursor-pointer'>
            Press me....
        </button></div>
  )
}

export default GOAL