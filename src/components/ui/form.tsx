"use client"

import * as React from "react"
import type { UseFormReturn } from "react-hook-form"

interface FormProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>
  onSubmit: (values: T) => Promise<void> | void
  children: React.ReactNode
  className?: string
}

function Form<T extends Record<string, unknown>>({
  form,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={className}
      noValidate
    >
      {children}
    </form>
  )
}

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export { Form, FormField }
