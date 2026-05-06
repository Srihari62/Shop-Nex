import * as tf from "@tensorflow/tfjs-node";

import { getUserActivity } from "./fetch-user-activity";
import { preprocessedData } from "../utils/preProcessedData";

const EMBEDDING_DIM = 50;

interface userAction {
  userId: string;
  productId: string;
  actionType: "product_view" | "add_to_cart" | "add_to_wishlist" | "purchase";
}

interface Interaction {
  userId: string;
  productId: string;
  actionType: userAction["actionType"];
}

interface RecommendedProduct {
  productId: string;
  score: number;
}

async function fetchUserActivity(userId: string): Promise<userAction[]> {
  const userActions = await getUserActivity(userId);
  return Array.isArray(userActions)
    ? (userActions as unknown as userAction[])
    : [];
}

export const recommendProducts = async (
  userId: string,
  allProducts: any,
): Promise<string[]> => {
  const userActions: userAction[] = await fetchUserActivity(userId);
  if (userActions.length === 0) {
    return [];
  }
  const processedData = await preprocessedData(userActions, allProducts);

  if (
    !processedData ||
    !processedData.interactions ||
    !processedData.products
  ) {
    return [];
  }

  const { interactions } = processedData as {
    interactions: Interaction[];
  };

  const userMap: Record<string, number> = {};
  const productMap: Record<string, number> = {};
  let userCount = 0;
  let productCount = 0;

  interactions.forEach((interaction) => {
    if (!(interaction.userId in userMap))
      userMap[interaction.userId] = userCount++;

    if (!(interaction.productId in productMap))
      productMap[interaction.productId] = productCount++;
  });

  //define model input layers

  const userInput = tf.input({
    shape: [1],
    dtype: "int32",
  }) as tf.SymbolicTensor;

  const productInput = tf.input({
    shape: [1],
    dtype: "int32",
  }) as tf.SymbolicTensor;

  //create embedding layer(like lookup tables) to learn the relationships between users and products

  const userEmbedding = tf.layers
    .embedding({
      inputDim: userCount,
      outputDim: EMBEDDING_DIM,
    })
    .apply(userInput) as tf.SymbolicTensor;

  const productEmbedding = tf.layers
    .embedding({
      inputDim: productCount,
      outputDim: EMBEDDING_DIM,
    })
    .apply(productInput) as tf.SymbolicTensor;

  //flatten the 2d embeddings into 1d vectors

  const userVector = tf.layers
    .flatten()
    .apply(userEmbedding) as tf.SymbolicTensor;
  const productVector = tf.layers
    .flatten()
    .apply(productEmbedding) as tf.SymbolicTensor;

  //dot product combines user and product vectors
  const merged = tf.layers
    .dot({
      axes: 1,
    })
    .apply([userVector, productVector]) as tf.SymbolicTensor;

  //final layer: outputs probability of interaction

  const output = tf.layers
    .dense({
      units: 1,
      activation: "sigmoid",
    })
    .apply(merged) as tf.SymbolicTensor;

  //create model

  const model = tf.model({
    inputs: [userInput, productInput],
    outputs: output,
  });

  //compile model

  model.compile({
    optimizer: tf.train.adam(),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  //convert user and product interactions into tensors for training

  const userTensor = tf.tensor1d(
    interactions.map((d) => userMap[d.userId] ?? 0),
    "int32",
  );
  const productTensor = tf.tensor1d(
    interactions.map((d) => productMap[d.productId] ?? 0),
    "int32",
  );

  //
  const weightLabels = tf.tensor2d(
    interactions.map((d) => {
      switch (d.actionType) {
        case "purchase":
          return [1.0];
        case "add_to_wishlist":
          return [0.5];
        case "add_to_cart":
          return [0.7];
        case "product_view":
          return [0.125];
        default:
          return [0.0];
      }
    }),
    [interactions.length, 1],
  );

  await model.fit([userTensor, productTensor], weightLabels, {
    epochs: 5,
    batchSize: 32,
  });

  const productTensorAll = tf.tensor1d(Object.values(productMap), "int32");

  const predictions = model.predict([
    tf.tensor1d([userMap[userId] ?? 0], "int32"),
    productTensorAll,
  ]) as tf.Tensor;

  const scores = (await predictions.array()) as number[][];

  //sort and select top 10 rcommnded products based on score

  const recommendations: RecommendedProduct[] = Object.keys(productMap)
    .map((productId, index) => ({
      productId,
      score: scores[index]?.[0] ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return recommendations.map((p) => p.productId);
};
