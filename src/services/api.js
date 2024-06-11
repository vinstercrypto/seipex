// src/services/api.js
import axios from 'axios';

export const fetchDataApi = async (wallet, input) => {
  const response = await axios.get('https://printer.seipex.fi/roi', {
    params: { wallet, input }
  });
  return response.data.results;
};

export const sellPercentApi = async (pk, ca, sellPercentConfig) => {
  await axios.get('https://printer.seipex.fi/sell', {
    params: { pk, ca, percent: sellPercentConfig }
  });
};