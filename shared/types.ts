// Session type declaration
declare global {
  namespace Express {
    interface Request {
      session: {
        userId?: string;
        destroy(callback: (err: any) => void): void;
      };
    }
  }
}

export {};