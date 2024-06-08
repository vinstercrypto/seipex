import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css';

const App = () => {
  const [wallet, setWallet] = useState("");
  const [input, setInput] = useState("");
  const [pk, setPk] = useState("");
  const [ca, setCa] = useState("");
  const [roiThreshold, setRoiThreshold] = useState(200);
  const [sellPercentConfig, setSellPercentConfig] = useState(50);
  const [data, setData] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [fetchIntervalId, setFetchIntervalId] = useState(null);
  const [activeSection, setActiveSection] = useState('fetch-data');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [calledTokens, setCalledTokens] = useState(new Set());

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
      clearInterval(fetchIntervalId);
    };
  }, [activeSection]);

  const fetchData = async () => {
    if (!wallet || !input) {
      setModalMessage('Please fill in Wallet Address and Input.');
      setModalIsOpen(true);
      return;
    }

    try {
      const response = await axios.get(`https://printer.seipex.fi/roi?wallet=${wallet}&input=${input}`);
      const results = response.data.results;
      setData(results);
      return results;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const sellPercent = async () => {
    if (!pk || !ca || !sellPercentConfig) {
      setModalMessage('Please fill in Private Key, Contract Address, and Sell Percentage.');
      setModalIsOpen(true);
      return;
    }

    try {
      await axios.get('https://printer.seipex.fi/sell', {
        params: {
          pk: pk,
          ca: ca,
          percent: sellPercentConfig
        }
      });
      console.log(`Sell called for contract address: ${ca}`);
    } catch (error) {
      console.error(`Error calling sell endpoint for ${ca}:`, error);
    }
  };

  const startChecking = async () => {
    if (!wallet || !input || !pk || !ca || !roiThreshold || !sellPercentConfig) {
      setModalMessage('Please fill in all the fields for Auto-Sell.');
      setModalIsOpen(true);
      return;
    }

    setModalMessage('This action will start a process that checks and sells automatically. Keep the page open.');
    setModalIsOpen(true);

    const results = await fetchData();
    const id = setInterval(async () => {
      const data = await fetchData();
      for (const result of data) {
        const { address, ROI } = result;
        if (parseFloat(ROI) >= roiThreshold && !calledTokens.has(address)) {
          setCalledTokens(prev => new Set(prev.add(address)));
          sellPercent();
        }
      }
    }, 3000); // Refresh every 3 seconds
    setIntervalId(id);
  };

  const startFetching = () => {
    if (fetchIntervalId) {
      clearInterval(fetchIntervalId);
      setFetchIntervalId(null);
    } else {
      const id = setInterval(fetchData, 3000); // Refresh every 3 seconds
      setFetchIntervalId(id);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="container">
      <h1>Seipex management</h1>
      <div className="dashboard">
        <div className="panel">
          <div className="sectionsContainer">
            <button onClick={() => setActiveSection('fetch-data')}>Fetch portfolio</button>
            <button onClick={() => setActiveSection('auto-sell')}>Auto-sell</button>
            <button onClick={() => setActiveSection('sell')}>Manual Sell</button>
          </div>

          {activeSection === 'auto-sell' && (
            <div className="formModule">
              <h2>Auto-Sell</h2>
              <div>
                <label>Wallet address:</label>
                <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
              </div>
              <div>
                <label>Wallet private key (pk):</label>
                <input type="password" value={pk} onChange={(e) => setPk(e.target.value)} />
              </div>
              <div>
                <label>Input (ETH):</label>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
              </div>
              <div>
                <label>Contract address (CA):</label>
                <input type="text" value={ca} onChange={(e) => setCa(e.target.value)} />
              </div>
              <div>
                <label>ROI Threshold (%):</label>
                <input type="number" value={roiThreshold} onChange={(e) => setRoiThreshold(e.target.value)} />
              </div>
              <div>
                <label>Sell Percentage (%):</label>
                <input type="number" value={sellPercentConfig} onChange={(e) => setSellPercentConfig(e.target.value)} />
              </div>
              <button onClick={startChecking}>Start Auto-Sell</button>
            </div>
          )}

          {activeSection === 'sell' && (
            <div className="formModule">
              <h2>Sell</h2>
              <div>
                <label>Private Key (pk):</label>
                <input type="password" value={pk} onChange={(e) => setPk(e.target.value)} />
              </div>
              <div>
                <label>Contract Address (ca):</label>
                <input type="text" value={ca} onChange={(e) => setCa(e.target.value)} />
              </div>
              <div>
                <label>Sell Percentage (%):</label>
                <input type="number" value={sellPercentConfig} onChange={(e) => setSellPercentConfig(e.target.value)} />
              </div>
              <button onClick={sellPercent}>Sell Percentage</button>
            </div>
          )}

          {activeSection === 'fetch-data' && (
            <div className="formModule">
              <h2>Fetch Portfolio</h2>
              <div>
                <label>Wallet Address:</label>
                <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
              </div>
              <div>
                <label>Input (ETH):</label>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
              </div>
              <button onClick={fetchData}>Fetch</button>
              <button onClick={startFetching}>{fetchIntervalId ? 'Stop Fetching' : 'Start Fetching'}</button>
            </div>
          )}
        </div>

        <div className="tokensModule">
          <h2>Tokens Portfolio</h2>
          <div className="walletAddress">
            <p>Wallet: <a href={`https://basescan.org/address/${wallet}`} target="_blank" rel="noopener noreferrer">{wallet}</a></p>
          </div>
          <div className="tokensContainer">
            {data && data.length > 0 && (
              data.map((result, index) => (
                <div key={index} className="tokenBox">
                  <p>Address: {result.address}</p>
                  <p>Name: {result.name}</p>
                  <p>Symbol: {result.symbol}</p>
                  <p>Liquidity: {result.liquidity}</p>
                  <p>Market Cap: {result.mcap}</p>
                  <p>Output: {result.output}</p>
                  <p>ROI: {result.ROI}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>


      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Notification"
        className="modalContent"
        overlayClassName="modalOverlay"
      >
        <h2>Notification</h2>
        <p>{modalMessage}</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default App;
