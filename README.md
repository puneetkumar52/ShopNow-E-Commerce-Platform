# 🛍️ ShopNow — E-Commerce Platform

> **Shop Smarter, Live Better.**  
> A full-stack e-commerce platform built with the MERN stack, offering a seamless shopping experience across all product categories.

🔗 **Live Demo:** [https://shopnau.netlify.app/](https://shopnau.netlify.app/)  
📦 **GitHub:** [https://github.com/puneetkumar52/ShopNow-E-Commerce-Platform](https://github.com/puneetkumar52/ShopNow-E-Commerce-Platform)

---
## ✨ Features

### 🛒 Storefront
- Browse & search products across all categories (Electronics, Fashion, Books, Toys, Grocery & more)
- Filter by price range, rating, and sort by newest / top rated
- Product detail pages with ratings and discount badges
- Wishlist support
- Fully responsive UI for mobile and desktop

### 👤 User Dashboard
- View complete order history
- Track current order & delivery status
- Monitor payment status for every purchase
- Manage profile details

### 🛡️ Admin Dashboard
- Overview stats — Total Revenue, Orders, Products, and Users with month-on-month growth
- Revenue Overview chart (Last 6 months)
- Orders by Status breakdown (Shipped, Cancelled, etc.)
- Top Selling Products tracker
- Manage all orders — update delivery and payment status
- Add, edit, or delete products
- Monitor stock availability for every product in real time
- Track sales trends — identify which products are growing or declining in orders

### 🔐 Authentication & Security
- Secure user registration and login
- Password hashing with **Bcrypt**
- Session management with **JWT (JSON Web Tokens)**
- Role-based access — separate views for Users and Admins

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB (Compass for local, Atlas for cloud) |
| Authentication | JWT + Bcrypt |
| Frontend Deployment | Netlify |
| Backend Deployment | Render |

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB Compass (for local development)
- A MongoDB Atlas account (for cloud/production)

### 1. Clone the repository
```bash
git clone https://github.com/puneetkumar52/ShopNow-E-Commerce-Platform.git
cd ShopNow-E-Commerce-Platform
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000`

---

## 📁 Project Structure

```
ShopNow-E-Commerce-Platform/
├── frontend/          # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
├── backend/           # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
└── README.md
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Netlify | [https://shopnau.netlify.app/](https://shopnau.netlify.app/) |
| Backend | Render | Your Render URL |
| Database | MongoDB Atlas | Cloud hosted |

---

## 🙋‍♂️ Author

**Puneet Kumar**  
🔗 [GitHub](https://github.com/puneetkumar52)  
💼 [LinkedIn](https://www.linkedin.com/in/puneetkumar52)  

---

## ⭐ Show Your Support

If you found this project helpful or interesting, please consider giving it a **star** on GitHub — it means a lot! 🌟

---

> *Built with ❤️ using the MERN Stack*
