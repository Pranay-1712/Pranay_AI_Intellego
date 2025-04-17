
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export type ResponseMode = "freeform" | "structured";

interface ResponseModeToggleProps {
  mode: ResponseMode;
  onModeChange: (mode: ResponseMode) => void;
}

export function ResponseModeToggle({ mode, onModeChange }: ResponseModeToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-hogwarts-parchment/60 px-3 py-2 rounded-lg border border-hogwarts-gold/20">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="mode-toggle" className="text-sm font-semibold cursor-pointer">
          Response Mode
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-hogwarts-gold/80" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-64 text-xs">
                Freeform: Natural conversational responses
                <br />
                Structured: Detailed, organized information
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${mode === "freeform" ? "text-hogwarts-green font-semibold" : "text-hogwarts-green/60"}`}>
          Freeform
        </span>
        <Switch
          id="mode-toggle"
          checked={mode === "structured"}
          onCheckedChange={(checked) => onModeChange(checked ? "structured" : "freeform")}
          className="data-[state=checked]:bg-hogwarts-blue data-[state=unchecked]:bg-hogwarts-green"
        />
        <span className={`text-xs ${mode === "structured" ? "text-hogwarts-blue font-semibold" : "text-hogwarts-blue/60"}`}>
          Structured
        </span>
      </div>
    </div>
  );
}
