import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import finesService, {
    QueryFinesParams,
    CreateFineData,
    UpdateFineData
} from '@/services/finesService';

// Librarian hooks
export const useFines = (params?: QueryFinesParams) => {
    return useQuery({
        queryKey: ['fines', params],
        queryFn: () => finesService.getAllFines(params),
        staleTime: 30000, // 30 seconds
    });
};

export const useFine = (id: string) => {
    return useQuery({
        queryKey: ['fine', id],
        queryFn: () => finesService.getFineById(id),
        enabled: !!id,
    });
};

export const useFineStats = () => {
    return useQuery({
        queryKey: ['fine-stats'],
        queryFn: () => finesService.getFineStats(),
        staleTime: 60000, // 1 minute
    });
};

export const useCreateFine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFineData) => finesService.createFine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fines'] });
            queryClient.invalidateQueries({ queryKey: ['fine-stats'] });
        },
    });
};

export const useUpdateFine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFineData }) =>
            finesService.updateFine(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['fines'] });
            queryClient.invalidateQueries({ queryKey: ['fine', id] });
            queryClient.invalidateQueries({ queryKey: ['fine-stats'] });
        },
    });
};

export const useDeleteFine = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => finesService.deleteFine(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fines'] });
            queryClient.invalidateQueries({ queryKey: ['fine-stats'] });
        },
    });
};

export const useMarkFineAsPaid = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => finesService.markFineAsPaid(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['fines'] });
            queryClient.invalidateQueries({ queryKey: ['fine', id] });
            queryClient.invalidateQueries({ queryKey: ['fine-stats'] });
        },
    });
};

export const useExportFines = () => {
    return useMutation({
        mutationFn: () => finesService.exportFines(),
        onSuccess: (data) => {
            // Convert to CSV and download
            const csvContent = convertFinesToCSV(data);
            downloadCSV(csvContent, 'fines-export.csv');
        },
    });
};

// User hooks
export const useMyFines = (params?: QueryFinesParams) => {
    return useQuery({
        queryKey: ['my-fines', params],
        queryFn: () => finesService.getMyFines(params),
        staleTime: 30000, // 30 seconds
    });
};

// Helper functions
const convertFinesToCSV = (fines: any[]) => {
    const headers = [
        'ID',
        'User Name',
        'User Email',
        'User Class',
        'Book Title',
        'Book ISBN',
        'Amount (RWF)',
        'Status',
        'Days Overdue',
        'Reason',
        'Created Date',
        'Paid Date',
    ];

    const rows = fines.map(fine => [
        fine.id,
        fine.user.name || '',
        fine.user.email,
        fine.user.level || '',
        fine.book.title,
        fine.book.ISBN || '',
        fine.amount,
        fine.status,
        fine.daysOverdue,
        fine.reason,
        new Date(fine.createdAt).toLocaleDateString(),
        fine.paidAt ? new Date(fine.paidAt).toLocaleDateString() : '',
    ]);

    return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};