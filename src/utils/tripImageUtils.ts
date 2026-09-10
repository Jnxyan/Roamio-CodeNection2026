import { Trip } from '../types';

/**
 * Returns a high-quality destination cover photo for a trip plan.
 */
export function getTripCoverImage(trip: Trip): string {
  if ((trip as any).cover_photo) return (trip as any).cover_photo;
  
  const destStr = (trip.destinations?.join(' ') || trip.title || '').toLowerCase();
  
  if (destStr.includes('kyoto')) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('tokyo') || destStr.includes('japan')) {
    return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('paris') || destStr.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('rome') || destStr.includes('italy') || destStr.includes('florence') || destStr.includes('venice')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('bali') || destStr.includes('indonesia')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('barcelona') || destStr.includes('spain') || destStr.includes('madrid')) {
    return 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('banff') || destStr.includes('canada')) {
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('kuala lumpur') || destStr.includes('malaysia')) {
    return 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('london') || destStr.includes('uk') || destStr.includes('united kingdom')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('new york') || destStr.includes('san francisco') || destStr.includes('usa') || destStr.includes('united states')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('sydney') || destStr.includes('australia')) {
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80';
  }
  if (destStr.includes('singapore')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
}
