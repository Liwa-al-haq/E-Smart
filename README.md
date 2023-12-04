
# E-Smart Store

## Introduction
E-Smart Store is an advanced e-commerce platform, designed to offer a seamless online shopping experience. Built using React, MongoDB, Node.js, and Express, this website allows users to browse products, manage their shopping cart, and make purchases. It's an all-encompassing solution for both customers and administrators, featuring a wide range of functionalities.

## Features

### For Customers:
- **Product Browsing**: Explore a diverse range of products.
- **Shopping Cart Management**: Seamlessly add and manage items in the shopping cart.
- **User Profiles**: Register and update personal user profiles.
- **Product Reviews**: Share and read opinions on products.
- **Advanced Search & Sorting**: Find and sort products by categories.
- **PayPal Payments**: Securely make payments using PayPal.

### For Admin:
- **Admin Dashboard**: Manage the store efficiently with a comprehensive dashboard.
- **User Management**: Handle customer profiles and access their details.
- **Product Management**: Easily add and delete products from the store's inventory.
- **Stock and Profit Analysis**: Access stock graphs for net profit analysis.
- **Automated Email Invoices**: Send automated invoice receipts via email after purchases.

## Technologies Used
- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Payment System**: PayPal Integration
- **Others**: Automated Emailing, Data Visualization Tools

## Installation

Follow these steps to set up E-Smart Store on your local machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/E-Smart-Store.git
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up your environment variables:
   - Create `.env` files in both `frontend` and `backend` directories.
   - Add necessary configurations (e.g., database URI, secret keys, PayPal API credentials).

4. Run the application:
   ```bash
   # In the backend directory
   npm start

   # In a new terminal, in the frontend directory
   npm start
   ```

## Usage

After installation, open your web browser and navigate to `http://localhost:3000` to start using the E-Smart Store application.

