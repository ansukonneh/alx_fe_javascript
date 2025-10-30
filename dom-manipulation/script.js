document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "dynamicQuoteGenerator.quotes";
  const FILTER_KEY = "dynamicQuoteGenerator.lastFilter";

  const defaultQuotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
    { text: "In the middle of difficulty lies opportunity.", category: "Motivation" },
    { text: "A person who never made a mistake never tried anything new.", category: "Learning" }
  ];

  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const categoryFilter = document.getElementById("categoryFilter");
  const addQuoteButton = document.getElementById("addQuoteButton");
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");
  const exportBtn = document.getElementById("exportBtn");
  const importFile = document.getElementById("importFile");

  let quotes = loadQuotesFromLocalStorage();

  populateCategories();
  restoreLastFilter();
  showFilteredQuote();

  // Event listeners
  newQuoteBtn.addEventListener("click", showFilteredQuote);
  categoryFilter.addEventListener("change", filterQuotes);
  addQuoteButton.addEventListener("click", addQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFile.addEventListener("change", importFromJsonFile);

  // Periodic server sync every 30 seconds
  setInterval(syncQuotes, 30000);

  // -------------------- Core Functions --------------------
  function loadQuotesFromLocalStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultQuotes.slice();
      return JSON.parse(data);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return defaultQuotes.slice();
    }
  }

  function saveQuotesToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }

  function populateCategories() {
    const categories = Array.from(new Set(quotes.map(q => q.category))).sort();
    categoryFilter.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Categories";
    categoryFilter.appendChild(allOption);
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  function restoreLastFilter() {
    const lastFilter = localStorage.getItem(FILTER_KEY) || "all";
    if (Array.from(categoryFilter.options).some(opt => opt.value === lastFilter)) {
      categoryFilter.value = lastFilter;
    }
  }

  function filterQuotes() {
    localStorage.setItem(FILTER_KEY, categoryFilter.value);
    showFilteredQuote();
  }

  function showFilteredQuote() {
    const selectedCategory = categoryFilter.value;
    const filtered = selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

    if (!filtered.length) {
      quoteDisplay.textContent = "No quotes available for this category.";
      return;
    }

    const idx = Math.floor(Math.random() * filtered.length);
    const chosen = filtered[idx];
    quoteDisplay.textContent = `"${chosen.text}" — ${chosen.category}`;
    try { sessionStorage.setItem("dqg.lastQuote", JSON.stringify(chosen)); } catch {}
  }

  function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (!text || !category) {
      alert("Please fill in both fields.");
      return;
    }
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotesToLocalStorage();
    populateCategories();
    categoryFilter.value = category;
    showFilteredQuote();
    newQuoteText.value = "";
    newQuoteCategory.value = "";

    // Post to server
    postQuoteToServer(newQuote);

    alert("Quote added successfully!");
  }

  function exportQuotesToJson() {
    try {
      const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `quotes-export-${timestamp}.json`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  }

  function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) throw new Error("Imported JSON must be an array of quotes.");
        let added = 0;
        for (const q of parsed) {
          if (typeof q.text !== "string" || typeof q.category !== "string") throw new Error("Invalid quote format");
          const exists = quotes.some(existing => existing.text === q.text && existing.category === q.category);
          if (!exists) {
            quotes.push({ text: q.text, category: q.category });
            added++;
          }
        }
        if (added > 0) {
          saveQuotesToLocalStorage();
          populateCategories();
          alert(`Imported ${added} new quote(s) successfully.`);
        } else {
          alert("No new quotes to import (duplicates ignored).");
        }
      } catch (err) {
        alert("Failed to import JSON: " + err.message);
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  // -------------------- Server Sync Functions --------------------
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts");
      const data = await response.json();
      return data.slice(0, 5).map(item => ({
        text: item.title,
        category: "Server"
      }));
    } catch (err) {
      console.error("Failed to fetch from server:", err);
      return [];
    }
  }

  async function postQuoteToServer(quote) {
    try {
      await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quote)
      });
    } catch (err) {
      console.error("Failed to post quote to server:", err);
    }
  }

  async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    let updates = 0;

    serverQuotes.forEach(sq => {
      const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
      if (!exists) {
        quotes.push(sq);
        updates++;
      }
    });

    if (updates > 0) {
      saveQuotesToLocalStorage();
      populateCategories();
      alert(`${updates} new quote(s) synced from server.`);
    }
  }
});
