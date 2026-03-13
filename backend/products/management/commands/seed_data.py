"""
GlamStore Seed Data Management Command
=======================================
Usage:
    python manage.py seed_data
    python manage.py seed_data --images-dir "D:/gadaf/Documents/images/beauty"
    python manage.py seed_data --images-dir "D:/gadaf/Documents/images/beauty" --clear
    python manage.py seed_data --products-per-category 10
    python manage.py seed_data --no-images

Images are randomly picked from the folder you provide.
Sub-folders are also scanned recursively.
Supported formats: .jpg, .jpeg, .png, .webp, .gif
"""

import os
import random
import shutil
import glob
from pathlib import Path
from decimal import Decimal
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.core.files import File
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()


# ─── SEED DATA DEFINITIONS ────────────────────────────────────────────────────

CATEGORIES_DATA = [
    {
        "name": "Skin Care",
        "category_type": "skincare",
        "description": "Premium skin care products for every skin type. Serums, moisturisers, SPF, cleansers and more.",
        "meta_title": "Skin Care Products — GlamStore",
        "meta_description": "Shop premium skin care products at GlamStore. Moisturisers, serums, SPF & more for glowing skin.",
        "subcategories": ["Moisturisers", "Serums", "Sunscreen & SPF", "Cleansers", "Toners", "Eye Cream", "Face Masks", "Exfoliators"],
    },
    {
        "name": "Human Hair",
        "category_type": "hair",
        "description": "100% authentic human hair — virgin, remy and premium quality for every style.",
        "meta_title": "Human Hair — Wigs, Bundles & Extensions | GlamStore",
        "meta_description": "Shop 100% human hair wigs, bundles, frontals and closures at GlamStore Kenya.",
        "subcategories": ["Wigs", "Hair Bundles", "Frontals", "Closures", "Braids & Twists", "Clip-in Extensions", "Ponytails", "HD Lace"],
    },
    {
        "name": "Earrings",
        "category_type": "earrings",
        "description": "Statement earrings for every occasion — from everyday studs to glamorous chandeliers.",
        "meta_title": "Earrings — Studs, Hoops, Drop & More | GlamStore",
        "meta_description": "Shop trendy earrings at GlamStore. Studs, hoops, drop, huggie, ear cuffs and more.",
        "subcategories": ["Studs", "Hoops", "Drop Earrings", "Huggie Earrings", "Ear Cuffs", "Chandeliers", "Threaders", "Clip-On"],
    },
    {
        "name": "Stick-Ons",
        "category_type": "stickons",
        "description": "Nail art stickers, face jewels, body stickers, temporary tattoos and rhinestones.",
        "meta_title": "Stick-Ons — Nail Art, Face Jewels & Body Stickers | GlamStore",
        "meta_description": "Shop nail art, face jewels, body stickers, temporary tattoos and rhinestones at GlamStore.",
        "subcategories": ["Nail Art Stickers", "Face Jewels", "Body Stickers", "Temporary Tattoos", "Rhinestones", "Hair Stickers"],
    },
    {
        "name": "Handbags",
        "category_type": "handbags",
        "description": "Stylish handbags for every occasion — totes, clutches, crossbody, shoulder bags and mini bags.",
        "meta_title": "Handbags for Women — Totes, Clutches & More | GlamStore",
        "meta_description": "Shop trendy handbags at GlamStore Kenya. Totes, clutches, crossbody, shoulder & mini bags.",
        "subcategories": ["Tote Bags", "Clutch Bags", "Crossbody Bags", "Shoulder Bags", "Mini Bags", "Evening Bags", "Backpacks", "Bucket Bags"],
    },
]

BRANDS_DATA = [
    {"name": "GlamStore Originals", "description": "Our in-house curated beauty brand"},
    {"name": "LumiGlow", "description": "Science-backed skin care solutions"},
    {"name": "NaturElle", "description": "Natural, vegan-friendly beauty"},
    {"name": "VelvetMane", "description": "Premium human hair specialists"},
    {"name": "AuraGems", "description": "Handcrafted jewellery & accessories"},
    {"name": "ChicCarry", "description": "Trendy handbags & accessories"},
    {"name": "GlitterGal", "description": "Fun, sparkly stick-ons & nail art"},
    {"name": "PureBliss", "description": "Clean beauty, cruelty-free formulas"},
    {"name": "RoyalLocks", "description": "Virgin & remy hair collections"},
    {"name": "ZenGlow", "description": "Minimalist, effective skin care"},
]

