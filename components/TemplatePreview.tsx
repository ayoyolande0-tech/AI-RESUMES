// src/components/TemplatePreview.tsx
import { cn } from "@/lib/utils";

type Props = {
  template: "modern" | "minimalistic" | "professional";
  selected: boolean;
  onClick: () => void;
};

const fixedWidths = [
  "w-24", "w-32", "w-20", "w-28", "w-36", "w-16", "w-30", "w-26", "w-34", "w-22"
];

export default function TemplatePreview({ template, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300",
        selected && "scale-105 shadow-2xl z-10"
      )}
    >
      <div
        className={cn(
          "border-4 rounded-2xl overflow-hidden transition-all",
          selected ? "border-orange-500" : "border-transparent hover:border-orange-400"
        )}
      >
        {/* Format A4 fixe – tous identiques */}
        <div className="bg-white shadow-xl w-64 h-96 flex flex-col text-xs font-sans">
          <div className="p-5 text-center border-b">
            <div className="h-4 bg-gray-800 rounded w-24 mx-auto mb-1" />
            <p className="font-bold text-gray-700">AYO AKOA</p>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
            {template === "modern" && (
              <div className="grid grid-cols-4 gap-2 h-full">
                <div className="space-y-3 bg-orange-50 p-3 rounded">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-3 bg-orange-200 rounded" />
                  ))}
                </div>
                <div className="col-span-3 space-y-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 bg-gray-200 rounded ${fixedWidths[i % fixedWidths.length]}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {template === "minimalistic" && (
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <div className="h-6 bg-gray-300 rounded w-32 mx-auto" />
                  <div className="h-3 bg-gray-200 rounded w-24 mx-auto" />
                </div>
                <div className="border-l-4 border-orange-500 pl-4 space-y-3">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className={`h-2 bg-gray-200 rounded ${fixedWidths[i % fixedWidths.length]}`} />
                  ))}
                </div>
              </div>
            )}

            {template === "professional" && (
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-800 rounded w-40" />
                    <div className="h-3 bg-gray-400 rounded w-32" />
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`h-2 bg-gray-200 rounded ${fixedWidths[i % fixedWidths.length]}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div><p className="text-center mt-6 text-lg font-semibold text-gray-900">
        {template === "minimalistic" ? "Minimalistic" : template.charAt(0).toUpperCase() + template.slice(1)}
      </p>
      </div>

      
    </div>
  );
}