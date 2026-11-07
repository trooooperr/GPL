#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_template_card(output_path, sample_photo_path=None):
    W, H = 1080, 1350
    img = Image.new("RGBA", (W, H), (7, 17, 38, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background gradient (deep luxury sports navy & black vignette)
    for y in range(H):
        ratio = y / H
        r = int(5 + ratio * 8)
        g = int(12 + (1 - ratio) * 14)
        b = int(28 + (1 - ratio) * 25)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

    # Add stadium floodlight glow at top corners & gold aura
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    
    # Top-center gold radiance
    glow_draw.ellipse([W//2 - 350, -100, W//2 + 350, 450], fill=(245, 158, 11, 28))
    # Top-right blue floodlight flare
    glow_draw.ellipse([W - 300, -150, W + 200, 350], fill=(59, 130, 246, 32))
    # Top-left blue floodlight flare
    glow_draw.ellipse([-200, -150, 300, 350], fill=(59, 130, 246, 32))
    
    # Center player backlight
    glow_draw.ellipse([W//2 - 280, 320, W//2 + 280, 880], fill=(245, 158, 11, 35))

    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # Diagonal sports accent lines
    for i in range(12):
        x_start = -200 + i * 130
        draw.line([(x_start, 0), (x_start + 500, H)], fill=(245, 158, 11, 10), width=2)

    # Gold decorative top border
    for y in range(8):
        draw.line([(0, y), (W, y)], fill=(245, 158, 11, 255))
    for y in range(H-8, H):
        draw.line([(0, y), (W, y)], fill=(245, 158, 11, 255))

    # Fonts
    font_dir = "/System/Library/Fonts/Supplemental"
    font_impact_lg = ImageFont.truetype(f"{font_dir}/Impact.ttf", 82)
    font_impact_md = ImageFont.truetype(f"{font_dir}/Impact.ttf", 46)
    font_impact_sm = ImageFont.truetype(f"{font_dir}/Impact.ttf", 32)
    font_bold_italic = ImageFont.truetype(f"{font_dir}/Arial Bold Italic.ttf", 52)
    font_bold_md = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 24)
    font_bold_sm = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 18)
    font_mono = ImageFont.truetype(f"{font_dir}/Arial Bold.ttf", 26)

    # 2. GPL Logo
    logo_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-logo.png"
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((140, 140), Image.Resampling.LANCZOS)
            img.paste(logo, (W // 2 - logo.width // 2, 35), logo)
        except Exception as e:
            print("Logo load error:", e)

    # League subtitle under logo
    draw.text((W // 2, 175), "RADHE RADHE CHASHAK", fill=(245, 158, 11, 230), font=font_bold_sm, anchor="mm")

    # 3. Slanted Red Stamp: "SEASON 4"
    s4_w, s4_h = 240, 48
    s4_box = Image.new("RGBA", (s4_w, s4_h), (0, 0, 0, 0))
    s4_draw = ImageDraw.Draw(s4_box)
    s4_draw.rounded_rectangle([0, 0, s4_w, s4_h], radius=8, fill=(220, 38, 38, 255), outline=(248, 113, 113, 255), width=2)
    s4_draw.text((s4_w // 2, s4_h // 2), "★ SEASON 4 ★", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    s4_rotated = s4_box.rotate(4, resample=Image.Resampling.BICUBIC, expand=True)
    img.paste(s4_rotated, (W // 2 - s4_rotated.width // 2, 205), s4_rotated)

    # 4. Giant 3D Metallic Golden Text: "AUCTION POOL"
    ap_text = "AUCTION POOL"
    # Extrusion / 3D shadow layers
    shadow_offsets = [6, 5, 4, 3, 2, 1]
    for off in shadow_offsets:
        draw.text((W // 2 + off, 305 + off), ap_text, fill=(80, 40, 0, 200), font=font_impact_lg, anchor="mm")
    # Front gradient metallic text
    draw.text((W // 2, 305), ap_text, fill=(253, 224, 71, 255), font=font_impact_lg, anchor="mm")

    # 5. Red Banner with checkmark: "✓ QUALIFIED & REGISTERED"
    rb_w, rb_h = 420, 50
    rb_box = Image.new("RGBA", (rb_w, rb_h), (0, 0, 0, 0))
    rb_draw = ImageDraw.Draw(rb_box)
    rb_draw.rounded_rectangle([0, 0, rb_w, rb_h], radius=10, fill=(185, 28, 28, 255), outline=(252, 165, 165, 200), width=2)
    rb_draw.text((rb_w // 2, rb_h // 2), "✔  QUALIFIED & REGISTERED", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    img.paste(rb_box, (W // 2 - rb_w // 2, 360), rb_box)

    # 6. Player Photo Frame (Prominent Center/Hero with Gold Glowing Shield)
    photo_size = 320
    photo_x = W // 2 - photo_size // 2
    photo_y = 440

    # Glow behind photo
    photo_glow = Image.new("RGBA", (photo_size + 80, photo_size + 80), (0, 0, 0, 0))
    pg_draw = ImageDraw.Draw(photo_glow)
    pg_draw.ellipse([10, 10, photo_size + 70, photo_size + 70], fill=(245, 158, 11, 100))
    photo_glow = photo_glow.filter(ImageFilter.GaussianBlur(25))
    img.paste(photo_glow, (photo_x - 40, photo_y - 40), photo_glow)

    # Photo masking (round rectangle with gold border)
    mask = Image.new("L", (photo_size, photo_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, photo_size, photo_size], radius=32, fill=255)

    photo_placed = False
    if sample_photo_path and os.path.exists(sample_photo_path):
        try:
            player_img = Image.open(sample_photo_path).convert("RGBA")
            # crop to square
            min_dim = min(player_img.width, player_img.height)
            left = (player_img.width - min_dim) // 2
            top = (player_img.height - min_dim) // 2
            player_img = player_img.crop((left, top, left + min_dim, top + min_dim))
            player_img = player_img.resize((photo_size, photo_size), Image.Resampling.LANCZOS)
            img.paste(player_img, (photo_x, photo_y), mask)
            photo_placed = True
        except Exception as e:
            print("Error loading sample player photo:", e)

    if not photo_placed:
        # Sleek placeholder avatar
        avatar_bg = Image.new("RGBA", (photo_size, photo_size), (15, 30, 60, 255))
        ab_draw = ImageDraw.Draw(avatar_bg)
        # Head
        ab_draw.ellipse([photo_size//2 - 55, 60, photo_size//2 + 55, 170], fill=(245, 158, 11, 230))
        # Body
        ab_draw.ellipse([photo_size//2 - 120, 190, photo_size//2 + 120, 380], fill=(245, 158, 11, 190))
        img.paste(avatar_bg, (photo_x, photo_y), mask)

    # Gold metallic border around photo
    draw.rounded_rectangle([photo_x - 5, photo_y - 5, photo_x + photo_size + 5, photo_y + photo_size + 5], radius=36, outline=(245, 158, 11, 255), width=6)
    draw.rounded_rectangle([photo_x - 12, photo_y - 12, photo_x + photo_size + 12, photo_y + photo_size + 12], radius=40, outline=(251, 191, 36, 120), width=2)

    # 7. Big Athletic Player Name (Slanted White Bold with Shadow)
    player_name = "PLAYER FULL NAME"
    # Shadow
    draw.text((W // 2 + 3, 810 + 3), player_name, fill=(0, 0, 0, 220), font=font_bold_italic, anchor="mm")
    draw.text((W // 2, 810), player_name, fill=(255, 255, 255, 255), font=font_bold_italic, anchor="mm")

    # 8. Golden ID Chip: GPL ID : GPL2026-0042
    id_w, id_h = 440, 52
    id_box = Image.new("RGBA", (id_w, id_h), (0, 0, 0, 0))
    id_draw = ImageDraw.Draw(id_box)
    id_draw.rounded_rectangle([0, 0, id_w, id_h], radius=26, fill=(10, 22, 45, 230), outline=(245, 158, 11, 255), width=2)
    id_draw.text((id_w // 2, id_h // 2), "GPL ID : GPL2026-0001", fill=(253, 224, 71, 255), font=font_mono, anchor="mm")
    img.paste(id_box, (W // 2 - id_w // 2, 860), id_box)

    # 9. 3 Stat Badges (Ward, Role, Zone)
    badges = [
        ("📍 WARD", "WARD 51"),
        ("🏏 ROLE", "ALL-ROUNDER"),
        ("🛡️ ZONE", "GOREGAON PURV")
    ]
    badge_w = 300
    badge_h = 95
    spacing = 25
    total_w = 3 * badge_w + 2 * spacing
    start_x = (W - total_w) // 2
    b_y = 945

    for idx, (label, val) in enumerate(badges):
        bx = start_x + idx * (badge_w + spacing)
        # Box background
        b_box = Image.new("RGBA", (badge_w, badge_h), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(b_box)
        b_draw.rounded_rectangle([0, 0, badge_w, badge_h], radius=16, fill=(15, 30, 60, 210), outline=(245, 158, 11, 90), width=1)
        # Gold accent top line in badge
        b_draw.line([(15, 2), (badge_w - 15, 2)], fill=(245, 158, 11, 220), width=2)
        b_draw.text((badge_w // 2, 30), label, fill=(180, 195, 220, 255), font=font_bold_sm, anchor="mm")
        b_draw.text((badge_w // 2, 65), val, fill=(255, 255, 255, 255), font=font_bold_md, anchor="mm")
        img.paste(b_box, (bx, b_y), b_box)

    # 10. Kit Size Strip
    kit_text = "OFFICIAL KIT: T-SHIRT L  •  TRACK L  |  STATUS: VERIFIED ENTRY"
    draw.text((W // 2, 1075), kit_text, fill=(245, 158, 11, 220), font=font_bold_sm, anchor="mm")

    # 11. Bottom Organizer Banner (Dark bar)
    bot_y = 1120
    bot_h = 160
    draw.rectangle([0, bot_y, W, bot_y + bot_h], fill=(4, 10, 22, 240))
    draw.line([(0, bot_y), (W, bot_y)], fill=(245, 158, 11, 160), width=2)

    draw.text((W // 2, bot_y + 35), "GOREGAON PREMIER LEAGUE • SEASON 4", fill=(255, 255, 255, 255), font=font_impact_sm, anchor="mm")
    draw.text((W // 2, bot_y + 75), "Organised by: Mohsin Patel & Balram Gupta (Ballu)", fill=(251, 191, 36, 255), font=font_bold_md, anchor="mm")
    draw.text((W // 2, bot_y + 115), "Ward 51 & Ward 54  •  Goregaon Purv Vidhan Sabha  •  goregaonpl.vercel.app", fill=(156, 163, 175, 255), font=font_bold_sm, anchor="mm")

    # Save PNG
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", quality=95)
    print(f"Card saved successfully to: {output_path}")

if __name__ == "__main__":
    sample = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-2.jpg"
    out1 = "/Users/alok/Desktop/goregaon-premier-league/template-player-card.png"
    out2 = "/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png"
    create_template_card(out1, sample)
    create_template_card(out2, sample)
