"use client";
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from "react";

const Timer = () => {
    const [todayTrue, setTodayTrue] = useState(true)
  return (
    <div>
        <div className='flex justify-between border-b-2 border-gray-300     pb-2 mb-4'>
            <h1>Timer</h1>
            <DateTime  className="font-bold hidden md:block"/>
        </div>

        <div>
            {/* set goal div: */}
            <div>
                <div className='flex justify-between'>
                    <h1>Goal Setting</h1>
                    <div >
                        <button onClick={() => setTodayTrue(true)}
                        className={`px-4 py-2 rounded-md transition-colors ${todayTrue ? 'bg-white text-black shadow-sm font-medium':'text-gray-600 hover:text-gray-800'}`}>Today</button>
                        <button onClick={()=> setTodayTrue(false)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                                !todayTrue 
                                    ? 'bg-white text-black shadow-sm font-medium' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}>Week</button>
                    </div>
                </div>
            </div>

             {/* //timer div: */}
            <div>

            </div>
        </div>
    </div>
  )
}

export default Timer