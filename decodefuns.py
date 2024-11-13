def hex_to_ascii(hex_string):
    # Remove '0x' prefix if present
    hex_string = hex_string.lstrip('0x')
    # Convert hex string to bytes
    bytes_data = bytes.fromhex(hex_string)
    # Convert bytes to ASCII string
    ascii_string = bytes_data.decode('ascii', errors='ignore')
    
    return ascii_string