export type CategoryChipInfo = {
  icon: React.ReactNode
  label: string
  color: 'primary' | 'secondary' | 'warning' | 'info' | 'default'
}

import React from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type {
  User,
  GameSession,
  FoodData,
  CreateSessionData,
  Table,
  MenuItem as MenuItemType,
  Order,
} from '@/types/api'

export type InvoiceData = {
  session: GameSession | null
  orders: Order[]
  totalFoodMoney: number
  totalTableMoney: number
  totalMoney: number
}

export type viewModeType = 'todayOrPlaying' | 'playingOrLast7Days' | 'byMonth'
export type ISeverity = 'success' | 'error' | 'info'
export type SnackbarPrams = {
  message: string
  severity: ISeverity
}

export type IUserPlayTime = {
  router: AppRouterInstance
  user: User | null
  loading: boolean
  sessions: GameSession[]
  tables: Table[]
  openDialog: boolean
  editingSession: GameSession | null
  formData: CreateSessionData
  menus: MenuItemType[]
  openFoodDialog: boolean
  openFoodListDialog: boolean
  selectedSession: GameSession | null
  foodFormData: { menu_id: number; quantity: number }
  sessionOrders: Order[]
  openInvoiceDialog: boolean
  invoiceData: InvoiceData
  snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }
  viewMode: 'todayOrPlaying' | 'playingOrLast7Days' | 'byMonth'
  openModel: boolean
  selectedMonth: number
  selectedYear: number
  setOpenModel: (open: boolean) => void
  setViewMode: (mode: 'todayOrPlaying' | 'playingOrLast7Days' | 'byMonth') => void
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>
  loadUser: () => Promise<void>
  loadSessions: (mode?: viewModeType) => Promise<void>
  loadSessionsByMonth: (month: number, year: number) => Promise<void>
  loadTables: () => Promise<void>
  loadMenus: () => Promise<void>
  handleOpenDialog: (session?: GameSession) => void
  handleCloseDialog: () => void
  handleSubmit: () => Promise<void>
  handleDelete: (sessionId: number) => Promise<void>
  handleStatusChange: (
    session: GameSession,
    newStatus: 'playing' | 'finished' | 'canceled',
  ) => Promise<void>
  handleOpenFoodDialog: (session: GameSession) => void
  handleCloseFoodDialog: () => void
  handleAddFood: () => Promise<void>
  handleViewFoodList: (session: GameSession) => Promise<void>
  handleCloseFoodListDialog: () => void
  getStatusColorLocal: (
    status: string,
  ) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean
      message: string
      severity: 'success' | 'error' | 'info'
    }>
  >
  getCategoryChipLocal: (category: string) => React.ReactElement
  handleDeleteFood: (orderId: number, sessionId: number) => void
  handleOpenInvoiceDialog: (session: GameSession) => Promise<void>
  handleCloseInvoiceDialog: () => void
  handlePrintInvoice: () => void
  showSnackbar: (message: string, severity: ISeverity) => void
  handleRedirectTakeAway: () => void
  handleRedirectDineIn: () => void
  setFormData: React.Dispatch<React.SetStateAction<CreateSessionData>>
  setFoodFormData: React.Dispatch<React.SetStateAction<FoodData>>
  recalculateFoodTotal: (sessionId: number) => Promise<number>
  handleExportExcel: () => void
  handleDownloadReport: (fromDate: string, toDate: string) => Promise<void>
  reportLoading: boolean
  handlePrintReport: (fromDate: string, toDate: string) => Promise<void>
}
