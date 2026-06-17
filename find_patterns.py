import re

search_terms = [
    'renderVendorSelects',
    'addExpenseRow',
    'collectTripExpenses',
    'showTripDetailsModal',
    'persistTripDetails',
    'data-selected-value'
]

with open('lr-report.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for term in search_terms:
    print(f"=== Matches for '{term}' ===")
    found = False
    for idx, line in enumerate(lines):
        if term in line:
            print(f"Line {idx+1}: {line.strip()}")
            found = True
    if not found:
        print("Not found")
    print()
