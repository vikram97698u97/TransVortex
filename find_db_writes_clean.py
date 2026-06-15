import os
import re

targets = [
    'driverSalaryPayments',
    'transporterPayments',
    'workPayments',
    'fuelPayments',
    'money_transactions',
    'money_accounts',
    'payments'
]

files_to_check = [
    'add.html',
    'payment-billing.html',
    'lr-report.js'
]

for filename in files_to_check:
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            for idx, line in enumerate(lines):
                for target in targets:
                    if target in line and ('.ref' in line or 'push' in line or 'update' in line or 'set' in line or 'db' in line):
                        # print safe ascii only to avoid console encoding crashes on Windows
                        safe_line = line.strip().encode('ascii', errors='replace').decode('ascii')
                        print(f"{filename} (Line {idx+1}): {safe_line}")
        except Exception as e:
            print(f"Error reading {filename}: {e}")
