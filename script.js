/* ===================== */
/* STATE MANAGEMENT */
/* ===================== */

let products = [];
let adminToken = null;

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

    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(state.search.toLowerCase());
        const matchesCategory =
            state.filters.length === 0 || state.filters.includes(p.category);
        return matchesSearch && matchesCategory;
    });

    if (state.sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (state.sort === "high") filtered.sort((a, b) => b.price - a.price);

    productCount.textContent = `(${filtered.length})`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-light)">
                <i class="fa-solid fa-box-open" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
                <p>No products found</p>
            </div>`;
        return;
    }

    filtered.forEach((p, index) => {
        const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);

        let actionButtons = "";
        if (state.isAdmin) {
            actionButtons = `
                <div class="admin-controls">
                    <button class="action-btn btn-edit" onclick="openEditModal(${p.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>`;
        }

        const wishlistHtml = !state.isAdmin
            ? `<button class="wishlist-btn" onclick="toggleWishlist(this)">
                    <i class="fa-regular fa-heart"></i>
               </button>`
            : "";

        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${index * 0.05}s`;

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
/* HELPERS */
/* ===================== */

function toggleWishlist(btn) {
    const icon = btn.querySelector("i");
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
    icon.style.color = icon.classList.contains("fa-solid") ? "#ef4444" : "";
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

async function checkPassword() {
    const passInput = document.getElementById("adminPass");
    const errorMsg = document.getElementById("loginError");

    const res = await fetch("/.netlify/functions/adminLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passInput.value })
    });

    if (!res.ok) {
        errorMsg.style.display = "block";
        passInput.style.borderColor = "red";
        return;
    }

    const data = await res.json();
    adminToken = data.token;
    state.isAdmin = true;

    closeOverlays();
    updateAdminUI();
    renderShop();
}

function logoutAdmin() {
    adminToken = null;
    state.isAdmin = false;
    updateAdminUI();
    renderShop();
}

function updateAdminUI() {
    const banner = document.getElementById("adminBanner");
    const sidebarAddBtn = document.getElementById("sidebarAddBtn");

    banner.style.display = state.isAdmin ? "block" : "none";
    sidebarAddBtn.style.display = state.isAdmin ? "block" : "none";
}

/* ===================== */
/* CRUD OPERATIONS */
/* ===================== */

// ADD
function openAddModal() {
    document.getElementById("addOverlay").classList.add("show");
}

async function addProduct(e) {
    e.preventDefault();
    if (!adminToken) return alert("Unauthorized");

    const name = document.getElementById("addName").value;
    const price = Number(document.getElementById("addPrice").value);
    const category = document.getElementById("addCat").value;
    const imgInput = document.getElementById("addImg").value;

    const res = await fetch("/.netlify/functions/addProduct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
            name,
            price,
            category,
            image: imgInput || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600"
        })
    });

    if (!res.ok) return alert("Failed to add product");

    closeOverlays();
    e.target.reset();
    await loadProducts();
}

// DELETE
async function deleteProduct(id) {
    if (!adminToken) return alert("Unauthorized");

    if (confirm("Delete this product permanently?")) {
        const res = await fetch("/.netlify/functions/deleteProduct", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ id })
        });

        if (!res.ok) return alert("Failed to delete product");
        await loadProducts();
    }
}

// EDIT
function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("editId").value = product.id;
    document.getElementById("editName").value = product.name;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editCat").value = product.category;

    document.getElementById("editOverlay").classList.add("show");
}

async function saveEditProduct(e) {
    e.preventDefault();
    if (!adminToken) return alert("Unauthorized");

    const id = Number(document.getElementById("editId").value);
    const name = document.getElementById("editName").value;
    const price = Number(document.getElementById("editPrice").value);
    const category = document.getElementById("editCat").value;

    const res = await fetch("/.netlify/functions/updateProduct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id, name, price, category })
    });

    if (!res.ok) return alert("Failed to update product");

    closeOverlays();
    await loadProducts();
}

/* ===================== */
/* EVENTS */
/* ===================== */

function closeOverlays() {
    document.querySelectorAll(".overlay").forEach(o => o.classList.remove("show"));
    document.getElementById("loginError").style.display = "none";
    document.getElementById("adminPass").value = "";
}

searchInput.addEventListener("input", e => {
    state.search = e.target.value;
    renderShop();
});

sortSelect.addEventListener("change", e => {
    state.sort = e.target.value;
    renderShop();
});

checkboxes.forEach(cb =>
    cb.addEventListener("change", () => {
        state.filters = Array.from(checkboxes)
            .filter(i => i.checked)
            .map(i => i.value);
        renderShop();
    })
);

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

/* ===================== */
/* BACKEND LOAD */
/* ===================== */

async function loadProducts() {
    const res = await fetch("/.netlify/functions/getProducts");
    if (!res.ok) return alert("Failed to load products");

    products = await res.json();
    products = products.map(p => ({
        ...p,
        oldPrice: p.oldPrice ?? p.old_price
    }));

    renderShop();
}

// INIT
loadProducts();
