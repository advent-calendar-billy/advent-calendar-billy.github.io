#!/usr/bin/env python3
"""
WhatsApp Chat Parser for Wrapped 2025
Parses WhatsApp exported chat files and extracts message data.
"""

import re
from datetime import datetime
from collections import defaultdict
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import json

@dataclass
class Message:
    timestamp: datetime
    sender: str
    content: str
    is_media: bool = False
    is_deleted: bool = False
    has_emoji: bool = False
    has_link: bool = False
    word_count: int = 0
    media_filename: str = None

@dataclass
class ChatStats:
    total_messages: int = 0
    total_words: int = 0
    media_count: int = 0
    link_count: int = 0
    emoji_count: int = 0
    messages_by_sender: Dict[str, int] = field(default_factory=dict)
    words_by_sender: Dict[str, int] = field(default_factory=dict)
    media_by_sender: Dict[str, int] = field(default_factory=dict)
    messages_by_hour: Dict[int, int] = field(default_factory=lambda: defaultdict(int))
    messages_by_day: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    messages_by_month: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    first_message_date: Optional[datetime] = None
    last_message_date: Optional[datetime] = None
    top_words: Dict[str, int] = field(default_factory=dict)
    top_emojis: Dict[str, int] = field(default_factory=dict)  # Actual emoji counts
    rare_emojis: Dict[str, int] = field(default_factory=dict)  # Least used emojis
    words_by_person: Dict[str, Dict[str, int]] = field(default_factory=dict)  # Top words per person
    emoji_by_sender: Dict[str, int] = field(default_factory=dict)
    links_by_sender: Dict[str, int] = field(default_factory=dict)
    avg_message_length: Dict[str, float] = field(default_factory=dict)
    response_times: Dict[str, List[float]] = field(default_factory=lambda: defaultdict(list))
    streaks: Dict[str, int] = field(default_factory=dict)
    most_active_day: str = ""
    most_active_hour: int = 0
    conversation_starters: Dict[str, int] = field(default_factory=dict)
    night_owls: Dict[str, int] = field(default_factory=dict)  # Messages between 12am-5am
    early_birds: Dict[str, int] = field(default_factory=dict)  # Messages between 5am-8am
    deleted_by_sender: Dict[str, int] = field(default_factory=dict)  # "This message was deleted" count
    media_files: List[str] = field(default_factory=list)  # List of media filenames from 2025
    messages_by_date: Dict[str, int] = field(default_factory=dict)  # Messages per day (YYYY-MM-DD format)
    media_files_by_sender: Dict[str, List[str]] = field(default_factory=dict)  # Media files per person
    most_active_date: str = ""  # Most active single day
    images_by_sender: Dict[str, List[str]] = field(default_factory=dict)  # Image files per person
    audio_by_sender: Dict[str, int] = field(default_factory=dict)  # Audio message count per person
    audio_files_by_sender: Dict[str, List[str]] = field(default_factory=dict)  # Audio files per person
    audio_duration_by_sender: Dict[str, float] = field(default_factory=dict)  # Audio duration in seconds per person
    messages_by_datetime: Dict[str, int] = field(default_factory=dict)  # Messages per date+hour
    peak_hour_datetime: str = ""  # Single hour with most messages (YYYY-MM-DD HH)
    unique_words_by_person: Dict[str, List[str]] = field(default_factory=dict)  # Words only this person uses
    longest_conversation: Dict = field(default_factory=dict)  # Info about longest conversation

# Name mappings (WhatsApp name -> Display name)
NAME_MAPPINGS = {
    'Mami': 'Marta',
    'Tío jonito': 'Jonito',
    'Papi': 'Inigo Montoya',
    'Chuli': 'Char',
    'Liam USA': 'Liam',
    'Vero S': 'Vero',
    'Will Sacks': 'Will',
}

# People to exclude
EXCLUDED_SENDERS = {'Meta AI'}

# Timezone offsets from UTC for night owl/early bird calculations
# Night = 0-5 AM local time, Early = 5-8 AM local time
# Buenos Aires: UTC-3, Spain: UTC+1 (winter) / UTC+2 (summer), US East: UTC-5, US West: UTC-8
LOCATIONS = {
    # Buenos Aires (UTC-3)
    'Marta': 'buenos_aires',
    'Pancho': 'buenos_aires',
    'Pitu': 'buenos_aires',
    'Jonito': 'buenos_aires',
    'Inigo Montoya': 'buenos_aires',
    'Luqui': 'buenos_aires',
    'Vero': 'buenos_aires',
    'Toti': 'buenos_aires',
    'Benju': 'buenos_aires',
    # US
    'Michel': 'us_east',
    'Will': 'us_east',
    'Liam': 'us_east',
    'Candelis': 'us_east',
    'Billy': 'us_east',  # Since August, before Berlin
    # Spain
    'Pato': 'spain',
    # Char: Argentina since October, Spain before
    'Char': 'buenos_aires',  # Most of recent activity
}

