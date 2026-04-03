"use client"

import { Calendar } from '@/components/ui/calendar'
import { PopulatedCalendarGoalI } from '@/model/CalendarTick.model';
import { ApiResponse } from '@/Types/ApiResponse'
import axios from 'axios'
import { isSameDay, format } from 'date-fns'
import { enGB } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Flame, Trophy, CheckCircle2, Target } from 'lucide-react'

const Dashboard = () => {
  const [date, setDate] = useState<Date>()
  const isTodaySelected = date && isSameDay(new Date(),date);
  const [isClient, setIsClient] = useState(false)
  const [complete, setComplete] = useState<Date[]>([])
  const [todaysGreenTickTasks, setTodaysGreenTickTasks] = useState<PopulatedCalendarGoalI[]>([])
  const [dashboardTodayTask, setDashboardTodayTask] = useState<string[]>([])
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);

  const handleGreenTickTasks= async()=>{
      try {
        const response = await axios.get<ApiResponse>('/api/calendar-streak')
        if(response.data.success){
          const greenTickArr = response.data.data as PopulatedCalendarGoalI[];
          setTodaysGreenTickTasks(greenTickArr);
          
          let totalTasks = 0;
          const completeDates = greenTickArr.map((e:PopulatedCalendarGoalI)=>{
            if(e.earnedGreenTick){
              totalTasks += e.goals?.length || 0;
              return new Date(e.date)
            }
          }).filter((date): date is Date => date !== undefined);
          setComplete(completeDates);
          setTotalCompleted(totalTasks);

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
      <div className="flex flex-col space-y-8 p-4 md:p-8 max-w-7xl mx-auto w-full animate-pulse">
        <div className="flex flex-col space-y-2 mb-6">
          <div className="h-9 bg-gray-200 rounded-md w-48"></div>
          <div className="h-5 bg-gray-200 rounded-md w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-96 col-span-1"></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 h-96"></div>
        </div>
      </div>
    );
  }

  return (
   <div className="flex flex-col space-y-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Track your progress, build your streak, and stay consistent.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                  <Flame size={28} className={currentStreak > 0 ? 'animate-pulse' : ''} />
              </div>
              <div>
                  <p className="text-sm font-medium text-gray-500">Current Streak</p>
                  <div className="flex items-baseline space-x-2">
                      <h2 className="text-3xl font-bold text-gray-900">{currentStreak}</h2>
                      <span className="text-sm text-gray-500">days</span>
                  </div>
              </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <CheckCircle2 size={28} />
              </div>
              <div>
                  <p className="text-sm font-medium text-gray-500">Total Completed</p>
                  <div className="flex items-baseline space-x-2">
                      <h2 className="text-3xl font-bold text-gray-900">{totalCompleted}</h2>
                      <span className="text-sm text-gray-500">tasks</span>
                  </div>
              </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Trophy size={28} />
              </div>
              <div>
                  <p className="text-sm font-medium text-gray-500">Consistency Score</p>
                  <div className="flex items-baseline space-x-2">
                      <h2 className="text-3xl font-bold text-gray-900">
                          {complete.length > 0 ? Math.min(100, Math.round((currentStreak / Math.max(complete.length, 1)) * 100)) : 0}%
                      </h2>
                      <span className="text-sm text-gray-500">success</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center col-span-1">
              <h3 className="w-full text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <Target className="mr-2 text-purple-500" size={20} />
                  Consistency Tracker
              </h3>
              <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate)=>{
                      if (selectedDate) {
                          setDate(selectedDate)
                      }
                  }}
                  locale={enGB}
                  className="rounded-xl border-none text-lg pointer-events-auto"
                  modifiers={{
                      completed: complete,
                      today: new Date(),
                      selected: date ? [date]: [],
                      todaySelected: isTodaySelected && date ? [date]:[]
                  }}
                  modifiersClassNames={{
                      completed: "bg-linear-to-br from-emerald-400 to-emerald-600 !text-white font-black hover:from-emerald-500 hover:to-emerald-700 shadow-lg shadow-emerald-400/50 !rounded-md transform transition-all hover:scale-105",
                      today: "bg-blue-50 text-blue-600 font-bold border-2 border-blue-200 !rounded-md",
                      selected: "bg-purple-600 !text-white font-bold hover:bg-purple-700 shadow-md !rounded-md",
                      todaySelected: "bg-purple-600 !text-white font-bold !rounded-md"
                  }}
              />
          </div>

            {/* Task List / Details Section */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                      <h3 className="text-xl font-bold text-gray-800">
                          {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
                      </h3>
                      {para && dashboardTodayTask.length > 0 && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full items-center flex">
                              {dashboardTodayTask.length} Tasks Completed
                          </span>
                      )}
                  </div>

                  {!para && (
                       <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                           <CheckCircle2 size={48} className="mb-4 opacity-20" />
                           <p>Select a date to view your completed tasks</p>
                       </div>
                  )}

                  {para && dashboardTodayTask.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                          <Target size={48} className="mb-4 opacity-20" />
                          <p>No completed tasks for this date.</p>
                          <p className="text-sm mt-2">Every day is a new opportunity!</p>
                      </div>
                  )}

                  {para && dashboardTodayTask.length > 0 && (
                      <ul className="space-y-3">
                          {dashboardTodayTask.map((task, index) => (
                              <li 
                                  key={index} 
                                  className="flex items-center justify-between space-x-3 p-4 rounded-xl bg-linear-to-r from-emerald-50 to-white border border-emerald-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                              >
                                  <div className="flex items-center space-x-3 flex-1">
                                      <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-inner relative">
                                          <div className="absolute inset-0 rounded-full bg-emerald-400 blur-sm opacity-50 z-0"></div>
                                          <CheckCircle2 size={18} className="text-white relative z-10" />
                                      </div>
                                      <span className="text-gray-800 font-bold">{task}</span>
                                  </div>
                                  <div className="flex items-center justify-center animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
                                      <Flame size={24} className="text-orange-500" fill="currentColor" />
                                  </div>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>
      </div>
   </div>
  )
}

export default Dashboard
