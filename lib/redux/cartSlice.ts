import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  variantId?: string
  variantName?: string
  color?: string
  saved?: boolean
}

type CartState = {
  items: CartItem[]
  cartCount: number
}

const initialState: CartState = {
  items: [],
  cartCount: 0,
}

function calcCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + (item.saved ? 0 : item.quantity), 0)
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
      )
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
      state.cartCount = calcCount(state.items)
    },
    removeItem(state, action: PayloadAction<{ productId: string; variantId?: string }>) {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.variantId === action.payload.variantId
          )
      )
      state.cartCount = calcCount(state.items)
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; variantId?: string; quantity: number }>
    ) {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.variantId === action.payload.variantId
      )
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity)
        if (item.quantity === 0) {
          state.items = state.items.filter(
            (i) =>
              !(
                i.productId === action.payload.productId &&
                i.variantId === action.payload.variantId
              )
          )
        }
      }
      state.cartCount = calcCount(state.items)
    },
    clearCart(state) {
      state.items = []
      state.cartCount = 0
    },
    // Sync from server response
    syncCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
      state.cartCount = calcCount(action.payload)
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, syncCart } = cartSlice.actions
export default cartSlice.reducer
