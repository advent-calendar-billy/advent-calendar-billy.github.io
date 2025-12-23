/**
 * ZIP Handler
 * Extracts WhatsApp export ZIP files and manages media files.
 */

class ZipHandler {
    constructor() {
        this.zip = null;
        this.mediaBlobs = {};
        this.mediaFiles = [];
        this.chatContent = null;
    }

    /**
     * Load and extract a ZIP file
     * @param {File} file - The ZIP file to extract
     * @param {Function} progressCallback - Callback for progress updates
     * @returns {Promise<Object>} - Object containing chat content and media info
     */
    async extract(file, progressCallback = null) {
        try {
            // Log file metadata for debugging
            console.log('=== [1/6] FILE RECEIVED ===');
            console.log('File name:', file.name);
            console.log('File size:', file.size, 'bytes', `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
            console.log('File type:', file.type);
            console.log('File lastModified:', new Date(file.lastModified).toISOString());

            // Load the ZIP
            if (progressCallback) {
                progressCallback({
                    phase: 'loading',
                    progress: 5,
                    detail: 'Loading ZIP file...',
                    subdetail: `${(file.size / 1024 / 1024).toFixed(1)} MB`
                });
            }

            // Check if file size is 0
            if (file.size === 0) {
                throw new Error('File size is 0 bytes');
            }

            // Check file size - warn if very large
            const fileSizeMB = file.size / 1024 / 1024;
            if (fileSizeMB > 500) {
                console.warn(`Large file detected: ${fileSizeMB.toFixed(0)} MB - this may take a while or fail`);
                if (progressCallback) {
                    progressCallback({
                        phase: 'loading',
                        progress: 5,
                        detail: 'Large file detected...',
                        subdetail: `${fileSizeMB.toFixed(0)} MB - loading in chunks`
                    });
                }
            }

            console.log('=== [2/6] READING FILE ===');

            // For very large files (>500MB), use zip.js streaming approach
            if (fileSizeMB > 500 && typeof zip !== 'undefined') {
                console.log('Using zip.js streaming for large file...');
                return await this.extractWithZipJs(file, progressCallback, fileSizeMB);
            }

            // For smaller files, use JSZip (faster for small files)
            try {
                const arrayBuffer = await file.arrayBuffer();
                console.log('=== [3/6] ARRAYBUFFER SUCCESS ===');
                console.log('ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
                console.log('=== [4/6] LOADING ZIP WITH JSZIP ===');
                this.zip = await JSZip.loadAsync(arrayBuffer);
                console.log('=== [4/6] JSZIP SUCCESS ===');
            } catch (readError) {
                console.error('=== [3/6] FILE READ FAILED ===');
                console.error('Error name:', readError.name);
                console.error('Error message:', readError.message);
                console.error('Full error:', readError);
                throw readError;
            }

            const files = Object.keys(this.zip.files);
            const totalFiles = files.length;
            console.log('Total files in ZIP:', totalFiles);

            if (progressCallback) {
                progressCallback({
                    phase: 'extracting',
                    progress: 10,
                    detail: `Found ${totalFiles.toLocaleString()} files`,
                    subdetail: 'Looking for chat file...'
                });
            }

            // Find chat file
            console.log('=== [5/6] FINDING CHAT FILE ===');
            const chatFile = await this.findChatFile();
            if (!chatFile) {
                throw new Error('No chat file found. Expected _chat.txt, chat.txt, or a single .txt file.');
            }
            console.log('Chat file found:', chatFile.name);

            if (progressCallback) {
                progressCallback({
                    phase: 'extracting',
                    progress: 15,
                    detail: `Found chat: ${chatFile.name}`,
                    subdetail: 'Reading messages...'
                });
            }

            // Extract chat content
            console.log('=== [6/6] EXTRACTING CHAT CONTENT ===');
            try {
                this.chatContent = await this.zip.file(chatFile.name).async('string');
                console.log('=== [6/6] CHAT EXTRACTION SUCCESS ===');
                console.log('Chat content length:', this.chatContent.length, 'chars');
                console.log('First 300 chars:', this.chatContent.substring(0, 300));
            } catch (extractError) {
                console.error('=== [6/6] CHAT EXTRACTION FAILED ===');
                console.error('Error:', extractError);
                throw new Error(`Chat extraction failed: ${extractError.message}`);
            }

            // Catalog media files
            this.mediaFiles = files.filter(f => {
                const lower = f.toLowerCase();
                return (lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
                        lower.endsWith('.png') || lower.endsWith('.gif') ||
                        lower.endsWith('.webp') || lower.endsWith('.mp4') ||
                        lower.endsWith('.mov') || lower.endsWith('.avi') ||
                        lower.endsWith('.opus') || lower.endsWith('.m4a') ||
                        lower.endsWith('.mp3') || lower.endsWith('.ogg')) &&
                       !this.zip.files[f].dir;
            });

            if (progressCallback) {
                progressCallback({
                    phase: 'extracting',
                    progress: 20,
                    detail: `Found ${this.mediaFiles.length.toLocaleString()} media files`,
                    subdetail: 'Ready to parse messages'
                });
            }

            return {
                chatContent: this.chatContent,
                mediaCount: this.mediaFiles.length,
                totalFiles: totalFiles
            };
        } catch (error) {
            console.error('ZIP extraction error:', error);
            throw error;
        }
    }

    /**
     * Extract using zip.js streaming (for large files)
     */
    async extractWithZipJs(file, progressCallback, fileSizeMB) {
        console.log('=== [3/6] OPENING ZIP WITH ZIP.JS (streaming) ===');

        if (progressCallback) {
            progressCallback({
                phase: 'extracting',
                progress: 10,
                detail: 'Opening large ZIP file...',
                subdetail: `${fileSizeMB.toFixed(0)} MB - using streaming mode`
            });
        }

        // Create a BlobReader from the file
        const reader = new zip.ZipReader(new zip.BlobReader(file));

        try {
            // Get entries (this reads just the central directory, not the whole file)
            console.log('=== [4/6] READING ZIP ENTRIES ===');
            const entries = await reader.getEntries();
            console.log('Total entries:', entries.length);

            // Find all file names
            const fileNames = entries.map(e => e.filename);
            console.log('Sample files:', fileNames.slice(0, 10));

            // Find chat file
            let chatEntry = null;
            const txtEntries = entries.filter(e => e.filename.toLowerCase().endsWith('.txt') && !e.directory);
            console.log('TXT files found:', txtEntries.map(e => e.filename));

            // Priority: _chat.txt > chat.txt > single .txt
            chatEntry = entries.find(e => e.filename.endsWith('_chat.txt'));
            if (!chatEntry) {
                chatEntry = entries.find(e => e.filename.split('/').pop() === 'chat.txt');
            }
            if (!chatEntry && txtEntries.length === 1) {
                chatEntry = txtEntries[0];
            }

            if (!chatEntry) {
                throw new Error('No chat file found in ZIP');
            }

            console.log('=== [5/6] EXTRACTING CHAT FILE ===');
            console.log('Chat file:', chatEntry.filename, 'size:', chatEntry.uncompressedSize);

            if (progressCallback) {
                progressCallback({
                    phase: 'extracting',
                    progress: 15,
                    detail: `Found: ${chatEntry.filename}`,
                    subdetail: 'Extracting chat content...'
                });
            }

            // Extract just the chat file as text
            this.chatContent = await chatEntry.getData(new zip.TextWriter());
            console.log('=== [6/6] CHAT EXTRACTION SUCCESS ===');
            console.log('Chat content length:', this.chatContent.length, 'chars');
            console.log('First 300 chars:', this.chatContent.substring(0, 300));

            // Catalog media files (just the names, don't extract yet)
            this.mediaFiles = fileNames.filter(f => {
                const lower = f.toLowerCase();
                return (lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
                        lower.endsWith('.png') || lower.endsWith('.gif') ||
                        lower.endsWith('.webp') || lower.endsWith('.mp4') ||
                        lower.endsWith('.mov') || lower.endsWith('.avi') ||
                        lower.endsWith('.opus') || lower.endsWith('.m4a') ||
                        lower.endsWith('.mp3') || lower.endsWith('.ogg'));
            });

            console.log('Media files found:', this.mediaFiles.length);

            // Store entries for later media extraction
            this.zipEntries = entries;
            this.zipReader = reader;
            this.usingZipJs = true;

            if (progressCallback) {
                progressCallback({
                    phase: 'extracting',
                    progress: 20,
                    detail: `Found ${this.mediaFiles.length.toLocaleString()} media files`,
                    subdetail: 'Ready to parse messages'
                });
            }

            return {
                chatContent: this.chatContent,
                mediaCount: this.mediaFiles.length,
                totalFiles: entries.length
            };

        } catch (error) {
            console.error('zip.js extraction error:', error);
            await reader.close();
            throw error;
        }
    }

    /**
     * Find the chat file in the ZIP
     * Priority: _chat.txt > chat.txt > single .txt file
     */
    async findChatFile() {
        const files = Object.keys(this.zip.files);

        console.log('=== FIND CHAT FILE DEBUG ===');
        console.log('Total files in ZIP:', files.length);
        console.log('All files:', files.slice(0, 20));

        // Look for any .txt file first (to debug)
        const txtFiles = files.filter(f =>
            f.toLowerCase().endsWith('.txt') && !this.zip.files[f].dir
        );
        console.log('TXT files found:', txtFiles);

        // Try _chat.txt first (WhatsApp standard)
        for (const filename of files) {
            if (filename.endsWith('_chat.txt') || filename === '_chat.txt') {
                console.log('Found _chat.txt:', filename);
                return { name: filename };
            }
        }

        // Try chat.txt
        for (const filename of files) {
            const baseName = filename.split('/').pop();
            if (baseName === 'chat.txt') {
                console.log('Found chat.txt:', filename);
                return { name: filename };
            }
        }

        if (txtFiles.length === 1) {
            console.log('Using single txt file:', txtFiles[0]);
            return { name: txtFiles[0] };
        }

        if (txtFiles.length > 1) {
            throw new Error(`Found multiple .txt files (${txtFiles.length}). Cannot determine which is the chat file.`);
        }

        console.log('No chat file found!');
        return null;
    }

    /**
     * Get media file as blob URL
     * @param {string} filename - The media filename
     * @returns {Promise<string>} - Blob URL for the media
     */
    async getMediaBlob(filename) {
        // Check cache first
        if (this.mediaBlobs[filename]) {
            return this.mediaBlobs[filename];
        }

        try {
            let blob;

            // Use zip.js for large files
            if (this.usingZipJs && this.zipEntries) {
                // Find entry by filename
                const entry = this.zipEntries.find(e =>
                    e.filename.endsWith('/' + filename) || e.filename === filename
                );

                if (!entry || entry.directory) {
                    return null;
                }

                // Extract just this one file
                blob = await entry.getData(new zip.BlobWriter(this.getMimeType(filename)));
            } else {
                // Use JSZip for smaller files
                let zipFile = null;
                for (const path of Object.keys(this.zip.files)) {
                    if (path.endsWith('/' + filename) || path === filename) {
                        zipFile = this.zip.files[path];
                        break;
                    }
                }

                if (!zipFile || zipFile.dir) {
                    return null;
                }

                blob = await zipFile.async('blob');
                const mimeType = this.getMimeType(filename);
                blob = new Blob([blob], { type: mimeType });
            }

            const blobUrl = URL.createObjectURL(blob);

            // Cache it
            this.mediaBlobs[filename] = blobUrl;
            return blobUrl;
        } catch (error) {
            console.error(`Error loading media ${filename}:`, error);
            return null;
        }
    }

    /**
     * Get multiple media blobs with progress
     * @param {string[]} filenames - List of filenames to load
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} - Map of filename to blob URL
     */
    async getMediaBlobs(filenames, progressCallback = null) {
        const result = {};
        const total = filenames.length;

        for (let i = 0; i < filenames.length; i++) {
            const filename = filenames[i];
            const blobUrl = await this.getMediaBlob(filename);
            if (blobUrl) {
                result[filename] = blobUrl;
            }

            if (progressCallback && i % 10 === 0) {
                progressCallback({
                    phase: 'media',
                    progress: Math.round((i / total) * 100),
                    detail: `Loading media ${i + 1} of ${total}`
                });
            }
        }

        return result;
    }

    /**
     * Get random sample of media files
     * @param {number} count - Number of files to sample
     * @param {string} type - 'image' or 'video' or 'all'
     */
    getRandomMedia(count, type = 'all') {
        let files = this.mediaFiles;

        if (type === 'image') {
            files = files.filter(f => {
                const lower = f.toLowerCase();
                return lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
                       lower.endsWith('.png') || lower.endsWith('.gif') ||
                       lower.endsWith('.webp');
            });
        } else if (type === 'video') {
            files = files.filter(f => {
                const lower = f.toLowerCase();
                return lower.endsWith('.mp4') || lower.endsWith('.mov') ||
                       lower.endsWith('.avi');
            });
        }

        // Shuffle and take count
        const shuffled = [...files].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Get media files for a specific date
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     */
    getMediaForDate(dateStr) {
        const datePart = dateStr.replace(/-/g, ''); // "2025-11-04" -> "20251104"

        console.log('=== GET MEDIA FOR DATE ===');
        console.log('Looking for date:', dateStr, '-> datePart:', datePart);
        console.log('Total media files:', this.mediaFiles.length);
        console.log('Sample filenames:', this.mediaFiles.slice(0, 5));

        const matches = this.mediaFiles.filter(f => {
            // Get just the filename without path
            const filename = f.split('/').pop();

            // Try multiple WhatsApp filename formats:
            // Format 1: IMG-20250611-WA0001.jpg (standard)
            // Format 2: PHOTO-2025-06-11-12-30-45.jpg
            // Format 3: IMG_20250611_123045.jpg

            // Standard WhatsApp format
            let match = filename.match(/(?:IMG|VID|AUD|PTT)-(\d{8})/i);
            if (match && match[1] === datePart) {
                return true;
            }

            // Format with dashes in date
            match = filename.match(/(?:PHOTO|VIDEO|IMG|VID)-(\d{4})-(\d{2})-(\d{2})/i);
            if (match) {
                const fileDatePart = match[1] + match[2] + match[3];
                if (fileDatePart === datePart) return true;
            }

            // Underscore format
            match = filename.match(/(?:IMG|VID)_(\d{8})_/i);
            if (match && match[1] === datePart) {
                return true;
            }

            return false;
        });

        console.log('Matches found:', matches.length);
        if (matches.length > 0) {
            console.log('Sample matches:', matches.slice(0, 3));
        }

        return matches;
    }

    /**
     * Get file size of a media file
     * @param {string} filename - The filename
     * @returns {Promise<number>} - File size in bytes
     */
    async getFileSize(filename) {
        // For zip.js streaming mode, use stored entries
        if (this.usingZipJs && this.zipEntries) {
            const entry = this.zipEntries.find(e =>
                e.filename.endsWith('/' + filename) || e.filename === filename
            );
            if (entry && !entry.directory) {
                return entry.uncompressedSize || 0;
            }
            return 0;
        }

        // For JSZip mode
        if (!this.zip || !this.zip.files) {
            return 0;
        }

        for (const path of Object.keys(this.zip.files)) {
            if (path.endsWith('/' + filename) || path === filename) {
                const zipFile = this.zip.files[path];
                if (!zipFile.dir) {
                    const data = await zipFile.async('arraybuffer');
                    return data.byteLength;
                }
            }
        }
        return 0;
    }

    /**
     * Calculate data consumption by sender
     * @param {Object} mediaFilesBySender - Map of sender to media files
     * @param {Function} progressCallback - Progress callback
     * @returns {Promise<Object>} - Map of sender to MB
     */
    async calculateDataBySender(mediaFilesBySender, progressCallback = null) {
        const dataBySender = {};
        const senders = Object.keys(mediaFilesBySender);
        let processed = 0;
        const total = senders.reduce((sum, s) => sum + mediaFilesBySender[s].length, 0);

        for (const [sender, files] of Object.entries(mediaFilesBySender)) {
            let totalBytes = 0;
            for (const file of files) {
                const size = await this.getFileSize(file);
                totalBytes += size;
                processed++;

                if (progressCallback && processed % 50 === 0) {
                    progressCallback({
                        phase: 'calculating',
                        progress: Math.round((processed / total) * 100),
                        detail: `Calculating data for ${sender}...`
                    });
                }
            }
            dataBySender[sender] = Math.round(totalBytes / 1024 / 1024 * 10) / 10; // MB
        }

        return dataBySender;
    }

    getMimeType(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
            'opus': 'audio/opus',
            'm4a': 'audio/mp4',
            'mp3': 'audio/mpeg',
            'ogg': 'audio/ogg'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Check if file is an image
     */
    isImage(filename) {
        const lower = filename.toLowerCase();
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
               lower.endsWith('.png') || lower.endsWith('.gif') ||
               lower.endsWith('.webp');
    }

    /**
     * Check if file is a video
     */
    isVideo(filename) {
        const lower = filename.toLowerCase();
        return lower.endsWith('.mp4') || lower.endsWith('.mov') ||
               lower.endsWith('.avi');
    }

    /**
     * Cleanup blob URLs to free memory
     */
    cleanup() {
        for (const url of Object.values(this.mediaBlobs)) {
            URL.revokeObjectURL(url);
        }
        this.mediaBlobs = {};
    }
}

// Export for use
window.ZipHandler = ZipHandler;
