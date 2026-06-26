'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    MarkerLabel,
    MarkerPopup,
} from '@/components/ui/map';
import { Clock, Navigation, Store } from 'lucide-react';

const PARTNER_STORES = [
    {
        id: 1,
        name: 'Izzy Maki by EL Cabron',
        category: 'Restaurant',
        label: 'Food',
        lng: 120.3541,
        lat: 16.0125,
        hours: '11:00 AM - 9:00 PM',
        city: 'Calasiao, Pangasinan',
        fb: 'https://www.facebook.com/Elcabronhouseofchaofan',
    },
    {
        id: 2,
        name: 'Baked by A',
        category: 'Bakery',
        label: 'Bakery',
        lng: 121.0628,
        lat: 14.6542,
        hours: '9:00 AM - 7:00 PM',
        city: 'Quezon City',
        fb: 'https://www.facebook.com/bakedbyAest2020/',
    },
    {
        id: 3,
        name: 'iLavada Laundry Services',
        category: 'Services',
        label: 'Laundry',
        lng: 121.0336,
        lat: 14.6374,
        hours: '7:00 AM - 10:00 PM',
        city: 'Quezon City',
        fb: 'https://www.facebook.com/iLavadaLaundry/',
    },
    {
        id: 4,
        name: 'KaninCo.',
        category: 'Restaurant',
        label: 'Food',
        lng: 121.1165,
        lat: 14.5772,
        hours: '10:00 AM - 9:00 PM',
        city: 'Cainta, Rizal',
        fb: 'https://www.facebook.com/KaninCoCravings',
    },
    {
        id: 5,
        name: 'Tea&Coffee Please',
        category: 'Cafe',
        label: 'Cafe',
        lng: 125.4952,
        lat: 9.7821,
        hours: '8:00 AM - 11:00 PM',
        city: 'Surigao City',
        fb: 'https://www.facebook.com/teaplsph',
    },
    {
        id: 6,
        name: 'The Bad Shot Coffee',
        category: 'Cafe',
        label: 'Cafe',
        lng: 120.9822,
        lat: 14.6214,
        hours: '7:30 AM - 10:00 PM',
        city: 'Manila',
        fb: 'https://www.facebook.com/p/The-Bad-Shot-Coffee-Tomas-Mapua-Branch-100094777910500/',
    },
    {
        id: 7,
        name: 'Tahanan by 6ix Café',
        category: 'Cafe',
        label: 'Cafe',
        lng: 121.0658,
        lat: 16.3155,
        hours: '9:00 AM - 9:00 PM',
        city: 'Dupax Del Norte',
        fb: 'https://www.facebook.com/profile.php?id=61567271805168',
    },
    {
        id: 8,
        name: 'Takumi no Kōhī',
        category: 'Cafe',
        label: 'Cafe',
        lng: 121.6033,
        lat: 13.9554,
        hours: '8:00 AM - 10:00 PM',
        city: 'Lucena City',
        fb: 'https://www.facebook.com/profile.php?id=61587756985754',
    },
    {
        id: 9,
        name: 'Southville Nails & Spa Massage',
        category: 'Wellness',
        label: 'Spa',
        lng: 120.7681,
        lat: 14.3214,
        hours: '1:00 PM - 10:00 PM',
        city: 'Naic, Cavite',
        fb: 'https://www.facebook.com/southvillenailsmassage.ph',
    },
    {
        id: 10,
        name: 'alinDOG Pet Grooming Center',
        category: 'Pet Care',
        label: 'Pets',
        lng: 121.0824,
        lat: 14.6738,
        hours: '9:00 AM - 6:00 PM',
        city: 'Quezon City',
        fb: 'https://www.facebook.com/alindogpetgrooming',
    },
    {
        id: 11,
        name: 'Niji Takoyaki and Snack House',
        category: 'Snacks',
        label: 'Food',
        lng: 121.0619,
        lat: 14.6536,
        hours: '2:00 PM - 10:00 PM',
        city: 'Quezon City',
        fb: 'https://www.facebook.com/nijisnackhouse/',
    },
    {
        id: 12,
        name: 'Brewtiful Day Cafe',
        category: 'Cafe',
        label: 'Cafe',
        lng: 120.8118,
        lat: 14.8436,
        hours: '10:00 AM - 11:00 PM',
        city: 'Malolos, Bulacan',
        fb: 'https://www.facebook.com/aphroditeabulacan',
    },
];

export default function StampBayanMap() {
    return (
        <Card className="relative h-[520px] overflow-hidden border border-slate-200 p-0 shadow-sm">
            {/* Center remains Quezon City, but zoom is pulled back to 7.5 */}
            <Map center={[121.0484, 14.6488]} zoom={9}>
                <MapControls />

                {PARTNER_STORES.map((store) => (
                    <MapMarker
                        key={store.id}
                        longitude={store.lng}
                        latitude={store.lat}
                    >
                        <MarkerContent>
                            <div className="flex size-5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-lg transition-transform hover:scale-110">
                                <Store className="size-2.5 text-white" />
                            </div>
                            <MarkerLabel position="bottom">
                                {store.label}
                            </MarkerLabel>
                        </MarkerContent>

                        <MarkerPopup className="w-56 p-0">
                            <div className="space-y-2 p-3">
                                <div>
                                    <p className="pb-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                        {store.category} • {store.city}
                                    </p>
                                    <h3 className="text-sm leading-tight font-semibold text-foreground">
                                        {store.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock className="size-3.5 text-slate-400" />
                                    <span>{store.hours}</span>
                                </div>

                                <div className="pt-1">
                                    <a
                                        href={store.fb}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full"
                                    >
                                        <Button
                                            size="sm"
                                            className="flex h-8 w-full cursor-pointer items-center gap-1.5 bg-amber-500 text-xs text-white hover:bg-amber-600"
                                        >
                                            <Navigation className="size-3" />
                                            View Branch
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </MarkerPopup>
                    </MapMarker>
                ))}
            </Map>
        </Card>
    );
}