# Products per category type
PRODUCTS_DATA = {
    "skincare": [
        {
            "name": "Vitamin C Brightening Serum",
            "short_description": "Powerful 20% Vitamin C serum for radiant, even-toned skin.",
            "description": "Our best-selling Vitamin C Brightening Serum delivers 20% stabilised Vitamin C directly to your skin for maximum brightening benefits. Formulated with ferulic acid and Vitamin E to combat free radicals, fade dark spots and boost collagen production. Suitable for all skin types including sensitive skin. Use morning and evening for glowing, youthful skin.",
            "price": "2800.00", "compare_at_price": "3500.00",
            "stock": 85, "is_featured": True, "is_bestseller": True,
            "skincare": {"skin_type": "All Skin Types", "key_ingredients": "Vitamin C 20%, Ferulic Acid, Vitamin E, Hyaluronic Acid", "volume_ml": 30, "is_vegan": True, "is_cruelty_free": True, "is_fragrance_free": True},
        },
        {
            "name": "Hyaluronic Acid Deep Moisture Cream",
            "short_description": "24-hour hydration with 3 molecular weights of hyaluronic acid.",
            "description": "Deeply hydrating moisturiser formulated with three molecular weights of hyaluronic acid that penetrate different layers of the skin. Enriched with ceramides and niacinamide to strengthen the skin barrier and improve texture. Non-comedogenic and suitable for oily, combination and dry skin types.",
            "price": "1950.00", "compare_at_price": "2400.00",
            "stock": 60, "is_featured": True, "is_new_arrival": True,
            "skincare": {"skin_type": "Dry, Combination", "key_ingredients": "Hyaluronic Acid, Ceramides, Niacinamide", "volume_ml": 50, "is_vegan": True, "is_cruelty_free": True},
        },
        {
            "name": "SPF 50 Tinted Sunscreen Fluid",
            "short_description": "Lightweight tinted SPF 50 that doubles as a primer.",
            "description": "A revolutionary tinted sunscreen that offers broad spectrum SPF 50 protection while providing a natural, dewy finish. Infused with antioxidants and skin-calming ingredients. Water-resistant for up to 80 minutes. The sheer tint neutralises redness and evens skin tone without a heavy feel.",
            "price": "2200.00", "compare_at_price": None,
            "stock": 40, "is_bestseller": True,
            "skincare": {"skin_type": "All Skin Types", "volume_ml": 40, "spf": 50, "is_vegan": True, "is_cruelty_free": True},
        },
        {
            "name": "Retinol 0.5% Night Repair Cream",
            "short_description": "Clinical-grade retinol to smooth fine lines while you sleep.",
            "description": "Our Retinol Night Repair Cream combines 0.5% encapsulated retinol with squalane and peptides for a powerful yet gentle anti-ageing treatment. Works overnight to accelerate cell turnover, reduce the appearance of wrinkles and improve skin firmness. Begin 2–3 nights per week and increase frequency as tolerated.",
            "price": "3200.00", "compare_at_price": "4000.00",
            "stock": 35, "is_featured": True,
            "skincare": {"skin_type": "Normal, Dry, Ageing", "key_ingredients": "Retinol 0.5%, Squalane, Peptides, Shea Butter", "volume_ml": 50, "is_cruelty_free": True},
        },
        {
            "name": "Niacinamide 10% Pore Minimising Toner",
            "short_description": "Balancing toner that minimises pores and controls shine.",
            "description": "A lightweight, alcohol-free toner powered by 10% niacinamide and 1% zinc to visibly reduce pore size, control sebum and improve overall skin clarity. Salicylic acid gently exfoliates to prevent congestion. Great for oily and acne-prone skin. Pat onto cleansed skin morning and night.",
            "price": "1600.00", "compare_at_price": "2000.00",
            "stock": 70, "is_new_arrival": True,
            "skincare": {"skin_type": "Oily, Acne-Prone", "key_ingredients": "Niacinamide 10%, Zinc 1%, Salicylic Acid", "volume_ml": 150, "is_vegan": True, "is_cruelty_free": True},
        },
        {
            "name": "Gentle Micellar Cleansing Water",
            "short_description": "No-rinse micellar water that removes makeup, SPF and impurities.",
            "description": "A fragrance-free, soap-free cleansing water that effortlessly lifts away makeup, SPF and daily grime without harsh rubbing. Infused with rose water and chamomile extract to soothe and calm even the most reactive skin. Simply saturate a cotton pad and gently wipe — no rinsing needed.",
            "price": "1200.00", "compare_at_price": None,
            "stock": 90, "is_bestseller": True,
            "skincare": {"skin_type": "Sensitive, All Types", "key_ingredients": "Micellar Technology, Rose Water, Chamomile", "volume_ml": 400, "is_vegan": True, "is_cruelty_free": True, "is_fragrance_free": True},
        },
        {
            "name": "Peptide Eye Cream with Caffeine",
            "short_description": "Depuffs dark circles and firms the eye area in 4 weeks.",
            "description": "Target puffiness, dark circles and crow's feet with our concentrated Peptide Eye Cream. A powerful blend of matrixyl peptides, 3% caffeine and vitamin K works in synergy to firm, brighten and smooth the delicate under-eye area. The cooling metal applicator helps reduce morning puffiness instantly.",
            "price": "2500.00", "compare_at_price": "3000.00",
            "stock": 28, "is_featured": True, "is_new_arrival": True,
            "skincare": {"skin_type": "All Skin Types", "key_ingredients": "Peptides, Caffeine 3%, Vitamin K, Hyaluronic Acid", "volume_ml": 15, "is_vegan": True, "is_cruelty_free": True},
        },
        {
            "name": "AHA/BHA Resurfacing Exfoliator",
            "short_description": "10% AHA + 2% BHA exfoliant for smooth, glowing skin.",
            "description": "A leave-on chemical exfoliant combining glycolic acid, lactic acid and salicylic acid to dissolve dead skin cells, unclog pores and improve skin texture without harsh physical scrubbing. Regular use reveals smoother, more luminous skin and reduces the appearance of acne scars and hyperpigmentation.",
            "price": "2100.00", "compare_at_price": "2600.00",
            "stock": 45,
            "skincare": {"skin_type": "Oily, Combination, Dull Skin", "key_ingredients": "Glycolic Acid, Lactic Acid, Salicylic Acid 2%", "volume_ml": 100, "is_vegan": True, "is_cruelty_free": True},
        },
        {
            "name": "Overnight Glow Sleeping Mask",
            "short_description": "Wake up to plump, radiant skin with this overnight gel mask.",
            "description": "A luxurious overnight sleeping mask that works while you rest. Packed with probiotics, bakuchiol and ceramides, it reinforces the skin barrier, locks in moisture and promotes cellular renewal overnight. The lightweight gel texture absorbs quickly without pilling under other products. Apply as the last step in your PM routine.",
            "price": "2700.00", "compare_at_price": "3200.00",
            "stock": 33, "is_new_arrival": True,
            "skincare": {"skin_type": "All Skin Types", "key_ingredients": "Probiotics, Bakuchiol, Ceramides, Hyaluronic Acid", "volume_ml": 75, "is_vegan": True, "is_cruelty_free": True},
        },
        {
            "name": "Salicylic Acid Clearing Cleanser",
            "short_description": "Daily foaming cleanser that fights breakouts without over-drying.",
            "description": "A gentle daily face wash with 1.5% salicylic acid that penetrates pores to clear blackheads and prevent new blemishes. Formulated with green tea extract and centella asiatica to calm inflammation while effectively removing excess oil and impurities. Leaves skin feeling clean, clear and refreshed — never tight.",
            "price": "1400.00", "compare_at_price": None,
            "stock": 65, "is_bestseller": True,
            "skincare": {"skin_type": "Oily, Acne-Prone, Combination", "key_ingredients": "Salicylic Acid 1.5%, Green Tea, Centella Asiatica", "volume_ml": 150, "is_vegan": True, "is_cruelty_free": True},
        },
    ],
    "hair": [
        {
            "name": "Brazilian Straight Virgin Hair Bundle",
            "short_description": "Silky smooth 100% virgin Brazilian hair, single donor.",
            "description": "Our premium Brazilian Straight Virgin Hair is sourced from a single donor for consistent texture and thickness from root to tip. Completely unprocessed with cuticles intact and aligned for minimal tangling and shedding. Can be dyed, bleached and heat-styled. Comes in 3 bundle deal options. Lasts 2–3 years with proper care.",
            "price": "8500.00", "compare_at_price": "10000.00",
            "stock": 25, "is_featured": True, "is_bestseller": True,
            "hair": {"hair_type": "virgin", "texture": "straight", "length_inches": 18, "color": "Natural Black", "origin": "Brazilian", "density": "150%", "can_be_dyed": True, "can_be_bleached": True, "lifespan_years": 3},
        },
        {
            "name": "Peruvian Body Wave Remy Hair 3-Bundle Deal",
            "short_description": "Bouncy body wave Peruvian remy hair — full 3-bundle deal.",
            "description": "Get a full, voluminous look with our Peruvian Body Wave Remy Hair 3-Bundle Deal. The natural body wave pattern adds gorgeous movement and dimension. All bundles are double-weft for added density and fullness. Cuticles are aligned to prevent matting. Can be straightened for a silky look or enhanced with curl cream for defined waves.",
            "price": "14500.00", "compare_at_price": "18000.00",
            "stock": 18, "is_featured": True, "is_bestseller": True,
            "hair": {"hair_type": "remy", "texture": "wavy", "length_inches": 20, "color": "Natural Black", "origin": "Peruvian", "density": "180%", "can_be_dyed": True, "can_be_bleached": False},
        },
        {
            "name": "HD Lace Frontal Wig — Kinky Curly",
            "short_description": "Invisible HD lace frontal wig with kinky curly texture.",
            "description": "Experience the most natural-looking hairline with our HD Lace Frontal Wig. The ultra-thin HD lace melts seamlessly into all skin tones for an undetectable look. Features a 13x4 frontal giving you 360° styling versatility. The kinky curly texture perfectly mimics natural 4C hair. Pre-plucked with baby hairs for an effortlessly natural finish.",
            "price": "12000.00", "compare_at_price": "15000.00",
            "stock": 15, "is_featured": True, "is_new_arrival": True,
            "hair": {"hair_type": "virgin", "texture": "coily", "length_inches": 16, "color": "Natural Black", "origin": "Brazilian", "density": "150%", "can_be_dyed": True},
        },
        {
            "name": "Malaysian Loose Deep Wave Bundle",
            "short_description": "Luxurious loose deep wave Malaysian hair with natural lustre.",
            "description": "Malaysian Loose Deep Wave hair is renowned for its natural lustre, softness and durability. The loose deep wave pattern holds curl well and retains its shape even after washing. This double-drawn bundle has consistent thickness from root to tip for maximum fullness. Suitable for sew-in, quick-weave and fusion installs.",
            "price": "6800.00", "compare_at_price": "8000.00",
            "stock": 30, "is_bestseller": True,
            "hair": {"hair_type": "remy", "texture": "curly", "length_inches": 22, "color": "Natural Black", "origin": "Malaysian", "density": "150%", "can_be_dyed": True, "can_be_bleached": False},
        },
        {
            "name": "Clip-In Hair Extensions — Straight Blonde",
            "short_description": "Instant volume clip-in extensions in silky straight blonde.",
            "description": "Transform your look in minutes with our Clip-In Hair Extensions. The 8-piece set provides seamless, natural-looking volume and length. Secure weft clips snap in and out easily without any damage to your natural hair. The silky straight texture blends perfectly with fine to medium natural hair. Colour: #613 Platinum Blonde.",
            "price": "4500.00", "compare_at_price": "5500.00",
            "stock": 40, "is_new_arrival": True,
            "hair": {"hair_type": "remy", "texture": "straight", "length_inches": 18, "color": "Platinum Blonde #613", "density": "120%", "can_be_dyed": True},
        },
        {
            "name": "Closure 4x4 Body Wave — Swiss Lace",
            "short_description": "Natural-looking Swiss lace 4x4 closure in body wave.",
            "description": "Complete any install with our 4x4 Swiss Lace Closure. The natural-looking part area with pre-plucked hairline requires minimal customisation. Body wave texture matches most bundle textures for seamless blending. Medium-density Swiss lace is bleachable for a perfect skin-tone match.",
            "price": "5500.00", "compare_at_price": "6500.00",
            "stock": 22,
            "hair": {"hair_type": "virgin", "texture": "wavy", "length_inches": 14, "color": "Natural Black", "origin": "Brazilian", "can_be_dyed": True, "can_be_bleached": True},
        },
        {
            "name": "Deep Wave Ponytail — Drawstring",
            "short_description": "Instant glam drawstring ponytail in natural deep wave.",
            "description": "Create a stunning ponytail style in seconds with our Deep Wave Drawstring Ponytail. No glue or heat required. Simply wrap your natural hair, pull the drawstring and secure the velcro. The adjustable drawstring fits all head sizes. The elastic band sits flat against your scalp for a seamless, polished look.",
            "price": "3200.00", "compare_at_price": "4000.00",
            "stock": 50, "is_bestseller": True,
            "hair": {"hair_type": "remy", "texture": "curly", "length_inches": 20, "color": "Natural Black"},
        },
        {
            "name": "Cambodian Raw Straight Hair Bundle",
            "short_description": "Ultra-premium raw Cambodian straight hair, naturally thicker.",
            "description": "Sourced directly from Cambodia, this raw unprocessed straight hair retains its natural, slightly coarser texture that mirrors African hair more closely than other origins. Naturally thicker, fuller and longer-lasting than other hair types. Each bundle is hand-selected for quality. Holds colour beautifully and can be chemically processed.",
            "price": "9500.00", "compare_at_price": "12000.00",
            "stock": 12, "is_featured": True, "is_new_arrival": True,
            "hair": {"hair_type": "virgin", "texture": "straight", "length_inches": 24, "color": "Natural Black/Brown", "origin": "Cambodian", "density": "180%", "can_be_dyed": True, "can_be_bleached": True, "lifespan_years": 4},
        },
    ],
    "earrings": [
        {
            "name": "Pearl Drop Earrings — Gold Plated",
            "short_description": "Elegant freshwater pearl drops on 18K gold-plated hooks.",
            "description": "Elevate any outfit with these timeless Pearl Drop Earrings. Featuring genuine freshwater pearls suspended from sleek 18K gold-plated fishhook earrings. The organic lustre of natural pearls pairs beautifully with the warm gold hardware. Suitable for pierced ears. Hypoallergenic posts. A must-have for every jewellery collection.",
            "price": "1800.00", "compare_at_price": "2200.00",
            "stock": 55, "is_featured": True, "is_bestseller": True,
            "earring": {"earring_type": "drop", "material": "18K Gold-Plated Brass", "gemstone": "Freshwater Pearl", "length_mm": 45, "is_hypoallergenic": True, "closure_type": "Fish Hook"},
        },
        {
            "name": "Oversized Gold Hoop Earrings",
            "short_description": "Bold 60mm gold hoop earrings — a wardrobe staple.",
            "description": "Make a statement with these bold, lightweight oversized gold hoop earrings. Crafted from high-quality brass with a thick 18K gold plating that resists tarnishing. The 60mm diameter makes them perfect for casual days or evening outings. Secure click-lock closure keeps them in place all day.",
            "price": "1200.00", "compare_at_price": None,
            "stock": 80, "is_bestseller": True,
            "earring": {"earring_type": "hoops", "material": "18K Gold-Plated Brass", "length_mm": 60, "width_mm": 60, "is_hypoallergenic": True, "closure_type": "Click-Lock"},
        },
        {
            "name": "Crystal Chandelier Earrings — Rose Gold",
            "short_description": "Glamorous multi-tier crystal chandelier earrings in rose gold.",
            "description": "Be the centre of attention with our Crystal Chandelier Earrings. Four tiers of hand-set AAA cubic zirconia crystals cascade beautifully for maximum sparkle. Rose gold plated frames catch light from every angle. Secure lever-back closures. Perfect for weddings, galas and formal occasions. Nickel-free.",
            "price": "2600.00", "compare_at_price": "3200.00",
            "stock": 30, "is_featured": True, "is_new_arrival": True,
            "earring": {"earring_type": "chandelier", "material": "Rose Gold Plated Brass", "gemstone": "AAA Cubic Zirconia", "length_mm": 80, "is_hypoallergenic": True, "is_waterproof": False, "closure_type": "Lever Back"},
        },
        {
            "name": "Minimalist Diamond Studs — Sterling Silver",
            "short_description": "Delicate 0.5ct diamond-cut CZ studs in 925 sterling silver.",
            "description": "Sometimes less is more. These Minimalist Diamond Studs in 925 sterling silver are the perfect everyday earring. Featuring brilliant-cut cubic zirconia stones that sparkle like real diamonds. Push-back butterfly closures hold securely. Hypoallergenic and tarnish-resistant. Available in 4mm, 6mm and 8mm stone sizes.",
            "price": "1500.00", "compare_at_price": "1900.00",
            "stock": 100, "is_bestseller": True,
            "earring": {"earring_type": "studs", "material": "925 Sterling Silver", "gemstone": "Cubic Zirconia", "length_mm": 6, "width_mm": 6, "is_hypoallergenic": True, "is_waterproof": True, "closure_type": "Butterfly Push-Back"},
        },
        {
            "name": "Huggie Hoop Earrings — Diamond Pavé",
            "short_description": "Dainty diamond-pavé huggie hoops that hug the earlobe.",
            "description": "Our most popular everyday earrings. These snug huggie hoops are set with sparkling pavé cubic zirconia all the way around for 360° shimmer. The snug fit means they stay in place even on active days. Perfect for stacking with other earrings or wearing alone. Gold or silver finish available. Nickel-free.",
            "price": "2100.00", "compare_at_price": "2600.00",
            "stock": 65, "is_featured": True, "is_bestseller": True,
            "earring": {"earring_type": "huggie", "material": "18K Gold-Plated 925 Silver", "gemstone": "Cubic Zirconia Pavé", "length_mm": 12, "is_hypoallergenic": True, "closure_type": "Hinged Snap"},
        },
        {
            "name": "Tassel & Fringe Drop Earrings",
            "short_description": "Playful long tassel earrings in boho gold and nude.",
            "description": "Add a boho-chic flair to any look with these fun Tassel Fringe Drop Earrings. Long silk thread tassels in neutral nude and gold tones move beautifully and catch the eye. Lightweight enough for all-day wear. Fish-hook style earrings for pierced ears. Pairs perfectly with casual and festival outfits.",
            "price": "950.00", "compare_at_price": "1200.00",
            "stock": 45, "is_new_arrival": True,
            "earring": {"earring_type": "drop", "material": "Gold-Tone Metal, Silk Thread", "length_mm": 100, "is_hypoallergenic": False, "closure_type": "Fish Hook"},
        },
        {
            "name": "Ear Cuff Climber — No Piercing",
            "short_description": "Edgy ear cuff climber that wraps the outer ear — no piercing needed.",
            "description": "No piercing? No problem. This statement ear cuff climber wraps elegantly around the outer ear cartilage for a bold, edgy look. Features a trail of pavé crystal stones that appear to climb the ear. Adjustable cuff fits most ear sizes. Perfect for special occasions or adding edge to everyday looks.",
            "price": "1700.00", "compare_at_price": "2100.00",
            "stock": 35, "is_new_arrival": True,
            "earring": {"earring_type": "ear_cuff", "material": "Rhodium-Plated Brass", "gemstone": "Crystal Pavé", "is_hypoallergenic": True, "closure_type": "Adjustable Cuff"},
        },
        {
            "name": "Vintage Floral Clip-On Earrings",
            "short_description": "Beautiful floral statement earrings with comfortable clip-on backs.",
            "description": "Enjoy stunning earrings without pierced ears with our Vintage Floral Clip-On Earrings. Handcrafted resin flowers in blush and ivory with gold-tone petals. Padded clip-on backs are comfortable enough for all-day wear. A standout piece for occasions, garden parties and brunches. Available in 3 colour ways.",
            "price": "1100.00", "compare_at_price": "1400.00",
            "stock": 40,
            "earring": {"earring_type": "clip_on", "material": "Resin, Gold-Tone Metal", "length_mm": 35, "width_mm": 35, "is_hypoallergenic": False, "closure_type": "Padded Clip-On"},
        },
    ],
    "stickons": [
        {
            "name": "Holographic Nail Art Sticker Set — 500pcs",
            "short_description": "500-piece holographic nail art sticker set with 3D designs.",
            "description": "Elevate your nail art game with this massive 500-piece Holographic Nail Art Sticker Set. Features 3D flowers, butterflies, hearts, geometric patterns and abstract designs. Simply peel and place on bare nails or over gel/acrylic. Seal with top coat for lasting wear. No salon needed — achieve stunning nail art at home in minutes.",
            "price": "850.00", "compare_at_price": "1200.00",
            "stock": 150, "is_featured": True, "is_bestseller": True,
            "stickon": {"stickon_type": "nail_art", "pieces_per_pack": 500, "application_area": "Nails", "duration_hours": 168, "is_reusable": False, "is_waterproof": True, "design_theme": "Holographic Floral & Geometric"},
        },
        {
            "name": "Crystal Face Jewels — Festival Pack",
            "short_description": "Premium adhesive crystal face gems for festivals and events.",
            "description": "Create dazzling festival or editorial looks with our Crystal Face Jewels. This festival pack includes 120 individually packaged adhesive crystals in 6 sizes and 5 colours — clear, rose gold, turquoise, amethyst and emerald. Medical-grade adhesive is safe for skin and easily removed with warm water. Used by MUAs and makeup artists worldwide.",
            "price": "1200.00", "compare_at_price": "1500.00",
            "stock": 90, "is_featured": True, "is_bestseller": True,
            "stickon": {"stickon_type": "face_jewel", "pieces_per_pack": 120, "application_area": "Face, Collarbones, Body", "duration_hours": 12, "is_reusable": False, "is_waterproof": False, "design_theme": "Crystal Gems Multi-Colour"},
        },
        {
            "name": "Floral Temporary Tattoo Sheets — 6 Sheets",
            "short_description": "Delicate botanical temporary tattoos in muted tones.",
            "description": "Our Floral Temporary Tattoo collection features beautifully illustrated botanical designs — roses, wildflowers, leaves and vines in muted watercolour tones. Each sheet contains 8–12 individual tattoo designs. Lasts 3–5 days on skin. Water-activated transfer process — simply press with damp cloth. Completely non-toxic and skin-safe.",
            "price": "750.00", "compare_at_price": "950.00",
            "stock": 120, "is_bestseller": True,
            "stickon": {"stickon_type": "tattoo", "pieces_per_pack": 60, "application_area": "Arms, Neck, Shoulders, Ankle", "duration_hours": 96, "is_reusable": False, "is_waterproof": False, "design_theme": "Botanical Floral Watercolour"},
        },
        {
            "name": "SS16 Clear Hotfix Rhinestones — 1440pcs",
            "short_description": "Professional SS16 clear AB rhinestones for nails, crafts and fabric.",
            "description": "Professional-grade SS16 (4mm) clear AB rhinestones with hotfix adhesive backing. 1440 pieces per pack. Shimmering aurora borealis coating creates rainbow reflections. Can be applied with a rhinestone picker tool or hot-fix applicator. Perfect for nail art, DIY clothing embellishments, phone cases and crafts. Excellent staying power.",
            "price": "980.00", "compare_at_price": "1300.00",
            "stock": 200, "is_new_arrival": True,
            "stickon": {"stickon_type": "rhinestone", "pieces_per_pack": 1440, "application_area": "Nails, Fabric, Crafts", "is_reusable": False, "is_waterproof": True, "design_theme": "Clear AB Crystal"},
        },
        {
            "name": "3D Butterfly Nail Art Charms — 20pcs",
            "short_description": "Dimensional butterfly charms for gel and acrylic nails.",
            "description": "Add a whimsical 3D element to your nail art with these Butterfly Nail Art Charms. Each charm features delicately crafted butterfly wings with iridescent detailing. Press directly onto uncured gel top coat or secure with nail glue. Available in pastel rainbow, gold glitter and holographic mirror finish. Instagram-worthy results guaranteed.",
            "price": "650.00", "compare_at_price": None,
            "stock": 180, "is_new_arrival": True,
            "stickon": {"stickon_type": "nail_art", "pieces_per_pack": 20, "application_area": "Nails", "is_reusable": False, "is_waterproof": True, "design_theme": "3D Butterfly Iridescent"},
        },
        {
            "name": "Star & Moon Body Sticker Sheets",
            "short_description": "Celestial star and moon self-adhesive body stickers.",
            "description": "Channel celestial energy with these Star & Moon Body Stickers. Each sheet features 36 gold foil star and moon designs in various sizes. Safe for skin — uses dermatologically tested adhesive. Great for festivals, parties, Halloween and creative photoshoots. No irritation, no residue. Apply to clean dry skin for 6–8 hours of wear.",
            "price": "550.00", "compare_at_price": "700.00",
            "stock": 160,
            "stickon": {"stickon_type": "body_sticker", "pieces_per_pack": 36, "application_area": "Face, Arms, Shoulders, Decolletage", "duration_hours": 8, "is_reusable": False, "is_waterproof": False, "design_theme": "Celestial Gold Foil"},
        },
    ],
    "handbags": [
        {
            "name": "Structured Top-Handle Tote Bag — Camel",
            "short_description": "Classic structured tote in rich camel vegan leather — office to weekend.",
            "description": "The ultimate everyday tote that takes you from morning meetings to weekend brunch. Crafted from premium vegan PU leather with a structured silhouette that holds its shape beautifully. Spacious main compartment comfortably fits a 15\" laptop, tablet and daily essentials. Features a zip closure, two interior slip pockets and a padded laptop sleeve. Gold-tone hardware. Includes a detachable strap.",
            "price": "4800.00", "compare_at_price": "6000.00",
            "stock": 35, "is_featured": True, "is_bestseller": True,
            "handbag": {"bag_type": "tote", "material": "Premium Vegan PU Leather", "color": "Camel", "lining_material": "Cotton Twill", "closure_type": "Top Zip", "number_of_pockets": 4, "strap_type": "Top Handle + Detachable Crossbody Strap", "width_cm": 36, "height_cm": 28, "depth_cm": 14, "is_waterproof": False},
        },
        {
            "name": "Mini Quilted Crossbody Bag — Blush Pink",
            "short_description": "Trendy mini quilted crossbody in blush with gold chain strap.",
            "description": "This adorable mini quilted crossbody is the bag of the season. The diamond quilt pattern in soft blush pink leather is elevated by a gold curb chain strap that can be worn long or doubled for a shorter carry. Compact enough for evenings out, it fits your essentials: phone, cards, keys and lipstick. Secure magnetic snap closure. Available in 8 colours.",
            "price": "3200.00", "compare_at_price": "4000.00",
            "stock": 50, "is_featured": True, "is_bestseller": True, "is_new_arrival": True,
            "handbag": {"bag_type": "crossbody", "material": "Quilted Vegan Leather", "color": "Blush Pink", "lining_material": "Satin", "closure_type": "Magnetic Snap", "number_of_pockets": 2, "strap_type": "Gold Curb Chain", "strap_length_cm": 120, "width_cm": 20, "height_cm": 14, "depth_cm": 6},
        },
        {
            "name": "Croc-Embossed Envelope Clutch — Black",
            "short_description": "Sleek croc-embossed envelope clutch — evening perfection.",
            "description": "The ultimate evening clutch. This sophisticated envelope-style clutch in croc-embossed vegan leather is the perfect companion for formal events, dinner dates and cocktail parties. Fold-over flap with magnetic closure keeps your valuables secure. Interior card slots and a hidden zip pocket. Fits a full-size smartphone. Also available as a wristlet.",
            "price": "2600.00", "compare_at_price": "3200.00",
            "stock": 45, "is_featured": True,
            "handbag": {"bag_type": "clutch", "material": "Croc-Embossed Vegan Leather", "color": "Black", "lining_material": "Microsuede", "closure_type": "Magnetic Flap", "number_of_pockets": 3, "strap_type": "Detachable Wrist Strap", "width_cm": 30, "height_cm": 15, "depth_cm": 3},
        },
        {
            "name": "Bucket Bag with Drawstring — Tan",
            "short_description": "Casual drawstring bucket bag in soft tan — effortlessly cool.",
            "description": "The bucket bag trend never gets old. This roomy bucket bag in buttery-soft tan PU leather features a drawstring closure and adjustable shoulder strap for a comfortable, hands-free carry. The slouchy silhouette is relaxed yet chic. Interior features a zip pocket for valuables. Perfect for farmers markets, brunches and casual city days.",
            "price": "3500.00", "compare_at_price": "4200.00",
            "stock": 28,
            "handbag": {"bag_type": "bucket", "material": "Soft Vegan PU Leather", "color": "Tan", "lining_material": "Cotton Canvas", "closure_type": "Drawstring", "number_of_pockets": 2, "strap_type": "Adjustable Shoulder Strap", "strap_length_cm": 100, "width_cm": 22, "height_cm": 26, "depth_cm": 12},
        },
        {
            "name": "Satin Evening Bag — Champagne Gold",
            "short_description": "Elegant satin evening bag with crystal clasp — perfect for events.",
            "description": "Be the best-dressed at every event with this Satin Evening Bag in champagne gold. The lustrous satin fabric catches light beautifully. A jewelled crystal clasp adds a luxurious finishing touch. The detachable chain strap can be tucked away to use as a clutch. Lined with soft microsuede. Holds phone, lipstick, cards and small essentials.",
            "price": "2800.00", "compare_at_price": "3500.00",
            "stock": 20, "is_featured": True, "is_new_arrival": True,
            "handbag": {"bag_type": "evening", "material": "Satin Fabric", "color": "Champagne Gold", "lining_material": "Microsuede", "closure_type": "Crystal Clasp", "number_of_pockets": 1, "strap_type": "Detachable Gold Chain", "width_cm": 24, "height_cm": 14, "depth_cm": 5},
        },
        {
            "name": "Mini Backpack — Holographic Silver",
            "short_description": "Fun holographic mini backpack — Y2K vibes, modern carry.",
            "description": "Bring back Y2K energy with this holographic silver mini backpack. The iridescent PU surface shifts from silver to pink to blue as you move — a true head-turner. Despite its compact size, it features a main zip compartment, a front zip pocket and two adjustable padded straps for comfortable carrying. Great for concerts, theme parks and days out.",
            "price": "2900.00", "compare_at_price": "3600.00",
            "stock": 38, "is_new_arrival": True,
            "handbag": {"bag_type": "backpack", "material": "Holographic PU", "color": "Holographic Silver/Rainbow", "lining_material": "Nylon", "closure_type": "Top Zip", "number_of_pockets": 3, "strap_type": "Adjustable Padded Backpack Straps", "width_cm": 22, "height_cm": 28, "depth_cm": 10},
        },
        {
            "name": "Woven Straw Beach Tote — Natural",
            "short_description": "Handwoven straw beach tote — summer's essential carry-all.",
            "description": "Your summer holiday is incomplete without this Woven Straw Beach Tote. Handcrafted from natural raffia straw with leather-wrapped handles for a luxe bohemian look. Spacious enough for a towel, sunscreen, a book and a water bottle. Comes with a removable zip-pouch insert for smaller items. The natural colour pairs with everything.",
            "price": "3100.00", "compare_at_price": "3800.00",
            "stock": 42, "is_bestseller": True,
            "handbag": {"bag_type": "tote", "material": "Natural Raffia Straw, Leather Handles", "color": "Natural/Tan", "lining_material": "Cotton Canvas", "closure_type": "Open Top with Inner Zip Pouch", "number_of_pockets": 2, "strap_type": "Leather Top Handles", "width_cm": 45, "height_cm": 32, "depth_cm": 15, "is_waterproof": False},
        },
        {
            "name": "Micro Shoulder Bag — Chocolate Brown",
            "short_description": "Tiny but mighty micro bag in rich chocolate brown leather.",
            "description": "Good things come in small packages. This Micro Shoulder Bag in rich chocolate vegan leather is the cutest bag you'll own. Despite its tiny size it fits cards, cash, a lipstick and AirPods. The adjustable thin strap can be worn as a crossbody or shoulder bag. Twist-lock closure. An understated everyday luxury that pairs with everything.",
            "price": "2400.00", "compare_at_price": "2900.00",
            "stock": 55, "is_bestseller": True,
            "handbag": {"bag_type": "mini", "material": "Vegan Leather", "color": "Chocolate Brown", "lining_material": "Satin", "closure_type": "Twist Lock", "number_of_pockets": 2, "strap_type": "Thin Adjustable Strap", "width_cm": 16, "height_cm": 11, "depth_cm": 5},
        },
    ],
}

