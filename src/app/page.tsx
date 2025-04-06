'use client'

import { supabase } from "@/lib/supabase"

export default function Home() {
  const testConnection = async () => {
    const { data, error } = await supabase.from('test').select('*')
    console.log("data", data)
    console.log("error", error)
  }

  return (
      <main className="p-4">
        <h1 className="text-xl font-bold">Home Page</h1>
        <button onClick={testConnection} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Проверить Supabase
        </button>
      </main>
  )
}
