/**
 * WhatsApp Chat Parser
 * Parses WhatsApp exported chat files and extracts message data.
 */

class ChatParser {
    constructor() {
        // Common English and Spanish stop words to filter out
        this.stopWords = new Set([
            // English
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
            'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
            'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
            'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
            'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
            'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'did', 'does',
            'am', 'im', "i'm", "don't", "didn't", "won't", "can't", "it's", "that's",
            'ok', 'okay', 'yes', 'yeah', 'yep', 'yea', 'no', 'nope', 'nah',
            'lol', 'haha', 'hahaha', 'hahahaha', 'lmao', 'lmfao', 'omg', 'wtf',
            'hey', 'hi', 'hello', 'bye', 'thanks', 'thank', 'please', 'sorry',
            'omitted', 'media', 'https', 'http', 'www', 'com', 'org',
            'this', 'message', 'was', 'deleted', 'attached', 'file', 'edited',
            'sharing', 'shared', 'image', 'video', 'audio', 'document', 'sticker',
            'gif', 'contact', 'location', 'live',
            // Spanish
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del',
            'al', 'en', 'que', 'y', 'es', 'se', 'lo', 'por', 'con', 'para',
            'su', 'sus', 'le', 'les', 'te', 'me', 'nos', 'ya', 'si', 'pero',
            'como', 'más', 'mas', 'muy', 'sin', 'sobre', 'ser', 'hay', 'está',
            'son', 'está', 'están', 'fue', 'era', 'han', 'sido', 'tiene', 'tiene',
            'todo', 'todos', 'toda', 'todas', 'uno', 'otro', 'otra', 'otros', 'otras',
            'este', 'esta', 'esto', 'estos', 'estas', 'ese', 'esa', 'eso', 'esos', 'esas',
            'mi', 'mis', 'tu', 'tus', 'nuestro', 'nuestra', 'nuestros', 'nuestras',
            'yo', 'tú', 'él', 'ella', 'nosotros', 'ellos', 'ellas', 'usted', 'ustedes',
            'qué', 'quién', 'cuál', 'cuándo', 'dónde', 'cómo', 'cuánto', 'porque',
            'bien', 'bueno', 'buena', 'mal', 'malo', 'mala', 'mucho', 'mucha', 'muchos', 'muchas',
            'poco', 'poca', 'pocos', 'pocas', 'algo', 'nada', 'nadie', 'alguien',
            'ahora', 'hoy', 'ayer', 'mañana', 'siempre', 'nunca', 'aquí', 'allí', 'acá', 'allá',
            'hacer', 'hago', 'haces', 'hace', 'hacemos', 'hacen', 'hecho',
            'ir', 'voy', 'vas', 'va', 'vamos', 'van', 'ido', 'venir', 'vengo', 'viene', 'vienen',
            'tener', 'tengo', 'tienes', 'tenemos', 'tienen', 'tenido',
            'poder', 'puedo', 'puede', 'pueden', 'podemos', 'querer', 'quiero', 'quiere', 'quieren',
            'saber', 'sé', 'sabes', 'sabe', 'sabemos', 'saben', 'ver', 'veo', 'ves', 'vemos', 'ven',
            'decir', 'digo', 'dice', 'dicen', 'dicho', 'dar', 'doy', 'das', 'da', 'dan',
            'sí', 'no', 'tal', 'vez', 'así', 'solo', 'sólo', 'cada', 'mismo', 'misma',
            'entre', 'desde', 'hasta', 'durante', 'según', 'hacia', 'tras', 'ante',
            'jaja', 'jajaja', 'jajajaja', 'jeje', 'jejeje', 'ajaj', 'dale', 'bueno',
            'hola', 'chau', 'gracias', 'perdón', 'perdona', 'disculpa',
            'ahi', 'ahí', 'che', 'eso', 'esa', 'ese', 'vos', 'sos', 'estás', 'está'
        ]);

        // URL parameter fragments to filter
        this.urlParams = new Set([
            'mibextid', 'wwxifr', 'gasearch', 'source', 'fbclid', 'utm', 'ref', 'share',
            'thefork', 'utm_source', 'utm_medium', 'utm_campaign', 'si', 'igsh'
        ]);

        // Regex patterns - supports both formats:
        // Format 1: [1/12/24, 05:09:19] Sender: Message (bracketed, with seconds)
        // Format 2: 1/12/24, 05:09 AM - Sender: Message (no brackets, AM/PM)
        this.messagePatternBracketed = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?)\]\s*([^:]+):\s*(.*)$/;
        this.messagePatternDash = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?\s*-\s*([^:]+):\s*(.*)$/;
        this.emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}\u{1F1E0}-\u{1F1FF}]/gu;
        this.urlPattern = /https?:\/\/\S+|www\.\S+/gi;
    }

    /**
     * Parse WhatsApp chat content
     * @param {string} content - Raw chat text content
     * @param {number} yearFilter - Year to filter messages (e.g., 2025)
     * @param {Function} progressCallback - Callback for progress updates
     * @returns {Object} - Parsed stats object
     */
    parse(content, yearFilter = null, progressCallback = null) {
        const lines = content.split('\n');
        const messages = [];
        const stats = this.initStats();

        // DEBUG: Log content info
        console.log('=== CHAT PARSER DEBUG ===');
        console.log('Content length:', content.length);
        console.log('Number of lines:', lines.length);
        console.log('Year filter:', yearFilter);
        console.log('First 500 chars of content:', content.substring(0, 500));
        console.log('First 10 lines:');
        lines.slice(0, 10).forEach((line, i) => console.log(`  Line ${i}: "${line}"`));

        let currentMessage = null;
        const totalLines = lines.length;

        // Word tracking
        const wordCounts = {};
        const emojiCounts = {};
        const wordsByPerson = {};

        // DEBUG: Track parsing stats
        let linesChecked = 0;
        let regexMatches = 0;
        let yearFiltered = 0;
        let systemSkipped = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            linesChecked++;

            // Report progress every 1000 lines
            if (progressCallback && i % 1000 === 0) {
                progressCallback({
                    phase: 'parsing',
                    progress: Math.round((i / totalLines) * 50),
                    detail: `Parsing line ${i.toLocaleString()} of ${totalLines.toLocaleString()}`
                });
            }

            // Try both patterns
            let match = line.match(this.messagePatternBracketed);
            let isBracketed = true;
            if (!match) {
                match = line.match(this.messagePatternDash);
                isBracketed = false;
            }

            // DEBUG: Log first 5 lines regex results
            if (i < 5) {
                console.log(`Line ${i} regex match:`, match ? (isBracketed ? 'YES (bracketed)' : 'YES (dash)') : 'NO', '| Line:', line.substring(0, 100));
            }

            if (match) {
                regexMatches++;
                // Save previous message
                if (currentMessage) {
                    messages.push(currentMessage);
                }

                // Extract fields based on format
                let dateStr, timeStr, ampm, sender, content;
                if (isBracketed) {
                    // Bracketed format: [date, time] sender: message (no AM/PM)
                    [, dateStr, timeStr, sender, content] = match;
                    ampm = null;
                } else {
                    // Dash format: date, time AM/PM - sender: message
                    [, dateStr, timeStr, ampm, sender, content] = match;
                }

                // DEBUG: Log first few matches
                if (regexMatches <= 3) {
                    console.log(`Match #${regexMatches}: date="${dateStr}" time="${timeStr}" ampm="${ampm}" sender="${sender}"`);
                }

                // Parse date
                const timestamp = this.parseDateTime(dateStr, timeStr, ampm);
                if (!timestamp) {
                    if (regexMatches <= 3) console.log('  -> Failed to parse datetime');
                    currentMessage = null;
                    continue;
                }

                // DEBUG: Log parsed timestamp
                if (regexMatches <= 3) {
                    console.log(`  -> Parsed timestamp: ${timestamp.toISOString()}, year: ${timestamp.getFullYear()}`);
                }

                // Filter by year if specified
                if (yearFilter && timestamp.getFullYear() !== yearFilter) {
                    yearFiltered++;
                    currentMessage = null;
                    continue;
                }

                // Set detected year from accepted messages
                if (!stats.detectedYear) {
                    stats.detectedYear = yearFilter || timestamp.getFullYear();
                }

                const senderName = sender.trim();

                // Skip system messages
                if (senderName.toLowerCase().includes('meta ai') ||
                    senderName.toLowerCase().includes('messages and calls are end-to-end encrypted')) {
                    systemSkipped++;
                    currentMessage = null;
                    continue;
                }

                // Check for deleted messages
                const isDeleted = content.toLowerCase().includes('this message was deleted') ||
                                  content.toLowerCase().includes('you deleted this message');

                // Check for media
                const isMedia = content.includes('<Media omitted>') ||
                                content.toLowerCase().includes('omitted') ||
                                content.toLowerCase().includes('(file attached)');

                // Extract media filename
                let mediaFilename = null;
                if (content.toLowerCase().includes('(file attached)')) {
                    const mediaMatch = content.match(/^(.+?)\s*\(file attached\)/i);
                    if (mediaMatch) {
                        mediaFilename = mediaMatch[1].trim();
                    }
                }

                // Check for emojis
                const emojis = content.match(this.emojiPattern) || [];
                const hasEmoji = emojis.length > 0;

                // Count individual emojis
                for (const emoji of emojis) {
                    emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
                }

                // Check for links
                const links = content.match(this.urlPattern) || [];
                const hasLink = links.length > 0;

                // Word count
                let wordCount = 0;
                if (!isMedia && !isDeleted) {
                    const words = this.extractWords(content);
                    wordCount = words.length;

                    // Track words
                    if (!wordsByPerson[senderName]) {
                        wordsByPerson[senderName] = {};
                    }
                    for (const word of words) {
                        if (!this.stopWords.has(word) && word.length > 2 && !this.isGibberish(word)) {
                            wordCounts[word] = (wordCounts[word] || 0) + 1;
                            wordsByPerson[senderName][word] = (wordsByPerson[senderName][word] || 0) + 1;
                        }
                    }
                }

                currentMessage = {
                    timestamp,
                    sender: senderName,
                    content,
                    isMedia,
                    isDeleted,
                    hasEmoji,
                    hasLink,
                    wordCount,
                    mediaFilename
                };
            } else if (currentMessage) {
                // Continuation of previous message
                currentMessage.content += '\n' + line;
                if (!currentMessage.isMedia && !currentMessage.isDeleted) {
                    const words = this.extractWords(line);
                    currentMessage.wordCount += words.length;
                    for (const word of words) {
                        if (!this.stopWords.has(word) && word.length > 2 && !this.isGibberish(word)) {
                            wordCounts[word] = (wordCounts[word] || 0) + 1;
                            if (!wordsByPerson[currentMessage.sender]) {
                                wordsByPerson[currentMessage.sender] = {};
                            }
                            wordsByPerson[currentMessage.sender][word] =
                                (wordsByPerson[currentMessage.sender][word] || 0) + 1;
                        }
                    }
                }
            }
        }

        // Don't forget the last message
        if (currentMessage) {
            messages.push(currentMessage);
        }

        // DEBUG: Summary
        console.log('=== PARSING SUMMARY ===');
        console.log('Lines checked:', linesChecked);
        console.log('Regex matches:', regexMatches);
        console.log('Year filtered out:', yearFiltered);
        console.log('System messages skipped:', systemSkipped);
        console.log('Final messages count:', messages.length);
        console.log('Detected year:', stats.detectedYear);

        // Calculate statistics
        if (progressCallback) {
            progressCallback({
                phase: 'analyzing',
                progress: 55,
                detail: 'Calculating statistics...'
            });
        }

        this.calculateStats(messages, stats, wordCounts, emojiCounts, wordsByPerson);

        return stats;
    }

    initStats() {
        return {
            totalMessages: 0,
            totalWords: 0,
            mediaCount: 0,
            linkCount: 0,
            emojiCount: 0,
            messagesBySender: {},
            wordsBySender: {},
            mediaBySender: {},
            messagesByHour: {},
            messagesByDay: {},
            messagesByMonth: {},
            messagesByDate: {},
            messagesByDatetime: {},
            firstMessageDate: null,
            lastMessageDate: null,
            topWords: {},
            topEmojis: {},
            rareEmojis: {},
            wordsByPerson: {},
            emojiBySender: {},
            linksBySender: {},
            avgMessageLength: {},
            nightOwls: {},
            earlyBirds: {},
            conversationStarters: {},
            deletedBySender: {},
            mediaFiles: [],
            mediaFilesBySender: {},
            imagesBySender: {},
            audioBySender: {},
            audioFilesBySender: {},
            mostActiveDay: '',
            mostActiveHour: 0,
            mostActiveDate: '',
            peakHourDatetime: '',
            uniqueWordsByPerson: {},
            longestConversation: {},
            participants: [],
            detectedYear: null,
            messages: [] // Keep raw messages for busiest day display
        };
    }

    parseDateTime(dateStr, timeStr, ampm) {
        try {
            const dateParts = dateStr.split('/');
            let month, day, year;

            if (dateParts.length === 3) {
                month = parseInt(dateParts[0], 10);
                day = parseInt(dateParts[1], 10);
                year = parseInt(dateParts[2], 10);

                // Handle 2-digit years
                if (year < 100) {
                    year += 2000;
                }
            } else {
                return null;
            }

            const timeParts = timeStr.split(':');
            let hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);

            // Handle AM/PM
            if (ampm) {
                const isPM = ampm.toUpperCase() === 'PM';
                if (isPM && hours !== 12) {
                    hours += 12;
                } else if (!isPM && hours === 12) {
                    hours = 0;
                }
            }

            return new Date(year, month - 1, day, hours, minutes);
        } catch (e) {
            return null;
        }
    }

    extractWords(text) {
        // Remove URLs first
        text = text.replace(this.urlPattern, '');
        // Extract words
        const matches = text.toLowerCase().match(/\b[a-zA-Z'\u00C0-\u024F]+\b/g) || [];
        return matches.filter(w => w.length >= 2);
    }

    isGibberish(word) {
        // Filter out URL parameters and gibberish
        if (this.urlParams.has(word.toLowerCase())) return true;
        if (/\d/.test(word)) return true; // Contains numbers
        if (word.length < 2 || word.length > 20) return true;

        // Too many consonants in a row (likely gibberish)
        const vowels = 'aeiouáéíóúàèìòùäëïöü';
        let consonantStreak = 0;
        let maxStreak = 0;
        for (const char of word.toLowerCase()) {
            if (/[a-z\u00C0-\u024F]/.test(char) && !vowels.includes(char)) {
                consonantStreak++;
                maxStreak = Math.max(maxStreak, consonantStreak);
            } else {
                consonantStreak = 0;
            }
        }
        return maxStreak > 5;
    }

    calculateStats(messages, stats, wordCounts, emojiCounts, wordsByPerson) {
        stats.totalMessages = messages.length;
        stats.messages = messages; // Keep for busiest day display

        if (messages.length === 0) return;

        stats.firstMessageDate = messages[0].timestamp;
        stats.lastMessageDate = messages[messages.length - 1].timestamp;

        const senderMsgCount = {};
        const senderWordCount = {};
        let prevSender = null;
        let prevTime = null;
        const conversationGap = 60 * 60 * 1000; // 1 hour in ms

        for (const msg of messages) {
            const sender = msg.sender;

            // Message counts
            stats.messagesBySender[sender] = (stats.messagesBySender[sender] || 0) + 1;
            senderMsgCount[sender] = (senderMsgCount[sender] || 0) + 1;

            // Word counts
            stats.totalWords += msg.wordCount;
            stats.wordsBySender[sender] = (stats.wordsBySender[sender] || 0) + msg.wordCount;
            senderWordCount[sender] = (senderWordCount[sender] || 0) + msg.wordCount;

            // Media counts
            if (msg.isMedia) {
                stats.mediaCount++;
                stats.mediaBySender[sender] = (stats.mediaBySender[sender] || 0) + 1;

                if (msg.mediaFilename) {
                    stats.mediaFiles.push(msg.mediaFilename);
                    if (!stats.mediaFilesBySender[sender]) {
                        stats.mediaFilesBySender[sender] = [];
                    }
                    stats.mediaFilesBySender[sender].push(msg.mediaFilename);

                    // Track images
                    if (msg.mediaFilename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                        msg.mediaFilename.startsWith('IMG-')) {
                        if (!stats.imagesBySender[sender]) {
                            stats.imagesBySender[sender] = [];
                        }
                        stats.imagesBySender[sender].push(msg.mediaFilename);
                    }

                    // Track audio
                    if (msg.mediaFilename.match(/\.(opus|m4a|mp3|ogg|wav)$/i) ||
                        msg.mediaFilename.startsWith('PTT-') ||
                        msg.mediaFilename.startsWith('AUD-')) {
                        stats.audioBySender[sender] = (stats.audioBySender[sender] || 0) + 1;
                        if (!stats.audioFilesBySender[sender]) {
                            stats.audioFilesBySender[sender] = [];
                        }
                        stats.audioFilesBySender[sender].push(msg.mediaFilename);
                    }
                }
            }

            // Deleted message counts
            if (msg.isDeleted) {
                stats.deletedBySender[sender] = (stats.deletedBySender[sender] || 0) + 1;
            }

            // Link counts
            if (msg.hasLink) {
                stats.linkCount++;
                stats.linksBySender[sender] = (stats.linksBySender[sender] || 0) + 1;
            }

            // Emoji counts
            if (msg.hasEmoji) {
                stats.emojiCount++;
                stats.emojiBySender[sender] = (stats.emojiBySender[sender] || 0) + 1;
            }

            // Time-based stats
            const hour = msg.timestamp.getHours();
            stats.messagesByHour[hour] = (stats.messagesByHour[hour] || 0) + 1;

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayKey = dayNames[msg.timestamp.getDay()];
            stats.messagesByDay[dayKey] = (stats.messagesByDay[dayKey] || 0) + 1;

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const monthKey = monthNames[msg.timestamp.getMonth()];
            stats.messagesByMonth[monthKey] = (stats.messagesByMonth[monthKey] || 0) + 1;

            const dateKey = this.formatDate(msg.timestamp);
            stats.messagesByDate[dateKey] = (stats.messagesByDate[dateKey] || 0) + 1;

            const datetimeKey = `${dateKey} ${hour.toString().padStart(2, '0')}`;
            stats.messagesByDatetime[datetimeKey] = (stats.messagesByDatetime[datetimeKey] || 0) + 1;

            // Night owls (12am-5am)
            if (hour >= 0 && hour < 5) {
                stats.nightOwls[sender] = (stats.nightOwls[sender] || 0) + 1;
            }

            // Early birds (5am-8am)
            if (hour >= 5 && hour < 8) {
                stats.earlyBirds[sender] = (stats.earlyBirds[sender] || 0) + 1;
            }

            // Conversation starters
            if (!prevTime || (msg.timestamp - prevTime) > conversationGap) {
                stats.conversationStarters[sender] = (stats.conversationStarters[sender] || 0) + 1;
            }

            prevSender = sender;
            prevTime = msg.timestamp;
        }

        // Average message length
        for (const [sender, count] of Object.entries(senderMsgCount)) {
            const words = senderWordCount[sender] || 0;
            stats.avgMessageLength[sender] = count > 0 ? Math.round((words / count) * 10) / 10 : 0;
        }

        // Top words (500 for word cloud)
        const sortedWords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 500);
        stats.topWords = Object.fromEntries(sortedWords);

        // Top emojis
        const sortedEmojis = Object.entries(emojiCounts)
            .sort((a, b) => b[1] - a[1]);
        stats.topEmojis = Object.fromEntries(sortedEmojis.slice(0, 20));
        stats.rareEmojis = Object.fromEntries(sortedEmojis.slice(-10).reverse());

        // Top words per person
        for (const [person, words] of Object.entries(wordsByPerson)) {
            const topWords = Object.entries(words)
                .filter(([word]) => !this.isGibberish(word))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            stats.wordsByPerson[person] = Object.fromEntries(topWords);
        }

        // Most active day and hour
        if (Object.keys(stats.messagesByDay).length > 0) {
            stats.mostActiveDay = Object.entries(stats.messagesByDay)
                .sort((a, b) => b[1] - a[1])[0][0];
        }
        if (Object.keys(stats.messagesByHour).length > 0) {
            stats.mostActiveHour = parseInt(Object.entries(stats.messagesByHour)
                .sort((a, b) => b[1] - a[1])[0][0], 10);
        }
        if (Object.keys(stats.messagesByDate).length > 0) {
            stats.mostActiveDate = Object.entries(stats.messagesByDate)
                .sort((a, b) => b[1] - a[1])[0][0];
        }
        if (Object.keys(stats.messagesByDatetime).length > 0) {
            stats.peakHourDatetime = Object.entries(stats.messagesByDatetime)
                .sort((a, b) => b[1] - a[1])[0][0];
        }

        // Unique words per person
        const wordUsage = {};
        for (const [person, words] of Object.entries(wordsByPerson)) {
            for (const word of Object.keys(words)) {
                if (!wordUsage[word]) wordUsage[word] = new Set();
                wordUsage[word].add(person);
            }
        }

        for (const [person, words] of Object.entries(wordsByPerson)) {
            const uniqueWords = [];
            const sortedPersonWords = Object.entries(words)
                .sort((a, b) => b[1] - a[1]);

            for (const [word, count] of sortedPersonWords) {
                if (wordUsage[word].size === 1 && count >= 3 && !this.isGibberish(word)) {
                    uniqueWords.push(word);
                    if (uniqueWords.length >= 5) break;
                }
            }
            stats.uniqueWordsByPerson[person] = uniqueWords;
        }

        // Longest conversation
        if (messages.length > 1) {
            const conversations = [];
            let convStart = 0;
            let convParticipants = new Set();

            for (let i = 1; i < messages.length; i++) {
                const timeDiff = messages[i].timestamp - messages[i - 1].timestamp;
                if (timeDiff <= 5 * 60 * 1000) { // 5 minutes
                    convParticipants.add(messages[i].sender);
                    convParticipants.add(messages[i - 1].sender);
                } else {
                    if (i - convStart > 10 && convParticipants.size >= 2) {
                        conversations.push({
                            start: convStart,
                            end: i - 1,
                            length: i - convStart,
                            participants: Array.from(convParticipants),
                            date: this.formatDate(messages[convStart].timestamp)
                        });
                    }
                    convStart = i;
                    convParticipants = new Set();
                }
            }

            if (conversations.length > 0) {
                const longest = conversations.sort((a, b) => b.length - a.length)[0];
                const participantCounts = {};
                for (let j = longest.start; j <= longest.end; j++) {
                    const sender = messages[j].sender;
                    participantCounts[sender] = (participantCounts[sender] || 0) + 1;
                }
                const topTwo = Object.entries(participantCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2);

                stats.longestConversation = {
                    length: longest.length,
                    participants: topTwo.map(p => p[0]),
                    date: longest.date
                };
            }
        }

        // Participants list (only those with > 2 messages)
        stats.participants = Object.keys(stats.messagesBySender)
            .filter(sender => stats.messagesBySender[sender] > 2)
            .sort((a, b) => stats.messagesBySender[b] - stats.messagesBySender[a]);

        // Filter out low-activity participants from all stats
        this.filterLowActivityParticipants(stats);
    }

    /**
     * Remove participants with 2 or fewer messages from all stats
     */
    filterLowActivityParticipants(stats) {
        const validParticipants = new Set(stats.participants);

        const filterObj = (obj) => {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                if (validParticipants.has(key)) {
                    result[key] = value;
                }
            }
            return result;
        };

        stats.messagesBySender = filterObj(stats.messagesBySender);
        stats.wordsBySender = filterObj(stats.wordsBySender);
        stats.mediaBySender = filterObj(stats.mediaBySender);
        stats.emojiBySender = filterObj(stats.emojiBySender);
        stats.linksBySender = filterObj(stats.linksBySender);
        stats.avgMessageLength = filterObj(stats.avgMessageLength);
        stats.nightOwls = filterObj(stats.nightOwls);
        stats.earlyBirds = filterObj(stats.earlyBirds);
        stats.conversationStarters = filterObj(stats.conversationStarters);
        stats.deletedBySender = filterObj(stats.deletedBySender);
        stats.mediaFilesBySender = filterObj(stats.mediaFilesBySender);
        stats.imagesBySender = filterObj(stats.imagesBySender);
        stats.audioBySender = filterObj(stats.audioBySender);
        stats.audioFilesBySender = filterObj(stats.audioFilesBySender);
        stats.wordsByPerson = filterObj(stats.wordsByPerson);
        stats.uniqueWordsByPerson = filterObj(stats.uniqueWordsByPerson);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateReadable(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
    }
}

// Export for use
window.ChatParser = ChatParser;
