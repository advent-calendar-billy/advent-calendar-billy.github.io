#!/usr/bin/env python3
"""
Voice Recording Tool for Billycula Boss Fight
Records dialogue lines for the Castlevania-style game.
"""

import os
import sys
import wave
import time
import threading
import subprocess

try:
    import sounddevice as sd
    import numpy as np
except ImportError:
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "sounddevice", "numpy"])
    import sounddevice as sd
    import numpy as np

# Configuration
SAMPLE_RATE = 44100
CHANNELS = 1
OUTPUT_DIR = "voice_lines"

# The intro dialogue lines
LINES = [
    {"id": "billycula_01", "speaker": "BILLYCULA", "text": "So... you have finally arrived, Fedecard."},
    {"id": "billycula_02", "speaker": "BILLYCULA", "text": "Did you really think you could challenge ME in my own castle?"},
    {"id": "fedecard_01", "speaker": "FEDECARD", "text": "Your reign of darkness ends tonight, Billycula!"},
    {"id": "billycula_03", "speaker": "BILLYCULA", "text": "What is a man? A miserable little pile of secrets!"},
    {"id": "billycula_04", "speaker": "BILLYCULA", "text": "But enough talk... HAVE AT YOU!"},
    {"id": "fedecard_02", "speaker": "FEDECARD", "text": "Prepare yourself, vampire lord!"},
]

