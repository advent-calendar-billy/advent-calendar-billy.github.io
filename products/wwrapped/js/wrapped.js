/**
 * Wrapped UI Generator
 * Generates all the Spotify-style wrapped slides.
 */

class WrappedUI {
    constructor() {
        this.stats = null;
        this.zipHandler = null;
        this.wordcloudUrl = null;
        this.mediaCache = {};
        this.dataBySender = {};

        // Local MP3 files for songs
        this.songs = {
            'friday': { file: 'audio/friday-im-in-love.mp3', start: 15, title: 'Friday I\'m In Love - The Cure' },
            'nightowl': { file: 'audio/come-together.mp3', start: 30, title: 'Come Together - The Beatles' },
            'earlybird': { file: 'audio/here-comes-the-sun.mp3', start: 0, title: 'Here Comes the Sun - The Beatles' },
            'deleted': { file: 'audio/come-together.mp3', start: 60, title: 'Come Together - The Beatles' },
            'heart': { file: 'audio/friday-im-in-love.mp3', start: 30, title: 'Friday I\'m In Love - The Cure' },
            'novelist': { file: 'audio/here-comes-the-sun.mp3', start: 30, title: 'Here Comes the Sun - The Beatles' },
            'together': { file: 'audio/come-together.mp3', start: 0, title: 'Come Together - The Beatles' }
        };

        this.audioPlayer = null;
        this.carouselIndex = 0;
    }

    /**
     * Initialize the wrapped UI
     * @param {Object} stats - The chat statistics
     * @param {ZipHandler} zipHandler - The zip handler for media
     * @param {string} wordcloudUrl - URL/data URL for the word cloud image
     * @param {Object} dataBySender - Data consumption by sender
     */
    async init(stats, zipHandler, wordcloudUrl, dataBySender) {
        this.stats = stats;
        this.zipHandler = zipHandler;
        this.wordcloudUrl = wordcloudUrl;
        this.dataBySender = dataBySender;

        // Set year in intro
        const year = stats.detectedYear || new Date().getFullYear();
        document.getElementById('introYear').textContent = year;
        document.getElementById('footerYear').textContent = year;

        // Generate all slides
        await this.generateSlides();

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Generate all slides
     */
    async generateSlides() {
        const container = document.getElementById('slidesContainer');
        container.innerHTML = '';

        // Slide 1: Total Messages
        container.appendChild(this.createTotalMessagesSlide());

        // Slide 2: Media Gallery
        container.appendChild(await this.createMediaGallerySlide());

        // Slide 3: Top Writers
        container.appendChild(this.createTopWritersSlide());

        // Slide 4: Audio Talkers (if audio exists)
        if (Object.keys(this.stats.audioBySender || {}).length > 0) {
            container.appendChild(this.createAudioTalkersSlide());
        }

        // Slide 5: Data Consumption
        if (Object.keys(this.dataBySender).length > 0) {
            container.appendChild(this.createDataConsumptionSlide());
        }

        // Slide 6: Fun Facts Carousel
        container.appendChild(this.createFunFactsSlide());

        // Slide 7: Activity Calendar
        container.appendChild(this.createActivityCalendarSlide());

        // Slide 8: Most Active Day
        container.appendChild(await this.createMostActiveDaySlide());

        // Slide 9: Word Cloud
        container.appendChild(this.createWordCloudSlide());

        // Slide 10: Emojis
        container.appendChild(this.createEmojisSlide());

        // Slide 11: Individual Stats
        container.appendChild(await this.createIndividualStatsSlide());

        // Slide 12: Thank You
        container.appendChild(this.createThankYouSlide());
    }

    createTotalMessagesSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const messages = this.stats.totalMessages;
        const words = this.stats.totalWords;
        const hpBooks = Math.max(1, Math.round(words / 77000));

        // Beethoven's 5th is ~7 minutes, ~420 notifications worth
        const beethoven = Math.round(messages / 420 * 10) / 10;

        slide.innerHTML = `
            <div class="floating" style="top: 10%; left: 10%;">&#128172;</div>
            <div class="floating" style="top: 20%; right: 15%; animation-delay: -2s;">&#10084;&#65039;</div>
            <div class="floating" style="bottom: 20%; left: 20%; animation-delay: -4s;">&#127881;</div>

            <div class="slide-title">This year, the group sent</div>
            <div class="big-number">${messages.toLocaleString()}</div>
            <div class="stat-label">messages</div>
            <div class="comparison-text">That's enough notifications to play Beethoven's 5th Symphony ${beethoven} times</div>

            <div class="card" style="margin-top: 2rem;">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${words.toLocaleString()}</div>
                    <div style="opacity: 0.8;">total words</div>
                    <div class="comparison-text" style="margin-top: 0.5rem;">${hpBooks}x Harry Potter 1</div>
                </div>
            </div>
        `;

        return slide;
    }

