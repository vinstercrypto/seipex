# Seipex Manager, powered by [Seipex](https://www.seipex.fi/)

Seipex Manager is a React-based application designed to manage tokens on Base purchased with an automatic sniper.
This application can be run locally or accessed at [seipex.basedgeloto.com](https://seipex.basedgeloto.com).
It interacts exclusively with the Seipex API and is deployed automatically from this repository.

## Features

- **Fetch / Auto-fetch**: Display information about sniped tokens either once or automatically every X seconds.
- **Auto-sell**: Configure auto-sell based on an ROI threshold (+200%) and sell a percentage of holdings when the threshold is reached.
- **Manual sell**: Manually sell a percentage of holdings.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed [Node.js](https://nodejs.org/) (which includes npm).
- You have a Seipex Sniper wallet for Base.

## Installation

1. **Clone the repository:**
   `git clone https://github.com/IA-Lopez/seipex.git`
   `cd seipex-manager`

2. **Install dependencies:**
   `npm install`

## Running the Application

To run the application locally, follow these steps:

1. **Start the development server:**
   `npm start`

2. **Open your browser and navigate to:**
   `http://localhost:3000`

## Configuration

To configure the fetch/auto-fetch and auto-sell functionalities, follow these instructions within the application:

1. **Fetch/Auto-fetch:**
   - Navigate to the Fetch section.
   - Choose to display token information once or set an interval for automatic fetching.

2. **Auto-sell:**
   - Navigate to the Auto-sell section.
   - Set the ROI threshold (e.g., +200%).
   - Specify the percentage of holdings to sell when the threshold is reached.

3. **Manual sell:**
   - Navigate to the Manual sell section.
   - Specify the percentage of holdings you want to sell manually.

## Deployment

The application is deployed automatically from this repository. Any changes pushed to the main branch will trigger a deployment process.

For any issues or contributions, please refer to the [Issues](https://github.com/IA-Lopez/seipex/issues) section of this repository.

## License

This project is licensed under the MIT License.
