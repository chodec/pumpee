// src/components/molecules/RadioGroup.tsx
import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

// Create context for radio group state
type RadioGroupContextType = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextType>({});

export type RadioGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  orientation?: "vertical" | "horizontal";
};

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, orientation = "vertical", ...props }, ref) => {
    // Handle internal state if no external value is provided
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
    
    // Use controlled value if provided, otherwise use internal state
    const selectedValue = value !== undefined ? value : internalValue;
    
    // Handle value changes
    const handleValueChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    };

    return (
      <RadioGroupContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
        <div
          role="radiogroup"
          className={cn(
            orientation === "vertical" ? "flex flex-col space-y-2" : "flex flex-row space-x-4",
            className
          )}
          ref={ref}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export type RadioGroupItemProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange"
> & {
  value: string;
  children: React.ReactNode;
};

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, value, children, ...props }, ref) => {
    const { value: groupValue, onValueChange } = useContext(RadioGroupContext);
    const checked = value === groupValue;
    const itemId = id || `radio-${value}`;
    
    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          className={cn(
            "h-4 w-4 text-primary border-gray-300 focus:ring-primary",
            className
          )}
          id={itemId}
          checked={checked}
          onChange={() => onValueChange?.(value)}
          value={value}
          ref={ref}
          {...props}
        />
        <label htmlFor={itemId} className="text-sm font-medium text-gray-700">
          {children}
        </label>
      </div>
    );
  }
);

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };