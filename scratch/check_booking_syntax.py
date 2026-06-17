import re, subprocess, os

html = open('booking.html', encoding='utf-8').read()
match = re.search(r'<script type="module">([\s\S]*?)</script>', html)
if match:
    js_code = match.group(1)
    with open('temp_booking.js', 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    res = subprocess.run(['node', '--check', 'temp_booking.js'], capture_output=True, text=True)
    if os.path.exists('temp_booking.js'):
        os.remove('temp_booking.js')
        
    if res.returncode == 0:
        print("Success: booking.html inline script syntax is perfectly valid!")
    else:
        print("Error: syntax error found:")
        print(res.stderr)
else:
    print("Could not find inline script tag in booking.html")
