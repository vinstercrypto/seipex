// src/components/ManualSell.js

import React from 'react';
import { sellPercentApi } from '../services/api';

const ManualSell = ({ pk, setPk, ca, setCa, sellPercentConfig, setSellPercentConfig, logAndUpdateConsole, setModalMessage, setModalIsOpen, data, soldTokens, setSoldTokens }) => {

    const sellPercent = async (ca) => {
        logAndUpdateConsole(`Starting sell for CA: ${ca}`);
        if (!pk || !ca || !sellPercentConfig) {
            setModalMessage('Please fill in Private Key, Contract Address, and Sell Percentage.');
            setModalIsOpen(true);
            logAndUpdateConsole('Sell aborted: Missing required fields');
            return;
        }

        const tokenData = data.find(token => token.address === ca);
        if (!tokenData) {
            setModalMessage('Token data not found.');
            setModalIsOpen(true);
            logAndUpdateConsole('Sell aborted: Token data not found');
            return;
        }

        try {
            await sellPercentApi(pk, ca, sellPercentConfig);
            logAndUpdateConsole(`Sell of ${sellPercentConfig}% called for CA: ${ca}`);
            setSoldTokens(prev => [...prev, { ...tokenData, sellPercentage: sellPercentConfig, estimatedSale: (sellPercentConfig / 100) * tokenData.output }]);
        } catch (error) {
            logAndUpdateConsole(`Error calling sell endpoint for ${ca}: ${error.message}`);
        }
    };

    return (
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
    );
};

export default ManualSell;
