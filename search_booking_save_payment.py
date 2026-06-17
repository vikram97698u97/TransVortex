with open('booking.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'clientSidePaymentForm' in line and 'addEventListener' in line:
        for j in range(max(0, idx - 5), min(len(lines), idx + 45)):
            safe_line = lines[j].strip().encode('ascii', errors='replace').decode('ascii')
            print(f"Line {j+1}: {safe_line}")
        break
