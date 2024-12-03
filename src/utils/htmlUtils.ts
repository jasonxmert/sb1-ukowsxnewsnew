import * as cheerio from 'cheerio';

const CATEGORY_IMAGES = {
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'
  ],
  finance: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc',
    'https://images.unsplash.com/photo-1554260570-e9689a3418b8',
    'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad',
    'https://images.unsplash.com/photo-1565514020179-026b92b84bb6'
  ],
  politics: [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9',
    'https://images.unsplash.com/photo-1575320181282-9afab399332c',
    'https://images.unsplash.com/photo-1555848962-6e79363ec58f',
    'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9',
    'https://images.unsplash.com/photo-1580893246395-52aead8960dc'
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1603190287605-e6ade32fa852',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0',
    'https://images.unsplash.com/photo-1586899028174-e7098604235b',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    'https://images.unsplash.com/photo-1496337589254-7e19d01cec44',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'
  ],
  health: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
    'https://images.unsplash.com/photo-1535914254981-b5012eebbd15',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118'
  ],
  science: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    'https://images.unsplash.com/photo-1518152006812-edab29b069ac',
    'https://images.unsplash.com/photo-1564325724739-bae0bd08762c',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557',
    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120'
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5',
    'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635'
  ],
  general: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e',
    'https://images.unsplash.com/photo-1557428894-56bcc97113fe',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167',
    'https://images.unsplash.com/photo-1504465039710-0f49c0a47eb7',
    'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1'
  ]
};

// Keep track of used images globally and per category
const usedImages = new Map<string, Set<string>>();
const imageRotationQueue = new Map<string, string[]>();

function initializeImageQueue(category: string) {
  const images = CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES.general;
  imageRotationQueue.set(category, [...images].sort(() => Math.random() - 0.5));
  usedImages.set(category, new Set());
}

function getNextUniqueImage(category: string): string {
  if (!imageRotationQueue.has(category)) {
    initializeImageQueue(category);
  }

  const queue = imageRotationQueue.get(category)!;
  const used = usedImages.get(category)!;

  // If we've used all images, reset the queue
  if (used.size >= CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES].length) {
    used.clear();
    imageRotationQueue.set(category, [...CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES]]
      .sort(() => Math.random() - 0.5));
  }

  // Get next unused image
  let nextImage = queue.find(img => !used.has(img));
  if (!nextImage) {
    used.clear();
    nextImage = queue[0];
  }

  used.add(nextImage);
  return `${nextImage}?w=800&auto=format&fit=crop&q=80`;
}

export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  try {
    const textOnly = html.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/\[\s*\]/g, '')
      .replace(/\.{2,}/g, '.')
      .replace(/^["']|["']$/g, '')
      .trim();

    return cheerio.load(`<div>${textOnly}</div>`)('div').text();
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return html.trim();
  }
}

export function extractImageUrl(content: string, category: string): string {
  try {
    const $ = cheerio.load(content);
    let imageUrl = $('img').first().attr('src');
    
    if (imageUrl?.startsWith('http')) {
      return imageUrl.replace(/^http:/, 'https:');
    }

    return getNextUniqueImage(category);
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return getNextUniqueImage(category);
  }
}