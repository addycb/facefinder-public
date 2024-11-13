import subprocess

def get_exif_data(image_path):
    exiftool_path = 'exiftool'
    # Run exiftool command
    print(image_path)
    result = subprocess.run([exiftool_path, image_path], capture_output=True, text=True)
    # Define keywords to filter out
    keywords_to_exclude = [
        'ExifTool Version Number',
        'Directory',
        'File Modification Date/Time',
        'File Access Date/Time',
        'File Inode Change Date/Time',
        'File Permissions',
        'File Creation Date/Time',
    ]
    # Split the output into lines
    lines = result.stdout.splitlines()
    # Filter out lines where the first word is in the keywords_to_exclude list
    filtered_lines = [line for line in lines if not any(line.startswith(keyword) for keyword in keywords_to_exclude)]
    # Join the filtered lines back into a single string
    filtered_output = '\n'.join(filtered_lines)
    return filtered_output
