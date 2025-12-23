/**
 * Loader
 * Handles the loading screen with progress bar and fun comments.
 */

console.log('=== LOADER.JS LOADED ===');

class Loader {
    constructor() {
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        this.loadingComment = document.getElementById('loadingComment');
        this.loadingSubcomment = document.getElementById('loadingSubcomment');
        this.stats = null;
    }

    /**
     * Update progress bar and comments
     * @param {Object} update - Progress update object
     */
    update(update) {
        const { progress, detail, subdetail } = update;
        console.log('LOADER UPDATE:', { progress, detail, subdetail });

        if (progress !== undefined) {
            this.progressFill.style.width = `${progress}%`;
            this.progressPercent.textContent = `${progress}%`;
        }

        if (detail) {
            this.loadingComment.textContent = detail;
        }

        if (subdetail !== undefined) {
            this.loadingSubcomment.textContent = subdetail;
        }
    }

    /**
     * Generate a fun comment based on stats
     * @param {Object} stats - The chat statistics
     * @returns {Object} - Comment and subcomment
     */
    generateFunComment(stats) {
        const comments = [];

        // Comments about total messages
        if (stats.totalMessages > 10000) {
            comments.push({
                detail: `${stats.totalMessages.toLocaleString()} messages? That's a LOT of chatting!`,
                subdetail: 'Your group is very active...'
            });
        } else if (stats.totalMessages > 1000) {
            comments.push({
                detail: `Processing ${stats.totalMessages.toLocaleString()} messages...`,
                subdetail: 'That\'s quite a conversation!'
            });
        }

        // Comments about media
        if (stats.mediaCount > 500) {
            comments.push({
                detail: `Wow, ${stats.mediaCount.toLocaleString()} photos and videos!`,
                subdetail: 'Someone loves sharing memories'
            });
        }

        // Comments about specific senders
        const topSenders = Object.entries(stats.messagesBySender)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topSenders.length > 0) {
            const [topName, topCount] = topSenders[0];
            comments.push({
                detail: `${topName} sent ${topCount.toLocaleString()} messages!`,
                subdetail: 'Clearly the chatty one'
            });
        }

        // Comments about media by sender
        if (stats.mediaBySender) {
            const topMediaSender = Object.entries(stats.mediaBySender)
                .sort((a, b) => b[1] - a[1])[0];
            if (topMediaSender && topMediaSender[1] > 100) {
                comments.push({
                    detail: `${topMediaSender[0]} shared ${topMediaSender[1]} media files`,
                    subdetail: 'The group photographer!'
                });
            }
        }

        // Comments about words
        if (stats.totalWords > 50000) {
            const books = Math.max(1, Math.round(stats.totalWords / 77000));
            comments.push({
                detail: `${stats.totalWords.toLocaleString()} words written`,
                subdetail: `That's ${books}x Harry Potter 1!`
            });
        }

        // Comments about emojis
        if (stats.emojiCount > 500) {
            comments.push({
                detail: `Found ${stats.emojiCount.toLocaleString()} messages with emojis`,
                subdetail: 'Someone loves their emojis!'
            });
        }

        // Top emoji comment
        if (stats.topEmojis) {
            const topEmoji = Object.entries(stats.topEmojis)[0];
            if (topEmoji && topEmoji[1] > 100) {
                comments.push({
                    detail: `${topEmoji[0]} used ${topEmoji[1].toLocaleString()} times!`,
                    subdetail: 'The group\'s favorite emoji'
                });
            }
        }

        // Comments about links
        if (stats.linkCount > 100) {
            comments.push({
                detail: `${stats.linkCount} links shared`,
                subdetail: 'Someone loves sharing articles!'
            });
        }

