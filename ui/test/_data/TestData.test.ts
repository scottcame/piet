import { FoodmartMetadata } from "./TestData";

/* eslint-disable @typescript-eslint/no-explicit-any */

test('loading of foodmart metadata', async () => {
  return FoodmartMetadata.getInstance().getMetadata().then((metadata): any => {
    expect(metadata).toBeTruthy();
    expect(metadata.name).toBe("FoodMart");
  });
});
