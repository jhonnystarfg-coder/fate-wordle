// Base de datos de personajes (puedes agregar más)
const servants = [
    { name: "Artoria Pendragon", class: "Saber", gender: "Femenino", hair: "Rubio", np: "Anti-Fortress", nation: "Britania", category: "Servant" },
    { name: "Jeanne d'Arc", class: "Ruler", gender: "Femenino", hair: "Rubio", np: "Anti-Army", nation: "Francia", category: "Servant" },
    { name: "Gilgamesh", class: "Archer", gender: "Masculino", hair: "Rubio", np: "Anti-World", nation: "Sumeria", category: "Servant" },
    { name: "Cu Chulainn", class: "Lancer", gender: "Masculino", hair: "Azul", np: "Anti-Unit", nation: "Irlanda", category: "Servant" },
    { name: "Medusa", class: "Rider", gender: "Femenino", hair: "Morado", np: "Anti-Army", nation: "Grecia", category: "Servant" },
    { name: "Medea", class: "Caster", gender: "Femenino", hair: "Morado", np: "Anti-Unit", nation: "Grecia", category: "Servant" },
    { name: "Sasaki Kojirou", class: "Assassin", gender: "Masculino", hair: "Azul", np: "Anti-Unit", nation: "Japón", category: "Servant" },
    { name: "Heracles", class: "Berserker", gender: "Masculino", hair: "Negro", np: "Anti-Unit", nation: "Grecia", category: "Servant" },
    { name: "Emiya", class: "Archer", gender: "Masculino", hair: "Blanco", np: "Anti-Unit", nation: "Japón", category: "Servant" },
    { name: "Ishtar", class: "Archer", gender: "Femenino", hair: "Negro", np: "Anti-Mountain", nation: "Sumeria", category: "Servant" },
    { name: "Scathach", class: "Lancer", gender: "Femenino", hair: "Morado", np: "Anti-Unit", nation: "Irlanda", category: "Servant" },
    { name: "Mordred", class: "Saber", gender: "Femenino", hair: "Rubio", np: "Anti-Army", nation: "Britania", category: "Servant" },
    { name: "Jack the Ripper", class: "Assassin", gender: "Femenino", hair: "Plateado", np: "Anti-Unit", nation: "Inglaterra", category: "Servant" },
    { name: "Karna", class: "Lancer", gender: "Masculino", hair: "Blanco", np: "Anti-Country", nation: "India", category: "Servant" },
    { name: "Arjuna", class: "Archer", gender: "Masculino", hair: "Blanco", np: "Anti-Army", nation: "India", category: "Servant" },
    { name: "ORT", class: "N/A", gender: "N/A", hair: "N/A", np: "N/A", nation: "Desconocido", category: "Foreign Entity" },
    { name: "Merlin", class: "Caster", gender: "Masculino", hair: "Blanco", np: "Anti-Unit", nation: "Britania", category: "Servant" },
    { name: "Okita Souji", class: "Saber", gender: "Femenino", hair: "Castaño", np: "Anti-Unit", nation: "Japón", category: "Servant" },
    { name: "Nero Claudius", class: "Saber", gender: "Femenino", hair: "Rubio", np: "Anti-Team", nation: "Roma", category: "Servant" },
    { name: "Tamamo no Mae", class: "Caster", gender: "Femenino", hair: "Rosa", np: "Anti-Army", nation: "Japón", category: "Servant" },
    { name: "Iskandar", class: "Rider", gender: "Masculino", hair: "Rojo", np: "Anti-Army", nation: "Macedonia", category: "Servant" },
    { name: "Ozymandias", class: "Rider", gender: "Masculino", hair: "Rubio", np: "Anti-Fortress", nation: "Egipto", category: "Servant" },
    { name: "Enkidu", class: "Lancer", gender: "N/A", hair: "Verde", np: "Anti-Purge", nation: "Sumeria", category: "Servant" },
    { name: "Mysterious Heroine X", class: "Assassin", gender: "Femenino", hair: "Rubio", np: "Anti-Unit", nation: "Desconocido", category: "Servant" },
    { name: "Musashi Miyamoto", class: "Saber", gender: "Femenino", hair: "Negro", np: "Anti-Unit", nation: "Japón", category: "Servant" }
];

