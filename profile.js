document.addEventListener("DOMContentLoaded", async () => {

    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user || !user.user_id) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {

        // Get latest profile data from MySQL
        const response = await fetch(
            `http://localhost:5000/profile/${user.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to load profile");
            return;
        }

        const latestUser = data.user;

        // Update localStorage
        localStorage.setItem(
            "currentUser",
            JSON.stringify(latestUser)
        );

        // Fill profile details
        const name = document.getElementById("profileName");
        const email = document.getElementById("profileEmail");
        const phone = document.getElementById("profilePhone");
        const address = document.getElementById("profileAddress");

        if (name) {
            name.textContent = latestUser.full_name || "";
        }

        if (email) {
            email.textContent = latestUser.email || "";
        }

        if (phone) {
            phone.textContent = latestUser.phone || "";
        }

        if (address) {
            address.textContent =
                latestUser.delivery_address || "";
        }

        console.log("Profile loaded from MySQL:", latestUser);

    } catch (error) {

        console.error("Profile fetch error:", error);

        alert("Unable to connect to server.");
    }
});