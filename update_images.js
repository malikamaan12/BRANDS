import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ipsFilePath = path.join(__dirname, 'src', 'data', 'ips.js');

const IMAGE_MAP = {
  "IP-001": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  "IP-002": "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80",
  "IP-003": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  "IP-004": "https://images.unsplash.com/photo-1525877432028-599d89553c40?auto=format&fit=crop&w=800&q=80",
  "IP-005": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  "IP-006": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
  "IP-007": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
  "IP-008": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  "IP-009": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
  "IP-010": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
  "IP-011": "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=800&q=80",
  "IP-012": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
  "IP-013": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  "IP-014": "https://images.unsplash.com/photo-1583792074986-5868297f6c88?auto=format&fit=crop&w=800&q=80",
  "IP-015": "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80",
  "IP-016": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
  "IP-017": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
  "IP-018": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
  "IP-019": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  "IP-020": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80",
  "IP-021": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
  "IP-022": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  "IP-023": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  "IP-024": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
  "IP-025": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
  "IP-026": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  "IP-027": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
  "IP-028": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
  "IP-029": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
  "IP-030": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80",
  "IP-031": "https://images.unsplash.com/photo-1558441719-79a6136d8d80?auto=format&fit=crop&w=800&q=80",
  "IP-032": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
  "IP-033": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
  "IP-034": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80",
  "IP-035": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  "IP-036": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
  "IP-037": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
  "IP-038": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  "IP-039": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
  "IP-040": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  "IP-041": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
  "IP-042": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  "IP-043": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
  "IP-044": "https://images.unsplash.com/photo-1525877432028-599d89553c40?auto=format&fit=crop&w=800&q=80"
};

let content = fs.readFileSync(ipsFilePath, 'utf8');

// For each IP, inject the "image" field if not already present
for (const [id, imageUrl] of Object.entries(IMAGE_MAP)) {
  const targetPattern = new RegExp(`("id":\\s*"${id}",\\s*\\n\\s*"title":\\s*"[^"]*",)`);
  if (targetPattern.test(content) && !content.includes(`"image": "${imageUrl}"`)) {
    content = content.replace(targetPattern, `$1\n    "image": "${imageUrl}",`);
  }
}

// Update loadIPs function to merge image from INITIAL_IPS if missing in stored data
const oldLoadIPs = `export function loadIPs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading IPs from localStorage', err);
  }
  return JSON.parse(JSON.stringify(INITIAL_IPS));
}`;

const newLoadIPs = `export function loadIPs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const init = INITIAL_IPS.find((ip) => ip.id === item.id);
          if (init && (!item.image || item.image !== init.image)) {
            return { ...item, image: init.image };
          }
          return item;
        });
      }
    }
  } catch (err) {
    console.warn('Failed reading IPs from localStorage', err);
  }
  return JSON.parse(JSON.stringify(INITIAL_IPS));
}`;

if (content.includes(oldLoadIPs)) {
  content = content.replace(oldLoadIPs, newLoadIPs);
}

fs.writeFileSync(ipsFilePath, content, 'utf8');
console.log('Successfully updated ips.js with event images and auto-merge!');
