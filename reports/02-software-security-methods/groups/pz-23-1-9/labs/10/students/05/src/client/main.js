import { h, render, Fragment } from "preact";
import { useState, useEffect, useRef } from 'preact/hooks';
import { LocationProvider, Router, Route, useLocation } from "preact-iso";
import bcrypt from "bcrypt";
import htm from "htm";
const html = htm.bind(h); // Init htm with Preact

render(html`<div id="centered"><${App} /></div>`, document.getElementById("root"));

function App() {
	return html`<${LocationProvider}>
      <${Router}>
        <${Route} path="/" component=${HomeScreen} />
        <${Route} path="/login" component=${LoginScreen} />
        <${Route} default component=${NotFound} />
      <//>
    <//>`;
}

async function loginBasic(formData) { // throws
    await fetch("/api/login", { method: "POST", body: formData });
}

async function loginChallenge(formData) { // throws
    const login = formData.get("login");
    const password = formData.get("password");

    // Get challenge
    let res = await apiSendJson("/challenge", { method: "QUERY", body: {
        login: login,
    }});
    if (!res.ok) throw new Error(`Server error: ${res.status}: ${await res.text()}`);
    const resJson = await res.json();

    // Find hash of password
    const passHash = (await bcrypt.hash(password, resJson.salt));

    // Compute challenge
    const hmac = new TextEncoder().encode(resJson.random + passHash);
    const resp = new Uint8Array(
        await window.crypto.subtle.digest("SHA-256", hmac)
    );

    // Login with solved challenge
    res = await apiSendJson("/challenge", { method: "POST", body: {
        login: login,
        password: resp.toHex(),
    }});
    if (!res.ok) throw new Error(`Server error: ${res.status}: ${await res.text()}`);
    return res.status === 202
}

async function loginOtp(formData) { // throws
    const res = await apiSendJson("/otp", { method: "POST", body: {
        login: formData.get("login"),
        password: formData.get("otp"),
    }});
    if (!res.ok) throw new Error(`Server error: ${res.status}: ${await res.text()}`);
}

async function doSignup(formData) { // throws
    const res = await fetch("/api/users", { method: "POST", body: formData });
    const resJson = await res.json();
    console.log("totp secret:", resJson.totp_secret);
    return resJson.totp_secret
}

function LoginScreen() {
    const [waiting, setWaiting] = useState(false);
    const [signup, setSignup] = useState(false);
    const [otp, setOtp] = useState(false);
    const [logged, setLogged] = useState(false);
    const [otpSecret, setOtpSecret] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();

    async function handleSubmit(e) {
        e.preventDefault(); // Prevent sending data to current url and refreshing

        let err = ""
        setWaiting(true);
        setOtp(false);
        setError(err);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            if (signup) {
                const secret = await doSignup(formData);
                if (secret !== undefined) {
                    setOtpSecret(secret);
                } else {
                    setLogged(true);
                }
            } else if (otp) {
                await loginOtp(formData);
                setLogged(true);
            } else {
                // const logged_in = await loginBasic(formData);
                const need_otp = await loginChallenge(formData);
                if (need_otp) {
                    setOtp(true);
                } else {
                    setLogged(true);
                }
            }
        } catch (e) {
            console.error(e);
            err = e.message;
        }

        setWaiting(false);
        setError(err);
    }

    useEffect(() => {
        if (logged === true) location.route("/", true);
    }, [logged]);

    return html`<${Fragment}>
        ${error !== "" && html`<p>Error: ${error}<br/></p>`}

        <button disabled=${!signup} onClick=${() => setSignup(false)}>Log In</button>
        <button disabled=${signup}  onClick=${() => setSignup(true)}>Sign Up</button>

        <form id="login-form" onSubmit=${handleSubmit}>
            <div>
              <label for="login">User name or email</label>
              <input name="login" minLength=3 required />
            </div>
            ${signup && html`<div>
                <label for="email">Email</label>
                <input name="email" type="email" required />
            </div>`}
            <div>
              <label for="password">Password</label>
              <input name="password" type="password" minLength=5 required />
            </div>
            ${signup && html`<div>
                <label for="role">Role</label>
                <select name="role">
                               <option value="user">User</option>
                               <option value="moderator">Moderator</option>
                               <option value="admin">Admin</option>
                </select>
            </div>`}
            ${otp && html`<div>
                <label for="otp">Otp code:</label>
                <input name="otp" type="number" minLength=6 maxLength=6 required />
            </div>`}
            <button type="submit" ${(waiting || otpSecret !== "") && "disabled"}>
                ${signup
                    ? waiting ? "Signing Up..." : "Sign Up"
                    : waiting ? "Logging In..." : "Log In"}
            </button>
        </form>

        ${otpSecret !== "" && html`
            <p>Otp secret: ${otpSecret}</p>
            <button onClick=${() => setLogged(true)}>Continue</button>
        `}
    <//>`;
}

