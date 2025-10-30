document.addEventListener("DOMContentLoaded", () => {

  const quotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
    { text: "In the middle of difficulty lies opportunity.", category: "Motivation" },
    { text: "A person who never made a mistake never tried anything new.", category: "Learning" }
  ];
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Choose a category: ";
  const categorySelect = document.createElement("select");
  categorySelect.id = "categorySelect";
  document.body.insertBefore(categoryLabel, quoteDisplay);
  document.body.insertBefore(categorySelect, quoteDisplay);
  createAddQuoteForm();
  loadCategories();
  newQuoteBtn.addEventListener("click", showRandomQuote);
  function loadCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categorySelect.innerHTML = "";

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }
  function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    const filtered = quotes.filter(q => q.category === selectedCategory);

    if (filtered.length === 0) {
      quoteDisplay.textContent = "No quotes available for this category yet.";
      return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    quoteDisplay.textContent = `"${filtered[randomIndex].text}"`;
  }
  function createAddQuoteForm() {
    const formContainer = document.createElement("div");
    formContainer.style.marginTop = "20px";

    const formTitle = document.createElement("h3");
    formTitle.textContent = "Add a New Quote";

    const inputQuote = document.createElement("input");
    inputQuote.type = "text";
    inputQuote.id = "newQuoteText";
    inputQuote.placeholder = "Enter a new quote";

    const inputCategory = document.createElement("input");
    inputCategory.type = "text";
    inputCategory.id = "newQuoteCategory";
    inputCategory.placeholder = "Enter quote category";

    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";

    addButton.addEventListener("click", () => {
      const newText = inputQuote.value.trim();
      const newCategory = inputCategory.value.trim();

      if (!newText || !newCategory) {
        alert("Please fill in both fields!");
        return;
      }

      quotes.push({ text: newText, category: newCategory });
      inputQuote.value = "";
      inputCategory.value = "";

      loadCategories();
      alert("Quote added successfully!");
    });

    // Add all to form container
    formContainer.appendChild(formTitle);
    formContainer.appendChild(inputQuote);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addButton);
    document.body.appendChild(formContainer);
  }
  if (categorySelect.options.length > 0) {
    categorySelect.selectedIndex = 0;
    showRandomQuote();
  }
});
