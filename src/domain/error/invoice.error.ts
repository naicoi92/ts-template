export class InvoiceNotFoundError extends Error {
	constructor(orderId: string) {
		super(`invoice with orderId ${orderId} not found`);
	}
}
export class InvoiceAmountMisMatch extends Error {
	constructor(orderId: string, currentAmount: number, newAmount: number) {
		super(
			`invoice with orderId ${orderId} amount is not match with ${currentAmount} and ${newAmount}`,
		);
	}
}
