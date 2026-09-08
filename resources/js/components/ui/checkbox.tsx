import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  required?: boolean
}


const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        id={id}
        ref={ref}
        aria-checked={checked}
        disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        data-slot="checkbox"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled && onCheckedChange) {
            onCheckedChange(!checked)
          }
        }}
        className={cn(
          "peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center cursor-pointer",
          checked
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background",
          className
        )}
        {...props}
      >
        {checked && (
          <CheckIcon className="size-3.5 stroke-[3]" />
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

