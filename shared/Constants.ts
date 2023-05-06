export const COOKIE_NAME = 'TaniaArtToken';

export const COMM_TYPE_BASE = 'base';
export const COMM_TYPE_BG = 'bg';

export type MyImage = {
    Title: string;
    Description: string;
    Tags: string;
    URL: string;
    Id: number;
    Priority: number;
    PriorityOther?: number;
};
export type CommissionOption = {
    Display: string;
    Price: string;
    Offer: string;
    ExampleURL: string;
};
export type JWTObject = {
    Token: string;
};
