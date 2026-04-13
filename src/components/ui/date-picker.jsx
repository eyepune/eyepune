import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * DatePicker - A reusable calendar date picker component.
 *
 * Supports two usage patterns:
 *
 * 1. Controlled (value + onChange):
 *    <DatePicker value={formData.date} onChange={(val) => setFormData({...formData, date: val})} />
 *
 * 2. Uncontrolled with form submission (defaultValue + name):
 *    <DatePicker name="start_date" defaultValue={project?.start_date} />
 *
 * Props:
 * - value: string - Controlled date value (ISO string like "2024-01-15")
 * - onChange: (dateString: string) => void - Callback with date as "YYYY-MM-DD" string
 * - defaultValue: string - Default date for uncontrolled usage
 * - placeholder: string - Placeholder text when no date is selected (default: "Pick a date")
 * - disabled: boolean - Whether the picker is disabled
 * - className: string - Additional CSS classes for the trigger button
 * - fromDate: Date - Minimum selectable date
 * - toDate: Date - Maximum selectable date
 * - name: string - Optional name for hidden input (useful for form submission)
 * - required: boolean - Whether a date is required
 */
function DatePicker({
  value: controlledValue,
  onChange: controlledOnChange,
  defaultValue,
  placeholder = "Pick a date",
  disabled = false,
  className,
  fromDate,
  toDate,
  name,
  required = false,
  ...props
}) {
  // Internal state for uncontrolled usage (defaultValue + name pattern)
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');

  // Determine if this is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Convert string value to Date object for the Calendar
  const selectedDate = React.useMemo(() => {
    if (!currentValue) return undefined;
    if (currentValue instanceof Date) return currentValue;
    const d = new Date(currentValue + 'T00:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  }, [currentValue]);

  const handleSelect = React.useCallback((date) => {
    // Return ISO date string (YYYY-MM-DD) to match native <Input type="date"> behavior
    const dateString = date ? format(date, 'yyyy-MM-dd') : '';

    if (isControlled && controlledOnChange) {
      controlledOnChange(dateString);
    } else {
      setInternalValue(dateString);
    }
  }, [isControlled, controlledOnChange]);

  // The hidden input value - for form submission with name
  const hiddenInputValue = currentValue || '';

  return (
    <div className="flex flex-col">
      {name && (
        <input type="hidden" name={name} value={hiddenInputValue} />
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={disabled}
            fromDate={fromDate}
            toDate={toDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker }
