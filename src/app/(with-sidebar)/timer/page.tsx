"use client";
    import DateTime from '@/components/DateTime';
    import Session from '@/components/Session';
    import axios from 'axios';
    import { useSession } from 'next-auth/react';
    import React, { useCallback, useEffect, useRef, useState } from "react";
    import { toast } from 'sonner';

    const Timer = () => {
        const [todayTrue, setTodayTrue] = useState(true)
        const [goalTHr, setGoalTHr] = useState(0);
        const [goalWeekHr, setGoalWeekHr] = useState(0);
        const [isTodayGoalSet, setIsTodayGoalSet] = useState(false);
        const [isWeekGoalSet, setIsWeekGoalSet] = useState(false);
        const [lockedTodayGoal, setLockedTodayGoal] = useState(0);
        const [lockedWeekGoal, setLockedWeekGoal] = useState(0);
        // it is keeping track of the progress of the target.
        const [focusedMinutes, setFocusedMinutes] = useState(0);
        const [isPlaying, setIsPlaying] = useState(false);
        const [isEditingTimer, setIsEditingTimer] = useState(false)
        // Add timer settings states
        const [workHr, setWorkHr] = useState(0);
        const [workMin, setWorkMin] = useState(25);
        const [workSec, setWorkSec] = useState(0);  
        const [breakTime, setBreakTime] = useState(5);
        const [savedHr, setSavedHr] = useState(0)
        const [savedMin, setSavedMin] = useState(25)
        const [savedSec, setSavedSec] = useState(0)

        // SESSION STATES - NEW 
        const [isCreating, setIsCreating] = useState(false)
        const [isSessionActive, setIsSessionActive] = useState(false);
        const [sessionId, setSessionId] = useState<string>('');
        const [sessionLink, setSessionLink] = useState<string>('');
        const [participants, setParticipants] = useState([]);

        // Use useRef instead of useState for timer
        const timerRef = useRef<NodeJS.Timeout | null>(null);

        // New states for joining session
        const [joinSessionLink, setJoinSessionLink] = useState('');
        // using client side auth to session info:
        const {data: session} = useSession()

        useEffect(()=>{
            const fetchActiveSession=async()=>{
                if(!session?.user)return;

                try {
                    const response = await axios.get('/api/user/active-session')
                    if(response.data.hasActiveSession){
                        setIsSessionActive(true);
                        setSessionId(response.data.sessionData.sessionId);
                        setSessionLink(response.data.sessionData.sessionLink);
                        setFocusedMinutes(response.data.sessionData.totalFocusMinutes)
                        setGoalWeekHr(response.data.sessionData.weeklyGoalHours);
                        setForHost(response.data.sessionData.isHost);
                        setIsWeekGoalSet(true);
                        setLockedWeekGoal(response.data.sessionData.weeklyGoalHours);
                        setParticipants(response.data.sessionData.participants);
                        setTodayTrue(false);
                    }
                } catch {
                    toast.error('Failed to fetch session state');
                }
            }
            fetchActiveSession()

        },[session?.user])

        // Goal fetch:
        useEffect(()=>{
            const fetchUserGoals = async()=>{
                if(!session?.user)return;
                try {
                    const response = await axios.get("/api/timer")
                    const tGoalS = response.data
                    if(response.data.todayGoal.isTodayGoalSet){
                        setIsTodayGoalSet(true)
                        setLockedTodayGoal(tGoalS.todayGoal.targetMinutes)
                        setGoalTHr(tGoalS.todayGoal.targetMinutes)
                        if(!isSessionActive){
                            setFocusedMinutes(tGoalS.todayGoal.totalFocusMinutes)
                        }
                    }
                    if(tGoalS.weekGoal.isWeekGoalSet){
                        setIsWeekGoalSet(tGoalS.weekGoal.isWeekGoalSet)
                        setLockedWeekGoal(tGoalS.weekGoal.targetMinutes)
                        setGoalWeekHr(tGoalS.weekGoal.targetMinutes)
                    }
                } catch {
                    toast.error('Failed to fetch goals');
                }
            }
            if (session?.user) {
                fetchUserGoals();
            }
        },[session?.user, isSessionActive])
        // SESSION FUNCTIONS - NEW
        const handleCreateSession = async()=>{
            setIsCreating(true)
            try {
                setIsSessionActive(true)
        
                const response = await axios.post("/api/session/create",{
                    goalWeekHr
                })
                const {sessionLink, sessionId} = response.data
                setSessionId(sessionId)
                setSessionLink(sessionLink) 
                
            } catch (error) {
                setIsSessionActive(false);
                const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to create session. Please try again.";
                toast.error(errorMessage);
            }finally{
                setIsCreating(false)
                // setIsSessionActive(false)
            }
        }
        const handleUpdateProgress = async(focusedMinutes:number)=>{
            try {
                const response = await axios.post(`/api/session/update-progress/${sessionId}`,{focusedMinutes})
                if(response.data.success){
                    setParticipants(response.data.session.participants)
                }
            } catch {
                toast.error('Failed to update progress');
            }
        }
        const handleGoalProgress = async(focusedMinutes:number)=>{
            try {
                const response = await axios.post('/api/timer/update-timer',
                    {focusedMinutes, isWeekly: !todayTrue})
                if(response.data.message === "Today Goal updated successfully"){
                    setFocusedMinutes(response.data.focusedMinutes)
                }
                if(response.data.message === "Weekly goal updated successfully"){
                    setFocusedMinutes(response.data.totalFocusMinutes)
                }
            } catch {
                toast.error('Failed to update progress');
            }
        }
        const handleCopyLink= ()=>{
                navigator.clipboard.writeText(sessionLink)
                toast("link copied")
                }
        
        const handleGetSessionParticipants = useCallback(async()=>{
            if(sessionId){
                const response = await axios.get(`/api/session/${sessionId}`)
                const {participants} = response.data
                setParticipants(participants)
            }
        }, [sessionId])
        const [isJoinSession, setIsJoinSession] = useState(false)
        const [forHost, setForHost] = useState(true)
        const handleSessionJoin = async()=>{
            const extractedSessionId = joinSessionLink.split('/').pop() || ''
            setIsJoinSession(true)
            try{
                const response = await axios.post(`/api/session/join/${extractedSessionId}`)

                if(response.data.success){
                    setIsSessionActive(true)
                    setSessionId(extractedSessionId)
                    setJoinSessionLink('')
                    const sessionData = session?.user._id
                    const isHost = response.data.host === sessionData
                    setForHost(isHost)
                    toast.success("Successfully joined session!");
                }
                
            } catch (error) {
                setIsSessionActive(false);
                const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to join session. Please try again.";
                toast.error(errorMessage);
            } finally {
                setIsJoinSession(false);
            }
        }
        const handleLeaveSession = async()=>{
            try {
                const response = await axios.post(`/api/session/leave/${sessionId}`)

                if(!response.data.isSessionActive){
                    setSessionId('')
                    setIsSessionActive(false)
                    setParticipants([])
                    setForHost(false);
            
                    toast.success("Left session successfully");
                }
            } catch (error) {
                const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to leave session";
                toast.error(errorMessage);
            }
        }
        const handleEndSession = async() => {

            try {
                const response = await axios.post(`/api/session/end/${sessionId}`)

                if(!response.data.isSessionActive){
                    setIsSessionActive(false)
                    setSessionId('')
                    setSessionLink('')
                    toast.success("Ended session successfully");
                }
            } catch {
                toast.error("Failed to end session");
            }
            
        };

        const handleEditTimer = ()=>{
            setIsEditingTimer((prev)=> !prev)
        }
        const handleSaveTimerSettings = ()=>{
                setSavedHr(workHr)
                setSavedMin(workMin)
                setSavedSec(workSec)
                localStorage.setItem('fod_timer_settings', JSON.stringify({
                    workHr, workMin, workSec, breakTime
                }))
                setIsEditingTimer(false)
        }
        const totalSecsRef = useRef(0); 
        const initialTimeRef = useRef(0);
        const focusSessionIdRef = useRef<string | null>(null);
        const sessionStartedAtRef = useRef<number | null>(null);

        const startFocusSession = async () => {
            if (focusSessionIdRef.current) return;
            try {
                const res = await axios.post("/api/focus-session", { action: "start" });
                focusSessionIdRef.current = res.data.sessionId;
                sessionStartedAtRef.current = Date.now();
            } catch {
                // non-blocking telemetry
            }
        };

        const endFocusSession = async (outcome: "finish" | "abandon") => {
            if (!focusSessionIdRef.current) return;
            const elapsed = sessionStartedAtRef.current
                ? Math.max(1, Math.floor((Date.now() - sessionStartedAtRef.current) / 60000))
                : 0;
            try {
                await axios.post("/api/focus-session", {
                    action: outcome === "finish" ? "finish" : "abandon",
                    sessionId: focusSessionIdRef.current,
                    durationMinutes: elapsed,
                });
            } catch {
                // non-blocking
            }
            focusSessionIdRef.current = null;
            sessionStartedAtRef.current = null;
        };

        const pauseFocusSession = async () => {
            if (!focusSessionIdRef.current) return;
            try {
                await axios.post("/api/focus-session", {
                    action: "pause",
                    sessionId: focusSessionIdRef.current,
                });
            } catch {
                // non-blocking
            }
        };

        // Restore timer from local storage on mount
        useEffect(() => {
            const savedSettings = localStorage.getItem('fod_timer_settings');
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    setSavedHr(parsed.workHr ?? 0);
                    setSavedMin(parsed.workMin ?? 25);
                    setSavedSec(parsed.workSec ?? 0);
                    setBreakTime(parsed.breakTime ?? 5);
                    
                    setWorkHr(parsed.workHr ?? 0);
                    setWorkMin(parsed.workMin ?? 25);
                    setWorkSec(parsed.workSec ?? 0);
                } catch (e) {
                    console.error("Failed to parse timer settings", e);
                }
            }

            const savedEndTime = localStorage.getItem('fod_timer_end_time');
            const savedInitialTime = localStorage.getItem('fod_timer_initial_time');
            
            if (savedEndTime && savedInitialTime) {
                const endTime = parseInt(savedEndTime, 10);
                const initialTime = parseInt(savedInitialTime, 10);
                const now = Date.now();
                
                if (endTime > now) {
                    const remainingSecs = Math.floor((endTime - now) / 1000);
                    initialTimeRef.current = initialTime;
                    totalSecsRef.current = remainingSecs;
                    
                    const hours = Math.floor(remainingSecs / 3600);
                    const min = Math.floor((remainingSecs % 3600) / 60);
                    const sec = remainingSecs % 60;
                    
                    setWorkHr(hours);
                    setWorkMin(min);
                    setWorkSec(sec);
                    setIsPlaying(true);
                    
                    timerRef.current = setInterval(async() => {
                        const now = Date.now();
                        totalSecsRef.current = Math.max(0, Math.floor((endTime - now) / 1000));
                        
                        if (totalSecsRef.current <= 0) {
                        const updateProgress = initialTimeRef.current - totalSecsRef.current
                        const updateProgressInMins  = Math.floor(updateProgress/60)
                        const newFocusM = updateProgressInMins + focusedMinutes
                        setFocusedMinutes((prev)=> prev + updateProgressInMins)
                        void endFocusSession("finish");
                            if(isSessionActive && sessionId){
                                handleUpdateProgress(newFocusM)
                            }else{
                                handleGoalProgress(newFocusM)
                            }
                            if (timerRef.current) {
                                clearInterval(timerRef.current);
                                timerRef.current = null;
                            }
                            setIsPlaying(false);
                            setWorkHr(0);
                            setWorkMin(0);
                            setWorkSec(0);
                            localStorage.removeItem('fod_timer_end_time');
                            localStorage.removeItem('fod_timer_initial_time');
                            return;
                        }
                        
                        const currentHours = Math.floor(totalSecsRef.current / 3600);
                        const currentMin = Math.floor((totalSecsRef.current % 3600) / 60);
                        const currentSec = totalSecsRef.current % 60;
                        
                        setWorkHr(currentHours);
                        setWorkMin(currentMin);
                        setWorkSec(currentSec);
                    }, 1000);
                } else {
                    localStorage.removeItem('fod_timer_end_time');
                    localStorage.removeItem('fod_timer_initial_time');
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []); // Run only once on mount

        const handlePlayTimer = () => {
            if (isPlaying) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsPlaying(false);
                void pauseFocusSession();
                localStorage.removeItem('fod_timer_end_time');
                localStorage.removeItem('fod_timer_initial_time');
            } else {
                const totalSecs = workHr * 3600 + workMin * 60 + workSec;
                setIsPlaying(true);
                void startFocusSession();
                
                totalSecsRef.current = totalSecs;
                initialTimeRef.current = totalSecs;

                const endTime = Date.now() + totalSecs * 1000;
                localStorage.setItem('fod_timer_end_time', endTime.toString());
                localStorage.setItem('fod_timer_initial_time', totalSecs.toString());

                timerRef.current = setInterval(async() => {
                    const now = Date.now();
                    totalSecsRef.current = Math.max(0, Math.floor((endTime - now) / 1000));
                    
                        if (totalSecsRef.current <= 0) {
                        const updateProgress = initialTimeRef.current - totalSecsRef.current
                        const updateProgressInMins  = Math.floor(updateProgress/60)
                        const newFocusM = updateProgressInMins + focusedMinutes
                        setFocusedMinutes((prev)=> prev + updateProgressInMins)
                        void endFocusSession("finish");
                        if(isSessionActive && sessionId){
                            handleUpdateProgress(newFocusM)
                        }else{
                            handleGoalProgress(newFocusM)
                        }
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        setIsPlaying(false);
                        setWorkHr(0);
                        setWorkMin(0);
                        setWorkSec(0);
                        localStorage.removeItem('fod_timer_end_time');
                        localStorage.removeItem('fod_timer_initial_time');
                        return;
                    }
                    
                    const hours = Math.floor(totalSecsRef.current / 3600);
                    const min = Math.floor((totalSecsRef.current % 3600) / 60);
                    const sec = totalSecsRef.current % 60;
                    
                    setWorkHr(hours);
                    setWorkMin(min);
                    setWorkSec(sec);
                }, 1000);
            }
        };

        useEffect(() => {
            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }, []);
        
        const handleSkipTimer = ()=>{
            void endFocusSession("finish");
            let updateProgress = initialTimeRef.current - totalSecsRef.current
            updateProgress  = Math.floor(updateProgress/3600)
            setFocusedMinutes((prev)=> prev + updateProgress) 
            if(timerRef.current){
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            setIsPlaying(false)
            localStorage.removeItem('fod_timer_end_time');
            localStorage.removeItem('fod_timer_initial_time');
            const hour = Math.floor(breakTime / 60);
            const min = breakTime % 60;
            const sec = 0;
            setWorkHr(hour)
            setWorkMin(min)
            setWorkSec(sec)
        }

        const handleResetTimer = ()=>{
            void endFocusSession("abandon");
            let updateProgress = initialTimeRef.current - totalSecsRef.current
            updateProgress  = Math.floor(updateProgress/3600)
            setFocusedMinutes((prev)=> prev + updateProgress)   
            if(timerRef.current){
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            setIsPlaying(false)
            localStorage.removeItem('fod_timer_end_time');
            localStorage.removeItem('fod_timer_initial_time');
            setWorkHr(savedHr);
            setWorkMin(savedMin);
            setWorkSec(savedSec);
        }
        
        const isSet = todayTrue ? isTodayGoalSet : isWeekGoalSet;
        const currentLockedGoal = todayTrue ? lockedTodayGoal : lockedWeekGoal;
        const handleSetGoal = async()=>{
            if(todayTrue && goalTHr > 0){
                try {
                    await axios.post("/api/timer/update-timer",{
                        goalTHr,
                        goalWeekHr,
                        isWeekly: !todayTrue,
                        focusedMinutes
                    })
                } catch {
                    toast.error('Failed to set goal');
                }
                setIsTodayGoalSet(true)
                setLockedTodayGoal(goalTHr)
            }else if(!todayTrue && goalWeekHr > 0){
                try {
                    await axios.post("/api/timer/update-timer",{
                        goalTHr,
                        goalWeekHr,
                        isWeekly: true,
                        focusedMinutes
                    })
                } catch {
                    toast.error('Failed to set goal');
                }
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
            if(isSessionActive){
                handleGetSessionParticipants()
            }
        },[sessionId, isSessionActive, handleGetSessionParticipants])
        
        // Compute circular progress for the timer
        const totalInitialSecs = workHr * 3600 + workMin * 60 + workSec || 1;
        const totalCurrentSecs = totalSecsRef.current || totalInitialSecs;
        const progressPercentage = isPlaying ? ((initialTimeRef.current - totalCurrentSecs) / initialTimeRef.current) * 100 : 0;
        const radius = 80;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = isPlaying ? circumference - (progressPercentage / 100) * circumference : 0;

    return (
        <div className="flex flex-col space-y-10 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col space-y-3 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
                <div className='flex justify-between items-center'>
                    <div>
                        <h1 className="text-4xl font-black bg-linear-to-br from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent transform transition-all hover:scale-[1.01]">Focus Timer</h1>
                        <p className="text-slate-500 font-medium text-lg mt-2">Maximize your productivity and achieve your goals.</p>
                    </div>
                    <DateTime className="font-bold hidden md:block text-slate-600 bg-white/50 px-4 py-2 rounded-xl shadow-sm border border-slate-200/50"/>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
                {/* goal setting div: */}
                <div className='lg:col-span-2 space-y-6'>
                    <div className='bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300'>
                        <div className='flex justify-between items-center mb-8 pb-4 border-b border-slate-200/80'>
                            <h2 className='text-2xl font-bold flex items-center text-slate-800'>
                                <svg className="w-6 h-6 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                Goal Setting
                            </h2>
                            <div className='bg-slate-100/80 rounded-xl p-1 shadow-inner'>
                                <button onClick={() => setTodayTrue(true)}
                                className={`px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${todayTrue ? 'bg-white text-blue-600 shadow-sm font-bold border border-slate-200/50':'text-slate-500 hover:text-slate-700 font-medium'}`}>Today</button>
                                <button onClick={()=> setTodayTrue(false)}
                                className={`px-5 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${!todayTrue ? 'bg-white text-blue-600 shadow-sm font-bold border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 font-medium'}`}>Week</button>
                            </div>
                        </div>

                        {!isSet ?(
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className='flex items-center justify-center space-x-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60'>
                                    <h3 className='text-slate-600 font-semibold tracking-wide'>TARGET:</h3>
                                    <input 
                                        className='w-20 px-3 py-2 bg-white border-2 border-transparent focus:border-blue-300 shadow-sm rounded-xl text-center text-2xl font-black text-slate-800 focus:outline-none transition-all' 
                                        type="number" 
                                        id='hours' 
                                        value={todayTrue ? goalTHr : goalWeekHr} 
                                        onChange={(e)=> todayTrue ? setGoalTHr(Number(e.target.value)) : setGoalWeekHr(Number(e.target.value))} 
                                        min="0"
                                    />
                                    <span className='text-slate-500 font-bold'>HOURS</span>
                                </div>
                                <div className='grid grid-cols-3 gap-3'>
                                    {[4, 6, 8].map(h => (
                                        <button key={h} className='py-3 cursor-pointer bg-white border border-slate-200/60 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95'
                                            onClick={()=> todayTrue ? setGoalTHr((prev)=> prev + h) : setGoalWeekHr((prev)=> prev + h)}>+{h}h</button>
                                    ))}
                                </div>
                            </div>
                        ):(
                            <div className='mb-8 p-5 bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl border border-teal-200/50 shadow-inner group transition-all relative overflow-hidden'>
                                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
                                <div className='flex justify-between items-center relative z-10'>
                                    <div>
                                        <p className="text-xs font-bold text-teal-600/70 tracking-wider mb-1 uppercase">Active Goal • {todayTrue ? 'Today' : 'This Week'}</p>
                                        <span className='text-teal-900 font-black text-3xl'>{currentLockedGoal} <span className="text-xl text-teal-700/80">hrs</span></span>
                                    </div>
                                    <button onClick={handleEditGoal} className='p-3 bg-white/60 hover:bg-white text-teal-600 rounded-xl shadow-sm transition-all hover:scale-105' title="Edit goal">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
        
                        <div className="mt-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                            <div className='flex justify-between items-end mb-4'>
                                <div>
                                    <h4 className='text-slate-500 font-bold uppercase tracking-wider text-xs mb-1'>Progress</h4>
                                    <div className='text-2xl font-black text-slate-800'>
                                        {Math.floor(focusedMinutes/60)}<span className="text-sm text-slate-500 font-bold ml-1 mr-2">h</span>
                                        {focusedMinutes % 60}<span className="text-sm text-slate-500 font-bold ml-1">m</span>
                                    </div>
                                </div>
                                <div className='text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100'>
                                    {isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr)} Hrs Total
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className='w-full bg-slate-200/80 rounded-full h-3 mb-2 overflow-hidden shadow-inner'>
                                <div 
                                    className='bg-linear-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-700 ease-out shadow-sm'
                                    style={{ 
                                        width: `${(isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr)) > 0 ? Math.min((focusedMinutes/60 / (isSet ? currentLockedGoal : (todayTrue ? goalTHr : goalWeekHr))) * 100, 100) : 0}%` 
                                    }}
                                />
                            </div>
                        </div>

                        {/* Centered Set button - only show when goal is not set */}
                        {!isSet && (
                            <div className='flex flex-col space-y-6 mt-8'>
                                <button 
                                    onClick={(handleSetGoal)}
                                    disabled={(todayTrue ? goalTHr : goalWeekHr) === 0}
                                    className={`w-full py-4 rounded-xl text-base font-bold shadow-md transition-all active:scale-[0.98] ${
                                        (todayTrue ? goalTHr : goalWeekHr) > 0 
                                            ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/20' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    LOCK IN GOAL
                                </button>

                                {/* Join Session Section */}
                                {!isSessionActive && (
                                    <div className='w-full pt-4'>
                                        <div className='flex items-center mb-6'>
                                            <div className='flex-1 h-px bg-slate-200'></div>
                                            <span className='px-4 text-xs font-bold text-slate-400 uppercase tracking-widest'>or join session</span>
                                            <div className='flex-1 h-px bg-slate-200'></div>
                                        </div>
                                        
                                        <div className='flex space-x-3'>
                                            <input
                                                type="text"
                                                placeholder="Paste Session ID..."
                                                value={joinSessionLink}
                                                onChange={(e) => setJoinSessionLink(e.target.value)}
                                                className='flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all text-slate-700 placeholder:text-slate-400'
                                                disabled={isJoinSession}
                                            />
                                            <button
                                                onClick={handleSessionJoin}
                                                disabled={!joinSessionLink.trimEnd()|| isJoinSession}
                                                className={`px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 ${
                                                    isJoinSession || !joinSessionLink.trim()
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'bg-slate-800 text-white hover:bg-slate-900 hover:shadow-slate-800/20'
                                                }`}
                                            >
                                                {isJoinSession ? '...' : 'JOIN'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SESSION CONTROLS - NEW */}
                        {isSet && !todayTrue && !isSessionActive && (
                            <div className='flex justify-center mt-6 pt-6 border-t border-slate-200/80'>
                                <button 
                                    onClick={handleCreateSession}
                                    disabled={isCreating}
                                    className={`w-full py-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] ${
                                        isCreating
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/20'
                                    }`}
                                >
                                    {isCreating ? 'CREATING SESSION...' : 'SHARE AS GROUP SESSION'}
                                </button>
                            </div>
                        )}

                        {isSessionActive && (
                            <div className='mt-8 p-5 bg-linear-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200/50 relative overflow-hidden group shadow-inner'>
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                                <div className='flex justify-between items-center mb-4 relative z-10'>
                                    <div className='flex items-center space-x-3'>
                                        <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <span className='text-blue-900 font-bold tracking-tight'>
                                            {forHost ? 'HOSTING SESSION' : 'JOINED SESSION'}
                                        </span>
                                    </div>
                                    
                                    <div className='flex items-center space-x-3'>
                                        <div className='flex items-center bg-white/60 px-3 py-1 rounded-lg border border-blue-100 shadow-sm'>
                                            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                            <span className='text-sm font-bold text-blue-800'>{participants.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    {forHost && sessionLink && (
                                        <div className='flex items-center space-x-2 bg-white/80 p-1.5 rounded-xl border border-blue-100/60 shadow-sm'>
                                            <input type="text" value={sessionLink} readOnly className='flex-1 px-3 py-2 text-xs bg-transparent text-slate-600 font-medium focus:outline-none' />
                                            <button onClick={handleCopyLink} className='px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm'>
                                                COPY
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        {forHost ? (
                                            <button onClick={handleEndSession} className='text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-red-100'>END SESSION</button>
                                        ) : (
                                            <button onClick={handleLeaveSession} className='text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-orange-100'>LEAVE SESSION</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* timer div: */}
                <div className='lg:col-span-3'>
                    <div className='bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center min-h-150 relative overflow-hidden group'>
                        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        
                        <div className='absolute top-8 right-8 z-20'>
                            <button className='p-3 text-slate-400 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50 shadow-sm bg-white border border-slate-100' onClick={handleEditTimer}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Settings Overlay */}
                        {isEditingTimer && (
                            <div className='absolute inset-0 bg-white/95 backdrop-blur-xl z-30 p-10 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200'>
                                <h2 className='text-3xl font-black text-slate-800 mb-10 text-center tracking-tight'>Timer Settings</h2>
                                
                                <div className='max-w-md mx-auto w-full space-y-8'>
                                    <div className='bg-slate-50 p-6 rounded-2xl border border-slate-200'>
                                        <label className='block text-slate-500 font-bold text-xs uppercase tracking-widest mb-4'>Session Duration</label>
                                        <div className='flex items-center justify-center space-x-4'>
                                            <div className="flex flex-col items-center">
                                                <input type="number" value={workHr} onChange={(e) => setWorkHr(Number(e.target.value))} className='w-16 h-16 text-2xl font-black bg-white border-2 border-transparent focus:border-blue-400 rounded-xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm transition-all' min="0" max="23" />
                                                <span className='text-slate-400 text-xs font-bold mt-2'>HRS</span>
                                            </div>
                                            <span className='text-2xl font-bold text-slate-300 -mt-6'>:</span>
                                            <div className="flex flex-col items-center">
                                                <input type="number" value={workMin} onChange={(e) => setWorkMin(Number(e.target.value))} className='w-16 h-16 text-2xl font-black bg-white border-2 border-transparent focus:border-blue-400 rounded-xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm transition-all' min="0" max="59" />
                                                <span className='text-slate-400 text-xs font-bold mt-2'>MIN</span>
                                            </div>
                                            <span className='text-2xl font-bold text-slate-300 -mt-6'>:</span>
                                            <div className="flex flex-col items-center">
                                                <input type="number" value={workSec} onChange={(e) => setWorkSec(Number(e.target.value))} className='w-16 h-16 text-2xl font-black bg-white border-2 border-transparent focus:border-blue-400 rounded-xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm transition-all' min="0" max="59" />
                                                <span className='text-slate-400 text-xs font-bold mt-2'>SEC</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className='bg-slate-50 p-6 rounded-2xl border border-slate-200'>
                                        <label className='block text-slate-500 font-bold text-xs uppercase tracking-widest mb-4'>Break Duration</label>
                                        <div className='flex items-center justify-center'>
                                            <div className="flex flex-col items-center relative">
                                                <input type="number" value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))} className='w-24 h-16 text-2xl font-black bg-white border-2 border-transparent focus:border-emerald-400 rounded-xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm transition-all' min="1" max="30" />
                                                <span className='absolute right-4 top-5 text-slate-400 font-bold'>m</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='flex justify-center space-x-4 mt-12'>
                                    <button onClick={handleEditTimer} className='px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all'>CANCEL</button>
                                    <button onClick={handleSaveTimerSettings} className='px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-blue-500/40'>SAVE SETTINGS</button>
                                </div>
                            </div>
                        )}
                        
                        {/* Huge Circular Timer */}
                        <div className={`relative mb-12 flex items-center justify-center transition-all duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                            {/* Decorative background blurs */}
                            <div className={`absolute w-[120%] h-[120%] rounded-full bg-linear-to-tr from-blue-400/20 to-sky-300/20 blur-3xl transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}></div>
                            
                            {/* SVG Timer Ring */}
                            <svg className="absolute w-full h-full -rotate-90 transform" width="300" height="300" viewBox="0 0 200 200">
                                <circle 
                                    cx="100" cy="100" r={radius} 
                                    className="stroke-slate-100" 
                                    strokeWidth="8" fill="none" 
                                />
                                <circle 
                                    cx="100" cy="100" r={radius} 
                                    className={`stroke-blue-500 transition-all duration-1000 ease-linear`}
                                    strokeWidth="8" fill="none" 
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            
                            <div className='w-72 h-72 rounded-full bg-white border border-slate-100 shadow-2xl flex flex-col items-center justify-center relative z-10'>
                                <div className='text-7xl font-black text-slate-800 tracking-tighter flex items-baseline'>
                                    {workHr > 0 && <>{workHr.toString().padStart(2, '0')}<span className="text-4xl text-slate-300 font-normal mx-1">:</span></>}
                                    {workMin.toString().padStart(2, '0')}
                                    <span className="text-4xl text-slate-300 font-normal mx-1">:</span>
                                    {workSec.toString().padStart(2, '0')}
                                </div>
                                <div className='mt-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center shadow-sm'>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                    {isPlaying ? 'Focusing' : 'Paused'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Stylish Control Buttons */}
                        <div className='flex items-center space-x-6 z-10 bg-slate-50/80 p-3 rounded-3xl border border-slate-200/50 shadow-inner'>
                            <button onClick={handleResetTimer} className='w-14 h-14 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200 active:scale-95 group'>
                                <svg className="w-6 h-6 group-hover:-rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            
                            <button onClick={handlePlayTimer} className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${isPlaying ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-800/30' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-500/40'}`}>
                                {isPlaying ? (
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                ) : (
                                    <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                )}
                            </button>
                            
                            <button onClick={handleSkipTimer} className='w-14 h-14 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-slate-200 active:scale-95 group'>
                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Component - Pass participants data */}
            <div className="pt-6 border-t border-slate-200/50">
                <Session participants={participants} isActive={isSessionActive} />
            </div>
        </div>
    )
    }

    export default Timer