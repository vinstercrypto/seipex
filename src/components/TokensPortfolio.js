// src/components/TokensPortfolio.js
import React from 'react';

const TokensPortfolio = ({ wallet, data, calledTokens, handleSellAgain, logAndUpdateConsole }) => {
  return (
    <div className="tokensModule">
      <h2>Tokens Portfolio</h2>
      <div className="walletAddress">
        <p>Wallet: <a href={`https://basescan.org/address/${wallet}`} target="_blank" rel="noopener noreferrer">{wallet}</a></p>
      </div>
      <div>
        <h3>Sold tokens in this session</h3>
        <div className="calledTokensContainer">
          {calledTokens.length > 0 && (
            <>
              <div className="calledTokenHeaders">
                <div className="fieldName">Symbol</div>
                <div className="fieldName">Sell Percentage</div>
                <div className="fieldName">Estimated Sale</div>
                <div className="fieldName"></div>
              </div>
              {calledTokens.map((token, index) => (
                <div key={index} className="calledTokenBox">
                  <div className="calledTokenField">
                    <div className="fieldValue">{token.symbol}</div>
                  </div>
                  <div className="calledTokenField">
                    <div className="fieldValue">{token.sellPercentage}%</div>
                  </div>
                  <div className="calledTokenField">
                    <div className="fieldValue">{token.estimatedSale} ETH</div>
                  </div>
                  <div className="calledTokenField">
                    <button className="sellAgainButton" onClick={() => handleSellAgain(index)}>Sell again</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
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
                <div className="fieldName">Market cap</div>
                <div className="fieldValue">{result.mcap} ETH</div>
              </div>
              <div className="tokenField">
                <div className="fieldName">Current value</div>
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
  );
};

export default TokensPortfolio;