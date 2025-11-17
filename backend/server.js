const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://mongodb:27017/cybersec-hub";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Article schema directly here
const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Article = mongoose.model("Article", articleSchema);

// Routes - defined directly in server.js
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Cybersecurity API is running",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/articles - Get all articles
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching articles",
    });
  }
});

// POST /api/articles - Create a new article
app.post("/api/articles", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const newArticle = new Article({
      title,
      content,
    });

    const savedArticle = await newArticle.save();

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: savedArticle,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating article",
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Cybersecurity Web Hub API",
    endpoints: {
      health: "/api/health",
      articles: "/api/articles",
    },
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});
