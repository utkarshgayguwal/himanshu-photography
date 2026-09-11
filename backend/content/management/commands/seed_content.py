from django.core.management.base import BaseCommand

from content.models import (
    AboutContent,
    Achievement,
    PhilosophyValue,
    PortfolioImage,
    Service,
    SiteSettings,
    Stat,
    Testimonial,
)

SERVICES = [
    {
        'slug': 'wedding',
        'title': 'Wedding Photography',
        'subtitle': 'Where Love Becomes Legend',
        'description': 'Your wedding day is the most beautiful story ever told. We capture every whisper, every tear, every dance — weaving them into photographs that will make your heart ache with joy for decades to come.',
        'image_url': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80',
        'includes': ['Full day coverage', 'Two photographers', 'Edited gallery (400+ photos)', 'Online delivery', 'Print-ready files'],
        'tag': 'Most Popular',
        'is_featured': True,
        'order': 1,
    },
    {
        'slug': 'engagement',
        'title': 'Engagement Shoot',
        'subtitle': 'The Beginning of Your Forever',
        'description': "The ring is on, the future is bright — let's capture this electric moment. Relaxed, romantic, and entirely you. Our engagement sessions let you experience our style before the big day.",
        'image_url': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80',
        'includes': ['2-hour session', 'Multiple locations', 'Edited gallery (80+ photos)', 'Online gallery', 'Print-ready files'],
        'tag': 'Fan Favourite',
        'is_featured': False,
        'order': 2,
    },
    {
        'slug': 'pre-wedding',
        'title': 'Pre & Post Wedding',
        'subtitle': 'The Stories Between the Stories',
        'description': 'Before the vows and after the celebration — these are the moments that define your love. Cinematic, editorial, unforgettable. Destination shoots available across India.',
        'image_url': 'https://images.unsplash.com/photo-1583939411023-14783179e581?w=900&q=80',
        'includes': ['Half/full day sessions', 'Multiple outfits', 'Edited gallery (150+ photos)', 'Online & offline delivery', 'Cinematic editing'],
        'tag': '',
        'is_featured': False,
        'order': 3,
    },
    {
        'slug': 'haldi',
        'title': 'Haldi & Mehendi',
        'subtitle': 'Color, Joy & Pure Celebration',
        'description': "The vibrant chaos of turmeric flying through the air, the intricate art of mehendi, laughter that doesn't stop — we live for these joyful rituals and tell their stories with vivid, heartfelt photography.",
        'image_url': 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=900&q=80',
        'includes': ['4-hour coverage', 'One photographer', 'Edited gallery (150+ photos)', 'Online delivery', 'Color-rich editing'],
        'tag': '',
        'is_featured': False,
        'order': 4,
    },
    {
        'slug': 'baby',
        'title': 'Baby Naming & Maternity',
        'subtitle': "Life's Purest Miracles",
        'description': 'Tiny fingers, first smiles, naming ceremonies full of love — these moments grow up faster than you can imagine. We freeze them in time so you can return to them forever.',
        'image_url': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&q=80',
        'includes': ['3-hour session', 'Studio or outdoor', 'Edited gallery (100+ photos)', 'Online gallery', 'Soft, natural editing'],
        'tag': '',
        'is_featured': True,
        'order': 5,
    },
    {
        'slug': 'birthday',
        'title': 'Birthday & Celebrations',
        'subtitle': 'Every Year is a Gift',
        'description': "Whether it's the first birthday or the fiftieth, celebrations deserve to be remembered. We capture the cake smash, the speeches, the dancing — everything that made the day magical.",
        'image_url': 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80',
        'includes': ['3-hour coverage', 'One photographer', 'Edited gallery (100+ photos)', 'Online delivery', 'Quick turnaround'],
        'tag': '',
        'is_featured': False,
        'order': 6,
    },
    {
        'slug': 'candid',
        'title': 'Candid Photography',
        'subtitle': 'Truth in Every Frame',
        'description': "The best moments are the ones that weren't planned. We blend into your celebration and capture real laughter, real tears, real love — photographs that feel like memories, not poses.",
        'image_url': 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=80',
        'includes': ['Available for any event', 'Unobtrusive approach', 'Edited gallery', 'Online delivery', 'Natural light mastery'],
        'tag': '',
        'is_featured': True,
        'order': 7,
    },
    {
        'slug': 'concert',
        'title': 'Concert & Events',
        'subtitle': 'Energy That Never Fades',
        'description': 'Stage lights, roaring crowds, peak moments of pure performance — we specialize in high-energy event photography that captures the electricity of live experiences.',
        'image_url': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&q=80',
        'includes': ['Full event coverage', 'Low-light mastery', 'Edited gallery', 'Quick delivery', 'Commercial license available'],
        'tag': '',
        'is_featured': False,
        'order': 8,
    },
    {
        'slug': 'drone',
        'title': 'Drone Photography',
        'subtitle': 'A Perspective Beyond',
        'description': "Breathtaking aerial shots that give your wedding or event a cinematic grandeur. Sweeping landscapes, venue exteriors, dramatic bird's-eye ceremony shots — a perspective no one else can offer.",
        'image_url': 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=900&q=80',
        'includes': ['FAA/DGCA compliant', 'Licensed drone operator', 'Aerial photos & video', 'Edited delivery', 'Add-on or standalone'],
        'tag': 'Unique',
        'is_featured': False,
        'order': 9,
    },
]

