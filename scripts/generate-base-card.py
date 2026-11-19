#!/usr/bin/env python3
import os
from PIL import Image
import numpy as np
from collections import deque
from scipy.ndimage import gaussian_filter

def generate_base_card(
    output_path="/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-base.png",
    path_bg="/tmp/card_assets/media_1794214931887_cf2e7102.jpg",
    path_sandeep="/tmp/new_sandeep_cutout.png",
    path_banner="/tmp/clean_banner_isolated.png",
    path_logo="/tmp/card_assets/media_1794168048818_d0bd893e.jpg",
    path_header="/tmp/card_assets/media_1794168169623_3a7125f8.png",
    path_title="/tmp/card_assets/media_1794168855493_afbb62f1.png"
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

    # 5. Sandeep Jadhav - Clean new portrait (FIRST)
    san_clean = Image.open(path_sandeep).convert('RGBA')
    san_h = int(H * 0.49)
    san_w = int(san_clean.width * (san_h / san_clean.height))
    san_scaled = san_clean.resize((san_w, san_h), Image.Resampling.LANCZOS)
    san_x = W - san_w + int(W * 0.01)
    san_y = H - san_h - int(H * 0.018)
    base.paste(san_scaled, (san_x, san_y), san_scaled)

    # 6. Official Name & Designation Banner (SECOND - layered ABOVE person)
    banner_clean = Image.open(path_banner).convert('RGBA')
    b_w = san_w + 10
    b_h = int(banner_clean.height * (b_w / banner_clean.width))
    banner_scaled = banner_clean.resize((b_w, b_h), Image.Resampling.LANCZOS)
    b_x = W - b_w
    b_y = H - b_h - int(H * 0.012)
    base.paste(banner_scaled, (b_x, b_y), banner_scaled)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    base.save(output_path)
    print(f"Generated base card at: {output_path}")

if __name__ == "__main__":
    generate_base_card()

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    base.save(output_path)
    print(f"Generated base card at: {output_path}")

if __name__ == "__main__":
    generate_base_card()

