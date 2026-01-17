const servants = [
    { name: "Artoria Pendragon", class: "Saber", gender: "Femenino", hair: "Rubio", np: "Anti-Fortress", nation: "Britania", category: "Servant", image: "images/artoria.png" },
    { name: "Gilgamesh", class: "Archer", gender: "Masculino", hair: "Rubio", np: "Anti-World", nation: "Sumeria", category: "Servant", image: "images/gilgamesh.png" },
    { name: "Cu Chulainn", class: "Lancer", gender: "Masculino", hair: "Azul", np: "Anti-Unit", nation: "Irlanda", category: "Servant", image: "images/cu.png" },
    { name: "Emiya", class: "Archer", gender: "Masculino", hair: "Blanco", np: "Anti-Unit", nation: "Japón", category: "Servant", image: "images/emiya.png" },
    { name: "Jeanne d'Arc", class: "Ruler", gender: "Femenino", hair: "Rubio", np: "Anti-Army", nation: "Francia", category: "Servant", image: "images/jeanne.png" },
    { name: "Scathach", class: "Lancer", gender: "Femenino", hair: "Morado", np: "Anti-Unit", nation: "Irlanda", category: "Servant", image: "images/scathach.png" },
    { name: "Ishtar", class: "Archer", gender: "Femenino", hair: "Negro", np: "Anti-Mountain", nation: "Sumeria", category: "Servant", image: "images/ishtar.png" },
    { name: "Merlin", class: "Caster", gender: "Masculino", hair: "Blanco", np: "Anti-Unit", nation: "Britania", category: "Servant", image: "images/merlin.png" },
    { name: "Heracles", class: "Berserker", gender: "Masculino", hair: "Negro", np: "Anti-Unit", nation: "Grecia", category: "Servant", image: "images/heracles.png" },
    { name: "Mordred", class: "Saber", gender: "Femenino", hair: "Rubio", np: "Anti-Army", nation: "Britania", category: "Servant", image: "images/mordred.png" }
];
servants.sort((a, b) => a.name.localeCompare(b.name));

let answer = null;
let attempts = 0;
let gameState = { day: null, answer: null, attempts: [], won: false };
const input = document.getElementById('guess-input');
const autocompleteDiv = document.getElementById('autocomplete');
const guessBtn = document.getElementById('guess-btn');
const gridDiv = document.getElementById('grid');
const winMessage = document.getElementById('win-message');
function showAutocomplete(filter = '') {
    autocompleteDiv.innerHTML = '';
    
    const filterLower = filter.toLowerCase().trim();
    const usedNames = gameState.attempts.map(s => s.name);
    let availableServants = servants.filter(s => !usedNames.includes(s.name));
    
    const matches = filterLower.length === 0 
        ? availableServants 
        : availableServants.filter(s => s.name.toLowerCase().includes(filterLower));
    
    if (matches.length > 0) {
        autocompleteDiv.style.display = 'block';
        
        matches.forEach(servant => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            const img = document.createElement('img');
            img.src = servant.image;
console.log('Intentando cargar:', servant.image); // LÍNEA NUEVA PARA DEBUG
            img.alt = servant.name;
            img.onerror = function() {
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%233d4a6b" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3E?%3C/text%3E%3C/svg%3E';
            };
            const span = document.createElement('span');
            span.textContent = servant.name;
            
            div.appendChild(img);
            div.appendChild(span);
            
            div.onclick = () => {
                input.value = servant.name;
                autocompleteDiv.style.display = 'none';
                input.focus();
            };
            
            autocompleteDiv.appendChild(div);
        });
    } else {
        autocompleteDiv.style.display = 'none';
    }
}
input.addEventListener('focus', () => {
    showAutocomplete(input.value);
});

