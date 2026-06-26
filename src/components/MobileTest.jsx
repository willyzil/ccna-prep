import React from 'react';

export default function MobileTest() {
  return (
    <div style={{
      background: 'white',
      color: 'black',
      padding: '20px',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1>CCNA Prep - Mobile Test</h1>
      <p>JavaScript is working!</p>
      <p>Viewport: {window.innerWidth} x {window.innerHeight}</p>
      <p>Screen: {screen.width} x {screen.height}</p>
    </div>
  );
}
