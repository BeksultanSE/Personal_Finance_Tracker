document.addEventListener("DOMContentLoaded", async () => {
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const accountForm = document.getElementById("accountForm");
    const deleteAccountBtn = document.getElementById("deleteAccount");
    const logoutBtn = document.getElementById("logout");

    // Fetch user data and populate fields
    const fetchUserData = async () => {
        try {
            const response = await fetch("/api/auth/account", {
                method: "GET",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                throw new Error("Failed to fetch user data");
            }

            const user = await response.json();
            usernameInput.value = user.name || "";
            emailInput.value = user.email || "";
        } catch (error) {
            console.error("Error fetching user data:", error);
            // Show error to user
            const statusMessage = document.getElementById("statusMessage");
            statusMessage.textContent = "Error loading user data. Please try again.";
            statusMessage.className = "alert alert-danger mt-3";
        }
    };

    // Call fetchUserData when page loads
    await fetchUserData();

    // Handle profile update
    accountForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const statusMessage = document.getElementById("statusMessage");
        statusMessage.className = "alert mt-3";

        try {
            const formData = {
                name: usernameInput.value.trim(),
                email: emailInput.value.trim(),
            };

            // Only include password if it's not empty
            if (passwordInput.value.trim()) {
                formData.password = passwordInput.value.trim();
            }

            const response = await fetch("/api/auth/account", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update user data");
            }

            const updatedUser = await response.json();

            // Update form with new values
            usernameInput.value = updatedUser.name || "";
            emailInput.value = updatedUser.email || "";
            passwordInput.value = ""; // Clear password field

            // Show success message
            statusMessage.textContent = "Account updated successfully!";
            statusMessage.className = "alert alert-success mt-3";
        } catch (error) {
            console.error("Error updating user data:", error);
            statusMessage.textContent = "Error updating account. Please try again.";
            statusMessage.className = "alert alert-danger mt-3";
        }
    });

    // Handle account deletion
    deleteAccountBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete your account? This action is irreversible!")) return;

        try {
            const response = await fetch("/api/auth/account", {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to delete account");

            alert("Account deleted successfully!");
            window.location.href = "/";
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Error deleting account. Please try again.");
        }
    });

    // Handle logout
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to log out");
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
        }
    });
});