class VoiceRecorder:
    def __init__(self):
        self.recording = False
        self.audio_data = []
        os.makedirs(OUTPUT_DIR, exist_ok=True)

    def clear_screen(self):
        os.system('clear' if os.name != 'nt' else 'cls')

    def print_header(self):
        print("\n" + "="*60)
        print("  🎤 BILLYCULA VOICE RECORDING STUDIO 🧛")
        print("="*60 + "\n")

    def get_filepath(self, line_id):
        return os.path.join(OUTPUT_DIR, f"{line_id}.wav")

    def record_audio(self, duration_hint=5):
        """Record audio until user presses Enter"""
        self.audio_data = []
        self.recording = True

        def callback(indata, frames, time, status):
            if self.recording:
                self.audio_data.append(indata.copy())

        print("\n  🔴 RECORDING... (Press ENTER to stop)")

        stream = sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, callback=callback)
        stream.start()

        input()  # Wait for Enter

        self.recording = False
        stream.stop()
        stream.close()

        if self.audio_data:
            return np.concatenate(self.audio_data)
        return None

    def save_audio(self, audio_data, filepath):
        """Save audio data to WAV file"""
        audio_int16 = (audio_data * 32767).astype(np.int16)
        with wave.open(filepath, 'w') as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(audio_int16.tobytes())
        print(f"  ✅ Saved to {filepath}")

    def play_audio(self, filepath):
        """Play a WAV file"""
        if not os.path.exists(filepath):
            print(f"  ❌ File not found: {filepath}")
            return

        print(f"  🔊 Playing {os.path.basename(filepath)}...")
        try:
            with wave.open(filepath, 'r') as wf:
                audio_data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16)
                audio_float = audio_data.astype(np.float32) / 32767
                sd.play(audio_float, wf.getframerate())
                sd.wait()
        except Exception as e:
            print(f"  ❌ Error playing: {e}")

    def play_audio_data(self, audio_data):
        """Play audio data directly"""
        print("  🔊 Playing back...")
        sd.play(audio_data, SAMPLE_RATE)
        sd.wait()

    def record_line(self, line):
        """Record a single line with options to re-record"""
        filepath = self.get_filepath(line['id'])

        while True:
            self.clear_screen()
            self.print_header()

            speaker_color = "\033[91m" if line['speaker'] == "BILLYCULA" else "\033[93m"
            reset = "\033[0m"

            print(f"  Line {LINES.index(line) + 1} of {len(LINES)}")
            print(f"  Speaker: {speaker_color}{line['speaker']}{reset}")
            print()
            print(f"  📜 \"{line['text']}\"")
            print()

            if os.path.exists(filepath):
                print(f"  ✅ Already recorded: {filepath}")
                print()

            print("  Options:")
            print("    [R] Record / Re-record")
            print("    [P] Play current recording")
            print("    [N] Next line")
            print("    [B] Back to previous line")
            print("    [M] Main menu")
            print()

            choice = input("  Your choice: ").strip().lower()

            if choice == 'r':
                audio = self.record_audio()
                if audio is not None and len(audio) > 0:
                    print()
                    self.play_audio_data(audio)
                    print()
                    save = input("  Save this recording? [Y/n]: ").strip().lower()
                    if save != 'n':
                        self.save_audio(audio, filepath)
                        input("  Press ENTER to continue...")

            elif choice == 'p':
                self.play_audio(filepath)
                input("  Press ENTER to continue...")

            elif choice == 'n':
                return 'next'

            elif choice == 'b':
                return 'back'

            elif choice == 'm':
                return 'menu'

    def record_all_lines(self, start_index=0):
        """Record all lines sequentially"""
        i = start_index
        while i < len(LINES):
            result = self.record_line(LINES[i])
            if result == 'next':
                i += 1
            elif result == 'back':
                i = max(0, i - 1)
            elif result == 'menu':
                return

    def play_full_conversation(self):
        """Play the entire conversation"""
        self.clear_screen()
        self.print_header()
        print("  🎬 PLAYING FULL CONVERSATION\n")
        print("  Press Ctrl+C to stop\n")

        try:
            for line in LINES:
                filepath = self.get_filepath(line['id'])
                speaker_color = "\033[91m" if line['speaker'] == "BILLYCULA" else "\033[93m"
                reset = "\033[0m"

                print(f"  {speaker_color}{line['speaker']}{reset}: \"{line['text']}\"")

                if os.path.exists(filepath):
                    self.play_audio(filepath)
                else:
                    print("    (not recorded yet)")

                time.sleep(0.5)

            print("\n  ✅ Conversation complete!")
        except KeyboardInterrupt:
            print("\n  ⏹️ Stopped")

        input("\n  Press ENTER to continue...")

    def show_status(self):
        """Show recording status for all lines"""
        self.clear_screen()
        self.print_header()
        print("  📋 RECORDING STATUS\n")

        recorded = 0
        for i, line in enumerate(LINES):
            filepath = self.get_filepath(line['id'])
            exists = os.path.exists(filepath)
            if exists:
                recorded += 1

            status = "✅" if exists else "❌"
            speaker_color = "\033[91m" if line['speaker'] == "BILLYCULA" else "\033[93m"
            reset = "\033[0m"

            print(f"  {status} {i+1}. {speaker_color}{line['speaker']}{reset}: \"{line['text'][:40]}...\"" if len(line['text']) > 40 else f"  {status} {i+1}. {speaker_color}{line['speaker']}{reset}: \"{line['text']}\"")

        print(f"\n  Progress: {recorded}/{len(LINES)} lines recorded")
        input("\n  Press ENTER to continue...")

    def main_menu(self):
        """Main menu loop"""
        while True:
            self.clear_screen()
            self.print_header()

            print("  1. Record all lines (sequential)")
            print("  2. Record specific line")
            print("  3. Play full conversation")
            print("  4. View recording status")
            print("  5. Exit")
            print()

            choice = input("  Select option: ").strip()

            if choice == '1':
                self.record_all_lines()

            elif choice == '2':
                self.clear_screen()
                self.print_header()
                print("  Select a line to record:\n")
                for i, line in enumerate(LINES):
                    speaker_color = "\033[91m" if line['speaker'] == "BILLYCULA" else "\033[93m"
                    reset = "\033[0m"
                    print(f"  {i+1}. {speaker_color}{line['speaker']}{reset}: \"{line['text'][:50]}...\"" if len(line['text']) > 50 else f"  {i+1}. {speaker_color}{line['speaker']}{reset}: \"{line['text']}\"")
                print()
                try:
                    line_num = int(input("  Enter line number (1-6): ").strip())
                    if 1 <= line_num <= len(LINES):
                        self.record_all_lines(line_num - 1)
                except ValueError:
                    pass

            elif choice == '3':
                self.play_full_conversation()

            elif choice == '4':
                self.show_status()

            elif choice == '5':
                self.clear_screen()
                print("\n  👋 Goodbye! Your recordings are in the 'voice_lines' folder.\n")
                break

if __name__ == "__main__":
    recorder = VoiceRecorder()
    recorder.main_menu()
