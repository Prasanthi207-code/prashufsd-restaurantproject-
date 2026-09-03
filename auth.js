const API_URL = "http://localhost:5000";

function saveCurrentUser(user) {
    const normalizedUser = {
        ...user,
        "USER ID": user.user_id,
        "FULL NAME": user.full_name,
        "EMAIL ADDRESS": user.email,
        "PHONE NUMBER": user.phone,
        "DELIVERY ADDRESS": user.delivery_address
    };
    localStorage.setItem("currentUser", JSON.stringify(normalizedUser));
    return normalizedUser;
}

// ================= SIGNUP =================

async function handleSignup(name, email, phone, address, password) {

    try {

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: name,
                email: email,
                phone: phone,
                delivery_address: address,
                password: password
            })
        });

        const result = await response.json();

        console.log("REGISTER RESPONSE:", result);

        if (result.success) {
            saveCurrentUser({
                user_id: result.user_id,
                full_name: name,
                email: email,
                phone: phone,
                delivery_address: address
            });
        }

        return result;

    } catch (error) {

        console.error("SIGNUP ERROR:", error);

        return {
            success: false,
            message: "Cannot connect to backend server"
        };
    }
}


// ================= LOGIN =================

async function handleLogin(email, password) {

    try {

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();

        console.log("LOGIN RESPONSE:", result);

        if (result.success) {

            // Save logged-in user
            saveCurrentUser(result.user);

            console.log("USER SAVED:", result.user);
        }

        return result;

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return {
            success: false,
            message: "Cannot connect to backend server"
        };
    }
}


// ================= GET CURRENT USER =================

function getCurrentUser() {

    const user = localStorage.getItem("currentUser");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid user data:", error);
        return null;
    }
}


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";
}