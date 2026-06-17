with open('lr-report.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_modal = False
for idx, line in enumerate(lines):
    if 'id="tripDetailsModal"' in line:
        in_modal = True
        print(f"Modal starts on line {idx+1}")
    if in_modal:
        if '<a ' in line or '<button ' in line or 'role="tab"' in line or 'class="nav-link"' in line or 'id=' in line:
            # Print important elements in modal
            safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"Line {idx+1}: {safe_line}")
        if '</div><!-- modal-content -->' in line or ('</div>' in line and in_modal and idx > 1500): # safety break
            pass
        if idx > 1200: # let's just break after 200 lines to keep output clean
            in_modal = False
            print(f"Search completed.")
            break
