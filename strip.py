import re, html, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
def strip(p):
    with open(p,'r',encoding='utf-8') as f: s=f.read()
    s=re.sub(r'<script[\s\S]*?</script>','',s,flags=re.I)
    s=re.sub(r'<style[\s\S]*?</style>','',s,flags=re.I)
    s=re.sub(r'<noscript[\s\S]*?</noscript>','',s,flags=re.I)
    # turn block tags into newlines
    s=re.sub(r'</(p|div|h[1-6]|li|section|article|header|footer|nav|main|aside|button|tr|td|th|ul|ol)>','\n',s,flags=re.I)
    s=re.sub(r'<br\s*/?>','\n',s,flags=re.I)
    s=re.sub(r'<[^>]+>',' ',s)
    s=html.unescape(s)
    # collapse whitespace per line
    out=[]
    for line in s.splitlines():
        line=re.sub(r'\s+',' ',line).strip()
        if line: out.append(line)
    return '\n'.join(out)
for p in sys.argv[1:]:
    print('===== '+p+' =====')
    print(strip(p))
    print()
