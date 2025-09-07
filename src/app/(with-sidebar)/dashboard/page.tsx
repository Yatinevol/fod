"use client"
import { Calendar } from '@/components/ui/calendar'
import { enGB, enUS } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'

const Dashboard = () => {
  const [date, setDate] = useState<Date>()

  useEffect(() => {
    setDate(new Date())
  }, [])

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      locale={enGB}
      className="rounded-lg border text-lg w-lg max-h-screen"
    />
  )
}

export default Dashboard