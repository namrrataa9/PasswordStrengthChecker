const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const tipsList = document.getElementById("tipsList");
const toggleBtn = document.getElementById("togglePassword");
const breachCount = document.getElementById("breachCount");

passwordInput.addEventListener("input", async () => {
  const password = passwordInput.value;
  
  // Reset
  if (!password) {
    strengthBar.style.width = "0%";
    strengthBar.style.backgroundColor = "#6c757d";
    strengthText.textContent = "Strength: N/A (0/100)";
    tipsList.innerHTML = "";
    breachCount.textContent = "";
    return;
  }

  const { score, tips } = evaluatePassword(password);
  const strengthLevels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const colors = ["#dc3545", "#fd7e14", "#ffc107", "#0d6efd", "#198754"];
  const emojis = ["😵", "😬", "😐", "😎", "🦾"];
  const widthPercent = (score / 4) * 100;

  strengthBar.style.width = `${widthPercent}%`;
  strengthBar.style.backgroundColor = colors[score];
  strengthText.textContent = `Strength: ${strengthLevels[score]} ${emojis[score]} (${Math.round(widthPercent)}/100)`;

  tipsList.innerHTML = "";
  tips.forEach(tip => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = tip;
    tipsList.appendChild(li);
  });

  await checkPasswordBreach(password);
});

function evaluatePassword(password) {
  let score = 0;
  const tips = [];

  if (password.length >= 8) score++; else tips.push("🔸 Use at least 8 characters.");
  if (/[A-Z]/.test(password)) score++; else tips.push("🔸 Add uppercase letters.");
  if (/[0-9]/.test(password)) score++; else tips.push("🔸 Include numbers.");
  if (/[^A-Za-z0-9]/.test(password)) score++; else tips.push("🔸 Use special characters (!@#$...).");

  return { score, tips };
}

toggleBtn.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  toggleBtn.textContent = type === "text" ? "🙈" : "👁️";
});

// Dark/Light Mode
document.getElementById("themeToggle").addEventListener("click", () => {
  const body = document.getElementById("themeBody");
  const light = body.classList.toggle("light-theme");
  const btn = document.getElementById("themeToggle");

  if (light) {
    btn.textContent = "🌙 Dark Mode";
    btn.classList.remove("btn-light");
    btn.classList.add("btn-dark");
  } else {
    btn.textContent = "☀️ Light Mode";
    btn.classList.remove("btn-dark");
    btn.classList.add("btn-light");
  }
});

// SHA1 + Breach Checker
async function checkPasswordBreach(password) {
  const shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.update(password);
  const hash = shaObj.getHash("HEX").toUpperCase();

  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const data = await response.text();

  const found = data.split("\n").find(line => line.startsWith(suffix));
  const breachCount = found ? parseInt(found.split(":")[1]) : 0;

  const breachDiv = document.getElementById("breachCount");
  if (breachCount > 0) {
    breachDiv.innerText = `⚠️ Oh no! This password has appeared in ${breachCount.toLocaleString()} breaches.`;
    breachDiv.style.color = "#ff4c4c";
  } else {
    breachDiv.innerText = "✅ Good news! This password was NOT found in any known data breach.";
    breachDiv.style.color = "#4caf50";
  }
}

async function checkPasswordBreach(password) {
 const shaObj = new jsSHA("SHA-1", "TEXT");
  shaObj.update(password);
  const hash = shaObj.getHash("HEX").toUpperCase();

  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const breachDiv = document.getElementById("breachCount");
  breachDiv.innerText = "";
  breachDiv.style.color = "";

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const data = await response.text();
    const lines = data.split("\n");

    let found = false;
    for (let line of lines) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) {
        breachDiv.innerText = `⚠️ This password has been found in ${parseInt(count).toLocaleString()} breaches.`;
        breachDiv.style.color = "red";
        found = true;
        break;
      }
    }

    if (!found) {
      breachDiv.innerText = "✅ This password has not been found in known breaches.";
      breachDiv.style.color = "limegreen";
    }
  } catch (error) {
    breachDiv.innerText = "⚠️ Error checking breach status.";
    breachDiv.style.color = "orange";
    console.error(error);
  }
}
document.getElementById("checkBtn").addEventListener("click", () => {
  const password = document.getElementById("password").value.trim();
  if (password) {
    checkPasswordBreach(password);
  } else {
    const breachDiv = document.getElementById("breachCount");
    breachDiv.innerText = "⚠️ Please enter a password first.";
    breachDiv.style.color = "#ffc107";
  }
});
// Typing Sound