LOCAL_IMAGES = [
    '/images/bride/1702528917220-01.jpeg.jpg',
    '/images/bride/1702529030213-01.jpeg.jpg',
    '/images/bride/1702529147619-01.jpeg.jpg',
    '/images/bride/1702529337636-01.jpeg.jpg',
    '/images/bride/1702529483808-01-01.jpeg.jpg',
    '/images/bride/1702529483808-01.jpeg.jpg',
    '/images/bride/1703092719416-02-01.jpeg.jpg',
    '/images/bride/IMG_20231220_220423-01.jpeg.jpg',
    '/images/bride/IMG_20231221_010345-01.jpeg.jpg',
    '/images/bride/Untitled-1.jpg',
    '/images/bride/Untitled-1.png',
    '/images/bride/Untitled-11.jpg',
    '/images/bride/Untitled-12.jpg',
    '/images/bride/Untitled-12.png',
    '/images/bride/Untitled-13.jpg',
    '/images/bride/Untitled-14.jpg',
]

UNSPLASH_IMAGES = [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&q=80',
    'https://images.unsplash.com/photo-1583939411023-14783179e581?w=800&q=80',
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80',
    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80',
    'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&q=80',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&q=80',
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
]

# Featured subset used today by Home.jsx's GALLERY_IMAGES — same photos, with the
# label/aspect metadata that preview needs, keyed by URL so seeding stays idempotent.
FEATURED_PORTFOLIO_META = {
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80': {'label': 'Wedding', 'aspect': 'tall'},
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80': {'label': 'Candid', 'aspect': 'square'},
    'https://images.unsplash.com/photo-1583939411023-14783179e581?w=800&q=80': {'label': 'Pre-Wedding', 'aspect': 'wide'},
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80': {'label': 'Engagement', 'aspect': 'square'},
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80': {'label': 'Ceremony', 'aspect': 'tall'},
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&q=80': {'label': 'Portrait', 'aspect': 'square'},
}

TESTIMONIALS = [
    {
        'quote': "Himanshu captured moments we didn't even realize were happening. Every photo tells a story we'll cherish forever. He has a magical eye for emotion.",
        'name': 'Priya & Rahul Sharma',
        'role': 'Wedding, Mumbai 2024',
        'order': 1,
    },
    {
        'quote': 'Our engagement shoot felt so natural. He made us completely forget about the camera — and the results were absolutely breathtaking. Like stills from a movie.',
        'name': 'Ananya Kapoor',
        'role': 'Engagement Shoot, Goa 2024',
        'order': 2,
    },
    {
        'quote': 'The haldi ceremony photos are our absolute favourites. He got every candid moment, every burst of color, every laugh. Pure magic in every frame.',
        'name': 'Meera & Vikram Joshi',
        'role': 'Wedding, Pune 2025',
        'order': 3,
    },
]

STATS = [
    {'number': '500+', 'label': 'Weddings Captured', 'order': 1},
    {'number': '8+', 'label': 'Years of Craft', 'order': 2},
    {'number': '2000+', 'label': 'Happy Families', 'order': 3},
    {'number': '15+', 'label': 'Awards Won', 'order': 4},
]

PHILOSOPHY_VALUES = [
    {
        'icon': 'Heart',
        'title': 'Emotion First',
        'description': 'Technical perfection is meaningless without emotional truth. I always prioritize the feeling of a photograph over its technical precision.',
        'order': 1,
    },
    {
        'icon': 'Camera',
        'title': 'Present Always',
        'description': "The decisive moment can't be recreated. I stay alert, patient, and fully present so nothing meaningful is ever missed.",
        'order': 2,
    },
    {
        'icon': 'Award',
        'title': 'Uncompromising Quality',
        'description': "Every image I deliver is one I'd be proud to frame in my own home. If it doesn't move me, it doesn't make the cut.",
        'order': 3,
    },
]

