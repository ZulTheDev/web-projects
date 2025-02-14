const API_URL = "http://localhost:5000";

// Function to check user authentication (Calls backend)
async function checkUser() {
    const response = await fetch(`${API_URL}/auth/user`);
    const data = await response.json();

    if (data.user) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("user-info").style.display = "block";
        document.getElementById("user-email").innerText = data.user.email;

        // ✅ Fetch order history
        fetchOrderHistory(data.user.id);
    } else {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("main-content").style.display = "none";
        document.getElementById("user-info").style.display = "none";
    }
}

//toggle between login and sign up
document.getElementById("show-login").addEventListener("click", function() {
    document.getElementById("signup-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
});

document.getElementById("show-signup").addEventListener("click", function() {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("signup-form").classList.remove("hidden");
});

// Sign Up (Calls backend)
document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.error) {
        alert("Sign-up failed: " + data.error);
    } else {
        alert("Sign-up successful! Please log in.");
    }
});

// Login (Calls backend)
document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.error) {
        alert("Login failed: " + data.error);
    } else {
        alert("Login successful!");
        checkUser(); // Update UI
    }
});

// Logout (Calls backend)
document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST" });
    alert("Logged out!");
    checkUser();
});

// Fetch and display menu
async function fetchMenu() {
    const response = await fetch(`${API_URL}/menu`);
    const menuItems = await response.json();
    displayMenu(menuItems);
}

function displayMenu(menuItems) {
    const menuList = document.getElementById("menu-list");
    menuList.innerHTML = "";
    menuItems.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("menu-item");
        div.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p>Price: $${item.price}</p>
            <button onclick="deleteMenuItem(${item.id})" class="delete-btn">Delete</button>
        `;
        menuList.appendChild(div);
    });
}

// Add new food item
document.getElementById("food-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("food-name").value;
    const description = document.getElementById("food-description").value;
    const price = document.getElementById("food-price").value;

    const response = await fetch(`${API_URL}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price })
    });

    if (response.ok) {
        alert("Food item added!");
        fetchMenu();
    } else {
        alert("Failed to add food item.");
    }
});

// Place an order
document.addEventListener("DOMContentLoaded", async () => {
    const menuDropdown = document.getElementById("menu-items");

    try {
        const response = await fetch(`${API_URL}/menu`);
        const menuItems = await response.json();

        menuItems.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = `${item.name} - $${item.price}`;
            menuDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
});

document.getElementById("order-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedOptions = Array.from(document.getElementById("menu-items").selectedOptions);
    const quantity = document.getElementById("item-quantity").value;

    if (selectedOptions.length === 0 || quantity <= 0) {
        alert("Please select at least one menu item and enter a valid quantity.");
        return;
    }

    const items = selectedOptions.map(option => ({
        menu_item_id: parseInt(option.value),
        quantity: parseInt(quantity)
    }));

    // Retrieve user ID from the authenticated user data
    const responseUser = await fetch(`${API_URL}/auth/user`);
    const userData = await responseUser.json();
    const user_id = userData.user.id;

    const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, items })
    });

    const data = await response.json();
    alert(data.message);
    checkUser();
});


// Function to fetch order history for logged-in user
async function fetchOrderHistory(user_id) {
    const response = await fetch(`${API_URL}/orders/user/${user_id}`);
    const orders = await response.json();
    displayOrderHistory(orders);
}

function displayOrderHistory(orders) {
    const orderList = document.getElementById("order-history");
    orderList.innerHTML = "";

    if (!orders || orders.length === 0) {
        orderList.innerHTML = "<p class='no-orders'>No past orders found.</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("order-card");

        div.innerHTML = `
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <button class="delete-order-btn" onclick="deleteOrder(${order.id})">🗑 Delete</button>
            </div>
            <p><strong>Total:</strong> $${order.total_amount}</p>
            <p><strong>Ordered on:</strong> ${new Date(order.order_date).toLocaleString()}</p>
            <h4>Items:</h4>
            <ul class="order-items">
                ${order.order_items.map(item => `
                    <li>
                        <span>${item.menu_items ? item.menu_items.name : "Unknown Item"} (x${item.quantity})</span>
                        <span class="item-price">$${item.price}</span>
                    </li>
                `).join("")}
            </ul>
        `;

        orderList.appendChild(div);
    });
}

/**
 * ✅ Function to delete an order
 */
async function deleteOrder(orderId) {
    const confirmDelete = confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
        method: "DELETE",
    });

    if (response.ok) {
        alert("Order deleted successfully!");
        checkUser(); // Refresh order history
    } else {
        alert("Failed to delete order.");
    }
}


// Function to delete a menu item
async function deleteMenuItem(itemId) {
    const response = await fetch(`${API_URL}/menu/${itemId}`, {
        method: "DELETE"
    });

    if (response.ok) {
        alert("Menu item deleted!");
        fetchMenu();
    } else {
        alert("Failed to delete menu item.");
    }
}

// Initial UI check
checkUser();
fetchMenu();
