import os
import requests
import time
from pathlib import Path
from urllib.parse import quote
from lxml import html

class GarbageImageScraper:
    def __init__(self, base_path="games/game11/garbage"):
        self.base_path = Path(base_path)
        self.garbage_types = [
            "garbage",
        ]

    def create_directory(self):
        self.base_path.mkdir(parents=True, exist_ok=True)

    def sanitize_filename(self, filename):
        return "".join(c if c.isalnum() or c in (' ', '-') else '_' for c in filename).strip()

    def download_image(self, url, filepath):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            if not response.headers.get('content-type', '').startswith('image/'):
                print(f"Skipping non-image URL: {url}")
                return False
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return True
        except Exception as e:
            print(f"Error downloading {url}: {e}")
            return False

    def get_images(self, query, num_images=5):
        search_url = f"https://commons.wikimedia.org/wiki/Special:MediaSearch?type=bitmap&search={quote(query)}&go=Go"
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(search_url, headers=headers, timeout=10)
            response.raise_for_status()

            tree = html.fromstring(response.content)
            img_elements = tree.cssselect('img')

            images = []
            for img in img_elements:
                src = img.get('src')
                if src and src.startswith('http'):
                    images.append(src)
                if len(images) >= num_images:
                    break

            return images

        except Exception as e:
            print(f"Error fetching images for {query}: {e}")
            return []

    def download_garbage_images(self, garbage_type, num_images=5):
        print(f"Searching for images of {garbage_type}...")
        images = self.get_images(garbage_type, num_images)

        if not images:
            print(f"No images found for {garbage_type}")
            return

        for i, image_url in enumerate(images):
            image_path = self.base_path / f"{self.sanitize_filename(garbage_type)}_{i+1}.jpg"
            if self.download_image(image_url, image_path):
                print(f"Downloaded image {i+1} for {garbage_type}")
            time.sleep(1)

    def run(self):
        self.create_directory()
        print(f"Starting image download for {len(self.garbage_types)} garbage types...")

        for garbage_type in self.garbage_types:
            print(f"\nProcessing {garbage_type}...")
            self.download_garbage_images(garbage_type)
            time.sleep(2)

        print("\nDownload complete!")

if __name__ == "__main__":
    scraper = GarbageImageScraper()
    scraper.run()
