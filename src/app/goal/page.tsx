"use client"
import DateTime from '@/components/DateTime';
import React, { useEffect, useState } from 'react'

const Goal = () => {
  
  return (
    <div>
      <header className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <DateTime/>
      </header>
    </div>
  );
}

export default Goal