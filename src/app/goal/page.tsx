"use client";
import DateTime from "@/components/DateTime";
import { MoreHorizontal, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from "@mui/material/FormControlLabel";
import { green } from "@mui/material/colors";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Goal = () => {
  const [category, setCategory] = useState(""); 
// for search input
const [categories, setCategories] = useState(["Today"]); 

const handleUiCategory = ()=>{
  if(category.trim() !=="" && !categories.includes(category)){
    setCategories([...categories, category]);
    setCategory("")
  }
}

// currently selected category
const [active, setActive] = useState("Today"); 

const [showTaskModal, setShowTaskModal] = useState(false);

const [newTask, setNewTask] = useState(""); 

// options while adding task:
const [taskCategory, setTaskCategory] = useState(categories[0]); 

const [goals, setGoals] = useState(["singing", "badminton", "gaming"]); 

const router = useRouter()

// checking authorization of user:
const {data: session, status} = useSession();


// input value inside add-task modal
const handleAddTask = () => {
  if (newTask.trim() !== "") {
    setGoals([...goals, newTask]);
    setNewTask("");
    setShowTaskModal(false);
  }

useEffect(()=>{
  if(!session || !session.user){
    router.push('/sign-in')
    return
  }
},[])
};
  return (
    <div className="max-w-6xl mx-auto px-6 min-h-screen relative">
    
    <header className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
      {/* Left section: Title + Search */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <h1 className="text-2xl font-bold whitespace-nowrap">Tasks</h1>
        
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search tasks..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none shadow-sm"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
        </div>
      </div>

      {/* Right section: Buttons */}
      <div className="flex items-center gap-3">
        <button className="border border-violet-600 text-violet-600 px-4 py-2 rounded-lg font-medium hover:bg-violet-50 transition"
        onClick={handleUiCategory}
        >
          Add Category
        </button>
        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-violet-500 transition"
        >
          + Add Task
        </button>
        <DateTime className="font-bold hidden md:block" />
      </div>
    </header>

    {/* Category Tabs */}
    <div className="flex items-center gap-6 mt-8 overflow-x-auto scrollbar-hide pl-1">
      {categories.map((each) => (
        <button
          key={each}
          onClick={() => setActive(each)}
          className="relative pb-1 cursor-pointer"
        >
          <span
            className={
              active === each
                ? "text-black font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }
          >
            {each}
          </span>

          {/* Animated underline */}
          <span
            className={`absolute rounded-4xl left-0 bottom-0 h-[2px] 
              bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 
              transition-all duration-300 
              ${active === each ? "w-full" : "w-0"}`}
          />
        </button>
      ))}
    </div>
  
        {/* 🟣 Modal for Adding Task */}
  {showTaskModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-lg w-[400px] relative">
      {/* Close button */}
      <button
        onClick={() => setShowTaskModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-bold mb-4">Add New Task</h2>

      {/* Task name input */}
      <input
        type="text"
        placeholder="Enter task name..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      {/* Category selector */}
      <label className="block text-sm font-medium mb-2">Choose Category</label>
      <select
        value={taskCategory}
        onChange={(e) => setTaskCategory(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Save button */}
      <button
        onClick={handleAddTask}
        className="w-full bg-violet-600 text-white py-2 rounded-lg font-semibold hover:bg-violet-500"
      >
        Save Task
      </button>
    </div>
  </div>
)}

  {/* Task List by Active Category */}
<div className="mt-8 space-y-3">
  {goals.filter((task) => task.includes(`(${active})`)).length === 0 ? (
    <div className="text-center text-gray-500 py-12">
      <p className="text-lg font-semibold">No tasks in “{active}” yet</p>
      <p className="text-sm">Click <span className="text-violet-600 font-semibold">+ Add Task</span> to create one</p>
    </div>
  ) : (
    goals
      .filter((task) => task.includes(`(${active})`))
      .map((task, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-xl shadow-sm hover:shadow-md transition bg-white"
        >
          <FormControlLabel
            control={
              <Checkbox
                sx={{
                  color: green[800],
                  "&.Mui-checked": { color: green[600] },
                }}
              />
            }
            label={task.replace(`(${active})`, "").trim()}
          />
          <MoreHorizontal className="text-gray-400 cursor-pointer" />
        </div>
      ))
  )}
</div>

    </div>
  );
};

export default Goal;