function NotFound() {
    return html`<p>Address not found</p>`;
}

function HomeScreen() {
    const [dishes, setDishes] = useState([]);
    const [categories, setCategories] = useState([]);

    return html`<${Fragment}>
      <${DishesControl} dishes=${dishes} setDishes=${setDishes} categories=${categories} />
      <${CategoriesControl} categories=${categories} setCategories=${setCategories}/>
    <//>`;
}

function DishesControl({dishes, setDishes, categories}) {
    const location = useLocation();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingDish, setAddingDish] = useState(false);

    useEffect(() => {
        const ws = new WebSocket("/api/dishes/subscribe");

        ws.addEventListener("open", () => {
            console.log("Connected to dishes websocket");
        });
        ws.addEventListener("message", (event) => {
            setDishes(d => {
                try {
                    const ev = JSON.parse(event.data);
                    console.log("Received:", ev);

                    const idx = d.findIndex(dish => dish.dish === ev.target);
                    if (idx === -1) {
                        if (ev.dish !== null) d = [...d, ev.dish];
                    } else if (ev.dish === null) {
                        d = d.filter((_, i) => i !== idx);
                    } else {
                        d = [...d];
                        d[idx] = ev.dish;
                    }
                } catch (e) {
                    console.error("Message reading error:", e);
                }
                return d;
            })
        });
        ws.addEventListener("close", () => {
            console.log("Connection to dishes websocket closed");
        });
        ws.addEventListener("error", () => {
            console.log("Connection to dishes error");
        });

        return () => ws.close();
    }, []);

    const dishField = useRef(null);

    async function loadDishes() {
        setError("");

        try {
            const dishes = await apiRequest(location, "/dishes", {});
            setDishes(Array.isArray(dishes) ? dishes : []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        setLoading(true);
        loadDishes();
        setLoading(false);
    }, []);

    async function handleAddDish(e) {
        e.preventDefault();
        setAddingDish(true);
        setError("");

        const fd = new FormData(e.currentTarget);
        const rqBody = {
            category: fd.get("category"),
            dish: fd.get("dish"),
            price: parseInt(fd.get("price")),
        };
        if (dishes.some(d => d.dish === rqBody.dish)) {
            dishField.current.setCustomValidity("Such dish already exists");
            dishField.current.reportValidity();
        } else try {
            dishField.current.setCustomValidity("");
            dishField.current.reportValidity();
            await apiRequest(location, "/dishes", {method: "POST", body: rqBody});
        } catch (err) {
            setError(err.message);
        }

        setAddingDish(false);
    }

    if (loading) {
        return html`<p>Loading Dishes...</p>`;
    } else {
        return html`<${Fragment}>
          ${(error !== "") && html`<p>Error: ${error}</p>`}

          <h1>Dishes</h1>
          <ul>
            ${dishes.map(dish => html`<li key=${dish.dish}>
              ${dish.dish}: ${dish.category}, ${dish.price}\$
            </li>`)}
          </ul>

          <form onSubmit=${handleAddDish}>
            <div>
              <label for="dish">Dish name:</label>
              <input name="dish" minLength=3 required ref=${dishField} />
            </div>
            <div>
              <label for="category">Dish category:</label>
              <select name="category" required>
                ${categories.map(cat => html`<option value=${cat.category}>
                  ${cat.category} (${cat.nationality})
                </option>`)}
              </select>
            </div>
            <div>
              <label for="price">Dish price:</label>
              <input name="price" type="number" min=0 required />
            </div>

            <button type="submit" ${addingDish && "disabled"}>
              ${addingDish ? "Adding..." : "Add dish"}
            </button>
          </form>

          <${DeleteForm} resource="dishes" setError=${setError}>
            ${dishes.map(dish => html`<option value=${dish.dish}>${dish.dish}</option>`)}
          <//>
        <//>`;
    }
}

