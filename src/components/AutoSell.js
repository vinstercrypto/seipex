// src/components/AutoSell.js

import React, { useRef } from 'react';
import { sellPercentApi, fetchDataApi } from '../services/api';

const AutoSell = ({
    wallet, setWallet, input, setInput, pk, setPk, ca, setCa, roiThreshold, setRoiThreshold,
    sellPercentConfig, setSellPercentConfig, stopLoss, setStopLoss, stopLossSellPercent, setStopLossSellPercent,
    intervalId, setIntervalId, fetchIntervalId, setFetchIntervalId, logAndUpdateConsole, setModalMessage, setModalIsOpen,
    calledTokens, setCalledTokens, setSoldTokens, setData
}) => {
    const calledTokensRef = useRef(calledTokens);

    const fetchData = async () => {
        logAndUpdateConsole('Fetching data');
        if (!wallet || !input) {
            setModalMessage('Please fill in Wallet Address and Input.');
            setModalIsOpen(true);
            logAndUpdateConsole('Fetching data aborted: Wallet Address and Input required');
            return;
        }

        try {
            const results = await fetchDataApi(wallet, input);
            setData(results);
            logAndUpdateConsole('Fetching data completed successfully');
            return results;
        } catch (error) {
            logAndUpdateConsole(`Error fetching data: ${error.message}`);
        }
    };

    const sellPercent = async (address, symbol, output, percent) => {
        logAndUpdateConsole(`Starting sell for CA: ${address}`);
        if (!pk || !ca || !percent) {
            setModalMessage('Please fill in Private Key, Contract Address, and Sell Percentage.');
            setModalIsOpen(true);
            logAndUpdateConsole('Sell aborted: Missing required fields');
            return;
        }

        try {
            await sellPercentApi(pk, address, percent);
            logAndUpdateConsole(`Sell of ${percent}% called for CA: ${address}`);
            const newCalledToken = { address, symbol, sellPercentage: percent, estimatedSale: (percent / 100) * output };
            setCalledTokens(prev => {
                const updatedCalledTokens = [...prev, newCalledToken];
                calledTokensRef.current = updatedCalledTokens;
                return updatedCalledTokens;
            });
            setSoldTokens(prev => [...prev, newCalledToken]);
        } catch (error) {
            logAndUpdateConsole(`Error calling sell endpoint for ${address}: ${error.message}`);
        }
    };

    const startAutoSell = async () => {
        logAndUpdateConsole('Starting auto-sell checks');
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
                    const { address, ROI, symbol, output } = result;
                    const currentCalledTokens = calledTokensRef.current;
                    const parsedROI = parseFloat(ROI);

                    const thresholdReached = parsedROI >= roiThreshold;
                    const stopLossReached = stopLoss && parsedROI <= stopLoss;

                    if (ca && ca !== '0x' && address === ca) {
                        if (!currentCalledTokens.some(token => token.address === address)) {
                            if (thresholdReached) {
                                logAndUpdateConsole(`Threshold reached for CA: ${address}`);
                                await sellPercent(address, symbol, output, sellPercentConfig);
                            } else if (stopLossReached) {
                                logAndUpdateConsole(`Stop loss reached for CA: ${address}`);
                                await sellPercent(address, symbol, output, stopLossSellPercent);
                            } else {
                                logAndUpdateConsole(`${roiThreshold}% ROI not reached (${ROI})`);
                            }
                        } else {
                            logAndUpdateConsole(`${address} Already sold, remove it from list so it is eligible again`);
                        }
                    } else if (ca === '0x') {
                        if (!currentCalledTokens.some(token => token.address === address)) {
                            if (thresholdReached) {
                                logAndUpdateConsole(`Threshold reached for CA ${address}`);
                                await sellPercent(address, symbol, output, sellPercentConfig);
                            } else if (stopLossReached) {
                                logAndUpdateConsole(`Stop loss reached for CA: ${address}`);
                                await sellPercent(address, symbol, output, stopLossSellPercent);
                            } else {
                                logAndUpdateConsole(`${roiThreshold}% ROI not reached (${ROI}) for ${symbol}`);
                            }
                        } else {
                            logAndUpdateConsole(`${address} Already sold, remove it from list so it is eligible again`);
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

    return (
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
                <label>Initial buy amount (ETH):</label>
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
            <div>
                <label>Stop Loss (%):</label>
                <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
            </div>
            <div>
                <label>Stop Loss Sell Percentage (%):</label>
                <input type="number" value={stopLossSellPercent} onChange={(e) => setStopLossSellPercent(e.target.value)} />
            </div>
            {intervalId ? (
                <button onClick={stopAutoSell}>Stop Auto-Sell</button>
            ) : (
                <button onClick={startAutoSell}>Start Auto-Sell</button>
            )}
        </div>
    );
};

export default AutoSell;
