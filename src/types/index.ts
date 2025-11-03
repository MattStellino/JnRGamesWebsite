export interface ConsoleType {
  id: number
  name: string
  consoles?: Console[]
  createdAt: Date
  updatedAt: Date
}

export interface Console {
  id: number
  name: string
  consoleTypeId: number
  consoleType?: ConsoleType
  items?: Item[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: number
  name: string
  items?: Item[]
  createdAt: Date
  updatedAt: Date
}

export interface Item {
  id: number
  name: string
  description?: string | null
  price: number
  acceptablePrice?: number | null
  goodPrice?: number | null
  consoleOnlyPrice?: number | null
  consoleWithController?: number | null
  completeConsolePrice?: number | null
  imageUrl?: string | null
  consoleId: number
  console?: Console
  categoryId: number
  category?: Category
  createdAt: Date
  updatedAt: Date
}

export interface Admin {
  id: number
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}
