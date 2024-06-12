// src/components/FetchData.js

import React from 'react';
import { fetchDataApi } from '../services/api';

const FetchData = ({ wallet, setWallet, input, setInput, setData, setModalMessage, setModalIsOpen, fetchIntervalId, setFetchIntervalId, logAndUpdateConsole }) => {
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

    const toggleFetching = () => {
        logAndUpdateConsole('Toggling fetch process');
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

    return (
        <div className="formModule">
            <h2>Fetch Portfolio</h2>
            <div>
                <label>Wallet Address:</label>
                <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
            </div>
            <div>
                <label>Initial buy amount (ETH):</label>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
            </div>
            <button onClick={fetchData}>Fetch</button>
            <button onClick={toggleFetching}>{fetchIntervalId ? 'Stop Auto-Fetching' : 'Start Auto-Fetching'}</button>
        </div>
    );
};

export default FetchData;