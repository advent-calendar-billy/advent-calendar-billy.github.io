/**
 * Config Screen
 * Handles participant name renaming and timezone configuration.
 */

class ConfigScreen {
    constructor() {
        this.participantsGrid = document.getElementById('participantsGrid');
        this.continueBtn = document.getElementById('configContinueBtn');
        this.nameMapping = {};
        this.timezoneMapping = {}; // Per-user timezone
        this.stats = null;
        this.onContinue = null;

        // Timezone options
        this.timezones = [
            { value: '-5', label: 'New York (EST)' },
            { value: '-6', label: 'Chicago (CST)' },
            { value: '-7', label: 'Denver (MST)' },
            { value: '-8', label: 'Los Angeles (PST)' },
            { value: '0', label: 'London (GMT)' },
            { value: '1', label: 'Paris/Berlin (CET)' },
            { value: '2', label: 'Athens (EET)' },
            { value: '3', label: 'Moscow (MSK)' },
            { value: '5.5', label: 'Mumbai (IST)' },
            { value: '8', label: 'Singapore (SGT)' },
            { value: '9', label: 'Tokyo (JST)' },
            { value: '10', label: 'Sydney (AEST)' },
            { value: '-3', label: 'Buenos Aires (ART)' },
            { value: '-4', label: 'Santiago (CLT)' }
        ];
    }

    /**
     * Initialize the config screen with stats
     * @param {Object} stats - The parsed chat statistics
     * @param {Function} onContinue - Callback when user clicks continue
     */
    init(stats, onContinue) {
        this.stats = stats;
        this.onContinue = onContinue;

        // Initialize name mapping and timezone mapping (default EST for all)
        this.nameMapping = {};
        this.timezoneMapping = {};
        for (const name of stats.participants) {
            this.nameMapping[name] = name;
            this.timezoneMapping[name] = -5; // Default to EST
        }

        // Render participants
        this.renderParticipants();

        // Handle continue button
        this.continueBtn.onclick = () => this.handleContinue();
    }

    /**
     * Render participant chips with timezone selectors
     */
    renderParticipants() {
        this.participantsGrid.innerHTML = '';

        for (const name of this.stats.participants) {
            const count = this.stats.messagesBySender[name] || 0;

            const chip = document.createElement('div');
            chip.className = 'participant-chip';
            chip.dataset.original = name;

            // Name row (clickable to edit)
            const nameRow = document.createElement('div');
            nameRow.className = 'participant-name-row';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'participant-name';
            nameSpan.textContent = this.nameMapping[name];

            const countSpan = document.createElement('span');
            countSpan.className = 'participant-count';
            countSpan.textContent = `(${count.toLocaleString()})`;

            nameRow.appendChild(nameSpan);
            nameRow.appendChild(countSpan);

            // Click name row to edit
            nameRow.onclick = (e) => {
                e.stopPropagation();
                this.startEditing(chip, name);
            };

            // Timezone selector
            const tzSelect = document.createElement('select');
            tzSelect.className = 'participant-timezone';
            tzSelect.onclick = (e) => e.stopPropagation(); // Don't trigger edit

            for (const tz of this.timezones) {
                const option = document.createElement('option');
                option.value = tz.value;
                option.textContent = tz.label;
                tzSelect.appendChild(option);
            }

            tzSelect.value = String(this.timezoneMapping[name]);
            tzSelect.onchange = () => {
                this.timezoneMapping[name] = parseFloat(tzSelect.value);
            };

            chip.appendChild(nameRow);
            chip.appendChild(tzSelect);

            this.participantsGrid.appendChild(chip);
        }
    }

