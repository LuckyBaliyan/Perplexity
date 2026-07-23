import React from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat';
import { useEffect } from 'react';

function Dashboard() {

      const chat = useChat();

      const user = useSelector(state => state.auth.user);
      console.log(user);

      useEffect(() => {

            chat.initalizeSocketConnection();

      }, [])

      return (
            <div>
                  <h1 className='text-7xl text-white text-center mt-12'>Welcome to <span className='text-red-500 font-semibold'>Perplexor</span> Ai</h1>
                  <h1 className='text-4xl text-white text-center font-mono'>User Dashboard</h1>
                  <div className='flex justify-center items-center mt-12 text-amber-50'>
                        {JSON.stringify(user)}
                  </div>
            </div>
      )

}

export default Dashboard