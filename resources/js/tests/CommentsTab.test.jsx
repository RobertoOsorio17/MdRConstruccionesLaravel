import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CommentsTab from '../Components/User/Tabs/CommentsTab';

// Mock fetch
global.fetch = jest.fn();

const theme = createTheme();

const mockComments = [
    {
        id: 1,
        body: 'This is a test comment',
        created_at: '2024-01-01T00:00:00Z',
        user: {
            id: 1,
            name: 'Test User',
            avatar: null,
            is_verified: true
        },
        post: {
            id: 1,
            title: 'Test Post',
            slug: 'test-post'
        },
        likes_count: 5,
        dislikes_count: 1,
        replies_count: 2
    },
    {
        id: 2,
        body: 'Another test comment about Laravel',
        created_at: '2024-01-02T00:00:00Z',
        user: {
            id: 2,
            name: 'Another User',
            avatar: null,
            is_verified: false
        },
        post: {
            id: 2,
            title: 'Laravel Post',
            slug: 'laravel-post'
        },
        likes_count: 3,
        dislikes_count: 0,
        replies_count: 1
    }
];

const defaultProps = {
    comments: mockComments,
    currentUser: { id: 1, name: 'Test User' },
    onLikeComment: jest.fn(),
    onDislikeComment: jest.fn(),
    profileUserId: 1,
    isOwnProfile: true
};

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('CommentsTab', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders comments correctly', () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
        expect(screen.getByText('Another test comment about Laravel')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Another User')).toBeInTheDocument();
    });

    test('displays search input', () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        const searchInput = screen.getByPlaceholderText('Buscar comentarios...');
        expect(searchInput).toBeInTheDocument();
    });

    test('filters comments by search term', async () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        const searchInput = screen.getByPlaceholderText('Buscar comentarios...');
        
        fireEvent.change(searchInput, { target: { value: 'Laravel' } });
        
        await waitFor(() => {
            expect(screen.getByText('Another test comment about Laravel')).toBeInTheDocument();
            expect(screen.queryByText('This is a test comment')).not.toBeInTheDocument();
        });
    });

    test('shows empty state when no comments', () => {
        renderWithTheme(<CommentsTab {...defaultProps} comments={[]} />);
        
        expect(screen.getByText('No has hecho comentarios aún')).toBeInTheDocument();
        expect(screen.getByText('Tus comentarios aparecerán aquí cuando participes en las discusiones del blog')).toBeInTheDocument();
    });

    test('shows empty state when search returns no results', async () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        const searchInput = screen.getByPlaceholderText('Buscar comentarios...');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        
        await waitFor(() => {
            expect(screen.getByText('No se encontraron comentarios')).toBeInTheDocument();
            expect(screen.getByText('Intenta con otros términos de búsqueda o revisa la ortografía')).toBeInTheDocument();
        });
    });

    test('displays comment stats correctly', () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        // Check likes count
        expect(screen.getByText('5')).toBeInTheDocument(); // likes for first comment
        expect(screen.getByText('3')).toBeInTheDocument(); // likes for second comment
        
        // Check replies count
        expect(screen.getByText('2')).toBeInTheDocument(); // replies for first comment
        expect(screen.getByText('1')).toBeInTheDocument(); // replies for second comment
    });

    test('shows verified badge for verified users', () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        // First user is verified, should show verified icon
        const verifiedIcons = screen.getAllByTestId('VerifiedOutlinedIcon');
        expect(verifiedIcons).toHaveLength(1);
    });

    test('handles "Ver en post" button click', () => {
        // Mock window.open
        const mockOpen = jest.fn();
        global.window.open = mockOpen;
        
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        const viewButtons = screen.getAllByText('Ver en post');
        fireEvent.click(viewButtons[0]);
        
        expect(mockOpen).toHaveBeenCalledWith('/blog/test-post#comment-1', '_blank');
    });

    test('displays post context correctly', () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        expect(screen.getByText('Test Post')).toBeInTheDocument();
        expect(screen.getByText('Laravel Post')).toBeInTheDocument();
        expect(screen.getAllByText('Comentario en:')).toHaveLength(2);
    });

    test('handles API fetch for pagination', async () => {
        const mockResponse = {
            success: true,
            comments: {
                data: mockComments,
                current_page: 1,
                per_page: 10,
                total: 2,
                last_page: 1
            }
        };
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });
        
        renderWithTheme(<CommentsTab {...defaultProps} comments={[]} />);
        
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/user/comments?page=1&per_page=10&search=');
        });
    });

    test('handles API fetch error gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('API Error'));
        
        renderWithTheme(<CommentsTab {...defaultProps} comments={[]} />);
        
        // Should fall back to client-side filtering
        await waitFor(() => {
            expect(screen.getByText('No has hecho comentarios aún')).toBeInTheDocument();
        });
    });

    test('shows loading state', async () => {
        fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
        
        renderWithTheme(<CommentsTab {...defaultProps} comments={[]} />);
        
        await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    test('handles pagination for other users profile', async () => {
        const mockResponse = {
            success: true,
            comments: {
                data: mockComments,
                current_page: 1,
                per_page: 10,
                total: 2,
                last_page: 1
            }
        };
        
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });
        
        renderWithTheme(
            <CommentsTab 
                {...defaultProps} 
                comments={[]} 
                profileUserId={2} 
                isOwnProfile={false} 
            />
        );
        
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/user/2/comments?page=1&per_page=10&search=');
        });
    });

    test('displays formatted dates correctly', () => {
        renderWithTheme(<CommentsTab {...defaultProps} />);
        
        // Should display formatted dates (exact format depends on locale)
        expect(screen.getByText(/01 ene 2024/)).toBeInTheDocument();
        expect(screen.getByText(/02 ene 2024/)).toBeInTheDocument();
    });
});
