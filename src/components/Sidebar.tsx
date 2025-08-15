import { Menu, X } from 'lucide-react';
import React from 'react'

const Sidebar = ({isOpen}:any) => {

  return (
    <div className='relative m-4'>
        <button className='p-2 bg-gray-800 '>
        {isOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
    </div>
  )
}

export default Sidebar