from pathlib import Path
import json, re, sys
try:
    import yaml
except ImportError:
    yaml = None
root = Path(__file__).resolve().parents[1]
errors=[]
for file in root.rglob('*.json'):
    try: json.loads(file.read_text())
    except Exception as exc: errors.append(f'{file}: {exc}')
if yaml:
    for file in root.rglob('*.yaml'):
        try: yaml.safe_load(file.read_text())
        except Exception as exc: errors.append(f'{file}: {exc}')
for file in list(root.rglob('*.ts')) + list(root.rglob('*.tsx')) + list(root.rglob('*.mjs')):
    text=file.read_text()
    for match in re.finditer(r'from\s+["\'](\.[^"\']+)["\']|import\s+["\'](\.[^"\']+)["\']', text):
        rel=match.group(1) or match.group(2)
        target=file.parent/rel
        candidates=[target,target.with_suffix('.ts'),target.with_suffix('.tsx'),target.with_suffix('.mjs'),target/'index.ts']
        if target.suffix=='.js': candidates.extend([target.with_suffix('.ts'),target.with_suffix('.tsx')])
        if not any(c.exists() for c in candidates): errors.append(f'{file}: unresolved relative import {rel}')
for file in root.rglob('*'):
    if file.is_file() and file.name == '.env': errors.append(f'{file}: real .env must not be packaged')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print('Repository structural validation passed.')
