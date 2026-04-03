import React, { useState } from 'react'
import ImagePreview from '../Dashborad/ImagePreview'
import { MdOutlineFileUpload, MdDeleteOutline } from 'react-icons/md'
import Spinner from '../Utility/Spinner'
import { NavLink } from 'react-router-dom';

const AddImage = () => {
  const [handleImageUpload,setImageUploaded] = useState(false);
  const [image,setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userName,setUserName] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNoFace, setIsNoFace] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUploaded(true);
      setIsNoFace(false);
      setIsDuplicate(false);
      setIsSuccess(false);
    }
  };

  let handleAnalyse = async () => {
    if (!image || !userName) {
      alert("Please provide both a name and an image.");
      return;
    }
    setIsAnalysing(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('name', userName);
    console.log(formData);
    const response = await fetch('http://localhost:5000/addperson', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log(result);
    setIsAnalysing(false);
    
    // // Simulate API call
    // setTimeout(() => {
    //    setIsAnalysing(false);
    //    setIsSuccess(true); 
    // }, 3000);
  }
  
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setUserName("");
    setImageUploaded(false);
    setIsNoFace(false);
  };

  return (
    <div className='text-[#e6edf3] min-h-screen w-full flex flex-col gap-6 justify-center items-center bg-[#0d1117] py-10'>
      {isAnalysing ? (
        <div className='flex flex-col items-center justify-center gap-4'>
          <Spinner />
          <h1 className='text-2xl font-bold'>Analysing Image...</h1>
        </div>
      ) : isSuccess ? (
        <div className='flex flex-col items-center justify-center gap-5'>
          <h1 className='text-3xl font-bold text-green-500'>Person added successfully!</h1>
          <div className='flex w-full justify-center gap-10'>
            <button onClick={() => { setIsSuccess(false); removeImage(); }} className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-white px-8 py-2 rounded-md transition-all'>
            Add Another
          </button>
          <NavLink to={"/"} className="text-bold bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-white px-8 py-2 rounded-md transition-all ">
            Analyse Person 
          </NavLink>
          </div>
        </div>
      ) : isNoFace ? (
        <div className='flex flex-col items-center justify-center gap-5 text-center px-10'>
          <h1 className='text-3xl font-bold text-yellow-500'>No face detected!</h1>
          <p className='text-[#8b949e] max-w-md'>We couldn't find a face in the image you uploaded. Please try again with a clearer photo.</p>
          <button 
            onClick={() => { setIsNoFace(false); removeImage(); }} 
            className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-white px-8 py-2 rounded-md transition-all mt-4'
          >
            Upload Again
          </button>
        </div>
      ) : isDuplicate ? (
        <div className='flex flex-col items-center justify-center gap-5 text-center px-10'>
          <h1 className='text-3xl font-bold text-red-500'>Person already exists!</h1>
          <p className='text-[#8b949e] max-w-md'>This person is already registered in the database.</p>
          <button 
            type="button"
            onClick={() => { setIsDuplicate(false); removeImage(); }}
            className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-white px-8 py-2 rounded-md transition-all mt-4'
          >
            Try Another
          </button>
        </div>
      ) : (
        <>
          <div className='w-full max-w-2xl px-10'>
            <h1 className='text-3xl font-black mb-2 text-center sm:text-left'>Add face to model</h1>
            <p className='text-[#8b949e] text-center sm:text-left'>Register a new face to your smart organiser</p>
          </div>
          
          <form action="" className='w-full max-w-2xl px-10 flex gap-6 flex-col'>
             {/* user name input field  */}
            <div className='flex gap-3 flex-col w-full'>
              <label htmlFor="Name" className='block font-medium' aria-required='true'>Full Name</label>
              <input 
                type="text" 
                name='userName'
                value={userName}
                placeholder="Enter person's name"
                className='bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 w-full focus:border-blue-500 focus:outline-none transition-colors'
                onChange={(e)=>{setUserName(e.target.value)}}
                required
              />
            </div>
            
            {handleImageUpload && imagePreview ? (
              <div className='justify-start flex w-full'>
                <div className='relative gap-4 w-full rounded-md border border-[#30363d] text-white flex flex-col items-center justify-center p-6 bg-[#161b22]'>
                  <h2 className='text-xl font-bold'>Image Uploaded</h2>
                  <div className='w-full flex items-center justify-center overflow-hidden rounded-md'>
                    <img src={imagePreview} alt="Uploaded" className='max-h-[30vh] w-auto object-contain shadow-2xl' />
                  </div>
                  
                  <div className='flex w-full justify-center gap-4 mt-2'>
                    <button 
                      type="button" 
                      className='flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md border border-red-500/20 transition-all' 
                      onClick={removeImage}
                    >
                      <MdDeleteOutline className='h-5 w-5' />
                      Remove Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // image upload box 
              <label className='cursor-pointer min-h-[30vh] w-full rounded-md border-dashed border-2 border-[#30363d] text-white flex flex-col gap-4 justify-center items-center hover:bg-[#161b22] hover:border-blue-500/50 transition-all group'>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple={false} 
                  className="hidden" 
                  onChange={handleFileChange}
                  name='image'
                />
                <MdOutlineFileUpload className="h-16 w-16 text-[#8b949e] group-hover:text-blue-400 transition-colors" /> 
                <div className='text-center'>
                  <h1 className="text-xl font-medium">Upload an image</h1>
                  <p className='text-[#8b949e] text-sm mt-1'>Click or drag and drop to start</p>
                </div>
              </label>
            )}

            <div className='w-full flex justify-center mt-4'>
              <button 
                type="button"
                onClick={handleAnalyse}
                className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-white font-bold px-8 py-3 rounded-md w-full transition-all shadow-lg active:scale-95'
              >
                Store Image in Database
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AddImage
