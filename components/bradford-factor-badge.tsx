import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, AlertCircle, CheckCircle, AlertOctagon } from "lucide-react"
import type { BradfordScore } from "@/lib/bradford-factor"

interface BradfordFactorBadgeProps {
  score: BradfordScore
  showDetails?: boolean
}

export function BradfordFactorBadge({ score, showDetails = false }: BradfordFactorBadgeProps) {
  const getIcon = () => {
    switch (score.level) {
      case "low":
        return <CheckCircle className="h-3 w-3" />
      case "medium":
        return <AlertCircle className="h-3 w-3" />
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      case "critical":
        return <AlertOctagon className="h-3 w-3" />
    }
  }

  const getColorClass = () => {
    switch (score.level) {
      case "low":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
      case "medium":
        return "bg-amber-500/15 text-amber-600 border-amber-500/20"
      case "high":
        return "bg-orange-500/15 text-orange-600 border-orange-500/20"
      case "critical":
        return "bg-rose-500/15 text-rose-600 border-rose-500/20"
    }
  }

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={getColorClass()}>
              {getIcon()}
              <span className="ml-1">BF: {score.score}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-semibold">{score.description}</div>
              <div className="text-xs">
                {score.spells} absence spells • {score.days} days total
              </div>
              <div className="text-xs text-muted-foreground">
                Formula: {score.spells}² × {score.days} = {score.score}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={getColorClass()}>
          {getIcon()}
          <span className="ml-1">Bradford Factor: {score.score}</span>
        </Badge>
      </div>
      <div className="text-sm space-y-1">
        <div className="text-muted-foreground">{score.description}</div>
        <div className="flex gap-4 text-xs">
          <span>Absence spells: {score.spells}</span>
          <span>Total days: {score.days}</span>
        </div>
      </div>
    </div>
  )
}
