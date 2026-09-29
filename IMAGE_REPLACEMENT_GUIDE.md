# GPL 2026 Asset & Image Replacement Guide

All images used across the website can be swapped or updated simply by dropping your new image files into the folders below.

---

## 1. 🏏 Team Logos (`/public/images/teams/`)

Inside `src/components/TeamsGrid.js` and `data/teams.json`, each team points to a specific image file with clean comment headers:

| Team Name | Current File Path | How to Replace |
| :--- | :--- | :--- |
| **Flying Eagles** | `/public/images/teams/team-flying-eagles.png` | Drop your new PNG with the same filename |
| **Thunder Striker** | `/public/images/teams/team-thunder-striker.png` | Drop your new PNG with the same filename |
| **Super Sixer** | `/public/images/teams/team-super-sixer.png` | Drop your new PNG with the same filename |
| **Dark Knight** | `/public/images/teams/team-dark-knight.png` | Drop your new PNG with the same filename |
| **Rising Star** | `/public/images/teams/team-rising-star.png` | Drop your new PNG with the same filename |
| **Power Hitter** | `/public/images/teams/team-power-hitter.png` | Drop your new PNG with the same filename |
| **Fearless Fighter** | `/public/images/teams/team-fearless-fighter.png` | Drop your new PNG with the same filename |
| **Sky Warriors** | `/public/images/teams/team-sky-warriors.png` | Drop your new PNG with the same filename |
| **Teams 9 to 12** | `/public/images/teams/` | Add custom PNGs and update `TeamsGrid.js` / `db.js` |

---

## 2. 🏆 Hero, Posters & Banners (`/public/images/`)

| Asset Description | File Path | Usage |
| :--- | :--- | :--- |
| **GPL Official Logo** | `/public/images/logo.png` | Top Navbar & Footer |
| **Main Hero Banner 1** | `/public/images/gpl-banner.jpg` | Banner Carousel Slide 1 |
| **Hero Banner 2** | `/public/images/gpl-banner-2.jpg` | Banner Carousel Slide 2 |
| **Hero Banner 3** | `/public/images/gpl-banner-3.jpg` | Banner Carousel Slide 3 |
| **Sandeep Jadhav Poster** | `/public/images/gpl-card-1.jpg` | About / Hero Section Card 1 |
| **Radhe Radhe Chashak Poster** | `/public/images/gpl-card-2.jpg` | About / Hero Section Card 2 |
| **Auction Poster** | `/public/images/gpl-auction.jpg` | Rules & Auction Section |
| **GPay QR Code** | `/public/images/qr-code.jpg` | Player Registration Payment Card |

---

## 3. 📍 Venue Map Optimization (`src/components/VenueMap.js`)

- **Instant Load**: Uses lightweight Google Maps query embed for **Sambhaji Maidan, Goregaon East, Mumbai**.
- **Interactive Actions**: Includes a 1-tap "Get Directions" button connecting directly to native Google Maps navigation.
