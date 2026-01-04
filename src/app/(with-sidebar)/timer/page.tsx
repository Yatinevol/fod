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
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEditingTimer, setIsEditingTimer] = useState(false)
    // Add timer settings states
    const [workHr, setWorkHr] = useState(0);
    const [workMin, setWorkMin] = useState(1);
    const [workSec, setWorkSec] = useState(0);  
    const [breakTime, setBreakTime] = useState(5);
    const [longBreak, setLongBreak] = useState(15);
    
    const handleEditTimer = ()=>{
        setIsEditingTimer((prev)=> !prev)
         const date = new Date()
            console.log(date);
    }
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
    const handlePlayTimer = ()=>{

       if(isPlaying){
            // stop the timer:
            if(timer){
                clearInterval(timer)
                setTimer(null)
            }
            setIsPlaying(false)
       }else{
            setIsPlaying(true)
            let totalSecs = workHr * 3600 + workMin * 60 + workSec;
        
            const newTimer = setInterval(() => {
                totalSecs--;
                
                if (totalSecs <= 0) {
                    clearInterval(newTimer);
                    setTimer(null);
                    setIsPlaying(false);
                    console.log("Time is up");
                    return;
                }
            
            const hours = Math.floor(totalSecs / 3600);
            const min = Math.floor((totalSecs % 3600) / 60);
            const sec = totalSecs % 60;
            
            setWorkHr(hours);
            setWorkMin(min);
            setWorkSec(sec);
        }, 1000);
        
            setTimer(newTimer);

       }

    }
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
    useEffect(()=>{
        console.log("isPlaying updated to:", isPlaying);
    },[isPlaying])
  return (
    <div>
        <div className='flex justify-between border-b-2 border-gray-300 pb-2 mb-4'>
            <h1>Timer</h1>
            <DateTime  className="font-bold hidden md:block"/>
        </div>

        <div className='flex gap-6'>
            {/* set goal div: */}
            <div className='bg-white rounded-lg border border-gray-200 p-6 flex-1'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-lg font-semibold'>Goal Setting</h1>
                    <div className='bg-gray-100 rounded-lg p-1'>
                        <button onClick={() => setTodayTrue(true)}
                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer text-sm ${todayTrue ? 'bg-purple-600 text-white shadow-sm font-medium':'text-gray-600 hover:text-gray-800'}`}>Today</button>
                        <button onClick={()=> setTodayTrue(false)}
                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer text-sm ${
                                !todayTrue 
                                    ? 'bg-purple-600 text-white shadow-sm font-medium' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}>Week</button>
                    </div>
                </div>
                {!isSet ?(
                    <>
                        <div className='flex items-center space-x-4 mb-4'>
                            <h3 className='text-gray-700 font-medium'>
                                Set Goal:
                            </h3>
                            <input 
                                className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center font-semibold' 
                                type="number" 
                                id='hours' 
                                value={todayTrue ? goalTHr : goalWeekHr} 
                                onChange={(e)=> todayTrue ? setGoalTHr(Number(e.target.value)) : setGoalWeekHr(Number(e.target.value))} 
                                min="0"
                            />
                            <span className='text-gray-700'>hours</span>
                        </div>
                        <div className='flex space-x-2 mb-6'>
                            <button className='px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors'
                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + 4) : setGoalWeekHr((prev)=> prev + 4)}>+4h</button>
                            <button className='px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors'
                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + 6) : setGoalWeekHr((prev)=> prev + 6)}>+6h</button>
                            <button className='px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors'
                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + 8) : setGoalWeekHr((prev)=> prev + 8)}>+8h</button>
                        </div>
                    </>
                ):(
                    <div className='mb-6 p-4 bg-green-50 rounded-lg border border-green-200'>
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
  
                <div>
                    <div className='flex justify-between items-center mb-3'>
                        <h4 className='text-gray-700 font-medium'>Progress for {todayTrue ? "Today's" : "This Week's"} Goal</h4>
                        <div className='text-sm font-semibold text-gray-600'>
                            {Math.round(focusedMinutes/60 * 10) / 10} / {isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr)} hours
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
                        <div 
                            className='bg-purple-500 h-2 rounded-full transition-all duration-300 ease-out'
                            style={{ 
                                width: `${(isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr)) > 0 ? Math.min((focusedMinutes / 60 / (isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr))) * 100, 100) : 0}%` 
                            }}
                        />
                    </div>
                </div>

                {/* Centered Set button - only show when goal is not set */}
                {!isSet && (
                    <div className='flex justify-center'>
                        <button 
                            onClick={(handleSetGoal)}
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

             {/* timer div: */}
            <div className='bg-white rounded-lg border border-gray-200 p-6 flex-1 max-w-md relative'>
                <div className='flex justify-between items-center mb-8'>
                    <h1 className='text-lg font-semibold'>Pomodoro Timer</h1>
                    <button className='p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100' onClick={handleEditTimer}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                
                {/* Settings Container */}
                {isEditingTimer && (
                    <div className='absolute top-[72px] left-6 right-6 bottom-6 bg-white rounded-lg z-10 p-0 flex flex-col'>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-lg font-semibold'>Timer Settings</h2>
                            <button onClick={handleEditTimer} className='p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100'>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className='flex-1 flex flex-col justify-center space-y-8'>
                            <div className='flex justify-between items-center'>
                                <label className='text-gray-700 font-medium'>Work Time</label>
                                <div className='flex items-center space-x-2'>
                                    <input 
                                        type="number" 
                                        value={workMin} 
                                        onChange={(e) => setWorkMin(Number(e.target.value))}
                                        className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center'
                                        min="1"
                                        max="60"
                                    />
                                    <span className='text-gray-600'>min</span>
                                </div>
                            </div>
                            
                            <div className='flex justify-between items-center'>
                                <label className='text-gray-700 font-medium'>Break Time</label>
                                <div className='flex items-center space-x-2'>
                                    <input 
                                        type="number" 
                                        value={breakTime} 
                                        onChange={(e) => setBreakTime(Number(e.target.value))}
                                        className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center'
                                        min="1"
                                        max="30"
                                    />
                                    <span className='text-gray-600'>min</span>
                                </div>
                            </div>
                            
                            <div className='flex justify-between items-center'>
                                <label className='text-gray-700 font-medium'>Long Break</label>
                                <div className='flex items-center space-x-2'>
                                    <input 
                                        type="number" 
                                        value={longBreak} 
                                        onChange={(e) => setLongBreak(Number(e.target.value))}
                                        className='w-16 px-3 py-2 border border-gray-300 rounded-md text-center'
                                        min="5"
                                        max="60"
                                    />
                                    <span className='text-gray-600'>min</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className='flex justify-center pt-6'>
                            <button 
                                onClick={handleEditTimer}
                                className='px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors'
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Timer Circle */}
                <div className='flex flex-col items-center mb-8'>
                    <div className='relative w-48 h-48 rounded-full border-4 border-purple-200 flex items-center justify-center mb-4'>
                        <div className='text-center'>
                            <div className='text-4xl font-bold text-purple-600 mb-2'>
                                <span>{workHr===0 && (0)}{workHr}</span>
                                <span>:</span>
                                <span>{workMin}</span>
                                <span>:</span>
                                <span>{workSec===0 && (0)}{workSec}</span>
                            </div>
                        </div>
                    </div>
                    <div className='text-gray-600 font-medium mb-6'>Work Session</div>
                    
                    {/* Control Buttons */}
                    <div className='flex space-x-3'>
                            <button 
                                onClick={handlePlayTimer}
                                className='w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition-colors'
                            >
                                {isPlaying ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>
                            <button className='w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition-colors'>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button className='w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition-colors'>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                                </svg>
                            </button>
                        </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Timer