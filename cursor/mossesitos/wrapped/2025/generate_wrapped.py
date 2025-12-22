#!/usr/bin/env python3
"""
WhatsApp Wrapped 2025 Generator
Creates a mobile-friendly, Spotify Wrapped-style HTML presentation.
"""

import json
from parse_chat import parse_whatsapp_chat, stats_to_dict
from datetime import datetime
import random

# Color palette for Wrapped (Spotify-inspired but unique)
COLORS = [
    '#1DB954',  # Green
    '#FF6B6B',  # Coral
    '#4ECDC4',  # Teal
    '#FFE66D',  # Yellow
    '#95E1D3',  # Mint
    '#F38181',  # Salmon
    '#AA96DA',  # Lavender
    '#FCBAD3',  # Pink
    '#A8D8EA',  # Sky blue
    '#FF9F43',  # Orange
]

# No titles - just use names
PERSON_TITLES = {}

# Day name translations
DAY_NAMES_ES = {
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo',
}

# Month name translations
MONTH_NAMES_ES = {
    'January': 'Enero',
    'February': 'Febrero',
    'March': 'Marzo',
    'April': 'Abril',
    'May': 'Mayo',
    'June': 'Junio',
    'July': 'Julio',
    'August': 'Agosto',
    'September': 'Septiembre',
    'October': 'Octubre',
    'November': 'Noviembre',
    'December': 'Diciembre',
}

def get_fun_facts(stats: dict, messages: list) -> list:
    """Generate fun facts from the chat stats."""
    facts = []

    # Most active day
    if stats['most_active_day']:
        day_es = DAY_NAMES_ES.get(stats['most_active_day'], stats['most_active_day'])
        # Add Friday music if the most active day is Friday
        music = 'friday-im-in-love' if stats['most_active_day'] == 'Friday' else None
        facts.append({
            'title': 'Día Favorito',
            'value': day_es,
            'description': f"A la familia le encanta chatear los {day_es.lower()}!",
            'music': music
        })

    # Most active hour (Argentina time)
    hour = stats['most_active_hour']
    time_str = f"{hour}:00"
    facts.append({
        'title': 'Hora Pico',
        'value': time_str,
        'description': 'Cuando el chat explota! (hora de Argentina)'
    })

    # Top conversation starter
    if stats['conversation_starters']:
        top_starter = max(stats['conversation_starters'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'Arranca Conversaciones',
            'value': top_starter[0],
            'description': f"Inició {top_starter[1]} conversaciones este año!"
        })

    # Night owl (local time)
    if stats['night_owls']:
        night_owl = max(stats['night_owls'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'Ave Nocturna',
            'value': night_owl[0],
            'description': f"Envió {night_owl[1]} mensajes entre medianoche y las 5 AM (de su hora local)!",
            'music': 'bajan'
        })

    # Early bird (local time)
    if stats['early_birds']:
        early_bird = max(stats['early_birds'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'Madrugador/a',
            'value': early_bird[0],
            'description': f"Envió {early_bird[1]} mensajes antes de las 8 AM (de su hora local)!",
            'music': 'here-comes-the-sun'
        })

    # Most censored (deleted messages)
    if stats.get('deleted_by_sender'):
        top_deleted = max(stats['deleted_by_sender'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'El/La Más Censurado/a',
            'value': top_deleted[0],
            'description': f"Tuvo que borrar {top_deleted[1]} mensajes este año!",
            'music': 'mejor-no-hablar'
        })

    # Most media shared
    if stats['media_by_sender']:
        top_media = max(stats['media_by_sender'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'Campeón de Fotos',
            'value': top_media[0],
            'description': f"Compartió {top_media[1]} fotos y videos!"
        })

    # Most links shared
    if stats['links_by_sender']:
        top_links = max(stats['links_by_sender'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'Curador de Links',
            'value': top_links[0],
            'description': f"Compartió {top_links[1]} links con la familia!"
        })

    # Most emojis
    if stats['emoji_by_sender']:
        top_emoji = max(stats['emoji_by_sender'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'Master de Emojis',
            'value': top_emoji[0],
            'description': f"Usó emojis en {top_emoji[1]} mensajes!"
        })

    # Longest average messages
    if stats['avg_message_length']:
        top_length = max(stats['avg_message_length'].items(), key=lambda x: x[1])
        facts.append({
            'title': 'El/La Novelista',
            'value': top_length[0],
            'description': f"Promedio de {top_length[1]} palabras por mensaje!",
            'music': 'los-libros'
        })

    # Top emoji
    if stats.get('top_emojis'):
        top_emoji_char, top_emoji_count = list(stats['top_emojis'].items())[0]
        # Fix heart emoji display
        if top_emoji_char == '\u2764':
            top_emoji_char = '\u2764\uFE0F'  # ❤️
        # Add heart music if the top emoji is a heart
        music = 'yo-vengo-a-ofrecer' if '\u2764' in top_emoji_char or '❤' in top_emoji_char else None
        facts.append({
            'title': 'Emoji Favorito',
            'value': top_emoji_char,
            'description': f"Usado {top_emoji_count:,} veces este año!",
            'music': music
        })

    # Peak hour (single hour with most messages)
    if stats.get('peak_hour_datetime'):
        peak = stats['peak_hour_datetime']  # Format: YYYY-MM-DD HH
        try:
            from datetime import datetime
            dt = datetime.strptime(peak, '%Y-%m-%d %H')
            day = dt.strftime('%d de %B')
            # Translate month
            for en, es in MONTH_NAMES_ES.items():
                day = day.replace(en, es)
            hour = dt.strftime('%H:00')
            facts.append({
                'title': 'La Hora Pico',
                'value': f"{hour}",
                'description': f"El {day} - la hora con más mensajes del año!"
            })
        except:
            pass

    # Longest conversation
    if stats.get('longest_conversation'):
        conv = stats['longest_conversation']
        if conv.get('participants') and len(conv['participants']) >= 2:
            p1, p2 = conv['participants'][:2]
            length = conv.get('length', 0)
            facts.append({
                'title': 'Conversación Más Larga',
                'value': f"{p1} y {p2}",
                'description': f"¡{length} mensajes seguidos sin parar!"
            })

    return facts


def build_ranking_html(sender_percentages):
    """Build the ranking list HTML - show everyone."""
    items = []
    for i, (name, count, pct) in enumerate(sender_percentages):
        item = f'''
        <div class="rank-item" onclick="showPerson('{name}')">
            <div class="rank-number">#{i+1}</div>
            <div class="rank-info">
                <div class="rank-name">{name}</div>
                <div class="rank-stat">{count:,} mensajes</div>
                <div class="rank-bar">
                    <div class="rank-bar-fill" style="width: {pct}%"></div>
                </div>
            </div>
        </div>
        '''
        items.append(item)
    return ''.join(items)


def build_dual_ranking_html(messages_by_sender, words_by_sender, media_by_sender=None):
    """Build two-column ranking: text messages and words."""
    if media_by_sender is None:
        media_by_sender = {}

    # Calculate text messages (total messages minus media)
    text_msgs_by_sender = {}
    for sender, total_msgs in messages_by_sender.items():
        media_msgs = media_by_sender.get(sender, 0)
        text_msgs_by_sender[sender] = total_msgs - media_msgs

    # Sort by text messages
    msg_sorted = sorted(text_msgs_by_sender.items(), key=lambda x: x[1], reverse=True)
    max_msgs = msg_sorted[0][1] if msg_sorted else 1

    # Sort by words
    word_sorted = sorted(words_by_sender.items(), key=lambda x: x[1], reverse=True)
    max_words = word_sorted[0][1] if word_sorted else 1

    # Build messages column (text only)
    msg_items = []
    for i, (name, count) in enumerate(msg_sorted):
        pct = (count / max_msgs) * 100
        msg_items.append(f'''
        <div class="mini-rank-item">
            <span class="mini-rank-num">#{i+1}</span>
            <span class="mini-rank-name">{name}</span>
            <span class="mini-rank-val">{count:,}</span>
        </div>''')

    # Build words column
    word_items = []
    for i, (name, count) in enumerate(word_sorted):
        pct = (count / max_words) * 100
        word_items.append(f'''
        <div class="mini-rank-item">
            <span class="mini-rank-num">#{i+1}</span>
            <span class="mini-rank-name">{name}</span>
            <span class="mini-rank-val">{count:,}</span>
        </div>''')

    return ''.join(msg_items), ''.join(word_items)


def build_carousel_html(fun_facts):
    """Build the carousel slides HTML."""
    slides = []
    for fact in fun_facts:
        music_attr = f'data-music="{fact["music"]}"' if fact.get('music') else ''
        slide = f'''
        <div class="carousel-slide" {music_attr}>
            <div class="fact-card">
                <div class="fact-title">{fact['title']}</div>
                <div class="fact-value">{fact['value']}</div>
                <div class="fact-description">{fact['description']}</div>
            </div>
        </div>
        '''
        slides.append(slide)
    return ''.join(slides)


def build_word_cloud_html(top_words):
    """Build the word cloud HTML with sizes proportional to frequency."""
    if not top_words:
        return ''
    max_count = top_words[0][1] if top_words else 1
    min_count = top_words[-1][1] if top_words else 1
    words = []

    import math

    for word, count in top_words:
        # Calculate size based on log scale for better distribution
        if max_count > min_count:
            # Normalize to 0-1 range using log scale
            log_ratio = (math.log(count) - math.log(min_count)) / (math.log(max_count) - math.log(min_count))
        else:
            log_ratio = 0.5

        # Map to font size (0.6rem to 3rem)
        font_size = 0.6 + (log_ratio * 2.4)
        opacity = 0.6 + (log_ratio * 0.4)

        words.append(f'<span class="word" style="font-size: {font_size:.2f}rem; opacity: {opacity:.2f};">{word}</span>')

    return ''.join(words)


def build_emoji_display_html(top_emojis):
    """Build the top emojis display."""
    if not top_emojis:
        return ''

    # Emoji mapping to ensure correct display (add variation selector for colored emojis)
    EMOJI_MAP = {
        '\u2764': '\u2764\uFE0F',  # ❤ -> ❤️
        '\u2665': '\u2665\uFE0F',  # ♥ -> ♥️
        '\u263A': '\u263A\uFE0F',  # ☺ -> ☺️
        '\u2639': '\u2639\uFE0F',  # ☹ -> ☹️
    }

    emojis_html = []
    for emoji, count in list(top_emojis.items())[:10]:
        display_emoji = EMOJI_MAP.get(emoji, emoji)
        emojis_html.append(f'''
        <div class="emoji-item">
            <span class="emoji-char">{display_emoji}</span>
            <span class="emoji-count">{count:,}</span>
        </div>
        ''')
    return ''.join(emojis_html)


def build_rare_emoji_display_html(rare_emojis):
    """Build the rare emojis display."""
    if not rare_emojis:
        return ''

    # Same mapping as in top emojis
    EMOJI_MAP = {
        '\u2764': '\u2764\uFE0F',  # ❤ -> ❤️
        '\u2665': '\u2665\uFE0F',  # ♥ -> ♥️
        '\u263A': '\u263A\uFE0F',  # ☺ -> ☺️
        '\u2639': '\u2639\uFE0F',  # ☹ -> ☹️
    }

    emojis_html = []
    for emoji, count in list(rare_emojis.items()):
        display_emoji = EMOJI_MAP.get(emoji, emoji)
        emojis_html.append(f'''
        <div class="emoji-item rare">
            <span class="emoji-char">{display_emoji}</span>
            <span class="emoji-count">{count}x</span>
        </div>
        ''')
    return ''.join(emojis_html)


def build_person_buttons_html(persons_data, images_by_sender):
    """Build the person selector buttons with image backgrounds - show everyone."""
    import random
    buttons = []
    for p in persons_data:
        name = p['name']
        # Get up to 4 random images for this person
        person_images = images_by_sender.get(name, [])
        if person_images:
            random.shuffle(person_images)
            selected = person_images[:4]
            # Create image grid background - use contain to keep aspect ratio
            if len(selected) >= 4:
                img_style = f'''background-image:
                    url('media/{selected[0]}'),
                    url('media/{selected[1]}'),
                    url('media/{selected[2]}'),
                    url('media/{selected[3]}');
                    background-size: 50% 50%;
                    background-position: 0 0, 100% 0, 0 100%, 100% 100%;
                    background-repeat: no-repeat;'''
            else:
                img_style = f"background-image: url('media/{selected[0]}'); background-size: cover; background-position: center;"
            buttons.append(f'''<button class="person-btn has-images" style="{img_style}" onclick="showPerson('{name}')"><span class="person-btn-name">{name}</span></button>''')
        else:
            buttons.append(f"<button class=\"person-btn\" onclick=\"showPerson('{name}')\">{name}</button>")
    return ''.join(buttons)


def build_media_gallery_html(media_files):
    """Build the media gallery with many small images/videos to create an overwhelming effect."""
    import random
    if not media_files:
        return ''

    # Separate images and videos
    images = [f for f in media_files if f.startswith('IMG-')]
    videos = [f for f in media_files if f.startswith('VID-')]

    # Select random items - 90 images and 10 videos for overwhelming effect
    random.shuffle(images)
    random.shuffle(videos)

    selected_images = images[:90]
    selected_videos = videos[:10]

    # Mix them together
    all_items = [(img, 'img') for img in selected_images] + [(vid, 'vid') for vid in selected_videos]
    random.shuffle(all_items)

    gallery_items = []

    for item, item_type in all_items:
        if item_type == 'img':
            gallery_items.append(f'''<div class="gallery-item"><img src="media/{item}" alt="" loading="lazy" onclick="openMedia(this.src)"></div>''')
        else:
            gallery_items.append(f'''<div class="gallery-item"><video autoplay muted loop playsinline onclick="openMedia(this.src)"><source src="media/{item}" type="video/mp4"></video></div>''')

    return ''.join(gallery_items)


def get_comparison_text(total_words, total_messages, media_count):
    """Generate fun comparison texts for stats."""
    # Words comparison: Harry Potter 1 has ~77,000 words
    hp_books = total_words / 77000
    words_comparison = f"Casi {hp_books:.1f} libros de Harry Potter 1 ⚡"

    # Messages comparison: Beethoven's 5th Symphony is ~32 minutes
    # Each notification sound is ~1 second, so total seconds of notifications
    notification_seconds = total_messages  # 1 second per notification
    beethoven_5th_seconds = 32 * 60  # 32 minutes in seconds
    symphony_plays = notification_seconds / beethoven_5th_seconds
    messages_comparison = f"Si tenés el celular con sonido, son suficientes notificaciones para tocar la 5ta Sinfonía de Beethoven {symphony_plays:.0f} veces seguidas"

    # Media comparison
    if media_count > 1000:
        media_comparison = f"Un álbum de fotos gigante con {media_count:,} recuerdos"
    else:
        media_comparison = f"{media_count:,} recuerdos compartidos"

    return words_comparison, messages_comparison, media_comparison


def calculate_data_by_sender(media_files_by_sender, media_folder='media'):
    """Calculate total MB of media sent by each person."""
    import os
    data_by_sender = {}

    for sender, files in media_files_by_sender.items():
        total_bytes = 0
        for filename in files:
            filepath = os.path.join(media_folder, filename)
            if os.path.exists(filepath):
                total_bytes += os.path.getsize(filepath)
        # Convert to MB
        data_by_sender[sender] = total_bytes / (1024 * 1024)

    # Sort by data usage descending
    return dict(sorted(data_by_sender.items(), key=lambda x: x[1], reverse=True))


def build_audio_ranking_html(audio_duration_by_sender):
    """Build the audio talkers ranking with Abbey Road comparison."""
    if not audio_duration_by_sender:
        return '', ''

    # Sort by duration
    sorted_audio = sorted(audio_duration_by_sender.items(), key=lambda x: x[1], reverse=True)
    total_seconds = sum(audio_duration_by_sender.values())
    total_minutes = total_seconds / 60

    # Abbey Road is ~47 minutes
    abbey_road_minutes = 47

    items = []
    for i, (name, seconds) in enumerate(sorted_audio):
        if seconds < 10:
            continue
        minutes = seconds / 60
        items.append(f'''
        <div class="audio-rank-item">
            <span class="audio-rank-num">#{i+1}</span>
            <span class="audio-rank-name">{name}</span>
            <span class="audio-rank-mins">{minutes:.1f} min</span>
        </div>
        ''')

    # Top person comparison
    if sorted_audio:
        top_name, top_seconds = sorted_audio[0]
        top_minutes = top_seconds / 60
        abbey_times = top_minutes / abbey_road_minutes
        comparison = f"{top_name} habló {top_minutes:.0f} minutos - como escuchar Abbey Road {abbey_times:.1f} veces"
    else:
        comparison = ''

    return ''.join(items), comparison


def build_data_ranking_html(data_by_sender):
    """Build the data consumption ranking HTML."""
    if not data_by_sender:
        return ''

    items = []
    for i, (name, mb) in enumerate(data_by_sender.items()):
        if mb < 0.1:
            continue
        items.append(f'''
        <div class="data-rank-item">
            <span class="data-rank-num">#{i+1}</span>
            <span class="data-rank-name">{name}</span>
            <span class="data-rank-mb">{mb:.1f} MB</span>
        </div>
        ''')
    return ''.join(items)


def get_day_excerpts(messages: list, date_str: str, max_items: int = 80) -> dict:
    """Get all messages from a specific day for grid display."""
    from datetime import datetime

    text_items = []
    media_items = []

    # Parse target date
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d')
    except:
        return {'items': [], 'total_count': 0}

    for msg in messages:
        if msg.timestamp.date() == target_date.date():
            content = msg.content.strip()

            # Check if it's media
            if msg.is_media and msg.media_filename:
                if msg.media_filename.startswith(('IMG-2025', 'VID-2025')):
                    media_items.append({
                        'type': 'media',
                        'filename': msg.media_filename,
                        'sender': msg.sender,
                        'time': msg.timestamp.strftime('%H:%M'),
                        'media_type': 'video' if msg.media_filename.startswith('VID') else 'image'
                    })
            # Text message
            elif not msg.is_media and not msg.is_deleted and len(content) > 3:
                # Skip links-only messages
                if content.startswith('http'):
                    continue
                # Store full content for tooltip, truncate for display
                full_content = content
                display_content = content
                if len(content) > 60:
                    display_content = content[:57] + '...'
                text_items.append({
                    'type': 'text',
                    'sender': msg.sender,
                    'content': display_content,
                    'full_content': full_content,
                    'time': msg.timestamp.strftime('%H:%M'),
                    'length': len(full_content)
                })

    total_count = len(text_items) + len(media_items)

    # Prioritize longer text messages
    text_items.sort(key=lambda x: x['length'], reverse=True)

    # Take more text items (50) and fewer media items (30)
    import random
    random.shuffle(media_items)
    selected_texts = text_items[:50]
    selected_media = media_items[:30]

    # Mix them together
    all_items = selected_texts + selected_media
    random.shuffle(all_items)

    return {
        'items': all_items[:max_items],
        'total_count': total_count
    }


def build_day_excerpts_html(day_data: dict) -> str:
    """Build HTML for day excerpts as a 10x8 grid."""
    import html as html_escape
    items = day_data.get('items', [])
    if not items:
        return ''

    html_parts = ['<div class="day-grid">']

    for item in items:
        if item['type'] == 'media':
            if item['media_type'] == 'video':
                html_parts.append(f'''<div class="day-grid-item media-item" onclick="openMedia('media/{item['filename']}')">
                    <video autoplay muted loop playsinline>
                        <source src="media/{item['filename']}" type="video/mp4">
                    </video>
                </div>''')
            else:
                html_parts.append(f'''<div class="day-grid-item media-item" onclick="openMedia('media/{item['filename']}')">
                    <img src="media/{item['filename']}" alt="" loading="lazy">
                </div>''')
        else:
            # Text message with tooltip for full content
            full_content = html_escape.escape(item.get('full_content', item['content']))
            display_content = html_escape.escape(item['content'])
            html_parts.append(f'''<div class="day-grid-item text-item" title="{full_content}">
                <span class="grid-sender">{item['sender']}</span>
                <span class="grid-content">{display_content}</span>
            </div>''')

    html_parts.append('</div>')
    return ''.join(html_parts)


def build_github_calendar_html(messages_by_date):
    """Build a GitHub-style contribution calendar for 2025."""
    from datetime import datetime, timedelta

    if not messages_by_date:
        return ''

    # Get all counts to determine levels
    counts = list(messages_by_date.values())
    if not counts:
        return ''

    max_count = max(counts)
    if max_count == 0:
        return ''

    # Calculate quartiles for color levels
    p25 = max_count * 0.25
    p50 = max_count * 0.50
    p75 = max_count * 0.75

    def get_level(count):
        if count == 0:
            return 0
        elif count <= p25:
            return 1
        elif count <= p50:
            return 2
        elif count <= p75:
            return 3
        else:
            return 4

    # Generate calendar for 2025 (Jan 1 to Dec 31)
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 12, 31)

    # Build grid (7 rows for days of week, 53 columns for weeks)
    calendar_cells = []

    current_date = start_date
    # Adjust start to beginning of week (Sunday = 0)
    while current_date.weekday() != 6:  # 6 is Sunday
        current_date -= timedelta(days=1)

    while current_date <= end_date or current_date.weekday() != 6:
        date_str = current_date.strftime('%Y-%m-%d')
        count = messages_by_date.get(date_str, 0)
        level = get_level(count) if current_date.year == 2025 else 0

        title = f"{date_str}: {count} mensajes" if count > 0 else date_str
        calendar_cells.append(f'<div class="calendar-day level-{level}" title="{title}"></div>')
        current_date += timedelta(days=1)

        if current_date > end_date and current_date.weekday() == 6:
            break

    return ''.join(calendar_cells)


def filter_gibberish_word(word):
    """Filter out gibberish/URL parameter words."""
    url_params = {'mibextid', 'wwxifr', 'gasearch', 'source', 'fbclid', 'utm', 'ref', 'share', 'thefork',
                  'edited', 'sharing', 'shared', 'this', 'message', 'was', 'deleted', 'you', 'attached', 'file'}
    if len(word) < 3 or len(word) > 15:
        return False
    if any(c.isdigit() for c in word):
        return False
    if word.lower() in url_params:
        return False
    # Skip words with too many consonants in a row (gibberish)
    vowels = set('aeiouáéíóú')
    consonant_streak = 0
    max_streak = 0
    for c in word.lower():
        if c.isalpha() and c not in vowels:
            consonant_streak += 1
            max_streak = max(max_streak, consonant_streak)
        else:
            consonant_streak = 0
    if max_streak > 4:
        return False
    return True


def build_person_details_html(persons_data, words_by_person, unique_words_by_person=None):
    """Build the person detail cards - show everyone."""
    if unique_words_by_person is None:
        unique_words_by_person = {}
    details = []
    for p in persons_data:
        safe_name = p['name'].replace(' ', '-')
        traits_html = ''.join([f'<span class="trait">{t}</span>' for t in p['traits']]) if p['traits'] else ''

        # Get top words for this person (with filtering for gibberish)
        person_words = words_by_person.get(p['name'], {})
        # Filter out gibberish/URL params
        filtered_words = {w: c for w, c in person_words.items() if filter_gibberish_word(w)}
        top_words_list = list(filtered_words.items())[:5]
        words_html = ''
        if top_words_list:
            words_html = '<div class="person-words"><div class="words-title">Palabras favoritas:</div><div class="words-list">'
            words_html += ', '.join([f'<span class="fav-word">{w} ({c})</span>' for w, c in top_words_list])
            words_html += '</div></div>'

        # Get unique words for this person
        unique_words = unique_words_by_person.get(p['name'], [])
        unique_html = ''
        if unique_words:
            unique_html = '<div class="person-words unique-words"><div class="words-title">Palabras únicas (solo vos las usás):</div><div class="words-list">'
            unique_html += ', '.join([f'<span class="fav-word unique">{w}</span>' for w in unique_words])
            unique_html += '</div></div>'

        detail = f'''
        <div class="person-detail card" id="detail-{safe_name}" data-name="{p['name']}">
            <div class="person-header">
                <div class="person-name">{p['name']}</div>
            </div>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-value">{p['messages']:,}</div>
                    <div class="stat-name">Mensajes</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{p['words']:,}</div>
                    <div class="stat-name">Palabras</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{p['media']}</div>
                    <div class="stat-name">Fotos/Videos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{p['emojis']}</div>
                    <div class="stat-name">Con Emojis</div>
                </div>
            </div>
            {words_html}
            {unique_html}
            <div class="traits">
                {traits_html}
            </div>
        </div>
        '''
        details.append(detail)
    return ''.join(details)