        // Night owl comments
        if (stats.nightOwls) {
            const topNightOwl = Object.entries(stats.nightOwls)
                .sort((a, b) => b[1] - a[1])[0];
            if (topNightOwl && topNightOwl[1] > 20) {
                comments.push({
                    detail: `${topNightOwl[0]} sent ${topNightOwl[1]} late-night messages`,
                    subdetail: 'Someone needs more sleep!'
                });
            }
        }

        // Early bird comments
        if (stats.earlyBirds) {
            const topEarlyBird = Object.entries(stats.earlyBirds)
                .sort((a, b) => b[1] - a[1])[0];
            if (topEarlyBird && topEarlyBird[1] > 20) {
                comments.push({
                    detail: `${topEarlyBird[0]} - the early riser!`,
                    subdetail: `${topEarlyBird[1]} messages before 8 AM`
                });
            }
        }

        // Comments about participants
        const participantCount = stats.participants.length;
        if (participantCount > 10) {
            comments.push({
                detail: `${participantCount} people in the chat`,
                subdetail: 'That\'s quite the group!'
            });
        }

        // Deleted messages
        if (stats.deletedBySender) {
            const topDeleter = Object.entries(stats.deletedBySender)
                .sort((a, b) => b[1] - a[1])[0];
            if (topDeleter && topDeleter[1] > 10) {
                comments.push({
                    detail: `${topDeleter[0]} deleted ${topDeleter[1]} messages`,
                    subdetail: 'What were they hiding?'
                });
            }
        }

        // Novelist comment
        if (stats.avgMessageLength) {
            const novelist = Object.entries(stats.avgMessageLength)
                .filter(([_, avg]) => avg > 15)
                .sort((a, b) => b[1] - a[1])[0];
            if (novelist) {
                comments.push({
                    detail: `${novelist[0]} writes novels!`,
                    subdetail: `${novelist[1]} words per message on average`
                });
            }
        }

        // Busiest day
        if (stats.mostActiveDate) {
            const count = stats.messagesByDate[stats.mostActiveDate];
            comments.push({
                detail: `Busiest day: ${this.formatDate(stats.mostActiveDate)}`,
                subdetail: `${count} messages in one day!`
            });
        }

        // Top word
        if (stats.topWords) {
            const topWord = Object.entries(stats.topWords)
                .sort((a, b) => b[1] - a[1])[0];
            if (topWord) {
                comments.push({
                    detail: `Your most used word: "${topWord[0]}"`,
                    subdetail: `Used ${topWord[1].toLocaleString()} times!`
                });
            }
        }

        // Audio messages
        if (stats.audioBySender) {
            const topAudio = Object.entries(stats.audioBySender)
                .sort((a, b) => b[1] - a[1])[0];
            if (topAudio && topAudio[1] > 20) {
                comments.push({
                    detail: `${topAudio[0]} sent ${topAudio[1]} voice messages`,
                    subdetail: 'Typing is overrated anyway'
                });
            }
        }

        // Conversation starters
        if (stats.conversationStarters) {
            const topStarter = Object.entries(stats.conversationStarters)
                .sort((a, b) => b[1] - a[1])[0];
            if (topStarter && topStarter[1] > 10) {
                comments.push({
                    detail: `${topStarter[0]} started ${topStarter[1]} conversations`,
                    subdetail: 'The group initiator!'
                });
            }
        }

        // Unique vocabulary
        if (stats.uniqueWordsByPerson) {
            const uniqueWords = Object.entries(stats.uniqueWordsByPerson)
                .sort((a, b) => b[1] - a[1])[0];
            if (uniqueWords) {
                comments.push({
                    detail: `${uniqueWords[0]} has the biggest vocabulary`,
                    subdetail: `${uniqueWords[1].toLocaleString()} unique words used`
                });
            }
        }

