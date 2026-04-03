import React from 'react'
import image from '../Images/img.jpeg'
import { NavLink } from 'react-router-dom'
const Results = () => {
  const [results, setResults] = React.useState(true)

  return (results ? (
        <div className='flex flex-col items-center gap-4 border-2 border-[#8b949e] rounded-md p-5 w-full bg-[#161b22] h-auto '>
          <h2 className='text-2xl font-semibold text-[#e6edf3]'>Analysis Results</h2>
          <div className='flex w-full gap-10  justify-center'>
            <table className='text-white border-0 h-fit w-full md:max-w-[50%]  border-[#8b949e] text-left'>
            <thead>
              <tr className='text-centr'>
                <th className='border text-bold text-xl border-[#8b949e] p-2'>Name</th>
                <th className='border text-bold text-xl border-[#8b949e] p-2'>Confidence</th>
              </tr>
            </thead>
            <tbody>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
              <tr className='text-center'>
                <td className='border border-[#8b949e] p-2'>John Doe</td>
                <td className='border border-[#8b949e] p-2'>95%</td>
              </tr>
            </tbody>
          </table>
          <img src={image} className=' border border-[#8b949e] hidden sm:block sm:h-[50vh] w-auto' alt="Analysis Result" />
          </div>
          <button onClick={() => setResults(!results) } className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 text-white py-2 px-4 rounded-md'>change results</button>
        </div>
      ):(
        <div className='flex flex-col items-center justify-center gap-4 border-2 border-[#8b949e] rounded-md p-5 w-full bg-[#161b22] h-auto text-white'>
          <h1 className='text-2xl text-bolder '>No face are recognized . please  try adding face  to model.</h1>
          <NavLink to='/add-image' className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 py-2 px-4 rounded-md'>Add Face</NavLink>
        </div>
      ))
 }

export default Results