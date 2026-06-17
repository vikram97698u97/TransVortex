with open('add.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'payrollForm' in line or 'savePayrollBtn' in line:
        # Print surrounding lines
        for j in range(max(0, idx - 5), min(len(lines), idx + 25)):
            safe_line = lines[j].strip().encode('ascii', errors='replace').decode('ascii')
            print(f"Line {j+1}: {safe_line}")
        break
