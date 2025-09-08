"use client"

import { Calendar } from '@/components/ui/calendar'
import { CalendarTick } from '@/model/CalendarTick.model'
import { ApiResponse } from '@/Types/ApiResponse'
import axios from 'axios'
import { enGB } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'

const Dashboard = () => {
  const [date, setDate] = useState<Date>()
  const [isClient, setIsClient] = useState(false)
  const complete = [new Date(2025,8,7), new Date(2025,8,6), new Date(2025,8,5), new Date(2025,8,4)]
  const [todaysGreenTickTasks, setTodaysGreenTickTasks] = useState<CalendarTick[]>([])
  const handleGreenTickTasks= async()=>{
      try {
        const response = await axios.get<ApiResponse>('/api/calendar-streak')
        console.log("green tick response:",response.data.data);
        if(response.data.success){
          const greenTickArr = response.data.data;
          setTodaysGreenTickTasks(greenTickArr)
        }
      } catch (error) {
        
      }
  }
  const [para, setPara] = useState(false)
  const handleSelectedDate = async(selectedDate:Date | undefined)=>{
        setPara(true)

  }
  useEffect(() => {
    setDate(new Date())
    setIsClient(true)
    handleGreenTickTasks()
  }, [])

  if (!isClient) {
    return null // or a loader/spinner if you want
  }

  return (
   <div>
     <Calendar
      mode="single"
      selected={date}
      onSelect={(selectedDate)=>{
          setDate(selectedDate)
          handleSelectedDate(selectedDate)
      }}
      locale={enGB}
      className="rounded-lg border text-lg w-lg max-h-screen"
      modifiers={{completed: complete,
                  today: new Date(),
                  selected: date ? [date]: []
      } }
      modifiersClassNames={{
        completed: "bg-green-500 text-white rounded-lg border border-white",
        today: "bg-blue-200 text-blue-800 rounded-full",
        selected: "bg-black text-white rounded-full"
      }}
    />
    {para && 
      (<div>
        todays tasks:
        
      </div>)
    }
   </div>
  )
}

export default Dashboard
