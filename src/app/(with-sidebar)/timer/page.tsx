"use client";
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from "react";

const Timer = () => {
    const [todayTrue, setTodayTrue] = useState(true)
    const [goalTHr, setGoalTHr] = useState(0);
    const [goalWeekHr, setGoalWeekHr] = useState(0);
    const [isTodayGoalSet, setIsTodayGoalSet] = useState(false);
    const [isWeekGoalSet, setIsWeekGoalSet] = useState(false);
    const [lockedTodayGoal, setLockedTodayGoal] = useState(false);
    const [lockedWeekGoal, setLockedWeekGoal] = useState(false);
    const [focusedMinutes, setFocusedMinutes] = useState(280);
   
    const isSet = todayTrue ? isTodayGoalSet : isWeekGoalSet;
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
                {!isSet ?(
                    
                ):()}
                <div className='flex space-x-4'>
                    <h1>
                        Set Goal:
                    </h1>
                    <input 
                        className='w-16' 
                        type="number" 
                        id='hours'
                        disabled={todayTrue ? lockedTodayGoal : lockedWeekGoal}
                        value={todayTrue ? goalTHr : goalWeekHr} 
                        onChange={(e)=> todayTrue ? setGoalTHr(Number(e.target.value)) : setGoalWeekHr(Number(e.target.value))} 
                        min="0"
                    />
                    <span>Hours</span>
                </div>
                <div className='flex mt-3 space-x-2'>
                    <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                    onClick={()=> isSet ? setGoalTHr((prev)=> prev + 4) : setGoalWeekHr((prev)=> prev + 4)}>+4h</button>
                    <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                    onClick={()=> isSet ? setGoalTHr((prev)=> prev + 6) : setGoalWeekHr((prev)=> prev + 6)}>+6h</button>
                    <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                    onClick={()=> isSet ? setGoalTHr((prev)=> prev + 8) : setGoalWeekHr((prev)=> prev + 8)}>+8h</button>
                </div>

                <div className='mt-3'>
                    <div className='flex justify-between'>
                    <h4>Progress for {todayTrue ? "Today's" : "This Week's"} Goal</h4>
                    <div>
                        {Math.round(focusedMinutes/60 * 10) / 10} / {todayTrue ? goalTHr : goalWeekHr} hours
                    </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className='mt-2 w-full bg-gray-200 rounded-full h-3'>
                        <div 
                            className='bg-purple-500 h-3 rounded-full transition-all duration-300 ease-out'
                            style={{ 
                                width: `${(todayTrue ? goalTHr : goalWeekHr) > 0 ? Math.min((focusedMinutes / 60 / (todayTrue ? goalTHr : goalWeekHr)) * 100, 100) : 0}%` 
                            }}
                        />
                    </div>
                </div>
                <div>
                    <button 
                        disabled={(todayTrue ? goalTHr : goalWeekHr) === 0}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                            (todayTrue ? goalTHr : goalWeekHr) > 0 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Set
                    </button>
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