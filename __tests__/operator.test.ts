import { makeContract, getPermission } from "../src/material/crossbell";
const mockAdmin = "0x63dA4cf20e0CBAcF23f135dc707c2273180dbd64";

test("character permissions", async () => {
    const mockReadOnlyContract = await makeContract();
    const permissions = await getPermission(
        mockReadOnlyContract,
        38200,
        mockAdmin
    );

    expect(permissions.includes("POST_NOTE")).toBe(true);
});
