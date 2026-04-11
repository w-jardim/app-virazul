import React from 'react'
import { Outlet } from 'react-router-dom'

const DefaultLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-blue-600 text-white p-4">virazul</header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="p-4 text-center text-sm text-gray-500">© virazul</footer>
    </div>
  )
}

export default DefaultLayout
