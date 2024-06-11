// src/components/Header.js
import React from 'react';

const Header = () => (
  <div className="header">
    <h1>Seipex Manager v0.3</h1>
    <h3>by <a href="https://x.com/_IA_Lopez" target="_blank" rel="noopener noreferrer">@_IA_LOPEZ</a></h3>
    <button className="copyButton" onClick={() => navigator.clipboard.writeText("0x742281DcbC8df500f1D5DF6B4269e65e72FcAef9")}>Copy TIP wallet</button>
    <button className="copyButton" onClick={() => window.open(`https://github.com/IA-Lopez/seipex`, '_blank', 'noopener,noreferrer')}>Github</button>
  </div>
);

export default Header;