FLASH_SALE_DATA = {
    "title": "Weekend Flash Sale — Up to 40% Off!",
    "discount_percentage": 40,
}

BANNER_DATA = [
    {"title": "Glow Up With GlamStore", "subtitle": "Shop new skin care arrivals — your skin will thank you", "order": 1},
    {"title": "Hair Goals Unlocked", "subtitle": "Premium human hair — bundles, wigs & frontals", "order": 2},
    {"title": "Accessories That Slay", "subtitle": "Earrings, bags & stick-ons for every mood", "order": 3},
]

COUPON_DATA = [
    {"code": "GLAM10", "discount_type": "percentage", "discount_value": "10.00", "minimum_order_amount": "1000.00", "description": "10% off all orders over KES 1,000"},
    {"code": "WELCOME20", "discount_type": "percentage", "discount_value": "20.00", "minimum_order_amount": "2000.00", "description": "Welcome 20% off for new customers"},
    {"code": "FREESHIP", "discount_type": "fixed", "discount_value": "200.00", "minimum_order_amount": "500.00", "description": "Free shipping on any order"},
    {"code": "BEAUTY500", "discount_type": "fixed", "discount_value": "500.00", "minimum_order_amount": "3000.00", "description": "KES 500 off orders over KES 3,000"},
]


