#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_gpl_card(output_path, sample_photo_path=None):
    W, H = 1080, 1350

    # 1. Load the pre-baked stadium background (featuring the user's uploaded stadium & Sandeep Jadhav)
    bg_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/card-stadium-bg-overlay.jpg"
    if os.path.exists(bg_path):
        img = Image.open(bg_path).convert("RGBA")
    else:
        img = Image.new("RGBA", (W, H), (12, 6, 24, 255))

    # Ambient golden light on center
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([W//2 - 280, 420, W//2 + 280, 960], fill=(245, 158, 11, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    # 2. Outer Card Border
    m = 24
    draw.rounded_rectangle([m, m, W - m, H - m], radius=24, outline=(245, 158, 11, 170), width=2)
    draw.rounded_rectangle([m + 6, m + 6, W - m - 6, H - m - 6], radius=20, outline=(253, 224, 71, 55), width=1)

    # Fonts
    font_dir = "/System/Library/Fonts/Supplemental"
    font_impact_lg = ImageFont.truetype(f"{font_dir}/Impact.ttf", 86)
    font_impact_md = ImageFont.truetype(f"{font_dir}/Impact.ttf", 32)
    font_impact_sm = ImageFont.truetype(f"{font_dir}/Impact.ttf", 24)
    font_name = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 46)
    font_bold_lg = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 23)
    font_bold_md = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 18)
    font_bold_sm = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 15)
    font_mono = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 22)

    # 3. TOP: RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)
    rr_w, rr_h = 740, 44
    rr_box = Image.new("RGBA", (rr_w, rr_h), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(rr_box)
    r_draw.rounded_rectangle([0, 0, rr_w, rr_h], radius=22, fill=(180, 83, 9, 235), outline=(253, 224, 71, 240), width=2)
    r_draw.text((rr_w // 2, rr_h // 2), "★ RADHE RADHE FOUNDATION  |  REG. NO. E-0040526 (GBR) ★", fill=(255, 255, 255, 255), font=font_bold_sm, anchor="mm")
    img.paste(rr_box, (W // 2 - rr_w // 2, 42), rr_box)

    # 4. Logo + GOREGAON PREMIER LEAGUE + GOREGAON PURV VIDHAN SABHA
    logo_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-logo.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((105, 105), Image.Resampling.LANCZOS)
            img.paste(logo, (W // 2 - logo.width // 2, 98), logo)
        except Exception as e:
            print("Logo load error:", e)

    draw.text((W // 2, 220), "GOREGAON PREMIER LEAGUE", fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")
    draw.text((W // 2, 248), "GOREGAON PURV VIDHAN SABHA", fill=(245, 158, 11, 240), font=font_bold_md, anchor="mm")

    # 5. Red "SEASON 4" Stamp
    s4_w, s4_h = 190, 36
    s4_box = Image.new("RGBA", (s4_w, s4_h), (0, 0, 0, 0))
    s4_draw = ImageDraw.Draw(s4_box)
    s4_draw.rounded_rectangle([0, 0, s4_w, s4_h], radius=10, fill=(220, 38, 38, 255), outline=(248, 113, 113, 220), width=1)
    s4_draw.text((s4_w // 2, s4_h // 2), "SEASON 4", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    img.paste(s4_box, (W // 2 - s4_w // 2, 276), s4_box)

    # 6. AUCTION POOL Title
    ap_y = 356
    draw.text((W // 2 + 2, ap_y + 2), "AUCTION POOL", fill=(0, 0, 0, 200), font=font_impact_lg, anchor="mm")
    draw.text((W // 2, ap_y), "AUCTION POOL", fill=(253, 224, 71, 255), font=font_impact_lg, anchor="mm")

    # 7. Red "✔ QUALIFIED" Ribbon
    q_w, q_h = 280, 38
    q_box = Image.new("RGBA", (q_w, q_h), (0, 0, 0, 0))
    q_draw = ImageDraw.Draw(q_box)
    q_draw.rounded_rectangle([0, 0, q_w, q_h], radius=19, fill=(185, 28, 28, 240), outline=(252, 165, 165, 180), width=1)
    q_draw.text((q_w // 2, q_h // 2), "✔  QUALIFIED", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    img.paste(q_box, (W // 2 - q_w // 2, 404), q_box)

    # 8. Hero Player Portrait
    p_size = 360
    p_x = W // 2 - p_size // 2
    p_y = 470
    p_rad = 32

    # Glow behind photo
    glow_p = Image.new("RGBA", (p_size + 60, p_size + 60), (0, 0, 0, 0))
    gp_draw = ImageDraw.Draw(glow_p)
    gp_draw.rounded_rectangle([15, 15, p_size + 45, p_size + 45], radius=44, fill=(245, 158, 11, 80))
    glow_p = glow_p.filter(ImageFilter.GaussianBlur(22))
    img.paste(glow_p, (p_x - 30, p_y - 30), glow_p)

    mask = Image.new("L", (p_size, p_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, p_size, p_size], radius=p_rad, fill=255)

    photo_done = False
    if sample_photo_path and os.path.exists(sample_photo_path):
        try:
            player_img = Image.open(sample_photo_path).convert("RGBA")
            min_side = min(player_img.width, player_img.height)
            cx, cy = player_img.width // 2, player_img.height // 2
            player_img = player_img.crop((cx - min_side // 2, cy - min_side // 2, cx + min_side // 2, cy + min_side // 2))
            player_img = player_img.resize((p_size, p_size), Image.Resampling.LANCZOS)
            img.paste(player_img, (p_x, p_y), mask)
            photo_done = True
        except Exception as err:
            print("Photo error:", err)

    if not photo_done:
        av_bg = Image.new("RGBA", (p_size, p_size), (12, 22, 44, 255))
        ab_draw = ImageDraw.Draw(av_bg)
        ab_draw.ellipse([p_size//2 - 65, 80, p_size//2 + 65, 210], fill=(245, 158, 11, 230))
        ab_draw.ellipse([p_size//2 - 140, 230, p_size//2 + 140, 460], fill=(245, 158, 11, 180))
        img.paste(av_bg, (p_x, p_y), mask)

    draw.rounded_rectangle([p_x - 4, p_y - 4, p_x + p_size + 4, p_y + p_size + 4], radius=p_rad + 4, outline=(245, 158, 11, 255), width=4)
    draw.rounded_rectangle([p_x - 10, p_y - 10, p_x + p_size + 10, p_y + p_size + 10], radius=p_rad + 10, outline=(251, 191, 36, 90), width=1)

    # 9. Player Full Name
    name_str = "R. THAVITH KUMAR"
    draw.text((W // 2 + 2, 882), name_str, fill=(0, 0, 0, 220), font=font_name, anchor="mm")
    draw.text((W // 2, 880), name_str, fill=(255, 255, 255, 255), font=font_name, anchor="mm")

    # 10. Clean ID Chip: GPL ID : GPL1109533
    id_w, id_h = 380, 48
    id_box = Image.new("RGBA", (id_w, id_h), (0, 0, 0, 0))
    id_draw = ImageDraw.Draw(id_box)
    id_draw.rounded_rectangle([0, 0, id_w, id_h], radius=24, fill=(10, 20, 38, 230), outline=(245, 158, 11, 255), width=2)
    id_draw.text((id_w // 2, id_h // 2), "GPL ID : GPL1109533", fill=(253, 224, 71, 255), font=font_mono, anchor="mm")
    img.paste(id_box, (W // 2 - id_w // 2, 920), id_box)

    # 11. 3 Clean Minimalist Badges (Ward, Role, Zone)
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
    b_y = 998

    for i, (label, val) in enumerate(badges):
        bx = start_bx + i * (b_w + b_gap)
        bbox = Image.new("RGBA", (b_w, b_h), (0, 0, 0, 0))
        bdraw = ImageDraw.Draw(bbox)
        bdraw.rounded_rectangle([0, 0, b_w, b_h], radius=16, fill=(14, 24, 46, 225), outline=(245, 158, 11, 100), width=1)
        bdraw.text((b_w // 2, 28), label, fill=(148, 163, 184, 255), font=font_bold_sm, anchor="mm")
        bdraw.text((b_w // 2, 58), val, fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")
        img.paste(bbox, (bx, b_y), bbox)

    # 12. Clean Kit Strip
    kit_w, kit_h = 580, 46
    kit_box = Image.new("RGBA", (kit_w, kit_h), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(kit_box)
    kdraw.rounded_rectangle([0, 0, kit_w, kit_h], radius=23, fill=(12, 22, 42, 210), outline=(245, 158, 11, 80), width=1)
    kdraw.text((kit_w // 2, kit_h // 2), "OFFICIAL KIT: T-SHIRT L  •  TRACK L  |  VERIFIED", fill=(245, 158, 11, 240), font=font_bold_sm, anchor="mm")
    img.paste(kit_box, (W // 2 - kit_w // 2, 1114), kit_box)

    # 13. Minimalist Baseline
    draw.text((W // 2, 1210), "RADHE RADHE FOUNDATION (REG. NO. E-0040526 GBR)  •  GOREGAON PREMIER LEAGUE", fill=(203, 213, 225, 210), font=font_bold_sm, anchor="mm")

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", quality=95)
    print(f"Generated card at {output_path}")

if __name__ == "__main__":
    sample = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-1.jpg"
    out1 = "/Users/alok/Desktop/goregaon-premier-league/template-player-card.png"
    out2 = "/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png"
    generate_gpl_card(out1, sample)
    generate_gpl_card(out2, sample)