TIMEZONE_OFFSETS = {
    'buenos_aires': -3,
    'us_east': -5,  # EST (winter), EDT is -4
    'us_west': -8,
    'spain': 2,  # CEST (summer, most of year), CET is +1
    'berlin': 2,  # Same as Spain
}

# Common Spanish stop words to filter out
STOP_WORDS = {
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por',
    'un', 'para', 'con', 'no', 'una', 'su', 'al', 'es', 'lo', 'como', 'más',
    'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'sí', 'porque', 'esta',
    'son', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'ser', 'tiene', 'también',
    'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde',
    'todo', 'nos', 'durante', 'estados', 'todos', 'uno', 'les', 'ni', 'contra',
    'otros', 'fueron', 'ese', 'eso', 'había', 'ante', 'ellos', 'e', 'esto',
    'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra',
    'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual',
    'sea', 'poco', 'ella', 'estar', 'haber', 'estas', 'estaba', 'estamos',
    'algunas', 'algo', 'nosotros', 'mi', 'tu', 'te', 'ti', 'si', 'asi', 'así',
    'q', 'omitted', 'media', 'https', 'http', 'www', 'com', 'jaja', 'jajaja',
    'jajajaja', 'jajajajaja', 'jeje', 'jejeje', 'hola', 'bien', 'bueno', 'si',
    'no', 'ok', 'ah', 'oh', 'eh', 'uh', 'mm', 'mmm', 'ya', 'va', 'voy', 'vamos',
    'this', 'message', 'was', 'deleted', 'attached', 'file', 'you'
}

def get_audio_duration(filepath: str) -> float:
    """Get audio file duration in seconds using mutagen."""
    try:
        from mutagen import File
        audio = File(filepath)
        if audio is not None and audio.info:
            return audio.info.length
    except Exception:
        pass
    return 0.0


