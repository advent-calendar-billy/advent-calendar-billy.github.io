/* Scripted live messages Billy can fire from the console, in order.
   ALL CONTENT IS PLACEHOLDER except the exit line (approved in the bible).
   Edit freely: sender is 'maxim' or 'billy', type is 'text' or 'audio'
   (audio content = filename inside fede/escaperoom/audio/). */
const CONSOLE_SCRIPT = [
  { sender: 'maxim', type: 'text', content: 'PLACEHOLDER - primer mensaje en vivo' },
  { sender: 'maxim', type: 'audio', content: 'sample_voice_note.m4a' },
];

/* Canon (bible-approved). Fired by its own button when the transfer is cancelled. */
const EXIT_LINE = { sender: 'maxim', type: 'text', content: 'el amor no se roba. se transfiere.' };

/* Audio files available for one-tap sending (must exist in ../audio/). */
const AUDIO_FILES = ['sample_voice_note.m4a'];
