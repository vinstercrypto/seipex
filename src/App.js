// src/App.js
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import FetchData from './components/FetchData';
import AutoSell from './components/AutoSell';
import ManualSell from './components/ManualSell';
import TokensPortfolio from './components/TokensPortfolio';
import Console from './components/Console';
import ModalNotification from './components/ModalNotification';

const App = () => {
  const [wallet, setWallet] = useState("");
  const [input, setInput] = useState("");
  const [pk, setPk] = useState("");
  const [ca, setCa] = useState("0x");
  const [roiThreshold, setRoiThreshold] = useState(200);
  const [sellPercentConfig, setSellPercentConfig] = useState(50);
  const [data, setData] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [fetchIntervalId, setFetchIntervalId] = useState(null);
  const [activeSection, setActiveSection] = useState('fetch-data');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [calledTokens, setCalledTokens] = useState([]);
  const [consoleMessages, setConsoleMessages] = useState([]);

  const logAndUpdateConsole = (message) => {
    console.log(message);
    setConsoleMessages(prevMessages => [...prevMessages, message]);
  };

  const handleSellAgain = (index) => {
    setCalledTokens(prev => prev.filter((_, i) => i !== index));
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="container">
      <Header />
      <div className="dashboard">
        <div className="panel">
          <div className="sectionsContainer">
            <button onClick={() => setActiveSection('fetch-data')}>Fetch portfolio</button>
            <button onClick={() => setActiveSection('auto-sell')}>Auto-sell</button>
            <button onClick={() => setActiveSection('sell')}>Manual Sell</button>
          </div>

          {activeSection === 'fetch-data' && (
            <FetchData
              wallet={wallet}
              setWallet={setWallet}
              input={input}
              setInput={setInput}
              setData={setData}
              setModalMessage={setModalMessage}
              setModalIsOpen={setModalIsOpen}
              fetchIntervalId={fetchIntervalId}
              setFetchIntervalId={setFetchIntervalId}
              logAndUpdateConsole={logAndUpdateConsole}
            />
          )}

          {activeSection === 'auto-sell' && (
            <AutoSell
              wallet={wallet}
              setWallet={setWallet}
              input={input}
              setInput={setInput}
              pk={pk}
              setPk={setPk}
              ca={ca}
              setCa={setCa}
              roiThreshold={roiThreshold}
              setRoiThreshold={setRoiThreshold}
              sellPercentConfig={sellPercentConfig}
              setSellPercentConfig={setSellPercentConfig}
              intervalId={intervalId}
              setIntervalId={setIntervalId}
              fetchIntervalId={fetchIntervalId}
              setFetchIntervalId={setFetchIntervalId}
              logAndUpdateConsole={logAndUpdateConsole}
              setModalMessage={setModalMessage}
              setModalIsOpen={setModalIsOpen}
              calledTokens={calledTokens}
              setCalledTokens={setCalledTokens}
              setData={setData}
            />
          )}

          {activeSection === 'sell' && (
            <ManualSell
              pk={pk}
              setPk={setPk}
              ca={ca}
              setCa={setCa}
              sellPercentConfig={sellPercentConfig}
              setSellPercentConfig={setSellPercentConfig}
              logAndUpdateConsole={logAndUpdateConsole}
              setModalMessage={setModalMessage}
              setModalIsOpen={setModalIsOpen}
            />
          )}
        </div>

        <TokensPortfolio
          wallet={wallet}
          data={data}
          calledTokens={calledTokens}
          handleSellAgain={handleSellAgain}
          logAndUpdateConsole={logAndUpdateConsole}
        />

        <Console consoleMessages={consoleMessages} />
      </div>

      <ModalNotification
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        modalMessage={modalMessage}
      />
    </div>
  );
};

export default App;