def parse_whatsapp_chat(file_path: str, year_filter: int = 2025, media_folder: str = 'media') -> tuple[List[Message], ChatStats]:
    """Parse WhatsApp chat export file and return messages and stats."""

    messages = []
    stats = ChatStats()

    # WhatsApp message pattern: M/D/YY, H:MM AM/PM - Sender: Message
    message_pattern = re.compile(
        r'^(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2})\s*(AM|PM|am|pm)?\s*-\s*([^:]+):\s*(.*)$'
    )

    # Emoji pattern (simplified)
    emoji_pattern = re.compile(
        r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF'
        r'\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF'
        r'\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF'
        r'\U00002702-\U000027B0\U0001F1E0-\U0001F1FF]+'
    )

    # URL pattern
    url_pattern = re.compile(r'https?://\S+|www\.\S+')

    word_counts = defaultdict(int)
    emoji_counts = defaultdict(int)
    words_by_person = defaultdict(lambda: defaultdict(int))  # person -> word -> count
    current_message = None

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            match = message_pattern.match(line)
            if match:
                # Save previous message if exists
                if current_message:
                    messages.append(current_message)

                date_str, time_str, ampm, sender, content = match.groups()

                # Parse date
                try:
                    # Handle both M/D/YY and M/D/YYYY formats
                    if len(date_str.split('/')[-1]) == 2:
                        date_format = "%m/%d/%y"
                    else:
                        date_format = "%m/%d/%Y"

                    # Parse time with AM/PM
                    if ampm:
                        full_datetime = f"{date_str} {time_str} {ampm.upper()}"
                        timestamp = datetime.strptime(full_datetime, f"{date_format} %I:%M %p")
                    else:
                        full_datetime = f"{date_str} {time_str}"
                        timestamp = datetime.strptime(full_datetime, f"{date_format} %H:%M")

                    # Filter by year
                    if timestamp.year != year_filter:
                        current_message = None
                        continue

                    sender = sender.strip()

                    # Skip excluded senders
                    if sender in EXCLUDED_SENDERS:
                        current_message = None
                        continue

                    # Apply name mappings
                    sender = NAME_MAPPINGS.get(sender, sender)
                    content = content.strip()

                    # Check for deleted messages
                    is_deleted = 'this message was deleted' in content.lower()

                    # Check for media - both old format and new format with (file attached)
                    is_media = '<Media omitted>' in content or 'omitted' in content.lower() or '(file attached)' in content.lower()

                    # Extract media filename if present (format: "FILENAME (file attached)")
                    media_filename = None
                    if '(file attached)' in content.lower():
                        # Get the filename before "(file attached)"
                        media_match = re.match(r'^(.+?)\s*\(file attached\)', content, re.IGNORECASE)
                        if media_match:
                            media_filename = media_match.group(1).strip()

                    # Check for emojis and count individual ones
                    emojis = emoji_pattern.findall(content)
                    has_emoji = len(emojis) > 0
                    emoji_count = sum(len(e) for e in emojis)
                    # Count individual emojis
                    for emoji_group in emojis:
                        for char in emoji_group:
                            emoji_counts[char] += 1

                    # Check for links
                    links = url_pattern.findall(content)
                    has_link = len(links) > 0

                    # Word count (excluding media omitted messages and deleted messages)
                    if not is_media and not is_deleted:
                        words = re.findall(r'\b\w+\b', content.lower())
                        word_count = len(words)

                        # Count words for top words (filter stop words and short words)
                        for word in words:
                            if word not in STOP_WORDS and len(word) > 2:
                                word_counts[word] += 1
                                words_by_person[sender][word] += 1
                    else:
                        word_count = 0

                    current_message = Message(
                        timestamp=timestamp,
                        sender=sender,
                        content=content,
                        is_media=is_media,
                        is_deleted=is_deleted,
                        has_emoji=has_emoji,
                        has_link=has_link,
                        word_count=word_count,
                        media_filename=media_filename
                    )

                except ValueError as e:
                    continue
            elif current_message:
                # Continuation of previous message
                current_message.content += '\n' + line
                if not current_message.is_media:
                    words = re.findall(r'\b\w+\b', line.lower())
                    current_message.word_count += len(words)
                    for word in words:
                        if word not in STOP_WORDS and len(word) > 2:
                            word_counts[word] += 1

    # Don't forget the last message
    if current_message:
        messages.append(current_message)

    # Calculate statistics
    if messages:
        stats.total_messages = len(messages)
        stats.first_message_date = messages[0].timestamp
        stats.last_message_date = messages[-1].timestamp

        sender_words = defaultdict(int)
        sender_msg_count = defaultdict(int)

        prev_sender = None
        prev_time = None
        conversation_gap = 60 * 60  # 1 hour gap = new conversation

        for msg in messages:
            sender = msg.sender

            # Message counts
            stats.messages_by_sender[sender] = stats.messages_by_sender.get(sender, 0) + 1
            sender_msg_count[sender] += 1

            # Word counts
            stats.total_words += msg.word_count
            stats.words_by_sender[sender] = stats.words_by_sender.get(sender, 0) + msg.word_count
            sender_words[sender] += msg.word_count

            # Media counts
            if msg.is_media:
                stats.media_count += 1
                stats.media_by_sender[sender] = stats.media_by_sender.get(sender, 0) + 1
                # Track 2025 media filenames and by sender
                if msg.media_filename:
                    if msg.media_filename.startswith(('IMG-2025', 'VID-2025')):
                        stats.media_files.append(msg.media_filename)
                        if sender not in stats.media_files_by_sender:
                            stats.media_files_by_sender[sender] = []
                        stats.media_files_by_sender[sender].append(msg.media_filename)

                    # Track images separately
                    if msg.media_filename.startswith('IMG-2025'):
                        if sender not in stats.images_by_sender:
                            stats.images_by_sender[sender] = []
                        stats.images_by_sender[sender].append(msg.media_filename)

                    # Track audio files and duration
                    if msg.media_filename.startswith(('PTT-2025', 'AUD-2025')):
                        stats.audio_by_sender[sender] = stats.audio_by_sender.get(sender, 0) + 1
                        if sender not in stats.audio_files_by_sender:
                            stats.audio_files_by_sender[sender] = []
                        stats.audio_files_by_sender[sender].append(msg.media_filename)
                        # Calculate duration
                        import os
                        audio_path = os.path.join(media_folder, msg.media_filename)
                        duration = get_audio_duration(audio_path)
                        stats.audio_duration_by_sender[sender] = stats.audio_duration_by_sender.get(sender, 0) + duration

            # Deleted message counts
            if msg.is_deleted:
                stats.deleted_by_sender[sender] = stats.deleted_by_sender.get(sender, 0) + 1

            # Link counts
            if msg.has_link:
                stats.link_count += 1
                stats.links_by_sender[sender] = stats.links_by_sender.get(sender, 0) + 1

            # Emoji counts
            if msg.has_emoji:
                stats.emoji_count += 1
                stats.emoji_by_sender[sender] = stats.emoji_by_sender.get(sender, 0) + 1

            # Time-based stats
            stats.messages_by_hour[msg.timestamp.hour] += 1
            day_key = msg.timestamp.strftime('%A')
            stats.messages_by_day[day_key] += 1
            month_key = msg.timestamp.strftime('%B')
            stats.messages_by_month[month_key] += 1
            date_key = msg.timestamp.strftime('%Y-%m-%d')
            stats.messages_by_date[date_key] = stats.messages_by_date.get(date_key, 0) + 1
            # Track by date+hour for peak hour
            datetime_key = msg.timestamp.strftime('%Y-%m-%d %H')
            stats.messages_by_datetime[datetime_key] = stats.messages_by_datetime.get(datetime_key, 0) + 1

            # Calculate local hour based on timezone
            # WhatsApp exports are in local time of the exporter (assuming Buenos Aires UTC-3)
            # We need to convert to each person's local time
            export_tz_offset = -3  # Buenos Aires
            location = LOCATIONS.get(sender, 'buenos_aires')
            person_tz_offset = TIMEZONE_OFFSETS.get(location, -3)

            # Convert: UTC hour = export_hour - export_offset
            # Local hour = UTC hour + person_offset
            # Simplified: local_hour = export_hour + (person_offset - export_offset)
            tz_diff = person_tz_offset - export_tz_offset
            local_hour = (msg.timestamp.hour + tz_diff) % 24

            # Night owls (12am-5am local time)
            if 0 <= local_hour < 5:
                stats.night_owls[sender] = stats.night_owls.get(sender, 0) + 1

            # Early birds (5am-8am local time)
            if 5 <= local_hour < 8:
                stats.early_birds[sender] = stats.early_birds.get(sender, 0) + 1

            # Conversation starters
            if prev_time is None or (msg.timestamp - prev_time).total_seconds() > conversation_gap:
                stats.conversation_starters[sender] = stats.conversation_starters.get(sender, 0) + 1

            prev_sender = sender
            prev_time = msg.timestamp

        # Calculate average message length
        for sender, count in sender_msg_count.items():
            if count > 0:
                stats.avg_message_length[sender] = round(sender_words[sender] / count, 1)

        # Top words (500 for word cloud)
        stats.top_words = dict(sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:500])

        # Top emojis
        stats.top_emojis = dict(sorted(emoji_counts.items(), key=lambda x: x[1], reverse=True)[:20])

        # Rare emojis (bottom 10, but only those used at least once)
        all_emojis_sorted = sorted(emoji_counts.items(), key=lambda x: x[1])
        stats.rare_emojis = dict(all_emojis_sorted[:10])

        # Top words per person (top 5 for each)
        for person, person_words in words_by_person.items():
            top_5 = dict(sorted(person_words.items(), key=lambda x: x[1], reverse=True)[:5])
            stats.words_by_person[person] = top_5

        # Most active day and hour
        if stats.messages_by_day:
            stats.most_active_day = max(stats.messages_by_day.items(), key=lambda x: x[1])[0]
        if stats.messages_by_hour:
            stats.most_active_hour = max(stats.messages_by_hour.items(), key=lambda x: x[1])[0]
        if stats.messages_by_date:
            stats.most_active_date = max(stats.messages_by_date.items(), key=lambda x: x[1])[0]
        if stats.messages_by_datetime:
            stats.peak_hour_datetime = max(stats.messages_by_datetime.items(), key=lambda x: x[1])[0]

        # Calculate unique words per person (words only they use)
        all_words_by_person = words_by_person  # Already tracked
        word_usage = defaultdict(set)  # word -> set of people who use it
        for person, person_words in all_words_by_person.items():
            for word in person_words.keys():
                word_usage[word].add(person)

        # Find words unique to each person (used by only 1 person, at least 3 times)
        for person, person_words in all_words_by_person.items():
            unique = []
            for word, count in sorted(person_words.items(), key=lambda x: x[1], reverse=True):
                if len(word_usage[word]) == 1 and count >= 3 and word not in STOP_WORDS:
                    unique.append(word)
                if len(unique) >= 5:
                    break
            stats.unique_words_by_person[person] = unique

        # Find longest conversation (messages within 5 min of each other)
        if len(messages) > 1:
            conversations = []
            conv_start = 0
            conv_participants = set()
            for i in range(1, len(messages)):
                time_diff = (messages[i].timestamp - messages[i-1].timestamp).total_seconds()
                if time_diff <= 300:  # 5 minutes
                    conv_participants.add(messages[i].sender)
                    conv_participants.add(messages[i-1].sender)
                else:
                    # End of conversation
                    if i - conv_start > 10 and len(conv_participants) >= 2:
                        conversations.append({
                            'start': conv_start,
                            'end': i - 1,
                            'length': i - conv_start,
                            'participants': list(conv_participants),
                            'date': messages[conv_start].timestamp.strftime('%Y-%m-%d')
                        })
                    conv_start = i
                    conv_participants = set()

            if conversations:
                longest = max(conversations, key=lambda x: x['length'])
                # Get top 2 participants by message count in that conversation
                participant_counts = defaultdict(int)
                for j in range(longest['start'], longest['end'] + 1):
                    participant_counts[messages[j].sender] += 1
                top_two = sorted(participant_counts.items(), key=lambda x: x[1], reverse=True)[:2]
                stats.longest_conversation = {
                    'length': longest['length'],
                    'participants': [p[0] for p in top_two],
                    'date': longest['date']
                }

    return messages, stats


