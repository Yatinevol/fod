"use client"
import React, { useEffect, useState } from 'react'


const DateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());
  useEffect(()=>{
    const interval = setInterval(()=>{
      setDateTime(new Date())
    },1000);

    // clearInterval inside the return makes sure the interval is stopped when the component unmounts.

    // This prevents memory leaks (the interval would otherwise keep running in the background even if you navigate away).
    return ()=> clearInterval(interval)
  },[]);

  const day = dateTime.toLocaleDateString("en-us",{
    weekday: "short",
    day: "2-digit",
    month: "short"
  })
  const time = dateTime.toLocaleTimeString("en-us",{
    hour: "2-digit",
    minute: "2-digit"
  })
  return (
    <div className='flex items-center justify-end gap-2 text-gray-600'>
     <span>{day}</span>
     <span>{time}</span>
    </div>
  );
}

export default DateTime