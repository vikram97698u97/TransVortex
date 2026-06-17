with open('lr-report.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_modal = False
for idx, line in enumerate(lines):
    if 'id="tripDetailsModal"' in line:
        in_modal = True
    if in_modal:
        if 'id="tripDetailsTabs"' in line or 'class="nav nav-tabs"' in line:
            # Print tabs container and headers
            for j in range(idx, idx + 45):
                safe_line = lines[j].strip().encode('ascii', errors='replace').decode('ascii')
                print(f"Line {j+1}: {safe_line}")
            break