function CategoriesControl({categories, setCategories}) {
    const location = useLocation();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingCat, setAddingCat] = useState(false);

    const catField = useRef(null);

    async function loadCategories() {
        setError("");

        try {
            const categories = await apiRequest(location, "/categories", {});
            setCategories(Array.isArray(categories) ? categories : []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        setLoading(true);
        loadCategories();
        setLoading(false);
    }, []);

    useEffect(() => {
        const ws = new WebSocket("/api/categories/subscribe");

        ws.addEventListener("open", () => {
            console.log("Connected to categories websocket");
        });
        ws.addEventListener("message", (event) => {
            setCategories(c => {
                try {
                    const ev = JSON.parse(event.data);
                    console.log("Received:", ev);

                    const idx = c.findIndex(catg => catg.category === ev.target);
                    if (idx === -1) {
                        if (ev.category !== null) c = [...c, ev.category];
                    } else if (ev.category === null) {
                        c = c.filter((_, i) => i !== idx);
                    } else {
                        c = [...c];
                        c[idx] = ev.category;
                    }
                } catch (e) {
                    console.error("Message reading error:", e);
                }
                return c;
            })
        });
        ws.addEventListener("close", () => {
            console.log("Connection to menu categories websocket closed");
        });
        ws.addEventListener("error", () => {
            console.log("Connection to menu categories error");
        });

        return () => ws.close();
    }, []);

    async function handleAddCategory(e) {
        e.preventDefault();
        setAddingCat(true);
        setError("");

        const fd = new FormData(e.currentTarget);
        const rqBody = {
            category: fd.get("category"),
            nationality: fd.get("nationality"),
        };
        if (categories.some(c => c.category === rqBody.category)) {
            catField.current.setCustomValidity("Such category already exists");
            catField.current.reportValidity();
        } else try {
            catField.current.setCustomValidity("");
            catField.current.reportValidity();
            await apiRequest(location, "/categories", {method: "POST", body: rqBody});
        } catch (err) {
            setError(err.message);
        }

        setAddingCat(false);
    }

    if (loading) {
        return html`<p>Loading...</p>`;
    } else {
        return html`<${Fragment}>
          ${(error !== "") && html`<p>Error: ${error}</p>`}

          <h1>Menu categories</h1>
          <ul>
            ${categories.map(cat => html`<li key=${cat.category}>
              ${cat.category}, ${cat.nationality}
            </li>`)}
          </ul>

          <form onSubmit=${handleAddCategory}>
            <div>
              <label for="category">Category name:</label>
              <input name="category" minLength=3 required ref=${catField} />
            </div><div>
              <label for="nationality">Nationality:</label>
              <input name="nationality" minLength=3 required />
            </div>

            <button type="submit" ${addingCat && "disabled"}>
              ${addingCat ? "Adding..." : "Add category"}
            </button>
          </form>

          <${DeleteForm} resource="categories" setError=${setError}>
            ${categories.map(cat => html`<option value=${cat.category}>${cat.category}</option>`)}
          <//>
        <//>`;
    }
}

function DeleteForm({resource, setError, children}) {
    const [processing, setProcessing] = useState(false);
    const location = useLocation();

    async function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        setError("");

        const fd = new FormData(e.currentTarget);
        try {
            await apiRequest(location, `/${resource}/${fd.get("opt")}`, {method: "DELETE"});
        } catch (err) {
            setError(err.message);
        }

        setProcessing(false);
    }

    return html`<form onSubmit=${handleSubmit}>
      <button type="submit" ${processing && "disabled"}>
        ${processing ? "Deleting..." : "Delete"}
      </button>

      <select name="opt" required>${children}</select>
    </form>`;
}

// Can throw a lot of different errors
async function apiRequest(location, path, {method = "GET", body} = {}) {
    const res = await apiSendJson(path, {method: method, body: body});

    // Not in 200 range
    if (!res.ok) {
        // Access denied - go to login screen
        if (res.status === 403) {
            location.route("/login");
            return null;
        } else {
            let err = await res.text();
            throw new Error(`Server returned error: ${res.status}: ${err}`);
        }
    }

    // Status no content
    // if (res.status === 204) return null;

    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function apiSendJson(path, {method = "GET", body} = {}) {
    const headers = body ? { "Content-Type": "application/json" } : {};
    return fetch(`/api${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}