    async createMediaGallerySlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.padding = '1rem';

        const mediaCount = this.stats.mediaCount;

        // Get random sample of media
        const sampleImages = this.zipHandler.getRandomMedia(90, 'image');
        const sampleVideos = this.zipHandler.getRandomMedia(10, 'video');
        const allMedia = [...sampleImages, ...sampleVideos].sort(() => Math.random() - 0.5);

        let galleryHtml = '';
        for (const filename of allMedia.slice(0, 100)) {
            const blobUrl = await this.zipHandler.getMediaBlob(filename);
            if (!blobUrl) continue;

            this.mediaCache[filename] = blobUrl;

            if (this.zipHandler.isVideo(filename)) {
                galleryHtml += `
                    <div class="gallery-item">
                        <video autoplay muted loop playsinline onclick="app.wrapped.openMedia('${filename}')">
                            <source src="${blobUrl}" type="video/mp4">
                        </video>
                    </div>`;
            } else {
                galleryHtml += `
                    <div class="gallery-item">
                        <img src="${blobUrl}" alt="" loading="lazy" onclick="app.wrapped.openMedia('${filename}')">
                    </div>`;
            }
        }

        slide.innerHTML = `
            <div class="slide-title" style="margin-bottom: 0.5rem;">Memories of ${this.stats.detectedYear || 'the Year'}</div>
            <div class="comparison-text" style="margin-bottom: 0.5rem;">A giant photo album with ${mediaCount.toLocaleString()} memories</div>
            <div class="media-gallery">${galleryHtml}</div>
        `;

