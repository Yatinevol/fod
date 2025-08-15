"use client"
import Sidebar from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';
import React, { useState } from 'react'

const Goal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Sidebar isOpen="true"/>
    </div>
  );
}

export default Goal