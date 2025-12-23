/**
 * Word Cloud Generator
 * Uses Pyodide to generate word clouds in the browser.
 */

class WordCloudGenerator {
    constructor() {
        this.pyodide = null;
        this.ready = false;
    }

    /**
     * Initialize Pyodide and install wordcloud
     * @param {Function} progressCallback - Progress callback
     */
    async init(progressCallback = null) {
        if (this.ready) return;

        try {
            if (progressCallback) {
                progressCallback({
                    phase: 'wordcloud',
                    progress: 70,
                    detail: 'Loading Python runtime...',
                    subdetail: 'This might take a moment'
                });
            }

            // Load Pyodide
            this.pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            });

            if (progressCallback) {
                progressCallback({
                    phase: 'wordcloud',
                    progress: 75,
                    detail: 'Installing word cloud library...',
                    subdetail: ''
                });
            }

            // Install required packages
            await this.pyodide.loadPackage(['micropip', 'numpy']);
            await this.pyodide.runPythonAsync(`
                import micropip
                await micropip.install('wordcloud')
                await micropip.install('pillow')
            `);

            this.ready = true;

            if (progressCallback) {
                progressCallback({
                    phase: 'wordcloud',
                    progress: 80,
                    detail: 'Word cloud ready!',
                    subdetail: ''
                });
            }
        } catch (error) {
            console.error('Pyodide initialization failed:', error);
            throw error;
        }
    }

    /**
     * Generate word cloud image
     * @param {Object} topWords - Map of word to frequency
     * @returns {string} - Base64 data URL of the image
     */
    async generate(topWords) {
        if (!this.ready) {
            throw new Error('WordCloudGenerator not initialized');
        }

        // Convert JS object to Python dict
        const wordsJson = JSON.stringify(topWords);

        const result = await this.pyodide.runPythonAsync(`
import json
import base64
from io import BytesIO
from wordcloud import WordCloud

# Parse the words
words = json.loads('''${wordsJson}''')

# Generate word cloud
wordcloud = WordCloud(
    width=800,
    height=500,
    background_color='#1a1a2e',
    colormap='plasma',
    max_words=300,
    min_font_size=8,
    max_font_size=120,
    prefer_horizontal=0.7,
    relative_scaling=0.5,
    margin=5,
).generate_from_frequencies(words)

# Convert to image
img = wordcloud.to_image()

# Save to bytes
buffer = BytesIO()
img.save(buffer, format='PNG')
buffer.seek(0)

# Encode as base64
base64_img = base64.b64encode(buffer.getvalue()).decode('utf-8')
base64_img
        `);

        return `data:image/png;base64,${result}`;
    }

    /**
     * Generate a simple HTML-based word cloud (fallback if Pyodide fails)
     * @param {Object} topWords - Map of word to frequency
     * @returns {string} - HTML string for the word cloud
     */
    static generateHtmlFallback(topWords) {
        const sortedWords = Object.entries(topWords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100);

        if (sortedWords.length === 0) return '';

        const maxCount = sortedWords[0][1];
        const minCount = sortedWords[sortedWords.length - 1][1];

        // Generate HTML with varying font sizes
        const colors = [
            '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#AA96DA',
            '#F38181', '#FCBAD3', '#A8D8EA', '#FF9F43', '#1DB954'
        ];

        let html = '';
        for (const [word, count] of sortedWords) {
            // Calculate font size (0.7rem to 2.5rem)
            const normalized = (count - minCount) / (maxCount - minCount || 1);
            const fontSize = 0.7 + (normalized * 1.8);
            const color = colors[Math.floor(Math.random() * colors.length)];

            html += `<span class="word" style="font-size: ${fontSize}rem; color: ${color};">${word}</span> `;
        }

        return html;
    }
}

// Export for use
window.WordCloudGenerator = WordCloudGenerator;
