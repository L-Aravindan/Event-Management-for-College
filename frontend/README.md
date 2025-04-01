# Sathyabama OD Portal

A comprehensive On-Duty management system built with the MERN stack, designed specifically for managing academic event participation and attendance at Sathyabama University.

![Project Banner](./src/assets/logo-sm.svg)

## 🌟 Features

### 💼 Multi-User Dashboard System
- **Student Dashboard**: Manage OD requests and view event participation
- **Faculty Dashboard**: Handle student OD approvals and mentorship
- **Admin Dashboard**: Complete system oversight and analytics

### 📅 Event Management
- Create and manage university events
- Event registration system
- Image upload with Cloudinary integration 
- Real-time event status tracking

### 📝 OD Request System
- Streamlined OD application process
- Real-time status tracking
- Multi-level approval workflow
- Automated email notifications

### ✓ Attendance Management
- QR code-based attendance system
- Real-time attendance tracking
- Comprehensive attendance reports
- Status verification system

### 👥 User Management
- Detailed profile management
- Role-based access control
- Secure JWT authentication
- Password recovery system

### 📊 Analytics Dashboard
- Event participation metrics
- Attendance statistics
- User engagement analytics
- Custom reporting tools

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI components
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **Axios** - API requests
- **React Router DOM** - Navigation
- **Material UI** - UI components
- **Day.js** - Date handling
- **File Saver** - File downloads

### Backend
- **Node.js** - Runtime
- **Express.js** - Server framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File uploading
- **QRCode** - QR generation
- **bcryptjs** - Password hashing

## ⚡ Quick Start

### Prerequisites
1. Node.js (v14 or higher)
2. MongoDB Atlas Account
3. Cloudinary Account
4. Git
5. npm or yarn

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/od-system.git
cd od-system
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
touch .env
```

Add the following to your `.env` file:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
npm start
```

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
od-system/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── eventController.js   # Event management
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Event.js            # Event schema
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── events.js           # Event routes
│   │   └── ...
│   └── server.js               # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── styles/            # CSS styles
│   ├── public/               # Static files
│   └── index.html           # Entry HTML
└── README.md
```

## 🔒 Security Features

- JWT based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation
- Error handling
- Rate limiting
- Secure file uploads

## 🚀 Deployment

1. **Backend Deployment**
```bash
cd backend
npm run build
```

2. **Frontend Deployment**
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Developer Name - aravindanshin@email.com
- Project Link: [GitHub](https://github.com/L-Aravindan/Event-Management-for-College)

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)
- [Vite](https://vitejs.dev/)



