import json
from pathlib import Path

import numpy as np
from scipy.interpolate import splev, splprep
from scipy.ndimage import gaussian_filter1d

SIGMA = 4.0
TOLERANCE = 1.5
STEP = 30.0
WINDOW = 12

vx, vy, vw, vh = map(float, open('vb.txt').read().split())
strokes = json.load(open('strokes.json'))
scale = vw / 2000

def reversal_points(P):
    idx = []
    for i in range(WINDOW, len(P) - WINDOW):
        a, b = P[i] - P[i - WINDOW], P[i + WINDOW] - P[i]
        na, nb = np.linalg.norm(a), np.linalg.norm(b)
        if na and nb and np.dot(a, b) / (na * nb) < 0.25:
            idx.append(i)
    tips, group = [], []
    for i in idx:
        if group and i - group[-1] > 2:
            tips.append(max(group, key=lambda j: np.linalg.norm(P[j] - P[j - WINDOW]) + np.linalg.norm(P[j + WINDOW] - P[j])))
            group = []
        group.append(i)
    if group:
        tips.append(max(group, key=lambda j: np.linalg.norm(P[j] - P[j - WINDOW]) + np.linalg.norm(P[j + WINDOW] - P[j])))
    return tips

def fit_segment(P):
    pad = min(len(P) - 1, int(SIGMA * 4))
    head = 2 * P[0] - P[1 : pad + 1][::-1]
    tail = 2 * P[-1] - P[-pad - 1 : -1][::-1]
    E = np.vstack([head, P, tail])
    S = np.column_stack([gaussian_filter1d(E[:, i], SIGMA, mode='nearest') for i in range(2)])[pad : pad + len(P)]
    S[0], S[-1] = P[0], P[-1]
    keep = np.concatenate([[True], np.linalg.norm(np.diff(S, axis=0), axis=1) > 1e-6])
    S = S[keep]
    w = np.ones(len(S))
    w[0] = w[-1] = 100
    tck, _ = splprep([S[:, 0], S[:, 1]], w=w, k=3, s=len(S) * TOLERANCE**2)
    return tck


def spline_to_bezier(tck):
    u = np.linspace(0, 1, 4000)
    xy = np.array(splev(u, tck)).T
    length = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))])
    n = max(2, int(length[-1] // STEP) + 1)
    us = np.interp(np.linspace(0, length[-1], n), length, u)
    p = np.array(splev(us, tck)).T
    dp = np.array(splev(us, tck, der=1)).T
    return [(p[i], p[i] + dp[i] * (us[i + 1] - us[i]) / 3, p[i + 1] - dp[i + 1] * (us[i + 1] - us[i]) / 3, p[i + 1]) for i in range(n - 1)]


def to_path(points):
    P = np.array(points, float)
    cuts = [0, *reversal_points(P), len(P) - 1]
    segments = [seg for a, b in zip(cuts, cuts[1:]) if b - a >= 8 for seg in spline_to_bezier(fit_segment(P[a : b + 1]))]
    origin = np.array([vx, vy])
    f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')
    pt = lambda v: (v * scale + origin)
    start = pt(segments[0][0])
    d = f'M{f(start[0])} {f(start[1])}'
    for _, c1, c2, end in segments:
        c1, c2, end = pt(c1), pt(c2), pt(end)
        d += f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(end[0])} {f(end[1])}'
    return d


out = Path(__file__).resolve().parents[2] / 'src/assets/signature.ts'
s1, s2 = to_path(strokes['s1']), to_path(strokes['s2'])
out.write_text(f'''export const signature = {{
  viewBox: '{vx:.0f} {vy:.0f} {vw:.0f} {vh:.0f}',
  strokeWidth: 76,
  strokes: [
    '{s1}',
    '{s2}',
  ],
}}
''')
print('written', out, len(s1) + len(s2), 'chars')
