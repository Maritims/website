interface Entry {
    id: string;
    name: string;
    message: string;
    timestamp: string;
}

interface FetchEntriesResult {
    entries: Entry[];
    totalEntries: number;
    totalPages: number;
    currentPage: number;
    size: number;
}

interface PostEntryRequest {
    name: string;
    message: string;
    altcha: string;
    token: string;
}