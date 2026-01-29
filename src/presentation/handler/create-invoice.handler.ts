export class CreateInvoiceHandler {
	async handle(request: Request): Promise<Response> {
		const data = await request.json();
		return Response.json(data);
	}
}
