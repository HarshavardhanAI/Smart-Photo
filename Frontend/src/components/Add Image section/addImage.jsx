import React, { useState } from 'react'
import ImagePreview from '../Dashborad/ImagePreview'
import { MdOutlineFileUpload } from 'react-icons/md'

const AddImage = () => {
  const [handleImageUpload,setImageUploaded] = useState(false);
  
  return (
    <div className='text-white h-[100vh] w-[100vw] flex flex-col gap-3 justify-center  '>
        <div className='w-full px-10'>
          <h1 className='text-2xl font-black '>Add face to model</h1>
        </div>
        {/* formn section */}
        <form action="" className='w-full px-10 flex gap-5 flex-col'>
          <div className='flex gap-3 flex-col w-full'>
            <label htmlFor="Name" className='block '> Name</label>
            <input type="text" className='border border-white rounded-md px-3 py-2 w-[50vh]'/>
          </div>
          <div className='justify-start flex w-full'>
            <label className='cursor-pointer h-[30vh] w-full rounded-md border-dashed border-2 border-[#8b949e] text-white flex flex-col gap-5 justify-center items-center hover:bg-[#161b22] transition-colors'>
              <input 
                type="file" 
                accept="image/*"
                multiple={false} 
                className="hidden" 
              />
              <MdOutlineFileUpload className="h-16 w-16 text-[#58a6ff]" /> 
              <h1 className="text-2xl font-medium">Upload an image</h1>
              <p className='text-[#8b949e]'>Click or drag and drop to start</p>
            </label>
            </div>
        < div>
        <button className='bg-blue-400 px-4 py-2 rounded-md w-[30vh]'>
              Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddImage
