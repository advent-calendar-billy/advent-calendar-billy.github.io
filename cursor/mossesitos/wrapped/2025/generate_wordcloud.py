#!/usr/bin/env python3
"""
Generate a rectangular word cloud image from chat stats.
"""

import json
from wordcloud import WordCloud
import matplotlib.pyplot as plt

def generate_wordcloud(stats_file='stats_2025.json', output_file='wordcloud.png'):
    """Generate a rectangular word cloud from the stats file."""

    # Load stats
    with open(stats_file, 'r', encoding='utf-8') as f:
        stats = json.load(f)

    top_words = stats.get('top_words', {})

    if not top_words:
        print("No words found in stats!")
        return

    # Generate word cloud
    wordcloud = WordCloud(
        width=800,
        height=500,
        background_color='#1a1a2e',
        colormap='plasma',
        max_words=500,
        min_font_size=8,
        max_font_size=120,
        prefer_horizontal=0.7,
        relative_scaling=0.5,
        margin=5,
    ).generate_from_frequencies(top_words)

    # Save to file
    plt.figure(figsize=(10, 6.25), facecolor='#1a1a2e')
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(output_file, dpi=150, facecolor='#1a1a2e', bbox_inches='tight', pad_inches=0.1)
    plt.close()

    print(f"Word cloud saved to {output_file}")


if __name__ == '__main__':
    generate_wordcloud()
