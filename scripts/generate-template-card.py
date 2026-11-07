#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_clean_professional_card(output_path, sample_photo_path=None):
    W, H = 1080, 1350
    # Clean luxury deep midnight background
    img = Image.new("RGBA", (W, H), (8, 14, 28, 255))
    draw = ImageDraw.Draw(img)

    # 1. Subtle smooth gradient background
    for y in range(H):
        t = y / H
        r = int(6 + t * 6)
        g = int(12 + t * 8)
        b = int(24 + (1 - t) * 16)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # 2. Atmospheric ambient glows (soft, clean, professional)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    
    # Top-right warm gold ambient light
    gdraw.ellipse([W - 350, -100, W + 300, 500], fill=(245, 158, 11, 28))
    # Top-left cool cyan floodlight reflection
    gdraw.ellipse([-200, -100, 350, 450], fill=(14, 165, 233, 22))
    # Center player highlight aura
    gdraw.ellipse([W//2 - 320, 260, W//2 + 320, 880], fill=(245, 158, 11, 35))
    
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # 3. Outer card border (crisp double line in matte gold)
    card_margin = 28
    draw.rounded_rectangle(
        [card_margin, card_margin, W - card_margin, H - card_margin],
        radius=28,
        outline=(245, 158, 11, 140),
        width=2
    )
    draw.rounded_rectangle(
        [card_margin + 6, card_margin + 6, W - card_margin - 6, H - card_margin - 6],
        radius=24,
        outline=(245, 158, 11, 40),
        width=1
    )

    # Fonts
    font_dir = "/System/Library/Fonts/Supplemental"
    font_impact_hero = ImageFont.truetype(f"{font_dir}/Impact.ttf", 94)
    font_impact_sub = ImageFont.truetype(f"{font_dir}/Impact.ttf", 34)
    font_name = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 48)
    font_bold_lg = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 26)
    font_bold_md = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 20)
    font_bold_sm = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 16)
    font_mono = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 24)

    # 4. Top Header: Clean, balanced tournament branding
    logo_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-logo.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((120, 120), Image.Resampling.LANCZOS)
            img.paste(logo, (W // 2 - logo.width // 2, 50), logo)
        except Exception as e:
            print("Logo load error:", e)

    draw.text((W // 2, 185), "GOREGAON PREMIER LEAGUE", fill=(255, 255, 255, 240), font=font_bold_md, anchor="mm")
    draw.text((W // 2, 214), "RADHE RADHE CHASHAK • WARD 51-54", fill=(245, 158, 11, 230), font=font_bold_sm, anchor="mm")

    # 5. Badges: SEASON 4 & AUCTION POOL (Clean stacked design)
    # Red "SEASON 4" stamp
    s4_w, s4_h = 220, 44
    s4_box = Image.new("RGBA", (s4_w, s4_h), (0, 0, 0, 0))
    s4_draw = ImageDraw.Draw(s4_box)
    s4_draw.rounded_rectangle([0, 0, s4_w, s4_h], radius=10, fill=(220, 38, 38, 255), outline=(248, 113, 113, 230), width=1)
    s4_draw.text((s4_w // 2, s4_h // 2), "★ SEASON 4 ★", fill=(255, 255, 255, 255), font=font_impact_sub, anchor="mm")
    img.paste(s4_box, (W // 2 - s4_w // 2, 248), s4_box)

    # Big "AUCTION POOL" Title
    ap_y = 345
    draw.text((W // 2 + 2, ap_y + 3), "AUCTION POOL", fill=(0, 0, 0, 180), font=font_impact_hero, anchor="mm")
    draw.text((W // 2, ap_y), "AUCTION POOL", fill=(253, 224, 71, 255), font=font_impact_hero, anchor="mm")

    # Clean "✔ QUALIFIED" Pill
    q_w, q_h = 320, 44
    q_box = Image.new("RGBA", (q_w, q_h), (0, 0, 0, 0))
    q_draw = ImageDraw.Draw(q_box)
    q_draw.rounded_rectangle([0, 0, q_w, q_h], radius=22, fill=(185, 28, 28, 240), outline=(252, 165, 165, 180), width=1)
    q_draw.text((q_w // 2, q_h // 2), "✔  QUALIFIED", fill=(255, 255, 255, 255), font=font_impact_sub, anchor="mm")
    img.paste(q_box, (W // 2 - q_w // 2, 400), q_box)

    # 6. Hero Player Portrait
    p_size = 380
    p_x = W // 2 - p_size // 2
    p_y = 475
    p_rad = 36

    # Soft gold glow behind portrait
    glow_p = Image.new("RGBA", (p_size + 60, p_size + 60), (0, 0, 0, 0))
    gp_draw = ImageDraw.Draw(glow_p)
    gp_draw.rounded_rectangle([15, 15, p_size + 45, p_size + 45], radius=44, fill=(245, 158, 11, 75))
    glow_p = glow_p.filter(ImageFilter.GaussianBlur(24))
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

    # Double gold border around photo
    draw.rounded_rectangle([p_x - 4, p_y - 4, p_x + p_size + 4, p_y + p_size + 4], radius=p_rad + 4, outline=(245, 158, 11, 255), width=4)
    draw.rounded_rectangle([p_x - 10, p_y - 10, p_x + p_size + 10, p_y + p_size + 10], radius=p_rad + 10, outline=(251, 191, 36, 90), width=1)

    # 7. Player Full Name
    name_str = "R. THAVITH KUMAR"
    draw.text((W // 2 + 2, 902), name_str, fill=(0, 0, 0, 200), font=font_name, anchor="mm")
    draw.text((W // 2, 900), name_str, fill=(255, 255, 255, 255), font=font_name, anchor="mm")

    # 8. Clean ID Pill: GPL ID : GPL1109533
    id_w, id_h = 380, 50
    id_box = Image.new("RGBA", (id_w, id_h), (0, 0, 0, 0))
    id_draw = ImageDraw.Draw(id_box)
    id_draw.rounded_rectangle([0, 0, id_w, id_h], radius=25, fill=(10, 20, 38, 220), outline=(245, 158, 11, 255), width=2)
    id_draw.text((id_w // 2, id_h // 2), "GPL ID : GPL1109533", fill=(253, 224, 71, 255), font=font_mono, anchor="mm")
    img.paste(id_box, (W // 2 - id_w // 2, 940), id_box)

    # 9. 3 Clean Minimalist Badges (Ward, Role, Zone)
    badges = [
        ("📍 WARD", "WARD 51"),
        ("🏏 ROLE", "ALL-ROUNDER"),
        ("🛡️ ZONE", "GOREGAON PURV")
    ]
    b_w = 280
    b_h = 88
    b_gap = 24
    total_bw = 3 * b_w + 2 * b_gap
    start_bx = (W - total_bw) // 2
    b_y = 1025

    for i, (label, val) in enumerate(badges):
        bx = start_bx + i * (b_w + b_gap)
        bbox = Image.new("RGBA", (b_w, b_h), (0, 0, 0, 0))
        bdraw = ImageDraw.Draw(bbox)
        bdraw.rounded_rectangle([0, 0, b_w, b_h], radius=16, fill=(14, 24, 46, 210), outline=(245, 158, 11, 100), width=1)
        bdraw.text((b_w // 2, 28), label, fill=(148, 163, 184, 255), font=font_bold_sm, anchor="mm")
        bdraw.text((b_w // 2, 60), val, fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")
        img.paste(bbox, (bx, b_y), bbox)

    # 10. Clean Kit & Status Pill (NO heavy footer block)
    kit_w, kit_h = 580, 48
    kit_box = Image.new("RGBA", (kit_w, kit_h), (0, 0, 0, 0))
    kdraw = ImageDraw.Draw(kit_box)
    kdraw.rounded_rectangle([0, 0, kit_w, kit_h], radius=24, fill=(12, 22, 42, 190), outline=(245, 158, 11, 80), width=1)
    kdraw.text((kit_w // 2, kit_h // 2), "OFFICIAL KIT: T-SHIRT L  •  TRACK L  |  VERIFIED", fill=(245, 158, 11, 240), font=font_bold_sm, anchor="mm")
    img.paste(kit_box, (W // 2 - kit_w // 2, 1145), kit_box)

    # 11. Subtle minimalist bottom credit (NO heavy box / footer block)
    draw.text((W // 2, 1240), "GOREGAON PREMIER LEAGUE • SEASON 4", fill=(148, 163, 184, 200), font=font_bold_sm, anchor="mm")

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", quality=95)
    print(f"Generated clean card at {output_path}")

if __name__ == "__main__":
    sample = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-2.jpg"
    out1 = "/Users/alok/Desktop/goregaon-premier-league/template-player-card.png"
    out2 = "/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png"
    create_clean_professional_card(out1, sample)
    create_clean_professional_card(out2, sample)
