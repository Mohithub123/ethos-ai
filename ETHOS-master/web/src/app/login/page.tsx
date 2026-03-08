"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

const handleLogin = () => {
  const now = new Date()

  let hours = now.getHours()
  const minutes = now.getMinutes().toString().padStart(2, "0")

  // Convert to 12-hour format
  hours = hours % 12
  hours = hours ? hours : 12

  const formattedHours = hours.toString().padStart(2, "0")

  const currentPassword = formattedHours + minutes

  if (password === currentPassword) {
    localStorage.setItem("auth", "true")
    router.push("/dashboard")
  } else {
    alert("Wrong password. Use current time (HHMM in normal format).")
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Login to Ethos</h2>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full border p-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          className="w-full border p-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
        >
          Log In
        </button>

        <p className="text-xs text-center text-gray-500">
          Demo Password = Current Time (HHMM)
        </p>
      </div>
    </div>
  )
}