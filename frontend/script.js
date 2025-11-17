// API configuration
const API_BASE_URL = "http://localhost:5001/api";

// DOM elements
const articlesList = document.getElementById("articlesList");
const loadingElement = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const articleForm = document.getElementById("articleForm");
const addArticleForm = document.getElementById("addArticleForm");

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  loadArticles();
  setupEventListeners();
});

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
  // Form submission for new articles
  if (articleForm) {
    articleForm.addEventListener("submit", handleArticleSubmit);
  }
}

/**
 * Load all articles from the backend API
 */
async function loadArticles() {
  console.log("🔍 Loading articles...");

  try {
    const response = await fetch(`${API_BASE_URL}/articles`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✅ Articles loaded:", result.data.length);
      displayArticles(result.data);
    } else {
      throw new Error(result.message || "Failed to load articles");
    }
  } catch (error) {
    console.error("Error loading articles:", error);
    // Langsung show empty state jika error
    showEmptyState();
  }
}

/**
 * Display articles in the grid
 * @param {Array} articles - Array of article objects
 */
function displayArticles(articles) {
  hideAllStates();

  if (!articles || articles.length === 0) {
    showEmptyState();
    return;
  }

  // Clear existing articles
  articlesList.innerHTML = "";

  // Create and append article cards
  articles.forEach((article) => {
    const articleCard = createArticleCard(article);
    articlesList.appendChild(articleCard);
  });

  articlesList.style.display = "grid";
}

/**
 * Create an article card element with Read More functionality
 * @param {Object} article - Article object
 * @returns {HTMLElement} Article card element
 */
function createArticleCard(article) {
  const articleCard = document.createElement("div");
  articleCard.className = "article-card";

  const articleDate = new Date(article.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Different icons based on content
  const getArticleIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("password") || lowerTitle.includes("auth"))
      return "🔐";
    if (lowerTitle.includes("network") || lowerTitle.includes("firewall"))
      return "🌐";
    if (lowerTitle.includes("malware") || lowerTitle.includes("virus"))
      return "🦠";
    if (lowerTitle.includes("privacy") || lowerTitle.includes("data"))
      return "📊";
    if (lowerTitle.includes("cloud") || lowerTitle.includes("aws")) return "☁️";
    if (lowerTitle.includes("social") || lowerTitle.includes("media"))
      return "📱";
    if (lowerTitle.includes("email") || lowerTitle.includes("phishing"))
      return "📧";
    return "🛡️";
  };

  // Check if content is long enough to need "Read More"
  const needsReadMore = article.content.length > 200;
  const shortContent = needsReadMore
    ? article.content.substring(0, 200) + "..."
    : article.content;

  articleCard.innerHTML = `
    <div class="article-icon">${getArticleIcon(article.title)}</div>
    <h3 class="article-title">${escapeHtml(article.title)}</h3>
    <div class="article-content ${needsReadMore ? "collapsed" : ""}">
      ${escapeHtml(needsReadMore ? shortContent : article.content)}
    </div>
    <div class="article-actions">
      <div class="article-date">
        <span>🕒</span>
        ${articleDate}
      </div>
      ${
        needsReadMore
          ? `
        <button class="read-more-btn" onclick="toggleReadMore(this)">
          <span>Read More</span>
          <span>↓</span>
        </button>
      `
          : ""
      }
    </div>
  `;

  // Store the full content in data attribute for Read More functionality
  if (needsReadMore) {
    const readMoreBtn = articleCard.querySelector(".read-more-btn");
    readMoreBtn.setAttribute("data-full-content", escapeHtml(article.content));
  }

  return articleCard;
}

/**
 * Toggle Read More/Less functionality
 * @param {HTMLElement} button - The read more button element
 */
function toggleReadMore(button) {
  const articleContent =
    button.parentElement.parentElement.querySelector(".article-content");
  const isCollapsed = articleContent.classList.contains("collapsed");

  if (isCollapsed) {
    // Expand - show full content
    const fullContent = button.getAttribute("data-full-content");
    articleContent.innerHTML = fullContent;
    articleContent.classList.remove("collapsed");
    articleContent.classList.add("expanded");
    button.innerHTML = "<span>Read Less</span> <span>↑</span>";
  } else {
    // Collapse - show shortened content
    const fullContent = button.getAttribute("data-full-content");
    const shortContent = fullContent.substring(0, 200) + "...";
    articleContent.innerHTML = shortContent;
    articleContent.classList.remove("expanded");
    articleContent.classList.add("collapsed");
    button.innerHTML = "<span>Read More</span> <span>↓</span>";
  }
}

/**
 * Handle form submission for new articles
 * @param {Event} event - Form submit event
 */
async function handleArticleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(articleForm);
  const title = formData.get("title").trim();
  const content = formData.get("content").trim();

  // Basic validation
  if (!title || !content) {
    alert("Please fill in both title and content fields.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Reset form and hide it
      articleForm.reset();
      hideAddArticleForm();

      // Reload articles to show the new one
      loadArticles();

      // Show success message
      alert("Article published successfully!");
    } else {
      throw new Error(result.message || "Failed to create article");
    }
  } catch (error) {
    console.error("Error creating article:", error);
    alert("Error publishing article. Please try again.");
  }
}

/**
 * Show the add article form
 */
function showAddArticleForm() {
  addArticleForm.style.display = "block";
  // Scroll to the form for better UX
  addArticleForm.scrollIntoView({ behavior: "smooth" });
}

/**
 * Hide the add article form
 */
function hideAddArticleForm() {
  addArticleForm.style.display = "none";
  articleForm.reset();
}

/**
 * Utility function to escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show empty state
 */
function showEmptyState() {
  hideAllStates();
  emptyState.style.display = "block";
}

/**
 * Show error state
 */
function showErrorState() {
  hideAllStates();
  errorState.style.display = "block";
}

/**
 * Hide all states (empty, error, articles)
 */
function hideAllStates() {
  // Sembunyikan loading element jika masih ada
  if (loadingElement) {
    loadingElement.style.display = "none";
  }
  emptyState.style.display = "none";
  errorState.style.display = "none";
  articlesList.style.display = "none";
}

/**
 * Utility function to format date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}