def generate_html(stats: dict, messages: list) -> str:
    """Generate the Wrapped 2025 HTML."""

    # Sort senders by message count
    sorted_senders = sorted(
        stats['messages_by_sender'].items(),
        key=lambda x: x[1],
        reverse=True
    )

    # Get top words
    top_words = list(stats['top_words'].items())[:20]

    # Generate fun facts
    fun_facts = get_fun_facts(stats, messages)

    # Calculate percentages for charts
    total = stats['total_messages']
    sender_percentages = [
        (name, count, round(count / total * 100, 1))
        for name, count in sorted_senders if count > 10
    ]

    # Build person cards data
    persons_data = []
    for sender, count in sorted_senders:
        if count < 5:
            continue
        title = PERSON_TITLES.get(sender, 'Family Member')
        words = stats['words_by_sender'].get(sender, 0)
        media = stats['media_by_sender'].get(sender, 0)
        emojis = stats['emoji_by_sender'].get(sender, 0)
        links = stats['links_by_sender'].get(sender, 0)
        avg_len = stats['avg_message_length'].get(sender, 0)
        night = stats['night_owls'].get(sender, 0)
        early = stats['early_birds'].get(sender, 0)
        convos = stats['conversation_starters'].get(sender, 0)

        # Determine personality based on stats
        traits = []
        if media > 50:
            traits.append("Visual")
        if emojis > count * 0.3:
            traits.append("Emojis")
        if links > 20:
            traits.append("Links")
        if avg_len > 10:
            traits.append("Mensajes largos")
        if night > 10:
            traits.append("Nocturno/a")
        if early > 20:
            traits.append("Madrugador/a")
        if convos > 30:
            traits.append("Iniciador/a")

        persons_data.append({
            'name': sender,
            'title': title,
            'messages': count,
            'words': words,
            'media': media,
            'emojis': emojis,
            'links': links,
            'avg_length': avg_len,
            'night_messages': night,
            'early_messages': early,
            'conversations_started': convos,
            'traits': traits[:3] if traits else [],
            'color': COLORS[len(persons_data) % len(COLORS)]
        })

    # Pre-build all dynamic HTML parts
    ranking_html = build_ranking_html(sender_percentages)
    msg_ranking_html, words_ranking_html = build_dual_ranking_html(
        stats['messages_by_sender'], stats['words_by_sender'], stats.get('media_by_sender', {})
    )
    carousel_html = build_carousel_html(fun_facts)
    word_cloud_html = build_word_cloud_html(top_words)
    emoji_display_html = build_emoji_display_html(stats.get('top_emojis', {}))
    rare_emoji_html = build_rare_emoji_display_html(stats.get('rare_emojis', {}))
    person_buttons_html = build_person_buttons_html(persons_data, stats.get('images_by_sender', {}))
    person_details_html = build_person_details_html(persons_data, stats.get('words_by_person', {}), stats.get('unique_words_by_person', {}))
    media_gallery_html = build_media_gallery_html(stats.get('media_files', []))
    calendar_html = build_github_calendar_html(stats.get('messages_by_date', {}))
    data_by_sender = calculate_data_by_sender(stats.get('media_files_by_sender', {}))
    data_ranking_html = build_data_ranking_html(data_by_sender)
    total_data_mb = sum(data_by_sender.values())
    audio_ranking_html, audio_comparison = build_audio_ranking_html(stats.get('audio_duration_by_sender', {}))

    # Get excerpts from most active day
    most_active_date = stats.get('most_active_date', '')
    day_excerpts_data = get_day_excerpts(messages, most_active_date) if most_active_date else {}
    day_excerpts_html = build_day_excerpts_html(day_excerpts_data)

    # Most active date formatting
    most_active_date_formatted = ''
    if most_active_date:
        from datetime import datetime
        try:
            dt = datetime.strptime(most_active_date, '%Y-%m-%d')
            most_active_date_formatted = dt.strftime('%d de %B').lstrip('0')
            # Translate month
            for en, es in MONTH_NAMES_ES.items():
                most_active_date_formatted = most_active_date_formatted.replace(en, es)
        except:
            most_active_date_formatted = most_active_date

    # Get comparison texts
    words_comparison, messages_comparison, media_comparison = get_comparison_text(
        stats['total_words'], stats['total_messages'], stats['media_count']
    )

    # JSON data for JavaScript
    persons_json = json.dumps(persons_data, ensure_ascii=False)
    facts_json = json.dumps(fun_facts, ensure_ascii=False)

    # Monthly data for chart
    months_order = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    monthly_data = [stats['messages_by_month'].get(m, 0) for m in months_order]
    monthly_json = json.dumps(monthly_data)

    # Get most active month (translate to Spanish)
    most_active_month = 'N/A'
    if stats['messages_by_month']:
        most_active_month_en = max(stats['messages_by_month'].items(), key=lambda x: x[1])[0]
        most_active_month = MONTH_NAMES_ES.get(most_active_month_en, most_active_month_en)

    # Format numbers
    total_messages = f"{stats['total_messages']:,}"
    total_words = f"{stats['total_words']:,}"
    num_participants = len([p for p in persons_data])

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Familia Wrapped 2025</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        :root {{
            --primary: #1DB954;
            --secondary: #FF6B6B;
            --dark: #121212;
            --light: #ffffff;
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            --gradient-5: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }}

        html, body {{
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark);
            color: var(--light);
            overflow-x: hidden;
            scroll-behavior: smooth;
        }}

        /* Intro Screen */
        .intro-screen {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--gradient-1);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            transition: opacity 0.5s, transform 0.5s;
        }}

        .intro-screen.hidden {{
            opacity: 0;
            transform: scale(1.1);
            pointer-events: none;
        }}

        .intro-title {{
            font-size: 3rem;
            font-weight: 900;
            text-align: center;
            margin-bottom: 1rem;
            animation: pulse 2s infinite;
        }}

        .intro-subtitle {{
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 3rem;
        }}

        .intro-year {{
            font-size: 8rem;
            font-weight: 900;
            background: linear-gradient(45deg, #fff, #ffd700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: glow 2s ease-in-out infinite alternate;
        }}

        .start-btn {{
            margin-top: 2rem;
            padding: 1rem 3rem;
            font-size: 1.2rem;
            font-weight: 700;
            border: none;
            border-radius: 50px;
            background: white;
            color: #764ba2;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
        }}

        .start-btn:hover {{
            transform: scale(1.05);
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }}

        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.02); }}
        }}

        @keyframes glow {{
            from {{ filter: drop-shadow(0 0 20px rgba(255,215,0,0.5)); }}
            to {{ filter: drop-shadow(0 0 40px rgba(255,215,0,0.8)); }}
        }}

        /* Main Container */
        .container {{
            max-width: 100%;
            overflow-x: hidden;
        }}

        /* Slides */
        .slide {{
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem 1.5rem;
            position: relative;
            overflow: hidden;
        }}

        .slide:nth-child(1) {{ background: var(--gradient-1); }}
        .slide:nth-child(2) {{ background: var(--gradient-2); }}
        .slide:nth-child(3) {{ background: var(--gradient-3); }}
        .slide:nth-child(4) {{ background: var(--gradient-4); }}
        .slide:nth-child(5) {{ background: var(--gradient-5); }}
        .slide:nth-child(6) {{ background: var(--gradient-1); }}
        .slide:nth-child(7) {{ background: var(--gradient-2); }}
        .slide:nth-child(8) {{ background: var(--gradient-3); }}

        .slide-title {{
            font-size: 2.5rem;
            font-weight: 900;
            text-align: center;
            margin-bottom: 2rem;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }}

        .big-number {{
            font-size: 5rem;
            font-weight: 900;
            margin: 1rem 0;
            animation: countUp 1s ease-out;
        }}

        .stat-label {{
            font-size: 1.5rem;
            opacity: 0.9;
            text-align: center;
        }}

        /* Cards */
        .card {{
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 2rem;
            margin: 1rem 0;
            width: 100%;
            max-width: 400px;
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s;
        }}

        .card:hover {{
            transform: translateY(-5px);
        }}

        /* Dual Ranking */
        .dual-ranking {{
            display: flex;
            gap: 1rem;
            width: 100%;
            max-width: 500px;
        }}

        .ranking-column {{
            flex: 1;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 1rem;
        }}

        .column-title {{
            font-size: 1rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 0.75rem;
            opacity: 0.9;
        }}

        .mini-ranking {{
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }}

        .mini-rank-item {{
            display: flex;
            align-items: center;
            padding: 0.4rem 0.5rem;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-size: 0.8rem;
        }}

        .mini-rank-num {{
            font-weight: 700;
            width: 25px;
            opacity: 0.7;
        }}

        .mini-rank-name {{
            flex: 1;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }}

        .mini-rank-val {{
            font-weight: 700;
            color: #ffd700;
            font-size: 0.75rem;
        }}

        /* Ranking */
        .ranking {{
            width: 100%;
            max-width: 400px;
        }}

        .rank-item {{
            display: flex;
            align-items: center;
            padding: 1rem;
            margin: 0.5rem 0;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            transition: transform 0.3s, background 0.3s;
            cursor: pointer;
        }}

        .rank-item:hover {{
            background: rgba(255,255,255,0.2);
            transform: scale(1.02);
        }}

        .rank-number {{
            font-size: 2rem;
            font-weight: 900;
            width: 50px;
            text-align: center;
        }}

        .rank-info {{
            flex: 1;
            margin-left: 1rem;
        }}

        .rank-name {{
            font-size: 1.2rem;
            font-weight: 700;
        }}

        .rank-stat {{
            font-size: 0.9rem;
            opacity: 0.8;
        }}

        .rank-bar {{
            height: 6px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
            margin-top: 0.5rem;
            overflow: hidden;
        }}

        .rank-bar-fill {{
            height: 100%;
            background: white;
            border-radius: 3px;
            transition: width 1s ease-out;
        }}

        /* Person Selector */
        .person-selector {{
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
            max-width: 400px;
            margin: 1rem 0;
        }}

        .person-btn {{
            padding: 0.75rem 1.25rem;
            border: 2px solid rgba(255,255,255,0.5);
            background: rgba(255,255,255,0.1);
            color: white;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }}

        .person-btn.has-images {{
            width: 100px;
            height: 100px;
            border-radius: 16px;
            padding: 0;
            position: relative;
            background-color: rgba(0,0,0,0.3);
            overflow: hidden;
            border: none;
        }}

        .person-btn.has-images::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%);
            z-index: 1;
            pointer-events: none;
        }}

        .person-btn.has-images::after {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            box-shadow: inset 0 0 20px 10px rgba(0,0,0,0.5);
            border-radius: 16px;
            z-index: 2;
            pointer-events: none;
        }}

        .person-btn.has-images .person-btn-name {{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.9));
            padding: 0.5rem 0.25rem 0.25rem;
            font-size: 0.75rem;
            text-align: center;
            z-index: 3;
            font-weight: 700;
            text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }}

        .person-btn:hover, .person-btn.active {{
            background: white;
            color: #333;
            transform: scale(1.05);
        }}

        .person-btn.has-images:hover, .person-btn.has-images.active {{
            background-color: rgba(0,0,0,0.5);
            color: white;
        }}

        /* Person Detail Card */
        .person-detail {{
            display: none;
            animation: slideIn 0.5s ease-out;
        }}

        .person-detail.active {{
            display: block;
        }}

        @keyframes slideIn {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

        .person-header {{
            text-align: center;
            margin-bottom: 1.5rem;
        }}

        .person-name {{
            font-size: 2.5rem;
            font-weight: 900;
        }}

        .person-title {{
            font-size: 1.1rem;
            opacity: 0.8;
            font-style: italic;
        }}

        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }}

        .stat-box {{
            background: rgba(255,255,255,0.15);
            padding: 1.5rem;
            border-radius: 16px;
            text-align: center;
        }}

        .stat-value {{
            font-size: 2rem;
            font-weight: 800;
        }}

        .stat-name {{
            font-size: 0.85rem;
            opacity: 0.8;
            margin-top: 0.25rem;
        }}

        .traits {{
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
            margin-top: 1.5rem;
        }}

        .trait {{
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }}

        /* Word Cloud */
        .word-cloud {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 0.4rem;
            max-width: 95%;
            width: 100%;
            padding: 1rem;
            max-height: 60vh;
            overflow-y: auto;
        }}

        .word {{
            padding: 0.2rem 0.5rem;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-weight: 500;
            transition: transform 0.2s, background 0.2s;
            white-space: nowrap;
        }}

        .word:hover {{
            transform: scale(1.15);
            background: rgba(255,255,255,0.3);
        }}

        /* Emoji display */
        .emoji-grid {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            max-width: 400px;
            margin-top: 1.5rem;
        }}

        .emoji-item {{
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255,255,255,0.15);
            padding: 1rem;
            border-radius: 16px;
            min-width: 70px;
        }}

        .emoji-char {{
            font-size: 2.5rem;
        }}

        .emoji-count {{
            font-size: 0.85rem;
            opacity: 0.8;
            margin-top: 0.25rem;
        }}

        .emoji-item.rare {{
            background: rgba(255,255,255,0.1);
            border: 1px dashed rgba(255,255,255,0.3);
        }}

        /* Person favorite words */
        .person-words {{
            margin-top: 1.5rem;
            text-align: center;
        }}

        .words-title {{
            font-size: 0.9rem;
            opacity: 0.7;
            margin-bottom: 0.5rem;
        }}

        .words-list {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
        }}

        .fav-word {{
            background: rgba(255,255,255,0.2);
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.9rem;
        }}

        .fav-word.unique {{
            background: rgba(78, 205, 196, 0.3);
            border: 1px solid rgba(78, 205, 196, 0.5);
        }}

        .unique-words {{
            margin-top: 1rem;
        }}

        .unique-words .words-title {{
            color: #4ecdc4;
        }}

        /* Fun Facts Carousel */
        .carousel {{
            width: 100%;
            max-width: 400px;
            overflow: hidden;
            position: relative;
        }}

        .carousel-track {{
            display: flex;
            transition: transform 0.5s ease;
        }}

        .carousel-slide {{
            min-width: 100%;
            padding: 0 1rem;
        }}

        .fact-card {{
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 2rem;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
        }}

        .fact-title {{
            font-size: 1rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 1rem;
        }}

        .fact-value {{
            font-size: 2.5rem;
            font-weight: 900;
            margin: 1rem 0;
        }}

        .fact-description {{
            font-size: 1rem;
            opacity: 0.9;
        }}

        .carousel-dots {{
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }}

        .carousel-dot {{
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            cursor: pointer;
            transition: background 0.3s, transform 0.3s;
        }}

        .carousel-dot.active {{
            background: white;
            transform: scale(1.2);
        }}

        .carousel-nav {{
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1rem;
        }}

        .carousel-btn {{
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s;
        }}

        .carousel-btn:hover {{
            background: white;
            color: #333;
        }}

        /* Charts */
        .chart-container {{
            width: 100%;
            max-width: 400px;
            margin: 1rem 0;
        }}

        .bar-chart {{
            display: flex;
            align-items: flex-end;
            height: 200px;
            gap: 4px;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
        }}

        .bar {{
            flex: 1;
            background: white;
            border-radius: 4px 4px 0 0;
            transition: height 1s ease-out;
            position: relative;
            min-height: 4px;
        }}

        .bar-label {{
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.6rem;
            white-space: nowrap;
        }}

        /* Scroll indicator */
        .scroll-indicator {{
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: bounce 2s infinite;
            opacity: 0.7;
            z-index: 100;
            pointer-events: none;
        }}

        .scroll-indicator span {{
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
        }}

        @keyframes bounce {{
            0%, 20%, 50%, 80%, 100% {{ transform: translateX(-50%) translateY(0); }}
            40% {{ transform: translateX(-50%) translateY(-10px); }}
            60% {{ transform: translateX(-50%) translateY(-5px); }}
        }}

        /* Floating elements */
        .floating {{
            position: absolute;
            font-size: 3rem;
            opacity: 0.2;
            animation: float 6s ease-in-out infinite;
        }}

        @keyframes float {{
            0%, 100% {{ transform: translateY(0) rotate(0deg); }}
            50% {{ transform: translateY(-20px) rotate(10deg); }}
        }}

        /* Music Player */
        .music-player {{
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            z-index: 1000;
        }}

        .music-btn {{
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: transform 0.3s;
        }}

        .music-btn:hover {{
            transform: scale(1.1);
        }}

        .music-btn.playing {{
            animation: pulse 1s infinite;
        }}

        /* Share section */
        .share-section {{
            margin-top: 2rem;
        }}

        .share-btn {{
            padding: 1rem 2rem;
            border: none;
            border-radius: 50px;
            background: white;
            color: #333;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            margin: 0.5rem;
            transition: transform 0.3s, box-shadow 0.3s;
        }}

        .share-btn:hover {{
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }}

        /* Footer */
        .footer {{
            text-align: center;
            padding: 3rem 1rem;
            background: var(--dark);
        }}

        .footer-text {{
            opacity: 0.6;
            font-size: 0.9rem;
        }}

        /* Comparison text */
        .comparison-text {{
            font-size: 0.9rem;
            opacity: 0.7;
            font-style: italic;
            margin-top: 0.5rem;
            text-align: center;
        }}

        /* Harry Potter lightning bolts */
        .hp-bolts {{
            display: inline-flex;
            align-items: center;
            margin-left: 0.5rem;
            vertical-align: middle;
        }}

        .hp-bolt {{
            width: 1.2rem;
            height: 1.2rem;
            color: #ffd700;
            filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.8));
            margin: 0 1px;
        }}

        .hp-bolt.partial {{
            opacity: 0.6;
        }}

        /* Media Gallery - dense overwhelming grid */
        .media-gallery {{
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 2px;
            max-width: 100%;
            width: 100%;
            padding: 0.5rem;
        }}

        .gallery-item {{
            aspect-ratio: 1;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }}

        .gallery-item:hover {{
            transform: scale(1.5);
            z-index: 10;
            position: relative;
        }}

        .gallery-item img,
        .gallery-item video {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}

        /* Media lightbox */
        .media-lightbox {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }}

        .media-lightbox.active {{
            display: flex;
        }}

        .media-lightbox img,
        .media-lightbox video {{
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        }}

        .lightbox-close {{
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 2rem;
            color: white;
            cursor: pointer;
            background: none;
            border: none;
        }}

        /* Word cloud image */
        .wordcloud-img {{
            max-width: 95%;
            width: 100%;
            border-radius: 16px;
        }}

        /* GitHub-style calendar */
        .calendar-container {{
            width: 100%;
            max-width: 400px;
            overflow-x: auto;
            padding: 1rem;
        }}

        .calendar-grid {{
            display: grid;
            grid-template-columns: repeat(53, 10px);
            grid-template-rows: repeat(7, 10px);
            gap: 2px;
        }}

        .calendar-day {{
            width: 10px;
            height: 10px;
            border-radius: 2px;
            background: rgba(255,255,255,0.1);
        }}

        .calendar-day.level-1 {{ background: #0e4429; }}
        .calendar-day.level-2 {{ background: #006d32; }}
        .calendar-day.level-3 {{ background: #26a641; }}
        .calendar-day.level-4 {{ background: #39d353; }}

        /* Data ranking */
        .data-ranking {{
            width: 100%;
            max-width: 350px;
        }}

        .data-rank-item {{
            display: flex;
            align-items: center;
            padding: 0.5rem 0.75rem;
            margin: 0.25rem 0;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-size: 0.9rem;
        }}

        .data-rank-num {{
            font-weight: 700;
            width: 30px;
            opacity: 0.7;
        }}

        .data-rank-name {{
            flex: 1;
            font-weight: 600;
        }}

        .data-rank-mb {{
            font-weight: 700;
            color: #ffd700;
        }}

        /* Audio ranking */
        .audio-ranking {{
            width: 100%;
            max-width: 350px;
        }}

        .audio-rank-item {{
            display: flex;
            align-items: center;
            padding: 0.5rem 0.75rem;
            margin: 0.25rem 0;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            font-size: 0.9rem;
        }}

        .audio-rank-num {{
            font-weight: 700;
            width: 30px;
            opacity: 0.7;
        }}

        .audio-rank-name {{
            flex: 1;
            font-weight: 600;
        }}

        .audio-rank-mins {{
            font-weight: 700;
            color: #4ecdc4;
        }}

        /* Day highlights - 10x8 grid */
        .slide-subtitle {{
            font-size: 1.2rem;
            opacity: 0.8;
            margin-bottom: 1rem;
            text-align: center;
        }}

        .day-grid {{
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 3px;
            width: 100%;
            max-width: 100%;
            padding: 0.5rem;
        }}

        .day-grid-item {{
            aspect-ratio: 1;
            border-radius: 4px;
            overflow: hidden;
            font-size: 0.5rem;
            cursor: pointer;
            transition: transform 0.2s;
        }}

        .day-grid-item:hover {{
            transform: scale(2);
            z-index: 10;
            position: relative;
        }}

        .day-grid-item.media-item {{
            background: rgba(0,0,0,0.3);
        }}

        .day-grid-item.media-item img,
        .day-grid-item.media-item video {{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }}

        .day-grid-item.text-item {{
            background: rgba(255,255,255,0.15);
            padding: 4px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            cursor: pointer;
        }}

        .day-grid-item.text-item:hover {{
            background: rgba(255,255,255,0.3);
        }}

        .grid-sender {{
            font-weight: 700;
            font-size: 1.1rem;
            opacity: 0.7;
            white-space: nowrap;
            overflow: hidden;
        }}

        .grid-content {{
            font-size: 1rem;
            line-height: 1.3;
            overflow: hidden;
            flex: 1;
        }}

        @media (max-width: 480px) {{
            .day-grid {{
                grid-template-columns: repeat(8, 1fr);
            }}
            .grid-content {{
                font-size: 0.9rem;
            }}
        }}

        /* Responsive */
        @media (max-width: 480px) {{
            .slide-title {{ font-size: 2rem; }}
            .big-number {{ font-size: 4rem; }}
            .intro-year {{ font-size: 5rem; }}
            .person-name {{ font-size: 2rem; }}
            .stat-value {{ font-size: 1.5rem; }}
            .media-gallery {{ grid-template-columns: repeat(3, 1fr); }}
        }}

        /* Confetti */
        .confetti {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        }}

        .confetti-piece {{
            position: absolute;
            width: 10px;
            height: 10px;
            top: -10px;
            animation: confetti-fall 3s ease-out forwards;
        }}

        @keyframes confetti-fall {{
            0% {{ top: -10px; transform: rotate(0deg) translateX(0); }}
            100% {{ top: 100vh; transform: rotate(720deg) translateX(100px); }}
        }}
    </style>
</head>
<body>
    <!-- Intro Screen -->
    <div class="intro-screen" id="intro">
        <div class="intro-title">Familia WhatsApp</div>
        <div class="intro-year">2025</div>
        <div class="intro-subtitle">Tu Año en Mensajes</div>
        <button class="start-btn" onclick="startWrapped()">Empezar</button>
    </div>

    <!-- Music Player -->
    <div class="music-player">
        <button class="music-btn" id="musicBtn" onclick="toggleMusic()">
            <span id="musicIcon">&#128266;</span>
        </button>
    </div>

    <!-- Scroll Indicator -->
    <div class="scroll-indicator" id="scrollIndicator">
        <span>Scroll</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
    </div>

    <div class="container">
        <!-- Slide 1: Total Messages -->
        <div class="slide">
            <div class="floating" style="top: 10%; left: 10%;">&#128172;</div>
            <div class="floating" style="top: 20%; right: 15%; animation-delay: -2s;">&#10084;&#65039;</div>
            <div class="floating" style="bottom: 20%; left: 20%; animation-delay: -4s;">&#127881;</div>

            <div class="slide-title">Este año, la familia envió</div>
            <div class="big-number" id="totalMessages">{total_messages}</div>
            <div class="stat-label">mensajes</div>
            <div class="comparison-text">{messages_comparison}</div>
            <div class="card" style="margin-top: 2rem;">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">{total_words}</div>
                    <div style="opacity: 0.8;">palabras en total</div>
                    <div class="comparison-text" style="margin-top: 0.5rem;">{words_comparison}</div>
                </div>
            </div>
        </div>

        <!-- Slide 2: Media Gallery (overwhelming) -->
        <div class="slide" style="padding: 1rem;">
            <div class="slide-title" style="margin-bottom: 0.5rem;">Recuerdos de 2025</div>
            <div class="comparison-text" style="margin-bottom: 0.5rem;">{media_comparison}</div>
            <div class="media-gallery">
                {media_gallery_html}
            </div>
        </div>

        <!-- Slide 3: Top Writers (dual columns) -->
        <div class="slide">
            <div class="slide-title">Los Que Más Escribieron</div>
            <div class="dual-ranking">
                <div class="ranking-column">
                    <div class="column-title">Más Textos</div>
                    <div class="mini-ranking">
                        {msg_ranking_html}
                    </div>
                </div>
                <div class="ranking-column">
                    <div class="column-title">Más Palabras</div>
                    <div class="mini-ranking">
                        {words_ranking_html}
                    </div>
                </div>
            </div>
        </div>

        <!-- Slide 3b: Top Audio Talkers -->
        <div class="slide">
            <div class="slide-title">Los Que Más Hablaron</div>
            <div class="comparison-text" style="margin-bottom: 1rem;">{audio_comparison}</div>
            <div class="audio-ranking">
                {audio_ranking_html}
            </div>
        </div>

        <!-- Slide 3c: Data Consumption -->
        <div class="slide">
            <div class="slide-title">Los Que Te Consumieron Más Datos</div>
            <div class="comparison-text" style="margin-bottom: 1rem;">Total: {total_data_mb:.1f} MB en fotos y videos</div>
            <div class="data-ranking">
                {data_ranking_html}
            </div>
        </div>

        <!-- Slide 4: Fun Facts Carousel -->
        <div class="slide">
            <div class="slide-title">Datos Curiosos</div>
            <div class="carousel" id="carousel">
                <div class="carousel-track" id="carouselTrack">
                    {carousel_html}
                </div>
            </div>
            <div class="carousel-dots" id="carouselDots"></div>
            <div class="carousel-nav">
                <button class="carousel-btn" onclick="moveCarousel(-1)">&#8592;</button>
                <button class="carousel-btn" onclick="moveCarousel(1)">&#8594;</button>
            </div>
        </div>

        <!-- Slide 5: Activity Calendar -->
        <div class="slide">
            <div class="slide-title">Actividad 2025</div>
            <div class="calendar-container">
                <div class="calendar-grid">
                    {calendar_html}
                </div>
            </div>
            <div class="chart-container" style="margin-top: 1rem;">
                <div class="bar-chart" id="monthlyChart"></div>
            </div>
            <div class="card">
                <div style="text-align: center;">
                    <div>Mes más activo: <strong>{most_active_month}</strong></div>
                    <div style="margin-top: 0.5rem;">Día más activo: <strong>{most_active_date_formatted}</strong></div>
                </div>
            </div>
        </div>

        <!-- Slide 5b: Most Active Day Highlights -->
        <div class="slide" style="padding: 1rem;">
            <div class="slide-title">Día Más Activo: {most_active_date_formatted}</div>
            <div class="slide-subtitle">Lo que pasó ese día</div>
            {day_excerpts_html}
        </div>

        <!-- Slide 6: Top Words -->
        <div class="slide" style="padding-top: 1rem; padding-bottom: 1rem;">
            <div class="slide-title" style="margin-bottom: 1rem;">Palabras Más Usadas</div>
            <img src="wordcloud.png" alt="Nube de palabras" class="wordcloud-img">
        </div>

        <!-- Slide 6: Emojis -->
        <div class="slide">
            <div class="slide-title">Emojis Favoritos</div>
            <div class="emoji-grid">
                {emoji_display_html}
            </div>
            <div class="slide-title" style="margin-top: 2.5rem; font-size: 1.5rem;">Emojis Más Raros</div>
            <div class="emoji-grid">
                {rare_emoji_html}
            </div>
        </div>

        <!-- Slide 7: Individual Stats -->
        <div class="slide">
            <div class="slide-title">Estadísticas Personales</div>
            <div class="person-selector" id="personSelector">
                {person_buttons_html}
            </div>
            <div id="personDetails">
                {person_details_html}
            </div>
        </div>

        <!-- Slide 9: Thank You -->
        <div class="slide">
            <div class="slide-title">Gracias por un 2025 increíble!</div>
            <div class="card" style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">&#10084;&#65039;</div>
                <p style="font-size: 1.2rem; line-height: 1.6;">
                    {num_participants} miembros de la familia compartieron {total_messages} momentos juntos.
                    <br><br>
                    Por más conversaciones en 2026!
                </p>
            </div>
            <div class="share-section">
                <button class="share-btn" onclick="shareWrapped()">Compartir</button>
            </div>
        </div>
    </div>

    <div class="footer">
        <p class="footer-text">Familia Wrapped 2025</p>
    </div>

    <!-- Confetti Container -->
    <div class="confetti" id="confetti"></div>

    <!-- Media Lightbox -->
    <div class="media-lightbox" id="lightbox" onclick="closeLightbox()">
        <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
        <img id="lightbox-img" style="display: none;">
        <video id="lightbox-video" style="display: none;" controls autoplay></video>
    </div>

    <!-- Background Music (royalty-free festive music) -->
    <audio id="bgMusic" loop>
        <source src="https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3" type="audio/mpeg">
    </audio>

    <script>
        const personsData = {persons_json};
        const factsData = {facts_json};
        const monthlyData = {monthly_json};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let currentSlide = 0;
        let carouselIndex = 0;
        const totalFacts = factsData.length;

        // Carousel music configuration (start from middle of song for lyrics)
        const carouselMusic = {{
            'friday-im-in-love': {{ file: 'audio/friday-im-in-love.mp3', start: 107 }},
            'bajan': {{ file: 'audio/bajan.mp3', start: 103 }},
            'here-comes-the-sun': {{ file: 'audio/here-comes-the-sun.mp3', start: 95 }},
            'mejor-no-hablar': {{ file: 'audio/mejor-no-hablar.mp3', start: 136 }},
            'yo-vengo-a-ofrecer': {{ file: 'audio/yo-vengo-a-ofrecer.mp3', start: 105 }},
            'los-libros': {{ file: 'audio/los-libros.mp3', start: 34 }},
            'come-together': {{ file: 'audio/come-together.mp3', start: 129 }}
        }};
        let currentCarouselAudio = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {{
            initCarousel();
            initMonthlyChart();

            // Hide scroll indicator after scrolling
            window.addEventListener('scroll', function() {{
                document.getElementById('scrollIndicator').style.opacity = '0';
            }}, {{ once: true }});
        }});

        function startWrapped() {{
            document.getElementById('intro').classList.add('hidden');
            document.body.style.overflow = 'auto';
            triggerConfetti();

            // Try to play music
            var music = document.getElementById('bgMusic');
            music.volume = 0.3;
            music.play().catch(function() {{}});
        }}

        function toggleMusic() {{
            var music = document.getElementById('bgMusic');
            var btn = document.getElementById('musicBtn');
            var icon = document.getElementById('musicIcon');

            if (music.paused) {{
                music.play();
                icon.innerHTML = '&#128266;';
                btn.classList.add('playing');
            }} else {{
                music.pause();
                icon.innerHTML = '&#128263;';
                btn.classList.remove('playing');
            }}
        }}

        function initCarousel() {{
            var dots = document.getElementById('carouselDots');
            for (var i = 0; i < totalFacts; i++) {{
                var dot = document.createElement('div');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.onclick = (function(index) {{
                    return function() {{ goToSlide(index); }};
                }})(i);
                dots.appendChild(dot);
            }}
            // No auto-advance - let user control the carousel
        }}

        function moveCarousel(direction) {{
            carouselIndex = (carouselIndex + direction + totalFacts) % totalFacts;
            updateCarousel();
        }}

        function goToSlide(index) {{
            carouselIndex = index;
            updateCarousel();
        }}

        function updateCarousel() {{
            var track = document.getElementById('carouselTrack');
            track.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';

            var allDots = document.querySelectorAll('.carousel-dot');
            for (var i = 0; i < allDots.length; i++) {{
                if (i === carouselIndex) {{
                    allDots[i].classList.add('active');
                }} else {{
                    allDots[i].classList.remove('active');
                }}
            }}

            // Handle carousel music
            var slides = document.querySelectorAll('.carousel-slide');
            var currentSlideEl = slides[carouselIndex];
            var musicId = currentSlideEl ? currentSlideEl.getAttribute('data-music') : null;

            // Stop current audio if playing
            if (currentCarouselAudio) {{
                currentCarouselAudio.pause();
                currentCarouselAudio = null;
            }}

            // Play new music if slide has music
            if (musicId && carouselMusic[musicId]) {{
                var config = carouselMusic[musicId];
                currentCarouselAudio = new Audio(config.file);
                currentCarouselAudio.currentTime = config.start;
                currentCarouselAudio.volume = 0.5;
                currentCarouselAudio.play().catch(function(e) {{
                    console.log('Audio autoplay blocked');
                }});
            }}
        }}

        function initMonthlyChart() {{
            var chart = document.getElementById('monthlyChart');
            var maxVal = Math.max.apply(null, monthlyData);

            for (var i = 0; i < monthlyData.length; i++) {{
                var bar = document.createElement('div');
                bar.className = 'bar';
                var height = maxVal > 0 ? (monthlyData[i] / maxVal * 100) : 0;
                bar.style.height = height + '%';

                var label = document.createElement('span');
                label.className = 'bar-label';
                label.textContent = monthNames[i];
                bar.appendChild(label);

                chart.appendChild(bar);
            }}
        }}

        function showPerson(name) {{
            // Hide all details
            var allDetails = document.querySelectorAll('.person-detail');
            for (var i = 0; i < allDetails.length; i++) {{
                allDetails[i].classList.remove('active');
            }}

            // Update buttons
            var allBtns = document.querySelectorAll('.person-btn');
            for (var i = 0; i < allBtns.length; i++) {{
                if (allBtns[i].textContent === name) {{
                    allBtns[i].classList.add('active');
                }} else {{
                    allBtns[i].classList.remove('active');
                }}
            }}

            // Show selected detail
            var safeName = name.replace(/ /g, '-');
            var detail = document.getElementById('detail-' + safeName);
            if (detail) {{
                detail.classList.add('active');
            }}
        }}

        function triggerConfetti() {{
            var container = document.getElementById('confetti');
            var colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#aa96da', '#fcbad3'];

            for (var i = 0; i < 100; i++) {{
                var piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = Math.random() * 100 + '%';
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
                piece.style.animationDelay = Math.random() * 2 + 's';
                container.appendChild(piece);
            }}

            setTimeout(function() {{
                container.innerHTML = '';
            }}, 5000);
        }}

        function shareWrapped() {{
            if (navigator.share) {{
                navigator.share({{
                    title: 'Familia Wrapped 2025',
                    text: 'Mirá nuestro Wrapped de WhatsApp familiar 2025!',
                    url: window.location.href
                }});
            }} else {{
                alert('Compartí esta página con tu familia!');
            }}
        }}

        function openMedia(src) {{
            var lightbox = document.getElementById('lightbox');
            var img = document.getElementById('lightbox-img');
            var video = document.getElementById('lightbox-video');

            if (src.includes('.mp4') || src.includes('.mov')) {{
                video.src = src;
                video.style.display = 'block';
                img.style.display = 'none';
            }} else {{
                img.src = src;
                img.style.display = 'block';
                video.style.display = 'none';
            }}

            lightbox.classList.add('active');
        }}

        function closeLightbox() {{
            var lightbox = document.getElementById('lightbox');
            var video = document.getElementById('lightbox-video');
            video.pause();
            lightbox.classList.remove('active');
        }}

        // Touch swipe for carousel
        var touchStartX = 0;
        var touchEndX = 0;

        document.getElementById('carousel').addEventListener('touchstart', function(e) {{
            touchStartX = e.changedTouches[0].screenX;
        }});

        document.getElementById('carousel').addEventListener('touchend', function(e) {{
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) moveCarousel(1);
            if (touchEndX - touchStartX > 50) moveCarousel(-1);
        }});
    </script>
</body>
</html>'''

    return html


def main():
    import sys

    chat_file = sys.argv[1] if len(sys.argv) > 1 else 'chats.txt'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'index.html'

    print("Parsing WhatsApp chat...")
    messages, stats_obj = parse_whatsapp_chat(chat_file, year_filter=2025)
    stats = stats_to_dict(stats_obj)

    print(f"   Found {stats['total_messages']:,} messages in 2025")
    print(f"   {len(stats['messages_by_sender'])} participants")

    print("\nGenerating Wrapped 2025...")
    html = generate_html(stats, messages)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"\nGenerated {output_file}")
    print(f"   Open in a browser to view your Family Wrapped 2025!")

    # Also save stats for reference
    with open('stats_2025.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"   Stats saved to stats_2025.json")


if __name__ == '__main__':
    main()
