import ModuleHeading from "@/components/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft } from 'lucide-react';
import StampShape from '@/components/card-template/stamp-shape';
import { Button } from '@/components/ui/button';
import type { CardTemplate } from '@/types';

interface ShowProps {
  cardTemplate: CardTemplate;
}

export default function Show({ cardTemplate }: ShowProps) {
  const getPerkForStamp = (stampNumber: number) => {
    return cardTemplate.perks?.find(p => p.stampNumber === stampNumber);
  };

  const logoUrl = cardTemplate.logo ? `/${cardTemplate.logo}` : null;
  const backgroundImageUrl = cardTemplate.backgroundImage ? `/${cardTemplate.backgroundImage}` : null;

  // Sample customer name - in real app this would come from auth
  const customerName = "Customer Name";
  const totalStamps = 0; // Customer starts with 0 stamps

  return (
    <AppLayout>
      <Head title={`${cardTemplate.heading}`} />
      <ModuleHeading 
        title="Card Template Preview" 
        description="Customer view of the loyalty card"
      />

      {/* Mobile App Style Container */}
      <div className="max-w-md mx-auto mt-6">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/business/card-templates">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Main Phone-like Container */}
        <div className="bg-white rounded-[3rem] p-6 shadow-2xl border-8 border-gray-800 min-h-[800px]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-700 text-sm mb-1">Good afternoon</p>
              <h1 className="text-black text-2xl font-bold">Customer</h1>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {customerName.charAt(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Stamps Section */}
          <div className="border shadow-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-gray-900 text-sm mb-2">
                  <span>Total Stamps Accumulated</span>
                </div>
                <div className="text-black text-4xl font-bold">
                  {totalStamps} <span className="text-gray-500">/ {cardTemplate.stampsNeeded}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(totalStamps / cardTemplate.stampsNeeded) * 100}%` }}
              ></div>
            </div>
          </div>

             {/* The Loyalty Card */}

       <div
                className="rounded-lg  shadow-2xl mb-5 overflow-hidden"
                style={{
                  backgroundColor: cardTemplate.backgroundColor,
                  backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="p-6 backdrop-blur-sm" style={{ backgroundColor: backgroundImageUrl ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                  {/* Logo */}
                  {logoUrl && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-16 w-16 object-cover rounded-full border-3 border-white shadow-xl" 
                      />
                    </div>
                  )}

                  {/* Heading */}
                  <h3
                    className="text-xl font-bold text-center mb-1 tracking-wider"
                    style={{ color: cardTemplate.textColor }}
                  >
                    {cardTemplate.heading}
                  </h3>

                  {/* Subheading */}
                  <p
                    className="text-center text-xs mb-5 opacity-90"
                    style={{ color: cardTemplate.textColor }}
                  >
                    {cardTemplate.subheading}
                  </p>

                  {/* Stamps Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-4"> 
                    {Array.from({ length: cardTemplate.stampsNeeded }).map((_, index) => {
                      const stampNumber = index + 1;
                      const perk = getPerkForStamp(stampNumber);
                      const isFilled = index < totalStamps;
                      
                      return (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10">
                            <StampShape
                              shape={cardTemplate.stampShape}
                              isFilled={isFilled}
                              isReward={!!perk}
                              rewardText={perk?.reward}
                              color={perk ? perk.color : cardTemplate.stampColor}
                              filledColor={cardTemplate.stampFilledColor}
                              emptyColor={cardTemplate.stampEmptyColor}
                              stampImage={cardTemplate.stampImage}
                              details={perk?.details}
                              patternId={`show-stamp-${index}`}
                              sparkleSize={16}
                              rewardTextClassName="text-white font-bold text-[8px] text-center px-1 leading-tight drop-shadow-lg"
                              showTooltip={false}
                            />
                          </div>
                          <span className="text-[9px] font-medium" style={{ color: cardTemplate.textColor }}>
                            {stampNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mechanics */}
                  <div className="bg-white/95 backdrop-blur rounded-lg p-3 mb-3 shadow-lg">
                    <p className="text-[10px] text-gray-800 text-center leading-relaxed">
                      {cardTemplate.mechanics}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-2" style={{ borderColor: cardTemplate.textColor + '40' }}>
                    <p
                      className="text-center text-[9px] opacity-90 font-medium"
                      style={{ color: cardTemplate.textColor }}
                    >
                      {cardTemplate.footer}
                    </p>
                  </div>
                </div>
              </div>
       

         


          {/* Rewards/Perks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-black text-lg font-semibold">REWARDS & PERKS</h2>
            </div>

            {cardTemplate.perks && cardTemplate.perks.length > 0 ? (
              <div className="space-y-3">
                {cardTemplate.perks.map((perk, index) => (
                  <div key={index} className="border rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: perk.color }}
                      >
                        {perk.stampNumber}
                      </div>
                      <div>
                        <p className="text-black font-bold text-sm">{perk.reward}</p>
                        <p className="text-gray-400 text-xs">Unlock at {perk.stampNumber} stamp{perk.stampNumber > 1 ? 's' : ''}</p>
                        {perk.details && (
                          <p className="text-gray-500 text-xs mt-1">{perk.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-2xl p-6 text-center">
                <p className="text-gray-400 text-sm">No rewards configured yet</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
