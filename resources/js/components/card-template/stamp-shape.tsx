import { Sparkles } from 'lucide-react';
import { useId } from 'react';

import type { StampShapeName } from '@/types';

interface StampShapeProps {
    shape?: StampShapeName | string;
    isFilled: boolean;
    isReward?: boolean;
    rewardText?: string;
    color?: string;
    filledColor?: string;
    emptyColor?: string;
    stampImage?: string | null;
    details?: string;
    patternId?: string;
    className?: string;
    sparkleSize?: number;
    rewardTextClassName?: string;
    showTooltip?: boolean;
}

function assetUrl(path?: string | null): string | null {
    if (!path) {
        return null;
    }

    if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('/')) {
        return path;
    }

    return `/${path}`;
}

export default function StampShape({
    shape = 'circle',
    isFilled,
    isReward = false,
    rewardText,
    color = '#4DB6AC',
    filledColor,
    emptyColor = '#E5E7EB',
    stampImage,
    details,
    patternId = 'stampPattern',
    className = 'drop-shadow-lg transition-all duration-300 hover:scale-110 h-full w-full',
    sparkleSize = 20,
    rewardTextClassName = 'text-white font-bold text-[10px] text-center px-1 leading-tight drop-shadow-lg',
    showTooltip = true,
}: StampShapeProps) {
    const fillColor = isFilled ? (filledColor || color) : emptyColor;
    const strokeColor = isFilled ? '#FFFFFF' : '#D1D5DB';
    const imageUrl = assetUrl(stampImage);
    const autoPatternId = `stamp-pattern-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const resolvedPatternId = patternId === 'stampPattern' ? autoPatternId : patternId;
    const fill = imageUrl && isFilled ? `url(#${resolvedPatternId})` : fillColor;
    const normalizedShape = [
        'circle',
        'star',
        'square',
        'hexagon',
        'heart',
        'diamond',
        'triangle',
        'oval',
    ].includes(shape)
        ? shape
        : 'circle';

    const defs = (
        <defs>
            {imageUrl && (
                <pattern
                    id={resolvedPatternId}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    patternUnits="userSpaceOnUse"
                >
                    <image
                        href={imageUrl}
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        preserveAspectRatio="xMidYMid slice"
                    />
                </pattern>
            )}
        </defs>
    );

    const shapes = {
        circle: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <circle cx="50" cy="50" r="45" fill={fill} stroke={strokeColor} strokeWidth="3" />
            </svg>
        ),
        star: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <path
                    d="M50 5 L55 20 L70 15 L70 30 L85 35 L75 47 L85 59 L70 64 L70 79 L55 74 L50 89 L45 74 L30 79 L30 64 L15 59 L25 47 L15 35 L30 30 L30 15 L45 20 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth="3"
                />
            </svg>
        ),
        square: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <rect x="10" y="10" width="80" height="80" rx="12" fill={fill} stroke={strokeColor} strokeWidth="3" />
            </svg>
        ),
        hexagon: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <path
                    d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth="3"
                />
            </svg>
        ),
        heart: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <path
                    d="M50 88 C24 66 12 51 12 34 C12 20 22 10 36 10 C44 10 50 15 50 22 C50 15 56 10 64 10 C78 10 88 20 88 34 C88 51 76 66 50 88 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        diamond: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <path
                    d="M50 6 L94 50 L50 94 L6 50 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        triangle: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <path
                    d="M50 8 L92 88 L8 88 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        oval: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" className={className}>
                {defs}
                <ellipse cx="50" cy="50" rx="43" ry="32" fill={fill} stroke={strokeColor} strokeWidth="3" />
            </svg>
        ),
    };

    return (
        <div className="group relative h-full w-full">
            {shapes[normalizedShape as StampShapeName]}
            {isReward && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className={rewardTextClassName}
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                        {rewardText}
                    </span>
                </div>
            )}
            {isFilled && !isReward && !imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={sparkleSize} className="animate-pulse text-white" />
                </div>
            )}
            {showTooltip && isReward && details && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="max-w-[200px] whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-center text-xs text-white shadow-xl">
                        <div className="mb-1 font-bold">{rewardText}</div>
                        <div className="text-gray-300">{details}</div>
                        <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-gray-900" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
