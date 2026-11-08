#!/usr/bin/env python3
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_official_player_card(
    output_path="/Users/alok/Desktop/goregaon-premier-league/public/images/template-player-card.png",
    photo_path=None,
    player_name="SANDEEP JADHAV",
    reg_id="1095",
    ward="WARD 51",
    role="ALL-ROUNDER"
):
    base_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-base.png"
    p_frame_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-player-frame.png"
    wr_frame_path = "/Users/alok/Desktop/goregaon-premier-league/public/images/gpl-card-ward-role-frame.png"

    base = Image.open(base_path).convert("RGBA")
    W, H = base.size
    canvas = base.copy()

    def render_metallic_text(text, font_path, size, max_w=700, shear=-0.22, stroke_px=5, align='center'):
        font = ImageFont.truetype(font_path, size)
        d_test = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
        bbox = d_test.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        while tw > max_w and size > 26:
            size -= 2
            font = ImageFont.truetype(font_path, size)
            bbox = d_test.textbbox((0, 0), text, font=font)
            tw = bbox[2] - bbox[0]

        w, h = max(tw + 160, 400), 160
        img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)

        if align == 'center':
            tx, ty = w // 2, h // 2
            anchor = 'mm'
        else:
            tx, ty = 40, h // 2
            anchor = 'lm'

        bbox = d.textbbox((tx, ty), text, font=font, anchor=anchor)
        th = bbox[3] - bbox[1]

        for dx in range(-stroke_px, stroke_px + 1):
            for dy in range(-stroke_px, stroke_px + 1):
                if dx*dx + dy*dy <= stroke_px*stroke_px:
                    d.text((tx + dx, ty + dy), text, font=font, fill=(0, 0, 0, 255), anchor=anchor)

        mask = Image.new('L', (w, h), 0)
        d_m = ImageDraw.Draw(mask)
        d_m.text((tx, ty), text, font=font, fill=255, anchor=anchor)

        grad = Image.new('RGBA', (w, h), (255, 255, 255, 255))
        g_arr = np.array(grad)
        for y in range(h):
            prog = np.clip((y - bbox[1]) / max(th, 1), 0, 1)
            c = int(255 - prog * 70)
            g_arr[y, :, 0] = c
            g_arr[y, :, 1] = c + int(prog * 5)
            g_arr[y, :, 2] = min(255, c + int(prog * 15))
        grad = Image.fromarray(g_arr)
        img.paste(grad, (0, 0), mask)

        sheared = img.transform((w, h), Image.AFFINE, (1, shear, -shear * (h / 2), 0, 1, 0), Image.Resampling.BICUBIC)

        arr = np.array(sheared)
        r = np.any(arr[:, :, 3] > 10, axis=1)
        c = np.any(arr[:, :, 3] > 10, axis=0)
        if np.any(r) and np.any(c):
            ymin, ymax = np.where(r)[0][[0, -1]]
            xmin, xmax = np.where(c)[0][[0, -1]]
            return sheared.crop((xmin, ymin, xmax + 1, ymax + 1))
        return sheared

    # 1. Player Info Block
    blk_x, blk_y, blk_w, blk_h = 70, 562, 505, 185
    scale_p = blk_w / 920.0

    # Photo box
    px = blk_x + int(31 * scale_p)
    py = blk_y + int(28 * scale_p)
    pw = int(270 * scale_p)
    ph = int(280 * scale_p)
    pr = int(26 * scale_p)

    p_draw = ImageDraw.Draw(canvas)
    p_draw.rounded_rectangle([px, py, px + pw, py + ph], radius=pr, fill=(10, 14, 28, 245))

    if photo_path and os.path.exists(photo_path):
        p_img = Image.open(photo_path).convert("RGBA")
        sq = min(p_img.size)
        sx = (p_img.width - sq) // 2
        sy = (p_img.height - sq) // 2
        p_cropped = p_img.crop((sx, sy, sx + sq, sy + sq)).resize((pw, ph), Image.Resampling.LANCZOS)
        # Rounded mask
        mask = Image.new("L", (pw, ph), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw, ph], radius=pr, fill=255)
        canvas.paste(p_cropped, (px, py), mask)
    else:
        # Silhouette
        cx = px + pw // 2
        cy = py + ph // 2
        p_draw.ellipse([cx - 23, cy - 35, cx + 23, cy + 11], fill=(120, 136, 160, 200))
        p_draw.polygon([(cx - 38, cy + 58), (cx + 38, cy + 58), (cx + 28, cy + 14), (cx - 28, cy + 14)], fill=(120, 136, 160, 200))

    # Player Frame
    p_frame = Image.open(p_frame_path).convert("RGBA").resize((blk_w, blk_h), Image.Resampling.LANCZOS)
    canvas.paste(p_frame, (blk_x, blk_y), p_frame)

    # Player Name
    name_img = render_metallic_text(player_name.upper(), "/System/Library/Fonts/Supplemental/Arial Black.ttf", 52, max_w=580, shear=-0.22, stroke_px=5, align='center')
    name_cx = blk_x + int(649 * scale_p)
    name_cy = blk_y + int(76 * scale_p)
    canvas.paste(name_img, (name_cx - name_img.width // 2, name_cy - name_img.height // 2), name_img)

    # Registration ID inside oval pill
    font_id = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", int(46 * scale_p))
    id_cx = blk_x + int(626 * scale_p)
    id_cy = blk_y + int(273 * scale_p)
    c_draw = ImageDraw.Draw(canvas)
    c_draw.text((id_cx + 2, id_cy + 2), str(reg_id), fill=(0, 0, 0, 255), font=font_id, anchor="mm")
    c_draw.text((id_cx, id_cy), str(reg_id), fill=(253, 224, 71, 255), font=font_id, anchor="mm")

    # 2. Ward & Role Block
    wr_x, wr_y, wr_w, wr_h = 70, 761, 458, 148
    scale_wr = wr_w / 995.0

    wr_frame = Image.open(wr_frame_path).convert("RGBA").resize((wr_w, wr_h), Image.Resampling.LANCZOS)
    canvas.paste(wr_frame, (wr_x, wr_y), wr_frame)

    # Ward
    w_img = render_metallic_text(ward.upper(), "/System/Library/Fonts/Supplemental/Arial Black.ttf", 70, max_w=700, shear=-0.22, stroke_px=5, align='left')
    w_scaled = w_img.resize((int(w_img.width * scale_wr), int(w_img.height * scale_wr)), Image.Resampling.LANCZOS)
    wx = wr_x + int(219 * scale_wr)
    wy = wr_y + int(84 * scale_wr)
    canvas.paste(w_scaled, (wx, wy - w_scaled.height // 2), w_scaled)

    # Role
    r_img = render_metallic_text(role.upper(), "/System/Library/Fonts/Supplemental/Arial Black.ttf", 62, max_w=700, shear=-0.22, stroke_px=5, align='left')
    r_scaled = r_img.resize((int(r_img.width * scale_wr), int(r_img.height * scale_wr)), Image.Resampling.LANCZOS)
    rx = wr_x + int(219 * scale_wr)
    ry = wr_y + int(245 * scale_wr)
    canvas.paste(r_scaled, (rx, ry - r_scaled.height // 2), r_scaled)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path)
    print(f"Generated official player card at: {output_path}")

if __name__ == "__main__":
    generate_official_player_card()
