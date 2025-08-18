"use client"
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from 'react'

const Goal = () => {
  const [category,setCategory] = useState("")
  const [categories, setCategories] = useState(["Hobbies","Career"])
  const [active, setActive] = useState("Hobbies");
  return (
    <div>
      <header className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold ml-44">Tasks</h1>
        <div className='space-x-6'>
          <input type="text" placeholder='Search...' value={category} onChange={(e)=>setCategory(e.target.value)} className='bg-white p-3 w-96 rounded-xl' /> 

          <button className='bg-blue-600 text-white px-3 py-2 cursor-pointer rounded-sm'>
            Add Category
          </button>
        </div>
        <DateTime/>
      </header>

      <div className='mt-11 ml-44 text-xl space-x-6'>
        
      {categories.map((each) => (
        <button
          key={each}
          onClick={() => setActive(each)}
          className="relative pb-1"
        >
          <span className={active === each ? "text-black font-semibold" : "text-gray-500"}>
            {each}
          </span>

          {/* underline */}
          <span
            className={`absolute rounded-4xl left-0 bottom-0 h-[2px] 
              bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 
              transition-all duration-300 
              ${active === each ? "w-full" : "w-0"}`}
          />
        </button>
      ))}
        
      </div>
    </div>
      
  );
}

export default Goal