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
import ModalConfirmation from './components/ModalConfirmation';
import { sellPercentApi } from './services/api';

const App = () => {
  const [wallet, setWallet] = useState("");
  const [input, setInput] = useState("");
  const [pk, setPk] = useState("");
  const [ca, setCa] = useState("0x");
  const [roiThreshold, setRoiThreshold] = useState(200);
  const [sellPercentConfig, setSellPercentConfig] = useState(50);
  const [stopLoss, setStopLoss] = useState(null);
  const [stopLossSellPercent, setStopLossSellPercent ] = useState(null);
  const [data, setData] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [fetchIntervalId, setFetchIntervalId] = useState(null);
  const [activeSection, setActiveSection] = useState('fetch-data');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [calledTokens, setCalledTokens] = useState([]);
  const [soldTokens, setSoldTokens] = useState([]);
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [tokenToSell, setTokenToSell] = useState(null);

  const logAndUpdateConsole = (message) => {
    setConsoleMessages(prevMessages => [...prevMessages, message]);
  };

  const handleSellAgain = (index) => {
    setCalledTokens(prev => prev.filter((_, i) => i !== index));
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openConfirmModal = (token) => {
    if (!pk) {
      setModalMessage('Private Key is required to sell tokens.');
      setModalIsOpen(true);
      return;
    }
    setTokenToSell(token);
    setConfirmModalIsOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalIsOpen(false);
    setTokenToSell(null);
  };

  const confirmSell = async () => {
    if (!tokenToSell) return;

    try {
      await sellPercentApi(pk, tokenToSell.address, 100);
      logAndUpdateConsole(`Sell of 100% called for CA: ${tokenToSell.address}`);
      setCalledTokens(prev => prev.filter(token => token.address !== tokenToSell.address));
      setSoldTokens(prev => [...prev, { ...tokenToSell, sellPercentage: 100, estimatedSale: tokenToSell.output }]);
      closeConfirmModal();
    } catch (error) {
      logAndUpdateConsole(`Error calling sell endpoint for ${tokenToSell.address}: ${error.message}`);
    }
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
              stopLoss={stopLoss}
              setStopLoss={setStopLoss}
              stopLossSellPercent={stopLossSellPercent}
              setStopLossSellPercent={setStopLossSellPercent}
              intervalId={intervalId}
              setIntervalId={setIntervalId}
              fetchIntervalId={fetchIntervalId}
              setFetchIntervalId={setFetchIntervalId}
              logAndUpdateConsole={logAndUpdateConsole}
              setModalMessage={setModalMessage}
              setModalIsOpen={setModalIsOpen}
              calledTokens={calledTokens}
              setCalledTokens={setCalledTokens}
              soldTokens={soldTokens}
              setSoldTokens={setSoldTokens}
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
              data={data}
              soldTokens={soldTokens}
              setSoldTokens={setSoldTokens}
            />
          )}
        </div>

        <TokensPortfolio
          wallet={wallet}
          data={data}
          calledTokens={calledTokens}
          soldTokens={soldTokens}
          handleSellAgain={handleSellAgain}
          logAndUpdateConsole={logAndUpdateConsole}
          openConfirmModal={openConfirmModal}
        />

        <Console consoleMessages={consoleMessages} />
      </div>

      <ModalNotification
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        modalMessage={modalMessage}
      />

      <ModalConfirmation
        modalIsOpen={confirmModalIsOpen}
        closeModal={closeConfirmModal}
        modalMessage={`Confirm selling 100% of ${tokenToSell?.symbol}?`}
        confirmAction={confirmSell}
      />
    </div>
  );
};

export default App;