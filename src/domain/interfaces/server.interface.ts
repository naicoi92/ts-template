export interface IServer {
	start(): Promise<void>;
	stop(): void;
}
