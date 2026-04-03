"use client"

import { Calendar } from '@/components/ui/calendar'
import { PopulatedCalendarGoalI } from '@/model/CalendarTick.model';
import { ApiResponse } from '@/Types/ApiResponse'
import axios from 'axios'
import { isSameDay, format } from 'date-fns'
import { enGB } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Flame, Trophy, CheckCircle2, Target, Calendar as CalendarIcon } from 'lucide-react'

const Dashboard = () => {
  const [date, setDate] = useState<Date>()
  const isTodaySelected = date && isSameDay(new Date(),date);
  const [isClient, setIsClient] = useState(false)
  const [complete, setComplete] = useState<Date[]>([])
  
  // Heatmap Levels
  const [level1, setLevel1] = useState<Date[]>([]) // 1-2 tasks
  const [level2, setLevel2] = useState<Date[]>([]) // 3-4 tasks
  const [level3, setLevel3] = useState<Date[]>([]) // 5-6 tasks
  const [level4, setLevel4] = useState<Date[]>([]) // 7+ tasks

  const [todaysGreenTickTasks, setTodaysGreenTickTasks] = useState<PopulatedCalendarGoalI[]>([])
  const [dashboardTodayTask, setDashboardTodayTask] = useState<string[]>([])
  const [currentStreak, setCurrentStreak] = useState(0);
  const [tasksThisWeek, setTasksThisWeek] = useState(0);

  const handleGreenTickTasks= async()=>{
      try {
        const response = await axios.get<ApiResponse>('/api/calendar-streak')
        if(response.data.success){
          const greenTickArr = response.data.data as PopulatedCalendarGoalI[];
          setTodaysGreenTickTasks(greenTickArr);
          
          let recentTasksCount = 0;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0,0,0,0);

          const l1: Date[] = [];
          const l2: Date[] = [];
          const l3: Date[] = [];
          const l4: Date[] = [];

          const completeDates = greenTickArr.map((e:PopulatedCalendarGoalI)=>{
            if(e.earnedGreenTick){
              const taskCount = e.goals?.length || 0;
              const d = new Date(e.date);
              
              if (d.getTime() >= sevenDaysAgo.getTime()) {
                  recentTasksCount += taskCount;
              }

              if (taskCount >= 7) l4.push(d);
              else if (taskCount >= 5) l3.push(d);
              else if (taskCount >= 3) l2.push(d);
              else if (taskCount >= 1) l1.push(d);

              return d;
            }
          }).filter((date): date is Date => date !== undefined);
          
          setComplete(completeDates);
          setTasksThisWeek(recentTasksCount);

          setLevel1(l1);
          setLevel2(l2);
          setLevel3(l3);
          setLevel4(l4);

          // Calculate streak
          if (completeDates.length > 0) {
            const sortedDates = [...completeDates].sort((a, b) => b.getTime() - a.getTime());
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let checkDate = new Date(sortedDates[0]);
            checkDate.setHours(0,0,0,0);
            
            const diffInDays = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffInDays <= 1) {
                let currentExpected = new Date(checkDate);
                for (const d of sortedDates) {
                    const normalizedD = new Date(d);
                    normalizedD.setHours(0,0,0,0);
                    
                    if (normalizedD.getTime() === currentExpected.getTime()) {
                        streak++;
                        currentExpected.setDate(currentExpected.getDate() - 1);
                    } else if (normalizedD.getTime() < currentExpected.getTime()) {
                        const diff = Math.floor((currentExpected.getTime() - normalizedD.getTime()) / (1000 * 60 * 60 * 24));
                        if (diff > 0) break;
                    }
                }
            }
            setCurrentStreak(streak);
          }
        }
      } catch {
        toast.error('Failed to fetch calendar data');
      }
  }
  const [para, setPara] = useState(false);

  useEffect(() => {
    if (!date) return;
    setPara(true);
    const titleArrForSelectedDates = todaysGreenTickTasks
      .filter((e)=> isSameDay(date, new Date(e.date)))
      .flatMap((e)=> e.goals.map(g => g.title));
    setDashboardTodayTask(titleArrForSelectedDates);
  }, [date, todaysGreenTickTasks]);

  // Automatically refresh dashboard data when the tab/window is focused 
  // ensuring instant updates if tasks were marked complete in another tab
  useEffect(() => {
    const handleFocus = () => {
      handleGreenTickTasks();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    setDate(new Date())
    setIsClient(true)
    
    handleGreenTickTasks()
  }, [])

  if (!isClient) {
    return (
      <div className="flex flex-col space-y-8 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <div className="flex flex-col space-y-2 mb-6">
          <div className="h-10 bg-slate-200/50 rounded-xl w-48 animate-pulse"></div>
          <div className="h-5 bg-slate-200/50 rounded-xl w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/60 flex items-center space-x-4 animate-pulse">
              <div className="w-16 h-16 bg-slate-200/50 rounded-2xl"></div>
              <div className="space-y-3">
                <div className="h-5 bg-slate-200/50 rounded-md w-24"></div>
                <div className="h-10 bg-slate-200/50 rounded-md w-16"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 h-96 col-span-1 animate-pulse"></div>
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 lg:col-span-2 h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
   <div className="flex flex-col space-y-10 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-3 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <h1 className="text-4xl font-black bg-linear-to-br from-slate-900 via-slate-700 to-slate-600 bg-clip-text text-transparent transform transition-all hover:scale-[1.01]">Dashboard</h1>
          <p className="text-slate-500 font-medium text-lg">Track your progress, build your streak, and stay consistent.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-200/60 flex items-center space-x-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-4 bg-linear-to-br from-orange-100 to-orange-50 text-orange-600 rounded-2xl border border-orange-200/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Flame size={32} className={currentStreak > 0 ? 'animate-pulse' : ''} />
              </div>
              <div className="relative">
                  <p className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">Current Streak</p>
                  <div className="flex items-baseline space-x-2">
                      <h2 className="text-4xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">{currentStreak}</h2>
                      <span className="text-base font-semibold text-slate-400">days</span>
                  </div>
              </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-200/60 flex items-center space-x-6 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-4 bg-linear-to-br from-teal-100 to-teal-50 text-teal-600 rounded-2xl border border-teal-200/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 size={32} />
              </div>
              <div className="relative">
                  <p className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">Tasks This Week</p>
                  <div className="flex items-baseline space-x-2">
                      <h2 className="text-4xl font-black text-slate-800 group-hover:text-teal-600 transition-colors">{tasksThisWeek}</h2>
                      <span className="text-base font-semibold text-slate-400">completed</span>
                  </div>
              </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-200/60 flex items-center space-x-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-4 bg-linear-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl border border-blue-200/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Trophy size={32} />
              </div>
              <div className="relative">
                  <p className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">Consistency Score</p>
                  <div className="flex items-baseline space-x-2">
                      <h2 className="text-4xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                          {complete.length > 0 ? Math.min(100, Math.round((currentStreak / Math.max(complete.length, 1)) * 100)) : 0}%
                      </h2>
                      <span className="text-base font-semibold text-slate-400">success</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Section */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-8 flex flex-col items-center col-span-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="w-full text-xl font-bold mb-6 text-slate-800 flex items-center relative z-10">
                  <span className="bg-blue-100 p-2 rounded-xl mr-3 shadow-inner">
                      <Target className="text-blue-600" size={24} />
                  </span>
                  Consistency Tracker
              </h3>
              
              {/* Heatmap Legend */}
              <div className="w-full flex justify-end gap-1 mb-6 mr-4 relative z-10 text-[10px] text-slate-500 font-medium uppercase tracking-wider items-center">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 ml-1"></div>
                  <div className="w-3 h-3 rounded-sm bg-sky-200"></div>
                  <div className="w-3 h-3 rounded-sm bg-sky-400"></div>
                  <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                  <div className="w-3 h-3 rounded-sm bg-blue-700 mr-1"></div>
                  <span>More</span>
              </div>

              <div className="relative z-10 w-full flex justify-center bg-white/80 rounded-2xl p-4 border border-slate-200 shadow-inner">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate)=>{
                          if (selectedDate) {
                              setDate(selectedDate)
                          }
                      }}
                      locale={enGB}
                      className="text-lg pointer-events-auto font-medium"
                      classNames={{
                          head_cell: "text-slate-400 font-bold uppercase text-xs tracking-wider",
                          cell: "text-center text-sm p-0 m-0 relative",
                          day: "h-11 w-11 p-0 m-0.5 font-normal bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200",
                          nav_button: "h-8 w-8 bg-white shadow-sm border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors",
                      }}
                      modifiers={{
                          level1,
                          level2,
                          level3,
                          level4,
                          today: new Date(),
                          selected: date ? [date]: [],
                          todaySelected: isTodaySelected && date ? [date]:[]
                      }}
                      modifiersClassNames={{
                          level1: "!bg-sky-200 !text-sky-900 border-none font-medium hover:!bg-sky-300",
                          level2: "!bg-sky-400 !text-sky-950 border-none font-semibold hover:!bg-sky-500 shadow-sm",
                          level3: "!bg-blue-500 !text-white border-none font-bold hover:!bg-blue-600 shadow-md shadow-blue-500/20",
                          level4: "!bg-blue-700 !text-white border-none font-black hover:!bg-blue-800 shadow-lg shadow-blue-700/30 transform transition-transform hover:scale-105 hover:z-10",
                          today: "!bg-slate-100 !text-blue-600 font-black border-2 border-blue-200",
                          selected: "ring-2 ring-slate-800 ring-offset-2 font-bold !bg-white z-10",
                          todaySelected: "!bg-slate-800 !text-white font-bold ring-2 ring-slate-800 ring-offset-2 z-10"
                      }}
                  />
              </div>
          </div>

            {/* Task List / Details Section */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-8 min-h-125 relative overflow-hidden flex flex-col group">
                  <div className="absolute inset-0 bg-linear-to-tl from-sky-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-8 pb-6 border-b border-slate-200/80">
                      <div className="flex items-center gap-4">
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                              <CalendarIcon className="text-blue-500" size={24} />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                  {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
                              </h3>
                              <p className="text-slate-500 font-medium text-sm mt-1">Daily Breakdown</p>
                          </div>
                      </div>
                      {para && dashboardTodayTask.length > 0 && (
                          <span className="px-4 py-2 bg-linear-to-r from-teal-100 to-emerald-100 border border-teal-200/50 text-teal-800 text-sm font-bold uppercase tracking-wider rounded-xl items-center flex shadow-inner">
                              <CheckCircle2 size={16} className="mr-2" />
                              {dashboardTodayTask.length} Tasks Done
                          </span>
                      )}
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                      {!para && (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-2xl border border-slate-200/80 border-dashed">
                              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                                  <CheckCircle2 size={48} className="text-slate-300" />
                              </div>
                              <p className="text-lg font-medium text-slate-500">Select a date to view your completed tasks</p>
                          </div>
                      )}

                      {para && dashboardTodayTask.length === 0 && (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-2xl border border-slate-200/80 border-dashed">
                              <div className="bg-white p-6 rounded-full shadow-sm mb-6 relative group-hover:scale-110 transition-transform duration-500">
                                  <Target size={48} className="text-slate-300" />
                                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 scale-150 animate-ping"></div>
                              </div>
                              <p className="text-xl font-bold text-slate-600 mb-2">No tasks completed</p>
                              <p className="text-base font-medium text-slate-400">Consistency is built one day at time!</p>
                          </div>
                      )}

                      {para && dashboardTodayTask.length > 0 && (
                          <ul className="space-y-4">
                              {dashboardTodayTask.map((task, index) => (
                                  <li 
                                      key={index} 
                                      className="flex items-center justify-between space-x-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group/item relative overflow-hidden"
                                  >
                                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-blue-400 to-sky-500 rounded-l-2xl"></div>
                                      <div className="flex items-center space-x-4 flex-1 pl-2">
                                          <div className="shrink-0 w-10 h-10 rounded-xl bg-linear-to-br from-blue-50 to-sky-50 flex items-center justify-center shadow-inner border border-blue-100 group-hover/item:scale-110 transition-transform duration-300">
                                              <CheckCircle2 size={20} className="text-blue-500" />
                                          </div>
                                          <span className="text-slate-700 font-bold text-lg group-hover/item:text-blue-950 transition-colors">{task}</span>
                                      </div>
                                      <div className="flex items-center justify-center opacity-70 group-hover/item:opacity-100 transition-opacity">
                                          <div className="bg-orange-50/80 border border-orange-100/50 p-2 rounded-xl text-orange-500 shadow-inner group-hover/item:animate-pulse">
                                              <Flame size={20} className="drop-shadow-sm" fill="currentColor" />
                                          </div>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              </div>
          </div>
      </div>
   </div>
  )
}

export default Dashboard
