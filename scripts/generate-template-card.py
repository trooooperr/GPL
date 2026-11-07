#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_viral_instagram_card(output_path, sample_photo_path=None, player_name="SANDEEP JADHAV", player_id="1095", ward="WARD 51", role="ALL-ROUNDER"):
    W, H = 1080, 1350

    # 1. PURE STADIUM BACKGROUND (from user upload)
    stadium_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/stadium-pure-bg.jpg"
    stadium = Image.open(stadium_path).convert("RGBA")
    stadium_scaled = stadium.resize((W, H), Image.Resampling.LANCZOS)

    # 2. Subtle luxury dark gradient overlay
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)

    # Top fade for header readability
    for y in range(480):
        t = y / 480
        alpha = int(220 - t * 150)
        ov_draw.line([(0, y), (W, y)], fill=(6, 2, 14, max(0, alpha)))

    # Bottom fade for stats
    for y in range(750, H):
        t = (y - 750) / (H - 750)
        alpha = int(80 + t * 165)
        ov_draw.line([(0, y), (W, y)], fill=(6, 2, 14, min(245, alpha)))

    img = Image.alpha_composite(stadium_scaled, overlay)

    # Ambient golden floodlight glow behind logo
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([W//2 - 280, 100, W//2 + 280, 480], fill=(245, 158, 11, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    # 3. Outer Double Gold Border
    m = 20
    draw.rounded_rectangle([m, m, W - m, H - m], radius=22, outline=(245, 158, 11, 210), width=3)
    draw.rounded_rectangle([m + 7, m + 7, W - m - 7, H - m - 7], radius=16, outline=(253, 224, 71, 75), width=1)

    # Fonts
    font_dir = "/System/Library/Fonts/Supplemental"
    font_impact_xl = ImageFont.truetype(f"{font_dir}/Impact.ttf", 96)
    font_impact_sm = ImageFont.truetype(f"{font_dir}/Impact.ttf", 24)
    font_impact_md = ImageFont.truetype(f"{font_dir}/Impact.ttf", 26)
    font_name_lg = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 46)
    font_bold_xl = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 42)
    font_bold_lg = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 20)
    font_bold_md = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 16)
    font_bold_sm = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 15)
    font_id = ImageFont.truetype(f"{font_dir}/Arial Black.ttf", 34)

    # Fonts for Marathi / Hindi
    font_marathi_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 36)
    font_marathi_md = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 18)
    font_marathi_sm = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", 16)

    # 4. TOP BAR: RADHE RADHE FOUNDATION | REG. NO. E-0040526 (GBR)
    bar_w, bar_h = 780, 40
    bar_x = W // 2 - bar_w // 2
    bar_y = 38
    bar_box = Image.new("RGBA", (bar_w, bar_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(bar_box)
    b_draw.rounded_rectangle([0, 0, bar_w, bar_h], radius=20, fill=(10, 6, 2, 235), outline=(245, 158, 11, 240), width=2)
    b_draw.text((bar_w // 2, bar_h // 2), "RADHE RADHE FOUNDATION   |   REG. NO. E-0040526 (GBR)", fill=(253, 224, 71, 255), font=font_bold_sm, anchor="mm")
    img.paste(bar_box, (bar_x, bar_y), bar_box)

    # 5. NEW GPL LOGO (clean, fully transparent background)
    logo_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-logo-new.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo_size = 210
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            img.paste(logo, (W // 2 - logo_size // 2, 86), logo)
        except Exception as e:
            print("Logo error:", e)

    # 6. GOREGAON PREMIER LEAGUE
    draw.text((W // 2 + 2, 312), "GOREGAON PREMIER LEAGUE", fill=(0, 0, 0, 220), font=font_bold_xl, anchor="mm")
    draw.text((W // 2, 310), "GOREGAON PREMIER LEAGUE", fill=(255, 255, 255, 255), font=font_bold_xl, anchor="mm")

    # Divider lines + Subtitle
    line_y = 342
    draw.line([(90, line_y), (W // 2 - 200, line_y)], fill=(245, 158, 11, 230), width=2)
    draw.line([(W // 2 + 200, line_y), (W - 90, line_y)], fill=(245, 158, 11, 230), width=2)
    draw.text((W // 2, 342), "GOREGAON PURV VIDHAN SABHA", fill=(245, 158, 11, 255), font=font_bold_lg, anchor="mm")

    # 7. Red "SEASON 4" Stamp
    s4_w, s4_h = 210, 40
    s4_box = Image.new("RGBA", (s4_w, s4_h), (0, 0, 0, 0))
    s4_draw = ImageDraw.Draw(s4_box)
    s4_draw.rounded_rectangle([0, 0, s4_w, s4_h], radius=10, fill=(185, 28, 28, 255), outline=(248, 113, 113, 220), width=1)
    s4_draw.text((s4_w // 2, s4_h // 2), "SEASON 4", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    img.paste(s4_box, (W // 2 - s4_w // 2, 372), s4_box)

    # 8. GIANT GOLD "PLAYER" TITLE
    p_title_y = 462
    draw.text((W // 2 + 3, p_title_y + 3), "PLAYER", fill=(0, 0, 0, 230), font=font_impact_xl, anchor="mm")
    draw.text((W // 2, p_title_y), "PLAYER", fill=(253, 224, 71, 255), font=font_impact_xl, anchor="mm")

    # "REGISTRATION CARD"
    draw.text((W // 2, 508), "R E G I S T R A T I O N   C A R D", fill=(255, 255, 255, 255), font=font_bold_lg, anchor="mm")

    # 9. SANDEEP JADHAV CUTOUT (FOREGROUND, RIGHT SIDE)
    # Positioned cleanly on the right half so it doesn't overlap left badges
    sandeep_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/sandeep-jadhav-transparent.png"
    if os.path.exists(sandeep_path):
        try:
            san = Image.open(sandeep_path).convert("RGBA")
            target_h = 780
            target_w = int(san.width * (target_h / san.height))
            san_scaled = san.resize((target_w, target_h), Image.Resampling.LANCZOS)
            
            # Position at x=520, y=530 down to 1310
            san_x = W - target_w + 30
            san_y = 515
            
            # Soft shadow under Sandeep for 3D depth
            san_shadow = Image.new("RGBA", (target_w + 20, target_h + 20), (0, 0, 0, 0))
            s_draw = ImageDraw.Draw(san_shadow)
            # Create alpha mask from cutout
            san_mask = san_scaled.split()[3]
            san_shadow.paste((0, 0, 0, 160), (10, 10), san_mask)
            san_shadow = san_shadow.filter(ImageFilter.GaussianBlur(16))
            img.paste(san_shadow, (san_x - 10, san_y - 10), san_shadow)
            
            # Paste transparent cutout
            img.paste(san_scaled, (san_x, san_y), san_scaled)
        except Exception as e:
            print("Sandeep cutout paste error:", e)

    draw = ImageDraw.Draw(img)

    # 10. LEFT SECTION: PLAYER PHOTO BOX
    photo_x = 70
    photo_y = 545
    photo_w = 260
    photo_h = 280
    photo_r = 20

    # Gold glow border around photo box
    glow_box = Image.new("RGBA", (photo_w + 24, photo_h + 24), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow_box)
    g_draw.rounded_rectangle([6, 6, photo_w + 18, photo_h + 18], radius=photo_r + 4, outline=(245, 158, 11, 255), width=4)
    glow_box = glow_box.filter(ImageFilter.GaussianBlur(10))
    img.paste(glow_box, (photo_x - 12, photo_y - 12), glow_box)

    # Photo box
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
        # Clean silhouette placeholder
        cx = photo_x + photo_w // 2
        cy = photo_y + photo_h // 2
        draw.ellipse([cx - 42, cy - 75, cx + 42, cy + 9], fill=(100, 116, 139, 160))
        draw.polygon([(cx - 68, cy + 115), (cx + 68, cy + 115), (cx + 54, cy + 22), (cx - 54, cy + 22)], fill=(100, 116, 139, 160))

    # 11. PLAYER NAME & PLAYER ID (Right of photo box)
    info_x = photo_x + photo_w + 30
    
    # Player Name
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
        {"icon": "📍", "label": "WARD", "val": ward.upper()},
        {"icon": "🏏", "label": "ROLE", "val": role.upper()},
    ]

    bw, bh = 430, 72
    bgap = 16
    bstart_y = 865

    for i, b in enumerate(badge_data):
        by = bstart_y + i * (bh + bgap)
        # Background box
        draw.rounded_rectangle([photo_x, by, photo_x + bw, by + bh], radius=14, fill=(10, 14, 28, 230), outline=(245, 158, 11, 190), width=2)
        
        # Icon circle
        icx = photo_x + 42
        icy = by + bh // 2
        draw.ellipse([icx - 22, icy - 22, icx + 22, icy + 22], fill=(245, 158, 11, 45), outline=(245, 158, 11, 140), width=1)
        draw.text((icx, icy), b["icon"], font=font_bold_lg, anchor="mm")
        
        # Label (gold small)
        draw.text((photo_x + 82, by + 20), b["label"], fill=(253, 224, 71, 240), font=font_bold_sm)
        # Value (white bold)
        draw.text((photo_x + 82, by + 48), b["val"], fill=(255, 255, 255, 255), font=font_impact_md)

    # 13. HINDI ATTRIBUTION TEXT FOR SANDEEP (Clean, with dark badge plate for high contrast)
    attr_box_w = 420
    attr_box_h = 100
    attr_x = 590
    attr_y = 1150
    
    attr_plate = Image.new("RGBA", (attr_box_w, attr_box_h), (0, 0, 0, 0))
    ap_draw = ImageDraw.Draw(attr_plate)
    ap_draw.rounded_rectangle([0, 0, attr_box_w, attr_box_h], radius=14, fill=(8, 4, 18, 210), outline=(245, 158, 11, 140), width=1)
    img.paste(attr_plate, (attr_x, attr_y), attr_plate)

    draw = ImageDraw.Draw(img)
    draw.text((attr_x + attr_box_w // 2, attr_y + 18), "शुभेच्छुक", fill=(253, 224, 71, 255), font=font_marathi_md, anchor="mm")
    
    # Red text with white outline for "श्री. संदीप जाधव"
    name_txt = "श्री. संदीप जाधव"
    nx, ny = attr_x + attr_box_w // 2, attr_y + 50
    for dx, dy in [(-1, -1), (-1, 1), (1, -1), (1, 1), (0, -1), (0, 1), (-1, 0), (1, 0)]:
        draw.text((nx + dx, ny + dy), name_txt, fill=(255, 255, 255, 255), font=font_marathi_bold, anchor="mm")
    draw.text((nx, ny), name_txt, fill=(220, 38, 38, 255), font=font_marathi_bold, anchor="mm")
    
    draw.text((attr_x + attr_box_w // 2, attr_y + 82), "संस्थापक-राधे राधे फाऊंडेशन", fill=(255, 255, 255, 255), font=font_marathi_sm, anchor="mm")

    # 14. BOTTOM GOLD DECORATIVE STRIP
    strip_h = 42
    strip_y = H - strip_h - 18
    draw.rounded_rectangle([m + 4, strip_y, W - m - 4, strip_y + strip_h], radius=10, fill=(245, 158, 11, 255))
    draw.text((W // 2, strip_y + strip_h // 2), "RADHE RADHE FOUNDATION   •   REG. NO. E-0040526 (GBR)   •   GOREGAON PREMIER LEAGUE", fill=(10, 6, 2, 255), font=font_bold_sm, anchor="mm")

    img.save(output_path, "PNG")
    print(f"Generated viral card at {output_path}")

if __name__ == "__main__":
    generate_viral_instagram_card("/Users/alok/Desktop/goregaon-premier-league/template-player-card.png")
    generate_viral_instagram_card("/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png")
