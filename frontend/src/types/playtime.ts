export type CategoryChipInfo = {
  icon: React.ReactNode;
  label: string;
  color: 'primary' | 'secondary' | 'warning' | 'info' | 'default';
};

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

export type viewModeType = 'todayOrPlaying' | 'playingOrLast7Days';
export type ISeverity = 'success' | 'error' | 'info';
export type SnackbarPrams = {
  message: string, 
  severity: ISeverity
}

export type IUserPlayTime = {
    router: any,
    user: User | null,
    loading: boolean,
    sessions: GameSession[],
    tables: Table[],
    openDialog: boolean,
    editingSession: GameSession | null,
    formData: CreateSessionData,
    menus: MenuItemType[],
    openFoodDialog: boolean,
    openFoodListDialog: boolean,
    selectedSession: GameSession | null,
    foodFormData: { menu_id: number; quantity: number },
    sessionOrders: Order[],
    openInvoiceDialog: boolean,
    invoiceData: InvoiceData,
    snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' },
    viewMode: 'todayOrPlaying' | 'playingOrLast7Days',
    setViewMode: (mode: 'todayOrPlaying' | 'playingOrLast7Days') => void,
    loadUser: () => Promise<void>,
    loadSessions: (mode?: viewModeType) => Promise<void>,
    loadTables: () => Promise<void>,
    loadMenus: () => Promise<void>,
    handleOpenDialog: (session?: GameSession) => void,
    handleCloseDialog: () => void,
    handleSubmit: () => Promise<void>,
    handleDelete: (sessionId: number) => Promise<void>,
    handleStatusChange: (
      session: GameSession,
      newStatus: 'playing' | 'finished' | 'canceled',
    ) => Promise<void>,
    handleOpenFoodDialog: (session: GameSession) => void,
    handleCloseFoodDialog: () => void,
    handleAddFood: () => Promise<void>,
    handleViewFoodList: (session: GameSession) => Promise<void>,
    handleCloseFoodListDialog: () => void,
    getStatusColorLocal: (status: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
    setSnackbar: React.Dispatch<React.SetStateAction<{
      open: boolean
      message: string
      severity: 'success' | 'error' | 'info'
    }>>,
    getCategoryChipLocal: (category: string) => React.ReactElement,
    handleDeleteFood: (orderId: number, sessionId: number) => void,
    handleOpenInvoiceDialog: (session: GameSession) => Promise<void>,
    handleCloseInvoiceDialog: () => void,
    handlePrintInvoice: () => void,
    showSnackbar: (message: string, severity: ISeverity) => void,
    handleRedirectTakeAway: () => void,
    handleRedirectDineIn: () => void,
    setFormData: React.Dispatch<React.SetStateAction<CreateSessionData>>,
    setFoodFormData: React.Dispatch<React.SetStateAction<FoodData>>,
    recalculateFoodTotal: (sessionId: number) => number,
}