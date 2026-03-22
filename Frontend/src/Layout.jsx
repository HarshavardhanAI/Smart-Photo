import React from 'react'
import Dashboard from './components/Dashborad/Dashboard'
import Database from './components/database section/Database/database'
import About from './components/About section/About'
import AddImage from './components/Add Image section/addImage'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'

const Layout = () => {
  return <>
  <Navbar/>
        <Routes>  
          <Route path="/" element={<Dashboard/>} />
          <Route path="/add-image" element={<AddImage/>} />
          <Route path="/database" element={<Database/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
</>
}

export default Layout
