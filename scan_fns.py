import re

pages = ['add.html','lr-report.html','invoice.html','booking.html']
for page in pages:
    try:
        content = open(page,encoding='utf-8').read()
        fns = re.findall(r"onclick=[\"']([\w\.\(\)]+)", content)
        edit_del = [f for f in fns if any(k in f.lower() for k in ['edit','delete','remove','delet','save','update'])]
        print(f'\n--- {page} ---')
        for f in sorted(set(edit_del))[:20]:
            print(f)
    except Exception as e:
        print(f'err: {page} - {e}')
