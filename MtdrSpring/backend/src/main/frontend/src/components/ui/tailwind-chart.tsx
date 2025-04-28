"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Colores para las gráficas
export const chartColors = {
  blue: "rgba(59, 130, 246, 0.8)",
  lightBlue: "rgba(96, 165, 250, 0.8)",
  green: "rgba(34, 197, 94, 0.8)",
  yellow: "rgba(234, 179, 8, 0.8)",
  red: "rgba(239, 68, 68, 0.8)",
  purple: "rgba(168, 85, 247, 0.8)",
  gray: "rgba(107, 114, 128, 0.8)",
}

// Componente de barra simple
interface BarProps {
  value: number
  maxValue: number
  label?: string
  color?: string
  className?: string
}

export function Bar({ value, maxValue, label, color = chartColors.blue, className }: BarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }} 
        />
      </div>
    </div>
  )
}

// Componente de gráfico de barras horizontal
interface HorizontalBarChartProps {
  data: {
    name: string
    value: number
    color?: string
  }[]
  className?: string
}

export function HorizontalBarChart({ data, className }: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, index) => (
        <Bar 
          key={index}
          label={item.name}
          value={item.value}
          maxValue={maxValue}
          color={item.color || chartColors.blue}
        />
      ))}
    </div>
  )
}

// Componente de gráfico de barras vertical
interface BarChartProps {
  data: {
    name: string
    values: {
      value: number
      color?: string
      label?: string
    }[]
  }[]
  height?: number
  className?: string
}

export function VerticalBarChart({ data, height = 200, className }: BarChartProps) {
  const allValues = data.flatMap(item => item.values.map(v => v.value))
  const maxValue = Math.max(...allValues, 1)
  
  return (
    <div className={cn("flex items-end justify-around gap-6", className)} style={{ height }}>
      {data.map((item, groupIndex) => (
        <div key={groupIndex} className="flex flex-col items-center">
          <div className="flex items-end h-full gap-1">
            {item.values.map((valueObj, valueIndex) => {
              const percentage = (valueObj.value / maxValue) * 100
              return (
                <div key={valueIndex} className="flex flex-col items-center">
                  <div 
                    className="w-8 rounded-t-md relative group"
                    style={{ 
                      height: `${percentage}%`, 
                      backgroundColor: valueObj.color || chartColors.blue,
                      minHeight: valueObj.value > 0 ? '4px' : '0'
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {valueObj.label || ''}: {valueObj.value}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-2 text-xs text-center">{item.name}</div>
        </div>
      ))}
    </div>
  )
}

// Componente de gráfico circular
interface PieChartProps {
  data: {
    name: string
    value: number
    color?: string
  }[]
  size?: number
  className?: string
}

export function PieChart({ data, size = 200, className }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0
  
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size/2},${size/2})`}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) : 0
            const angle = percentage * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle = endAngle
            
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (endAngle - 90) * Math.PI / 180
            
            const x1 = Math.cos(startRad) * (size/2 - 10)
            const y1 = Math.sin(startRad) * (size/2 - 10)
            const x2 = Math.cos(endRad) * (size/2 - 10)
            const y2 = Math.sin(endRad) * (size/2 - 10)
            
            const largeArcFlag = angle > 180 ? 1 : 0
            
            const pathData = [
              `M 0 0`,
              `L ${x1} ${y1}`,
              `A ${size/2 - 10} ${size/2 - 10} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ')
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || chartColors.blue}
                stroke="white"
                strokeWidth="1"
              />
            )
          })}
          <circle cx="0" cy="0" r={size/5} fill="white" />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold"
          >
            {total}
          </text>
          <text
            x="0"
            y="20"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs text-gray-500"
          >
            Total
          </text>
        </g>
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 mr-1 rounded-sm" 
              style={{ backgroundColor: item.color || chartColors.blue }}
            />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
