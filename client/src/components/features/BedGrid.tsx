import React from 'react';

interface Bed {
    id: number;
    row: number;
    col: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
    type: 'REGULAR' | 'ICU';
}

interface BedGridProps {
    rowCount: number;
    colCount: number;
    beds: Bed[];
    onBedClick: (bed: Bed) => void;
    selectedBedId?: number | null;
    riskBeds?: Set<number>;
    recommendedBedId?: number | null;
    remoteLockedBeds?: Set<number>;
    onHover?: (bedId: number) => void;
    onLeave?: (bedId: number) => void;
}

const BedGrid: React.FC<BedGridProps> = ({ rowCount, colCount, beds, onBedClick, selectedBedId, riskBeds, recommendedBedId, remoteLockedBeds, onHover, onLeave }) => {
    const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(null));
    beds.forEach(bed => {
        if (bed.row < rowCount && bed.col < colCount) {
            grid[bed.row][bed.col] = bed;
        }
    });

    const getBedStyle = (bed: Bed | null) => {
        if (!bed) return 'bg-white/5 border-white/5 opacity-30 cursor-not-allowed';

        const baseStyle = 'transition-all duration-500 border shadow-sm hover:scale-105 cursor-pointer relative overflow-hidden backdrop-blur-sm';
        const selectedStyle = selectedBedId === bed.id ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110 z-10 shadow-xl shadow-emerald-500/20' : '';

        // Ghost Locking: Remote User Hover
        if (remoteLockedBeds?.has(bed.id)) {
            return `${baseStyle} bg-yellow-400/20 border-yellow-400 text-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.3)] 
             before:content-[''] before:absolute before:inset-0 
             before:bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(250,204,21,0.1)_5px,rgba(250,204,21,0.1)_10px)]`;
        }

        // Smart Slot Recommendation
        if (recommendedBedId === bed.id) {
            return `${baseStyle} ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent scale-110 z-10 bg-amber-400/20 border-amber-400 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.4)]`;
        }

        // Ripple Effect: Risk State
        if (riskBeds?.has(bed.id)) {
            return `${baseStyle} bg-amber-500/40 border-amber-500 text-amber-100 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.4)]`;
        }

        switch (bed.status) {
            case 'AVAILABLE':
                return `${baseStyle} ${selectedStyle} bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-500/30 text-emerald-100`;
            case 'OCCUPIED':
                // Check if infectious (needs Bed interface update or check prop)
                // Assuming bed object might have currentPatient from backend, but interface needs update.
                // For now, rely on status. If we want Red Pulse for Infectious, we need that data.
                // Let's assume the passed 'bed' object has it if the backend sends it.
                const isInfectious = (bed as any).currentPatient?.condition === 'INFECTIOUS';
                if (isInfectious) {
                    return `${baseStyle} bg-red-600/30 border-red-500 text-red-100 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]`;
                }
                return `${baseStyle} bg-rose-500/20 border-rose-400/30 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.2)]`;
            case 'BLOCKED':
                return `${baseStyle} bg-amber-500/10 border-amber-400/20 text-amber-100/50 opacity-60 
          before:content-[''] before:absolute before:inset-0 
          before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.1)_10px,rgba(245,158,11,0.1)_20px)]`;
            default:
                return 'bg-gray-100';
        }
    };

    return (
        <div
            className="grid gap-3 p-8 glass-panel rounded-2xl border border-white/10 shadow-2xl"
            style={{
                gridTemplateColumns: `repeat(${colCount}, minmax(80px, 1fr))`,
            }}
        >
            {grid.map((row, rIndex) => (
                row.map((bed, cIndex) => (
                    <div
                        key={`${rIndex}-${cIndex}`}
                        onClick={() => bed && onBedClick(bed)}
                        onMouseEnter={() => bed && onHover?.(bed.id)}
                        onMouseLeave={() => bed && onLeave?.(bed.id)}
                        className={`
              aspect-square rounded-2xl flex flex-col items-center justify-center p-2
              ${getBedStyle(bed)}
            `}
                    >
                        {bed ? (
                            <>
                                <span className="font-mono text-lg font-bold opacity-90">{String(bed.row).padStart(2, '0')}-{String(bed.col).padStart(2, '0')}</span>
                                <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60 mt-1">{bed.status}</span>
                                {bed.type === 'ICU' && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.6)]" title="ICU Unit" />
                                )}
                                {bed.status === 'AVAILABLE' && (
                                    <div className="absolute bottom-2 w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                                )}
                                {remoteLockedBeds?.has(bed.id) && (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                                        Remote User Viewing...
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-white/10 text-xs">Void</span>
                        )}
                    </div>
                ))
            ))}
        </div>
    );
};

export default BedGrid;