ACHIEVEMENTS = [
    {'year': '2024', 'description': 'Best Wedding Photographer — Maharashtra Awards', 'order': 1},
    {'year': '2023', 'description': 'Top 50 Wedding Photographers India — WeddingWire', 'order': 2},
    {'year': '2022', 'description': "Featured in Vogue India's \"Rising Creatives\"", 'order': 3},
    {'year': '2021', 'description': 'Gold Award — Asia Pacific Wedding Photography', 'order': 4},
    {'year': '2020', 'description': 'Official Fujifilm Brand Ambassador', 'order': 5},
]

ABOUT_CONTENT = {
    'hero_bio': "I'm Himanshu Gayguwal — a photographer from Mumbai who believes every moment deserves to be remembered, and every story deserves to be beautifully told.",
    'story_paragraphs': [
        "It started with a borrowed camera at my cousin's wedding in 2015. I was 20 years old, nervous, and completely in love with the idea that I could stop time with a click. The photographs I took that day were far from perfect — but the emotion in them was real.",
        'That night, watching my family gather around those images, laughing and crying at the same time — I knew this was what I was meant to do. Not just take photographs, but give people a way to return to the moments they love most.',
        'Eight years later, with over 500 weddings and 2,000 families served, the mission remains the same: to be always there to capture your remembering moments. With every shutter click, I pour my whole heart into telling your story with honesty, beauty, and depth.',
    ],
    'pull_quote': "I don't take photos. I preserve feelings.",
    'pull_quote_author': 'Himanshu Gayguwal',
}

SITE_SETTINGS = {
    'phone': '+91 99999 99999',
    'email': 'contact@himanshuphotography.com',
    'address': 'Mumbai, Maharashtra, India',
    'map_embed_url': (
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3755.5957379933047'
        '!2d79.1832055!3d19.7298282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2'
        '!1s0x3bd2c52697c6e943%3A0x606f21804753a985!2sHimanshu%20Photography%2025'
        '!5e0!3m2!1sen!2sin!4v1777316964373!5m2!1sen!2sin'
    ),
    'instagram_url': '',
    'facebook_url': '',
    'footer_tagline': 'Always there to capture your remembering moments.',
    'copyright_text': '© 2026 Himanshu Photography. All rights reserved.',
}


class Command(BaseCommand):
    help = "Seed the database with the site's current content (idempotent)."

    def handle(self, *args, **options):
        for data in SERVICES:
            Service.objects.update_or_create(slug=data['slug'], defaults=data)
        self.stdout.write(f'  services: {len(SERVICES)}')

        order = 1
        featured_count = 0
        max_len = max(len(LOCAL_IMAGES), len(UNSPLASH_IMAGES))
        for i in range(max_len):
            for pool, image_type in ((LOCAL_IMAGES, 'local'), (UNSPLASH_IMAGES, 'unsplash')):
                if i >= len(pool):
                    continue
                url = pool[i]
                meta = FEATURED_PORTFOLIO_META.get(url)
                defaults = {
                    'image_type': image_type,
                    'order': order,
                    'is_featured': meta is not None,
                    'label': meta['label'] if meta else '',
                    'aspect': meta['aspect'] if meta else 'square',
                }
                PortfolioImage.objects.update_or_create(image_url=url, defaults=defaults)
                order += 1
                if meta:
                    featured_count += 1
        self.stdout.write(f'  portfolio images: {order - 1} ({featured_count} featured)')

        for data in TESTIMONIALS:
            Testimonial.objects.update_or_create(name=data['name'], defaults=data)
        self.stdout.write(f'  testimonials: {len(TESTIMONIALS)}')

        for data in STATS:
            Stat.objects.update_or_create(label=data['label'], defaults=data)
        self.stdout.write(f'  stats: {len(STATS)}')

        for data in PHILOSOPHY_VALUES:
            PhilosophyValue.objects.update_or_create(title=data['title'], defaults=data)
        self.stdout.write(f'  philosophy values: {len(PHILOSOPHY_VALUES)}')

        for data in ACHIEVEMENTS:
            Achievement.objects.update_or_create(year=data['year'], defaults=data)
        self.stdout.write(f'  achievements: {len(ACHIEVEMENTS)}')

        about = AboutContent.load()
        for key, value in ABOUT_CONTENT.items():
            setattr(about, key, value)
        about.save()
        self.stdout.write('  about content: 1 (singleton)')

        settings_obj = SiteSettings.load()
        for key, value in SITE_SETTINGS.items():
            setattr(settings_obj, key, value)
        settings_obj.save()
        self.stdout.write('  site settings: 1 (singleton)')

        self.stdout.write(self.style.SUCCESS('Seed complete.'))
