#!/usr/bin/env python3
import json
import os
from pathlib import Path

def xor_encrypt(data, key):
    """XOR encrypt the data with the key"""
    key_bytes = key.encode('utf-8')
    data_bytes = data.encode('utf-8')
    encrypted = bytearray()
    
    for i in range(len(data_bytes)):
        encrypted.append(data_bytes[i] ^ key_bytes[i % len(key_bytes)])
    
    return encrypted

def encrypt_sa_file(sa_file_path, player_key, dm_key, output_dir="."):
    """Encrypt the service account file with two different keys"""
    # Read the service account file
    with open(sa_file_path, 'r') as f:
        sa_data = f.read()
    
    # Encrypt for player
    player_encrypted = xor_encrypt(sa_data, player_key)
    player_hex = ''.join(f'{b:02x}' for b in player_encrypted)
    
    # Encrypt for DM
    dm_encrypted = xor_encrypt(sa_data, dm_key)
    dm_hex = ''.join(f'{b:02x}' for b in dm_encrypted)
    
    # Write to output files
    player_file = os.path.join(output_dir, "player_credentials.hex")
    dm_file = os.path.join(output_dir, "dm_credentials.hex")
    
    with open(player_file, 'w') as f:
        f.write(player_hex)
    
    with open(dm_file, 'w') as f:
        f.write(dm_hex)
    
    print(f"Encrypted credentials written to {player_file} and {dm_file}")
    return player_file, dm_file

if __name__ == "__main__":
    # Path to service account file
    sa_file_path = os.path.expanduser("~/Downloads/credentials_gsheet.json")
    
    # Keys for encryption
    player_key = "space"  # Same as the PLAYER_PASSWORD in the HTML
    dm_key = "dm2"        # Same as the DM_PASSWORD in the HTML
    
    # Output directory (current directory)
    output_dir = "."
    
    # Encrypt the file
    player_file, dm_file = encrypt_sa_file(sa_file_path, player_key, dm_key, output_dir)
    
    print("Encryption complete.")
    print(f"Player credentials: {player_file}")
    print(f"DM credentials: {dm_file}")
