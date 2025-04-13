const API_BASE_URL = 'http://127.0.0.1:8000';


export async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", 
      },
      body: JSON.stringify({ username, password }),
    });
    console.log("Response:", response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.message || "Login failed";
      throw new Error(message);
    }

    const data = await response.json();
    if (!data.token) throw new Error("No token received");
    return data;
  } catch (err) {
    alert("Login error:", err.message);
    throw err;
  }
}


export async function register(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Register error:', err);
    throw err;
  }
}
