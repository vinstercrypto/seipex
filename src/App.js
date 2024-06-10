import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css';

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
  const [calledTokens, setCalledTokens] = useState(new Set());
  const [consoleMessages, setConsoleMessages] = useState([]);
  const consoleEndRef = useRef(null); // Añadir ref

  const logAndUpdateConsole = (message) => {
    console.log(message);
    updateConsole(message);
  };

  const fetchData = async () => {
    logAndUpdateConsole('Fetching data');
    if (!wallet || !input) {
      setModalMessage('Please fill in Wallet Address and Input.');
      setModalIsOpen(true);
      logAndUpdateConsole('Fetching data aborted: Wallet Address and Input required');
      return;
    }

    try {
      const response = await axios.get('https://printer.seipex.fi/roi', {
        params: {
          wallet: wallet,
          input: input
        }
      });
      const results = response.data.results;
      setData(results);
      logAndUpdateConsole('Fetching data completed successfully');
      return results;
    } catch (error) {
      logAndUpdateConsole(`Error fetching data: ${error.message}`);
    }
  };

  const sellPercent = async (address) => {
    logAndUpdateConsole(`Starting sell for CA: ${address}`);
    if (!pk || !ca || !sellPercentConfig) {
      setModalMessage('Please fill in Private Key, Contract Address, and Sell Percentage.');
      setModalIsOpen(true);
      logAndUpdateConsole('Sell aborted: Missing required fields');
      return;
    }

    try {
      await axios.get('https://printer.seipex.fi/sell', {
        params: {
          pk: pk,
          ca: address,
          percent: sellPercentConfig
        }
      });
      logAndUpdateConsole(`Sell of ${sellPercentConfig}% called for CA: ${address}`);
    } catch (error) {
      logAndUpdateConsole(`Error calling sell endpoint for ${address}: ${error.message}`);
    }
  };

  const startAutoSell = async () => {
    logAndUpdateConsole('Starting Auto-sell');
    if (!wallet || !input || !pk || !ca || !roiThreshold || !sellPercentConfig) {
      setModalMessage('Please fill in all the fields for Auto-Sell.');
      setModalIsOpen(true);
      logAndUpdateConsole('Auto-sell aborted: Missing required fields');
      return;
    }

    if (fetchIntervalId) {
      clearInterval(fetchIntervalId);
      setFetchIntervalId(null);
      logAndUpdateConsole('Stopped fetching to avoid conflict with auto-sell');
    }

    setModalMessage('This action will start a process that checks and sells automatically. Keep the page open.');
    setModalIsOpen(true);

    logAndUpdateConsole('Starting auto-sell process');

    const id = setInterval(async () => {
      logAndUpdateConsole('Fetching data for auto-sell');
      const data = await fetchData();
      if (data) {
        logAndUpdateConsole('Starting autosell');
        for (const result of data) {
          const { address, ROI, symbol } = result;
          if (ca && ca !== '0x' && address === ca) {
            if (parseFloat(ROI) >= roiThreshold && !calledTokens.has(address)) {
              logAndUpdateConsole(`Checking ROI for selected CA: ${address}`);
              setCalledTokens(prev => new Set(prev.add(address)));
              await sellPercent(address);
            } else {
              logAndUpdateConsole(`${roiThreshold}% ROI not reached (${ROI})`);
            }
          } else if (ca === '0x') {
            if (parseFloat(ROI) >= roiThreshold && !calledTokens.has(address)) {
              logAndUpdateConsole(`Checking ROI for CA: ${address}`);
              setCalledTokens(prev => new Set(prev.add(address)));
              await sellPercent(address);
            } else {
              logAndUpdateConsole(`${roiThreshold}% ROI not reached (${ROI}) for ${symbol}`);
            }
          }
        }
      } else {
        logAndUpdateConsole('No data fetched for autosell');
      }
    }, 3000); // Refresh every 3 seconds

    setIntervalId(id);
  };

  const stopAutoSell = () => {
    logAndUpdateConsole('Stopping auto-sell process');
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setModalMessage('Auto-Sell stopped.');
      setModalIsOpen(true);
      logAndUpdateConsole('Auto-Sell stopped.');
    }
  };

  const toggleFetching = () => {
    logAndUpdateConsole('Toggling fetch process');
    if (intervalId) {
      setModalMessage('Auto-sell is already active and auto-fetching');
      setModalIsOpen(true);
      logAndUpdateConsole('Fetch process not started: Auto-sell is already active');
      return;
    }

    if (fetchIntervalId) {
      clearInterval(fetchIntervalId);
      setFetchIntervalId(null);
      logAndUpdateConsole('Fetch process stopped');
    } else {
      fetchData();
      const id = setInterval(fetchData, 3000); // Refresh every 3 seconds
      setFetchIntervalId(id);
      logAndUpdateConsole('Fetch process started');
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const updateConsole = (message) => {
    setConsoleMessages(prevMessages => [...prevMessages, message]);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages]);

  return (
    <div className="container">
      <div className="header">
        <h1>Seipex Manager v0.1</h1> 
        <h3>by <a href="https://x.com/_IA_Lopez" target="_blank" rel="noopener noreferrer">@_IA_LOPEZ</a></h3> 
        <button className="copyButton" onClick={() => navigator.clipboard.writeText("0x742281DcbC8df500f1D5DF6B4269e65e72FcAef9")}>Copy TIP wallet</button> 
        <button className="copyButton" onClick={() => window.open(`https://github.com/IA-Lopez/seipex`, '_blank', 'noopener,noreferrer')}>Github</button>
      </div>
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
              {intervalId ? (
                <button onClick={stopAutoSell}>Stop Auto-Sell</button>
              ) : (
                <button onClick={startAutoSell}>Start Auto-Sell</button>
              )}
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
              <button onClick={() => sellPercent(ca)}>Sell Percentage</button>
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
              <button onClick={toggleFetching}>{fetchIntervalId ? 'Stop Auto-Fetching' : 'Start Auto-Fetching'}</button>
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
                  <div className="tokenField">
                    <div className="fieldName">CA</div>
                    <div className="fieldValue" title={result.address}>{result.address.length > 17 ? `${result.address.substring(0, 17)}...` : result.address}</div>
                    <button className="copyButton" onClick={() => navigator.clipboard.writeText(result.address)}>Copy CA</button>
                  </div>
                  <div className="tokenField">
                    <div className="fieldName">Name</div>
                    <div className="fieldValue">{result.name}</div>
                  </div>
                  <div className="tokenField">
                    <div className="fieldName">Symbol</div>
                    <div className="fieldValue">{result.symbol}</div>
                  </div>
                  <div className="tokenField">
                    <div className="fieldName">Liquidity</div>
                    <div className="fieldValue">{result.liquidity} ETH</div>
                  </div>
                  <div className="tokenField">
                    <div className="fieldName">Market Cap</div>
                    <div className="fieldValue">{result.mcap} ETH</div>
                  </div>
                  <div className="tokenField">
                    <div className="fieldName">Output</div>
                    <div className="fieldValue">{result.output} ETH</div>
                  </div>
                  <div className="tokenField">
                    <div className="fieldName">ROI</div>
                    <div className="fieldValue">{result.ROI}</div>
                  </div>
                  <div className="tokenField">
                    <button className="copyButton" onClick={() => window.open(`https://basescan.org/address/${result.address}`, '_blank', 'noopener,noreferrer')}>Basescan</button>
                    <button className="copyButton" onClick={() => window.open(`https://dexscreener.com/base/${result.address}`, '_blank', 'noopener,noreferrer')}>Dexscreener</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="consoleModule">
          <h2>Console</h2>
          <div className="consoleContainer">
            {consoleMessages.map((msg, index) => (
              <div key={index} className="consoleMessage">{msg}</div>
            ))}
            <div ref={consoleEndRef} />
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