def stats_to_dict(stats: ChatStats) -> dict:
    """Convert ChatStats to a JSON-serializable dictionary."""
    return {
        'total_messages': stats.total_messages,
        'total_words': stats.total_words,
        'media_count': stats.media_count,
        'link_count': stats.link_count,
        'emoji_count': stats.emoji_count,
        'messages_by_sender': dict(stats.messages_by_sender),
        'words_by_sender': dict(stats.words_by_sender),
        'media_by_sender': dict(stats.media_by_sender),
        'messages_by_hour': dict(stats.messages_by_hour),
        'messages_by_day': dict(stats.messages_by_day),
        'messages_by_month': dict(stats.messages_by_month),
        'first_message_date': stats.first_message_date.isoformat() if stats.first_message_date else None,
        'last_message_date': stats.last_message_date.isoformat() if stats.last_message_date else None,
        'top_words': stats.top_words,
        'top_emojis': stats.top_emojis,
        'rare_emojis': stats.rare_emojis,
        'words_by_person': {k: dict(v) for k, v in stats.words_by_person.items()},
        'emoji_by_sender': dict(stats.emoji_by_sender),
        'links_by_sender': dict(stats.links_by_sender),
        'avg_message_length': dict(stats.avg_message_length),
        'night_owls': dict(stats.night_owls),
        'early_birds': dict(stats.early_birds),
        'conversation_starters': dict(stats.conversation_starters),
        'most_active_day': stats.most_active_day,
        'most_active_hour': stats.most_active_hour,
        'deleted_by_sender': dict(stats.deleted_by_sender),
        'media_files': stats.media_files,
        'messages_by_date': dict(stats.messages_by_date),
        'media_files_by_sender': {k: list(v) for k, v in stats.media_files_by_sender.items()},
        'most_active_date': stats.most_active_date,
        'images_by_sender': {k: list(v) for k, v in stats.images_by_sender.items()},
        'audio_by_sender': dict(stats.audio_by_sender),
        'audio_files_by_sender': {k: list(v) for k, v in stats.audio_files_by_sender.items()},
        'audio_duration_by_sender': dict(stats.audio_duration_by_sender),
        'peak_hour_datetime': stats.peak_hour_datetime,
        'unique_words_by_person': {k: list(v) for k, v in stats.unique_words_by_person.items()},
        'longest_conversation': stats.longest_conversation,
    }


if __name__ == '__main__':
    import sys

    chat_file = sys.argv[1] if len(sys.argv) > 1 else 'chats.txt'
    messages, stats = parse_whatsapp_chat(chat_file)

    print(f"\n📊 WhatsApp Chat Stats for 2025")
    print("=" * 40)
    print(f"Total messages: {stats.total_messages}")
    print(f"Total words: {stats.total_words}")
    print(f"Media shared: {stats.media_count}")
    print(f"Links shared: {stats.link_count}")
    print(f"\nTop senders:")
    for sender, count in sorted(stats.messages_by_sender.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {sender}: {count} messages")

    # Save stats to JSON
    with open('stats_2025.json', 'w', encoding='utf-8') as f:
        json.dump(stats_to_dict(stats), f, ensure_ascii=False, indent=2)

    print(f"\nStats saved to stats_2025.json")
