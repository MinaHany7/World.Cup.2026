#!/usr/bin/env python3
"""Build local, static-site data and image assets from the supplied World Cup workbook."""
from __future__ import annotations
import csv, hashlib, html, json, os, re, time, unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import unquote, urlparse, quote
import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / 'assets/docs/World_Cup_2026_Data.xlsx'
DATA_DIR = ROOT / 'assets/data'
FLAG_DIR = ROOT / 'assets/flags'
PLAYER_DIR = ROOT / 'assets/players'
for d in (DATA_DIR, FLAG_DIR, PLAYER_DIR): d.mkdir(parents=True, exist_ok=True)
SESSION_HEADERS = {'User-Agent': 'MinaHanyWahba-WorldCupPortfolio/1.0 (static project asset packaging)'}


def clean(v):
    if v is None: return None
    if isinstance(v, (pd.Timestamp,)): return v.strftime('%Y-%m-%d')
    try:
        if pd.isna(v): return None
    except (TypeError, ValueError): pass
    if hasattr(v, 'item'):
        try: return v.item()
        except Exception: pass
    return v


def rows(sheet):
    df = pd.read_excel(WORKBOOK, sheet_name=sheet)
    return [{str(k): clean(v) for k, v in row.items() if not str(k).endswith('_AR') and str(k) != 'Stadium_Key'} for row in df.to_dict(orient='records')]


def ascii_slug(value):
    text = unicodedata.normalize('NFKD', str(value)).encode('ascii', 'ignore').decode('ascii').lower()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-') or 'asset'


def ext_from_url(url):
    name = unquote(urlparse(url).path.split('/')[-1])
    # thumb URLs end in a size-prefixed copy of the original name
    name = re.sub(r'^\d+px-', '', name)
    ext = Path(name).suffix.lower()
    return ext if ext in {'.jpg', '.jpeg', '.png', '.webp', '.gif'} else '.jpg'


def commons_filename(url):
    path = unquote(urlparse(url).path)
    parts = path.strip('/').split('/')
    try:
        i = parts.index('thumb')
        return parts[i + 3]  # wikipedia / commons / thumb / hash-a / hash-b / filename / size
    except (ValueError, IndexError):
        return parts[-1]


def download_one(url, target):
    target = Path(target)
    if target.exists() and target.stat().st_size > 60:
        return True, target.stat().st_size, 'cached'
    for attempt in range(2):
        try:
            r = requests.get(url, headers=SESSION_HEADERS, timeout=35)
            r.raise_for_status()
            if not r.headers.get('content-type', '').lower().startswith('image/') or len(r.content) < 60:
                raise ValueError('response was not a valid image')
            target.write_bytes(r.content)
            return True, len(r.content), 'downloaded'
        except Exception as e:
            if attempt: return False, 0, str(e)[:180]
            time.sleep(.4)


def clean_html(text):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', str(text or '')))).strip()


def commons_metadata(urls):
    files = {}
    for url in urls:
        name = commons_filename(url)
        files.setdefault(name, url)
    metadata = {}
    names = list(files)
    for start in range(0, len(names), 25):
        chunk = names[start:start+25]
        try:
            r = requests.post('https://commons.wikimedia.org/w/api.php', data={
                'action': 'query', 'format': 'json', 'prop': 'imageinfo',
                'iiprop': 'extmetadata', 'titles': '|'.join('File:' + n for n in chunk),
                'maxlag': 5
            }, headers=SESSION_HEADERS, timeout=35)
            r.raise_for_status()
            for page in r.json().get('query', {}).get('pages', {}).values():
                title = page.get('title', '').removeprefix('File:')
                title_key = title.replace(' ', '_')
                ext = (page.get('imageinfo') or [{}])[0].get('extmetadata', {})
                def field(k): return clean_html((ext.get(k) or {}).get('value', ''))
                license_name = field('LicenseShortName')
                creator = field('Artist')
                credit = field('Credit')
                license_url = field('LicenseUrl')
                permission = field('Permission')
                if not license_url and license_name == 'Public domain':
                    license_url = 'https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain'
                elif not license_url and license_name == 'Attribution' and ('mlsz.hu' in (creator + ' ' + credit)):
                    license_url = 'https://en.mlsz.hu/imprint'
                metadata[title_key] = {
                    'license': license_name, 'license_url': license_url,
                    'creator': creator, 'credit': credit, 'permission': permission,
                    'attribution_required': field('AttributionRequired'),
                    'description': field('ImageDescription')
                }
        except Exception as e:
            for n in chunk: metadata[n] = {'license': 'Metadata lookup failed', 'license_url': '', 'creator': '', 'credit': str(e)[:160], 'permission': '', 'attribution_required': '', 'description': ''}
        time.sleep(.2)
    return files, metadata


# Load the supplied source tables.
teams = rows('Teams')
standings = rows('Standings')
matches = rows('Matches')
team_matches = rows('Team_Matches')
goals = rows('Goals')
stadiums = rows('Stadiums')
scorers = rows('Scorers')
match_awards = rows('Match_Awards')
awards = rows('Awards')

# Download all 48 country flags locally.
flag_by_team = {}
flag_jobs = {}
for t in standings:
    url = t.get('Flag_URL')
    if not url: continue
    code = Path(urlparse(url).path).stem.lower()
    dest = FLAG_DIR / f'{code}.png'
    flag_by_team[t['Team_EN']] = f'assets/flags/{code}.png'
    flag_jobs[url] = dest
with ThreadPoolExecutor(max_workers=10) as ex:
    future_map = {ex.submit(download_one, url, target): (url, target) for url, target in flag_jobs.items()}
    flag_results = [f.result() for f in as_completed(future_map)]

# Download the portrait thumbnails supplied by the workbook.
photo_jobs = {}
photo_for_player = {}
for p in scorers:
    url = p.get('Photo_URL')
    if not url: continue
    name = f"{ascii_slug(p.get('Player'))}--{ascii_slug(p.get('Team'))}-{hashlib.sha1(url.encode()).hexdigest()[:8]}{ext_from_url(url)}"
    rel = f'assets/players/{name}'
    photo_for_player[(p.get('Team'), p.get('Player'))] = rel
    photo_jobs.setdefault(url, PLAYER_DIR / name)
with ThreadPoolExecutor(max_workers=10) as ex:
    future_map = {ex.submit(download_one, url, target): (url, target) for url, target in photo_jobs.items()}
    photo_results = {future_map[f][0]: f.result() for f in as_completed(future_map)}

# Attach local flags and portraits to the player data.
for p in scorers:
    p['Photo'] = photo_for_player.get((p.get('Team'), p.get('Player'))) if p.get('Photo_URL') else None
    if p.get('Photo_URL') and not photo_results.get(p['Photo_URL'], (False,))[0]: p['Photo'] = None
    p['Flag'] = flag_by_team.get(p.get('Team'))
for t in standings:
    t['Flag'] = flag_by_team.get(t.get('Team_EN'))
for t in teams:
    t['Flag'] = flag_by_team.get(t.get('Team_EN'))
for m in team_matches:
    m['Flag'] = flag_by_team.get(m.get('Team'))
    m['Opponent_Flag'] = flag_by_team.get(m.get('Opponent'))
for a in awards:
    p = next((x for x in scorers if x.get('Player') == a.get('Winner') and x.get('Team') == a.get('Team')), None)
    a['Photo'] = p.get('Photo') if p else None
    a['Flag'] = flag_by_team.get(a.get('Team'))
for a in match_awards:
    p = next((x for x in scorers if x.get('Player') == a.get('Player') and x.get('Team') == a.get('Team')), None)
    a['Photo'] = p.get('Photo') if p else None
    a['Flag'] = flag_by_team.get(a.get('Team'))

# Keep the site English-only: the source goal table has Arabic-only scorer labels,
# so event details retain minute/team/type but omit the untranslatable Player_AR field.
goals_en = [{k: v for k, v in g.items() if k != 'Player_AR'} for g in goals]

