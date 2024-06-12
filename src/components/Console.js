// src/components/Console.js

import React, { useRef, useEffect, useState } from 'react';

const Console = ({ consoleMessages }) => {
  const consoleEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, autoScroll]);

  const toggleAutoScroll = () => {
    setAutoScroll(prevAutoScroll => !prevAutoScroll);
  };

  return (
    <div className="consoleModule">
      <div className="consoleHeader">
        <h2>Console</h2>
        <button className="autoScrollButton" onClick={toggleAutoScroll}>
          {autoScroll ? 'Disable Auto-Scroll' : 'Enable Auto-Scroll'}
        </button>
      </div>
      <div className="consoleContainer">
        {consoleMessages.map((msg, index) => (
          <div key={index} className="consoleMessage">{msg}</div>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default Console;
