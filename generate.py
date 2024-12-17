import os
import hashlib
import qrcode
from datetime import date

# Folder structure
FOLDERS = ['images', 'win']
for folder in FOLDERS:
    os.makedirs(folder, exist_ok=True)

# List of prizes (one per day)
PRIZES = [
    "undefined",
    "undefined",
    "undefined",
    "Un abrazo",
    "Te hago un café",
    "Billy agarra el controller de la PS5 y juega él",
    "Desayuno en la cama (please pre-order)",
    "vamos al [evento con connotación cultural]",
    "mini-viajecito (please pre-order)",
    "un pete",
    "vamos a caminar",
    "vemos la peli que elijas",
    "te ayudo con algo del laburo",
    "voy a comprarte algo de jengibre"
]

def generate_hash(day, seed="billy2024"):
    """Generate a deterministic hash for a given day"""
    content = f"day{day}-{seed}"
    return hashlib.sha256(content.encode()).hexdigest()[:10]

def create_win_page(day, prize, hash_val):
    """Create the HTML page for a prize"""
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You Won a Prize! 🎁</title>
    <style>
        body {{
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            text-align: center;
            padding: 20px;
        }}

        .prize-container {{
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 500px;
            width: 90%;
            margin: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }}

        h1 {{
            margin: 0 0 20px 0;
            font-size: 2em;
        }}

        .prize {{
            font-size: 1.5em;
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }}

        .return-link {{
            margin-top: 30px;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border: 2px solid white;
            border-radius: 5px;
            transition: all 0.3s ease;
        }}

        .return-link:hover {{
            background: white;
            color: #1e3c72;
        }}
    </style>
</head>
<body>
    <div class="prize-container">
        <h1>🎉 Congratulations! 🎉</h1>
        <p>You've won:</p>
        <div class="prize">
            {prize}
        </div>
        <a href="/" class="return-link">Return to Calendar</a>
    </div>
</body>
</html>"""
    
    win_path = os.path.join('win', f"{day:02d}-{hash_val}")
    os.makedirs(win_path, exist_ok=True)
    
    with open(os.path.join(win_path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return f"{win_path}/index.html"

def generate_qr(url, output_path):
    """Generate QR code for a given URL"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)

def main():
    today = date.today()
    for day in range(1, 30):
        if 1 <= day <= len(PRIZES):
            prize = PRIZES[day - 1]
            hash_val = generate_hash(day)
            
            # Create win page
            win_page = create_win_page(day, prize, hash_val)
            
            # Generate QR code
            base_url = "https://advent-calendar-billy.github.io"
            prize_url = f"{base_url}/win/{day:02d}-{hash_val}"
            qr_path = f"images/{day:02d}-{hash_val}.png"
            
            generate_qr(prize_url, qr_path)
            
            print(f"Created for Day {day}:")
            print(f"Prize URL: {prize_url}")
            print(f"Win page: {win_page}")
            print(f"QR code: {qr_path}")

if __name__ == "__main__":
    main()
