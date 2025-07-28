async function sha1(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}
const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const tipsList = document.getElementById("tipsList");
const toggleBtn = document.getElementById("togglePassword");

passwordInput.addEventListener("input", async () => {
  const password = passwordInput.value;
if (password.trim() === "") {
    strengthBar.style.width = "0%";
    strengthBar.style.backgroundColor = "#6c757d"; // gray
    strengthText.textContent = "Strength: N/A (0/100)";
    tipsList.innerHTML = "";
    return;
  }
  const { score, tips } = evaluatePassword(password);

  const strengthLevels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const colors = ["#dc3545", "#fd7e14", "#ffc107", "#0d6efd", "#198754"];
  const widthPercent = (score / 4) * 100;

  strengthBar.style.width = `${widthPercent}%`;
  strengthBar.style.backgroundColor = colors[score];
  strengthText.textContent = `Strength: ${strengthLevels[score]}`;
  const emojis = ["😵", "😬", "😐", "😎", "🦾"];
  strengthText.textContent = `Strength: ${strengthLevels[score]} ${emojis[score]}`;
  const percentScore = Math.round((score / 4) * 100);
  strengthText.textContent += ` (${percentScore}/100)`;



  tipsList.innerHTML = "";
  tips.forEach(tip => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = tip;
    tipsList.appendChild(li);
  });

  // 🔐 Breached Password Check Starts Here
  if (password.length > 0) {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    try {
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      const breached = text.toUpperCase().includes(suffix);

    const lines = text.split("\n");
    let breachCount = 0;

for (const line of lines) {
  const [hashSuffix, count] = line.trim().split(":");
  if (hashSuffix === suffix) {
    breachCount = parseInt(count.replace(/\D/g, ""), 10);
    break;
  }
}

const breachLi = document.createElement("li");
breachLi.className = "list-group-item fw-bold";
if (breachCount > 0) {
  breachLi.textContent = `⚠️ This password was found in ${breachCount.toLocaleString()} breaches!`;
  breachLi.style.color = "#dc3545";
} else {
  breachLi.textContent = "✅ This password has not been found in known breaches.";
  breachLi.style.color = "#198754";
}
tipsList.appendChild(breachLi);
    } catch (err) {
      const errorLi = document.createElement("li");
      errorLi.className = "list-group-item text-warning";
      errorLi.textContent = "⚠️ Could not check for breaches (offline or blocked).";
      tipsList.appendChild(errorLi);
    }
  }
});

toggleBtn.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  toggleBtn.textContent = type === "text" ? "🙈" : "👁️";
});

function evaluatePassword(password) {
  let score = 0;
  const tips = [];

  if (password.length >= 8) {
    score++;
  } else {
    tips.push("🔸 Use at least 8 characters.");
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    tips.push("🔸 Add uppercase letters.");
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    tips.push("🔸 Include numbers.");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    tips.push("🔸 Use special characters (!@#$...).");
  }

  return { score, tips };
}
const themeToggle = document.getElementById("themeToggle");
const body = document.getElementById("themeBody");

themeToggle.addEventListener("click", () => {
  const isLight = body.classList.toggle("light-theme");

  if (isLight) {
    themeToggle.textContent = "🌙 Dark Mode";
    themeToggle.classList.remove("btn-light");
    themeToggle.classList.add("btn-dark");
  } else {
    themeToggle.textContent = "☀️ Light Mode";
    themeToggle.classList.remove("btn-dark");
    themeToggle.classList.add("btn-light");
  }
});
function updatePlaceholderColor() {
  const input = passwordInput;
  const isLight = body.classList.contains("light-theme");

  // Remove any previous style tag
  const existingStyle = document.getElementById("placeholder-style");
  if (existingStyle) existingStyle.remove();

  const style = document.createElement("style");
  style.id = "placeholder-style";
  style.textContent = `
    #password::placeholder {
      color: ${isLight ? "#212529" : "#ffffff"};
      opacity: 0.7;
    }
  `;
  document.head.appendChild(style);
}

// Run it once on page load
updatePlaceholderColor();

// Also update when the theme is toggled
themeToggle.addEventListener("click", () => {
  // ... existing toggle code ...

  updatePlaceholderColor(); // 🔄 update placeholder color
});