        return slide;
    }

    createTopWritersSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const byMessages = Object.entries(this.stats.messagesBySender)
            .sort((a, b) => b[1] - a[1]);
        const byWords = Object.entries(this.stats.wordsBySender)
            .sort((a, b) => b[1] - a[1]);

        const createRanking = (data, valueFormatter = (v) => v.toLocaleString()) => {
            return data.map(([name, value], i) => `
                <div class="mini-rank-item">
                    <span class="mini-rank-num">#${i + 1}</span>
                    <span class="mini-rank-name">${name}</span>
                    <span class="mini-rank-val">${valueFormatter(value)}</span>
                </div>
            `).join('');
        };

        slide.innerHTML = `
            <div class="slide-title">Top Writers</div>
            <div class="dual-ranking">
                <div class="ranking-column">
                    <div class="column-title">Most Messages</div>
                    <div class="mini-ranking">${createRanking(byMessages)}</div>
                </div>
                <div class="ranking-column">
                    <div class="column-title">Most Words</div>
                    <div class="mini-ranking">${createRanking(byWords)}</div>
                </div>
            </div>
        `;

        return slide;
    }

    createAudioTalkersSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const byAudio = Object.entries(this.stats.audioBySender || {})
            .sort((a, b) => b[1] - a[1]);

        const topTalker = byAudio[0];
        const abbeyRoadMins = 47;
        const abbeyRoadTimes = topTalker ? Math.round(topTalker[1] / abbeyRoadMins * 10) / 10 : 0;

        const rankingHtml = byAudio.map(([name, count], i) => `
            <div class="audio-rank-item">
                <span class="audio-rank-num">#${i + 1}</span>
                <span class="audio-rank-name">${name}</span>
                <span class="audio-rank-mins">${count} msgs</span>
            </div>
        `).join('');

        slide.innerHTML = `
            <div class="slide-title">Top Voice Messagers</div>
            ${topTalker ? `<div class="comparison-text" style="margin-bottom: 1rem;">${topTalker[0]} sent ${topTalker[1]} voice messages!</div>` : ''}
            <div class="audio-ranking">${rankingHtml}</div>
        `;

        return slide;
    }

    createDataConsumptionSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const byData = Object.entries(this.dataBySender)
            .sort((a, b) => b[1] - a[1]);

        const totalMB = Object.values(this.dataBySender).reduce((a, b) => a + b, 0);

        const rankingHtml = byData.map(([name, mb], i) => `
            <div class="data-rank-item">
                <span class="data-rank-num">#${i + 1}</span>
                <span class="data-rank-name">${name}</span>
                <span class="data-rank-mb">${mb.toFixed(1)} MB</span>
            </div>
        `).join('');

        slide.innerHTML = `
            <div class="slide-title">Data Consumption</div>
            <div class="comparison-text" style="margin-bottom: 1rem;">Total: ${totalMB.toFixed(1)} MB in photos and videos</div>
            <div class="data-ranking">${rankingHtml}</div>
        `;

        return slide;
    }

    createFunFactsSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const facts = this.generateFacts();

        const slidesHtml = facts.map((fact, i) => `
            <div class="carousel-slide" ${fact.music ? `data-music="${fact.music}"` : ''}>
                <div class="fact-card">
                    <div class="fact-title">${fact.title}</div>
                    <div class="fact-value">${fact.value}</div>
                    <div class="fact-description">${fact.description}</div>
                </div>
            </div>
        `).join('');

        const dotsHtml = facts.map((_, i) => `
            <div class="carousel-dot${i === 0 ? ' active' : ''}" onclick="app.wrapped.goToCarouselSlide(${i})"></div>
        `).join('');

        slide.innerHTML = `
            <div class="slide-title">Fun Facts</div>
            <div class="carousel" id="carousel">
                <div class="carousel-track" id="carouselTrack">${slidesHtml}</div>
            </div>
            <div class="carousel-dots" id="carouselDots">${dotsHtml}</div>
            <div class="carousel-nav">
                <button class="carousel-btn" onclick="app.wrapped.moveCarousel(-1)">&#8592;</button>
                <button class="carousel-btn" onclick="app.wrapped.moveCarousel(1)">&#8594;</button>
            </div>
        `;

        return slide;
    }

    generateFacts() {
        const facts = [];

        // Most active day
        facts.push({
            title: 'Favorite Day',
            value: this.stats.mostActiveDay,
            description: 'The day the group chats the most!',
            music: this.stats.mostActiveDay === 'Friday' ? 'friday' : null
        });

        // Peak hour
        const hour = this.stats.mostActiveHour;
        const hourStr = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
        facts.push({
            title: 'Peak Hour',
            value: hourStr,
            description: 'When the chat explodes!'
        });

        // Conversation starter
        const starters = Object.entries(this.stats.conversationStarters || {})
            .sort((a, b) => b[1] - a[1]);
        if (starters.length > 0) {
            facts.push({
                title: 'Conversation Starter',
                value: starters[0][0],
                description: `Started ${starters[0][1]} conversations this year!`
            });
        }

        // Night owl
        const nightOwls = Object.entries(this.stats.nightOwls || {})
            .sort((a, b) => b[1] - a[1]);
        if (nightOwls.length > 0 && nightOwls[0][1] > 10) {
            facts.push({
                title: 'Night Owl',
                value: nightOwls[0][0],
                description: `Sent ${nightOwls[0][1]} messages between midnight and 5 AM!`,
                music: 'nightowl'
            });
        }

        // Early bird
        const earlyBirds = Object.entries(this.stats.earlyBirds || {})
            .sort((a, b) => b[1] - a[1]);
        if (earlyBirds.length > 0 && earlyBirds[0][1] > 10) {
            facts.push({
                title: 'Early Bird',
                value: earlyBirds[0][0],
                description: `Sent ${earlyBirds[0][1]} messages before 8 AM!`,
                music: 'earlybird'
            });
        }

        // Most censored (deleted messages)
        const deleted = Object.entries(this.stats.deletedBySender || {})
            .sort((a, b) => b[1] - a[1]);
        if (deleted.length > 0 && deleted[0][1] > 5) {
            facts.push({
                title: 'Most Censored',
                value: deleted[0][0],
                description: `Had to delete ${deleted[0][1]} messages this year!`,
                music: 'deleted'
            });
        }

        // Photo champion
        const mediaChamp = Object.entries(this.stats.mediaBySender || {})
            .sort((a, b) => b[1] - a[1]);
        if (mediaChamp.length > 0) {
            facts.push({
                title: 'Photo Champion',
                value: mediaChamp[0][0],
                description: `Shared ${mediaChamp[0][1]} photos and videos!`
            });
        }

        // Link curator
        const linkChamp = Object.entries(this.stats.linksBySender || {})
            .sort((a, b) => b[1] - a[1]);
        if (linkChamp.length > 0 && linkChamp[0][1] > 5) {
            facts.push({
                title: 'Link Curator',
                value: linkChamp[0][0],
                description: `Shared ${linkChamp[0][1]} links with the group!`
            });
        }

        // Emoji master
        const emojiChamp = Object.entries(this.stats.emojiBySender || {})
            .sort((a, b) => b[1] - a[1]);
        if (emojiChamp.length > 0) {
            facts.push({
                title: 'Emoji Master',
                value: emojiChamp[0][0],
                description: `Used emojis in ${emojiChamp[0][1]} messages!`
            });
        }

        // Novelist (longest avg message)
        const novelist = Object.entries(this.stats.avgMessageLength || {})
            .filter(([_, avg]) => avg > 10)
            .sort((a, b) => b[1] - a[1]);
        if (novelist.length > 0) {
            facts.push({
                title: 'The Novelist',
                value: novelist[0][0],
                description: `Average of ${novelist[0][1]} words per message!`,
                music: 'novelist'
            });
        }

        // Favorite emoji
        const topEmoji = Object.entries(this.stats.topEmojis || {})[0];
        if (topEmoji) {
            facts.push({
                title: 'Favorite Emoji',
                value: topEmoji[0],
                description: `Used ${topEmoji[1].toLocaleString()} times this year!`,
                music: topEmoji[0].includes('❤') ? 'heart' : null
            });
        }

        // Longest conversation
        if (this.stats.longestConversation && this.stats.longestConversation.length > 20) {
            const lc = this.stats.longestConversation;
            facts.push({
                title: 'Longest Conversation',
                value: lc.participants.join(' & '),
                description: `${lc.length} messages non-stop!`,
                music: 'together'
            });
        }

        return facts;
    }

    createActivityCalendarSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        // Create GitHub-style calendar
        const calendarHtml = this.generateCalendarHtml();

        // Create monthly bar chart
        const monthlyData = this.getMonthlyData();
        const maxMonth = Math.max(...monthlyData.map(m => m.count));
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const barsHtml = monthlyData.map((m, i) => {
            const height = maxMonth > 0 ? (m.count / maxMonth * 100) : 0;
            return `<div class="bar" style="height: ${height}%"><span class="bar-label">${monthNames[i]}</span></div>`;
        }).join('');

        // Most active month
        const mostActiveMonth = monthlyData.reduce((max, m) => m.count > max.count ? m : max, { count: 0 });

        slide.innerHTML = `
            <div class="slide-title">Activity ${this.stats.detectedYear || ''}</div>
            <div class="calendar-container">
                <div class="calendar-grid">${calendarHtml}</div>
            </div>
            <div class="chart-container" style="margin-top: 1rem;">
                <div class="bar-chart">${barsHtml}</div>
            </div>
            <div class="card">
                <div style="text-align: center;">
                    <div>Most active month: <strong>${mostActiveMonth.name}</strong></div>
                    <div style="margin-top: 0.5rem;">Busiest day: <strong>${this.formatDate(this.stats.mostActiveDate)}</strong></div>
                </div>
            </div>
        `;

        return slide;
    }

    generateCalendarHtml() {
        const year = this.stats.detectedYear || new Date().getFullYear();
        const messagesByDate = this.stats.messagesByDate || {};

        // Find max for scaling
        const counts = Object.values(messagesByDate);
        const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

        let html = '';

        // Start from first Sunday before Jan 1
        const firstDay = new Date(year, 0, 1);
        const startOffset = firstDay.getDay();
        const startDate = new Date(year, 0, 1 - startOffset);

        // Generate 53 weeks x 7 days
        for (let week = 0; week < 53; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);

                const dateStr = this.formatDateISO(date);
                const count = messagesByDate[dateStr] || 0;

                let level = 0;
                if (count > 0) {
                    const ratio = count / maxCount;
                    if (ratio > 0.75) level = 4;
                    else if (ratio > 0.5) level = 3;
                    else if (ratio > 0.25) level = 2;
                    else level = 1;
                }

                const title = count > 0 ? `${dateStr}: ${count} messages` : dateStr;
                html += `<div class="calendar-day level-${level}" title="${title}"></div>`;
            }
        }

        return html;
    }

    getMonthlyData() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames.map(name => ({
            name,
            count: this.stats.messagesByMonth[name] || 0
        }));
    }

    async createMostActiveDaySlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.padding = '1rem';

        const date = this.stats.mostActiveDate;
        const count = this.stats.messagesByDate[date] || 0;

        // Get messages from that day (text only, no media placeholders)
        const dayMessages = (this.stats.messages || []).filter(msg => {
            return this.formatDateISO(msg.timestamp) === date && !msg.isMedia && !msg.isDeleted && msg.content.length > 2;
        });

        // Get media for that day (from filenames)
        const dayMedia = this.zipHandler.getMediaForDate(date);
        console.log('Busiest day media found:', dayMedia.length, 'for date:', date);

        // Count images and videos from files
        let imageCount = dayMedia.filter(f => this.zipHandler.isImage(f)).length;
        let videoCount = dayMedia.filter(f => this.zipHandler.isVideo(f)).length;

        // Fallback: count media messages from parsed data if file matching failed
        if (imageCount === 0 && videoCount === 0) {
            const mediaMessages = (this.stats.messages || []).filter(msg => {
                return this.formatDateISO(msg.timestamp) === date && msg.isMedia;
            });
            // Estimate: assume 80% images, 20% videos if we can't determine type
            const totalMedia = mediaMessages.length;
            if (totalMedia > 0) {
                imageCount = Math.round(totalMedia * 0.8);
                videoCount = totalMedia - imageCount;
                console.log('Using fallback media count from messages:', totalMedia, '(estimated', imageCount, 'images,', videoCount, 'videos)');
            }
        }

        // Build grid items - prioritize media, then fill with text
        const gridItems = [];
        const maxItems = 50;

        // First add all media (up to limit)
        for (let i = 0; i < Math.min(dayMedia.length, maxItems); i++) {
            const filename = dayMedia[i];
            const blobUrl = await this.zipHandler.getMediaBlob(filename);

            if (blobUrl) {
                this.mediaCache[filename] = blobUrl;

                if (this.zipHandler.isVideo(filename)) {
                    gridItems.push({
                        type: 'video',
                        html: `<div class="day-grid-item media-item" onclick="app.wrapped.openMedia('${filename}')">
                                <video autoplay muted loop playsinline>
                                    <source src="${blobUrl}" type="video/mp4">
                                </video>
                            </div>`
                    });
                } else {
                    gridItems.push({
                        type: 'image',
                        html: `<div class="day-grid-item media-item" onclick="app.wrapped.openMedia('${filename}')">
                                <img src="${blobUrl}" alt="" loading="lazy">
                            </div>`
                    });
                }
            }
        }

        // Then add text messages to fill remaining slots
        let msgIndex = 0;
        while (gridItems.length < maxItems && msgIndex < dayMessages.length) {
            const msg = dayMessages[msgIndex];
            msgIndex++;

            const shortContent = msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : '');
            gridItems.push({
                type: 'text',
                html: `<div class="day-grid-item text-item" title="${this.escapeHtml(msg.content)}">
                        <span class="grid-sender">${this.escapeHtml(msg.sender)}</span>
                        <span class="grid-content">${this.escapeHtml(shortContent)}</span>
                    </div>`
            });
        }

        // Shuffle to mix media and text
        const shuffled = gridItems.sort(() => Math.random() - 0.5);
        const gridHtml = shuffled.map(item => item.html).join('');

        // Build subtitle with media counts (always show, even if 0)
        const subtitle = `${count} messages, ${imageCount} photo${imageCount !== 1 ? 's' : ''} & ${videoCount} video${videoCount !== 1 ? 's' : ''} - Here's what happened`;

        slide.innerHTML = `
            <div class="slide-title">Busiest Day: ${this.formatDate(date)}</div>
            <div class="slide-subtitle">${subtitle}</div>
            <div class="day-grid">${gridHtml}</div>
        `;

        return slide;
    }

    createWordCloudSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.paddingTop = '1rem';
        slide.style.paddingBottom = '1rem';

        if (this.wordcloudUrl) {
            slide.innerHTML = `
                <div class="slide-title" style="margin-bottom: 1rem;">Most Used Words</div>
                <img src="${this.wordcloudUrl}" alt="Word cloud" class="wordcloud-img" onclick="app.wrapped.openMediaDirect('${this.wordcloudUrl}')">
                <div class="tap-hint">Tap to enlarge</div>
            `;
        } else {
            // Fallback to HTML word cloud
            const htmlCloud = WordCloudGenerator.generateHtmlFallback(this.stats.topWords);
            slide.innerHTML = `
                <div class="slide-title" style="margin-bottom: 1rem;">Most Used Words</div>
                <div class="word-cloud">${htmlCloud}</div>
            `;
        }

        return slide;
    }

    createEmojisSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const topEmojis = Object.entries(this.stats.topEmojis || {}).slice(0, 10);
        const rareEmojis = Object.entries(this.stats.rareEmojis || {}).slice(0, 10);

        const topHtml = topEmojis.map(([emoji, count]) => `
            <div class="emoji-item">
                <span class="emoji-char">${emoji}</span>
                <span class="emoji-count">${count.toLocaleString()}</span>
            </div>
        `).join('');

        const rareHtml = rareEmojis.map(([emoji, count]) => `
            <div class="emoji-item rare">
                <span class="emoji-char">${emoji}</span>
                <span class="emoji-count">${count}x</span>
            </div>
        `).join('');

        slide.innerHTML = `
            <div class="slide-title">Favorite Emojis</div>
            <div class="emoji-grid">${topHtml}</div>
            <div class="slide-title" style="margin-top: 2.5rem; font-size: 1.5rem;">Rarest Emojis</div>
            <div class="emoji-grid">${rareHtml}</div>
        `;

        return slide;
    }

    async createIndividualStatsSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        // Create person selector buttons
        const participants = this.stats.participants;
        let selectorHtml = '';

        for (const name of participants) {
            const images = this.stats.imagesBySender[name] || [];
            if (images.length >= 4) {
                // Use images as button background
                const selectedImages = images.slice(0, 4);
                const urls = [];
                for (const img of selectedImages) {
                    const url = await this.zipHandler.getMediaBlob(img);
                    if (url) urls.push(url);
                }

                if (urls.length >= 4) {
                    selectorHtml += `
                        <button class="person-btn has-images" style="background-image:
                            url('${urls[0]}'),
                            url('${urls[1]}'),
                            url('${urls[2]}'),
                            url('${urls[3]}');
                            background-size: 50% 50%;
                            background-position: 0 0, 100% 0, 0 100%, 100% 100%;
                            background-repeat: no-repeat;" onclick="app.wrapped.showPerson('${name}')">
                            <span class="person-btn-name">${name}</span>
                        </button>`;
                    continue;
                }
            }

            // Regular button
            selectorHtml += `<button class="person-btn" onclick="app.wrapped.showPerson('${name}')">${name}</button>`;
        }

        // Create detail cards for each person
        let detailsHtml = '';
        for (const name of participants) {
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '-');
            const messages = this.stats.messagesBySender[name] || 0;
            const words = this.stats.wordsBySender[name] || 0;
            const media = this.stats.mediaBySender[name] || 0;
            const emojis = this.stats.emojiBySender[name] || 0;

            // Get traits
            const traits = this.getPersonTraits(name);
            const traitsHtml = traits.map(t => `<span class="trait">${t}</span>`).join('');

            // Get favorite words
            const favWords = Object.entries(this.stats.wordsByPerson[name] || {}).slice(0, 5);
            const favWordsHtml = favWords.map(([w, c]) => `<span class="fav-word">${w} (${c})</span>`).join(', ');

            // Get unique words
            const uniqueWords = this.stats.uniqueWordsByPerson[name] || [];
            const uniqueWordsHtml = uniqueWords.map(w => `<span class="fav-word unique">${w}</span>`).join(', ');

            detailsHtml += `
                <div class="person-detail card" id="detail-${safeName}" data-name="${name}">
                    <div class="person-header">
                        <div class="person-name">${name}</div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">${messages.toLocaleString()}</div>
                            <div class="stat-name">Messages</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${words.toLocaleString()}</div>
                            <div class="stat-name">Words</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${media}</div>
                            <div class="stat-name">Photos/Videos</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${emojis}</div>
                            <div class="stat-name">With Emojis</div>
                        </div>
                    </div>
                    ${favWordsHtml ? `<div class="person-words"><div class="words-title">Favorite words:</div><div class="words-list">${favWordsHtml}</div></div>` : ''}
                    ${uniqueWordsHtml ? `<div class="person-words unique-words"><div class="words-title">Unique words (only you use):</div><div class="words-list">${uniqueWordsHtml}</div></div>` : ''}
                    <div class="traits">${traitsHtml}</div>
                </div>
            `;
        }

        slide.innerHTML = `
            <div class="slide-title">Personal Stats</div>
            <div class="person-selector" id="personSelector">${selectorHtml}</div>
            <div id="personDetails">${detailsHtml}</div>
        `;

        return slide;
    }

    getPersonTraits(name) {
        const traits = [];

        const media = this.stats.mediaBySender[name] || 0;
        const emojis = this.stats.emojiBySender[name] || 0;
        const links = this.stats.linksBySender[name] || 0;
        const messages = this.stats.messagesBySender[name] || 0;
        const avgLength = this.stats.avgMessageLength[name] || 0;
        const nightMsgs = this.stats.nightOwls[name] || 0;
        const earlyMsgs = this.stats.earlyBirds[name] || 0;
        const convStarts = this.stats.conversationStarters[name] || 0;

        if (media > 50) traits.push('Visual');
        if (emojis / messages > 0.3) traits.push('Emoji Fan');
        if (links > 20) traits.push('Link Curator');
        if (avgLength > 15) traits.push('Novelist');
        if (nightMsgs > 10) traits.push('Night Owl');
        if (earlyMsgs > 20) traits.push('Early Bird');
        if (convStarts > 30) traits.push('Conversation Starter');

        return traits;
    }

    createThankYouSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const participantCount = this.stats.participants.length;
        const messageCount = this.stats.totalMessages;
        const year = this.stats.detectedYear || new Date().getFullYear();
        const nextYear = year + 1;

        slide.innerHTML = `
            <div class="slide-title">Thanks for an amazing ${year}!</div>
            <div class="card" style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">&#10084;&#65039;</div>
                <p style="font-size: 1.2rem; line-height: 1.6;">
                    ${participantCount} people shared ${messageCount.toLocaleString()} moments together.
                    <br><br>
                    Here's to more conversations in ${nextYear}!
                </p>
            </div>
            <div class="share-section">
                <button class="share-btn" onclick="app.wrapped.shareWrapped()">Share</button>
            </div>
        `;

        return slide;
    }

    // === Helper Methods ===

    formatDate(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
    }

    formatDateISO(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === Event Handlers ===

    setupEventListeners() {
        // Start button
        document.getElementById('startBtn').onclick = () => this.startWrapped();

        // Music button
        document.getElementById('musicBtn').onclick = () => this.toggleMusic();

        // Lightbox
        document.getElementById('lightbox').onclick = (e) => this.handleLightboxClick(e);
        document.getElementById('lightboxClose').onclick = () => this.closeLightbox();

        // Hide scroll indicator on scroll
        window.addEventListener('scroll', () => {
            document.getElementById('scrollIndicator').style.opacity = '0';
        }, { once: true });

        // Touch swipe for carousel
        const carousel = document.getElementById('carousel');
        if (carousel) {
            let touchStartX = 0;
            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            carousel.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) this.moveCarousel(1);
                if (touchEndX - touchStartX > 50) this.moveCarousel(-1);
            });
        }
    }

    startWrapped() {
        document.getElementById('intro').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.triggerConfetti();
    }

    toggleMusic() {
        const btn = document.getElementById('musicBtn');
        const icon = document.getElementById('musicIcon');

        if (this.audioPlayer && !this.audioPlayer.paused) {
            this.audioPlayer.pause();
            icon.innerHTML = '&#128263;';
            btn.classList.remove('playing');
        } else {
            // Play a default song
            this.playAudio(this.songs.friday);
            icon.innerHTML = '&#128266;';
            btn.classList.add('playing');
        }
    }

    playAudio(song) {
        // Stop any existing audio
        if (this.audioPlayer) {
            this.audioPlayer.pause();
        }

        // Create and play audio
        this.audioPlayer = new Audio(song.file);
        this.audioPlayer.currentTime = song.start || 0;
        this.audioPlayer.loop = true;
        this.audioPlayer.volume = 0.5;
        this.audioPlayer.play().catch(e => console.log('Audio autoplay blocked:', e));
    }

    stopAudio() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer = null;
        }
    }

    moveCarousel(direction) {
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;
        this.carouselIndex = (this.carouselIndex + direction + totalSlides) % totalSlides;
        this.updateCarousel();
    }

    goToCarouselSlide(index) {
        this.carouselIndex = index;
        this.updateCarousel();
    }

    updateCarousel() {
        const track = document.getElementById('carouselTrack');
        track.style.transform = `translateX(-${this.carouselIndex * 100}%)`;

        // Update dots
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.carouselIndex);
        });

        // Check for music
        const slides = document.querySelectorAll('.carousel-slide');
        const currentSlide = slides[this.carouselIndex];
        const musicId = currentSlide?.dataset?.music;

        if (musicId && this.songs[musicId]) {
            this.playAudio(this.songs[musicId]);
            document.getElementById('musicBtn').classList.add('playing');
            document.getElementById('musicIcon').innerHTML = '&#128266;';
        }
    }

    showPerson(name) {
        // Hide all details
        document.querySelectorAll('.person-detail').forEach(el => {
            el.classList.remove('active');
        });

        // Update button states
        document.querySelectorAll('.person-btn').forEach(btn => {
            const btnName = btn.querySelector('.person-btn-name')?.textContent || btn.textContent;
            btn.classList.toggle('active', btnName === name);
        });

        // Show selected detail
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '-');
        const detail = document.getElementById(`detail-${safeName}`);
        if (detail) {
            detail.classList.add('active');
        }
    }

    openMedia(filename) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        const video = document.getElementById('lightbox-video');
        const hint = document.getElementById('lightbox-hint');

        const blobUrl = this.mediaCache[filename];
        if (!blobUrl) return;

        if (this.zipHandler.isVideo(filename)) {
            video.src = blobUrl;
            video.style.display = 'block';
            img.style.display = 'none';
            hint.style.display = 'none';
        } else {
            img.src = blobUrl;
            img.style.display = 'block';
            video.style.display = 'none';
            hint.style.display = 'block';
        }

        lightbox.classList.remove('zoomed');
        lightbox.classList.add('active');
    }

    openMediaDirect(url) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        const video = document.getElementById('lightbox-video');
        const hint = document.getElementById('lightbox-hint');

        img.src = url;
        img.style.display = 'block';
        video.style.display = 'none';
        hint.style.display = 'block';

        lightbox.classList.remove('zoomed');
        lightbox.classList.add('active');
    }

    handleLightboxClick(event) {
        const img = document.getElementById('lightbox-img');
        const lightbox = document.getElementById('lightbox');
        const hint = document.getElementById('lightbox-hint');

        if (event.target === img) {
            lightbox.classList.toggle('zoomed');
            hint.textContent = lightbox.classList.contains('zoomed') ? 'Tap to zoom out' : 'Tap image to zoom';
        } else if (event.target === lightbox) {
            this.closeLightbox();
        }
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        const video = document.getElementById('lightbox-video');
        video.pause();
        lightbox.classList.remove('active');
        lightbox.classList.remove('zoomed');
    }

    triggerConfetti() {
        const container = document.getElementById('confetti');
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#aa96da', '#fcbad3'];

        for (let i = 0; i < 100; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
            piece.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(piece);
        }

        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    shareWrapped() {
        if (navigator.share) {
            navigator.share({
                title: 'WhatsApp Wrapped',
                text: 'Check out my WhatsApp Wrapped!',
                url: window.location.href
            });
        } else {
            alert('Share this page with your group!');
        }
    }
}

// Export for use
window.WrappedUI = WrappedUI;
