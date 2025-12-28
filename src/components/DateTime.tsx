"use client"
import React, { useEffect, useState } from 'react'


const DateTime = ({className}:{className:string}) => {
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
    day: "numeric",
    month: "short"
  })
  const time = dateTime.toLocaleTimeString("en-us",{
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
  return (
    <div className={`flex items-center justify-end gap-2 text-black ${className}`}>
     <span>{day}, {time}</span>
    </div>
  );
}

export default DateTime