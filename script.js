/* ===================== */
/* DATA INITIALIZATION */
/* ===================== */

// Default data with your specific image
const defaultProducts = [
    { id: 1, name: "Premium Analog Watch", price: 120, oldPrice: 200, category: "Accessories", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80" },
    { id: 2, name: "Urban Travel Backpack", price: 85, oldPrice: 120, category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Wireless Noise Cancelling mamta banarjee", price: 199, oldPrice: 250, category: "Electronics", image: "/04351f11-27c3-46d1-a324-8ac803ca6b0f.png" },
    { id: 4, name: "Speed Running Sneakers", price: 110, oldPrice: 160, category: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
    { id: 5, name: "Smart Home Speaker", price: 60, oldPrice: 99, category: "Electronics", image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=600&q=80" },
    { id: 6, name: "Aviator Sunglasses", price: 45, oldPrice: 80, category: "Accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80" },
];

// Load from Local Storage OR use Default
let products = JSON.parse(localStorage.getItem('preeshaProducts')) || defaultProducts;

/* ===================== */
/* STATE MANAGEMENT */
/* ===================== */
const state = {
    search: "",
    filters: [],
    sort: "default",
    isAdmin: false
};

const grid = document.getElementById("grid");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const checkboxes = document.querySelectorAll(".cat-checkbox");

/* ===================== */
/* CORE RENDER FUNCTION */
/* ===================== */
function renderShop() {
    grid.innerHTML = "";
    
    // Filter
    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(state.search.toLowerCase());
        const matchesCategory = state.filters.length === 0 || state.filters.includes(p.category);
        return matchesSearch && matchesCategory;
    });

    // Sort
    if (state.sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (state.sort === "high") filtered.sort((a, b) => b.price - a.price);

    // Update Count
    productCount.textContent = `(${filtered.length})`;

    // No Results
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-light)">
            <i class="fa-solid fa-box-open" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
            <p>No products found</p></div>`;
        return;
    }

    // Render Cards
    filtered.forEach((p, index) => {
        const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        
        // Admin Buttons Logic
        let actionButtons = '';
        if (state.isAdmin) {
            actionButtons = `
                <div class="admin-controls">
                    <button class="action-btn btn-edit" onclick="openEditModal(${p.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `;
        }

        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${index * 0.05}s`;

        // Wishlist Button (Only for non-admins)
        const wishlistHtml = !state.isAdmin ? `
            <button class="wishlist-btn" onclick="toggleWishlist(this)">
                <i class="fa-regular fa-heart"></i>
            </button>` : '';

        card.innerHTML = `
            <div class="img-wrapper">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <span class="tag-overlay">${p.category}</span>
                ${wishlistHtml}
            </div>
            
            <div class="card-info">
                <div class="brand-name">PREESHA®</div>
                <h3 class="prod-title">${p.name}</h3>
                <div class="price-row">
                    <span class="price">$${p.price}</span>
                    <span class="mrp">$${p.oldPrice}</span>
                    <span class="offer">${discount}% OFF</span>
                </div>
                ${actionButtons}
            </div>
        `;
        grid.appendChild(card);
    });
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function saveToLocalStorage() {
    localStorage.setItem('preeshaProducts', JSON.stringify(products));
}

function toggleWishlist(btn) {
    const icon = btn.querySelector("i");
    if (icon.classList.contains("fa-regular")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        icon.style.color = "#ef4444";
    } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        icon.style.color = "";
    }
}

/* ===================== */
/* ADMIN LOGIC */
/* ===================== */
function handleAdminClick() {
    if (state.isAdmin) {
        alert("You are already logged in as Admin.");
    } else {
        document.getElementById("loginOverlay").classList.add("show");
    }
}

function checkPassword() {
    const passInput = document.getElementById("adminPass");
    const errorMsg = document.getElementById("loginError");
    
    // Password Check
    if (passInput.value === "adminhuyr") {
        state.isAdmin = true;
        closeOverlays();
        updateAdminUI();
        renderShop();
    } else {
        errorMsg.style.display = "block";
        passInput.style.borderColor = "red";
    }
}

function logoutAdmin() {
    state.isAdmin = false;
    updateAdminUI();
    renderShop();
}

function updateAdminUI() {
    const banner = document.getElementById("adminBanner");
    const sidebarAddBtn = document.getElementById("sidebarAddBtn");
    
    if (state.isAdmin) {
        banner.style.display = "block";
        sidebarAddBtn.style.display = "block";
    } else {
        banner.style.display = "none";
        sidebarAddBtn.style.display = "none";
    }
}

/* ===================== */
/* CRUD OPERATIONS */
/* ===================== */

// 1. ADD
function openAddModal() {
    document.getElementById("addOverlay").classList.add("show");
}

function addProduct(e) {
    e.preventDefault();
    const name = document.getElementById("addName").value;
    const price = Number(document.getElementById("addPrice").value);
    const category = document.getElementById("addCat").value;
    const imgInput = document.getElementById("addImg").value;

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        oldPrice: Math.round(price * 1.3),
        category: category,
        image: imgInput || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600"
    };

    products.unshift(newProduct);
    saveToLocalStorage();
    closeOverlays();
    e.target.reset();
    renderShop();
}

// 2. DELETE
function deleteProduct(id) {
    if(confirm("Delete this product permanently?")) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        renderShop();
    }
}

// 3. EDIT
function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("editId").value = product.id;
    document.getElementById("editName").value = product.name;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editCat").value = product.category;

    document.getElementById("editOverlay").classList.add("show");
}

function saveEditProduct(e) {
    e.preventDefault();
    const id = Number(document.getElementById("editId").value);
    const newName = document.getElementById("editName").value;
    const newPrice = Number(document.getElementById("editPrice").value);
    const newCat = document.getElementById("editCat").value;

    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index].name = newName;
        products[index].price = newPrice;
        products[index].oldPrice = Math.round(newPrice * 1.3);
        products[index].category = newCat;
        
        saveToLocalStorage();
        renderShop();
        closeOverlays();
    }
}

/* ===================== */
/* EVENT LISTENERS */
/* ===================== */
function closeOverlays() {
    document.querySelectorAll(".overlay").forEach(o => o.classList.remove("show"));
    document.getElementById("loginError").style.display = "none";
    document.getElementById("adminPass").value = "";
}

searchInput.addEventListener("input", (e) => { state.search = e.target.value; renderShop(); });
sortSelect.addEventListener("change", (e) => { state.sort = e.target.value; renderShop(); });
checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        state.filters = Array.from(checkboxes).filter(i => i.checked).map(i => i.value);
        renderShop();
    });
});

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

// Init
renderShop();