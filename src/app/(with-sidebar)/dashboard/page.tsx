"use client"

import { Calendar } from '@/components/ui/calendar'
import { enGB } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'

const Dashboard = () => {
  const [date, setDate] = useState<Date>()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setDate(new Date())
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // or a loader/spinner if you want
  }

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