let answer = null;
let attempts = 0;
let gameState = { day: null, answer: null, attempts: [], won: false };

// Elementos del DOM
const input = document.getElementById('guess-input');
const autocompleteDiv = document.getElementById('autocomplete');
const guessBtn = document.getElementById('guess-btn');
const gridDiv = document.getElementById('grid');
const winMessage = document.getElementById('win-message');

// Sistema de autocompletado
input.addEventListener('input', () => {
    const value = input.value.toLowerCase();
    autocompleteDiv.innerHTML = '';
    
    if (value.length < 2) {
        autocompleteDiv.style.display = 'none';
        return;
    }

    const matches = servants.filter(s => 
        s.name.toLowerCase().includes(value)
    ).slice(0, 5);

    if (matches.length > 0) {
        autocompleteDiv.style.display = 'block';
        matches.forEach(servant => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.textContent = servant.name;
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
});

// Cerrar autocomplete al hacer click fuera
document.addEventListener('click', (e) => {
    if (e.target !== input) {
        autocompleteDiv.style.display = 'none';
    }
});

// Guardar y cargar estado del juego
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

// Cargar personaje diario
function loadDaily() {
    const today = new Date().toDateString();
    const saved = loadState();

    if (saved && saved.day === today) {
        // Restaurar partida del día
        gameState = saved;
        answer = gameState.answer;
        attempts = gameState.attempts.length;
        
        // Restaurar intentos previos
        gameState.attempts.forEach(servant => createRow(servant));
        checkHints();
        
        if (gameState.won) {
            showWin();
        }
    } else {
        // Mostrar personaje del día anterior
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

// Procesar intento del jugador
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
        alert("❌ Personaje no encontrado. Verifica el nombre.");
        return;
    }

    // Evitar intentos duplicados
    if (gameState.attempts.some(s => s.name === servant.name)) {
        alert("Ya intentaste con este personaje");
        return;
    }

    attempts++;
    gameState.attempts.push(servant);
    createRow(servant);
    checkHints();
    
    input.value = "";
    autocompleteDiv.style.display = 'none';

    // Verificar si ganó
    if (servant.name === answer.name) {
        gameState.won = true;
        showWin();
    }

    saveState();
}

// Crear fila visual con el intento
function createRow(servant) {
    const row = document.createElement("div");
    row.classList.add("row");

    const fields = ["name", "class", "gender", "hair", "np", "nation"];

    fields.forEach(f => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.textContent = servant[f] || "N/A";

        // Comparar con la respuesta correcta
        if (servant[f] === answer[f]) {
            cell.classList.add("correct");
        } else if (Array.isArray(answer[f]) && answer[f].includes(servant[f])) {
            cell.classList.add("partial");
        } else {
            cell.classList.add("wrong");
        }

        row.appendChild(cell);
    });

    gridDiv.appendChild(row);
}

// Sistema de pistas progresivas
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

// Mostrar mensaje de victoria
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
    
    // Deshabilitar controles
    input.disabled = true;
    guessBtn.disabled = true;
}

// Compartir resultados (estilo Wordle)
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
            alert("¡Resultado copiado al portapapeles! 📋 Ahora puedes compartirlo.");
        }).catch(() => {
            prompt("Copia este texto para compartir:", text);
        });
    } else {
        prompt("Copia este texto para compartir:", text);
    }
}

// Permitir usar Enter para adivinar
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkGuess();
    }
});

// Event listener del botón
guessBtn.onclick = checkGuess;

// Iniciar el juego
loadDaily();