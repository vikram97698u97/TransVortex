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
    'admin-payments.html',
    'booking.html',
    'transporters.html',
    'work-management.html',
    'home.html',
    'payment-billing.html',
    'lr-report.js',
    'employees.html'
]

for filename in files_to_check:
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            for idx, line in enumerate(lines):
                for target in targets:
                    if target in line and ('.ref' in line or 'push' in line or 'update' in line or 'set' in line or 'db' in line):
                        print(f"{filename} (Line {idx+1}): {line.strip()}")
        except Exception as e:
            print(f"Error reading {filename}: {e}")