# Compute transparent, reproducible tournament KPIs directly from the workbook.
match_df = pd.read_excel(WORKBOOK, sheet_name='Matches')
stand_df = pd.read_excel(WORKBOOK, sheet_name='Standings')
scorer_df = pd.read_excel(WORKBOOK, sheet_name='Scorers')
max_attendance = match_df.loc[match_df['Attendance'].idxmax()]
high_score = match_df.loc[match_df['Total_Goals'].idxmax()]
final_row = match_df[match_df['Stage'].eq('Final')].iloc[0]
third_row = match_df[match_df['Stage'].eq('Third Place')].iloc[0]
summary = {
    'teams': int(stand_df['Team_EN'].nunique()), 'groups': int(stand_df['Group'].nunique()),
    'matches': int(len(match_df)), 'goals': int(match_df['Total_Goals'].sum()),
    'goalsPerMatch': round(float(match_df['Total_Goals'].mean()), 2),
    'extraTimeMatches': int(match_df['Went_Extra_Time'].fillna(False).astype(bool).sum()),
    'stadiums': int(len(stadiums)), 'scorers': int(len(scorer_df)),
    'totalAttendance': int(match_df['Attendance'].sum()),
    'averageAttendance': int(round(float(match_df['Attendance'].mean()))),
    'largestCrowd': {'teams': f"{max_attendance['Team1']} vs {max_attendance['Team2']}", 'attendance': int(max_attendance['Attendance']), 'stadium': str(max_attendance['Stadium'])},
    'highestScoringMatch': {'teams': f"{high_score['Team1']} vs {high_score['Team2']}", 'score': f"{int(high_score['Goals1'])}-{int(high_score['Goals2'])}", 'goals': int(high_score['Total_Goals']), 'stage': str(high_score['Stage'])},
    'final': {'teams': f"{final_row['Team1']} vs {final_row['Team2']}", 'score': f"{int(final_row['Goals1'])}-{int(final_row['Goals2'])}", 'winner': str(final_row['Winner']), 'stadium': str(final_row['Stadium'])},
    'thirdPlace': {'teams': f"{third_row['Team1']} vs {third_row['Team2']}", 'score': f"{int(third_row['Goals1'])}-{int(third_row['Goals2'])}", 'winner': str(third_row['Winner'])},
    'stageCounts': match_df['Stage'].value_counts().to_dict(),
    'goalsByStage': match_df.groupby('Stage')['Total_Goals'].sum().to_dict(),
    'goalTimeBuckets': pd.read_excel(WORKBOOK, sheet_name='Goals')['Time_Bucket'].value_counts().to_dict(),
    'powerBiPages': 56
}

payload = {
    'summary': summary, 'teams': teams, 'standings': standings, 'matches': matches,
    'teamMatches': team_matches, 'goals': goals_en, 'stadiums': stadiums,
    'scorers': scorers, 'matchAwards': match_awards, 'awards': awards,
    'flags': flag_by_team,
    'sources': {
        'fifaStandings': 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-tournament-standings',
        'turkiyeUsaReport': 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/turkiye-usa-match-report-highlights',
        'userWorkbook': 'assets/docs/World_Cup_2026_Data.xlsx',
        'powerBiFile': 'assets/docs/W.C.2026.pbix'
    }
}
(DATA_DIR / 'tournament.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
(DATA_DIR / 'tournament-data.js').write_text('window.WC_DATA = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')

# Build image-credit manifest with file-specific Wikimedia license metadata.
photo_urls = list(photo_jobs)
file_urls, license_info = commons_metadata(photo_urls)
with (DATA_DIR / 'photo-attribution.csv').open('w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['player', 'team', 'local_file', 'source_image_url', 'Wikimedia_file_page', 'license', 'license_url', 'creator', 'credit', 'permission_note'])
    for p in scorers:
        url = p.get('Photo_URL')
        if not url: continue
        filename = commons_filename(url)
        page_url = 'https://commons.wikimedia.org/wiki/File:' + quote(filename.replace(' ', '_'), safe='()_-')
        meta = license_info.get(filename.replace(' ', '_'), {})
        local = p.get('Photo') or ''
        w.writerow([p.get('Player'), p.get('Team'), local, url, page_url, meta.get('license',''), meta.get('license_url',''), meta.get('creator',''), meta.get('credit',''), meta.get('permission','')])

# Flag sources are recorded separately; flag images come from FlagCDN.
with (DATA_DIR / 'flag-sources.csv').open('w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['team','local_file','source_url'])
    for team, rel in flag_by_team.items():
        code = Path(rel).stem
        w.writerow([team, rel, f'https://flagcdn.com/w320/{code}.png'])

ok_photos = sum(1 for v in photo_results.values() if v[0])
ok_flags = sum(1 for v in flag_results if v[0])
missing_flags = [team for team, rel in flag_by_team.items() if not (ROOT / rel).exists()]
print(json.dumps({'teams': summary['teams'], 'matches': summary['matches'], 'players': len(scorers), 'portrait_files': len(photo_jobs), 'portraits_downloaded': ok_photos, 'flags_requested': len(flag_jobs), 'flags_downloaded': ok_flags, 'missing_flag_teams': missing_flags, 'licenses_found': sum(1 for v in license_info.values() if v.get('license') and v.get('license') != 'Metadata lookup failed'), 'data_bytes': (DATA_DIR/'tournament.json').stat().st_size}, ensure_ascii=False, indent=2))
