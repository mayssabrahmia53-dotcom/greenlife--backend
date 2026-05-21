// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const equipementRoutes = require("./routes/equipementRoutes");
const objectiveRoutes = require("./routes/objectiveRoutes");
const consumptionRoutes = require("./routes/consumptionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const statsRoutes = require("./routes/statsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const recommandationRoutes = require("./routes/recommandationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const postRoutes = require("./routes/postRoutes");
const leaderboardRoutes = require("./routes/leaderboard");
const challengesRoutes = require("./routes/challenges");

// load environment variables
dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipements", equipementRoutes);
app.use("/api/objectives", objectiveRoutes);
app.use("/api/consumptions", consumptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/recommandations", recommandationRoutes);

app.use("/api/posts", postRoutes);
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use('/api/challenges', require('./routes/challenges'));

// static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// Créer un serveur HTTP à partir de l'app Express
const server = http.createServer(app);

// Initialiser Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adresse de ton frontend React
    methods: ["GET", "POST"]
  }
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('client connecté');

  socket.on('sendMessage', async (data) => {
    try {
      const { userId, userName, message, isAdmin } = data;
      const Message = require('./models/Message');
      const newMessage = new Message({ userId, userName, message, isAdmin });
      await newMessage.save();
      // Diffuser à tous les clients connectés (admin + utilisateur)
      io.emit('newMessage', newMessage);
    } catch (err) {
      console.error('Erreur sendMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(' Client déconnecté');
  });
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});