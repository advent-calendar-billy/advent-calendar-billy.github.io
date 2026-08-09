import re, json, subprocess, sys

SRC = open('index.html').read()

def block(name, kind='const'):
    """Extract `const NAME = <literal>;` with a quote/comment-aware scanner."""
    m = re.search(rf'{kind}\s+{name}\s*=\s*', SRC)
    if not m:
        sys.exit(f'not found: {name}')
    i = m.end()
    depth, out = 0, []
    q = None          # active quote char
    while i < len(SRC):
        c = SRC[i]; nxt = SRC[i+1] if i+1 < len(SRC) else ''
        if q:
            out.append(c)
            if c == '\\': out.append(nxt); i += 2; continue
            if c == q: q = None
            i += 1; continue
        if c in '\'"`':
            q = c; out.append(c); i += 1; continue
        if c == '/' and nxt == '/':
            while i < len(SRC) and SRC[i] != '\n': i += 1
            continue
        if c == '/' and nxt == '*':
            i = SRC.index('*/', i) + 2; continue
        if c in '{[':  depth += 1
        if c in '}]':  depth -= 1
        out.append(c); i += 1
        if depth == 0 and c in '}]': break
    return ''.join(out)

def func(name):
    m = re.search(rf'function\s+{name}\s*\(', SRC)
    if not m: sys.exit(f'fn not found: {name}')
    i = SRC.index('{', m.end())
    depth, start = 0, m.start()
    q = None
    while i < len(SRC):
        c = SRC[i]; nxt = SRC[i+1] if i+1 < len(SRC) else ''
        if q:
            if c == '\\': i += 2; continue
            if c == q: q = None
            i += 1; continue
        if c in '\'"`': q = c; i += 1; continue
        if c == '/' and nxt == '/':
            while i < len(SRC) and SRC[i] != '\n': i += 1
            continue
        if c == '{': depth += 1
        if c == '}':
            depth -= 1
            if depth == 0: return SRC[start:i+1]
        i += 1

DATA = {n: block(n) for n in
        ['TTYPES','TSPEC','TROLE','FLAVOR','BRANCHINFO','HIREINFO','HIRECOST','PATHCOST','ETYPES','ROOMS','DISABLED']}

# dump the pure-data tables to JSON via node
js = '\n'.join(f'const {n} = {v};' for n, v in DATA.items())
js += '\nconsole.log(JSON.stringify({TTYPES,TSPEC,TROLE,FLAVOR,BRANCHINFO,HIREINFO,HIRECOST,PATHCOST,ETYPES,ROOMS,DISABLED}));'
open('/tmp/_holdem_data.js','w').write(js)
out = subprocess.run(['node','/tmp/_holdem_data.js'], capture_output=True, text=True)
if out.returncode: sys.exit(out.stderr[:2000])
D = json.loads(out.stdout)

# sprite defs + the helpers the report needs to render live stats/art
defs = SRC[SRC.index('<defs>'):SRC.index('</defs>')+len('</defs>')]
helpers = {n: func(n) for n in ['specStats','statLine','artFor']}

json.dump({'data': D, 'defs': defs, 'helpers': helpers,
           'tables': DATA},
          open('/tmp/_holdem_extract.json','w'))
print('extracted:', ', '.join(f'{k}={len(v)}' for k, v in D.items() if isinstance(v, (dict, list))))
