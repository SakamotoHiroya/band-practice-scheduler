"use client"

import { useState, useEffect } from "react"
import { ScheduleHeader } from "@/components/schedule-header"
import { ScheduleGrid } from "@/components/schedule-grid"

interface Member {
  id: string
  name: string
  color: string
}

interface Band {
  id: string
  name: string
  members: Member[]
}

const initialBands: Band[] = [
  {
    id: "1",
    name: "The Rockets",
    members: [
      { id: "1", name: "Yuta (Vo)", color: "bg-blue-500" },
      { id: "2", name: "Kenji (Gt)", color: "bg-purple-500" },
      { id: "3", name: "Mai (Ba)", color: "bg-pink-500" },
      { id: "4", name: "Sora (Dr)", color: "bg-amber-500" },
    ],
  },
  {
    id: "2",
    name: "Sunset Drive",
    members: [
      { id: "1", name: "Yuta (Vo)", color: "bg-blue-500" },
      { id: "5", name: "Haruka (Gt)", color: "bg-teal-500" },
      { id: "6", name: "Ren (Key)", color: "bg-indigo-500" },
    ],
  },
  {
    id: "3",
    name: "Night Owls",
    members: [
      { id: "3", name: "Mai (Ba)", color: "bg-pink-500" },
      { id: "7", name: "Takeshi (Gt)", color: "bg-orange-500" },
      { id: "8", name: "Yuki (Dr)", color: "bg-cyan-500" },
      { id: "9", name: "Mio (Vo)", color: "bg-rose-500" },
    ],
  },
]

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  })
  const [selectedBand, setSelectedBand] = useState(initialBands[0])
  const [selectedMember, setSelectedMember] = useState<Member>(initialBands[0].members[0])
  const [schedules, setSchedules] = useState<Record<string, Record<string, boolean>>>({})
  const [lockedSlots, setLockedSlots] = useState<Set<string>>(new Set())

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    setSelectedMember(selectedBand.members[0])
  }, [selectedBand])

  const toggleSlot = (memberId: string, date: string, time: string) => {
    const key = `${date}-${time}`
    if (lockedSlots.has(key)) {
      return
    }

    setSchedules((prev) => {
      const memberSchedule = prev[memberId] || {}
      return {
        ...prev,
        [memberId]: {
          ...memberSchedule,
          [key]: !memberSchedule[key],
        },
      }
    })
  }

  const toggleLockSlot = (date: string, time: string) => {
    const key = `${date}-${time}`
    setLockedSlots((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const exportToGoogleCalendar = (date: string, time: string) => {
    // TODO: Implement Google Calendar API integration
    console.log("Export to Google Calendar:", { date, time, band: selectedBand.name })
    alert(`練習予定を Google カレンダーに追加します:\n${selectedBand.name}\n${date} ${time}`)
  }

  const importFromGoogleCalendar = (memberId: string) => {
    // TODO: Implement Google Calendar API integration
    console.log("Import from Google Calendar for member:", memberId)
    alert(`${memberId} の Google カレンダーから空き時間をインポートします`)
  }

  const handleCreateBand = () => {
    // TODO: Show modal/form for band creation
    console.log("Create new band")
  }

  const handleAddMember = () => {
    // TODO: Show modal/form for adding member
    console.log("Add new member to", selectedBand.name)
  }

  return (
    <div className="min-h-screen bg-background">
      <ScheduleHeader
        bands={initialBands}
        selectedBand={selectedBand}
        onBandChange={setSelectedBand}
        theme={theme}
        onThemeChange={setTheme}
        onCreateBand={handleCreateBand}
      />
      <main className="container mx-auto px-0 py-4 sm:px-4 sm:py-6">
        <ScheduleGrid
          schedules={schedules}
          selectedBand={selectedBand}
          selectedMember={selectedMember}
          onMemberChange={setSelectedMember}
          onToggleSlot={toggleSlot}
          onAddMember={handleAddMember}
          lockedSlots={lockedSlots}
          onToggleLock={toggleLockSlot}
          onExportToCalendar={exportToGoogleCalendar}
          onImportFromCalendar={importFromGoogleCalendar}
        />
      </main>
    </div>
  )
}
