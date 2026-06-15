import os

terms = ['Salary', 'salary', 'driverSalaryPayments']
files = ['add.html', 'employees.html', 'home.html']

for filename in files:
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            print(f"=== Matches in {filename} ===")
            for idx, line in enumerate(lines):
                for term in terms:
                    if term in line:
                        safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
                        print(f"Line {idx+1}: {safe_line}")
                        break
        except Exception as e:
            print(f"Error reading {filename}: {e}")
