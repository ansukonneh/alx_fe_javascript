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
  restoreLastFilter();
  showFilteredQuote();

  // Event listeners
  newQuoteBtn.addEventListener("click", showFilteredQuote);
  categoryFilter.addEventListener("change", filterQuotes);

  // Periodic sync with server simulation
  setInterval(syncWithServer, 30000); // every 30 seconds

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

  function addQuote(text, category) {
    if (!text || !category) return;
    quotes.push({ text, category });
    saveQuotesToLocalStorage();
    populateCategories();
    categoryFilter.value = category;
    showFilteredQuote();
  }

  // --- Server Sync Simulation ---
  function syncWithServer() {
    fakeServerFetch().then(serverQuotes => {
      let updated = 0;
      serverQuotes.forEach(sq => {
        const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
        if (!exists) {
          quotes.push(sq); // server wins in conflict
          updated++;
        }
      });

      if (updated) {
        saveQuotesToLocalStorage();
        populateCategories();
        alert(`${updated} new quote(s) synced from server.`);
      }
    });
  }

  function fakeServerFetch() {
    return new Promise(resolve => {
      setTimeout(() => {
        const serverQuotes = [
          { text: "Server says: Stay positive!", category: "Motivation" },
          { text: "Server wisdom: Keep learning.", category: "Learning" }
        ];
        resolve(serverQuotes);
      }, 1000);
    });
  }
});
