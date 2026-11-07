#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_viral_instagram_card(output_path, sample_photo_path=None):
    W, H = 1080, 1350

    # 1. PURE STADIUM BACKGROUND (from user upload: stadium-pure-bg.jpg)
    stadium_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/stadium-pure-bg.jpg"
    stadium = Image.open(stadium_path).convert("RGBA")
    
    # Scale to fill 1080x1350
    stadium_scaled = stadium.resize((W, H), Image.Resampling.LANCZOS)

    # 2. Subtle luxury dark gradient overlay (so text & portraits pop with crisp contrast)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    # Top fade for header
    for y in range(360):
        t = y / 360
        alpha = int(220 - t * 80)
        ov_draw.line([(0, y), (W, y)], fill=(8, 3, 16, alpha))

    # Center light fade (keep stadium lights blazing)
    for y in range(360, 820):
        t = (y - 360) / 460
        alpha = int(120 + t * 40)
        ov_draw.line([(0, y), (W, y)], fill=(8, 3, 16, alpha))

    # Bottom fade for player name, ID & stats
    for y in range(820, H):
        t = (y - 820) / (H - 820)
        alpha = int(180 + t * 65)
        ov_draw.line([(0, y), (W, y)], fill=(8, 3, 16, min(255, alpha)))

    img = Image.alpha_composite(stadium_scaled, overlay)

    # Ambient golden floodlight glow on center
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([W//2 - 350, 360, W//2 + 350, 900], fill=(245, 158, 11, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    # 3. Outer Double Border (Championship Gold)
    m = 22
    draw.rounded_rectangle([m, m, W - m, H - m], radius=24, outline=(245, 158, 11, 200), width=3)
    draw.rounded_rectangle([m + 6, m + 6, W - m - 6, H - m - 6], radius=20, outline=(253, 224, 71, 70), width=1)

    # Fonts
    font_dir = "/System/Library/Fonts/Supplemental"
    font_impact_lg = ImageFont.truetype(f"{font_dir}/Impact.ttf", 82)
    font_impact_md = ImageFont.truetype(f"{font_dir}/Impact.ttf", 30)
    font_impact_sm = ImageFont.truetype(f"{font_dir}/Impact.ttf", 22)
    font_name = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 46)
    font_bold_lg = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 24)
    font_bold_md = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 18)
    font_bold_sm = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 15)
    font_tag = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 13)
    font_mono = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 22)

    # 4. TOP HEADER: RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)
    rr_w, rr_h = 760, 42
    rr_box = Image.new("RGBA", (rr_w, rr_h), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(rr_box)
    r_draw.rounded_rectangle([0, 0, rr_w, rr_h], radius=21, fill=(180, 83, 9, 240), outline=(253, 224, 71, 240), width=2)
    r_draw.text((rr_w // 2, rr_h // 2), "★ RADHE RADHE FOUNDATION  |  REG. NO. E-0040526 (GBR) ★", fill=(255, 255, 255, 255), font=font_bold_sm, anchor="mm")
    img.paste(rr_box, (W // 2 - rr_w // 2, 38), rr_box)

    # 5. GPL Shield Logo
    logo_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-logo.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((95, 95), Image.Resampling.LANCZOS)
            img.paste(logo, (W // 2 - logo.width // 2, 90), logo)
        except Exception as e:
            print("Logo load error:", e)

    # Title: GOREGAON PREMIER LEAGUE
    draw.text((W // 2, 202), "GOREGAON PREMIER LEAGUE", fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")
    # Subtitle: GOREGAON PURV VIDHAN SABHA
    draw.text((W // 2, 230), "GOREGAON PURV VIDHAN SABHA", fill=(245, 158, 11, 255), font=font_bold_md, anchor="mm")

    # 6. Red "SEASON 4" Badge
    s4_w, s4_h = 180, 34
    s4_box = Image.new("RGBA", (s4_w, s4_h), (0, 0, 0, 0))
    s4_draw = ImageDraw.Draw(s4_box)
    s4_draw.rounded_rectangle([0, 0, s4_w, s4_h], radius=9, fill=(220, 38, 38, 255), outline=(248, 113, 113, 230), width=1)
    s4_draw.text((s4_w // 2, s4_h // 2), "SEASON 4", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    img.paste(s4_box, (W // 2 - s4_w // 2, 256), s4_box)

    # 7. Big 3D Metallic "AUCTION POOL"
    ap_y = 330
    draw.text((W // 2 + 2, ap_y + 2), "AUCTION POOL", fill=(0, 0, 0, 210), font=font_impact_lg, anchor="mm")
    draw.text((W // 2, ap_y), "AUCTION POOL", fill=(253, 224, 71, 255), font=font_impact_lg, anchor="mm")

    # 8. Red "✔ QUALIFIED & REGISTERED" Ribbon
    q_w, q_h = 320, 36
    q_box = Image.new("RGBA", (q_w, q_h), (0, 0, 0, 0))
    q_draw = ImageDraw.Draw(q_box)
    q_draw.rounded_rectangle([0, 0, q_w, q_h], radius=18, fill=(185, 28, 28, 240), outline=(252, 165, 165, 190), width=1)
    q_draw.text((q_w // 2, q_h // 2), "✔  QUALIFIED & REGISTERED", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    img.paste(q_box, (W // 2 - q_w // 2, 372), q_box)

    # 9. FOREGROUND HERO DUAL PORTRAITS (PLAYER + SHRI SANDEEP JADHAV)
    # Side-by-side layout in the foreground
    card_w = 420
    card_h = 420
    card_rad = 28
    gap = 40
    start_x = (W - (2 * card_w + gap)) // 2
    cards_y = 430

    # --- LEFT FOREGROUND: REGISTERED PLAYER ---
    p_x = start_x
    p_y = cards_y

    # Glow behind player card
    glow_p = Image.new("RGBA", (card_w + 40, card_h + 40), (0, 0, 0, 0))
    gp_draw = ImageDraw.Draw(glow_p)
    gp_draw.rounded_rectangle([10, 10, card_w + 30, card_h + 30], radius=36, fill=(245, 158, 11, 80))
    glow_p = glow_p.filter(ImageFilter.GaussianBlur(18))
    img.paste(glow_p, (p_x - 20, p_y - 20), glow_p)

    mask_p = Image.new("L", (card_w, card_h), 0)
    mp_draw = ImageDraw.Draw(mask_p)
    mp_draw.rounded_rectangle([0, 0, card_w, card_h], radius=card_rad, fill=255)

    player_placed = False
    if sample_photo_path and os.path.exists(sample_photo_path):
        try:
            pimg = Image.open(sample_photo_path).convert("RGBA")
            min_side = min(pimg.width, pimg.height)
            cx, cy = pimg.width // 2, pimg.height // 2
            pimg = pimg.crop((cx - min_side // 2, cy - min_side // 2, cx + min_side // 2, cy + min_side // 2))
            pimg = pimg.resize((card_w, card_h), Image.Resampling.LANCZOS)
            img.paste(pimg, (p_x, p_y), mask_p)
            player_placed = True
        except Exception as e:
            print("Player image error:", e)

    if not player_placed:
        p_bg = Image.new("RGBA", (card_w, card_h), (14, 24, 46, 255))
        pb_draw = ImageDraw.Draw(p_bg)
        pb_draw.ellipse([card_w//2 - 70, 90, card_w//2 + 70, 230], fill=(245, 158, 11, 230))
        pb_draw.ellipse([card_w//2 - 150, 250, card_w//2 + 150, 480], fill=(245, 158, 11, 180))
        img.paste(p_bg, (p_x, p_y), mask_p)

    # Gold frame around player
    draw.rounded_rectangle([p_x - 3, p_y - 3, p_x + card_w + 3, p_y + card_h + 3], radius=card_rad + 3, outline=(245, 158, 11, 255), width=4)
    # Player tag at bottom of photo
    ptag_w, ptag_h = 240, 32
    ptag_box = Image.new("RGBA", (ptag_w, ptag_h), (0, 0, 0, 0))
    pt_draw = ImageDraw.Draw(ptag_box)
    pt_draw.rounded_rectangle([0, 0, ptag_w, ptag_h], radius=16, fill=(10, 20, 38, 240), outline=(245, 158, 11, 230), width=2)
    pt_draw.text((ptag_w // 2, ptag_h // 2), "★ REGISTERED PLAYER ★", fill=(253, 224, 71, 255), font=font_tag, anchor="mm")
    img.paste(ptag_box, (p_x + card_w // 2 - ptag_w // 2, p_y + card_h - 22), ptag_box)

    # --- RIGHT FOREGROUND: SHRI SANDEEP JADHAV ---
    s_x = start_x + card_w + gap
    s_y = cards_y

    # Glow behind Sandeep card
    glow_s = Image.new("RGBA", (card_w + 40, card_h + 40), (0, 0, 0, 0))
    gs_draw = ImageDraw.Draw(glow_s)
    gs_draw.rounded_rectangle([10, 10, card_w + 30, card_h + 30], radius=36, fill=(245, 158, 11, 80))
    glow_s = glow_s.filter(ImageFilter.GaussianBlur(18))
    img.paste(glow_s, (s_x - 20, s_y - 20), glow_s)

    mask_s = Image.new("L", (card_w, card_h), 0)
    ms_draw = ImageDraw.Draw(mask_s)
    ms_draw.rounded_rectangle([0, 0, card_w, card_h], radius=card_rad, fill=255)

    sandeep_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/sandeep-excellence.jpg"
    if os.path.exists(sandeep_path):
        simg = Image.open(sandeep_path).convert("RGBA")
        # Crop to upper torso and face holding trophy
        # image size: 768 x 1024
        # keep x: 100 to 668, y: 150 to 718 (square around face and award)
        crop_box = (90, 160, 678, 748)
        simg_cropped = simg.crop(crop_box).resize((card_w, card_h), Image.Resampling.LANCZOS)
        img.paste(simg_cropped, (s_x, s_y), mask_s)

    # Gold frame around Sandeep
    draw.rounded_rectangle([s_x - 3, s_y - 3, s_x + card_w + 3, s_y + card_h + 3], radius=card_rad + 3, outline=(245, 158, 11, 255), width=4)
    # Sandeep tag at bottom of photo
    stag_w, stag_h = 260, 32
    stag_box = Image.new("RGBA", (stag_w, stag_h), (0, 0, 0, 0))
    st_draw = ImageDraw.Draw(stag_box)
    st_draw.rounded_rectangle([0, 0, stag_w, stag_h], radius=16, fill=(10, 20, 38, 240), outline=(245, 158, 11, 230), width=2)
    st_draw.text((stag_w // 2, stag_h // 2), "★ संस्थापक: श्री. संदीप जाधव ★", fill=(253, 224, 71, 255), font=font_tag, anchor="mm")
    img.paste(stag_box, (s_x + card_w // 2 - stag_w // 2, s_y + card_h - 22), stag_box)

    # 10. PLAYER FULL NAME (Big, bold, metallic white with 3D shadow)
    name_str = "R. THAVITH KUMAR"
    draw.text((W // 2 + 2, 892), name_str, fill=(0, 0, 0, 220), font=font_name, anchor="mm")
    draw.text((W // 2, 890), name_str, fill=(255, 255, 255, 255), font=font_name, anchor="mm")

    # 11. Clean ID Chip: GPL ID : GPL1109533
    id_w, id_h = 380, 48
    id_box = Image.new("RGBA", (id_w, id_h), (0, 0, 0, 0))
    id_draw = ImageDraw.Draw(id_box)
    id_draw.rounded_rectangle([0, 0, id_w, id_h], radius=24, fill=(10, 20, 38, 235), outline=(245, 158, 11, 255), width=2)
    id_draw.text((id_w // 2, id_h // 2), "GPL ID : GPL1109533", fill=(253, 224, 71, 255), font=font_mono, anchor="mm")
    img.paste(id_box, (W // 2 - id_w // 2, 930), id_box)

    # 12. 3 Clean Badges: WARD, ROLE, ZONE
    badges = [
        ("📍 WARD", "WARD 51"),
        ("🏏 ROLE", "ALL-ROUNDER"),
        ("🛡️ ZONE", "GOREGAON PURV")
    ]
    b_w = 280
    b_h = 86
    b_gap = 24
    total_bw = 3 * b_w + 2 * b_gap
    start_bx = (W - total_bw) // 2
    b_y = 1008

    for i, (label, val) in enumerate(badges):
        bx = start_bx + i * (b_w + b_gap)
        bbox = Image.new("RGBA", (b_w, b_h), (0, 0, 0, 0))
        bdraw = ImageDraw.Draw(bbox)
        bdraw.rounded_rectangle([0, 0, b_w, b_h], radius=16, fill=(14, 24, 46, 230), outline=(245, 158, 11, 120), width=1)
        bdraw.text((b_w // 2, 28), label, fill=(148, 163, 184, 255), font=font_bold_sm, anchor="mm")
        bdraw.text((b_w // 2, 58), val, fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")
        img.paste(bbox, (bx, b_y), bbox)

    # 13. Clean Kit Strip
    kit_w, kit_h = 580, 46
    kit_box = Image.new("RGBA", (kit_w, kit_h), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(kit_box)
    kdraw.rounded_rectangle([0, 0, kit_w, kit_h], radius=23, fill=(12, 22, 42, 220), outline=(245, 158, 11, 90), width=1)
    kdraw.text((kit_w // 2, kit_h // 2), "OFFICIAL KIT: T-SHIRT L  •  TRACK L  |  VERIFIED ENTRY", fill=(245, 158, 11, 245), font=font_bold_sm, anchor="mm")
    img.paste(kit_box, (W // 2 - kit_w // 2, 1120), kit_box)

    # 14. Minimalist Baseline
    draw.text((W // 2, 1215), "RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)  •  GOREGAON PREMIER LEAGUE", fill=(203, 213, 225, 220), font=font_bold_sm, anchor="mm")

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", quality=95)
    print(f"Generated viral Instagram card at {output_path}")

if __name__ == "__main__":
    sample = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-1.jpg"
    out1 = "/Users/alok/Desktop/goregaon-premier-league/template-player-card.png"
    out2 = "/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png"
    generate_viral_instagram_card(out1, sample)
    generate_viral_instagram_card(out2, sample)
