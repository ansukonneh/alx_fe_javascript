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

  let quotes = loadQuotesFromLocalStorage();

  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Filter by Category: ";
  const categoryFilter = document.createElement("select");
  categoryFilter.id = "categoryFilter";
  categoryFilter.style.marginRight = "10px";
  categoryFilter.addEventListener("change", filterQuotes);

  document.body.insertBefore(categoryLabel, quoteDisplay);
  document.body.insertBefore(categoryFilter, quoteDisplay);

  createAddQuoteForm();
  populateCategories();

  newQuoteBtn.addEventListener("click", showFilteredQuote);

  const lastFilter = localStorage.getItem(FILTER_KEY) || "all";
  if (Array.from(categoryFilter.options).some(opt => opt.value === lastFilter)) {
    categoryFilter.value = lastFilter;
  }

  showFilteredQuote();

  setInterval(syncWithServer, 30000); // sync every 30 seconds

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
    const selected = categoryFilter.value;
    const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
    if (!filtered.length) {
      quoteDisplay.textContent = "No quotes available for this category.";
      return;
    }
    const idx = Math.floor(Math.random() * filtered.length);
    const chosen = filtered[idx];
    quoteDisplay.textContent = `"${chosen.text}" — ${chosen.category}`;
    try { sessionStorage.setItem("dqg.lastQuote", JSON.stringify(chosen)); } catch {}
  }

  function createAddQuoteForm() {
    const formContainer = document.createElement("div");
    formContainer.style.marginTop = "16px";

    const title = document.createElement("h3");
    title.textContent = "Add a New Quote";

    const inputQuote = document.createElement("input");
    inputQuote.type = "text";
    inputQuote.placeholder = "Enter a new quote";
    inputQuote.style.marginRight = "8px";

    const inputCategory = document.createElement("input");
    inputCategory.type = "text";
    inputCategory.placeholder = "Enter quote category";
    inputCategory.style.marginRight = "8px";

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Quote";

    addBtn.addEventListener("click", () => {
      const text = inputQuote.value.trim();
      const category = inputCategory.value.trim();
      if (!text || !category) {
        alert("Please fill in both fields.");
        return;
      }
      quotes.push({ text, category });
      saveQuotesToLocalStorage();
      populateCategories();
      categoryFilter.value = category;
      showFilteredQuote();
      inputQuote.value = "";
      inputCategory.value = "";
      alert("Quote added successfully!");
    });

    formContainer.appendChild(title);
    formContainer.appendChild(inputQuote);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addBtn);
    newQuoteBtn.parentNode.insertBefore(formContainer, newQuoteBtn.nextSibling);
  }

  function syncWithServer() {
    // Simulate fetching server quotes
    fakeServerFetch().then(serverQuotes => {
      let conflictsResolved = 0;
      serverQuotes.forEach(sq => {
        const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
        if (!exists) {
          quotes.push(sq);
          conflictsResolved++;
        }
      });
      if (conflictsResolved) {
        saveQuotesToLocalStorage();
        populateCategories();
        alert(`${conflictsResolved} new quote(s) synced from server.`);
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
