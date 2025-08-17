"use client"
import React, { useState } from 'react'

const Goal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div>
        <h1 className='text-2xl'>Tasks</h1>
      </div>
    </div>
  );
}

export default Goal