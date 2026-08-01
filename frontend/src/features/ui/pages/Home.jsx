import React from 'react'

function Home() {
      return (
            <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                  textAlign: 'center',
                  fontFamily: 'sans-serif',
                  padding: '20px'
            }}>
                  <h1 style={{ fontSize: '2rem' }}>😴 Yeah... I didn't build this page.</h1>
                  <p style={{ fontSize: '1.1rem', maxWidth: '400px', margin: '10px 0' }}>
                        Too lazy, too busy, too unbothered. Sue us.
                  </p>
                  <p style={{ fontSize: '1.1rem' }}>
                        If you actually want something that <em>works</em>, go hit{' '}
                        <a href="/login" style={{ color: '#ff4757', fontWeight: 'bold' }}>
                              /login
                        </a>{' '}
                        instead.
                  </p>
            </div>
      )
}

export default Home