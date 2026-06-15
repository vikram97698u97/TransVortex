with open('rules.txt', 'r', encoding='utf-8') as f:
    content = f.read()

print("pumpPayments in rules.txt:", "pumpPayments" in content)
print("fuelPayments in rules.txt:", "fuelPayments" in content)
