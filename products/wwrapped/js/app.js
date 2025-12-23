/**
 * WhatsApp Wrapped - Main Application
 * Orchestrates the entire flow from upload to wrapped display.
 */

console.log('=== APP.JS LOADED ===');

class App {
    constructor() {
        this.zipHandler = new ZipHandler();
        this.chatParser = new ChatParser();
        this.loader = new Loader();
        this.configScreen = new ConfigScreen();
        this.wordcloudGenerator = new WordCloudGenerator();
        this.wrapped = new WrappedUI();

        this.stats = null;
        this.wordcloudUrl = null;
        this.dataBySender = {};

        this.init();
    }

    init() {
        // Setup upload zone
        this.setupUploadZone();
    }

    setupUploadZone() {
        console.log('=== SETUP UPLOAD ZONE ===');
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        console.log('uploadZone:', uploadZone);
        console.log('fileInput:', fileInput);

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.zip')) {
                this.processFile(files[0]);
            } else {
                alert('Please drop a .zip file');
            }
        });

        // Click to upload (but not when clicking the button/label directly)
        uploadZone.addEventListener('click', (e) => {
            // Don't trigger if clicking on the label or input (they handle it themselves)
            if (e.target.tagName === 'LABEL' || e.target.tagName === 'INPUT') {
                return;
            }
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processFile(e.target.files[0]);
            }
        });
    }

    async processFile(file) {
        try {
            // Switch to loading screen
            this.showScreen('loading');

            // Step 1: Extract ZIP
            this.loader.update({
                progress: 5,
                detail: 'Extracting ZIP file...',
                subdetail: `${(file.size / 1024 / 1024).toFixed(1)} MB`
            });

            const extracted = await this.zipHandler.extract(file, (update) => {
                this.loader.update(update);
            });

            this.loader.update({
                progress: 20,
                detail: `Found ${extracted.mediaCount.toLocaleString()} media files`,
                subdetail: 'Parsing chat messages...'
            });

            // Step 2: Parse chat
            const year = new Date().getFullYear();
            this.stats = this.chatParser.parse(extracted.chatContent, year, (update) => {
                this.loader.update(update);
            });

            // If no messages for current year, try without filter
            if (this.stats.totalMessages === 0) {
                this.loader.update({
                    progress: 40,
                    detail: 'No messages found for this year',
                    subdetail: 'Trying all years...'
                });
                this.stats = this.chatParser.parse(extracted.chatContent, null, (update) => {
                    this.loader.update(update);
                });
            }

            if (this.stats.totalMessages === 0) {
                throw new Error('No messages found in chat file');
            }

            // Show fun comments during analysis
            this.loader.update({
                progress: 55,
                detail: `Found ${this.stats.totalMessages.toLocaleString()} messages!`,
                subdetail: `From ${this.stats.participants.length} participants`
            });

            await this.sleep(1500);

            // Show some fun stats
            const funComments = this.loader.generateFunComment(this.stats);
            for (const comment of funComments.slice(0, 3)) {
                this.loader.update({
                    progress: 60,
                    ...comment
                });
                await this.sleep(1500);
            }

            // Step 3: Calculate data consumption
            this.loader.update({
                progress: 65,
                detail: 'Calculating data consumption...',
                subdetail: ''
            });

            if (Object.keys(this.stats.mediaFilesBySender).length > 0) {
                this.dataBySender = await this.zipHandler.calculateDataBySender(
                    this.stats.mediaFilesBySender,
                    (update) => this.loader.update(update)
                );
            }

            // Step 4: Generate word cloud (show fun facts while loading)
            const showFunFact = () => {
                const fact = this.loader.getRandomFunFact(this.stats);
                if (fact) {
                    this.loader.update({ progress: 75, ...fact });
                }
            };

            // Show a fun fact while Python loads
            showFunFact();

            try {
                // Start showing fun facts periodically
                const factInterval = setInterval(showFunFact, 2500);

                await this.wordcloudGenerator.init(() => {}); // Suppress technical updates

                this.loader.update({
                    progress: 85,
                    detail: 'Creating your word cloud...',
                    subdetail: 'Almost there!'
                });

                this.wordcloudUrl = await this.wordcloudGenerator.generate(this.stats.topWords);
                clearInterval(factInterval);
            } catch (error) {
                console.warn('Pyodide word cloud failed, using HTML fallback:', error);
                this.wordcloudUrl = null;
            }

            // One more fun fact
            showFunFact();
            await this.sleep(1500);

            await this.sleep(500);

            // Step 5: Show config screen
            this.showScreen('config');
            this.configScreen.init(this.stats, (updatedStats) => {
                this.stats = updatedStats;
                this.showWrapped();
            });

        } catch (error) {
            console.error('Processing error:', error);
            alert(`Error: ${error.message}`);
            this.showScreen('upload');
        }
    }

    async showWrapped() {
        // Show loading briefly
        this.showScreen('loading');
        this.loader.update({
            progress: 95,
            detail: 'Building your Wrapped...',
            subdetail: ''
        });

        await this.sleep(500);

        // Initialize wrapped UI
        await this.wrapped.init(this.stats, this.zipHandler, this.wordcloudUrl, this.dataBySender);

        this.loader.update({
            progress: 100,
            detail: 'Ready!',
            subdetail: ''
        });

        await this.sleep(300);

        // Show wrapped screen
        this.showScreen('wrapped');
    }

    showScreen(screen) {
        console.log('=== SHOW SCREEN:', screen, '===');

        // Remove active from all screens
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });

        // Add active to target screen
        const screenId = `${screen}Screen`;
        const el = document.getElementById(screenId);
        if (el) {
            el.classList.add('active');
            // Scroll to top of the screen
            el.scrollTop = 0;
            window.scrollTo(0, 0);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
