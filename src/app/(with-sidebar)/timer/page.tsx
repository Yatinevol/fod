"use client";
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from "react";

const Timer = () => {
    const [todayTrue, setTodayTrue] = useState(true)
    const [goalh, setGoalH] = useState(0);
    const [focusedMinutes, setFocusedMinutes] = useState(280);
   
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
                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${todayTrue ? 'bg-white text-black shadow-sm font-medium':'text-gray-600 hover:text-gray-800'}`}>Today</button>
                        <button onClick={()=> setTodayTrue(false)}
                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                                !todayTrue 
                                    ? 'bg-white text-black shadow-sm font-medium' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}>Week</button>
                    </div>
                </div>
                <div className='flex space-x-4'>
                    <h1>
                        Set Goal:
                    </h1>
                    {/* <select name="hours" value={goalh} onChange={(e)=>setGoalH(Number((e.target.value)))} id="hours">
                        <option value="">Select Hours</option>
                        <option value="0">00</option>
                        <option value="1">01</option>
                        <option value="2">02</option>
                        <option value="3">03</option>
                        <option value="4">04</option>
                        <option value="5">05</option>
                        <option value="6">06</option>
                        <option value="7">07</option>
                        <option value="8">08</option>
                        <option value="9">09</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                        <option value="15">15</option>
                        <option value="16">16</option>
                        <option value="17">17</option>
                        <option value="18">18</option>
                        <option value="19">19</option>
                        <option value="20">20</option>
                        <option value="21">21</option>
                        <option value="22">22</option>
                    </select> */}
                    <input className='w-16' type="number" id='hours' value={goalh} onChange={(e)=> setGoalH(Number(e.target.value))} min="0"/>
                    <span>Hours</span>

                </div>
                <div className='flex mt-3 space-x-2'>
                    <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                    onClick={()=>setGoalH((prev)=> prev + 4)}>+4h</button>
                    <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                    onClick={()=>setGoalH((prev)=> prev + 6)}>+6h</button>
                    <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                    onClick={()=>setGoalH((prev)=> prev + 8)}>+8h</button>
                </div>

                <div className='mt-3'>
                    <div className='flex justify-between'>
                    <h4>Progress for Today's Goal</h4>
                    <div>
                        {Math.round(focusedMinutes/60 * 10) / 10} / {goalh} hours
                    </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className='mt-2 w-full bg-gray-200 rounded-full h-3'>
                        <div 
                            className='bg-purple-500 h-3 rounded-full transition-all duration-300 ease-out'
                            style={{ 
                                width: `${goalh > 0 ? Math.min((focusedMinutes / 60 / goalh) * 100, 100) : 0}%` 
                            }}
                        />
                    </div>
                </div>
                <div>
                    <button>Set</button>
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