import React, { useState } from 'react';
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

  const fetchData = async () => {
    if (!wallet || !input) {
      setModalMessage('Please fill in Wallet Address and Input.');
      setModalIsOpen(true);
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
      return results;
    } catch (error) {
      console.error("Error fetching data:", error);
      updateConsole(`Error fetching data: ${error.message}`);
    }
  };

  const sellPercent = async (address) => {
    if (!pk || !ca || !sellPercentConfig) {
      setModalMessage('Please fill in Private Key, Contract Address, and Sell Percentage.');
      setModalIsOpen(true);
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
      console.log(`Sell of ${sellPercentConfig}% called for contract address: ${ca}`);
      updateConsole(`Sell of ${sellPercentConfig}% called for contract address: ${ca}`);
    } catch (error) {
      console.error(`Error calling sell endpoint for ${ca}:`, error);
      updateConsole(`Error calling sell endpoint for ${ca}: ${error.message}`);
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

    console.log('Starting auto-sell process');
    updateConsole('Starting auto-sell process');

    const id = setInterval(async () => {
      console.log('Fetching data');
      updateConsole('Fetching data');
      const data = await fetchData();
      console.log('Starting autosell check');
      updateConsole('Starting autosell check');
      for (const result of data) {
        const { address, ROI, symbol } = result;
        if (ca && ca !== '0x' && address === ca) {
          if (parseFloat(ROI) >= roiThreshold && !calledTokens.has(address)) {
            console.log("Checking ROI for selected CA: " + address);
            updateConsole("Checking ROI for selected CA: " + address);
            setCalledTokens(prev => new Set(prev.add(address)));
            await sellPercent(address);
          } else {
            console.log(roiThreshold + "% ROI not reached (" + ROI + ")");
            updateConsole(roiThreshold + "% ROI not reached (" + ROI + ")");
          }
        } else if (ca === '0x') {
          if (parseFloat(ROI) >= roiThreshold && !calledTokens.has(address)) {
            console.log("Checking ROI for CA: " + address);
            updateConsole("Checking ROI for CA: " + address);
            setCalledTokens(prev => new Set(prev.add(address)));
            await sellPercent(address);
          } else {
            console.log(roiThreshold + "% ROI not reached (" + ROI + ") for " + symbol);
            updateConsole(roiThreshold + "% ROI not reached (" + ROI + ") for " + symbol);
          }
        }
      }
    }, 5000); // Refresh every 5 seconds
    setIntervalId(id);
  };

  const stopChecking = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setModalMessage('Auto-Sell stopped.');
      setModalIsOpen(true);
      updateConsole('Auto-Sell stopped.');
    }
  };

  const toggleFetching = () => {
    if (fetchIntervalId) {
      clearInterval(fetchIntervalId);
      setFetchIntervalId(null);
    } else {
      const id = setInterval(fetchData, 5000); // Refresh every 5 seconds
      setFetchIntervalId(id);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const updateConsole = (message) => {
    setConsoleMessages(prevMessages => [...prevMessages, message]);
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
              {intervalId ? (
                <button onClick={stopChecking}>Stop Auto-Sell</button>
              ) : (
                <button onClick={startChecking}>Start Auto-Sell</button>
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
              <button onClick={toggleFetching}>{fetchIntervalId ? 'Stop Fetching' : 'Start Fetching'}</button>
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
