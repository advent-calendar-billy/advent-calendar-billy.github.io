import os
import requests
import time
from pathlib import Path
from urllib.parse import quote
from lxml import html

class CityImageScraper:
    def __init__(self, base_path="games/game8/cities"):
        self.base_path = Path(base_path)
        # Example city list; expand as needed
        self.cities = [
            # Europe
            ("Paris", "France"),
            ("London", "United Kingdom"),
            ("Berlin", "Germany"),
            ("Rome", "Italy"),
            ("Barcelona", "Spain"),
            ("Amsterdam", "Netherlands"),
            ("Prague", "Czech Republic"),
            ("Vienna", "Austria"),
            ("Istanbul", "Turkey"),
            ("Stockholm", "Sweden"),
            ("Copenhagen", "Denmark"),
            ("Athens", "Greece"),
            
            # Asia
            ("Tokyo", "Japan"),
            ("Kyoto", "Japan"),
            ("Osaka", "Japan"),
            ("Seoul", "South Korea"),
            ("Beijing", "China"),
            ("Shanghai", "China"),
            ("Hong Kong", "China"),
            ("Singapore", "Singapore"),
            ("Bangkok", "Thailand"),
            ("Dubai", "UAE"),
            ("Mumbai", "India"),
            ("Bangalore", "India"),
            ("Delhi", "India"),
            ("Ho Chi Minh City", "Vietnam"),
            
            # Americas
            ("New York", "United States"),
            ("San Francisco", "United States"),
            ("Chicago", "United States"),
            ("Toronto", "Canada"),
            ("Vancouver", "Canada"),
            ("Mexico City", "Mexico"),
            ("Buenos Aires", "Argentina"),
            ("Rio de Janeiro", "Brazil"),
            ("São Paulo", "Brazil"),
            ("Lima", "Peru"),
            ("Santiago", "Chile"),
            
            # Oceania
            ("Sydney", "Australia"),
            ("Melbourne", "Australia"),
            ("Auckland", "New Zealand"),
            
            # Africa
            ("Cairo", "Egypt"),
            ("Cape Town", "South Africa"),
            ("Marrakech", "Morocco"),
            ("Nairobi", "Kenya")
        ]


    def create_directory(self, city):
        city_dir = self.base_path / self.sanitize_filename(city)
        city_dir.mkdir(parents=True, exist_ok=True)
        return city_dir

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

    def get_wikimedia_images(self, city, country, num_images=3):
        # Search query: city + country + "landmark"
        query = f"{city} {country} landmark"
        # Construct a search URL for Wikimedia Commons
        # Special:MediaSearch is the new search interface for images
        search_url = f"https://commons.wikimedia.org/wiki/Special:MediaSearch?type=bitmap&search={quote(query)}&go=Go"

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(search_url, headers=headers, timeout=10)
            response.raise_for_status()

            # Parse the HTML
            tree = html.fromstring(response.content)


            # Each image result is typically within a div with class "sdms-search-result"
            # Images are often in <img> tags with "src" attribute.
            # We'll look for thumbnail images: ".sdms-search-result__image img"
            img_elements = tree.cssselect('img')

            # Extract src URLs. Wikimedia often uses "src" attribute for thumbnails.
            # We'll take the first few image thumbnails we find.
            images = []
            for img in img_elements:
                src = img.get('src')
                if src and src.startswith('http'):
                    images.append(src)
                if len(images) >= num_images:
                    break

            return images

        except Exception as e:
            print(f"Error fetching Wikimedia images for {city}, {country}: {e}")
            return []

    def download_city_images(self, city, country, num_images=3):
        city_dir = self.create_directory(city)
        print(f"Searching for {city} images...")
        images = self.get_wikimedia_images(city, country, num_images)
        
        if not images:
            print(f"No images 3 found for {city}")
            return

        for i, image_url in enumerate(images):
            image_path = city_dir / f"image_{i+1}.jpg"
            if self.download_image(image_url, image_path):
                print(f"Downloaded image {i+1} for {city}")
            time.sleep(1)

    def run(self):
        print(f"Starting image download for {len(self.cities)} cities...")
        
        for city, country in self.cities:
            print(f"\nProcessing {city}, {country}...")
            self.download_city_images(city, country)
            time.sleep(2)

        print("\nDownload complete!")

if __name__ == "__main__":
    scraper = CityImageScraper()
    scraper.run()
