import type { Listing } from './types/api';

export const mockListings: Listing[] = [
  {
    id: 1,
    title: "Canon PowerShot A70 digicam",
    description: "Works great, includes SD card and strap.",
    price: 4500,
    item_condition: "good",
    era: "2000s",
    status: "live",
    category_id: 1,
    category_name: "Cameras",
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    created_at: "2026-10-18T10:00:00Z"
  },
  {
    id: 2,
    title: "Olympus mju point-and-shoot",
    description: "Film camera, clean lens, flash works.",
    price: 3200,
    item_condition: "like new",
    era: "1990s",
    status: "live",
    category_id: 1,
    category_name: "Cameras",
    image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800",
    created_at: "2026-10-18T10:00:00Z"
  },
  {
    id: 3,
    title: "Brown leather belt",
    description: "Solid brass buckle, minor creasing.",
    price: 800,
    item_condition: "good",
    era: "1980s",
    status: "live",
    category_id: 5,
    category_name: "Accessories",
    image_url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800",
    created_at: "2026-10-18T10:00:00Z"
  },
  {
    id: 4,
    title: "Platform heels, size 7",
    description: "Chunky black platforms, some sole wear.",
    price: 1500,
    item_condition: "fair",
    era: "1990s",
    status: "live",
    category_id: 2,
    category_name: "Shoes",
    image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
    created_at: "2026-10-18T10:00:00Z"
  },
  {
    id: 5,
    title: "Leather satchel bag",
    description: "Structured satchel, brass clasp, lined.",
    price: 2800,
    item_condition: "good",
    era: "1970s",
    status: "live",
    category_id: 3,
    category_name: "Bags",
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
    created_at: "2026-10-18T10:00:00Z"
  },
  {
    id: 6,
    title: "Denim jacket, M",
    description: "Faded wash, no tears.",
    price: 1800,
    item_condition: "good",
    era: "1990s",
    status: "live",
    category_id: 4,
    category_name: "Clothing",
    image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=800",
    created_at: "2026-10-18T10:00:00Z"
  }
];

export default mockListings;
