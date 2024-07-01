import { CartProductWithPrice } from '@/types/cart';

export type CartStateType = {
  products: CartProductWithPrice[],
}

// TODO: update the payload type
export type ActionType = {
  type: string,
  payload: any,
}

export const initialState: CartStateType = {
  products: []
};

export const reducer = (
  state = initialState, 
  action: ActionType
): CartStateType => {
  switch (action.type) {
    case 'add_to_cart': {
      console.log('add to cart called');
      return state;
    };

    case 'remove_from_cart': {
      
    };

    default:
      return state;
  }
};
