import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { getEffectivePrice, getNormalizedPrice, getStoreCoordinates, getDistanceFromLatLonInKm } from '../utils/helpers';

const STAPLE_CONFIG = [
  { name: 'Rice', keywords: ['rice'] },
  { name: 'Flour', keywords: ['flour'] },
  { name: 'Sugar', keywords: ['sugar'] },
  { name: 'Cooking Oil', keywords: ['oil'] },
  { name: 'Powdered Milk', keywords: ['milk', 'powdered'] },
  { name: 'Canned Mackerel', keywords: ['mackerel'] },
  { name: 'Potatoes', keywords: ['potato'] },
  { name: 'Onions', keywords: ['onion'] },
  { name: 'Garlic', keywords: ['garlic'] },
  { name: 'Instant Noodles', keywords: ['noodle', 'maggi'] },
  { name: 'Breakfast Crackers', keywords: ['cracker', 'cabin'] },
  { name: 'Butter', keywords: ['butter'] },
  { name: 'Chicken', keywords: ['chicken'] },
  { name: 'Tea', keywords: ['tea'] },
  { name: 'Toilet Paper', keywords: ['toilet paper', 'tissue'] },
  { name: 'Laundry Soap', keywords: ['soap', 'laundry'] },
];

export default function StapleEssentials() {
  const allDeals = useAppStore(state => state.deals);
  const userLocation = useAppStore(state => state.userLocation);

  const stapleDeals = useMemo(() => {
    const now = new Date();
    const activeDeals = allDeals.filter(d => !d.is_archived && new Date(d.end_date) >= now);

    return STAPLE_CONFIG.map(staple => {
      const matchingDeals = activeDeals.filter(deal => 
        staple.keywords.every(kw => deal.name.toLowerCase().includes(kw))
      );

      // Find the best deal based on normalized price (price per unit) and proximity
      const bestDeal = matchingDeals.length > 0 
        ? matchingDeals.reduce((prev, curr) => {
            const prevNorm = getNormalizedPrice(prev);
            const currNorm = getNormalizedPrice(curr);
            
            // 1. Compare by price per unit if both have it
            if (prevNorm.pricePerKg !== null && currNorm.pricePerKg !== null) {
              if (Math.abs(currNorm.pricePerKg - prevNorm.pricePerKg) > 0.01) {
                return currNorm.pricePerKg < prevNorm.pricePerKg ? curr : prev;
              }
            }
            
            // 2. Otherwise compare by effective price
            const prevPrice = getEffectivePrice(prev);
            const currPrice = getEffectivePrice(curr);
            if (Math.abs(currPrice - prevPrice) > 0.01) {
              return currPrice < prevPrice ? curr : prev;
            }

            // 3. If prices are similar, prioritize proximity
            if (userLocation) {
              const prevCoords = getStoreCoordinates(prev.location || prev.store);
              const currCoords = getStoreCoordinates(curr.location || curr.store);
              
              if (prevCoords && currCoords) {
                const prevDist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, prevCoords.lat, prevCoords.lon);
                const currDist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, currCoords.lat, currCoords.lon);
                return currDist < prevDist ? curr : prev;
              }
            }

            return prev;
          })
        : null;

      return { ...staple, deal: bestDeal };
    }).filter(item => item.deal !== null);
  }, [allDeals, userLocation]);

  if (stapleDeals.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-black text-slate-900 font-display mb-6">Fiji Staple Essentials</h2>
      <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
        {stapleDeals.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col min-w-[200px] w-[200px]"
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={item.deal?.image_url || `https://picsum.photos/seed/${item.name.replace(/\s+/g, '')}/300/300`}
                alt={item.deal?.name || item.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-bold text-sm leading-tight">{item.deal?.name || item.name}</p>
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.deal?.store || 'N/A'}</p>
              <p className="text-lg font-black text-slate-900">${getEffectivePrice(item.deal).toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
