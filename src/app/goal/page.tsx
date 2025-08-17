"use client"
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from 'react'

const Goal = () => {
  const [category,setCategory] = useState("")
  return (
    <div>
      <header className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className='space-x-6'>
          <input type="text" placeholder='Search...' value={category} onChange={(e)=>setCategory(e.target.value)} className='bg-white p-3 w-96 rounded-xl' /> 

          <button className='bg-blue-600 text-white px-3 py-2'>
            Add Category
          </button>
        </div>
        <DateTime/>
      </header>

      <main>
        
      </main>
    </div>
  );
}

export default Goal