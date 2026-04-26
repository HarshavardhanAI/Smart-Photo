import React from 'react'
import { NavLink } from 'react-router-dom'

const Results = ({ data }) => {
  if (!data) return null;

  return data.status === 'success' ? (
    <div className='flex flex-col items-center gap-4 border-2 border-[#8b949e] rounded-md p-5 w-full bg-[#161b22] h-auto'>
      <h2 className='text-2xl font-semibold text-[#e6edf3]'>Analysis Results</h2>
      <div className='flex w-full gap-10 justify-center'>
        <table className='text-white border-0 h-fit w-full md:max-w-[50%] border-[#8b949e] text-left'>
          <thead>
            <tr className='text-center'>
              <th className='border text-bold text-xl border-[#8b949e] p-2'>Color</th>
              <th className='border text-bold text-xl border-[#8b949e] p-2'>Best Match</th>
              <th className='border text-bold text-xl border-[#8b949e] p-2'>Top 3 Candidates</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result, index) => (
              <tr className='text-center align-top' key={index}>

                <td className='border border-[#8b949e] p-2'>
                  <div style={{ backgroundColor: result.color, width: "32px", height: "32px", borderRadius: "4px", margin: "0 auto" }} />
                </td>

                <td className='border border-[#8b949e] p-2 font-semibold'>
                  {result.best_match}
                  <div className='text-sm text-[#8b949e]'>
                    {result.candidates[0]?.confidence.toFixed(2)}%
                  </div>
                </td>

                <td className='border border-[#8b949e] p-2'>
                  <div className='flex flex-col gap-1'>
                    {result.candidates.map((c, i) => (
                      <div key={i} className='flex justify-between gap-4 text-sm'>
                        <span className={i === 0 ? 'text-[#58a6ff]' : 'text-[#8b949e]'}>
                          {i + 1}. {c.name}
                        </span>
                        <span className={i === 0 ? 'text-[#3fb950]' : 'text-[#8b949e]'}>
                          {c.confidence.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        <img
          src={data.image_url}
          className='border border-[#8b949e] hidden sm:block sm:h-[50vh] w-auto'
          alt="Analysis Result"
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-4 border-2 border-[#8b949e] rounded-md p-5 w-full bg-[#161b22] h-auto text-white'>
      <h1 className='text-2xl text-bolder'>{data.message}</h1>
      <NavLink to='/add-image' className='bg-[#58a6ff] hover:bg-[#58a6ff]/80 py-2 px-4 rounded-md'>
        Add Face
      </NavLink>
    </div>
  );
}

export default Results