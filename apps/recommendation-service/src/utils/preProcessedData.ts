import { products } from "@prisma/client";

export const preprocessedData = async (
  userActions: any,
  products: products,
) => {
  const interactions: any = [];

  userActions.forEach((action: any) => {
    interactions.push({
      userId: action.userId,
      productId: action.productId,
      actionType: action.actionType,
    });
  });
  return { interactions, products };
};
