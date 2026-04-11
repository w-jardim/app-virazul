import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../../pages/Home'
import NotFound from '../../pages/NotFound'
import DefaultLayout from '../../components/layout/DefaultLayout'

const Router: React.FC = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default Router
