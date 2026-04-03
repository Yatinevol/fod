"use client";
import DateTime from "@/components/DateTime";
import { MoreHorizontal, X, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from "react";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from "@mui/material/FormControlLabel";
import { green } from "@mui/material/colors";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiResponse } from "@/Types/ApiResponse";
import { GoalCompletionUI } from "@/model/GoalCompletion.model";
import { format, toZonedTime } from "date-fns-tz";


const Goal = () => {
  // Remove unused loading state since it's never used for display
  const [category, setCategory] = useState(""); 
// for search input
const [categories, setCategories] = useState(["Today"]); 

const handleUiCategory =async ()=>{
  try {
    if(category.trim() !=="" && !categories.includes(category)){
      setCategories([...categories, category]);
      }
  
    const response = await axios.post<ApiResponse>('/api/category',{category})
    if(response.data.success){
      toast(`Created Category ${category}`)
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>
    toast(axiosError.response?.data.message,{description: axiosError.response?.data.message ??'Failed to fetch categories',})
  }finally{
    setCategory("")
  }

}

// currently selected category
const [active, setActive] = useState("Today"); 

const [showTaskModal, setShowTaskModal] = useState(false);

const [newTask, setNewTask] = useState(""); 

// options while adding task:
const [taskCategory, setTaskCategory] = useState(categories[0]); 
type Goal = {
  id: string;
  title: string;
};

const [goals, setGoals] = useState<Goal[]>([]); 

// Edit/Delete task states
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [editingTask, setEditingTask] = useState<Goal | null>(null);
const [editTaskTitle, setEditTaskTitle] = useState("");
const [isDeleting, setIsDeleting] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

const router = useRouter()

// checking authorization of user:
const {data: session, status} = useSession();

// input value inside add-task modal
const handleAddTask =async () => {
  try {
    if(newTask.trim() !== ""){
      const response = await axios.post<ApiResponse>('/api/goal',{title:newTask, category:taskCategory})
  
      if(response.data.success){
        toast("Task added successfully")
      }
      setActive(taskCategory);
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>
    toast(axiosError.response?.data.message,{description: axiosError.response?.data.message ??'Failed to fetch message settings',})
  }finally{
    setNewTask("");
    setShowTaskModal(false)
  }
};

const handleGetTasks = async (category: string) => {
  try {
    setActive(category)
    const response = await axios.get(`/api/goal/category/${category}`)

    if(response.data.success){
      const goalsArray = response.data.goals
     const categoryTasks= goalsArray.map((task: {  _id:string,title: string }) =>({
      id: task._id,
      title: task.title
     }))
      setGoals([...categoryTasks])
    }else{
      toast("Failed to fetch tasks", {
        description: response.data.message ?? "Unknown error occurred",
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;

    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Something went wrong while fetching tasks";

    toast("Error", {
      description: errorMessage,
    });
  }
}
const handleGetCategories = useCallback(async()=>{
    try {
      const response = await axios.get<ApiResponse>('/api/category')
      if(response.data.success){
        
        const apiCategories = response.data.categories?.map((each: { name: string }) => each.name) ?? []

        const categoryNames = ["Today",...apiCategories.filter(each=>each!=="Today")]

        setCategories(categoryNames);
      }
    } catch {
      toast.error('Failed to fetch categories');
    }
}, [])
const [goalsCompleted, setGoalsCompleted]  = useState<GoalCompletionUI[]>([])
const handleCheckbox = async(checked:boolean,goalId:string)=>{
  setGoalsCompleted((prev)=>{
    const dat = new Date()
    dat.setHours(0,0,0,0)
    const date = dat.toISOString().split("T")[0]
    if(prev.some((c)=> String(c.goalId) === goalId)){
      return prev.map((c)=>
        String(c.goalId) === goalId ? {...c, isCompleted: checked}: c
      );
    }
    return [...prev, {goalId, isCompleted: checked,date, userId:session?.user?._id ?? ""} ];
  })
  try {
    const [, StatusRes] = await Promise.all([
      axios.post<ApiResponse>(`/api/calendar-streak/${goalId}`),
      axios.patch<ApiResponse>(`/api/goal/goal-status/${goalId}`,{isCompleted:checked})

    ])
    if(StatusRes.data.success){
      // Goal status updated successfully
    }
  } catch {
    toast.error("Failed to update goal status");
  }
}

const handleGetTodaysGoalsCheckbox= useCallback(async()=>{
  try {
    const timeZone = 'UTC';
    const now = new Date();
    const zonedDate =  toZonedTime(now, timeZone);
    const existingDate = format(zonedDate, 'yyyy-MM-dd',{timeZone})
    const response = await axios.get<ApiResponse>(`/api/goal/goal-status?date=${existingDate}`)
    if(response.data.success){
      const completedToday = response.data.data as GoalCompletionUI[]
      setGoalsCompleted(completedToday)
    }
  } catch {
    toast.error("Failed to fetch today's goals");
  }
}, [])

// Close menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenuId(null);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

// Handle opening edit modal
const handleEditClick = (task: Goal) => {
  setEditingTask(task);
  setEditTaskTitle(task.title);
  setShowEditModal(true);
  setOpenMenuId(null);
};

// Handle opening delete modal
const handleDeleteClick = (task: Goal) => {
  setEditingTask(task);
  setShowDeleteModal(true);
  setOpenMenuId(null);
};

// Handle renaming a task
const handleRenameTask = async () => {
  if (!editingTask || !editTaskTitle.trim()) return;
  
  setIsEditing(true);
  try {
    const response = await axios.patch<ApiResponse>(`/api/goal/${editingTask.id}`, {
      title: editTaskTitle.trim()
    });
    
    if (response.data.success) {
      setGoals(prev => prev.map(goal => 
        goal.id === editingTask.id ? { ...goal, title: editTaskTitle.trim() } : goal
      ));
      toast.success("Task renamed successfully");
      setShowEditModal(false);
      setEditingTask(null);
      setEditTaskTitle("");
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast.error(axiosError.response?.data?.message || "Failed to rename task");
  } finally {
    setIsEditing(false);
  }
};

// Handle deleting a task
const handleDeleteTask = async () => {
  if (!editingTask) return;
  
  setIsDeleting(true);
  try {
    const response = await axios.delete<ApiResponse>(`/api/goal/${editingTask.id}`);
    
    if (response.data.success) {
      setGoals(prev => prev.filter(goal => goal.id !== editingTask.id));
      toast.success("Task deleted successfully");
      setShowDeleteModal(false);
      setEditingTask(null);
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast.error(axiosError.response?.data?.message || "Failed to delete task");
  } finally {
    setIsDeleting(false);
  }
};

// checking authorization of user with useEffect:
useEffect(()=>{
  if(status === "loading") return;
  if(!session || !session.user){
    router.push('/sign-in')
    return
  }else{
    handleGetCategories();
    handleGetTasks("Today");
    handleGetTodaysGoalsCheckbox();
    
  }
},[session, status, handleGetCategories, handleGetTodaysGoalsCheckbox, router])  

  return (
    <div className="max-w-5xl mx-auto min-h-screen relative">
    
    <header className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-xs mb-8">
      {/* Left section: Title only */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-slate-800 to-slate-500">Tasks</h1>
      </div>

      {/* Right section: Buttons */}
      <div className="flex items-center gap-3">
        {/* Enhanced Add Category Section */}
        <div className="flex items-center gap-2 border border-slate-200/60 rounded-xl bg-white shadow-xs overflow-hidden transition-all focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-300">
          <div className="relative flex-1 min-w-35">
            <input
              type="text"
              placeholder="New category..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm focus:ring-0 focus:outline-none border-0 bg-transparent placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUiCategory();
                }
              }}
            />
          </div>
          <button 
            className="px-4 py-2.5 text-violet-600 hover:bg-violet-50 hover:text-violet-700 transition-colors text-sm font-semibold border-l border-slate-200/60 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUiCategory}
            disabled={!category.trim() || categories.includes(category.trim())}
            title={
              !category.trim() 
                ? "Enter a category name" 
                : categories.includes(category.trim()) 
                ? "Category already exists"
                : "Add category"
            }
          >
            {categories.includes(category.trim()) && category.trim() ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Exists
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="bg-linear-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
        {/* Removed DateTime as it doesn't fit the new inline header well, keeping it clean */}
      </div>
    </header>

    {/* Category Tabs */}
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
      {categories.map((each) => (
        <button
          key={each}
          onClick={() => handleGetTasks(each)}
          className={`relative px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
            active === each
              ? "bg-slate-800 text-white shadow-lg shadow-slate-800/20 scale-105"
              : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/50 hover:scale-105"
          }`}
        >
          {each}
        </button>
      ))}
    </div>
  
        {/* 🟣 Modal for Adding Task */}
  {showTaskModal && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative transform transition-all">
      {/* Close button */}
      <button
        onClick={() => setShowTaskModal(false)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-extrabold mb-6 bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-fuchsia-600">New Task</h2>

      {/* Task name input */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">What needs to be done?</label>
          <input
            type="text"
            placeholder="e.g. Finish the presentation"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium"
            autoFocus
          />
        </div>

        {/* Category selector */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
          <select
            value={taskCategory}
            onChange={(e) => setTaskCategory(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Save button */}
        <button
          onClick={handleAddTask}
          className="w-full bg-linear-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all mt-2"
        >
          Create Task
        </button>
      </div>
    </div>
  </div>
)}

  {/* Task List by Active Category */}
<div className="mt-8 space-y-3 pb-24">
  {goals.length === 0 ? (
    <div className="text-center bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-3xl py-16 px-6 shadow-sm">
      <div className="bg-violet-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </div>
      <p className="text-xl font-bold text-slate-800 mb-2">No tasks in "{active}"</p>
      <p className="text-slate-500 mb-6">You're all caught up! Time to relax or start something new.</p>
      <button onClick={() => setShowTaskModal(true)} className="text-violet-600 font-bold hover:text-violet-700 hover:underline">
        + Add your first task here
      </button>
    </div>
  ) : (
    goals
      .map((task) => (
      
        <div
          key={task.id}
          className={`group flex items-center justify-between p-4 pl-5 rounded-2xl shadow-xs border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
            goalsCompleted.some(c => String(c.goalId) === task.id && c.isCompleted) 
              ? "bg-slate-50 border-slate-200 opacity-75" 
              : "bg-white border-white hover:border-violet-100"
          }`}
        >
          <FormControlLabel
            className="flex-1 m-0"
            control={
              <Checkbox
                checked={goalsCompleted.some((c)=>(
                  String(c.goalId) === task.id && c.isCompleted
                ))}
                onChange={(e,checked)=>handleCheckbox(checked,task.id)}
                sx={{
                  color: '#cbd5e1',
                  '& .MuiSvgIcon-root': { fontSize: 28 },
                  '&.Mui-checked': { color: '#8b5cf6' },
                }}
              />
            }
            label={
              <span className={`text-lg transition-all duration-300 ml-2 ${
                goalsCompleted.some(c => String(c.goalId) === task.id && c.isCompleted) 
                  ? "text-slate-400 line-through decoration-slate-300 decoration-2" 
                  : "text-slate-800 font-bold"
              }`}>
                {task.title}
              </span>
            }
          />
          {/* Dropdown Menu */}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200" ref={openMenuId === task.id ? menuRef : null}>
            <button
              onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
              className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <MoreHorizontal className="text-slate-400" />
            </button>
            
            {/* Dropdown Options */}
            {openMenuId === task.id && (
              <div className="absolute right-0 top-12 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-10 w-40 transform origin-top-right transition-all">
                <button
                  onClick={() => handleEditClick(task)}
                  className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-slate-50 flex items-center gap-3 text-slate-700 transition"
                >
                  <Pencil size={16} className="text-violet-500" />
                  Rename
                </button>
                <button
                  onClick={() => handleDeleteClick(task)}
                  className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-red-50 flex items-center gap-3 text-red-600 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))
  )}
</div>

{/* Edit Task Modal */}
{showEditModal && editingTask && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative transform transition-all">
      <button
        onClick={() => {
          setShowEditModal(false);
          setEditingTask(null);
          setEditTaskTitle("");
        }}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-extrabold mb-6 text-slate-800">Rename Task</h2>

      <input
        type="text"
        placeholder="Enter new task name..."
        value={editTaskTitle}
        onChange={(e) => setEditTaskTitle(e.target.value)}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium mb-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleRenameTask();
          }
        }}
        autoFocus
      />

      <div className="flex gap-4">
        <button
          onClick={() => {
            setShowEditModal(false);
            setEditingTask(null);
            setEditTaskTitle("");
          }}
          className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleRenameTask}
          disabled={!editTaskTitle.trim() || editTaskTitle.trim() === editingTask.title || isEditing}
          className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
        >
          {isEditing ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}

{/* Delete Confirmation Modal */}
{showDeleteModal && editingTask && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/50 relative text-center">
      <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <Trash2 className="text-red-500" size={28} />
      </div>
      
      <h2 className="text-2xl font-extrabold mb-2 text-slate-800">Delete Task?</h2>
      <p className="text-slate-500 mb-8 font-medium">
        Are you sure you want to delete <br/><span className="text-slate-800 font-bold">"{editingTask.title}"</span>? <br/>This action cannot be undone.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleDeleteTask}
          disabled={isDeleting}
          className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
        >
          {isDeleting ? "Deleting..." : "Yes, delete task"}
        </button>
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setEditingTask(null);
          }}
          className="w-full py-3.5 bg-slate-100/50 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
        >
          Hold on, keep it
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Goal;
