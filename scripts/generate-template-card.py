#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_viral_instagram_card(output_path, sample_photo_path=None, player_name="SANDEEP JADHAV", player_id="1095", ward="WARD 51", role="ALL-ROUNDER"):
    W, H = 1080, 1350

    # 1. PURE STADIUM BACKGROUND
    stadium_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/stadium-pure-bg.jpg"
    stadium = Image.open(stadium_path).convert("RGBA")
    stadium_scaled = stadium.resize((W, H), Image.Resampling.LANCZOS)

    # 2. Subtle luxury dark gradient overlay (top & middle-bottom)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    # Top fade for header contrast
    for y in range(460):
        t = y / 460
        alpha = int(220 - t * 160)
        ov_draw.line([(0, y), (W, y)], fill=(8, 3, 18, max(0, alpha)))

    # Bottom fade for player info & badges
    for y in range(780, H):
        t = (y - 780) / (H - 780)
        alpha = int(70 + t * 175)
        ov_draw.line([(0, y), (W, y)], fill=(8, 3, 18, min(245, alpha)))

    img = Image.alpha_composite(stadium_scaled, overlay)

    # Ambient golden floodlight glow behind logo
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([W//2 - 260, 90, W//2 + 260, 420], fill=(245, 158, 11, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(45))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    # 3. Outer Double Gold Border (clean, championship style)
    m = 22
    draw.rounded_rectangle([m, m, W - m, H - m], radius=24, outline=(245, 158, 11, 220), width=3)
    draw.rounded_rectangle([m + 7, m + 7, W - m - 7, H - m - 7], radius=18, outline=(253, 224, 71, 80), width=1)

    # Fonts
    font_dir = "/System/Library/Fonts/Supplemental"
    font_impact_xl = ImageFont.truetype(f"{font_dir}/Impact.ttf", 94)
    font_impact_md = ImageFont.truetype(f"{font_dir}/Impact.ttf", 28)
    font_name_lg = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 44)
    font_bold_xl = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 40)
    font_bold_lg = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 20)
    font_bold_md = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 16)
    font_bold_sm = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 15)
    font_id = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 36)

    # Marathi / Hindi Fonts
    font_marathi_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 38)
    font_marathi_md = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 20)
    font_marathi_sm = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 17)

    # 4. TOP BAR: RADHE RADHE FOUNDATION | REG. NO. E-0040526 (GBR)
    bar_w, bar_h = 780, 42
    bar_x = W // 2 - bar_w // 2
    bar_y = 38
    bar_box = Image.new("RGBA", (bar_w, bar_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(bar_box)
    b_draw.rounded_rectangle([0, 0, bar_w, bar_h], radius=21, fill=(12, 6, 2, 235), outline=(245, 158, 11, 240), width=2)
    b_draw.text((bar_w // 2, bar_h // 2), "RADHE RADHE FOUNDATION   |   REG. NO. E-0040526 (GBR)", fill=(253, 224, 71, 255), font=font_bold_sm, anchor="mm")
    img.paste(bar_box, (bar_x, bar_y), bar_box)

    # 5. NEW GPL LOGO (clean, 100% transparent background)
    logo_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-logo-new.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo_size = 200
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            img.paste(logo, (W // 2 - logo_size // 2, 88), logo)
        except Exception as e:
            print("Logo error:", e)

    # 6. GOREGAON PREMIER LEAGUE
    draw.text((W // 2 + 2, 306), "GOREGAON PREMIER LEAGUE", fill=(0, 0, 0, 220), font=font_bold_xl, anchor="mm")
    draw.text((W // 2, 304), "GOREGAON PREMIER LEAGUE", fill=(255, 255, 255, 255), font=font_bold_xl, anchor="mm")

    # Divider lines + Subtitle
    line_y = 336
    draw.line([(100, line_y), (W // 2 - 195, line_y)], fill=(245, 158, 11, 220), width=2)
    draw.line([(W // 2 + 195, line_y), (W - 100, line_y)], fill=(245, 158, 11, 220), width=2)
    draw.text((W // 2, 336), "GOREGAON PURV VIDHAN SABHA", fill=(245, 158, 11, 255), font=font_bold_lg, anchor="mm")

    # 7. Red "SEASON 4" Stamp (separate, clean breathing room)
    s4_w, s4_h = 210, 38
    s4_y = 366
    s4_box = Image.new("RGBA", (s4_w, s4_h), (0, 0, 0, 0))
    s4_draw = ImageDraw.Draw(s4_box)
    s4_draw.rounded_rectangle([0, 0, s4_w, s4_h], radius=10, fill=(185, 28, 28, 255), outline=(248, 113, 113, 220), width=1)
    s4_draw.text((s4_w // 2, s4_h // 2), "SEASON 4", fill=(255, 255, 255, 255), font=font_bold_md, anchor="mm")
    img.paste(s4_box, (W // 2 - s4_w // 2, s4_y), s4_box)

    # 8. GIANT GOLD "PLAYER" TITLE (positioned below Season 4 with no overlap)
    p_title_y = 472
    draw.text((W // 2 + 3, p_title_y + 3), "PLAYER", fill=(0, 0, 0, 230), font=font_impact_xl, anchor="mm")
    draw.text((W // 2, p_title_y), "PLAYER", fill=(253, 224, 71, 255), font=font_impact_xl, anchor="mm")

    # "REGISTRATION CARD"
    draw.text((W // 2, 518), "R E G I S T R A T I O N   C A R D", fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")

    # 9. SANDEEP JADHAV CUTOUT (FOREGROUND, RIGHT SIDE)
    sandeep_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/sandeep-jadhav-transparent.png"
    if os.path.exists(sandeep_path):
        try:
            san = Image.open(sandeep_path).convert("RGBA")
            target_h = 800
            target_w = int(san.width * (target_h / san.height))
            san_scaled = san.resize((target_w, target_h), Image.Resampling.LANCZOS)
            
            # Position at x=500 down to bottom
            san_x = W - target_w + 35
            san_y = 510
            
            # Soft shadow under Sandeep for 3D depth
            san_shadow = Image.new("RGBA", (target_w + 30, target_h + 30), (0, 0, 0, 0))
            san_mask = san_scaled.split()[3]
            san_shadow.paste((0, 0, 0, 170), (15, 15), san_mask)
            san_shadow = san_shadow.filter(ImageFilter.GaussianBlur(18))
            img.paste(san_shadow, (san_x - 15, san_y - 15), san_shadow)
            
            # Paste transparent cutout
            img.paste(san_scaled, (san_x, san_y), san_scaled)
        except Exception as e:
            print("Sandeep cutout error:", e)

    draw = ImageDraw.Draw(img)

    # 10. LEFT SECTION: PLAYER PHOTO BOX
    photo_x = 75
    photo_y = 560
    photo_w = 260
    photo_h = 280
    photo_r = 20

    # Gold glow border around photo box
    glow_box = Image.new("RGBA", (photo_w + 24, photo_h + 24), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow_box)
    g_draw.rounded_rectangle([6, 6, photo_w + 18, photo_h + 18], radius=photo_r + 4, outline=(245, 158, 11, 255), width=4)
    glow_box = glow_box.filter(ImageFilter.GaussianBlur(10))
    img.paste(glow_box, (photo_x - 12, photo_y - 12), glow_box)

    # Photo box dark fill
    draw.rounded_rectangle([photo_x, photo_y, photo_x + photo_w, photo_y + photo_h], radius=photo_r, fill=(10, 14, 28, 240), outline=(245, 158, 11, 240), width=3)

    # Player photo or silhouette
    if sample_photo_path and os.path.exists(sample_photo_path):
        try:
            pimg = Image.open(sample_photo_path).convert("RGBA")
            sq = min(pimg.width, pimg.height)
            crop_box = ((pimg.width - sq) // 2, (pimg.height - sq) // 2, (pimg.width + sq) // 2, (pimg.height + sq) // 2)
            pimg_sq = pimg.crop(crop_box).resize((photo_w - 6, photo_h - 6), Image.Resampling.LANCZOS)
            
            mask = Image.new("L", (photo_w - 6, photo_h - 6), 0)
            mdraw = ImageDraw.Draw(mask)
            mdraw.rounded_rectangle([0, 0, photo_w - 6, photo_h - 6], radius=photo_r - 2, fill=255)
            img.paste(pimg_sq, (photo_x + 3, photo_y + 3), mask)
        except Exception as e:
            print("Player photo error:", e)
    else:
        cx = photo_x + photo_w // 2
        cy = photo_y + photo_h // 2
        draw.ellipse([cx - 42, cy - 75, cx + 42, cy + 9], fill=(100, 116, 139, 160))
        draw.polygon([(cx - 68, cy + 115), (cx + 68, cy + 115), (cx + 54, cy + 22), (cx - 54, cy + 22)], fill=(100, 116, 139, 160))

    # 11. PLAYER NAME & PLAYER ID (Right of photo box)
    info_x = photo_x + photo_w + 30
    
    # Player Name (crisp, bold, wrapped properly)
    name_parts = player_name.split()
    if len(name_parts) >= 2:
        draw.text((info_x + 2, photo_y + 24), name_parts[0], fill=(0, 0, 0, 240), font=font_name_lg)
        draw.text((info_x, photo_y + 22), name_parts[0], fill=(255, 255, 255, 255), font=font_name_lg)
        
        draw.text((info_x + 2, photo_y + 80), " ".join(name_parts[1:]), fill=(0, 0, 0, 240), font=font_name_lg)
        draw.text((info_x, photo_y + 78), " ".join(name_parts[1:]), fill=(255, 255, 255, 255), font=font_name_lg)
    else:
        draw.text((info_x + 2, photo_y + 40), player_name, fill=(0, 0, 0, 240), font=font_name_lg)
        draw.text((info_x, photo_y + 38), player_name, fill=(255, 255, 255, 255), font=font_name_lg)

    # "PLAYER ID" label
    id_label_y = photo_y + 155
    draw.text((info_x, id_label_y), "PLAYER ID", fill=(203, 213, 225, 230), font=font_bold_md)

    # Gold Oval for Player ID
    oval_w = max(160, len(str(player_id)) * 28 + 60)
    oval_h = 54
    oval_y = id_label_y + 24
    draw.rounded_rectangle([info_x, oval_y, info_x + oval_w, oval_y + oval_h], radius=27, fill=(10, 14, 28, 240), outline=(245, 158, 11, 255), width=3)
    draw.text((info_x + oval_w // 2, oval_y + oval_h // 2), str(player_id), fill=(253, 224, 71, 255), font=font_id, anchor="mm")

    # 12. BOTTOM BADGES: WARD & ROLE ONLY (NO ZONE)
    badge_data = [
        {"tag": "WARD", "val": ward.upper()},
        {"tag": "ROLE", "val": role.upper()},
    ]

    bw, bh = 430, 72
    bgap = 18
    bstart_y = 880

    for i, b in enumerate(badge_data):
        by = bstart_y + i * (bh + bgap)
        # Background box
        draw.rounded_rectangle([photo_x, by, photo_x + bw, by + bh], radius=16, fill=(10, 14, 28, 235), outline=(245, 158, 11, 200), width=2)
        
        # Left Tag Pill (Gold background, dark bold text)
        tag_w = 95
        tag_h = 42
        tag_x = photo_x + 16
        tag_y = by + (bh - tag_h) // 2
        draw.rounded_rectangle([tag_x, tag_y, tag_x + tag_w, tag_y + tag_h], radius=10, fill=(245, 158, 11, 255))
        draw.text((tag_x + tag_w // 2, tag_y + tag_h // 2), b["tag"], fill=(10, 6, 2, 255), font=font_bold_md, anchor="mm")
        
        # Right Value (clean, bold white text)
        draw.text((photo_x + 130, by + bh // 2), b["val"], fill=(255, 255, 255, 255), font=font_impact_md, anchor="lm")

    # 13. HINDI ATTRIBUTION TEXT FOR SANDEEP (Clean, elegant, no ugly box)
    attr_cx = 780
    attr_y = 1200
    
    # "शुभेच्छुक" in gold
    draw.text((attr_cx, attr_y), "शुभेच्छुक", fill=(253, 224, 71, 255), font=font_marathi_md, anchor="mm")
    
    # "श्री. संदीप जाधव" in vibrant red with clean white outline for high contrast
    name_txt = "श्री. संदीप जाधव"
    ny = attr_y + 36
    for dx, dy in [(-2, -2), (-2, 2), (2, -2), (2, 2), (0, -2), (0, 2), (-2, 0), (2, 0)]:
        draw.text((attr_cx + dx, ny + dy), name_txt, fill=(255, 255, 255, 255), font=font_marathi_bold, anchor="mm")
    draw.text((attr_cx, ny), name_txt, fill=(220, 38, 38, 255), font=font_marathi_bold, anchor="mm")
    
    # "संस्थापक-राधे राधे फाऊंडेशन" in white
    draw.text((attr_cx, attr_y + 76), "संस्थापक-राधे राधे फाऊंडेशन", fill=(255, 255, 255, 255), font=font_marathi_sm, anchor="mm")

    # 14. NO FOOTER STRIP! (Footer completely removed as requested!)

    img.save(output_path, "PNG")
    print(f"Generated clean card at {output_path}")

if __name__ == "__main__":
    generate_viral_instagram_card("/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png")
