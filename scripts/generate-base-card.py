#!/usr/bin/env python3
import os
from PIL import Image
import numpy as np
from collections import deque
from scipy.ndimage import gaussian_filter

def generate_base_card(
    output_path="/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-base.png",
    path_bg="/Users/alok/.gemini/antigravity/brain/5009713f-e5ef-41db-b3d6-f8528be54e9f/.user_uploaded/media_1794214931887_cf2e7102.jpg",
    path_sandeep="/Users/alok/.gemini/antigravity/brain/5009713f-e5ef-41db-b3d6-f8528be54e9f/.user_uploaded/media_1794167909794_dd3350ef.jpg",
    path_logo="/Users/alok/.gemini/antigravity/brain/5009713f-e5ef-41db-b3d6-f8528be54e9f/.user_uploaded/media_1794168048818_d0bd893e.jpg",
    path_header="/Users/alok/.gemini/antigravity/brain/5009713f-e5ef-41db-b3d6-f8528be54e9f/.user_uploaded/media_1794168169623_3a7125f8.png",
    path_title="/Users/alok/.gemini/antigravity/brain/5009713f-e5ef-41db-b3d6-f8528be54e9f/.user_uploaded/media_1794168855493_afbb62f1.png"
):
    W, H = 935, 1024

    # 1. Background
    bg = Image.open(path_bg).convert('RGBA').resize((W, H), Image.Resampling.LANCZOS)
    base = bg.copy()

    # 2. Header
    header = Image.open(path_header).convert('RGBA')
    h_arr = np.array(header)
    h_rows = np.any(h_arr[:, :, 3] > 20, axis=1)
    h_cols = np.any(h_arr[:, :, 3] > 20, axis=0)
    header_cropped = header.crop((np.where(h_cols)[0][0], np.where(h_rows)[0][0], np.where(h_cols)[0][-1] + 1, np.where(h_rows)[0][-1] + 1))
    hdr_w = int(W * 0.76)
    hdr_h = int(header_cropped.height * (hdr_w / header_cropped.width))
    header_scaled = header_cropped.resize((hdr_w, hdr_h), Image.Resampling.LANCZOS)
    hdr_x = (W - hdr_w) // 2
    hdr_y = int(H * 0.032)
    base.paste(header_scaled, (hdr_x, hdr_y), header_scaled)

    # 3. Logo
    logo = Image.open(path_logo).convert('RGB')
    l_arr = np.array(logo, dtype=np.float32)
    LH, LW, _ = l_arr.shape
    is_black = np.max(l_arr, axis=2) <= 22
    visited_l = np.zeros((LH, LW), dtype=bool)
    q_l = deque()
    for x in range(LW):
        if is_black[0, x]: visited_l[0, x] = True; q_l.append((0, x))
        if is_black[LH-1, x]: visited_l[LH-1, x] = True; q_l.append((LH-1, x))
    for y in range(LH):
        if is_black[y, 0]: visited_l[y, 0] = True; q_l.append((y, 0))
        if is_black[y, LW-1]: visited_l[y, LW-1] = True; q_l.append((y, LW-1))
    while q_l:
        y, x = q_l.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < LH and 0 <= nx < LW and not visited_l[ny, nx]:
                if is_black[ny, nx]:
                    visited_l[ny, nx] = True
                    q_l.append((ny, nx))
    l_fg = ~visited_l
    l_alpha = gaussian_filter(l_fg.astype(np.float32), sigma=0.8)
    l_alpha = np.clip(l_alpha * 255, 0, 255).astype(np.uint8)
    l_alpha[visited_l] = 0
    logo_clean = Image.fromarray(np.dstack([l_arr.astype(np.uint8), l_alpha]))
    logo_size = int(W * 0.22)
    logo_scaled = logo_clean.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    logo_x = (W - logo_size) // 2
    logo_y = hdr_y + hdr_h + int(H * 0.010)
    base.paste(logo_scaled, (logo_x, logo_y), logo_scaled)

    # 4. Title
    title_img = Image.open(path_title).convert('RGBA')
    t_arr = np.array(title_img)
    t_rows = np.any(t_arr[:, :, 3] > 15, axis=1)
    t_cols = np.any(t_arr[:, :, 3] > 15, axis=0)
    title_cropped = title_img.crop((np.where(t_cols)[0][0], np.where(t_rows)[0][0], np.where(t_cols)[0][-1] + 1, np.where(t_rows)[0][-1] + 1))
    title_w = int(W * 0.52)
    title_h = int(title_cropped.height * (title_w / title_cropped.width))
    title_scaled = title_cropped.resize((title_w, title_h), Image.Resampling.LANCZOS)
    title_x = (W - title_w) // 2
    title_y = logo_y + logo_size + int(H * 0.010)
    base.paste(title_scaled, (title_x, title_y), title_scaled)

    # 5. Sandeep Jadhav - Clean Head and Shoulders (ZERO lines) & Full Hands/Sleeves/Banner
    san = Image.open(path_sandeep).convert('RGB')
    s_arr = np.array(san, dtype=np.float32)
    SH, SW, _ = s_arr.shape
    diff = np.max(s_arr, axis=2) - np.min(s_arr, axis=2)
    mean_lum = np.mean(s_arr, axis=2)

    s_mask = np.zeros((SH, SW), dtype=bool)

    # For y < 480: Clean body bounds (eliminates 100% of horizontal line spikes)
    for y in range(12, 480):
        bl = -1
        for x in range(0, 400):
            if not (diff[y, x] <= 8 and mean_lum[y, x] >= 200):
                bl = x; break
        br = -1
        for x in range(SW - 1, 400, -1):
            if not (diff[y, x] <= 8 and mean_lum[y, x] >= 200):
                br = x; break
        if bl != -1 and br != -1 and bl < br:
            s_mask[y, bl:br+1] = True

    # For y >= 480: Solid row scan (preserves 100% full sleeves, hands, watch, banner)
    for y in range(480, SH):
        lx = 0
        for x in range(0, SW // 2):
            if diff[y, x] > 3 or mean_lum[y, x] < 210:
                lx = x; break
        rx = SW - 1
        for x in range(SW - 1, SW // 2, -1):
            if diff[y, x] > 3 or mean_lum[y, x] < 210:
                rx = x; break
        if lx < rx:
            s_mask[y, lx:rx+1] = True

    # Remove white checkerboard area below and around the banner (y >= 800)
    is_cb_bottom = (diff <= 12) & (mean_lum >= 190)
    visited_bottom = np.zeros((SH, SW), dtype=bool)
    q_b = deque()
    for x in range(SW):
        if is_cb_bottom[SH - 1, x]:
            visited_bottom[SH - 1, x] = True
            q_b.append((SH - 1, x))
    for y in range(800, SH):
        if is_cb_bottom[y, 0]:
            visited_bottom[y, 0] = True
            q_b.append((y, 0))
        if is_cb_bottom[y, SW - 1]:
            visited_bottom[y, SW - 1] = True
            q_b.append((y, SW - 1))
    while q_b:
        y, x = q_b.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 800 <= ny < SH and 0 <= nx < SW and not visited_bottom[ny, nx]:
                if is_cb_bottom[ny, nx]:
                    visited_bottom[ny, nx] = True
                    q_b.append((ny, nx))

    s_mask[visited_bottom] = False

    s_alpha = gaussian_filter(s_mask.astype(np.float32), sigma=0.8)
    s_alpha = np.clip(s_alpha * 255, 0, 255).astype(np.uint8)
    s_alpha[:12, :] = 0
    s_alpha[visited_bottom] = 0

    san_clean = Image.fromarray(np.dstack([s_arr.astype(np.uint8), s_alpha]))
    san_h = int(H * 0.49)
    san_w = int(san_clean.width * (san_h / san_clean.height))
    san_scaled = san_clean.resize((san_w, san_h), Image.Resampling.LANCZOS)
    san_x = W - san_w + int(W * 0.01)
    san_y = H - san_h - int(H * 0.018)
    base.paste(san_scaled, (san_x, san_y), san_scaled)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    base.save(output_path)
    print(f"Generated base card at: {output_path}")

if __name__ == "__main__":
    generate_base_card()

