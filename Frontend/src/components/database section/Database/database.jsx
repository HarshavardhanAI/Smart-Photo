import React from 'react'
import image from '../../Images/img.jpeg'

const Database = () => {
  return (
    <div className='h-full w-full flex flex-col items-center gap-10 px-10 py-10 bg-[#0d1117] overflow-y-auto'>
      <h1 className='text-3xl font-bold text-[#e6edf3]'>Database</h1>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 w-full p-4'>
        <div className='flex flex-col items-center justify-center bg-[#161b22] border border-[#30363d] rounded-lg p-4 gap-3'>
          <img src={image} alt="Database Image" className='w-full h-auto rounded-md object-cover' />
          <h2 className='text-xl font-sbold text-[#e6edf3]'>trump</h2>
        </div>
        
      </div>
    </div>
  )
}

export default Database
