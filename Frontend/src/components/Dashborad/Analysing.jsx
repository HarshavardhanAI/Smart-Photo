import React from 'react'
import Spinner from '../Utility/Spinner';

const Analysing = () => {
  return (
    <div className=' gap-5  w-full rounded-md border-2 border-[#8b949e] text-white flex flex-col items-center justify-center p-5 h-[40vh]'>
        <Spinner/>
        <h1 className='text-2xl font-bold mb-4 animate-pulse'>Analysing Image...</h1>
    </div>
  )
}

export default Analysing