input.addEventListener('input', () => {
    showAutocomplete(input.value);
});
document.addEventListener('click', (e) => {
    if (e.target !== input && !autocompleteDiv.contains(e.target)) {
        autocompleteDiv.style.display = 'none';
    }
});
function saveState() {
    try {
        localStorage.setItem("fgw-state", JSON.stringify(gameState));
    } catch (e) {
        console.warn("No se pudo guardar el estado");
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem("fgw-state");
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
}
function loadDaily() {
    const today = new Date().toDateString();
    const saved = loadState();

    if (saved && saved.day === today) {
        gameState = saved;
        answer = gameState.answer;
        attempts = gameState.attempts.length;
        gameState.attempts.forEach(servant => createRow(servant));
        checkHints();
        
        if (gameState.won) {
            showWin();
        }
    } else {
        if (saved && saved.answer) {
            const prevDay = document.getElementById("previous-day");
            prevDay.textContent = `📅 El personaje de ayer fue: ${saved.answer.name}`;
            prevDay.classList.remove('hidden');
        }

        // Seleccionar nuevo personaje aleatorio
        answer = servants[Math.floor(Math.random() * servants.length)];
        gameState = {
            day: today,
            answer: answer,
            attempts: [],
            won: false
        };
        saveState();
    }
}
function checkGuess() {
    if (gameState.won) {
        alert("¡Ya ganaste! Vuelve mañana para un nuevo personaje 🎉");
        return;
    }

    const guess = input.value.trim();
    
    if (!guess) {
        alert("Por favor, escribe un nombre primero");
        return;
    }

    const servant = servants.find(s => s.name.toLowerCase() === guess.toLowerCase());

    if (!servant) {
        alert("❌ Personaje no encontrado. Verifica el nombre o selecciónalo de la lista.");
        return;
    }
    if (gameState.attempts.some(s => s.name === servant.name)) {
        alert("Ya intentaste con este personaje");
        input.value = "";
        return;
    }

    attempts++;
    gameState.attempts.push(servant);
    createRow(servant);
    checkHints();
    
    input.value = "";
    autocompleteDiv.style.display = 'none';
    if (servant.name === answer.name) {
        gameState.won = true;
        showWin();
    }

    saveState();
}
function createRow(servant) {
    const row = document.createElement("div");
    row.classList.add("row");

    const fields = [
        { key: "name", isName: true },
        { key: "class", isName: false },
        { key: "gender", isName: false },
        { key: "hair", isName: false },
        { key: "np", isName: false },
        { key: "nation", isName: false }
    ];

    fields.forEach(field => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        
        if (field.isName) {
            cell.classList.add("name-cell");
            const img = document.createElement('img');
            img.src = servant.image;
console.log('Intentando cargar:', servant.image); // LÍNEA NUEVA PARA DEBUG
            img.alt = servant.name;
            img.onerror = function() {
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%233d4a6b" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3E?%3C/text%3E%3C/svg%3E';
            };
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = servant.name;
            nameSpan.style.fontSize = '13px';
            nameSpan.style.fontWeight = '600';
            
            cell.appendChild(img);
            cell.appendChild(nameSpan);
        } else {
            cell.textContent = servant[field.key] || "N/A";
        }

        if (servant[field.key] === answer[field.key]) {
            cell.classList.add("correct");
        } else if (Array.isArray(answer[field.key]) && answer[field.key].includes(servant[field.key])) {
            cell.classList.add("partial");
        } else {
            cell.classList.add("wrong");
        }

        row.appendChild(cell);
    });

    gridDiv.appendChild(row);
}

function checkHints() {
    if (attempts >= 4) {
        const h1 = document.getElementById("hint1");
        h1.classList.remove("hidden");
        h1.onclick = () => alert(`💡 Categoría: ${answer.category}`);
    }

    if (attempts >= 8) {
        const h2 = document.getElementById("hint2");
        h2.classList.remove("hidden");
        h2.onclick = () => alert(`💡 Clase: ${answer.class}`);
    }
}

function showWin() {
    winMessage.classList.remove("hidden");
    winMessage.innerHTML = `
        <div>🎉 ¡Felicidades! 🎉</div>
        <div class="stats">
            <div class="stat-item">
                <span class="stat-value">${attempts}</span>
                <span>${attempts === 1 ? 'Intento' : 'Intentos'}</span>
            </div>
        </div>
        <div style="margin-top: 15px;">Adivinaste a <strong>${answer.name}</strong></div>
        <button class="share-btn" onclick="shareResults()">📋 Compartir Resultado</button>
        <div style="margin-top: 15px; font-size: 16px;">Vuelve mañana para un nuevo personaje ⚔️</div>
    `;
    input.disabled = true;
    guessBtn.disabled = true;
}
function shareResults() {
    const squares = gameState.attempts.map(attempt => {
        const fields = ["name", "class", "gender", "hair", "np", "nation"];
        return fields.map(f => {
            if (attempt[f] === answer[f]) return "🟩";
            if (Array.isArray(answer[f]) && answer[f].includes(attempt[f])) return "🟨";
            return "🟥";
        }).join("");
    }).join("\n");

    const text = `⚔️ Fate Grand Wordle ⚔️\n¡Adiviné en ${attempts} ${attempts === 1 ? 'intento' : 'intentos'}!\n\n${squares}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert("¡Resultado copiado al portapapeles! 📋");
        }).catch(() => {
            prompt("Copia este texto para compartir:", text);
        });
    } else {
        prompt("Copia este texto para compartir:", text);
    }
}

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkGuess();
    }
});

guessBtn.onclick = checkGuess;

loadDaily();