    /**
     * Start editing a participant name
     */
    startEditing(chip, originalName) {
        const nameRow = chip.querySelector('.participant-name-row');
        // Don't create multiple inputs
        if (nameRow.querySelector('input')) return;

        chip.classList.add('editing');

        const nameSpan = nameRow.querySelector('.participant-name');
        const currentName = this.nameMapping[originalName];

        // Create input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.placeholder = originalName;

        // Replace span with input
        nameSpan.style.display = 'none';
        nameRow.insertBefore(input, nameSpan);

        input.focus();
        input.select();

        // Handle blur and enter
        const finishEditing = () => {
            const newName = input.value.trim() || originalName;
            this.nameMapping[originalName] = newName;
            nameSpan.textContent = newName;
            nameSpan.style.display = '';
            input.remove();
            chip.classList.remove('editing');
        };

        input.onblur = finishEditing;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            } else if (e.key === 'Escape') {
                input.value = currentName;
                finishEditing();
            }
        };
    }

    /**
     * Get the timezone mapping (per user)
     */
    getTimezoneMapping() {
        return { ...this.timezoneMapping };
    }

    /**
     * Get the name mapping
     */
    getNameMapping() {
        return { ...this.nameMapping };
    }

    /**
     * Recalculate night owls and early birds with per-user timezones
     */
    recalculateTimeBasedStats(stats) {
        const messages = stats.messages || [];
        const tzMapping = this.getTimezoneMapping();

        // Reset night owls and early birds
        stats.nightOwls = {};
        stats.earlyBirds = {};

        for (const msg of messages) {
            const sender = msg.sender;
            const tz = tzMapping[sender] || 0;

            // Get UTC hour and apply timezone offset
            const utcHour = msg.timestamp.getUTCHours();
            let localHour = (utcHour + tz + 24) % 24;

            // Night owls (12am-5am local time)
            if (localHour >= 0 && localHour < 5) {
                stats.nightOwls[sender] = (stats.nightOwls[sender] || 0) + 1;
            }

            // Early birds (5am-8am local time)
            if (localHour >= 5 && localHour < 8) {
                stats.earlyBirds[sender] = (stats.earlyBirds[sender] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * Apply name mapping to stats
     */
    applyNameMapping(stats) {
        const mapping = this.getNameMapping();

        // Helper to rename keys in an object
        const renameKeys = (obj) => {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const newKey = mapping[key] || key;
                result[newKey] = value;
            }
            return result;
        };

        // Apply to all sender-keyed objects
        stats.messagesBySender = renameKeys(stats.messagesBySender);
        stats.wordsBySender = renameKeys(stats.wordsBySender);
        stats.mediaBySender = renameKeys(stats.mediaBySender);
        stats.emojiBySender = renameKeys(stats.emojiBySender);
        stats.linksBySender = renameKeys(stats.linksBySender);
        stats.avgMessageLength = renameKeys(stats.avgMessageLength);
        stats.nightOwls = renameKeys(stats.nightOwls);
        stats.earlyBirds = renameKeys(stats.earlyBirds);
        stats.conversationStarters = renameKeys(stats.conversationStarters);
        stats.deletedBySender = renameKeys(stats.deletedBySender);
        stats.mediaFilesBySender = renameKeys(stats.mediaFilesBySender);
        stats.imagesBySender = renameKeys(stats.imagesBySender);
        stats.audioBySender = renameKeys(stats.audioBySender);
        stats.audioFilesBySender = renameKeys(stats.audioFilesBySender);
        stats.wordsByPerson = renameKeys(stats.wordsByPerson);
        stats.uniqueWordsByPerson = renameKeys(stats.uniqueWordsByPerson);

        // Rename participants list
        stats.participants = stats.participants.map(p => mapping[p] || p);

        // Rename in messages array
        if (stats.messages) {
            for (const msg of stats.messages) {
                msg.sender = mapping[msg.sender] || msg.sender;
            }
        }

        // Rename in longest conversation
        if (stats.longestConversation && stats.longestConversation.participants) {
            stats.longestConversation.participants = stats.longestConversation.participants
                .map(p => mapping[p] || p);
        }

        return stats;
    }

    /**
     * Handle continue button click
     */
    handleContinue() {
        if (this.onContinue) {
            // Recalculate time-based stats with per-user timezones (before name mapping)
            this.recalculateTimeBasedStats(this.stats);

            // Apply name mapping to stats
            const updatedStats = this.applyNameMapping(this.stats);

            // Also apply name mapping to timezone mapping
            const nameMapping = this.getNameMapping();
            const tzMapping = {};
            for (const [originalName, tz] of Object.entries(this.timezoneMapping)) {
                const newName = nameMapping[originalName] || originalName;
                tzMapping[newName] = tz;
            }
            updatedStats.timezoneMapping = tzMapping;

            this.onContinue(updatedStats);
        }
    }
}

// Export for use
window.ConfigScreen = ConfigScreen;