        return comments;
    }

    /**
     * Get a random fun fact from stats
     */
    getRandomFunFact(stats) {
        const facts = [];

        // Top word fact
        if (stats.topWords) {
            const topWord = Object.entries(stats.topWords).sort((a, b) => b[1] - a[1])[0];
            if (topWord) {
                facts.push({
                    detail: `Huh, your most used word was "${topWord[0]}"...`,
                    subdetail: `${topWord[1].toLocaleString()} times!`
                });
            }
        }

        // Top emoji
        if (stats.topEmojis) {
            const topEmoji = Object.entries(stats.topEmojis).sort((a, b) => b[1] - a[1])[0];
            if (topEmoji) {
                facts.push({
                    detail: `${topEmoji[0]} was everyone's favorite`,
                    subdetail: `Used ${topEmoji[1].toLocaleString()} times`
                });
            }
        }

        // Night owl
        if (stats.nightOwls) {
            const owl = Object.entries(stats.nightOwls).sort((a, b) => b[1] - a[1])[0];
            if (owl && owl[1] > 5) {
                facts.push({
                    detail: `${owl[0]} really needs to sleep more...`,
                    subdetail: `${owl[1]} messages after midnight`
                });
            }
        }

        // Most active person
        const topSender = Object.entries(stats.messagesBySender).sort((a, b) => b[1] - a[1])[0];
        if (topSender) {
            const percent = Math.round((topSender[1] / stats.totalMessages) * 100);
            facts.push({
                detail: `${topSender[0]} dominated the chat`,
                subdetail: `${percent}% of all messages`
            });
        }

        // Deleted messages mystery
        if (stats.deletedBySender) {
            const deleter = Object.entries(stats.deletedBySender).sort((a, b) => b[1] - a[1])[0];
            if (deleter && deleter[1] > 5) {
                facts.push({
                    detail: `${deleter[0]} deleted ${deleter[1]} messages...`,
                    subdetail: 'What are they hiding? 👀'
                });
            }
        }

        // Media stats
        if (stats.mediaBySender) {
            const photographer = Object.entries(stats.mediaBySender).sort((a, b) => b[1] - a[1])[0];
            if (photographer && photographer[1] > 50) {
                facts.push({
                    detail: `${photographer[0]} is the official photographer`,
                    subdetail: `${photographer[1]} photos & videos shared`
                });
            }
        }

        // Return a random fact
        if (facts.length > 0) {
            return facts[Math.floor(Math.random() * facts.length)];
        }
        return null;
    }

    formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
    }

    /**
     * Show loading comments in sequence
     * @param {Object} stats - The chat statistics
     * @param {number} intervalMs - Interval between comments
     */
    async showCommentsSequence(stats, intervalMs = 2000) {
        this.stats = stats;
        const comments = this.generateFunComment(stats);

        for (const comment of comments) {
            this.update(comment);
            await this.sleep(intervalMs);
        }
    }

    /**
     * Show a specific phase of loading
     */
    showPhase(phase, stats = null) {
        switch (phase) {
            case 'extracting':
                this.update({
                    progress: 10,
                    detail: 'Extracting files from ZIP...',
                    subdetail: ''
                });
                break;

            case 'parsing':
                this.update({
                    progress: 30,
                    detail: 'Reading your messages...',
                    subdetail: ''
                });
                break;

            case 'analyzing':
                this.update({
                    progress: 60,
                    detail: 'Analyzing your conversations...',
                    subdetail: ''
                });
                break;

            case 'wordcloud':
                this.update({
                    progress: 75,
                    detail: 'Creating word cloud...',
                    subdetail: 'This might take a moment'
                });
                break;

            case 'media':
                this.update({
                    progress: 85,
                    detail: 'Processing media files...',
                    subdetail: ''
                });
                break;

            case 'finishing':
                this.update({
                    progress: 95,
                    detail: 'Almost done!',
                    subdetail: 'Preparing your Wrapped...'
                });
                break;

            case 'complete':
                this.update({
                    progress: 100,
                    detail: 'Your Wrapped is ready!',
                    subdetail: ''
                });
                break;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use
window.Loader = Loader;
