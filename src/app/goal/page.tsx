"use client";
import DateTime from "@/components/DateTime";
import { MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from "@mui/material/FormControlLabel";
import { green } from "@mui/material/colors";

const Goal = () => {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState(["Hobbies", "Career"]);
  const [active, setActive] = useState("Hobbies");
  const [goals, setGoals] = useState(["singing", "badminton", "gaming"])
  return (
    <div className="max-w-6xl mx-auto px-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>

        <div className="space-x-6">
          <input
            type="text"
            placeholder="Search..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white p-3 w-96 rounded-xl"
          />

          <button className="bg-violet-600 text-white px-3 py-2 cursor-pointer rounded-sm">
            Add Category
          </button>
        </div>

        <DateTime className="font-bold" />
      </header>

      <div className="mt-11 text-xl space-x-6">
        {categories.map((each) => (
          <button
            key={each}
            onClick={() => setActive(each)}
            className="relative pb-1"
          >
            <span
              className={
                active === each ? "text-black font-semibold" : "text-gray-500"
              }
            >
              {each}
            </span>

            {/* underline */}
            <span
              className={`absolute rounded-4xl left-0 bottom-0 h-[2px] 
            bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 
            transition-all duration-300 
            ${active === each ? "w-full" : "w-0"}`}
            />
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {
          goals.map((each)=>(
            <div
            key={each}
            className="p-6 flex items-center justify-between border bg-white rounded-lg w-3xl"
            >
              <div className="space-x-5 font-bold text-xl">
              <FormControlLabel 
              control=
              {<Checkbox color="secondary"  
                sx={{color: "#81C784",'&.Mui-checked':{color: "#4CAF50"}}}
                />
              } 
              label="Singing" />
               <span>{each}</span>
              </div>
              <MoreHorizontal className="cursor-pointer"/>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Goal;
