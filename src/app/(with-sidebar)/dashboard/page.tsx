"use client"

import { Calendar } from '@/components/ui/calendar'
import { CalendarTick } from '@/model/CalendarTick.model'
import { ApiResponse } from '@/Types/ApiResponse'
import axios from 'axios'
import { isSameDay } from 'date-fns'
import { enGB } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'

const Dashboard = () => {
  const [date, setDate] = useState<Date>()
  const isTodaySelected = date && isSameDay(new Date(),date);
  const [isClient, setIsClient] = useState(false)
  const [complete, setComplete] = useState<Date>()
  const [todaysGreenTickTasks, setTodaysGreenTickTasks] = useState<CalendarTick[]>([])
  const handleGreenTickTasks= async()=>{
      try {
        const response = await axios.get<ApiResponse>('/api/calendar-streak')
        // console.log("green tick response:",response.data.data);
        if(response.data.success){
          const greenTickArr = response.data.data;
          console.log("greenticck",greenTickArr);
          console.log("lets go",todaysGreenTickTasks);
          const completeDates = greenTickArr.map((e:CalendarTick)=>{
            if(e.earnedGreenTick){
              return new Date(e.date)
            }
          }).filter(Boolean);
          // console.log("completeDates array",completeDates);
          setComplete(completeDates);
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
   <div className='flex '>
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
                  selected: date ? [date]: [],
                  todaySelected: isTodaySelected && date ? [date]:[]
      } }
      modifiersClassNames={{
        completed: "bg-green-500 text-white rounded-lg border border-white",
        today: "bg-blue-200 text-blue-800 rounded-full !important",
        selected: "bg-blue-200 text-white rounded-full ",
        todaySelected: "bg-blue-200 rounded-full text-white"
      }}
    />
    </div>
    <div>
    {para && 
      (<div>
        <h3>Tasks Completed:</h3>
        {
          // todaysGreenTickTasks.map
        }
      </div>)
    }
    </div>
    
   </div>
  )
}

export default Dashboard
