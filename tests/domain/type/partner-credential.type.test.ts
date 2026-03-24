import { describe, expect, test } from "bun:test";
import type { PartnerCredential } from "../../../src/domain/type";

describe("PartnerCredential", () => {
    test("should define credential with name and token", () => {
        const cred: PartnerCredential = {
            name: "test-partner",
            token: "test-token-123",
        };

        expect(cred.name).toBe("test-partner");
        expect(cred.token).toBe("test-token-123");
    });
});
