    /* ---------- CONFIG ---------- */
    const PLAYER_PASSWORD = 'space';
    const DM_PASSWORD = 'dm2';
    
    /* Google Sheet IDs */
    const SPREADSHEET_ID = '1SXE6BwnRqVR93MFp-zSI83bBgcqZ5y53Hg197VrzjSo';
    const SHEET_NAME = 'Sheet1';
    const DATA_RANGE = `${SHEET_NAME}!A:E`; // Added column for thought type
    
    /* ---------- DB SCHEMA ---------- */
    /*
     * Database Schema:
     *
     * [timestamp, author, type, content, formatInfo]
     *
     * author: "DM" or "PLAYER"
     * type: "PROMPT", "ACTION", "OUTCOME", or "DM_THOUGHT"
     * content: The actual content
     * formatInfo: For thoughts, always "JSON".
     *
     * Thought Format JSON Structure:
     * {
     *   "segments": [
     *     {
     *       "text": "This is a watsonian thought",
     *       "type": "watsonian",
     *       "longTerm": true|false
     *     },
     *     {
     *       "text": "This is a doylist thought",
     *       "type": "doylist",
     *       "longTerm": false
     *     },
     *     ...
     *   ]
     * }
     *
     * This allows parts of a thought to have different formatting (watsonian/doylist/long-term)
     */
    
    /* ---------- GLOBAL STATE ---------- */
    let isPlayerLoggedIn = false;
    let isAdminLoggedIn = false;
    let serviceAccountCredentials = null;
    let accessToken = null;
    let tokenExpiryTime = 0;
    let isLoading = false;
    let playerCredentials = null;
    let dmCredentials = null;
    let currentDefaultThoughtType = 'watsonian'; // Default thought type
    let currentMessageType = 'PROMPT'; // Default message type
    let gameData = []; // Store game data for turn tracking
    let isPlayerTurn = false; // Track whose turn it is
    let isSearching = false; // Track search state
    let longTermFilterType = 'all'; // Filter for long-term thoughts ('all', 'watsonian', 'doylist')
    const STORAGE_KEY_PLAYER = 'asyncRpg_playerAuth';
    const STORAGE_KEY_DM = 'asyncRpg_dmAuth';
    
    /* ---------- DOM ELEMENTS ---------- */
    // Login elements
    const loginContainer = document.getElementById('loginContainer');
    const playerLoginBtn = document.getElementById('playerLoginBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const playerPasswordInput = document.getElementById('playerPassword');
    const adminPasswordInput = document.getElementById('adminPassword');
    const playerLoginError = document.getElementById('playerLoginError');
    const adminLoginError = document.getElementById('adminLoginError');
    const loginStatusMessage = document.getElementById('loginStatusMessage');
    
    // Main containers
    const dmMainContainer = document.getElementById('dmMainContainer');
    const playerMainContainer = document.getElementById('playerMainContainer');
    
    // DM elements
    const refreshGameBtn = document.getElementById('refreshGameBtn');
    const gameLogDisplay = document.getElementById('gameLogDisplay');
    const dmThoughtEditor = document.getElementById('dmThoughtEditor');
    const dmMessageInput = document.getElementById('dmMessageInput');
    const postDmMessageBtn = document.getElementById('postDmMessageBtn');
    const dmStatusMessage = document.getElementById('dmStatusMessage');
    const watsonianBtn = document.getElementById('watsonian-btn');
    const doylistBtn = document.getElementById('doylist-btn');
    const longtermBtn = document.getElementById('longterm-btn');
    const longTermThoughtsContainer = document.getElementById('longTermThoughtsContainer');
    const thoughtSearchInput = document.getElementById('thoughtSearchInput');
    const currentMessageTypeSpan = document.getElementById('currentMessageType');
    const dmTurnLockedMessage = document.getElementById('dmTurnLockedMessage');
    const dmInputControls = document.getElementById('dmInputControls');
    const selectionInfo = document.getElementById('selection-info');
    const filterButtons = document.querySelectorAll('.filter-button');
    
    // Player elements
    const playerRefreshBtn = document.getElementById('playerRefreshBtn');
    const playerGameLogDisplay = document.getElementById('playerGameLogDisplay');
    const playerActionInput = document.getElementById('playerActionInput');
    const submitPlayerActionBtn = document.getElementById('submitPlayerActionBtn');
    const playerStatusMessage = document.getElementById('playerStatusMessage');
    const playerTurnLockedMessage = document.getElementById('playerTurnLockedMessage');
    const playerInputControls = document.getElementById('playerInputControls');
    
    /* ---------- UI HELPERS ---------- */
    function showLoading(element, msg = 'Procesando...') {
        isLoading = true;
        element.textContent = msg;
        document.querySelectorAll('button').forEach(b => b.disabled = true);
    }
    
    function hideLoading(element, msg = 'Listo.') {
        isLoading = false;
        element.textContent = msg;
        document.querySelectorAll('button').forEach(b => b.disabled = false);
    }
    
    function formatDate(isoString) {
        const date = new Date(isoString);
        return {
            time: date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
            date: date.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})
        };
    }
    
    /* ---------- CREDENTIALS LOADING ---------- */
    async function loadCredentials() {
        try {
            // Load player credentials
            const playerResponse = await fetch('player_credentials.hex');
            if (!playerResponse.ok) throw new Error('Error al cargar las credenciales del jugador');
            playerCredentials = await playerResponse.text();
            
            // Load DM credentials
            const dmResponse = await fetch('dm_credentials.hex');
            if (!dmResponse.ok) throw new Error('Error al cargar las credenciales del DM');
            dmCredentials = await dmResponse.text();
            
            loginStatusMessage.textContent = 'Credenciales cargadas con éxito.';
            return true;
        } catch (e) {
            console.error('Error loading credentials', e);
            loginStatusMessage.textContent = 'CRÍTICO: No se pudieron cargar los archivos de credenciales.';
            return false;
        }
    }
    
    /* ---------- XOR HELPER ---------- */
    function xorDecrypt(hex, key) {
        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
        const keyB = new TextEncoder().encode(key);
        const plain = bytes.map((b, i) => b ^ keyB[i % keyB.length]);
        return new TextDecoder().decode(plain);
    }
    
    /* ---------- LOGIN ---------- */
    async function initialiseCredentials(cipherHex, pass) {
        if (serviceAccountCredentials) return true;
        try {
            const json = xorDecrypt(cipherHex, pass);
            serviceAccountCredentials = JSON.parse(json);
            return true;
        } catch (e) {
            console.error('SA decrypt/parse error', e);
            loginStatusMessage.textContent = 'CRÍTICO: No se pudieron cargar las credenciales de la cuenta de servicio.';
            return false;
        }
    }
    
    async function loginAsPlayer() {
        if (playerPasswordInput.value !== PLAYER_PASSWORD) {
            playerLoginError.textContent = 'Contraseña incorrecta.';
            return;
        }
        
        if (!playerCredentials) {
            if (!await loadCredentials()) {
                playerLoginError.textContent = 'Error al cargar credenciales.';
                return;
            }
        }
        
        if (!await initialiseCredentials(playerCredentials, PLAYER_PASSWORD)) {
            playerLoginError.textContent = 'Error al inicializar credenciales.';
            return;
        }
        
        playerLoginError.textContent = '';
        isPlayerLoggedIn = true;
        loginContainer.style.display = 'none';
        playerMainContainer.style.display = 'block';
        playerStatusMessage.textContent = 'Conectado como Jugador.';
        await loadGameData();
    }
    
    async function loginAsAdmin() {
        if (adminPasswordInput.value !== DM_PASSWORD) {
            adminLoginError.textContent = 'Contraseña incorrecta.';
            return;
        }
        
        if (!dmCredentials) {
            if (!await loadCredentials()) {
                adminLoginError.textContent = 'Error al cargar credenciales.';
                return;
            }
        }
        
        if (!await initialiseCredentials(dmCredentials, DM_PASSWORD)) {
            adminLoginError.textContent = 'Error al inicializar credenciales.';
            return;
        }
        
        adminLoginError.textContent = '';
        isAdminLoggedIn = true;
        loginContainer.style.display = 'none';
        dmMainContainer.style.display = 'block';
        dmStatusMessage.textContent = 'Conectado como DM.';
        await loadGameData();
    }
    
    /* ---------- GOOGLE AUTH ---------- */
    async function getAccessToken() {
        if (accessToken && Date.now() < tokenExpiryTime) return accessToken;
        if (!serviceAccountCredentials) throw new Error('No has iniciado sesión.');
        const header = { alg: 'RS256', typ: 'JWT' };
        const now = Math.floor(Date.now() / 1000);
        const claims = {
            iss: serviceAccountCredentials.client_email,
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3500,
            iat: now
        };
        const sJWT = KJUR.jws.JWS.sign(
            'RS256',
            JSON.stringify(header),
            JSON.stringify(claims),
            serviceAccountCredentials.private_key
        );
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + sJWT
        });
        if (!res.ok) {
            const err = await res.json(); throw new Error('Intercambio de token fallido: ' + JSON.stringify(err));
        }
        const data = await res.json();
        accessToken = data.access_token;
        tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000;
        return accessToken;
    }
    
    /* ---------- SHEET HELPERS ---------- */
    async function appendToSheet(values) {
        const token = await getAccessToken();
        const rangeForAppend = `${SHEET_NAME}!A1`;
        const body = { values };
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${rangeForAppend}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json(); throw new Error('Error al añadir datos: ' + err.error.message);
        }
        return res.json();
    }
    
    async function readSheet() {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${DATA_RANGE}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) {
            const err = await res.json(); throw new Error('Error al leer datos: ' + err.error.message);
        }
        const data = await res.json();
        return data.values || [];
    }
    
    /* ---------- RICH TEXT EDITOR FUNCTIONS ---------- */
    // Initialize the editor
    function initRichTextEditor() {
        // Set the default formatting
        updateDefaultFormatting();
        
        // Add event listener for keyboard shortcuts
        dmThoughtEditor.addEventListener('keydown', handleEditorKeyboard);
        
        // Add event listener to track selection changes
        document.addEventListener('selectionchange', handleSelectionChange);
    }
    
    function handleEditorKeyboard(e) {
        // Ctrl+W for Watsonian
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            setDefaultThoughtType('watsonian');
            applyFormattingToSelection('watsonian');
        }
        // Ctrl+D for Doylist
        else if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            setDefaultThoughtType('doylist');
            applyFormattingToSelection('doylist');
        }
        // Ctrl+L for Long-term
        else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            toggleLongTerm();
        }
        // Ctrl+Enter to submit
        else if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            postDmMessage();
        }
    }
    
    function handleSelectionChange() {
        const selection = window.getSelection();
        
        // Only process if the selection is within our editor
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const editorNode = dmThoughtEditor;
            
            if (editorNode.contains(range.commonAncestorContainer)) {
                if (selection.toString().trim().length > 0) {
                    selectionInfo.textContent = `${selection.toString().length} caracteres seleccionados`;
                } else {
                    updateSelectionInfoBasedOnCursor();
                }
            }
        }
    }
    
    function updateSelectionInfoBasedOnCursor() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            
            // Find the closest span with formatting
            let currentNode = node;
            while (currentNode && currentNode !== dmThoughtEditor) {
                if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName === 'SPAN') {
                    // Found a span, check its classes
                    if (currentNode.classList.contains('watsonian-text')) {
                        selectionInfo.textContent = currentNode.classList.contains('longterm-text') ? 
                            'Watsoniano + Largo plazo' : 'Watsoniano';
                        return;
                    } else if (currentNode.classList.contains('doylist-text')) {
                        selectionInfo.textContent = currentNode.classList.contains('longterm-text') ? 
                            'Doylista + Largo plazo' : 'Doylista';
                        return;
                    }
                }
                currentNode = currentNode.parentNode;
            }
            
            // No formatting found, show the default
            selectionInfo.textContent = `Usando ${currentDefaultThoughtType === 'watsonian' ? 'watsoniano' : 'doylista'}`;
        } else {
            selectionInfo.textContent = `Usando ${currentDefaultThoughtType === 'watsonian' ? 'watsoniano' : 'doylista'}`;
        }
    }
    
    function setDefaultThoughtType(type) {
        currentDefaultThoughtType = type;
        
        // Update UI to show active button
        watsonianBtn.classList.remove('active');
        doylistBtn.classList.remove('active');
        
        if (type === 'watsonian') {
            watsonianBtn.classList.add('active');
        } else if (type === 'doylist') {
            doylistBtn.classList.add('active');
        }
        
        updateSelectionInfoBasedOnCursor();
    }
    
    function toggleLongTerm() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            // Cursor is just placed somewhere, not selecting text
            return;
        }
        
        longtermBtn.classList.toggle('active');
        applyFormattingToSelection('longterm');
    }
    
    function updateDefaultFormatting() {
        // Make sure the editor starts with the default formatting
        if (dmThoughtEditor.innerHTML.trim() === '') {
            const defaultClass = currentDefaultThoughtType === 'watsonian' ? 'watsonian-text' : 'doylist-text';
            dmThoughtEditor.innerHTML = `<span class="${defaultClass}"><br></span>`;
            
            // Place cursor at the beginning
            const range = document.createRange();
            const selection = window.getSelection();
            range.setStart(dmThoughtEditor.firstChild.firstChild, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    // Fixed function to prevent duplication
    function applyFormattingToSelection(format) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            // No text selected, just update the default
            if (format === 'watsonian' || format === 'doylist') {
                setDefaultThoughtType(format);
            }
            return;
        }
        
        // Create a temporary document fragment to hold the selected content
        const fragment = range.cloneContents();
        
        // Process the fragment to get plain text and check for long-term
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        
        // Get the text content, avoiding duplicated text
        const plainText = tempDiv.textContent;
        
        // Check if any of the selection had longterm formatting
        const wasLongTerm = tempDiv.querySelector('.longterm-text') !== null;
        
        // Create a new span with the appropriate classes
        const span = document.createElement('span');
        
        if (format === 'watsonian' || format === 'doylist') {
            // Add the base class
            span.classList.add(format === 'watsonian' ? 'watsonian-text' : 'doylist-text');
            
            // Preserve long-term formatting if it was present
            if (wasLongTerm) {
                span.classList.add('longterm-text');
            }
            
            // Set the plain text content
            span.textContent = plainText;
        } else if (format === 'longterm') {
            // For longterm toggle, preserve watsonian/doylist status
            const isWatsonian = tempDiv.querySelector('.watsonian-text') !== null;
            const isDoylist = tempDiv.querySelector('.doylist-text') !== null;
            
            // Add the appropriate base class
            if (isWatsonian) {
                span.classList.add('watsonian-text');
            } else if (isDoylist) {
                span.classList.add('doylist-text');
            } else {
                // If neither, use the default
                span.classList.add(currentDefaultThoughtType === 'watsonian' ? 'watsonian-text' : 'doylist-text');
            }
            
            // Toggle long-term status
            if (!wasLongTerm) {
                span.classList.add('longterm-text');
            }
            
            span.textContent = plainText;
        }
        
        // Delete the selected content and insert the new span
        range.deleteContents();
        range.insertNode(span);
        
        // Clean up any nested or empty spans
        cleanupNestedSpans(dmThoughtEditor);
        
        // Restore selection
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
    }
    
    // Function to check if node or its children have a specific class
    function hasClass(node, className) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && node.classList.contains(className)) {
                return true;
            }
            
            for (let i = 0; i < node.childNodes.length; i++) {
                if (hasClass(node.childNodes[i], className)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Improved cleanup function to prevent duplication
    function cleanupNestedSpans(rootNode) {
        // First pass: flatten spans within spans where they could cause duplication
        const deepNestedSpans = rootNode.querySelectorAll('span span');
        for (const nestedSpan of deepNestedSpans) {
            const parent = nestedSpan.parentNode;
            
            if (parent.tagName === 'SPAN') {
                // Get the formatting classes
                const parentIsWatsonian = parent.classList.contains('watsonian-text');
                const parentIsDoylist = parent.classList.contains('doylist-text');
                const parentIsLongterm = parent.classList.contains('longterm-text');
                
                const childIsWatsonian = nestedSpan.classList.contains('watsonian-text');
                const childIsDoylist = nestedSpan.classList.contains('doylist-text');
                const childIsLongterm = nestedSpan.classList.contains('longterm-text');
                
                // Get the text content
                const textContent = nestedSpan.textContent;
                
                // If same format type or parent contains child completely, flatten
                if ((parentIsWatsonian && childIsWatsonian) || 
                    (parentIsDoylist && childIsDoylist)) {
                    
                    // Keep longterm if either has it
                    if (childIsLongterm && !parentIsLongterm) {
                        parent.classList.add('longterm-text');
                    }
                    
                    // Replace with text content to avoid duplication
                    parent.replaceChild(document.createTextNode(textContent), nestedSpan);
                }
            }
        }
        
        // Second pass: merge adjacent spans with identical formatting
        const spans = Array.from(rootNode.querySelectorAll('span'));
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            if (!span.parentNode) continue; // Skip if already removed
            
            const nextSibling = span.nextSibling;
            if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE && 
                nextSibling.tagName === 'SPAN') {
                
                // Compare classes (use a normalized comparison)
                const spanClasses = Array.from(span.classList).sort().join(',');
                const siblingClasses = Array.from(nextSibling.classList).sort().join(',');
                
                if (spanClasses === siblingClasses) {
                    // Merge the spans to avoid duplication
                    span.textContent += nextSibling.textContent;
                    nextSibling.parentNode.removeChild(nextSibling);
                    i--; // Check this span again for more merges
                }
            }
        }
        
        // Third pass: handle text nodes outside of spans
        const nodeIterator = document.createNodeIterator(
            rootNode, 
            NodeFilter.SHOW_TEXT, 
            { 
                acceptNode(node) {
                    // Only accept text nodes that are direct children and not empty
                    return (node.parentNode === rootNode && node.textContent.trim() !== '') ? 
                        NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                }
            }
        );
        
        const textNodesToWrap = [];
        let currentNode;
        while (currentNode = nodeIterator.nextNode()) {
            textNodesToWrap.push(currentNode);
        }
        
        // Wrap each direct text node in a span with default formatting
        for (const textNode of textNodesToWrap) {
            const span = document.createElement('span');
            span.classList.add(currentDefaultThoughtType === 'watsonian' ? 'watsonian-text' : 'doylist-text');
            
            const parent = textNode.parentNode;
            parent.replaceChild(span, textNode);
            span.appendChild(textNode);
        }
        
        // Remove empty spans
        const allSpans = rootNode.querySelectorAll('span');
        for (const span of allSpans) {
            if (span.textContent.trim() === '') {
                span.parentNode.removeChild(span);
            }
        }
    }
    
    // This function converts our rich text to the segments format for storage
    function editorContentToSegments() {
        const segments = [];
        const spans = dmThoughtEditor.querySelectorAll('span');
        
        for (const span of spans) {
            const isWatsonian = span.classList.contains('watsonian-text');
            const isDoylist = span.classList.contains('doylist-text');
            const isLongTerm = span.classList.contains('longterm-text');
            
            if (!isWatsonian && !isDoylist) {
                // Every span should have either watsonian or doylist
                continue;
            }
            
            const text = span.textContent;
            if (text.trim() === '') continue;
            
            segments.push({
                text: text,
                type: isWatsonian ? 'watsonian' : 'doylist',
                longTerm: isLongTerm
            });
        }
        
        return segments;
    }
    
    // This function converts stored segments back to rich text
    function segmentsToEditorContent(segments) {
        let html = '';
        
        for (const segment of segments) {
            const classes = [];
            if (segment.type === 'watsonian') {
                classes.push('watsonian-text');
            } else if (segment.type === 'doylist') {
                classes.push('doylist-text');
            }
            
            if (segment.longTerm) {
                classes.push('longterm-text');
            }
            
            html += `<span class="${classes.join(' ')}">${escapeHtml(segment.text)}</span>`;
        }
        
        return html || `<span class="watsonian-text"><br></span>`;
    }
    
    // Helper to escape HTML for safe insertion
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    /* ---------- FILTERING AND SEARCH FUNCTIONS ---------- */
    function filterLongTermThoughts() {
        const searchTerm = thoughtSearchInput.value.toLowerCase();
        const filterType = longTermFilterType;
        
        // Get all thoughts in the sidebar
        const thoughts = document.querySelectorAll('.longterm-thought');
        
        for (const thought of thoughts) {
            const content = thought.querySelector('.thought-content');
            let shouldShow = true;
            
            // Check if it matches the search term
            if (searchTerm && !content.textContent.toLowerCase().includes(searchTerm)) {
                shouldShow = false;
            }
            
            // Check if it matches the filter type
            if (filterType !== 'all') {
                const hasWatsonian = content.querySelector('.watsonian-text');
                const hasDoylist = content.querySelector('.doylist-text');
                
                if (filterType === 'watsonian' && !hasWatsonian) {
                    shouldShow = false;
                } else if (filterType === 'doylist' && !hasDoylist) {
                    shouldShow = false;
                }
            }
            
            thought.style.display = shouldShow ? 'block' : 'none';
        }
    }
    
    function setLongTermFilter(type) {
        longTermFilterType = type;
        
        // Update UI
        filterButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filter === type) {
                button.classList.add('active');
            }
        });
        
        filterLongTermThoughts();
    }
    
    /* ---------- DM ACTIONS ---------- */
    async function postDmMessage() {
        if (isLoading) return;
        if (!isAdminLoggedIn) {
            dmStatusMessage.textContent = 'Tenés que estar conectado como DM.';
            return;
        }
        
        // Clean up the editor content
        cleanupNestedSpans(dmThoughtEditor);
        
        // Extract thought segments from the editor
        const thoughtSegments = editorContentToSegments();
        const hasThought = thoughtSegments.length > 0 && thoughtSegments.some(s => s.text.trim() !== '');
        
        const message = dmMessageInput.value.trim();
        
        if (!message) {
            dmStatusMessage.textContent = 'El mensaje del juego es obligatorio.';
            return;
        }
        
        showLoading(dmStatusMessage, 'Publicando mensaje...');
        
        const ts = new Date().toISOString();
        const rows = [];
        
        // Add thought row if present (thoughts go before prompt/outcome)
        if (hasThought) {
            const thoughtContent = JSON.stringify({ segments: thoughtSegments });
            rows.push([ts, 'DM', 'DM_THOUGHT', thoughtContent, 'JSON']);
        }
        
        // Add message row
        rows.push([ts, 'DM', currentMessageType, message, null]);
        
        try {
            await appendToSheet(rows);
            dmThoughtEditor.innerHTML = `<span class="${currentDefaultThoughtType === 'watsonian' ? 'watsonian-text' : 'doylist-text'}"><br></span>`;
            dmMessageInput.value = '';
            
            // Update message type for next turn
            if (currentMessageType === 'PROMPT') {
                currentMessageType = 'OUTCOME';
                currentMessageTypeSpan.textContent = 'Outcome';
            } else {
                currentMessageType = 'PROMPT';
                currentMessageTypeSpan.textContent = 'Prompt';
            }
            
            await loadGameData();
            hideLoading(dmStatusMessage, 'Mensaje publicado.');
        } catch (e) {
            hideLoading(dmStatusMessage, 'Error: ' + e.message);
        }
    }
    
    /* ---------- PLAYER ACTIONS ---------- */
    async function submitPlayerAction() {
        if (isLoading) return;
        if (!isPlayerLoggedIn) {
            playerStatusMessage.textContent = 'Tenés que estar conectado como jugador.';
            return;
        }
        
        if (!isPlayerTurn) {
            playerStatusMessage.textContent = "Todavía no es tu turno.";
            return;
        }
        
        const actionText = playerActionInput.value.trim();
        if (!actionText) {
            playerStatusMessage.textContent = 'Por favor, ingresá tu Action.';
            return;
        }
        
        showLoading(playerStatusMessage, 'Enviando Action...');
        const ts = new Date().toISOString();
        
        try {
            await appendToSheet([[ts, 'PLAYER', 'ACTION', actionText, null]]);
            playerActionInput.value = '';
            await loadGameData();
            hideLoading(playerStatusMessage, 'Action enviada.');
        } catch (e) {
            hideLoading(playerStatusMessage, 'Error: ' + e.message);
        }
    }
    
    /* ---------- GAME DATA LOADING ---------- */
    async function loadGameData() {
        try {
            const statusMsg = isPlayerLoggedIn ? playerStatusMessage : dmStatusMessage;
            showLoading(statusMsg, 'Cargando datos del juego...');
            
            const rows = await readSheet();
            gameData = rows; // Store for turn tracking
            
            if (isAdminLoggedIn) {
                renderDmGameLog(rows);
                updateDmTurnStatus(rows);
            }
            
            if (isPlayerLoggedIn) {
                renderPlayerGameLog(rows);
                updatePlayerTurnStatus(rows);
            }
            
            hideLoading(statusMsg, 'Datos del juego cargados.');
        } catch (e) {
            const statusMsg = isPlayerLoggedIn ? playerStatusMessage : dmStatusMessage;
            hideLoading(statusMsg, 'Error al cargar datos: ' + e.message);
            
            if (isAdminLoggedIn) {
                gameLogDisplay.innerHTML = '<p class="error">Error al cargar datos del juego: ' + e.message + '</p>';
            }
            
            if (isPlayerLoggedIn) {
                playerGameLogDisplay.innerHTML = '<p class="error">Error al cargar datos del juego: ' + e.message + '</p>';
            }
        }
    }
    
    function updateDmTurnStatus(rows) {
        // Check turn status based on last entry
        if (rows.length === 0) {
            // No entries yet, DM needs to post the first prompt
            isPlayerTurn = false;
            currentMessageType = 'PROMPT';
            currentMessageTypeSpan.textContent = 'Prompt';
            dmTurnLockedMessage.style.display = 'none';
            dmInputControls.style.display = 'block';
            return;
        }
        
        // Find the last non-thought entry to determine turn status
        let lastActionRow = null;
        for (let i = rows.length - 1; i >= 0; i--) {
            if (rows[i] && rows[i].length >= 3 && rows[i][2] !== 'DM_THOUGHT') {
                lastActionRow = rows[i];
                break;
            }
        }
        
        if (!lastActionRow) {
            // No action rows yet, DM's turn
            isPlayerTurn = false;
            currentMessageType = 'PROMPT';
            currentMessageTypeSpan.textContent = 'Prompt';
            dmTurnLockedMessage.style.display = 'none';
            dmInputControls.style.display = 'block';
            return;
        }
        
        const [_, author, type] = lastActionRow;
        
        if (author === 'PLAYER' && type === 'ACTION') {
            // Player just submitted an action, DM's turn to respond with OUTCOME
            isPlayerTurn = false;
            currentMessageType = 'OUTCOME';
            currentMessageTypeSpan.textContent = 'Outcome';
            dmTurnLockedMessage.style.display = 'none';
            dmInputControls.style.display = 'block';
        } else if (author === 'DM' && type === 'OUTCOME') {
            // After an outcome, DM posts a prompt
            isPlayerTurn = false;
            currentMessageType = 'PROMPT';
            currentMessageTypeSpan.textContent = 'Prompt';
            dmTurnLockedMessage.style.display = 'none';
            dmInputControls.style.display = 'block';
        } else if (author === 'DM' && type === 'PROMPT') {
            // DM posted a prompt, waiting for player action
            isPlayerTurn = true;
            dmTurnLockedMessage.style.display = 'block';
            dmInputControls.style.display = 'none';
        } else {
            // Default case, let DM post
            isPlayerTurn = false;
            dmTurnLockedMessage.style.display = 'none';
            dmInputControls.style.display = 'block';
        }
    }
    
    function updatePlayerTurnStatus(rows) {
        // Check turn status based on last entry
        if (rows.length === 0) {
            // No entries yet, waiting for DM to post the first prompt
            isPlayerTurn = false;
            playerTurnLockedMessage.style.display = 'block';
            playerTurnLockedMessage.textContent = 'Esperando a que el DM inicie el juego...';
            playerInputControls.style.display = 'none';
            return;
        }
        
        // Find the last non-thought entry to determine turn status
        let lastActionRow = null;
        for (let i = rows.length - 1; i >= 0; i--) {
            if (rows[i] && rows[i].length >= 3 && rows[i][2] !== 'DM_THOUGHT') {
                lastActionRow = rows[i];
                break;
            }
        }
        
        if (!lastActionRow) {
            // No action rows yet, waiting for DM
            isPlayerTurn = false;
            playerTurnLockedMessage.style.display = 'block';
            playerInputControls.style.display = 'none';
            return;
        }
        
        const [_, author, type] = lastActionRow;
        
        if (author === 'DM' && (type === 'PROMPT' || type === 'OUTCOME')) {
            // DM just posted, player's turn
            isPlayerTurn = true;
            playerTurnLockedMessage.style.display = 'none';
            playerInputControls.style.display = 'block';
        } else if (author === 'PLAYER' && type === 'ACTION') {
            // Player just submitted, waiting for DM
            isPlayerTurn = false;
            playerTurnLockedMessage.style.display = 'block';
            playerInputControls.style.display = 'none';
        } else {
            // Default case, lock player input
            isPlayerTurn = false;
            playerTurnLockedMessage.style.display = 'block';
            playerInputControls.style.display = 'none';
        }
    }
    
    function renderDmGameLog(rows) {
        gameLogDisplay.innerHTML = '';
        longTermThoughtsContainer.innerHTML = '';
        
        if (rows.length === 0) {
            gameLogDisplay.innerHTML = '<div class="step"><p>Todavía no hay entradas de juego. ¡Empezá publicando un Prompt!</p></div>';
            return;
        }
        
        // Process rows into a sequence with proper order
        let gameSequence = [];
        let pendingThoughts = [];
        
        // First pass - group thoughts with their associated messages
        for (const row of rows) {
            if (!row || row.length < 3) continue;
            
            const [timestamp, author, type, content, formatInfo] = row;
            
            if (type === 'DM_THOUGHT') {
                // Process JSON formatted thoughts
                try {
                    const thoughtData = JSON.parse(content);
                    const processedThought = {
                        timestamp,
                        segments: thoughtData.segments
                    };
                    
                    // Extract long-term segments for the sidebar
                    const longTermSegments = thoughtData.segments.filter(segment => segment.longTerm);
                    if (longTermSegments.length > 0) {
                        renderLongTermThought(timestamp, longTermSegments);
                    }
                    
                    // Add to pending thoughts queue
                    pendingThoughts.push(processedThought);
                } catch (e) {
                    console.error('Error parsing thought JSON', e);
                    // Create a fallback thought with error message
                    const errorThought = {
                        timestamp,
                        segments: [{ 
                            text: `Error al procesar pensamiento: ${e.message}`, 
                            type: 'doylist', 
                            longTerm: false 
                        }]
                    };
                    pendingThoughts.push(errorThought);
                }
            } else {
                // For prompt/action/outcome, add any pending thoughts first
                if (pendingThoughts.length > 0) {
                    for (const thought of pendingThoughts) {
                        gameSequence.push({
                            type: 'thought',
                            data: thought
                        });
                    }
                    pendingThoughts = [];
                }
                
                // Then add the actual message
                gameSequence.push({
                    type: type.toLowerCase(),
                    data: {
                        timestamp,
                        content
                    }
                });
            }
        }
        
        // Add any remaining thoughts at the end
        for (const thought of pendingThoughts) {
            gameSequence.push({
                type: 'thought',
                data: thought
            });
        }
        
        // Second pass - group into steps
        const steps = [];
        let currentStep = { 
            number: 1,
            sequence: []  // Array of {type, data} objects in order
        };
        
        let lastNonThoughtType = null; // Track the last non-thought item type
        
        for (let i = 0; i < gameSequence.length; i++) {
            const item = gameSequence[i];
            
            // Special handling for thoughts that come after an outcome
            if (item.type === 'thought' && lastNonThoughtType === 'outcome') {
                // If this thought comes after an outcome, it should go in the next step
                // Save the current step
                if (currentStep.sequence.length > 0) {
                    steps.push({...currentStep});
                }
                
                // Start a new step
                currentStep = {
                    number: steps.length + 1,
                    sequence: [item]
                };
            }
            // Start a new step if we hit a prompt that follows a prompt or outcome
            else if (item.type === 'prompt' && 
                    currentStep.sequence.some(s => s.type === 'prompt' || s.type === 'outcome')) {
                steps.push({...currentStep});
                currentStep = {
                    number: steps.length + 1,
                    sequence: [item]
                };
            } else {
                // Add to current step
                currentStep.sequence.push(item);
            }
            
            // Update lastNonThoughtType if this isn't a thought
            if (item.type !== 'thought') {
                lastNonThoughtType = item.type;
            }
        }
        
        // Add the last step if it has content
        if (currentStep.sequence.length > 0) {
            steps.push(currentStep);
        }
        
        // Render each step in reverse order (latest on top)
        steps.slice().reverse().forEach(step => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step';
            
            // Step header
            const stepHeader = document.createElement('div');
            stepHeader.className = 'step-header';
            stepHeader.innerHTML = `<span>Step ${step.number}</span>`;
            stepEl.appendChild(stepHeader);
            
            // Render each item in the sequence
            const stepContent = document.createElement('div');
            stepContent.className = 'step-content';
            
            for (const item of step.sequence) {
                if (item.type === 'thought') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const thoughtEl = document.createElement('div');
                    thoughtEl.className = 'thought';
                    
                    // Render thought content from segments
                    const thoughtContent = renderSegmentsToHtml(item.data.segments);
                    
                    thoughtEl.innerHTML = `
                        <div class="thought-meta">Pensamiento: ${date} a las ${time}</div>
                        <div class="thought-content">${thoughtContent}</div>
                    `;
                    
                    stepContent.appendChild(thoughtEl);
                } else if (item.type === 'prompt') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const promptEl = document.createElement('div');
                    promptEl.className = 'prompt';
                    
                    // First linkify URLs, then preserve line breaks
                    const processedContent = preserveLineBreaks(linkifyText(item.data.content));
                    
                    promptEl.innerHTML = `
                        <strong>Prompt:</strong>
                        <div>${processedContent}</div>
                        <div class="step-meta">Publicado: ${date} a las ${time}</div>
                    `;
                    stepContent.appendChild(promptEl);
                } else if (item.type === 'action') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const actionEl = document.createElement('div');
                    actionEl.className = 'action';
                    actionEl.innerHTML = `
                        <strong>Action del Jugador:</strong>
                        <div>${item.data.content}</div>
                        <div class="step-meta">Publicado: ${date} a las ${time}</div>
                    `;
                    stepContent.appendChild(actionEl);
                } else if (item.type === 'outcome') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const outcomeEl = document.createElement('div');
                    outcomeEl.className = 'outcome';
                    outcomeEl.innerHTML = `
                        <strong>Outcome:</strong>
                        <div>${item.data.content}</div>
                        <div class="step-meta">Publicado: ${date} a las ${time}</div>
                    `;
                    stepContent.appendChild(outcomeEl);
                }
            }
            
            stepEl.appendChild(stepContent);
            gameLogDisplay.appendChild(stepEl);
        });
        
        // Scroll to bottom
        gameLogDisplay.scrollTop = gameLogDisplay.scrollHeight;
    }
    
    function renderSegmentsToHtml(segments) {
        let html = '';
        
        for (const segment of segments) {
            const classes = [];
            if (segment.type === 'watsonian') {
                classes.push('watsonian-text');
            } else if (segment.type === 'doylist') {
                classes.push('doylist-text');
            }
            
            if (segment.longTerm) {
                classes.push('longterm-text');
            }
            
            html += `<span class="${classes.join(' ')}">${escapeHtml(segment.text)}</span>`;
        }
        
        return html;
    }
    
    function renderLongTermThought(timestamp, segments) {
        const { time, date } = formatDate(timestamp);
        const thoughtEl = document.createElement('div');
        thoughtEl.className = 'longterm-thought';
        
        const thoughtContent = renderSegmentsToHtml(segments);
        
        thoughtEl.innerHTML = `
            <div class="thought-meta">Agregado: ${date} a las ${time}</div>
            <div class="thought-content">${thoughtContent}</div>
        `;
        
        longTermThoughtsContainer.appendChild(thoughtEl);
    }
    
    function renderPlayerGameLog(rows) {
        playerGameLogDisplay.innerHTML = '';
        
        if (rows.length === 0) {
            playerGameLogDisplay.innerHTML = '<div class="step"><p>La aventura todavía no ha comenzado. ¡Esperá a que el DM inicie!</p></div>';
            return;
        }
        
        // Process rows into a sequence with proper order (similar to DM view but without thoughts)
        let gameSequence = [];
        
        // First pass - filter out thoughts
        for (const row of rows) {
            if (!row || row.length < 3) continue;
            
            const [timestamp, author, type, content] = row;
            
            if (type === 'DM_THOUGHT') {
                // Skip DM thoughts for player view
                continue;
            } else {
                // Add the actual message
                gameSequence.push({
                    type: type.toLowerCase(),
                    data: {
                        timestamp,
                        content
                    }
                });
            }
        }
        
        // Second pass - group into steps
        const steps = [];
        let currentStep = { 
            number: 1,
            sequence: []  // Array of {type, data} objects in order
        };
        
        for (const item of gameSequence) {
            if (item.type === 'prompt' && currentStep.sequence.some(s => s.type === 'prompt' || s.type === 'outcome')) {
                // If we already have a prompt or outcome in this step, start a new step
                steps.push({...currentStep});
                currentStep = {
                    number: steps.length + 1,
                    sequence: [item]
                };
            } else {
                // Add to current step
                currentStep.sequence.push(item);
            }
        }
        
        // Add the last step if it has content
        if (currentStep.sequence.length > 0) {
            steps.push(currentStep);
        }
        
        // Render each step in reverse order (latest on top)
        steps.slice().reverse().forEach(step => {
            const stepEl = document.createElement('div');
            stepEl.className = 'step';
            
            // Step header
            const stepHeader = document.createElement('div');
            stepHeader.className = 'step-header';
            stepHeader.innerHTML = `<span>Step ${step.number}</span>`;
            stepEl.appendChild(stepHeader);
            
            // Render each item in the sequence
            const stepContent = document.createElement('div');
            stepContent.className = 'step-content';
            
            for (const item of step.sequence) {
                if (item.type === 'prompt') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const promptEl = document.createElement('div');
                    promptEl.className = 'prompt';
                    
                    // Process links in prompt content, then preserve line breaks
                    const processedContent = preserveLineBreaks(linkifyText(item.data.content));
                    
                    promptEl.innerHTML = `
                        <strong>Prompt:</strong>
                        <div>${processedContent}</div>
                        <div class="step-meta">Publicado: ${date} a las ${time}</div>
                    `;
                    stepContent.appendChild(promptEl);
                } else if (item.type === 'action') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const actionEl = document.createElement('div');
                    actionEl.className = 'action';
                    actionEl.innerHTML = `
                        <strong>Tu Action:</strong>
                        <div>${item.data.content}</div>
                        <div class="step-meta">Publicado: ${date} a las ${time}</div>
                    `;
                    stepContent.appendChild(actionEl);
                } else if (item.type === 'outcome') {
                    const { time, date } = formatDate(item.data.timestamp);
                    const outcomeEl = document.createElement('div');
                    outcomeEl.className = 'outcome';
                    outcomeEl.innerHTML = `
                        <strong>Outcome:</strong>
                        <div>${item.data.content}</div>
                        <div class="step-meta">Publicado: ${date} a las ${time}</div>
                    `;
                    stepContent.appendChild(outcomeEl);
                }
            }
            
            stepEl.appendChild(stepContent);
            playerGameLogDisplay.appendChild(stepEl);
        });
        
        // Scroll to bottom
        playerGameLogDisplay.scrollTop = playerGameLogDisplay.scrollHeight;
    }
    
    // Function to convert URLs to clickable links
    function linkifyText(text) {
        // First, handle markdown-style links: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, linkText, url) {
            // Make sure the URL has a protocol
            if (!url.match(/^https?:\/\//i)) {
                url = 'https://' + url;
            }
            
            // Check if it's a Spotify link
            if (url.includes('spotify.com')) {
                // Extract Spotify URI if possible
                const spotifyMatch = url.match(/\/track\/([a-zA-Z0-9]+)/);
                if (spotifyMatch && spotifyMatch[1]) {
                    const trackId = spotifyMatch[1];
                    // Return embedded Spotify player
                    return `<iframe src="https://open.spotify.com/embed/track/${trackId}" 
                        width="100%" height="80" frameborder="0" allowtransparency="true" 
                        allow="encrypted-media"></iframe>`;
                }
            }
            
            // Return a normal link with the specified link text
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        });
        
        // Then handle raw URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, function(url) {
            // Check if it's a Spotify link
            if (url.includes('spotify.com')) {
                // Extract Spotify URI if possible
                const spotifyMatch = url.match(/\/track\/([a-zA-Z0-9]+)/);
                if (spotifyMatch && spotifyMatch[1]) {
                    const trackId = spotifyMatch[1];
                    // Return embedded Spotify player
                    return `<iframe src="https://open.spotify.com/embed/track/${trackId}" 
                        width="100%" height="80" frameborder="0" allowtransparency="true" 
                        allow="encrypted-media"></iframe>`;
                }
            }
            
            // Regular link for non-Spotify URLs
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
        
        return text;
    }
    
    // Function to preserve line breaks in text
    function preserveLineBreaks(text) {
        return text.replace(/\n/g, '<br>');
    }
    
    /* ---------- EVENT LISTENERS ---------- */
    // Login buttons
    playerLoginBtn.addEventListener('click', loginAsPlayer);
    adminLoginBtn.addEventListener('click', loginAsAdmin);
    
    // Enter key for login
    playerPasswordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loginAsPlayer();
    });
    
    adminPasswordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loginAsAdmin();
    });
    
    // DM format controls
    watsonianBtn.addEventListener('click', () => {
        setDefaultThoughtType('watsonian');
        applyFormattingToSelection('watsonian');
    });
    
    doylistBtn.addEventListener('click', () => {
        setDefaultThoughtType('doylist');
        applyFormattingToSelection('doylist');
    });
    
    longtermBtn.addEventListener('click', () => {
        longtermBtn.classList.toggle('active');
        applyFormattingToSelection('longterm');
    });
    
    // Search and filter functionality
    thoughtSearchInput.addEventListener('input', filterLongTermThoughts);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setLongTermFilter(button.dataset.filter);
        });
    });
    
    // Other DM controls
    postDmMessageBtn.addEventListener('click', postDmMessage);
    refreshGameBtn.addEventListener('click', loadGameData);
    
    // Player controls
    submitPlayerActionBtn.addEventListener('click', submitPlayerAction);
    playerRefreshBtn.addEventListener('click', loadGameData);
    
    playerActionInput.addEventListener('keyup', (e) => {
        if (e.ctrlKey && e.key === 'Enter') submitPlayerAction();
    });
    
    /* ---------- INITIALIZATION ---------- */
    // Array de frases graciosas de RPGs para el placeholder
    const funnyRpgPhrases = [
        "Me tiro al barranco",
        "Me pongo la bata y el sombrero de mago",
        "Lamo el enchufe",
        "Le pego en la nuca",
        "Paso",
        "Me rasco la nariz",
        "Huyo con valentía",
        "Chequeo el tacho de basura",
        "Saco la bazooka"
    ];
    
    window.onload = async () => {
        if (typeof KJUR === 'undefined') {
            loginStatusMessage.textContent = 'CRÍTICO: La librería jsrsasign no se pudo cargar.';
            document.querySelectorAll('button').forEach(b => b.disabled = true);
            return;
        }
        
        await loadCredentials();
        
        // Establecer placeholder aleatorio para el input de action
        const playerInput = document.getElementById('playerActionInput');
        if (playerInput) {
            const randomIndex = Math.floor(Math.random() * funnyRpgPhrases.length);
            playerInput.placeholder = funnyRpgPhrases[randomIndex];
        }
        
        // Verificar si hay sesiones guardadas
        const isPlayerSaved = localStorage.getItem(STORAGE_KEY_PLAYER) === 'true';
        const isDmSaved = localStorage.getItem(STORAGE_KEY_DM) === 'true';
        
        if (isPlayerSaved) {
            // Auto-login como jugador
            loginStatusMessage.textContent = 'Restaurando sesión de jugador...';
            try {
                if (!await initialiseCredentials(playerCredentials, PLAYER_PASSWORD)) {
                    throw new Error('Error al inicializar credenciales');
                }
                
                isPlayerLoggedIn = true;
                loginContainer.style.display = 'none';
                playerMainContainer.style.display = 'block';
                playerStatusMessage.textContent = 'Sesión restaurada como Jugador.';
                
                // No logout button needed
                
                await loadGameData();
            } catch (e) {
                console.error('Error al restaurar sesión:', e);
                localStorage.removeItem(STORAGE_KEY_PLAYER);
                loginStatusMessage.textContent = 'Error al restaurar sesión. Por favor, vuelve a iniciar sesión.';
            }
        } else if (isDmSaved) {
            // Auto-login como DM
            loginStatusMessage.textContent = 'Restaurando sesión de DM...';
            try {
                if (!await initialiseCredentials(dmCredentials, DM_PASSWORD)) {
                    throw new Error('Error al inicializar credenciales');
                }
                
                isAdminLoggedIn = true;
                loginContainer.style.display = 'none';
                dmMainContainer.style.display = 'block';
                dmStatusMessage.textContent = 'Sesión restaurada como DM.';
                
                // No logout button needed
                
                await loadGameData();
                initRichTextEditor();
            } catch (e) {
                console.error('Error al restaurar sesión:', e);
                localStorage.removeItem(STORAGE_KEY_DM);
                loginStatusMessage.textContent = 'Error al restaurar sesión. Por favor, vuelve a iniciar sesión.';
            }
        } else {
            // Si no hay sesión guardada, mostrar login normal
            loginStatusMessage.textContent = '¡Bienvenido! Por favor, iniciá sesión.';
            initRichTextEditor();
        }
    };
