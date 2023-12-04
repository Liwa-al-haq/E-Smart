import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import { isAuth, isAdmin } from "../utils.js";
import easyinvoice from "easyinvoice";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import "dotenv/config";

const orderRouter = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
orderRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate("user", "name");
    res.send(orders);
  })
);

orderRouter.put(
  "/:id/deliver",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: "Order Delivered" });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });
    const order = await newOrder.save();
    res.status(201).send({ message: "New Order Created", order });
    console.log(newOrder);
  })
);

orderRouter.get(
  "/summary",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);
    const productBrand = await Product.aggregate([
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories, productBrand });
  })
);

orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);
orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'esmartstore7@gmail.com',
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  }
});

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    let updatedOrder;
    try {
      const order = await Order.findById(req.params.id);
      console.log(order);
      if (!order) {
        return res.status(404).send({ message: "Order Not Found" });
      }
      const user = await User.findById(order.user);
        if (!user) {
            return res.status(404).send({ message: "User Not Found" });
        }

        // Extract user's email
        const userEmail = user.email
        console.log(userEmail)
      if (
        typeof order.taxPrice !== "number" ||
        typeof order.itemsPrice !== "number" ||
        typeof order.totalPrice !== "number"
      ) {
        throw new Error("Order prices must be numbers");
      }
      // Simplified payment update for testing
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: "test_payment_id",
        status: "Completed",
        update_time: new Date().toISOString(),
        email_address: "gussie30@ethereal.email",
      };

      updatedOrder = await order.save();
      const vatRate =
        order.taxPrice && order.itemsPrice
          ? (order.taxPrice / order.itemsPrice) * 100
          : 0;
      const subtotal = order.itemsPrice || 0;
      const totalTax = order.taxPrice || 0;
      const total = order.totalPrice || 0;
      // Simplified invoice data for testing
      const invoiceData = {
        currency: "USD",
        invoiceNumber: order._id.toString(),
        invoiceDate: new Date(order.createdAt).toLocaleDateString(),
        products: order.orderItems.map((item) => {
          return {
            quantity: item.quantity.toString(),
            description: item.name,
            "tax-rate": 15,
            price: (item.price * item.quantity).toFixed(2),
          };
        }),
        images: {
          // The logo on top of your invoice
          logo: "https://i.imgur.com/KbxXCNe.png",
          // The invoice background
          background:
            "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
        },
        taxRate: vatRate.toFixed(2), // VAT rate as a string with two decimal places
        subtotal: subtotal.toFixed(2), // Subtotal as a string with two decimal places
        tax: totalTax.toFixed(2), // Tax price as a string with two decimal places
        total: total.toFixed(2),
        bottomNotice: "Thank you for your purchase!",
        sender: {
          company: "E-Smart",
          address: "Pes University, Bangalore",
          zip: "575002",
          city: "Bangalore",
          country: "India",
        },
        client: {
          company: order.shippingAddress.fullName,
          address: order.shippingAddress.address,
          zip: order.shippingAddress.postalCode,
          city: order.shippingAddress.city,
          country: order.shippingAddress.country,
        },
        // Assuming you have these values available here
      };

      const invoiceResult = await easyinvoice.createInvoice(invoiceData);
      const invoiceDir = path.join(__dirname, "..", "invoices");
      const invoiceFilename = `invoice-${order._id}.pdf`;
      const invoicePath = path.join(invoiceDir, invoiceFilename);
      console.log(order.paymentResult.email_address);
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      fs.writeFileSync(invoicePath, invoiceResult.pdf, "base64");

      res.send({
        message: "Order Paid and Invoice Generated",
        order: updatedOrder,
        invoicePath,
      });
      const mailOptions = {
        from: 'esmartstore7@gmail.com', // Use the authenticated Gmail account
        to: userEmail, // receiver address from the payment result
        subject: "Your E-Smart Invoice",
        text: "Please find attached your invoice for the recent purchase.",
        attachments: [
          {
            filename: invoiceFilename,
            path: invoicePath, // stream this file
          },
        ],
      };
      
      // Send email with the invoice PDF
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          console.log("Error details:", {
            code: err.code,
            command: err.command,
            message: err.message,
            stack: err.stack,
          });
          // Only send a response if one hasn't been sent already
          if (!res.headersSent) {
            res.status(500).send({
              message: "Error sending invoice email",
              error: err.message,
              errorDetails: {
                code: err.code,
                command: err.command,
                fullError: err,
              },
            });
          }
        } else {
          console.log("Email sent successfully:", info.response);
          // Send a response indicating success
          if (!res.headersSent) {
            res.send({
              message: "Order Paid, Invoice Generated and Email Sent",
              order: updatedOrder,
              emailInfo: info.response,
            });
          }
        }
      });
    } catch (error) {
      console.error(
        "Error during payment confirmation or invoice generation:",
        error
      );
      if (!res.headersSent) {
        res.status(500).send({
          message: "Error processing payment or generating invoice",
          error: error.message,
          stack: error.stack,
          order: updatedOrder ? updatedOrder.toJSON() : null,
        });
      }
    }
  })
);
export default orderRouter;
