import re, subprocess, os

html = open('work-management.html', encoding='utf-8').read()
match = re.search(r'<script type="module">([\s\S]*?)</script>', html)
if match:
    js_code = match.group(1)
    with open('temp_work_management.js', 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    res = subprocess.run(['node', '--check', 'temp_work_management.js'], capture_output=True, text=True)
    if os.path.exists('temp_work_management.js'):
        os.remove('temp_work_management.js')
        
    if res.returncode == 0:
        print("Success: work-management.html inline script syntax is perfectly valid!")
    else:
        print("Error: syntax error found:")
        print(res.stderr)
else:
    print("Could not find inline script tag in work-management.html")
