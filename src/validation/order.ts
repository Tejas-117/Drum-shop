import { Address } from '@/types/address';

interface OrderType {
  _id: string,
  
  userId: string,
  address: Address,
  cartId: string, 

  price: number, 
  discount: number,
  shippingCharges: number,
  total: number,

  paymentStatus: string,
};

type OrderWithUserType = OrderType & {
  userId: {
    fullName: string,
    email: string,
    phone: string,
  }
};

export {
  type OrderType,
  type OrderWithUserType,
}
