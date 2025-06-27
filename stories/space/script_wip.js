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
                    
                    // Check if this is Step 66 and cat game was won
                    let displayContent = item.data.content;
                    if (step.number === 66 && catGameWon && displayContent.includes('Y entonces intentaste aterrizar la cosa')) {
                        displayContent = 'Y entonces aterrizaste la cosa.';
                    }
                    
                    // Process links in prompt content, then preserve line breaks
                    const processedContent = preserveLineBreaks(linkifyText(displayContent));
                    
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
        
        // Check if we should trigger cat game
        console.log('🐱 Cat Game: Checking if should trigger...');
        if (shouldTriggerCatGame(steps)) {
            showCatGame();
        } else {
            console.log('🐱 Cat Game: Not triggering');
        }
        
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

    /* ---------- CAT GAME INTEGRATION ---------- */
    
    // Cat game global state
    let catGameWon = localStorage.getItem('catGameWon') === 'true';
    let currentStepNumber = 0;
    
    console.log('🐱 Cat Game: Initialization Debug:', {
        localStorage_catGameWon: localStorage.getItem('catGameWon'),
        localStorage_catGameWon_type: typeof localStorage.getItem('catGameWon'),
        catGameWon_variable: catGameWon,
        all_localStorage_keys: Object.keys(localStorage),
        all_localStorage: {...localStorage}
    });
    
    // Cat game variables
    let canvas, ctx;
    let gameRunning = false;
    let gameOver = false;
    let gameWon = false;
    
    // Game constants
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 500;
    const CHAR_WIDTH = 10;
    const CHAR_HEIGHT = 20;
    const GRAVITY = 0.02;
    const THRUST_POWER = 0.08;
    const MAX_SAFE_LANDING_SPEED = 1.0;
    const INITIAL_FUEL = 100;
    const FUEL_CONSUMPTION = 0.2;
    const WIND_EFFECT = 0.01;
    
    // Pod state
    let pod = {
        x: CANVAS_WIDTH / 2,
        y: 50,
        vx: 0,
        vy: 0,
        fuel: INITIAL_FUEL,
        thrustDir: null
    };
    
    // Cat state
    let catExpression = 'normal';
    
    // Obstacles
    let obstacles = [];
    let debrisStack = [];
    let wallSegments = [];
    
    // Input state
    const keys = {};
    
    // Debris types
    const debrisTypes = [
        { 
            name: 'large_mess',
            pattern: [' ¤*°•.· ', '·~#@§%~·', ' >¤<*>¤< ', '·°•*°•· '],
            speedX: 0.6,
            speedY: 0,
            width: 80,
            height: 4,
            movement: 'horizontal'
        },
        { 
            name: 'diagonal_flow',
            pattern: ['~~»»→', ' ~»→~»', '  »~→»~'],
            speedX: 0.8,
            speedY: 0.4,
            width: 60,
            height: 3,
            movement: 'diagonal'
        },
        { 
            name: 'falling_swirl',
            pattern: ['§@§@§', '@§@§@'],
            speedX: 0.5,
            speedY: 0.6,
            width: 50,
            height: 2,
            movement: 'diagonal'
        },
        { 
            name: 'fast_scatter',
            pattern: ['°*°*°*°', '*°*°*°*'],
            speedX: 1.2,
            speedY: 0,
            width: 50,
            height: 2,
            movement: 'horizontal'
        },
        { 
            name: 'blob',
            pattern: [' %¤#¤% ', '#%¤@¤%#', '%#¤%¤#%'],
            speedX: 0.7,
            speedY: 0,
            width: 70,
            height: 3,
            movement: 'horizontal'
        },
        { 
            name: 'sinking_debris',
            pattern: ['>•<>•<', '•<>•<>'],
            speedX: 0.6,
            speedY: 0.5,
            width: 60,
            height: 2,
            movement: 'diagonal'
        },
        { 
            name: 'rocket_fast',
            pattern: ['»»→→»»'],
            speedX: 1.8,
            speedY: 0,
            width: 60,
            height: 1,
            movement: 'horizontal'
        }
    ];
    
    // Function to check if we should trigger cat game
    function shouldTriggerCatGame(steps) {
        // Find the current (latest) step
        if (steps.length === 0) {
            console.log('🐱 Cat Game Debug: No steps found');
            return false;
        }
        
        const latestStep = steps[steps.length - 1];
        currentStepNumber = latestStep.number;
        
        // Check if Step 65 is complete by looking at its sequence
        let step65Complete = false;
        if (currentStepNumber === 65) {
            // Look for the pattern: prompt -> action -> outcome in Step 65
            const hasPrompt = latestStep.sequence.some(s => s.type === 'prompt');
            const hasAction = latestStep.sequence.some(s => s.type === 'action');
            const hasOutcome = latestStep.sequence.some(s => s.type === 'outcome');
            
            step65Complete = hasPrompt && hasAction && hasOutcome;
            
            console.log('🐱 Cat Game Debug - Step 65 Analysis:', {
                hasPrompt,
                hasAction, 
                hasOutcome,
                step65Complete,
                stepSequence: latestStep.sequence.map(s => s.type)
            });
        }
        
        console.log('🐱 Cat Game Debug:', {
            currentStepNumber,
            isPlayerTurn,
            catGameWon,
            catGameWon_type: typeof catGameWon,
            localStorage_catGameWon: localStorage.getItem('catGameWon'),
            step65Complete,
            stepsLength: steps.length,
            latestStepSequence: latestStep.sequence.map(s => ({type: s.type, content: s.data.content?.substring(0, 50) + '...'}))
        });
        
        // Check if we should trigger:
        // 1. Step 65 is complete (has prompt + action + outcome) and game hasn't been won
        // 2. OR we're at step 66 and it's player's turn and game hasn't been won
        const readyForStep66 = (currentStepNumber === 65 && step65Complete && !catGameWon);
        const atStep66 = (currentStepNumber === 66 && isPlayerTurn && !catGameWon);
        
        const shouldTrigger = readyForStep66 || atStep66;
        
        console.log('🐱 Cat Game Debug - Decision:', {
            readyForStep66,
            atStep66,
            shouldTrigger
        });
        
        return shouldTrigger;
    }
    
    // Function to show/hide cat game
    function showCatGame() {
        console.log('🐱 Cat Game: Showing cat game!');
        document.getElementById('catGameContainer').style.display = 'flex';
        document.getElementById('playerInputControls').style.display = 'none';
        
        // Initialize canvas
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // Show start screen
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        
        console.log('🐱 Cat Game: UI elements updated');
    }
    
    function hideCatGame() {
        document.getElementById('catGameContainer').style.display = 'none';
        document.getElementById('playerInputControls').style.display = 'block';
    }
    
    // Cat can only count 0-4
    function catNumber(n) {
        const digits = n.toString().split('');
        return digits.map(d => {
            const num = parseInt(d);
            if (num >= 0 && num <= 4) return d;
            // Use weird symbols for numbers the cat doesn't know
            const weirdDigits = {
                '5': '§',
                '6': '¤',
                '7': '¿',
                '8': '∞',
                '9': '¶'
            };
            return weirdDigits[d] || '?';
        }).join('');
    }
    
    function drawText(text, x, y, color = '#f0f0f0') {
        ctx.fillStyle = color;
        ctx.font = '16px Courier New';
        ctx.fillText(text, x, y);
    }
    
    function clearScreen() {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    function drawBorder() {
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 2;
        
        // Top border with fuel and altitude
        drawText('Nafta: ' + '▓'.repeat(Math.floor(pod.fuel / 10)) + '░'.repeat(10 - Math.floor(pod.fuel / 10)), 20, 25);
        const realHeight = Math.max(0, Math.floor((CANVAS_HEIGHT - pod.y - 80) / 30));
        const catHeight = catNumber(realHeight);
        drawText(`▪▪▪  ${catHeight}m`, CANVAS_WIDTH - 120, 25);
        
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(CANVAS_WIDTH, 40);
        ctx.stroke();
    }
    
    function drawPod() {
        const podX = Math.floor(pod.x / CHAR_WIDTH) * CHAR_WIDTH;
        const podY = Math.floor(pod.y / CHAR_HEIGHT) * CHAR_HEIGHT;
        
        // Draw pod
        drawText('╔═══╗', podX - 25, podY);
        drawText('║   ║', podX - 25, podY + CHAR_HEIGHT);
        drawText('╚═══╝', podX - 25, podY + CHAR_HEIGHT * 2);
        
        // Draw thrust
        if (pod.thrustDir && pod.fuel > 0) {
            switch(pod.thrustDir) {
                case 'left':
                    drawText('|||>', podX + 25, podY + CHAR_HEIGHT);
                    break;
                case 'right':
                    drawText('<|||', podX - 55, podY + CHAR_HEIGHT);
                    break;
                case 'up':
                    drawText('vvv', podX - 15, podY + CHAR_HEIGHT * 3);
                    break;
                case 'down':
                    drawText('^^^', podX - 15, podY - CHAR_HEIGHT);
                    break;
            }
        }
    }
    
    function getCatExpression() {
        if (pod.fuel < 20) return 'stressed';
        if (Math.abs(pod.vx) > 3 || pod.vy > 3) return 'stressed';
        if (pod.y > CANVAS_HEIGHT - 100 && pod.vy < MAX_SAFE_LANDING_SPEED) return 'happy';
        return 'normal';
    }
    
    function drawCockpit() {
        const cockpitX = 20;
        const cockpitY = CANVAS_HEIGHT - 180;
        
        // Draw cockpit border - like a window frame
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 3;
        ctx.strokeRect(cockpitX, cockpitY, 150, 100);
        // Window cross
        ctx.beginPath();
        ctx.moveTo(cockpitX + 75, cockpitY);
        ctx.lineTo(cockpitX + 75, cockpitY + 100);
        ctx.moveTo(cockpitX, cockpitY + 50);
        ctx.lineTo(cockpitX + 150, cockpitY + 50);
        ctx.stroke();
        ctx.lineWidth = 2;
        
        // Draw cat
        const catX = cockpitX + 30;
        const catY = cockpitY + 20;
        
        drawText('  /\\_/\\', catX, catY);
        
        // Draw expression based on state
        catExpression = getCatExpression();
        switch(catExpression) {
            case 'stressed':
                drawText(' ( O.O )', catX, catY + CHAR_HEIGHT);
                drawText('  >|||<', catX, catY + CHAR_HEIGHT * 2);
                break;
            case 'happy':
                drawText(' ( ^.^ )', catX, catY + CHAR_HEIGHT);
                drawText('  > v <', catX, catY + CHAR_HEIGHT * 2);
                break;
            default:
                drawText(' ( o.o )', catX, catY + CHAR_HEIGHT);
                drawText('  > ^ <', catX, catY + CHAR_HEIGHT * 2);
        }
        
        drawText(' ╱ | ╲', catX, catY + CHAR_HEIGHT * 3);
    }
    
    function drawGround() {
        const groundY = CANVAS_HEIGHT - 40;
        const groundPattern = '▓'.repeat(60);
        drawText(groundPattern, 0, groundY, '#654321');
        drawText('═'.repeat(60), 0, groundY - 15, '#8B7355');
        
        // Landing pad - like a rug
        drawText('[≡≡≡≡≡≡≡≡≡≡≡≡]', CANVAS_WIDTH/2 - 65, groundY - 10, '#D2691E');
    }
    
    function createObstacle() {
        if (Math.random() < 0.018 && obstacles.length < 4) {
            const debris = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
            
            obstacles.push({
                x: -debris.width, // Always from left
                y: 60 + Math.random() * (CANVAS_HEIGHT - 200 - debris.height * CHAR_HEIGHT),
                speedX: debris.speedX,
                speedY: debris.speedY || 0,
                pattern: debris.pattern,
                width: debris.width,
                height: debris.height,
                movement: debris.movement
            });
        }
    }
    
    function updateObstacles() {
        obstacles.forEach(obs => {
            obs.x += obs.speedX;
            if (obs.speedY) {
                obs.y += obs.speedY;
            }
            
            // If debris reaches right edge, stop it and add to clutter
            if (obs.x >= CANVAS_WIDTH - obs.width - 30) {
                obs.x = CANVAS_WIDTH - obs.width - 30; // Stop at edge
                obs.speedX = 0;
                obs.speedY = 0;
                obs.cluttered = true;
                
                // Add to static debris pile
                debrisStack.push({
                    pattern: obs.pattern,
                    x: obs.x,
                    y: obs.y,
                    width: obs.width,
                    height: obs.height * CHAR_HEIGHT,
                    cluttered: true
                });
            }
            
            // If debris reaches bottom, stop it
            if (obs.y >= CANVAS_HEIGHT - 100) {
                obs.y = CANVAS_HEIGHT - 100;
                obs.speedX = 0;
                obs.speedY = 0;
                obs.cluttered = true;
            }
        });
        
        // Remove debris that became cluttered
        obstacles = obstacles.filter(obs => !obs.cluttered && obs.x > -100);
    }
    
    function drawObstacles() {
        // Draw moving obstacles
        obstacles.forEach(obs => {
            obs.pattern.forEach((line, i) => {
                drawText(line, obs.x, obs.y + i * CHAR_HEIGHT);
            });
        });
        
        // Draw cluttered debris pile
        ctx.save();
        ctx.globalAlpha = 0.8;
        debrisStack.forEach((debris) => {
            debris.pattern.forEach((line, i) => {
                drawText(line, debris.x, debris.y + i * CHAR_HEIGHT, '#996633');
            });
        });
        ctx.restore();
    }
    
    function checkCollisions() {
        // Ground collision - more forgiving
        if (pod.y >= CANVAS_HEIGHT - 85) {
            // Check if landing on the rug/landing pad
            const onLandingPad = pod.x > CANVAS_WIDTH/2 - 70 && pod.x < CANVAS_WIDTH/2 + 70;
            
            if (onLandingPad && Math.abs(pod.vy) <= MAX_SAFE_LANDING_SPEED * 1.5) {
                gameOver = true;
                gameWon = true;
            } else if (Math.abs(pod.vy) > MAX_SAFE_LANDING_SPEED) {
                gameOver = true;
                gameWon = false;
            } else {
                gameOver = true;
                gameWon = true;
            }
            return;
        }
        
        // Obstacle collision (moving debris)
        obstacles.forEach(obs => {
            const obsHeight = obs.height * CHAR_HEIGHT;
            if (pod.x > obs.x - 30 && pod.x < obs.x + obs.width &&
                pod.y > obs.y - 40 && pod.y < obs.y + obsHeight) {
                gameOver = true;
                gameWon = false;
            }
        });
        
        // Collision with stacked debris (deadly like Tetris blocks)
        debrisStack.forEach(debris => {
            if (pod.x > debris.x - 30 && pod.x < debris.x + debris.width &&
                pod.y > debris.y - 40 && pod.y < debris.y + debris.height) {
                gameOver = true;
                gameWon = false;
            }
        });
    }
    
    function updatePhysics() {
        // Apply gravity
        pod.vy += GRAVITY;
        
        // Apply thrust - only while key is held
        pod.thrustDir = null;
        if (pod.fuel > 0) {
            if (keys['ArrowLeft']) {
                pod.vx -= THRUST_POWER;
                pod.fuel -= FUEL_CONSUMPTION;
                pod.thrustDir = 'left';
            }
            if (keys['ArrowRight']) {
                pod.vx += THRUST_POWER;
                pod.fuel -= FUEL_CONSUMPTION;
                pod.thrustDir = 'right';
            }
            if (keys['ArrowUp']) {
                pod.vy -= THRUST_POWER * 2; // More power upward to fight gravity
                pod.fuel -= FUEL_CONSUMPTION;
                pod.thrustDir = 'up';
            }
        }
        
        // Apply wind effect
        pod.vx += (Math.random() - 0.5) * WIND_EFFECT;
        
        // Update position
        pod.x += pod.vx;
        pod.y += pod.vy;
        
        // Boundaries
        pod.x = Math.max(50, Math.min(CANVAS_WIDTH - 50, pod.x));
        
        // Clamp fuel
        pod.fuel = Math.max(0, pod.fuel);
        
        // Friction
        pod.vx *= 0.99;
    }
    
    // Initialize wall segments once
    function initWall() {
        wallSegments = [];
        for (let y = 40; y < CANVAS_HEIGHT - 40; y += 20) {
            if (Math.random() > 0.3) {
                wallSegments.push(y);
            }
        }
    }
    
    function drawBrokenWall() {
        // Draw broken wall on the left
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 3;
        
        // Draw wall segments
        wallSegments.forEach(y => {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(0, y + 15);
            ctx.stroke();
        });
        
        // Draw vertical wall edge
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, CANVAS_HEIGHT - 40);
        ctx.stroke();
        
        // Broken pieces
        drawText('▓▓', 5, 100, '#654321');
        drawText('░░', 8, 150, '#8B7355');
        drawText('▓', 3, 200, '#654321');
        drawText('▓▓', 6, 250, '#654321');
        drawText('░', 10, 300, '#8B7355');
        
        // Wind effect indicator
        drawText('>>>', 15, 120, '#666');
        drawText('>>>', 20, 180, '#666');
        drawText('>>>', 18, 240, '#666');
    }
    
    function catGameLoop() {
        if (!gameRunning) return;
        
        clearScreen();
        drawBorder();
        drawBrokenWall();
        drawGround();
        
        if (!gameOver) {
            updatePhysics();
            createObstacle();
            updateObstacles();
            checkCollisions();
        }
        
        drawObstacles();
        drawPod();
        drawCockpit();
        
        if (gameOver) {
            endCatGame();
        } else {
            requestAnimationFrame(catGameLoop);
        }
    }
    
    function startCatGame() {
        console.log('🐱 Cat Game: Starting game! Current catGameWon:', catGameWon);
        document.getElementById('startScreen').style.display = 'none';
        gameRunning = true;
        gameOver = false;
        gameWon = false;
        
        // Reset pod
        pod = {
            x: CANVAS_WIDTH / 2,
            y: 50,
            vx: 0,
            vy: 0,
            fuel: INITIAL_FUEL,
            thrustDir: null
        };
        
        obstacles = [];
        debrisStack = [];
        initWall();
        
        catGameLoop();
    }
    
    function endCatGame() {
        gameRunning = false;
        
        const endCat = document.getElementById('endCat');
        const message = document.getElementById('gameOverMessage');
        const button = document.getElementById('gameOverButton');
        
        if (gameWon) {
            console.log('🐱 Cat Game: Player won! Setting up win screen');
            endCat.innerHTML = `  /\\_/\\
 ( ^.^ )
  > v <
 ╱ | ╲`;
            message.textContent = 'Puf!';
            
            if (button) {
                button.textContent = 'FESTEJAR!';
                button.onclick = () => {
                    console.log('🐱 Cat Game: FESTEJAR button clicked!');
                    hideCatGame();
                    // No reset, just celebrate and close
                };
                console.log('🐱 Cat Game: Button updated to:', button.textContent);
            } else {
                console.error('🐱 Cat Game: Could not find gameOverButton element!');
            }
            
            // Set the win state and handle integration
            setTimeout(() => {
                catGameWon = true;
                hideCatGame();
                handleCatGameWin();
            }, 2000);
        } else {
            endCat.innerHTML = `  /\\_/\\
 ( x.x )
  > _ <
 ╱ | ╲`;
            message.textContent = pod.fuel <= 0 ? 'Sin nafta... ¿Qué va a decir mamá?' : '¿Qué va a decir mamá?';
            button.textContent = 'REINTENTAR';
            button.onclick = resetCatGame;
        }
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    function resetCatGame() {
        document.getElementById('gameOverScreen').style.display = 'none';
        startCatGame();
    }
    
    // Handle cat game win - update Step 66 prompt
    async function handleCatGameWin() {
        console.log('🐱 Cat Game: Handling win - posting Step 66 prompt to sheet');
        console.log('🐱 Cat Game: Current auth state - isPlayerLoggedIn:', isPlayerLoggedIn);
        
        // Store the win state
        localStorage.setItem('catGameWon', 'true');
        catGameWon = true;
        
        try {
            // Check if we have proper authentication
            if (!isPlayerLoggedIn) {
                throw new Error('Player not logged in - cannot post to sheet');
            }
            
            // Post the new Step 66 prompt to the Google Sheet
            const timestamp = new Date().toISOString();
            const step66Prompt = 'Y entonces aterrizaste la cosa.';
            
            console.log('🐱 Cat Game: Posting to sheet with data:', [timestamp, 'DM', 'PROMPT', step66Prompt, null]);
            
            await appendToSheet([[timestamp, 'DM', 'PROMPT', step66Prompt, null]]);
            console.log('🐱 Cat Game: Successfully posted Step 66 prompt to sheet');
            
            // Refresh the game data to show the new prompt
            await loadGameData();
        } catch (error) {
            console.error('🐱 Cat Game: Error posting Step 66 prompt:', error);
            console.error('🐱 Cat Game: Full error details:', {
                message: error.message,
                stack: error.stack,
                serviceAccountCredentials: !!serviceAccountCredentials,
                accessToken: !!accessToken
            });
            // Still refresh to show the local update
            await loadGameData();
        }
    }
    
    // Input handling for cat game
    window.addEventListener('keydown', (e) => {
        if (document.getElementById('catGameContainer').style.display === 'flex') {
            keys[e.key] = true;
            e.preventDefault(); // Prevent scrolling, etc.
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (document.getElementById('catGameContainer').style.display === 'flex') {
            keys[e.key] = false;
            e.preventDefault();
        }
    });
    
    // Make functions global so they can be called from HTML
    window.startCatGame = startCatGame;
    window.resetCatGame = resetCatGame;
    
    // Debug function to reset cat game win state (for testing)
    window.resetCatGameWinState = function() {
        localStorage.removeItem('catGameWon');
        localStorage.clear(); // Clear all localStorage just to be safe
        catGameWon = false;
        console.log('🐱 Cat Game: Win state reset! catGameWon is now:', catGameWon);
        console.log('🐱 Cat Game: localStorage cleared, reloading page...');
        // Force reload to ensure clean state
        location.reload();
        return 'Cat game win state reset! Page reloading...';
    };
    
    // Even more aggressive reset
    window.hardResetCatGame = function() {
        console.log('🐱 Cat Game: HARD RESET - clearing everything');
        localStorage.clear();
        sessionStorage.clear();
        window.catGameWon = false;
        location.reload();
    };
