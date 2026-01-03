"use client";
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from "react";

const Timer = () => {
    const [todayTrue, setTodayTrue] = useState(true)
    const [goalTHr, setGoalTHr] = useState(0);
    const [goalWeekHr, setGoalWeekHr] = useState(0);
    const [isTodayGoalSet, setIsTodayGoalSet] = useState(false);
    const [isWeekGoalSet, setIsWeekGoalSet] = useState(false);
    const [lockedTodayGoal, setLockedTodayGoal] = useState(0);
    const [lockedWeekGoal, setLockedWeekGoal] = useState(0);
    const [focusedMinutes, setFocusedMinutes] = useState(280);
   
    // !isSet means : isTodayGoalSet/isWeekGoalSet === false
    const isSet = todayTrue ? isTodayGoalSet : isWeekGoalSet;
    const currentLockedGoal = todayTrue ? lockedTodayGoal : lockedWeekGoal;
    const handleSetGoal = ()=>{
        if(todayTrue && goalTHr > 0){
            setIsTodayGoalSet(true)
            setLockedTodayGoal(goalTHr)
        }else if(!todayTrue && goalWeekHr > 0){
            setIsWeekGoalSet(true)
            setLockedWeekGoal(goalWeekHr);
        }
    }
    const handleEditGoal = ()=>{
        if(todayTrue){
            if(lockedTodayGoal){
                setIsTodayGoalSet(false)
                setGoalTHr(lockedTodayGoal)
            }
        }else{
             if(lockedWeekGoal){
            setIsWeekGoalSet(false)
            setGoalWeekHr(lockedWeekGoal)
            }
        }
       
    }
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
                    <>
                        <div className='flex space-x-4'>
                            <h1>
                                Set Goal:
                            </h1>
                            <input 
                                className='w-16' 
                                type="number" 
                                id='hours' 
                                value={todayTrue ? goalTHr : goalWeekHr} 
                                onChange={(e)=> todayTrue ? setGoalTHr(Number(e.target.value)) : setGoalWeekHr(Number(e.target.value))} 
                                min="0"
                            />
                            <span>Hours</span>
                        </div>
                        <div className='flex mt-3 space-x-2'>
                            <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + 4) : setGoalWeekHr((prev)=> prev + 4)}>+4h</button>
                            <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + 6) : setGoalWeekHr((prev)=> prev + 6)}>+6h</button>
                            <button className='px-4 py-2 cursor-pointer bg-gray-200 rounded-sm'
                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + 8) : setGoalWeekHr((prev)=> prev + 8)}>+8h</button>
                        </div>
                    </>
                ):(
                    <div className='mt-4 p-3 bg-green-50 rounded-lg border border-green-200'>
                        <div className='flex justify-between items-center'>
                            <span className='text-green-700 font-medium'>
                                Goal Set: {currentLockedGoal} hours ({todayTrue ? 'Today' : 'This Week'})
                            </span>
                            <button 
                                onClick={handleEditGoal}
                                className='p-1 text-gray-600 hover:text-gray-800 transition-colors'
                                title="Edit goal"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
  
                <div className='mt-3'>
                    <div className='flex justify-between'>
                    <h4>Progress for {todayTrue ? "Today's" : "This Week's"} Goal</h4>
                    <div>
                        {Math.round(focusedMinutes/60 * 10) / 10} / {isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr)} hours
                    </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className='mt-2 w-full bg-gray-200 rounded-full h-3'>
                        <div 
                            className='bg-purple-500 h-3 rounded-full transition-all duration-300 ease-out'
                            style={{ 
                                width: `${(isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr)) > 0 ? Math.min((focusedMinutes / 60 / (isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr))) * 100, 100) : 0}%` 
                            }}
                        />
                    </div>
                </div>

                {/* Centered Set button - only show when goal is not set */}
                {!isSet && (
                    <div className='mt-3 flex justify-center'>
                        <button 
                            onClick={handleSetGoal}
                            disabled={(todayTrue ? goalTHr : goalWeekHr) === 0}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                                (todayTrue ? goalTHr : goalWeekHr) > 0 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Set Goal
                        </button>
                    </div>
                )}
            </div>

             {/* //timer div: */}
            <div>
                
            </div>
        </div>
    </div>
  )
}

export default Timer