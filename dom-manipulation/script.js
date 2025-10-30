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

  let quotes = loadQuotesFromLocalStorage();

  populateCategories();

  // Restore last selected filter
  const lastFilter = localStorage.getItem(FILTER_KEY) || "all";
  if (Array.from(categoryFilter.options).some(opt => opt.value === lastFilter)) {
    categoryFilter.value = lastFilter;
  }

  showFilteredQuote();

  // Event listeners
  newQuoteBtn.addEventListener("click", showFilteredQuote);
  categoryFilter.addEventListener("change", filterQuotes);

  function loadQuotesFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultQuotes.slice();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Invalid array");
      return parsed;
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

  function addQuote(text, category) {
    if (!text || !category) return;
    quotes.push({ text, category });
    saveQuotesToLocalStorage();
    populateCategories();
    categoryFilter.value = category;
    showFilteredQuote();
  }
});
