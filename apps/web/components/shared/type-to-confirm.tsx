"use client"

import type { ClipboardEvent, DragEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const block = (event: ClipboardEvent | DragEvent) => event.preventDefault()

/**
 * "Type X to confirm" field. The phrase can't be selected or copied and the input
 * refuses paste, drag-and-drop and autofill, so it has to be typed by hand.
 */
export function TypeToConfirm({
  id,
  phrase,
  value,
  onChange,
}: {
  id: string
  phrase: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="block">
        Type{" "}
        <span onCopy={block} onCut={block} onDragStart={block} className="font-mono font-semibold select-none">
          {phrase}
        </span>{" "}
        to confirm
      </Label>
      <Input
        id={id}
        name={`confirm-${id}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={block}
        onDrop={block}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        className="font-mono"
      />
    </div>
  )
}
