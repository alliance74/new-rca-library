import api from '@/lib/api';

export interface Fine {
    id: string;
    userId: string;
    bookId: string;
    borrowId?: string;
    amount: number;
    reason: string;
    status: 'PAID' | 'UNPAID';
    daysOverdue: number;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    user: {
        id: string;
        name: string;
        email: string;
        level: string;
    };
    book: {
        id: string;
        title: string;
        ISBN: string;
        cover_image?: string;
    };
    borrow?: {
        id: string;
        borrowDate: string;
        dueDate: string;
        returnDate?: string;
    };
}

export interface FinesResponse {
    fines: Fine[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface FineStats {
    totalFines: number;
    unpaidFines: number;
    paidFines: number;
    totalAmount: number;
    unpaidAmount: number;
    paidAmount: number;
    avgDaysOverdue: number;
}

export interface CreateFineData {
    userId: string;
    bookId: string;
    borrowId?: string;
    amount: number;
    reason: string;
    daysOverdue: number;
}

export interface UpdateFineData {
    amount?: number;
    reason?: string;
    status?: 'PAID' | 'UNPAID';
    daysOverdue?: number;
}

export interface QueryFinesParams {
    search?: string;
    status?: 'PAID' | 'UNPAID';
    dateRange?: 'today' | 'week' | 'month' | 'all';
    page?: number;
    limit?: number;
}

class FinesService {
    // Librarian endpoints
    async getAllFines(params?: QueryFinesParams): Promise<FinesResponse> {
        const response = await api.get('/fines', { params });
        return response.data;
    }

    async getFineById(id: string): Promise<Fine> {
        const response = await api.get(`/fines/${id}`);
        return response.data;
    }

    async createFine(data: CreateFineData): Promise<Fine> {
        const response = await api.post('/fines', data);
        return response.data;
    }

    async updateFine(id: string, data: UpdateFineData): Promise<Fine> {
        const response = await api.patch(`/fines/${id}`, data);
        return response.data;
    }

    async deleteFine(id: string): Promise<void> {
        await api.delete(`/fines/${id}`);
    }

    async markFineAsPaid(id: string): Promise<Fine> {
        const response = await api.patch(`/fines/${id}/mark-paid`);
        return response.data;
    }

    async getFineStats(): Promise<FineStats> {
        const response = await api.get('/fines/stats');
        return response.data;
    }

    async exportFines(): Promise<Fine[]> {
        const response = await api.get('/fines/export');
        return response.data;
    }

    // User endpoints
    async getMyFines(params?: QueryFinesParams): Promise<FinesResponse> {
        const response = await api.get('/fines/my-fines', { params });
        return response.data;
    }

    // Search endpoints for creating fines
    async findUserByEmail(email: string) {
        const response = await api.get(`/admin/users/search/email?email=${email}`);
        return response.data;
    }

    async findBookByISBN(isbn: string) {
        const response = await api.get(`/admin/books/search/isbn?isbn=${isbn}`);
        return response.data;
    }
}

export default new FinesService();