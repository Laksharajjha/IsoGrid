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
}

const BedGrid: React.FC<BedGridProps> = ({ rowCount, colCount, beds, onBedClick, selectedBedId }) => {
    // Create a 2D array for easier rendering
    const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(null));
    beds.forEach(bed => {
        if (bed.row < rowCount && bed.col < colCount) {
            grid[bed.row][bed.col] = bed;
        }
    });

    const getBedStyle = (bed: Bed | null) => {
        if (!bed) return 'bg-gray-100 opacity-50 cursor-not-allowed';

        const baseStyle = 'transition-all duration-300 backdrop-blur-md border shadow-sm hover:scale-105 cursor-pointer relative overflow-hidden';
        const selectedStyle = selectedBedId === bed.id ? 'ring-4 ring-blue-400 ring-offset-2 scale-110 z-10' : '';

        switch (bed.status) {
            case 'AVAILABLE':
                return `${baseStyle} ${selectedStyle} bg-emerald-100/80 border-emerald-200 hover:bg-emerald-200 text-emerald-800`;
            case 'OCCUPIED':
                return `${baseStyle} bg-red-100/80 border-red-200 text-red-800 animate-pulse`; // Pulsing Red
            case 'BLOCKED':
                return `${baseStyle} bg-amber-100/80 border-amber-200 text-amber-800 opacity-80 
          before:content-[''] before:absolute before:inset-0 
          before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f59e0b20_10px,#f59e0b20_20px)]`; // Hazard stripes
            default:
                return 'bg-gray-100';
        }
    };

    return (
        <div
            className="grid gap-4 p-6 bg-white/30 backdrop-blur-xl rounded-xl border border-white/50 shadow-xl"
            style={{
                gridTemplateColumns: `repeat(${colCount}, minmax(80px, 1fr))`,
            }}
        >
            {grid.map((row, rIndex) => (
                row.map((bed, cIndex) => (
                    <div
                        key={`${rIndex}-${cIndex}`}
                        onClick={() => bed && bed.status === 'AVAILABLE' && onBedClick(bed)}
                        className={`
              aspect-square rounded-lg flex flex-col items-center justify-center p-2
              ${getBedStyle(bed)}
            `}
                    >
                        {bed ? (
                            <>
                                <span className="font-bold text-lg">{bed.row}-{bed.col}</span>
                                <span className="text-xs uppercase tracking-wider font-semibold opacity-70">{bed.status}</span>
                                {bed.type === 'ICU' && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" title="ICU Bed" />
                                )}
                            </>
                        ) : (
                            <span className="text-gray-300 text-xs">Empty</span>
                        )}
                    </div>
                ))
            ))}
        </div>
    );
};

export default BedGrid;