# ─── COMMAND ──────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Seed the GlamStore database with realistic beauty product data and images"

    def add_arguments(self, parser):
        parser.add_argument(
            "--images-dir",
            type=str,
            default=r"D:\gadaf\Documents\images\beauty",
            help="Path to folder containing beauty images (default: D:\\gadaf\\Documents\\images\\beauty)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing seed data before seeding",
        )
        parser.add_argument(
            "--no-images",
            action="store_true",
            help="Skip image assignment (useful if images folder is unavailable)",
        )
        parser.add_argument(
            "--products-per-category",
            type=int,
            default=None,
            help="Override number of products to create per category",
        )
        parser.add_argument(
            "--create-superuser",
            action="store_true",
            help="Also create a test superuser (admin/admin123)",
        )

    def handle(self, *args, **options):
        self.images_dir = options["images_dir"]
        self.no_images = options["no_images"]
        self.products_per_category = options.get("products_per_category")

        self.stdout.write(self.style.MIGRATE_HEADING("\n🌸 GlamStore Seed Data Script\n"))

        if options["clear"]:
            self._clear_data()

        # Load images pool
        self.image_pool = self._load_images()

        if options["create_superuser"]:
            self._create_superuser()

        # Seed in order
        brands = self._seed_brands()
        categories = self._seed_categories()
        self._seed_products(categories, brands)
        self._seed_banners()
        self._seed_flash_sale()
        self._seed_coupons()

        self.stdout.write(self.style.SUCCESS("\n✅ Seed complete! GlamStore is ready.\n"))

    # ─── CLEAR ────────────────────────────────────────────────────────────────

    def _clear_data(self):
        self.stdout.write("🗑️  Clearing existing data...")
        from products.models import (
            Category, SubCategory, Brand, Product, ProductImage,
            ProductVariant, ProductReview, SkincareProduct, HairProduct,
            EarringProduct, StickonProduct, HandbagProduct,
            Wishlist, Banner, FlashSale
        )
        from orders.models import Coupon

        FlashSale.objects.all().delete()
        Banner.objects.all().delete()
        Coupon.objects.all().delete()
        ProductImage.objects.all().delete()
        ProductVariant.objects.all().delete()
        SkincareProduct.objects.all().delete()
        HairProduct.objects.all().delete()
        EarringProduct.objects.all().delete()
        StickonProduct.objects.all().delete()
        HandbagProduct.objects.all().delete()
        Product.objects.all().delete()
        SubCategory.objects.all().delete()
        Category.objects.all().delete()
        Brand.objects.all().delete()
        self.stdout.write(self.style.WARNING("  → Existing data cleared.\n"))

    # ─── IMAGES ───────────────────────────────────────────────────────────────

    def _load_images(self):
        if self.no_images:
            self.stdout.write("  ⚠️  --no-images flag set. Skipping image loading.")
            return []

        images_path = Path(self.images_dir)
        if not images_path.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"  ⚠️  Images directory not found: {self.images_dir}\n"
                    f"     Continuing without images. Use --no-images to suppress this warning.\n"
                    f"     Or pass --images-dir with the correct path.\n"
                )
            )
            return []

        extensions = ["*.jpg", "*.jpeg", "*.png", "*.webp", "*.gif", "*.JPG", "*.JPEG", "*.PNG", "*.WEBP"]
        all_images = []
        for ext in extensions:
            all_images.extend(glob.glob(str(images_path / "**" / ext), recursive=True))
            all_images.extend(glob.glob(str(images_path / ext)))

        # Deduplicate
        all_images = list(set(all_images))

        if not all_images:
            self.stdout.write(
                self.style.WARNING(f"  ⚠️  No images found in: {self.images_dir}. Continuing without images.\n")
            )
            return []

        self.stdout.write(f"  🖼️  Found {len(all_images)} images in {self.images_dir}")
        return all_images

    def _pick_image(self):
        """Return a random image path from the pool, or None if pool is empty."""
        if not self.image_pool:
            return None
        return random.choice(self.image_pool)

    def _attach_image(self, product, is_primary=True, extra_count=0):
        """Attach 1 primary + optional extra images to a product."""
        from products.models import ProductImage
        from django.core.files.uploadedfile import SimpleUploadedFile

        images_to_attach = []

        primary_path = self._pick_image()
        if primary_path:
            images_to_attach.append((primary_path, is_primary, 0))

        for i in range(extra_count):
            path = self._pick_image()
            if path and path not in [x[0] for x in images_to_attach]:
                images_to_attach.append((path, False, i + 1))

        for img_path, primary, order in images_to_attach:
            try:
                with open(img_path, "rb") as f:
                    img_name = Path(img_path).name
                    ProductImage.objects.create(
                        product=product,
                        image=File(f, name=img_name),
                        alt_text=f"{product.name} - image {order + 1}",
                        is_primary=primary,
                        order=order,
                    )
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"    ⚠️  Could not attach image {img_path}: {e}"))

    # ─── SUPERUSER ────────────────────────────────────────────────────────────

    def _create_superuser(self):
        self.stdout.write("👤 Creating test superuser...")
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@glamstore.co.ke",
                password="admin123",
                first_name="Admin",
                last_name="GlamStore",
            )
            self.stdout.write(self.style.SUCCESS("  ✅ Superuser created: admin / admin123"))
        else:
            self.stdout.write("  → Superuser 'admin' already exists, skipping.")

    # ─── BRANDS ───────────────────────────────────────────────────────────────

    def _seed_brands(self):
        from products.models import Brand
        self.stdout.write("\n🏷️  Seeding brands...")
        brands = {}
        for b in BRANDS_DATA:
            obj, created = Brand.objects.get_or_create(
                name=b["name"],
                defaults={"description": b["description"], "is_active": True},
            )
            brands[b["name"]] = obj
            symbol = "✚" if created else "↺"
            self.stdout.write(f"  {symbol} {obj.name}")
        self.stdout.write(self.style.SUCCESS(f"  → {len(brands)} brands ready."))
        return brands

    # ─── CATEGORIES ───────────────────────────────────────────────────────────

    def _seed_categories(self):
        from products.models import Category, SubCategory
        self.stdout.write("\n📂 Seeding categories & subcategories...")
        categories = {}
        for cat_data in CATEGORIES_DATA:
            cat, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "category_type": cat_data["category_type"],
                    "description": cat_data["description"],
                    "meta_title": cat_data["meta_title"],
                    "meta_description": cat_data["meta_description"],
                    "is_active": True,
                },
            )
            categories[cat_data["category_type"]] = cat
            symbol = "✚" if created else "↺"
            self.stdout.write(f"  {symbol} {cat.name}")

            for sub_name in cat_data["subcategories"]:
                SubCategory.objects.get_or_create(
                    category=cat,
                    name=sub_name,
                    defaults={"is_active": True},
                )

        self.stdout.write(self.style.SUCCESS(f"  → {len(categories)} categories ready."))
        return categories

    # ─── PRODUCTS ─────────────────────────────────────────────────────────────

    def _seed_products(self, categories, brands):
        from products.models import (
            Product, ProductVariant,
            SkincareProduct, HairProduct, EarringProduct,
            StickonProduct, HandbagProduct,
        )
        self.stdout.write("\n🛍️  Seeding products...")

        brand_list = list(brands.values())
        total_created = 0

        for cat_type, products_list in PRODUCTS_DATA.items():
            category = categories.get(cat_type)
            if not category:
                continue

            limit = self.products_per_category or len(products_list)
            products_to_seed = products_list[:limit]

            for p_data in products_to_seed:
                brand = random.choice(brand_list)

                # Pop nested detail data before creating product
                skincare_data = p_data.pop("skincare", None)
                hair_data     = p_data.pop("hair", None)
                earring_data  = p_data.pop("earring", None)
                stickon_data  = p_data.pop("stickon", None)
                handbag_data  = p_data.pop("handbag", None)

                product, created = Product.objects.get_or_create(
                    name=p_data["name"],
                    defaults={
                        "category": category,
                        "brand": brand,
                        "description": p_data["description"],
                        "short_description": p_data["short_description"],
                        "price": Decimal(p_data["price"]),
                        "compare_at_price": Decimal(p_data["compare_at_price"]) if p_data.get("compare_at_price") else None,
                        "stock": p_data.get("stock", 50),
                        "is_active": True,
                        "is_featured": p_data.get("is_featured", False),
                        "is_bestseller": p_data.get("is_bestseller", False),
                        "is_new_arrival": p_data.get("is_new_arrival", False),
                        "average_rating": round(random.uniform(3.8, 5.0), 2),
                        "total_reviews": random.randint(10, 250),
                        "total_sold": random.randint(20, 500),
                    },
                )

                if created:
                    total_created += 1

                    # Attach images (1 primary + 2 extras)
                    self._attach_image(product, is_primary=True, extra_count=2)

                    # Create category-specific detail record
                    if skincare_data:
                        SkincareProduct.objects.create(product=product, **skincare_data)
                    elif hair_data:
                        HairProduct.objects.create(product=product, **hair_data)
                    elif earring_data:
                        EarringProduct.objects.create(product=product, **earring_data)
                    elif stickon_data:
                        StickonProduct.objects.create(product=product, **stickon_data)
                    elif handbag_data:
                        HandbagProduct.objects.create(product=product, **handbag_data)

                    # Add variants
                    self._create_variants(product, cat_type)

                    symbol = "✚"
                else:
                    symbol = "↺"
                    # Re-attach the nested data keys (they were popped)
                    if skincare_data: p_data["skincare"] = skincare_data
                    if hair_data:     p_data["hair"] = hair_data
                    if earring_data:  p_data["earring"] = earring_data
                    if stickon_data:  p_data["stickon"] = stickon_data
                    if handbag_data:  p_data["handbag"] = handbag_data

                self.stdout.write(f"  {symbol} [{cat_type.upper()}] {product.name}")

        self.stdout.write(self.style.SUCCESS(f"\n  → {total_created} new products created across {len(PRODUCTS_DATA)} categories."))

    def _create_variants(self, product, cat_type):
        """Create realistic variants based on category type."""
        from products.models import ProductVariant

        variants_map = {
            "skincare": [
                ("Size", [("30ml", 0), ("50ml", 500), ("100ml", 900)]),
            ],
            "hair": [
                ("Length", [("14 inch", 0), ("16 inch", 500), ("18 inch", 1000), ("20 inch", 1500), ("22 inch", 2000), ("24 inch", 3000)]),
            ],
            "earrings": [
                ("Finish", [("Gold", 0), ("Silver", 0), ("Rose Gold", 200)]),
            ],
            "stickons": [
                ("Pack Size", [("1 Pack", 0), ("3 Pack", -150), ("5 Pack", -300)]),
            ],
            "handbags": [
                ("Color", [("Black", 0), ("Beige", 0), ("Brown", 0), ("Blush Pink", 300), ("White", 0)]),
            ],
        }

        for variant_group, options in variants_map.get(cat_type, []):
            # Pick a random subset of 2–4 options
            chosen = random.sample(options, min(len(options), random.randint(2, 4)))
            for value, price_mod in chosen:
                ProductVariant.objects.get_or_create(
                    product=product,
                    name=variant_group,
                    value=value,
                    defaults={
                        "price_modifier": Decimal(str(price_mod)),
                        "stock": random.randint(5, 30),
                    },
                )

    # ─── BANNERS ──────────────────────────────────────────────────────────────

    def _seed_banners(self):
        from products.models import Banner
        from django.core.files import File

        self.stdout.write("\n🖼️  Seeding banners...")
        for b in BANNER_DATA:
            banner, created = Banner.objects.get_or_create(
                title=b["title"],
                defaults={"subtitle": b["subtitle"], "order": b["order"], "is_active": True},
            )
            if created:
                img_path = self._pick_image()
                if img_path:
                    try:
                        with open(img_path, "rb") as f:
                            banner.image.save(Path(img_path).name, File(f), save=True)
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  ⚠️  Banner image error: {e}"))
                symbol = "✚"
            else:
                symbol = "↺"
            self.stdout.write(f"  {symbol} {banner.title}")
        self.stdout.write(self.style.SUCCESS(f"  → {len(BANNER_DATA)} banners ready."))

    # ─── FLASH SALE ───────────────────────────────────────────────────────────

    def _seed_flash_sale(self):
        from products.models import FlashSale, Product
        self.stdout.write("\n⚡ Seeding flash sale...")

        now = timezone.now()
        sale, created = FlashSale.objects.get_or_create(
            title=FLASH_SALE_DATA["title"],
            defaults={
                "discount_percentage": FLASH_SALE_DATA["discount_percentage"],
                "start_time": now,
                "end_time": now + timedelta(hours=48),
                "is_active": True,
            },
        )

        # Attach 8 random featured or bestselling products
        flash_products = list(
            Product.objects.filter(is_active=True).filter(
                is_featured=True
            ).order_by("?")[:8]
        )
        if flash_products:
            sale.products.set(flash_products)

        symbol = "✚" if created else "↺"
        self.stdout.write(f"  {symbol} {sale.title} ({len(flash_products)} products attached)")
        self.stdout.write(self.style.SUCCESS("  → Flash sale ready."))

    # ─── COUPONS ──────────────────────────────────────────────────────────────

    def _seed_coupons(self):
        from orders.models import Coupon
        self.stdout.write("\n🎟️  Seeding coupons...")

        now = timezone.now()
        for c in COUPON_DATA:
            coupon, created = Coupon.objects.get_or_create(
                code=c["code"],
                defaults={
                    "description": c["description"],
                    "discount_type": c["discount_type"],
                    "discount_value": Decimal(c["discount_value"]),
                    "minimum_order_amount": Decimal(c["minimum_order_amount"]),
                    "valid_from": now,
                    "valid_until": now + timedelta(days=365),
                    "is_active": True,
                    "usage_limit": 1000,
                },
            )
            symbol = "✚" if created else "↺"
            self.stdout.write(f"  {symbol} {coupon.code} — {coupon.description}")
        self.stdout.write(self.style.SUCCESS(f"  → {len(COUPON_DATA)} coupons ready."))